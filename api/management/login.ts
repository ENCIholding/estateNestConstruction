import { buildSessionCookie, createSessionToken } from "../_lib/auth.ts";
import {
  jsonResponse,
  methodNotAllowed,
  readJsonBody,
} from "../_lib/http.ts";

type LoginBody = {
  username?: string;
  password?: string;
};

async function handlePost(request: Request) {
  try {
    const body = await readJsonBody<LoginBody>(request);

    const { username, password } = body;

    const validUsername = process.env.MANAGEMENT_USERNAME;
    const validPassword = process.env.MANAGEMENT_PASSWORD;

    if (!validUsername || !validPassword) {
      return jsonResponse(
        {
          message: "Management login not configured",
        },
        { status: 500 }
      );
    }

    if (username !== validUsername || password !== validPassword) {
      return jsonResponse(
        {
          message: "Invalid credentials",
        },
        { status: 401 }
      );
    }

    const token = createSessionToken(username);

    return jsonResponse(
      {
        ok: true,
        redirectTo: "/management/dashboard",
      },
      {
        status: 200,
        headers: {
          "Set-Cookie": buildSessionCookie(token),
        },
      }
    );
  } catch (error) {
    return jsonResponse(
      {
        authenticated: false,
        user: null,
        message: "Server error",
        error: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}

export default {
  fetch(request: Request) {
    if (request.method !== "POST") {
      return methodNotAllowed(["POST"]);
    }

    return handlePost(request);
  },
};
