import { afterEach, describe, expect, it } from "vitest";
import {
  createSessionToken,
  readSessionToken,
  verifySessionToken,
} from "./auth.ts";

const originalSecret = process.env.MANAGEMENT_SESSION_SECRET;

afterEach(() => {
  if (originalSecret === undefined) {
    delete process.env.MANAGEMENT_SESSION_SECRET;
  } else {
    process.env.MANAGEMENT_SESSION_SECRET = originalSecret;
  }
});

describe("auth helpers", () => {
  it("creates and reads signed session tokens", () => {
    process.env.MANAGEMENT_SESSION_SECRET = "test-secret-123";

    const token = createSessionToken("kanwar");
    const session = readSessionToken(token);

    expect(verifySessionToken(token)).toBe(true);
    expect(session).toEqual(
      expect.objectContaining({
        username: "kanwar",
      })
    );
  });

  it("rejects tampered tokens", () => {
    process.env.MANAGEMENT_SESSION_SECRET = "test-secret-123";

    const token = createSessionToken("kanwar");
    const tamperedToken = `${token.slice(0, -1)}x`;

    expect(verifySessionToken(tamperedToken)).toBe(false);
    expect(readSessionToken(tamperedToken)).toBeNull();
  });
});
