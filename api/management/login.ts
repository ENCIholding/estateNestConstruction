import { buildSessionCookie, createSessionToken } from "../_lib/auth";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { username, password } = body;

    const validUsername = process.env.MANAGEMENT_USERNAME;
    const validPassword = process.env.MANAGEMENT_PASSWORD;

    if (!validUsername || !validPassword) {
      return new Response(
        JSON.stringify({ message: "Management login not configured" }),
        { status: 500 }
      );
    }

    if (username !== validUsername || password !== validPassword) {
      return new Response(
        JSON.stringify({ message: "Invalid credentials" }),
        { status: 401 }
      );
    }

    const token = createSessionToken(username);

    const redirectUrl =
  process.env.BASE44_EDITOR_URL ||
  process.env.BASE44_PUBLIC_APP_URL ||
  "/";

return new Response(null, {
  status: 302,
  headers: {
    "Set-Cookie": buildSessionCookie(token),
    "Location": redirectUrl,
  },
});

  } catch (err) {
    return new Response(
      JSON.stringify({ message: "Server error", error: String(err) }),
      { status: 500 }
    );
  }
}
