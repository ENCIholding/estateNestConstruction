export type ManagementRole =
  | "Admin"
  | "Project Manager"
  | "Accounting"
  | "Staff"
  | "Read Only";

export type BuildOsModuleName =
  | "master-database"
  | "change-orders"
  | "daily-logs"
  | "deficiencies"
  | "client-invoices"
  | "vendor-bills"
  | "documents"
  | "project-participants"
  | "tasks"
  | "presentations"
  | "videos"
  | "client-reports"
  | "tenant-profile"
  | "automation-settings";

export type ManagementPermission =
  | "buildos:audit:read"
  | "buildos:restricted-notes:read"
  | "buildos:tenant-profile:write"
  | "buildos:automation-settings:write"
  | `buildos:${BuildOsModuleName}:read`
  | `buildos:${BuildOsModuleName}:write`
  | `buildos:${BuildOsModuleName}:export`;

export type ManagementUserRecord = {
  allowedProjectIds?: string[];
  displayName?: string;
  password: string;
  role: ManagementRole;
  username: string;
};

export type ManagementSessionUser = {
  displayName?: string;
  allowedProjectIds?: string[];
  permissions: ManagementPermission[];
  role: ManagementRole;
  username: string;
};

const ALL_BUILDOS_MODULES: BuildOsModuleName[] = [
  "master-database",
  "change-orders",
  "daily-logs",
  "deficiencies",
  "client-invoices",
  "vendor-bills",
  "documents",
  "project-participants",
  "tasks",
  "presentations",
  "videos",
  "client-reports",
  "tenant-profile",
  "automation-settings",
];

const ROLE_WRITE_ACCESS: Record<ManagementRole, BuildOsModuleName[]> = {
  Admin: [...ALL_BUILDOS_MODULES],
  "Project Manager": [
    "master-database",
    "change-orders",
    "daily-logs",
    "deficiencies",
    "documents",
    "project-participants",
    "tasks",
    "presentations",
    "videos",
    "client-reports",
    "automation-settings",
  ],
  Accounting: [
    "master-database",
    "change-orders",
    "client-invoices",
    "vendor-bills",
    "documents",
    "client-reports",
  ],
  Staff: ["daily-logs", "deficiencies", "documents", "tasks"],
  "Read Only": [],
};

const ROLE_EXPORT_ACCESS: Record<ManagementRole, BuildOsModuleName[]> = {
  Admin: [...ALL_BUILDOS_MODULES],
  "Project Manager": [
    "change-orders",
    "client-invoices",
    "documents",
    "presentations",
    "vendor-bills",
    "videos",
    "client-reports",
  ],
  Accounting: [
    "client-invoices",
    "documents",
    "vendor-bills",
    "client-reports",
  ],
  Staff: [],
  "Read Only": [],
};

function normalizeRole(value?: string | null): ManagementRole {
  switch ((value || "").trim().toLowerCase()) {
    case "project manager":
    case "project-manager":
    case "pm":
      return "Project Manager";
    case "accounting":
    case "finance":
      return "Accounting";
    case "staff":
      return "Staff";
    case "read only":
    case "readonly":
    case "read-only":
    case "viewer":
      return "Read Only";
    default:
      return "Admin";
  }
}

function parseUsersJson(
  raw: string | undefined
): ManagementUserRecord[] {
  if (!raw?.trim()) {
    return [];
  }

  try {
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) {
      return [];
    }

    const users = parsed
      .map((entry): ManagementUserRecord | null => {
        if (!entry || typeof entry !== "object") {
          return null;
        }

        const candidate = entry as Record<string, unknown>;
        const username =
          typeof candidate.username === "string" ? candidate.username.trim() : "";
        const password =
          typeof candidate.password === "string" ? candidate.password : "";

        if (!username || !password) {
          return null;
        }

        return {
          allowedProjectIds: Array.isArray(candidate.allowedProjectIds)
            ? candidate.allowedProjectIds
                .filter((value): value is string => typeof value === "string")
                .map((value) => value.trim())
                .filter(Boolean)
            : Array.isArray(candidate.projectIds)
              ? candidate.projectIds
                  .filter((value): value is string => typeof value === "string")
                  .map((value) => value.trim())
                  .filter(Boolean)
              : undefined,
          displayName:
            typeof candidate.displayName === "string"
              ? candidate.displayName.trim() || undefined
              : undefined,
          password,
          role: normalizeRole(
            typeof candidate.role === "string" ? candidate.role : undefined
          ),
          username,
        } satisfies ManagementUserRecord;
      })
      .filter((entry): entry is ManagementUserRecord => entry !== null);

    return users;
  } catch {
    return [];
  }
}

