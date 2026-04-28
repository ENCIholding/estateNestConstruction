import {
  BuildOsStorageError,
  getBuildOsStorageMode,
  listBuildOsRecords,
  upsertBuildOsRecord,
} from "../../_lib/buildosStore.js";
import { BuildOsValidationError, validateBuildOsRecordInput } from "../../_lib/buildosValidation.js";
import {
  canAccessBuildOsRecordByProject,
  filterBuildOsRecordsByProjectScope,
  sanitizeBuildOsRecordForUser,
  sanitizeBuildOsRecordsForUser,
} from "../../_lib/buildosPermissions.js";
import {
  getBuildOsModuleName,
  resolveBuildOsRecordId,
} from "../../_lib/buildosModules.js";
import { getAuthenticatedManagementUser } from "../../_lib/managementSession.js";
import {
  canAccessBuildOsModule,
  hasManagementPermission,
} from "../../_lib/managementUsers.js";

export default async function handler(req: any, res: any) {
  const moduleName = getBuildOsModuleName(req.query?.module);

  if (!moduleName) {
    return res.status(404).json({ message: "Unknown BuildOS module" });
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

      const records = await listBuildOsRecords<Record<string, unknown>>(moduleName, { includeDeleted });
      const scopedRecords = filterBuildOsRecordsByProjectScope(user, moduleName, records);
      const sanitizedRecords = sanitizeBuildOsRecordsForUser(user, moduleName, scopedRecords);
      return res.status(200).json({
        records: sanitizedRecords,
        storageMode: getBuildOsStorageMode(),
      });
    }

    if (req.method === "POST") {
      if (!canAccessBuildOsModule(user, moduleName, "write")) {
        return res.status(403).json({ message: "Write access denied" });
      }

      const body =
        typeof req.body === "string" ? JSON.parse(req.body) : req.body || {};
      const record =
        body && typeof body.record === "object" && body.record ? body.record : null;

      if (!record) {
        return res.status(400).json({ message: "Record payload is required" });
      }

      const validatedRecord = validateBuildOsRecordInput(moduleName, record);

      if (!canAccessBuildOsRecordByProject(user, moduleName, validatedRecord)) {
        return res.status(403).json({
          message: "You do not have project-level access for this record.",
        });
      }

      const recordId = resolveBuildOsRecordId(moduleName, validatedRecord, body.recordId);

      if (!recordId) {
        return res.status(400).json({
          message: "Record id could not be resolved for this module",
        });
      }

      const saved = await upsertBuildOsRecord({
        actor: user,
        module: moduleName,
        payload: validatedRecord,
        recordId,
      });

      return res.status(200).json({
        record: sanitizeBuildOsRecordForUser(
          user,
          moduleName,
          saved as Record<string, unknown>
        ),
        storageMode: getBuildOsStorageMode(),
      });
    }

    res.setHeader("Allow", "GET,POST");
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
      message: error instanceof Error ? error.message : "BuildOS request failed",
      storageMode: getBuildOsStorageMode(),
    });
  }
}
