import type {
  BuildOsPreferences,
  DashboardThemeMode,
} from "./buildosWorkspace";

export function resolveDashboardTheme(mode: DashboardThemeMode) {
  if (mode === "system") {
    if (typeof window !== "undefined" && window.matchMedia) {
      return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
    }

    return "light";
  }

  return mode;
}

export function getDashboardShellClasses(preferences: BuildOsPreferences) {
  return {
    densityClass:
      preferences.density === "compact" ? "buildos-density-compact" : "buildos-density-comfortable",
    fontClass:
      preferences.fontScale === "xlarge"
        ? "buildos-font-xlarge"
        : preferences.fontScale === "large"
          ? "buildos-font-large"
          : "buildos-font-default",
    reducedMotionClass: preferences.reducedMotion ? "buildos-reduced-motion" : "",
  };
}

