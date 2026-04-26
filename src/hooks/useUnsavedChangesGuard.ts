import { useCallback, useEffect } from "react";

type UseUnsavedChangesGuardOptions = {
  discardMessage: string;
  isDirty: boolean;
  onConfirmClose: () => void;
  open: boolean;
  saving: boolean;
};

export default function useUnsavedChangesGuard({
  discardMessage,
  isDirty,
  onConfirmClose,
  open,
  saving,
}: UseUnsavedChangesGuardOptions) {
  useEffect(() => {
    if (!open || !isDirty) {
      return;
    }

    const handleBeforeUnload = (event: BeforeUnloadEvent) => {
      event.preventDefault();
      event.returnValue = "";
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [isDirty, open]);

  return useCallback(() => {
    if (saving) {
      return;
    }

    if (isDirty && !window.confirm(discardMessage)) {
      return;
    }

    onConfirmClose();
  }, [discardMessage, isDirty, onConfirmClose, saving]);
}
