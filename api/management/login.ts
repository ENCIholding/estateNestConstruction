import { buildSessionCookie, createSessionToken } from "../_lib/auth.js";
import { authenticateManagementUser } from "../_lib/managementUsers.js";

type LoginBody = {
  username?: string;
  password?: string;
};

export default async function handler(req: any, res: any) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ message: "Method not allowed" });
  }

  res.setHeader("Cache-Control", "no-store");

  try {
    const body: LoginBody =
      typeof req.body === "string" ? JSON.parse(req.body) : req.body || {};

    const { username, password } = body;

    const authenticatedUser = authenticateManagementUser(username, password);

    if (!process.env.MANAGEMENT_USERS_JSON && !process.env.MANAGEMENT_USERNAME) {
      return res.status(500).json({
        message: "Management login not configured",
      });
    }

    if (!authenticatedUser) {
      return res.status(401).json({
        message: "Invalid credentials",
      });
    }

    const token = createSessionToken(authenticatedUser);

    res.setHeader("Set-Cookie", buildSessionCookie(token));

    return res.status(200).json({
      ok: true,
      role: authenticatedUser.role,
      redirectTo: "/management/dashboard",
    });
  } catch (error) {
    return res.status(500).json({
      authenticated: false,
      user: null,
      message: "Server error",
      error: error instanceof Error ? error.message : String(error),
    });
  }
}
