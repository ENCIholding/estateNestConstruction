import {
  getCookie,
  getSessionCookieName,
  verifySessionToken,
} from "../../_lib/auth.ts";
import {
  getRouteParam,
  jsonResponse,
  methodNotAllowed,
  readJsonBody,
} from "../../_lib/http.ts";
import {
  getProjectById,
  updateProjectById,
  type ManagementProject,
} from "../../_lib/projects.ts";

async function handleGet(request: Request) {
  const id = getRouteParam(request);

  if (!id || typeof id !== "string") {
    return jsonResponse({ message: "Project id is required" }, { status: 400 });
  }

  const token = getCookie(request, getSessionCookieName());

  if (!verifySessionToken(token)) {
    return jsonResponse({ message: "Unauthorized" }, { status: 401 });
  }

  const project = await getProjectById(id);

  if (!project) {
    return jsonResponse({ message: "Project not found" }, { status: 404 });
  }

  return jsonResponse(project, { status: 200 });
}

async function handlePut(request: Request) {
  const id = getRouteParam(request);

  if (!id || typeof id !== "string") {
    return jsonResponse({ message: "Project id is required" }, { status: 400 });
  }

  const token = getCookie(request, getSessionCookieName());

  if (!verifySessionToken(token)) {
    return jsonResponse({ message: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await readJsonBody<Partial<ManagementProject>>(request);
    const updatedProject = await updateProjectById(id, body ?? {});

    if (!updatedProject) {
      return jsonResponse({ message: "Project not found" }, { status: 404 });
    }

    return jsonResponse(updatedProject, { status: 200 });
  } catch (error) {
    return jsonResponse(
      {
        message: "Update failed",
        error: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}

export default {
  fetch(request: Request) {
    if (request.method === "GET") {
      return handleGet(request);
    }

    if (request.method === "PUT") {
      return handlePut(request);
    }

    return methodNotAllowed(["GET", "PUT"]);
  },
};
