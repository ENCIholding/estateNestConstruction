import {
  getCookie,
  getSessionCookieName,
  readSessionToken,
} from "../_lib/auth.ts";
import { jsonResponse, methodNotAllowed } from "../_lib/http.ts";

function handleGet(request: Request) {
  try {
    const token = getCookie(request, getSessionCookieName());

    const session = readSessionToken(token);

    if (!session) {
      return jsonResponse(
        {
          authenticated: false,
          user: null,
        },
        { status: 401 }
      );
    }

    return jsonResponse(
      {
        authenticated: true,
        user: {
          username: session.username,
          app_role: "Admin",
        },
        redirectTo: "/management/dashboard",
      },
      { status: 200 }
    );
  } catch (error) {
    return jsonResponse(
      {
        authenticated: false,
        user: null,
        message: "Session check failed",
        error: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}

export default {
  fetch(request: Request) {
    if (request.method !== "GET") {
      return methodNotAllowed(["GET"]);
    }

    return handleGet(request);
  },
};
