import { getCookie, getSessionCookieName, verifySessionToken } from "../../_lib/auth";
import { getProjectById, updateProjectById } from "../../_lib/projects";

export default async function handler(req: any, res: any) {
  const id = req.query?.id;

  if (!id || typeof id !== "string") {
    return res.status(400).json({ message: "Project id is required" });
  }

  res.setHeader("Cache-Control", "no-store");

  const token = getCookie(req, getSessionCookieName());

  if (!verifySessionToken(token)) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  if (req.method === "GET") {
    const project = await getProjectById(id);

    if (!project) {
      return res.status(404).json({ message: "Project not found" });
    }

    return res.status(200).json(project);
  }

  if (req.method === "PUT") {
    try {
      const body =
        typeof req.body === "string" ? JSON.parse(req.body) : req.body || {};
      const updatedProject = await updateProjectById(id, body);

      if (!updatedProject) {
        return res.status(404).json({ message: "Project not found" });
      }

      return res.status(200).json(updatedProject);
    } catch (error) {
      return res.status(500).json({
        message: "Update failed",
        error: error instanceof Error ? error.message : String(error),
      });
    }
  }

  res.setHeader("Allow", "GET, PUT");
  return res.status(405).json({ message: "Method not allowed" });
}
