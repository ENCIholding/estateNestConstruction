import { buildSessionCookie, createSessionToken } from "../_lib/auth.ts";

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

    const validUsername = process.env.MANAGEMENT_USERNAME;
    const validPassword = process.env.MANAGEMENT_PASSWORD;

    if (!validUsername || !validPassword) {
      return res.status(500).json({
        message: "Management login not configured",
      });
    }

    if (username !== validUsername || password !== validPassword) {
      return res.status(401).json({
        message: "Invalid credentials",
      });
    }

    const token = createSessionToken(username);

    res.setHeader("Set-Cookie", buildSessionCookie(token));

    return res.status(200).json({
      ok: true,
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
