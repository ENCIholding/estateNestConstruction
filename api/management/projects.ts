import {
  getCookie,
  getSessionCookieName,
  verifySessionToken,
} from "../_lib/auth.ts";
import { jsonResponse, methodNotAllowed } from "../_lib/http.ts";
import { getAllProjects } from "../_lib/projects.ts";

async function handleGet(request: Request) {
  const token = getCookie(request, getSessionCookieName());

  if (!verifySessionToken(token)) {
    return jsonResponse({ message: "Unauthorized" }, { status: 401 });
  }

  try {
    const projects = await getAllProjects();
    return jsonResponse(projects, { status: 200 });
  } catch (error) {
    return jsonResponse(
      {
        message: "Fetch failed",
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
