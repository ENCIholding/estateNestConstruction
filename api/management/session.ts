import { getCookie, getSessionCookieName, verifySessionToken } from "../_lib/auth.js";

export default function handler(req: any, res: any) {
  if (req.method !== "GET") {
    res.setHeader("Allow", "GET");
    return res.status(405).json({ message: "Method not allowed" });
  }

  try {
    const token = getCookie(req, getSessionCookieName());

    if (!verifySessionToken(token)) {
      return res.status(401).json({ authenticated: false });
    }

    return res.status(200).json({
      authenticated: true,
      redirectTo:
        process.env.BASE44_EDITOR_URL ||
        process.env.BASE44_PUBLIC_APP_URL ||
        "/",
    });
  } catch (error) {
    return res.status(500).json({
      authenticated: false,
      message: "Session check failed",
      error: error instanceof Error ? error.message : String(error),
    });
  }
}
