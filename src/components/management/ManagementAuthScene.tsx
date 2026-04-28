import type { ReactNode } from "react";
import managementBackground from "@/assets/management-login-background.png";

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
          src={managementBackground}
          alt=""
          aria-hidden="true"
          className="absolute inset-0 h-full w-full object-cover object-center opacity-[0.55]"
        />
        <img
          src={managementBackground}
          alt=""
          aria-hidden="true"
          className="absolute inset-0 h-full w-full object-contain object-center"
        />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(41,122,34,0.10),transparent_30%),radial-gradient(circle_at_bottom_right,rgba(255,199,0,0.12),transparent_28%),linear-gradient(180deg,rgba(255,255,255,0.72),rgba(246,249,242,0.84))]" />
      </div>

      <div className="relative flex min-h-screen items-center justify-center px-6 py-16">
        {children}
      </div>
    </div>
  );
}
