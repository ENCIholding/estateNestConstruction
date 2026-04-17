import {
  BuildOsStorageError,
  deleteBuildOsRecord,
  getBuildOsRecord,
  getBuildOsStorageMode,
} from "../../../_lib/buildosStore.js";
import { getBuildOsModuleName } from "../../../_lib/buildosModules.js";
import { getAuthenticatedManagementUser } from "../../../_lib/managementSession.js";
import { canAccessBuildOsModule } from "../../../_lib/managementUsers.js";

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

      const record = await getBuildOsRecord(moduleName, recordId);

      if (!record) {
        return res.status(404).json({ message: "Record not found" });
      }

      return res.status(200).json({
        record,
        storageMode: getBuildOsStorageMode(),
      });
    }

    if (req.method === "DELETE") {
      if (!canAccessBuildOsModule(user, moduleName, "write")) {
        return res.status(403).json({ message: "Write access denied" });
      }

      await deleteBuildOsRecord({
        actor: user,
        module: moduleName,
        recordId,
      });

      return res.status(200).json({
        ok: true,
        storageMode: getBuildOsStorageMode(),
      });
    }

    res.setHeader("Allow", "GET,DELETE");
    return res.status(405).json({ message: "Method not allowed" });
  } catch (error) {
    if (error instanceof BuildOsStorageError) {
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
