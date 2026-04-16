import {
  getCookie,
  getSessionCookieName,
  readSessionToken,
} from "../_lib/auth.js";

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

    return res.status(200).json({
      authenticated: true,
      user: {
        username: session.username,
        app_role: "Admin",
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
