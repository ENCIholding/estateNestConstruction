import React, { createContext, useContext, useEffect, useMemo, useState } from "react";
import { Accessibility, Contrast, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  ACCESSIBILITY_MODE_KEY,
  readStoredAccessibilityMode,
  type AccessibilityMode,
} from "@/lib/accessibility";

type AccessibilityContextValue = {
  mode: AccessibilityMode;
  disableEnhancedMode: () => void;
  enableEnhancedMode: () => void;
  isEnhanced: boolean;
  toggleEnhancedMode: () => void;
};

const AccessibilityContext = createContext<AccessibilityContextValue | null>(null);

function applyAccessibilityMode(mode: AccessibilityMode) {
  const root = document.documentElement;
  root.dataset.accessibilityMode = mode;
  root.classList.toggle("a11y-enhanced", mode === "enhanced");
}

function AccessibilityControls() {
  const context = useContext(AccessibilityContext);
  const [open, setOpen] = useState(false);

  if (!context) {
    return null;
  }

  return (
    <div className="fixed bottom-4 right-4 z-[70] flex max-w-[min(20rem,calc(100vw-2rem))] flex-col items-end gap-2">
      {open ? (
        <div
          id="site-accessibility-controls"
          className="rounded-[1.5rem] border border-border/90 bg-background/95 p-4 shadow-[0_24px_60px_rgba(15,23,42,0.18)] backdrop-blur"
        >
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-enc-orange">
                Accessibility
              </p>
              <h2 className="mt-2 text-base font-semibold text-foreground">
                Color accessibility mode
              </h2>
            </div>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={() => setOpen(false)}
              aria-label="Close accessibility controls"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>

          <p className="mt-3 text-sm leading-6 text-muted-foreground">
            Switch to stronger contrast, clearer focus rings, and less decorative gradients across the site.
          </p>

          <div className="mt-4 grid gap-2">
            <Button
              type="button"
              className="justify-start rounded-full bg-foreground text-background hover:opacity-90"
              onClick={context.enableEnhancedMode}
              aria-pressed={context.isEnhanced}
            >
              <Contrast className="mr-2 h-4 w-4" />
              Enable accessible colors
            </Button>
            <Button
              type="button"
              variant="outline"
              className="justify-start rounded-full"
              onClick={context.disableEnhancedMode}
              aria-pressed={!context.isEnhanced}
            >
              <Accessibility className="mr-2 h-4 w-4" />
              Return to brand colors
            </Button>
          </div>

          <p className="mt-3 text-xs leading-5 text-muted-foreground">
            Current mode: {context.isEnhanced ? "accessible colors on" : "brand colors on"}
          </p>
        </div>
      ) : null}

      <Button
        type="button"
        className="rounded-full bg-enc-text-primary px-4 py-6 text-white shadow-[0_18px_40px_rgba(15,23,42,0.22)] hover:bg-enc-text-primary/90"
        onClick={() => setOpen((current) => !current)}
        aria-expanded={open}
        aria-controls="site-accessibility-controls"
      >
        <Accessibility className="mr-2 h-4 w-4" />
        {context.isEnhanced ? "Accessibility On" : "Accessibility"}
      </Button>
    </div>
  );
}

export function AccessibilityProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [mode, setMode] = useState<AccessibilityMode>(() => {
    if (typeof window === "undefined") {
      return "default";
    }

    return readStoredAccessibilityMode(window.localStorage);
  });

  useEffect(() => {
    applyAccessibilityMode(mode);
    window.localStorage.setItem(ACCESSIBILITY_MODE_KEY, mode);
  }, [mode]);

  const value = useMemo<AccessibilityContextValue>(
    () => ({
      mode,
      isEnhanced: mode === "enhanced",
      enableEnhancedMode: () => setMode("enhanced"),
      disableEnhancedMode: () => setMode("default"),
      toggleEnhancedMode: () =>
        setMode((current) => (current === "enhanced" ? "default" : "enhanced")),
    }),
    [mode]
  );

  return (
    <AccessibilityContext.Provider value={value}>
      {children}
      <AccessibilityControls />
    </AccessibilityContext.Provider>
  );
}

export function useAccessibilityMode() {
  const context = useContext(AccessibilityContext);

  if (!context) {
    throw new Error("useAccessibilityMode must be used within AccessibilityProvider");
  }

  return context;
}
