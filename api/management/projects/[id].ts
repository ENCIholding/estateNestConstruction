import { getCookie, getSessionCookieName, verifySessionToken } from "../../_lib/auth";
import { updateProjectById } from "../../_lib/projects";

type RouteContext = {
  params: {
    id: string;
  };
};

export async function PUT(request: Request, { params }: RouteContext) {
  const cookieHeader = request.headers.get("cookie") || "";
  const token = getCookie({ headers: { cookie: cookieHeader } }, getSessionCookieName());

  if (!verifySessionToken(token)) {
    return new Response(JSON.stringify({ message: "Unauthorized" }), {
      status: 401,
      headers: {
        "Content-Type": "application/json",
      },
    });
  }

  const { id } = params;

  if (!id) {
    return new Response(JSON.stringify({ message: "Project id is required" }), {
      status: 400,
      headers: {
        "Content-Type": "application/json",
      },
    });
  }

  try {
    const body = await request.json();

    const updatedProject = await updateProjectById(id, body);

    if (!updatedProject) {
      return new Response(JSON.stringify({ message: "Project not found" }), {
        status: 404,
        headers: {
          "Content-Type": "application/json",
        },
      });
    }

    return new Response(JSON.stringify(updatedProject), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
      },
    });
  } catch (error) {
    return new Response(
      JSON.stringify({
        message: "Update failed",
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
