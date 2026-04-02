import { getCookie, getSessionCookieName, verifySessionToken } from "../../_lib/auth";

export async function PUT(request: Request, { params }: any) {
  const cookieHeader = request.headers.get("cookie") || "";
  const token = getCookie({ headers: { cookie: cookieHeader } }, getSessionCookieName());

  if (!verifySessionToken(token)) {
    return new Response(JSON.stringify({ message: "Unauthorized" }), { status: 401 });
  }

  const { id } = params;

  const appId = process.env.BASE44_APP_ID;
  const apiKey = process.env.BASE44_API_KEY;
  const apiBase = process.env.BASE44_API_BASE;

  if (!appId || !apiKey || !apiBase) {
    return new Response(JSON.stringify({ message: "Base44 not configured" }), { status: 500 });
  }

  try {
    const body = await request.json();

    const response = await fetch(`${apiBase}/api/apps/${appId}/entities/Project/${id}`, {
      method: "PUT",
      headers: {
        api_key: apiKey,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });

    const data = await response.json();
    return new Response(JSON.stringify(data), { status: response.status });

  } catch (error) {
    return new Response(JSON.stringify({ message: "Update failed", error }), { status: 500 });
  }
}
