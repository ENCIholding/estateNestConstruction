import {
  BuildOsStorageError,
  getBuildOsStorageMode,
  listBuildOsRecords,
  upsertBuildOsRecord,
} from "../../_lib/buildosStore.js";
import {
  getBuildOsModuleName,
  resolveBuildOsRecordId,
} from "../../_lib/buildosModules.js";
import { getAuthenticatedManagementUser } from "../../_lib/managementSession.js";
import { canAccessBuildOsModule } from "../../_lib/managementUsers.js";

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

      const records = await listBuildOsRecords(moduleName);
      return res.status(200).json({
        records,
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

      const recordId = resolveBuildOsRecordId(moduleName, record, body.recordId);

      if (!recordId) {
        return res.status(400).json({
          message: "Record id could not be resolved for this module",
        });
      }

      const saved = await upsertBuildOsRecord({
        actor: user,
        module: moduleName,
        payload: record,
        recordId,
      });

      return res.status(200).json({
        record: saved,
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

    return res.status(500).json({
      message: error instanceof Error ? error.message : "BuildOS request failed",
      storageMode: getBuildOsStorageMode(),
    });
  }
}
