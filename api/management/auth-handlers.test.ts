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

    const { req, res, state } = createMockContext({
      method: "POST",
      body: {
        username: "ENCIKD",
        password: "ENCIKD$$",
      },
    });

    await loginHandler(req, res);

    expect(state.statusCode).toBe(200);
    expect(state.headers["Set-Cookie"]).toContain("enci_mgmt_session=");
  });

  it("returns an authenticated session when the cookie is valid", async () => {
    process.env.MANAGEMENT_USERNAME = "ENCIKD";
    process.env.MANAGEMENT_PASSWORD = "ENCIKD$$";
    process.env.MANAGEMENT_SESSION_SECRET = "test-secret-123";

    const loginContext = createMockContext({
      method: "POST",
      body: {
        username: "ENCIKD",
        password: "ENCIKD$$",
      },
    });

    await loginHandler(loginContext.req, loginContext.res);

    const cookie = loginContext.state.headers["Set-Cookie"];

    expect(cookie).toBeTruthy();

    const sessionContext = createMockContext({
      method: "GET",
      headers: {
        cookie: cookie ?? "",
      },
    });

    await sessionHandler(sessionContext.req, sessionContext.res);

    expect(sessionContext.state.statusCode).toBe(200);
    expect(sessionContext.state.jsonBody).toEqual(
      expect.objectContaining({
        authenticated: true,
        user: expect.objectContaining({
          username: "ENCIKD",
        }),
      })
    );
  });
});

function createMockContext(options: {
  body?: unknown;
  headers?: Record<string, string>;
  method: string;
}) {
  const state: {
    headers: Record<string, string>;
    jsonBody: unknown;
    statusCode: number;
  } = {
    headers: {},
    jsonBody: null,
    statusCode: 200,
  };

  const req = {
    body: options.body,
    headers: {
      cookie: options.headers?.cookie ?? "",
    },
    method: options.method,
    query: {},
  };

  const res = {
    json(body: unknown) {
      state.jsonBody = body;
      return res;
    },
    setHeader(key: string, value: string) {
      state.headers[key] = value;
      return res;
    },
    status(code: number) {
      state.statusCode = code;
      return res;
    },
  };

  return { req, res, state };
}
