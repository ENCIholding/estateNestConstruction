import crypto from "node:crypto";

const COOKIE_NAME = "enci_mgmt_session";
const SESSION_HOURS = 8;

function getSecret() {
  const secret = process.env.MANAGEMENT_SESSION_SECRET;
  if (!secret) {
    throw new Error("MANAGEMENT_SESSION_SECRET is missing");
  }
  return secret;
}

function sign(payload: string) {
  return crypto
    .createHmac("sha256", getSecret())
    .update(payload)
    .digest("base64url");
}

function createSessionToken(username: string) {
  const payload = JSON.stringify({
    u: username,
    exp: Date.now() + SESSION_HOURS * 60 * 60 * 1000,
  });

  return `${Buffer.from(payload).toString("base64url")}.${sign(payload)}`;
}

function buildSessionCookie(token: string) {
  return `${COOKIE_NAME}=${token}; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=${SESSION_HOURS * 60 * 60}`;
}

export default async function handler(req: any, res: any) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ message: "Method not allowed" });
  }

  try {
    const body =
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
