import { Loader2 } from "lucide-react";
import BrandLockup from "@/components/BrandLockup";
import ManagementAuthScene from "@/components/management/ManagementAuthScene";

type ManagementRouteFallbackProps = {
  variant?: "login" | "auth" | "workspace";
  message?: string;
};

export default function ManagementRouteFallback({
  variant = "workspace",
  message,
}: ManagementRouteFallbackProps) {
  if (variant === "login" || variant === "auth") {
    return (
      <ManagementAuthScene>
        <div className="mx-auto w-full max-w-md rounded-[2rem] border border-white/80 bg-white/92 p-8 text-center shadow-[0_24px_60px_rgba(15,23,42,0.18)] backdrop-blur-xl">
          <div className="mb-6 flex justify-center">
            <BrandLockup subtitle="ENCI Build OS" />
          </div>
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-r from-enc-red via-enc-orange to-enc-yellow text-white shadow-glow">
            <Loader2 className="h-5 w-5 animate-spin" />
          </div>
          <p className="mt-5 text-lg font-semibold text-slate-900">
            {variant === "auth" ? "Checking access" : "Loading ENCI BuildOS"}
          </p>
          <p className="mt-3 text-sm leading-6 text-slate-600">
            {message ||
              "Preparing the secure management workspace with the Estate Nest branded shell."}
          </p>
        </div>
      </ManagementAuthScene>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <aside className="fixed left-0 top-0 hidden h-full w-72 border-r border-border/70 bg-background/95 backdrop-blur-xl lg:block">
        <div className="border-b border-border/70 p-6">
          <BrandLockup subtitle="ENCI BuildOS" className="max-w-[220px]" />
        </div>
        <div className="space-y-3 p-4">
          <div className="h-10 rounded-xl border border-border/80 bg-card/80" />
          <div className="h-10 rounded-xl border border-border/80 bg-card/80" />
        </div>
        <div className="space-y-2 px-4 pb-6">
          {Array.from({ length: 8 }).map((_, index) => (
            <div
              key={index}
              className="h-11 rounded-xl bg-muted/70"
            />
          ))}
        </div>
      </aside>

      <main className="min-h-screen pt-16 lg:ml-72 lg:pt-0">
        <div className="sticky top-0 z-20 hidden border-b border-border/70 bg-background/95 px-6 py-4 backdrop-blur-xl lg:block">
          <div className="flex items-center justify-between gap-4">
            <div className="space-y-3">
              <div className="h-3 w-28 rounded-full bg-enc-orange/20" />
              <div className="h-8 w-56 rounded-full bg-muted/70" />
            </div>
            <div className="flex gap-3">
              <div className="h-10 w-28 rounded-full bg-muted/70" />
              <div className="h-10 w-36 rounded-full bg-muted/70" />
            </div>
          </div>
        </div>

        <div className="flex min-h-[70vh] items-center justify-center px-6 py-10">
          <div className="dashboard-panel max-w-xl p-10 text-center">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-r from-enc-red via-enc-orange to-enc-yellow text-white shadow-glow">
              <Loader2 className="h-6 w-6 animate-spin" />
            </div>
            <p className="mt-6 text-xl font-semibold text-foreground">
              Opening the next workspace module
            </p>
            <p className="mt-3 text-sm leading-6 text-muted-foreground">
              ENCI BuildOS is keeping the shell active while the next builder
              workflow loads.
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
