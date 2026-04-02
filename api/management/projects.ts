import { getCookie, getSessionCookieName, verifySessionToken } from "../_lib/auth";

export async function GET(request: Request) {
  const cookieHeader = request.headers.get("cookie") || "";
  const token = getCookie({ headers: { cookie: cookieHeader } }, getSessionCookieName());

  if (!verifySessionToken(token)) {
    return new Response(JSON.stringify({ message: "Unauthorized" }), { status: 401 });
  }

  const appId = process.env.BASE44_APP_ID;
  const apiKey = process.env.BASE44_API_KEY;
  const apiBase = process.env.BASE44_API_BASE;

  if (!appId || !apiKey || !apiBase) {
    return new Response(JSON.stringify({ message: "Base44 not configured" }), { status: 500 });
  }

  try {
    const response = await fetch(`${apiBase}/api/apps/${appId}/entities/Project`, {
      headers: {
        api_key: apiKey,
        "Content-Type": "application/json",
      },
    });

    const data = await response.json();
    return new Response(JSON.stringify(data), { status: response.status });

  } catch (error) {
    return new Response(JSON.stringify({ message: "Fetch failed", error }), { status: 500 });
  }
}
