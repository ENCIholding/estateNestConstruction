import * as React from "react";
const listeners = [];
let memoryState = { toasts: [] };
function emit() {
    listeners.forEach((listener) => listener(memoryState));
}
function addToast(toast) {
    memoryState = {
        toasts: [toast, ...memoryState.toasts],
    };
    emit();
}
function updateToast(toast) {
    memoryState = {
        toasts: memoryState.toasts.map((t) => t.id === toast.id ? { ...t, ...toast } : t),
    };
    emit();
}
function dismissToast(id) {
    memoryState = {
        toasts: memoryState.toasts.map((t) => t.id === id ? { ...t, open: false } : t),
    };
    emit();
}
function removeToast(id) {
    memoryState = {
        toasts: memoryState.toasts.filter((t) => t.id !== id),
    };
    emit();
}
function toast(data) {
    const id = crypto.randomUUID();
    const dismiss = () => dismissToast(id);
    const update = (props) => updateToast({ ...props, id });
    addToast({
        ...data,
        id,
        open: true,
        onOpenChange: (open) => {
            if (!open)
                dismiss();
        },
    });
    return { id, dismiss, update };
}
export function useToast() {
    const [state, setState] = React.useState(memoryState);
    React.useEffect(() => {
        listeners.push(setState);
        return () => {
            const index = listeners.indexOf(setState);
            if (index > -1)
                listeners.splice(index, 1);
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
