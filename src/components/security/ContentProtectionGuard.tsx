import { useEffect } from "react";
import { useLocation } from "react-router-dom";

function getEventElement(target: EventTarget | null): HTMLElement | null {
  if (target instanceof HTMLElement) {
    return target;
  }

  if (document.activeElement instanceof HTMLElement) {
    return document.activeElement;
  }

  return null;
}

function isEditableTarget(target: EventTarget | null): boolean {
  const element = getEventElement(target);
  if (!element) {
    return false;
  }

  if (element.isContentEditable) {
    return true;
  }

  if (
    element instanceof HTMLInputElement ||
    element instanceof HTMLTextAreaElement ||
    element instanceof HTMLSelectElement
  ) {
    return true;
  }

  return Boolean(element.closest("input, textarea, select, [contenteditable='true']"));
}

function isBlockedShortcut(event: KeyboardEvent, editableTarget: boolean): boolean {
  const key = event.key.toLowerCase();
  const ctrlOrMeta = event.ctrlKey || event.metaKey;

  if (event.key === "F12") {
    return true;
  }

  if (ctrlOrMeta && event.shiftKey && ["i", "j", "c"].includes(key)) {
    return true;
  }

  if (ctrlOrMeta && ["u", "s", "p"].includes(key)) {
    return true;
  }

  if (!editableTarget && ctrlOrMeta && ["a", "c", "x"].includes(key)) {
    return true;
  }

  return false;
}

export default function ContentProtectionGuard() {
  const location = useLocation();
  const isManagementRoute =
    location.pathname.startsWith("/management") && location.pathname !== "/management/login";

  useEffect(() => {
    document.documentElement.classList.add("content-protection-enabled");
    if (isManagementRoute) {
      document.documentElement.classList.add("content-protection-managed");
    } else {
      document.documentElement.classList.remove("content-protection-managed");
    }

    const originalPrint = window.print.bind(window);

    const blockDefault = (event: Event) => {
      if (!isEditableTarget(event.target)) {
        event.preventDefault();
        event.stopPropagation();
      }
    };

    const onContextMenu = (event: MouseEvent) => {
      event.preventDefault();
      event.stopPropagation();
    };

    const onKeyDown = (event: KeyboardEvent) => {
      const editableTarget = isEditableTarget(event.target);

      if (isBlockedShortcut(event, editableTarget)) {
        event.preventDefault();
        event.stopPropagation();
        return;
      }

      if (event.key === "PrintScreen") {
        event.preventDefault();
        event.stopPropagation();
      }
    };

    const onBeforePrint = () => {
      document.documentElement.classList.add("content-protection-printing");
    };

    const onAfterPrint = () => {
      document.documentElement.classList.remove("content-protection-printing");
    };

    window.print = () => {
      document.documentElement.classList.add("content-protection-printing");
      window.setTimeout(() => {
        document.documentElement.classList.remove("content-protection-printing");
      }, 1200);
    };

    document.addEventListener("contextmenu", onContextMenu, true);
    document.addEventListener("dragstart", blockDefault, true);
    document.addEventListener("selectstart", blockDefault, true);
    document.addEventListener("copy", blockDefault, true);
    document.addEventListener("cut", blockDefault, true);
    document.addEventListener("keydown", onKeyDown, true);
    window.addEventListener("beforeprint", onBeforePrint);
    window.addEventListener("afterprint", onAfterPrint);

    return () => {
      window.print = originalPrint;
      document.documentElement.classList.remove("content-protection-enabled");
      document.documentElement.classList.remove("content-protection-managed");
      document.documentElement.classList.remove("content-protection-printing");
      document.removeEventListener("contextmenu", onContextMenu, true);
      document.removeEventListener("dragstart", blockDefault, true);
      document.removeEventListener("selectstart", blockDefault, true);
      document.removeEventListener("copy", blockDefault, true);
      document.removeEventListener("cut", blockDefault, true);
      document.removeEventListener("keydown", onKeyDown, true);
      window.removeEventListener("beforeprint", onBeforePrint);
      window.removeEventListener("afterprint", onAfterPrint);
    };
  }, [isManagementRoute]);

  return (
    <div
      aria-hidden="true"
      className="content-protection-watermark"
    >
      ENCI BUILDOS CONFIDENTIAL
    </div>
  );
}
