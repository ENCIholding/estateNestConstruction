import { getCookie, getSessionCookieName, verifySessionToken } from "../_lib/auth";

export default async function handler(req: any, res: any) {
  const token = getCookie(req, getSessionCookieName());

  if (!verifySessionToken(token)) {
    return res.status(401).json({ authenticated: false });
  }

  return res.status(200).json({ authenticated: true });
}
