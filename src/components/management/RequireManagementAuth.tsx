import { useEffect, useState } from "react";
import { Navigate, useLocation } from "react-router-dom";
import ManagementRouteFallback from "@/components/management/ManagementRouteFallback";

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
      <ManagementRouteFallback
        variant="auth"
        message="Checking the active management session before ENCI BuildOS opens the next module."
      />
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
