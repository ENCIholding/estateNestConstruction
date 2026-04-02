import { getCookie, getSessionCookieName, verifySessionToken } from "../_lib/auth";

export async function GET(request: Request) {
  const cookieHeader = request.headers.get("cookie") || "";
  const token = getCookie({ headers: { cookie: cookieHeader } }, getSessionCookieName());

  if (!verifySessionToken(token)) {
    return new Response(JSON.stringify({ authenticated: false }), { status: 401 });
  }

  return new Response(JSON.stringify({ authenticated: true }), { status: 200 });
}
