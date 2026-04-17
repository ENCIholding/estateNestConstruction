import {
  getCookie,
  getSessionCookieName,
  readSessionToken,
} from "./auth.js";
import {
  findManagementUser,
  toSessionUser,
  type ManagementSessionUser,
} from "./managementUsers.js";

export function getAuthenticatedManagementUser(
  req: { headers?: unknown } | Request
): ManagementSessionUser | null {
  const token = getCookie(req, getSessionCookieName());
  const session = readSessionToken(token);

  if (!session) {
    return null;
  }

  const user =
    findManagementUser(session.username) ||
    ({
      displayName: session.displayName,
      role: (session.role as ManagementSessionUser["role"]) || "Admin",
      username: session.username,
    } as const);

  return toSessionUser(user);
}
