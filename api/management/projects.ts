import { getCookie, getSessionCookieName, verifySessionToken } from "./_lib/auth.ts"; // Corrected path and added .ts extension
import { getAllProjects } from "./_lib/projects.ts"; // Corrected path and added .ts extension

export async function GET(request: Request) {
  const cookieHeader = request.headers.get("cookie") || "";
  const token = getCookie(
    { headers: { cookie: cookieHeader } },
    getSessionCookieName()
  );

  if (!verifySessionToken(token)) {
    return new Response(JSON.stringify({ message: "Unauthorized" }), {
      status: 401,
      headers: {
        "Content-Type": "application/json",
      },
    });
  }

  try {
    const projects = await getAllProjects();

    return new Response(JSON.stringify(projects), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
      },
    });
  } catch (error) {
    return new Response(
      JSON.stringify({
        message: "Fetch failed",
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