function buildFallbackUser(): ManagementUserRecord[] {
  const username = process.env.MANAGEMENT_USERNAME?.trim();
  const password = process.env.MANAGEMENT_PASSWORD;

  if (!username || !password) {
    return [];
  }

  return [
    {
      displayName: "ENCI BuildOS Admin",
      password,
      role: "Admin",
      username,
    },
  ];
}

export function getManagementUsers(): ManagementUserRecord[] {
  const configured = parseUsersJson(process.env.MANAGEMENT_USERS_JSON);
  return configured.length ? configured : buildFallbackUser();
}

export function getPermissionsForRole(
  role: ManagementRole
): ManagementPermission[] {
  const permissions = new Set<ManagementPermission>();

  ALL_BUILDOS_MODULES.forEach((module) => {
    permissions.add(`buildos:${module}:read`);
  });

  ROLE_WRITE_ACCESS[role].forEach((module) => {
    permissions.add(`buildos:${module}:write`);
  });

  ROLE_EXPORT_ACCESS[role].forEach((module) => {
    permissions.add(`buildos:${module}:export`);
  });

  if (role === "Admin") {
    permissions.add("buildos:restricted-notes:read");
    permissions.add("buildos:audit:read");
  }

  if (role === "Admin") {
    permissions.add("buildos:tenant-profile:write");
    permissions.add("buildos:automation-settings:write");
  }

  if (role === "Project Manager") {
    permissions.add("buildos:automation-settings:write");
  }

  return [...permissions];
}

export function toSessionUser(
  user: Pick<ManagementUserRecord, "allowedProjectIds" | "displayName" | "role" | "username">
): ManagementSessionUser {
  return {
    allowedProjectIds:
      Array.isArray(user.allowedProjectIds) && user.allowedProjectIds.length
        ? [...new Set(user.allowedProjectIds.map((value) => value.trim()).filter(Boolean))]
        : undefined,
    displayName: user.displayName,
    permissions: getPermissionsForRole(user.role),
    role: user.role,
    username: user.username,
  };
}

export function findManagementUser(username: string): ManagementUserRecord | null {
  const normalized = username.trim().toLowerCase();
  return (
    getManagementUsers().find(
      (user) => user.username.trim().toLowerCase() === normalized
    ) || null
  );
}

export function authenticateManagementUser(
  username?: string,
  password?: string
): ManagementSessionUser | null {
  if (!username || !password) {
    return null;
  }

  const user = findManagementUser(username);

  if (!user || user.password !== password) {
    return null;
  }

  return toSessionUser(user);
}

export function hasManagementPermission(
  user: Pick<ManagementSessionUser, "permissions"> | null | undefined,
  permission: ManagementPermission
) {
  return Boolean(user?.permissions.includes(permission));
}

export function canAccessBuildOsModule(
  user: Pick<ManagementSessionUser, "permissions"> | null | undefined,
  module: BuildOsModuleName,
  action: "read" | "write" | "export"
) {
  return hasManagementPermission(user, `buildos:${module}:${action}`);
}

export function canAccessProject(
  user: Pick<ManagementSessionUser, "allowedProjectIds" | "role"> | null | undefined,
  projectId: string | null | undefined
) {
  if (!projectId?.trim()) {
    return true;
  }

  if (!user) {
    return false;
  }

  if (user.role === "Admin") {
    return true;
  }

  if (!Array.isArray(user.allowedProjectIds) || user.allowedProjectIds.length === 0) {
    return true;
  }

  return user.allowedProjectIds.includes(projectId.trim());
}

export function canAccessAnyLinkedProject(
  user: Pick<ManagementSessionUser, "allowedProjectIds" | "role"> | null | undefined,
  projectIds: string[]
) {
  const normalized = projectIds.map((value) => value.trim()).filter(Boolean);
  if (!normalized.length) {
    return true;
  }

  if (!user) {
    return false;
  }

  if (user.role === "Admin") {
    return true;
  }

  if (!Array.isArray(user.allowedProjectIds) || user.allowedProjectIds.length === 0) {
    return true;
  }

  return normalized.some((projectId) => user.allowedProjectIds?.includes(projectId));
}
