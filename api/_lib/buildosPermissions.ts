import {
  canAccessAnyLinkedProject,
  canAccessProject,
  hasManagementPermission,
  type BuildOsModuleName,
  type ManagementSessionUser,
} from "./managementUsers.js";

type JsonRecord = Record<string, unknown>;

const RESTRICTED_FIELD_MAP: Partial<Record<BuildOsModuleName, string[]>> = {
  "change-orders": ["internalNotes"],
  "client-reports": ["internalReviewNotes"],
  "master-database": ["restrictedNotes"],
  presentations: ["internalReviewNotes"],
};

function readProjectIds(value: unknown) {
  if (!Array.isArray(value)) {
    return [];
  }

  return value
    .filter((entry): entry is string => typeof entry === "string")
    .map((entry) => entry.trim())
    .filter(Boolean);
}

export function getBuildOsRecordProjectIds(
  module: BuildOsModuleName,
  record: JsonRecord
) {
  if (module === "tenant-profile" || module === "automation-settings") {
    return [];
  }

  if (module === "master-database") {
    return readProjectIds(record.linkedProjectIds);
  }

  const rawProjectId =
    module === "project-participants" ? record.projectId : record.projectId;

  if (typeof rawProjectId !== "string" || !rawProjectId.trim()) {
    return [];
  }

  return [rawProjectId.trim()];
}

export function canAccessBuildOsRecordByProject(
  user: ManagementSessionUser,
  module: BuildOsModuleName,
  record: JsonRecord
) {
  const projectIds = getBuildOsRecordProjectIds(module, record);

  if (!projectIds.length) {
    return true;
  }

  if (module === "master-database") {
    return canAccessAnyLinkedProject(user, projectIds);
  }

  return projectIds.every((projectId) => canAccessProject(user, projectId));
}

export function filterBuildOsRecordsByProjectScope<T extends JsonRecord>(
  user: ManagementSessionUser,
  module: BuildOsModuleName,
  records: T[]
) {
  return records.filter((record) => canAccessBuildOsRecordByProject(user, module, record));
}

export function sanitizeBuildOsRecordForUser<T extends JsonRecord>(
  user: ManagementSessionUser,
  module: BuildOsModuleName,
  record: T
): T {
  if (hasManagementPermission(user, "buildos:restricted-notes:read")) {
    return record;
  }

  const restrictedFields = RESTRICTED_FIELD_MAP[module] || [];
  if (!restrictedFields.length) {
    return record;
  }

  const clone: JsonRecord = { ...record };
  restrictedFields.forEach((field) => {
    if (field in clone) {
      delete clone[field];
    }
  });
  return clone as T;
}

export function sanitizeBuildOsRecordsForUser<T extends JsonRecord>(
  user: ManagementSessionUser,
  module: BuildOsModuleName,
  records: T[]
) {
  return records.map((record) => sanitizeBuildOsRecordForUser(user, module, record));
}
