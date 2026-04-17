import {
  getCookie,
  getSessionCookieName,
  verifySessionToken,
} from "../_lib/auth.js";
import { getBuildOsStorageStatus } from "../_lib/buildosStore.js";
import { getSmtpConfig } from "../_lib/email.js";
import { getManagementUsers } from "../_lib/managementUsers.js";
import { getProjectRegistryState } from "../_lib/projects.js";

function isConfigured(value?: string) {
  return Boolean(value && value.trim());
}

export default function handler(req: any, res: any) {
  if (req.method !== "GET") {
    res.setHeader("Allow", "GET");
    return res.status(405).json({ message: "Method not allowed" });
  }

  res.setHeader("Cache-Control", "no-store");

  const token = getCookie(req, getSessionCookieName());

  if (!verifySessionToken(token)) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  const projectRegistry = getProjectRegistryState();
  const authConfigured =
    getManagementUsers().length > 0 &&
    isConfigured(process.env.MANAGEMENT_SESSION_SECRET);

  let emailConfigured = true;

  try {
    getSmtpConfig();
  } catch {
    emailConfigured = false;
  }

  return res.status(200).json({
    authConfigured,
    buildOsStorage: getBuildOsStorageStatus(),
    emailConfigured,
    projectRegistry,
  });
}
