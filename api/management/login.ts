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
        {
          status: 500,
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
    }

    if (username !== validUsername || password !== validPassword) {
      return new Response(
        JSON.stringify({ message: "Invalid credentials" }),
        {
          status: 401,
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
    }

    const token = createSessionToken(username);

    return new Response(
      JSON.stringify({
        ok: true,
        redirectTo:
          process.env.BASE44_EDITOR_URL ||
          process.env.BASE44_PUBLIC_APP_URL ||
          "/",
      }),
      {
        status: 200,
        headers: {
          "Set-Cookie": buildSessionCookie(token),
          "Content-Type": "application/json",
        },
      }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({
        message: "Server error",
        error: error instanceof Error ? error.message : String(error),
      }),
      {
        status: 500,
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
  }
}
