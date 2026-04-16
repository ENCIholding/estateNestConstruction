import { describe, expect, it } from "vitest";
import {
  ACCESSIBILITY_MODE_KEY,
  readStoredAccessibilityMode,
} from "./accessibility";

describe("accessibility mode helpers", () => {
  it("falls back to default mode when storage is empty", () => {
    expect(
      readStoredAccessibilityMode({
        getItem: () => null,
      })
    ).toBe("default");
  });

  it("returns the stored mode when the value is valid", () => {
    expect(
      readStoredAccessibilityMode({
        getItem: (key) =>
          key === ACCESSIBILITY_MODE_KEY ? "enhanced" : null,
      })
    ).toBe("enhanced");
  });

  it("ignores invalid stored values", () => {
    expect(
      readStoredAccessibilityMode({
        getItem: () => "rainbow-mode",
      })
    ).toBe("default");
  });
});
