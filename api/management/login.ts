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

    return new Response(JSON.stringify({ ok: true }), {
      status: 200,
      headers: {
        "Set-Cookie": buildSessionCookie(token),
        "Content-Type": "application/json",
      },
    });

  } catch (err) {
    return new Response(
      JSON.stringify({ message: "Server error", error: String(err) }),
      { status: 500 }
    );
  }
}
