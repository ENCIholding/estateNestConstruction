import { useEffect, useState } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { Loader2 } from "lucide-react";

type SessionState = {
  loading: boolean;
  authenticated: boolean;
};

export default function RequireManagementAuth({
  children,
}: {
  children: JSX.Element;
}) {
  const location = useLocation();
  const [session, setSession] = useState<SessionState>({
    loading: true,
    authenticated: false,
  });

  useEffect(() => {
    let mounted = true;

    async function checkSession() {
      try {
        const response = await fetch("/api/management/session", {
          credentials: "include",
          cache: "no-store",
        });

        if (!mounted) {
          return;
        }

        setSession({
          loading: false,
          authenticated: response.ok,
        });
      } catch {
        if (!mounted) {
          return;
        }

        setSession({
          loading: false,
          authenticated: false,
        });
      }
    }

    void checkSession();

    return () => {
      mounted = false;
    };
  }, []);

  if (session.loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50">
        <div className="flex items-center gap-3 text-slate-600">
          <Loader2 className="h-5 w-5 animate-spin" />
          <span>Checking management access...</span>
        </div>
      </div>
    );
  }

  if (!session.authenticated) {
    return (
      <Navigate
        to={`/management/login?redirect=${encodeURIComponent(
          location.pathname + location.search
        )}`}
        replace
      />
    );
  }

  return children;
}
