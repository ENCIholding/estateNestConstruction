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

export function createSessionToken(username: string) {
  const payload = JSON.stringify({
    u: username,
    exp: Date.now() + SESSION_HOURS * 60 * 60 * 1000,
  });

  return `${Buffer.from(payload).toString("base64url")}.${sign(payload)}`;
}

export function verifySessionToken(token?: string | null) {
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

export function getCookie(req: any, name: string) {
  const cookieHeader =
    req?.headers?.get?.("cookie") ||
    req?.headers?.cookie ||
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

export function getSessionCookieName() {
  return COOKIE_NAME;
}

export function buildSessionCookie(token: string) {
  return `${COOKIE_NAME}=${token}; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=${SESSION_HOURS * 60 * 60}`;
}

export function clearSessionCookie() {
  return `${COOKIE_NAME}=; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=0`;
}
