import type { ReactNode } from "react";
import heroImage from "@/assets/hero-building.jpg";
import strategyDocsImage from "@/assets/strategy-docs.jpg";

type ManagementAuthSceneProps = {
  children: ReactNode;
};

export default function ManagementAuthScene({
  children,
}: ManagementAuthSceneProps) {
  return (
    <div className="relative min-h-screen overflow-hidden bg-slate-100">
      <div className="absolute inset-0">
        <img
          src={heroImage}
          alt=""
          aria-hidden="true"
          className="absolute inset-0 h-full w-full object-cover opacity-[0.08]"
        />
        <img
          src={strategyDocsImage}
          alt=""
          aria-hidden="true"
          className="absolute inset-y-0 right-0 h-full w-[48%] object-cover opacity-[0.06] mix-blend-multiply"
        />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(249,115,22,0.12),transparent_28%),radial-gradient(circle_at_bottom_right,rgba(234,88,12,0.12),transparent_26%),linear-gradient(180deg,rgba(255,255,255,0.92),rgba(248,250,252,0.98))]" />
        <div
          className="absolute inset-0 opacity-[0.08] mix-blend-multiply"
          style={{
            backgroundImage: "url('/brand/estate-nest-capital-logo.jpg')",
            backgroundPosition: "center",
            backgroundRepeat: "no-repeat",
            backgroundSize: "360px",
          }}
        />
      </div>

      <div className="relative flex min-h-screen items-center justify-center px-6 py-16">
        {children}
      </div>
    </div>
  );
}
