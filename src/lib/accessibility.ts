export const ACCESSIBILITY_MODE_KEY = "enci-accessibility-mode";

export type AccessibilityMode = "default" | "enhanced";

export function isAccessibilityMode(value: string | null): value is AccessibilityMode {
  return value === "default" || value === "enhanced";
}

export function readStoredAccessibilityMode(
  storage?: Pick<Storage, "getItem">
): AccessibilityMode {
  const stored = storage?.getItem(ACCESSIBILITY_MODE_KEY) ?? null;
  return isAccessibilityMode(stored) ? stored : "default";
}
