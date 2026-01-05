import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import Input from "@/components/ui/input";
import Label from "@/components/ui/label";
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
        if (!supabase)
            return;
        supabase.auth.getSession().then(({ data: { session } }) => {
            if (session) {
                navigate("/dashboard");
            }
        });
    }, [navigate]);
    const handleLogin = async (e) => {
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
                }
                else {
                    throw error;
                }
            }
            else {
                toast.success("Login successful!");
                navigate("/dashboard");
            }
        }
        catch (error) {
            if (error instanceof Error) {
                toast.error(error.message);
            }
            else {
                toast.error("Login failed");
            }
        }
        finally {
            setLoading(false);
        }
    };
    return (_jsx("div", { className: "min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center p-4", children: _jsxs("div", { className: "w-full max-w-md space-y-6", children: [_jsxs("div", { className: "text-center space-y-2", children: [_jsx("div", { className: "flex justify-center mb-4", children: _jsx("div", { className: "h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center", children: _jsx(Shield, { className: "h-8 w-8 text-primary" }) }) }), _jsx("h1", { className: "text-3xl font-bold", children: "Estate Nest Capital Inc." }), _jsx("p", { className: "text-sm text-muted-foreground", children: "Internal Management Dashboard" })] }), _jsxs(Card, { className: "border-amber-200 shadow-lg", children: [_jsxs(CardHeader, { className: "bg-gradient-to-r from-amber-50 to-orange-50 space-y-1", children: [_jsx(CardTitle, { className: "text-xl", children: "\u26A0\uFE0F Restricted Access" }), _jsx(CardDescription, { className: "text-sm", children: "This area is for Estate Nest Capital Inc. management only." })] }), _jsx(CardContent, { className: "pt-6", children: _jsxs("form", { onSubmit: handleLogin, className: "space-y-4", children: [_jsxs("div", { className: "space-y-2", children: [_jsx(Label, { htmlFor: "username", children: "Username" }), _jsx(Input, { id: "username", type: "text", value: username, onChange: (e) => setUsername(e.target.value), required: true, disabled: loading, placeholder: "Enter username" })] }), _jsxs("div", { className: "space-y-2", children: [_jsx(Label, { htmlFor: "password", children: "Password" }), _jsx(Input, { id: "password", type: "password", value: password, onChange: (e) => setPassword(e.target.value), required: true, disabled: loading, placeholder: "Enter password" })] }), _jsxs("div", { className: "flex gap-2", children: [_jsxs(Button, { type: "button", variant: "outline", onClick: () => navigate("/"), className: "flex-1", disabled: loading, children: [_jsx(ArrowLeft, { className: "mr-2 h-4 w-4" }), "Back to Site"] }), _jsx(Button, { type: "submit", className: "flex-1", disabled: loading, children: loading ? "Signing In..." : "Sign In" })] })] }) })] }), _jsx(Card, { className: "border-muted", children: _jsx(CardContent, { className: "pt-6 text-sm text-center text-muted-foreground", children: "Please return to the main site. Thank you for your cooperation and understanding." }) })] }) }));
};
export default ManagementLogin;
