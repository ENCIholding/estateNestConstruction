import type { BuildOsModuleName } from "./managementUsers.js";

type ModuleDescriptor = {
  module: BuildOsModuleName;
  singleton?: boolean;
};

const MODULES: ModuleDescriptor[] = [
  { module: "master-database" },
  { module: "change-orders" },
  { module: "daily-logs" },
  { module: "deficiencies" },
  { module: "client-invoices" },
  { module: "vendor-bills" },
  { module: "documents" },
  { module: "project-participants" },
  { module: "tasks" },
  { module: "presentations" },
  { module: "videos" },
  { module: "client-reports" },
  { module: "tenant-profile", singleton: true },
  { module: "automation-settings", singleton: true },
];

export function getBuildOsModuleName(
  value: unknown
): BuildOsModuleName | null {
  const normalized =
    typeof value === "string"
      ? value
      : Array.isArray(value) && typeof value[0] === "string"
        ? value[0]
        : null;

  if (!normalized) {
    return null;
  }

  return MODULES.find((entry) => entry.module === normalized)?.module || null;
}

export function isSingletonBuildOsModule(module: BuildOsModuleName) {
  return Boolean(MODULES.find((entry) => entry.module === module)?.singleton);
}

export function resolveBuildOsRecordId(
  module: BuildOsModuleName,
  record: Record<string, unknown>,
  explicitRecordId?: unknown
) {
  if (typeof explicitRecordId === "string" && explicitRecordId.trim()) {
    return explicitRecordId.trim();
  }

  if (isSingletonBuildOsModule(module)) {
    return "default";
  }

  if (typeof record.id === "string" && record.id.trim()) {
    return record.id.trim();
  }

  if (module === "project-participants" && typeof record.projectId === "string") {
    return record.projectId.trim();
  }

  return null;
}
