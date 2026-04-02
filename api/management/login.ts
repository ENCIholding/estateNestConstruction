import { buildSessionCookie, createSessionToken } from "../_lib/auth";

export default async function handler(req: any, res: any) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  const body = typeof req.body === "string" ? JSON.parse(req.body) : req.body || {};
  const { username, password } = body;

  const validUsername = process.env.MANAGEMENT_USERNAME;
  const validPassword = process.env.MANAGEMENT_PASSWORD;

  if (!validUsername || !validPassword) {
    return res.status(500).json({ message: "Management login is not configured" });
  }

  if (username !== validUsername || password !== validPassword) {
    return res.status(401).json({ message: "Invalid credentials" });
  }

  const token = createSessionToken(username);

  res.setHeader("Set-Cookie", buildSessionCookie(token));
  return res.status(200).json({ ok: true });
}
