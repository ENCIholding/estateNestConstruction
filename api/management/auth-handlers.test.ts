import { afterEach, describe, expect, it } from "vitest";
import loginHandler from "./login.ts";
import sessionHandler from "./session.ts";

const originalEnv = {
  MANAGEMENT_USERNAME: process.env.MANAGEMENT_USERNAME,
  MANAGEMENT_PASSWORD: process.env.MANAGEMENT_PASSWORD,
  MANAGEMENT_SESSION_SECRET: process.env.MANAGEMENT_SESSION_SECRET,
};

afterEach(() => {
  for (const [key, value] of Object.entries(originalEnv)) {
    if (value === undefined) {
      delete process.env[key];
    } else {
      process.env[key] = value;
    }
  }
});

describe("management auth handlers", () => {
  it("creates a session cookie for valid credentials", async () => {
    process.env.MANAGEMENT_USERNAME = "ENCIKD";
    process.env.MANAGEMENT_PASSWORD = "ENCIKD$$";
    process.env.MANAGEMENT_SESSION_SECRET = "test-secret-123";

    const request = new Request("https://example.com/api/management/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        username: "ENCIKD",
        password: "ENCIKD$$",
      }),
    });

    const response = await loginHandler.fetch(request);

    expect(response.status).toBe(200);
    expect(response.headers.get("set-cookie")).toContain("enci_mgmt_session=");
  });

  it("returns an authenticated session when the cookie is valid", async () => {
    process.env.MANAGEMENT_USERNAME = "ENCIKD";
    process.env.MANAGEMENT_PASSWORD = "ENCIKD$$";
    process.env.MANAGEMENT_SESSION_SECRET = "test-secret-123";

    const loginResponse = await loginHandler.fetch(
      new Request("https://example.com/api/management/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username: "ENCIKD",
          password: "ENCIKD$$",
        }),
      })
    );

    const cookie = loginResponse.headers.get("set-cookie");

    expect(cookie).toBeTruthy();

    const sessionResponse = await sessionHandler.fetch(
      new Request("https://example.com/api/management/session", {
        headers: {
          cookie: cookie ?? "",
        },
      })
    );

    expect(sessionResponse.status).toBe(200);
    await expect(sessionResponse.json()).resolves.toEqual(
      expect.objectContaining({
        authenticated: true,
        user: expect.objectContaining({
          username: "ENCIKD",
        }),
      })
    );
  });
});
