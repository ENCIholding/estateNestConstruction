import {
  getCookie,
  getSessionCookieName,
  readSessionToken,
} from "../_lib/auth.js";
import {
  findManagementUser,
  toSessionUser,
  type ManagementRole,
} from "../_lib/managementUsers.js";

export default function handler(req: any, res: any) {
  if (req.method !== "GET") {
    res.setHeader("Allow", "GET");
    return res.status(405).json({ message: "Method not allowed" });
  }

  res.setHeader("Cache-Control", "no-store");

  try {
    const token = getCookie(req, getSessionCookieName());

    const session = readSessionToken(token);

    if (!session) {
      return res.status(401).json({
        authenticated: false,
        user: null,
      });
    }

    const configuredUser = findManagementUser(session.username);
    const resolvedRole =
      (session.role || configuredUser?.role || "Admin") as ManagementRole;
    const resolvedUser = toSessionUser({
      allowedProjectIds: configuredUser?.allowedProjectIds,
      displayName: session.displayName || configuredUser?.displayName,
      role: resolvedRole,
      username: session.username,
    });

    return res.status(200).json({
      authenticated: true,
      user: {
        ...resolvedUser,
        app_role: resolvedRole,
      },
      redirectTo: "/management/dashboard",
    });
  } catch (error) {
    return res.status(500).json({
      authenticated: false,
      user: null,
      message: "Session check failed",
      error: error instanceof Error ? error.message : String(error),
    });
  }
}
