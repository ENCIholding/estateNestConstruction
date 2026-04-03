import { getCookie, getSessionCookieName, verifySessionToken } from "../_lib/auth.js";

export async function GET(request: Request) {
  const cookieHeader = request.headers.get("cookie") || "";
  const token = getCookie({ headers: { cookie: cookieHeader } }, getSessionCookieName());

  if (!verifySessionToken(token)) {
    return new Response(JSON.stringify({ message: "Unauthorized" }), { status: 401 });
  }

  const appId = process.env.BASE44_APP_ID;
  const apiKey = process.env.BASE44_API_KEY;
  const apiRoot = process.env.BASE44_API_ROOT;

  if (!appId || !apiKey || !apiRoot) {
    return new Response(JSON.stringify({ message: "Base44 not configured" }), { status: 500 });
  }

  try {
    const response = await fetch(`${apiRoot}/api/apps/${appId}/entities/Project`, {
      headers: {
        api_key: apiKey,
        "Content-Type": "application/json",
      },
    });

    const data = await response.json();

    return new Response(JSON.stringify(data), {
      status: response.status,
      headers: {
        "Content-Type": "application/json",
      },
    });
  } catch (error) {
    return new Response(
      JSON.stringify({
        message: "Fetch failed",
        error: error instanceof Error ? error.message : String(error),
      }),
      { status: 500 }
    );
  }
}
