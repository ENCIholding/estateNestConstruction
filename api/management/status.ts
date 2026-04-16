import {
  getCookie,
  getSessionCookieName,
  verifySessionToken,
} from "../_lib/auth.ts";
import { getSmtpConfig } from "../_lib/email.ts";
import { jsonResponse, methodNotAllowed } from "../_lib/http.ts";
import { getProjectRegistryState } from "../_lib/projects.ts";

function isConfigured(value?: string) {
  return Boolean(value && value.trim());
}

function handleGet(request: Request) {
  const token = getCookie(request, getSessionCookieName());

  if (!verifySessionToken(token)) {
    return jsonResponse({ message: "Unauthorized" }, { status: 401 });
  }

  const projectRegistry = getProjectRegistryState();
  const authConfigured =
    isConfigured(process.env.MANAGEMENT_USERNAME) &&
    isConfigured(process.env.MANAGEMENT_PASSWORD) &&
    isConfigured(process.env.MANAGEMENT_SESSION_SECRET);

  let emailConfigured = true;

  try {
    getSmtpConfig();
  } catch {
    emailConfigured = false;
  }

  return jsonResponse(
    {
      authConfigured,
      emailConfigured,
      projectRegistry,
    },
    { status: 200 }
  );
}

export default {
  fetch(request: Request) {
    if (request.method !== "GET") {
      return methodNotAllowed(["GET"]);
    }

    return handleGet(request);
  },
};
