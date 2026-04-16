
import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { toast } from "sonner";
import { ArrowLeft, Shield } from "lucide-react";
import BrandLockup from "@/components/BrandLockup";

const ManagementLogin = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const redirectTo = searchParams.get("redirect") || "/management/dashboard";

  useEffect(() => {
    let mounted = true;

    async function checkExistingSession() {
      try {
        const response = await fetch("/api/management/session", {
          credentials: "include",
          cache: "no-store",
        });

        if (!mounted || !response.ok) {
          return;
        }

        navigate(redirectTo, { replace: true });
      } catch {
        // Stay on the login screen when the session check fails.
      }
    }

    void checkExistingSession();

    return () => {
      mounted = false;
    };
  }, [navigate, redirectTo]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (!username || !password) {
        throw new Error("Enter username and password");
      }

      const response = await fetch("/api/management/login", {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username,
          password,
        }),
      });

      const payload = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(payload?.message || "Login failed");
      }

      toast.success("Login successful");
      navigate(payload?.redirectTo || redirectTo, { replace: true });
      return;
    } catch (error: unknown) {
      if (error instanceof Error) {
        toast.error(error.message);
      } else {
        toast.error("Login failed");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-100">
      <Card className="mx-auto w-full max-w-sm">
        <CardHeader>
          <div className="mb-4 flex justify-center">
            <BrandLockup subtitle="Management Login" />
          </div>
          <CardTitle className="text-2xl text-center">
            Estate Nest Capital Inc.
          </CardTitle>
          <CardDescription className="text-center">
            Internal Management Dashboard
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLogin} className="grid gap-4">
            <div className="p-3 bg-amber-50 text-amber-700 rounded text-sm flex items-center gap-2">
              <Shield className="h-4 w-4" />
              <span>
                Restricted Access
              </span>
            </div>
            <p className="text-sm text-slate-600">
              This area is for Estate Nest Capital Inc. management only.
            </p>

            <div className="grid gap-2">
              <Label htmlFor="username">Username</Label>
              <Input
                id="username"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                disabled={loading}
                placeholder="Enter username"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                disabled={loading}
                placeholder="Enter password"
              />
            </div>
            <div className="flex gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate("/")}
                className="flex-1"
                disabled={loading}
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Site
              </Button>
              <Button type="submit" className="flex-1" disabled={loading}>
                {loading ? "Signing In..." : "Sign In"}
              </Button>
            </div>
          </form>
          <p className="mt-6 text-center text-sm text-slate-600">
            Access is granted only after a successful server-side session check.
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default ManagementLogin;
