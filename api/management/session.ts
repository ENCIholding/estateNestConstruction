import { getCookie, getSessionCookieName, verifySessionToken } from "../_lib/auth";

export async function GET(request: Request) {
  try {
    const cookieHeader = request.headers.get("cookie") || "";
    const token = getCookie(
      { headers: { cookie: cookieHeader } },
      getSessionCookieName()
    );

    const isValid = verifySessionToken(token);

    if (!isValid) {
      return new Response(
        JSON.stringify({ authenticated: false }),
        {
          status: 401,
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
    }

    return new Response(
      JSON.stringify({
        authenticated: true,
        redirectTo:
          process.env.BASE44_EDITOR_URL ||
          process.env.BASE44_PUBLIC_APP_URL ||
          "/",
      }),
      {
        status: 200,
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({
        authenticated: false,
        message: "Session check failed",
        error: error instanceof Error ? error.message : String(error),
      }),
      {
        status: 401,
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
  }
}
