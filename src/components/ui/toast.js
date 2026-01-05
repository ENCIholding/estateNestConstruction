import { jsx as _jsx } from "react/jsx-runtime";
import * as React from "react";
import * as ToastPrimitives from "@radix-ui/react-toast";
import { cva } from "class-variance-authority";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";
export const ToastProvider = ToastPrimitives.Provider;
export const ToastViewport = React.forwardRef(({ className, ...props }, ref) => (_jsx(ToastPrimitives.Viewport, { ref: ref, className: cn("fixed top-0 z-[100] flex max-h-screen w-full flex-col-reverse p-4 sm:bottom-0 sm:right-0 sm:top-auto sm:flex-col md:max-w-[420px]", className), ...props })));
ToastViewport.displayName = ToastPrimitives.Viewport.displayName;
const toastVariants = cva("group pointer-events-auto relative flex w-full items-center justify-between space-x-4 overflow-hidden rounded-md border p-6 pr-8 shadow-lg transition-all", {
    variants: {
        variant: {
            default: "border bg-background text-foreground",
            destructive: "border-destructive bg-destructive text-destructive-foreground",
        },
    },
    defaultVariants: {
        variant: "default",
    },
});
export const Toast = React.forwardRef(({ className, variant, ...props }, ref) => (_jsx(ToastPrimitives.Root, { ref: ref, className: cn(toastVariants({ variant }), className), ...props })));
Toast.displayName = ToastPrimitives.Root.displayName;
export const ToastTitle = React.forwardRef(({ className, ...props }, ref) => (_jsx(ToastPrimitives.Title, { ref: ref, className: cn("text-sm font-semibold", className), ...props })));
ToastTitle.displayName = ToastPrimitives.Title.displayName;
export const ToastDescription = React.forwardRef(({ className, ...props }, ref) => (_jsx(ToastPrimitives.Description, { ref: ref, className: cn("text-sm opacity-90", className), ...props })));
ToastDescription.displayName =
    ToastPrimitives.Description.displayName;
export const ToastClose = React.forwardRef(({ className, ...props }, ref) => (_jsx(ToastPrimitives.Close, { ref: ref, className: cn("absolute right-2 top-2 rounded-md p-1 text-foreground/50 hover:text-foreground", className), ...props, children: _jsx(X, { className: "h-4 w-4" }) })));
ToastClose.displayName = ToastPrimitives.Close.displayName;
