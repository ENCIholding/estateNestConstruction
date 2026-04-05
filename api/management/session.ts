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

function verifySessionToken(token?: string | null) {
  if (!token) return false;

  const [encodedPayload, signature] = token.split(".");
  if (!encodedPayload || !signature) return false;

  const payload = Buffer.from(encodedPayload, "base64url").toString("utf8");
  const expectedSignature = sign(payload);

  if (signature !== expectedSignature) return false;

  const parsed = JSON.parse(payload) as { u: string; exp: number };
  if (!parsed.exp || parsed.exp < Date.now()) return false;

  return true;
}

function getCookie(req: any, name: string) {
  const cookieHeader =
    req?.headers?.cookie ||
    req?.headers?.get?.("cookie") ||
    "";

  const cookies = cookieHeader.split(";").map((c: string) => c.trim());

  for (const cookie of cookies) {
    const [key, ...rest] = cookie.split("=");
    if (key === name) {
      return rest.join("=");
    }
  }

  return null;
}

export default function handler(req: any, res: any) {
  if (req.method !== "GET") {
    res.setHeader("Allow", "GET");
    return res.status(405).json({ message: "Method not allowed" });
  }

  try {
    const token = getCookie(req, COOKIE_NAME);

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
