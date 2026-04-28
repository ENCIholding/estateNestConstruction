import {
  BuildOsStorageError,
  deleteBuildOsRecord,
  getBuildOsRecord,
  getBuildOsStorageMode,
  purgeBuildOsRecord,
  restoreBuildOsRecord,
} from "../../../_lib/buildosStore.js";
import { getBuildOsModuleName } from "../../../_lib/buildosModules.js";
import { getAuthenticatedManagementUser } from "../../../_lib/managementSession.js";
import {
  canAccessBuildOsModule,
  hasManagementPermission,
} from "../../../_lib/managementUsers.js";
import {
  canAccessBuildOsRecordByProject,
  sanitizeBuildOsRecordForUser,
} from "../../../_lib/buildosPermissions.js";
import {
  BuildOsValidationError,
  validateDeletionReason,
} from "../../../_lib/buildosValidation.js";

export default async function handler(req: any, res: any) {
  const moduleName = getBuildOsModuleName(req.query?.module);
  const recordId =
    typeof req.query?.recordId === "string"
      ? req.query.recordId
      : Array.isArray(req.query?.recordId) && typeof req.query.recordId[0] === "string"
        ? req.query.recordId[0]
        : "";

  if (!moduleName || !recordId) {
    return res.status(404).json({ message: "BuildOS record route not found" });
  }

  const user = getAuthenticatedManagementUser(req);

  if (!user) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  res.setHeader("Cache-Control", "no-store");

  try {
    if (req.method === "GET") {
      if (!canAccessBuildOsModule(user, moduleName, "read")) {
        return res.status(403).json({ message: "Read access denied" });
      }

      const includeDeleted =
        req.query?.includeDeleted === "1" ||
        req.query?.includeDeleted === "true" ||
        req.query?.includeDeleted === true;

      if (includeDeleted && !hasManagementPermission(user, "buildos:audit:read")) {
        return res.status(403).json({ message: "Archived record access denied" });
      }

      const record = await getBuildOsRecord<Record<string, unknown>>(moduleName, recordId, { includeDeleted });

      if (!record) {
        return res.status(404).json({ message: "Record not found" });
      }

      if (!canAccessBuildOsRecordByProject(user, moduleName, record)) {
        return res.status(403).json({ message: "Project-level access denied for this record" });
      }

      return res.status(200).json({
        record: sanitizeBuildOsRecordForUser(user, moduleName, record),
        storageMode: getBuildOsStorageMode(),
      });
    }

    if (req.method === "DELETE") {
      if (!canAccessBuildOsModule(user, moduleName, "write")) {
        return res.status(403).json({ message: "Write access denied" });
      }

      const existingRecord = await getBuildOsRecord<Record<string, unknown>>(moduleName, recordId, {
        includeDeleted: true,
      });

      if (!existingRecord) {
        return res.status(404).json({ message: "Record not found" });
      }

      if (!canAccessBuildOsRecordByProject(user, moduleName, existingRecord)) {
        return res.status(403).json({ message: "Project-level access denied for this record" });
      }

      const body =
        typeof req.body === "string" ? JSON.parse(req.body) : req.body || {};
      const reason = validateDeletionReason(body);

      await deleteBuildOsRecord({
        actor: user,
        module: moduleName,
        recordId,
        reason,
      });

      return res.status(200).json({
        ok: true,
        storageMode: getBuildOsStorageMode(),
      });
    }

    if (req.method === "POST") {
      if (!canAccessBuildOsModule(user, moduleName, "write")) {
        return res.status(403).json({ message: "Write access denied" });
      }

      const existingRecord = await getBuildOsRecord<Record<string, unknown>>(moduleName, recordId, {
        includeDeleted: true,
      });

      if (!existingRecord) {
        return res.status(404).json({ message: "Record not found" });
      }

      if (!canAccessBuildOsRecordByProject(user, moduleName, existingRecord)) {
        return res.status(403).json({ message: "Project-level access denied for this record" });
      }

      const body =
        typeof req.body === "string" ? JSON.parse(req.body) : req.body || {};
      const action = typeof body.action === "string" ? body.action.trim().toLowerCase() : "";

      if (action === "restore") {
        await restoreBuildOsRecord({
          actor: user,
          module: moduleName,
          recordId,
        });

        return res.status(200).json({
          ok: true,
          storageMode: getBuildOsStorageMode(),
        });
      }

      if (action === "purge") {
        if (user.role !== "Admin") {
          return res.status(403).json({ message: "Only admins can purge records" });
        }

        await purgeBuildOsRecord({
          actor: user,
          module: moduleName,
          recordId,
        });

        return res.status(200).json({
          ok: true,
          storageMode: getBuildOsStorageMode(),
        });
      }

      return res.status(400).json({ message: "Unsupported record action" });
    }

    res.setHeader("Allow", "GET,DELETE,POST");
    return res.status(405).json({ message: "Method not allowed" });
  } catch (error) {
    if (error instanceof BuildOsStorageError) {
      return res.status(error.statusCode).json({
        message: error.message,
        storageMode: getBuildOsStorageMode(),
      });
    }

    if (error instanceof BuildOsValidationError) {
      return res.status(error.statusCode).json({
        message: error.message,
        storageMode: getBuildOsStorageMode(),
      });
    }

    return res.status(500).json({
      message: error instanceof Error ? error.message : "BuildOS record request failed",
      storageMode: getBuildOsStorageMode(),
    });
  }
}
