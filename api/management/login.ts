import type { VercelRequest, VercelResponse } from "@vercel/node";
import { buildSessionCookie, createSessionToken } from "../_lib/auth.js";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ message: "Method not allowed" });
  }

  try {
    const { username, password } =
      typeof req.body === "string" ? JSON.parse(req.body) : req.body || {};

    const validUsername = process.env.MANAGEMENT_USERNAME;
    const validPassword = process.env.MANAGEMENT_PASSWORD;

    if (!validUsername || !validPassword) {
      return res.status(500).json({ message: "Management login not configured" });
    }

    if (username !== validUsername || password !== validPassword) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const token = createSessionToken(username);

    res.setHeader("Set-Cookie", buildSessionCookie(token));

    return res.status(200).json({
      ok: true,
      redirectTo:
        process.env.BASE44_EDITOR_URL ||
        process.env.BASE44_PUBLIC_APP_URL ||
        "/",
    });
  } catch (error) {
    return res.status(500).json({
      message: "Server error",
      error: error instanceof Error ? error.message : String(error),
    });
  }
}
