import crypto from "node:crypto";

/**
 * CONFIG
 */
const COOKIE_NAME = "enci_mgmt_session";
const SESSION_HOURS = 8;

/**
 * GET SECRET
 */
function getSecret(): string {
  const secret = process.env.MANAGEMENT_SESSION_SECRET;

  if (!secret) {
    throw new Error("MANAGEMENT_SESSION_SECRET is missing");
  }

  return secret;
}

/**
 * SIGN PAYLOAD
 */
function sign(payload: string): string {
  return crypto
    .createHmac("sha256", getSecret())
    .update(payload)
    .digest("base64url");
}

/**
 * CREATE TOKEN
 */
export function createSessionToken(username: string): string {
  const payload = JSON.stringify({
    u: username,
    exp: Date.now() + SESSION_HOURS * 60 * 60 * 1000,
  });

  const encoded = Buffer.from(payload).toString("base64url");

  return `${encoded}.${sign(payload)}`;
}

/**
 * VERIFY TOKEN
 */
export function verifySessionToken(token?: string | null): boolean {
  try {
    if (!token) return false;

    const parts = token.split(".");
    if (parts.length !== 2) return false;

    const [encodedPayload, signature] = parts;

    const payload = Buffer.from(encodedPayload, "base64url").toString("utf8");

    const expectedSignature = sign(payload);

    if (signature !== expectedSignature) return false;

    const parsed = JSON.parse(payload) as {
      u: string;
      exp: number;
    };

    if (!parsed.exp || parsed.exp < Date.now()) return false;

    return true;
  } catch {
    return false;
  }
}

/**
 * EXTRACT COOKIE
 */
export function getCookie(
  req: { headers?: any } | Request,
  name: string
): string | null {
  let cookieHeader = "";

  // Node (API routes)
  if ("headers" in req && typeof req.headers === "object") {
    cookieHeader =
      req.headers.cookie ||
      req.headers.get?.("cookie") ||
      "";
  }

  if (!cookieHeader) return null;

  const cookies = cookieHeader.split(";");

  for (const cookie of cookies) {
    const [key, ...rest] = cookie.trim().split("=");

    if (key === name) {
      return rest.join("=");
    }
  }

  return null;
}

/**
 * COOKIE NAME
 */
export function getSessionCookieName(): string {
  return COOKIE_NAME;
}

/**
 * BUILD COOKIE
 */
export function buildSessionCookie(token: string): string {
  return [
    `${COOKIE_NAME}=${token}`,
    "Path=/",
    "HttpOnly",
    "Secure",
    "SameSite=Lax",
    `Max-Age=${SESSION_HOURS * 60 * 60}`,
  ].join("; ");
}

/**
 * CLEAR COOKIE
 */
export function clearSessionCookie(): string {
  return [
    `${COOKIE_NAME}=`,
    "Path=/",
    "HttpOnly",
    "Secure",
    "SameSite=Lax",
    "Max-Age=0",
  ].join("; ");
}
