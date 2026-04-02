import { getCookie, getSessionCookieName, verifySessionToken } from "../../_lib/auth";

export default async function handler(req: any, res: any) {
  const token = getCookie(req, getSessionCookieName());

  if (!verifySessionToken(token)) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  if (req.method !== "PUT") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  const appId = process.env.BASE44_APP_ID;
  const apiKey = process.env.BASE44_API_KEY;
  const apiBase = process.env.BASE44_API_BASE;
  const { id } = req.query;

  if (!appId || !apiKey || !apiBase) {
    return res.status(500).json({ message: "Base44 environment is not configured" });
  }

  const body = typeof req.body === "string" ? JSON.parse(req.body) : req.body || {};

  try {
    const response = await fetch(`${apiBase}/api/apps/${appId}/entities/Project/${id}`, {
      method: "PUT",
      headers: {
        api_key: apiKey,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });

    const data = await response.json();
    return res.status(response.status).json(data);
  } catch (error) {
    return res.status(500).json({ message: "Failed to update project", error });
  }
}
