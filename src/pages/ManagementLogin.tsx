
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
import heroImage from "@/assets/hero-building.jpg";
import strategyDocsImage from "@/assets/strategy-docs.jpg";

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
        <Card className="mx-auto w-full max-w-md border-white/80 bg-white/92 shadow-[0_24px_60px_rgba(15,23,42,0.18)] backdrop-blur-xl">
          <CardHeader>
            <div className="mb-4 flex justify-center">
              <BrandLockup subtitle="Management Login" />
            </div>
            <CardTitle className="text-center text-2xl">
              Estate Nest Capital Inc.
            </CardTitle>
            <CardDescription className="text-center">
              Internal Management Dashboard
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleLogin} className="grid gap-4">
              <div className="flex items-center gap-2 rounded-xl bg-amber-50 p-3 text-sm text-amber-700">
                <Shield className="h-4 w-4" />
                <span>Restricted Access</span>
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
                <Button
                  type="submit"
                  className="flex-1 bg-gradient-to-r from-enc-red via-enc-orange to-enc-yellow text-white hover:opacity-95"
                  disabled={loading}
                >
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
    </div>
  );
};

export default ManagementLogin;
