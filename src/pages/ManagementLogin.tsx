import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import  Input from "@/components/ui/input";
import Label  from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { ArrowLeft, Shield } from "lucide-react";

const ManagementLogin = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
  // Supabase not configured yet → skip auth check
  if (!supabase) return;

  supabase.auth.getSession().then(({ data: { session } }) => {
    if (session) {
      navigate("/dashboard");
    }
  });
}, [navigate]);


  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (username !== "ENCIKD" || password !== "ENCIKD$$") {
      toast.error("Invalid credentials");
      return;
    }

    setLoading(true);
    
   try {
  if (!supabase) {
    toast.error("Authentication service not configured");
    return;
  }

  const email = "admin@estatenest.capital";
  const password = "ENCIKD$$2024SECURE";

  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    // If user doesn't exist, create account
    if (error.message.toLowerCase().includes("invalid login")) {
      const { error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/dashboard`,
        },
      });

      if (signUpError) {
        throw signUpError;
      }

      toast.success("Welcome! Redirecting to dashboard...");
      navigate("/dashboard");
    } else {
      throw error;
    }
  } else {
    toast.success("Login successful!");
    navigate("/dashboard");
  }
} catch (error: unknown) {
  if (error instanceof Error) {
    toast.error(error.message);
  } else {
    toast.error("Login failed");
  }
} finally {
  setLoading(false);
}}


  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-6">
        <div className="text-center space-y-2">
          <div className="flex justify-center mb-4">
            <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center">
              <Shield className="h-8 w-8 text-primary" />
            </div>
          </div>
          <h1 className="text-3xl font-bold">Estate Nest Capital Inc.</h1>
          <p className="text-sm text-muted-foreground">Internal Management Dashboard</p>
        </div>

        <Card className="border-amber-200 shadow-lg">
          <CardHeader className="bg-gradient-to-r from-amber-50 to-orange-50 space-y-1">
            <CardTitle className="text-xl">⚠️ Restricted Access</CardTitle>
            <CardDescription className="text-sm">
              This area is for Estate Nest Capital Inc. management only.
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-6">
            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-2">
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
              <div className="space-y-2">
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
          </CardContent>
        </Card>

        <Card className="border-muted">
          <CardContent className="pt-6 text-sm text-center text-muted-foreground">
            Please return to the main site. Thank you for your cooperation and understanding.
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ManagementLogin;
