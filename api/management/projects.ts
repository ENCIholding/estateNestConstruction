import {
  getCookie,
  getSessionCookieName,
  verifySessionToken,
} from "../_lib/auth.ts";
import { getAllProjects } from "../_lib/projects.ts";

export default async function handler(req: any, res: any) {
  if (req.method !== "GET") {
    res.setHeader("Allow", "GET");
    return res.status(405).json({ message: "Method not allowed" });
  }

  res.setHeader("Cache-Control", "no-store");

  const token = getCookie(req, getSessionCookieName());

  if (!verifySessionToken(token)) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  try {
    const projects = await getAllProjects();
    return res.status(200).json(projects);
  } catch (error) {
    return res.status(500).json({
      message: "Fetch failed",
      error: error instanceof Error ? error.message : String(error),
    });
  }
}
