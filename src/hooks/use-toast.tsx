import * as React from "react";

export type ToastActionElement = React.ReactElement;

export type ToastData = {
  id: string;
  title?: string;
  description?: string;
  action?: ToastActionElement;
  variant?: "default" | "destructive";
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
};

type State = {
  toasts: ToastData[];
};

const listeners: Array<(state: State) => void> = [];
let memoryState: State = { toasts: [] };

function emit() {
  listeners.forEach((listener) => listener(memoryState));
}

function addToast(toast: ToastData) {
  memoryState = {
    toasts: [toast, ...memoryState.toasts],
  };
  emit();
}

function updateToast(toast: ToastData) {
  memoryState = {
    toasts: memoryState.toasts.map((t) =>
      t.id === toast.id ? { ...t, ...toast } : t
    ),
  };
  emit();
}

function dismissToast(id?: string) {
  memoryState = {
    toasts: memoryState.toasts.map((t) =>
      t.id === id ? { ...t, open: false } : t
    ),
  };
  emit();
}

function removeToast(id?: string) {
  memoryState = {
    toasts: memoryState.toasts.filter((t) => t.id !== id),
  };
  emit();
}

function toast(data: Omit<ToastData, "id">) {
  const id = crypto.randomUUID();

  const dismiss = () => dismissToast(id);
  const update = (props: ToastData) =>
    updateToast({ ...props, id });

  addToast({
    ...data,
    id,
    open: true,
    onOpenChange: (open: boolean) => {
      if (!open) dismiss();
    },
  });

  return { id, dismiss, update };
}

export function useToast() {
  const [state, setState] = React.useState<State>(memoryState);

  React.useEffect(() => {
    listeners.push(setState);
    return () => {
      const index = listeners.indexOf(setState);
      if (index > -1) listeners.splice(index, 1);
    };
  }, []);

  return {
    toasts: state.toasts,
    toast,
    dismiss: dismissToast,
    remove: removeToast,
  };
}

export { toast };
