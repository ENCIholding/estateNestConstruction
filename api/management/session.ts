import { getCookie, getSessionCookieName, verifySessionToken } from "../_lib/auth";

export async function GET(request: Request) {
  const cookieHeader = request.headers.get("cookie") || "";
  const token = getCookie({ headers: { cookie: cookieHeader } }, getSessionCookieName());

  if (!(await verifySessionToken(token))) {
    return new Response(JSON.stringify({ authenticated: false }), { status: 401 });
  }

  return new Response(
    JSON.stringify({
      authenticated: true,
      redirectTo:
        process.env.BASE44_EDITOR_URL ||
        process.env.BASE44_PUBLIC_APP_URL ||
        "/",
    }),
    { status: 200 }
  );
}
