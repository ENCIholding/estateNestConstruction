import { clearSessionCookie } from "../_lib/auth.ts";
import { jsonResponse, methodNotAllowed } from "../_lib/http.ts";

function handlePost() {
  return jsonResponse(
    {
      ok: true,
      message: "Logged out successfully",
    },
    {
      status: 200,
      headers: {
        "Set-Cookie": clearSessionCookie(),
      },
    }
  );
}

export default {
  fetch(request: Request) {
    if (request.method !== "POST") {
      return methodNotAllowed(["POST"]);
    }

    return handlePost();
  },
};
