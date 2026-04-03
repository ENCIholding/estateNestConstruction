const COOKIE_NAME = "enci_mgmt_session";
const SESSION_HOURS = 8;

function getSecret() {
  const secret = process.env.MANAGEMENT_SESSION_SECRET;
  if (!secret) {
    throw new Error("MANAGEMENT_SESSION_SECRET is missing");
  }
  return secret;
}

function toBase64Url(bytes: Uint8Array) {
  let binary = "";
  for (const byte of bytes) {
    binary += String.fromCharCode(byte);
  }

  return btoa(binary)
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/g, "");
}

function fromBase64Url(value: string) {
  const base64 = value
    .replace(/-/g, "+")
    .replace(/_/g, "/")
    .padEnd(Math.ceil(value.length / 4) * 4, "=");

  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);

  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }

  return bytes;
}

function encodePayload(payload: string) {
  return toBase64Url(new TextEncoder().encode(payload));
}

function decodePayload(encodedPayload: string) {
  return new TextDecoder().decode(fromBase64Url(encodedPayload));
}

async function sign(payload: string) {
  const secret = new TextEncoder().encode(getSecret());

  const key = await crypto.subtle.importKey(
    "raw",
    secret,
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );

  const signature = await crypto.subtle.sign(
    "HMAC",
    key,
    new TextEncoder().encode(payload)
  );

  return toBase64Url(new Uint8Array(signature));
}

export async function createSessionToken(username: string) {
  const payload = JSON.stringify({
    u: username,
    exp: Date.now() + SESSION_HOURS * 60 * 60 * 1000,
  });

  const encodedPayload = encodePayload(payload);
  const signature = await sign(payload);

  return `${encodedPayload}.${signature}`;
}

export async function verifySessionToken(token?: string | null) {
  if (!token) return false;

  const [encodedPayload, signature] = token.split(".");
  if (!encodedPayload || !signature) return false;

  const payload = decodePayload(encodedPayload);
  const expectedSignature = await sign(payload);

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
