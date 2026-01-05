import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { LayoutDashboard, Receipt, Building2, DollarSign, FolderKanban, FileText, Calculator, LogOut, } from "lucide-react";
const DashboardLayout = ({ children }) => {
    const location = useLocation();
    const navigate = useNavigate();
    const handleLogout = async () => {
        if (!supabase) {
            toast.error("Authentication service not available");
            return;
        }
        try {
            const { error } = await supabase.auth.signOut();
            if (error) {
                console.error("Supabase logout error:", error);
                toast.error("Failed to log out");
                return;
            }
            toast.success("Logged out successfully");
            navigate("/management-login", { replace: true });
        }
        catch (err) {
            console.error("Unexpected logout error:", err);
            toast.error("Something went wrong during logout");
        }
    };
    const navItems = [
        { path: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
        { path: "/dashboard/contracts", label: "Contracts", icon: FileText },
        { path: "/dashboard/transactions", label: "Transactions", icon: Receipt },
        { path: "/dashboard/projects", label: "Current Projects", icon: Building2 },
        { path: "/dashboard/costs", label: "Construction Costs", icon: DollarSign },
        { path: "/dashboard/pipeline", label: "Pipeline", icon: FolderKanban },
        { path: "/dashboard/invoices", label: "Invoices", icon: FileText },
        { path: "/dashboard/tax", label: "Tax", icon: Calculator },
    ];
    return (_jsxs("div", { className: "flex h-screen bg-background", children: [_jsxs("aside", { className: "w-64 border-r bg-card flex flex-col", children: [_jsx("div", { className: "p-6 border-b", children: _jsx(Link, { to: "/dashboard", className: "block", children: _jsxs("div", { className: "flex items-center space-x-3", children: [_jsx("div", { className: "bg-white rounded-full p-1 flex items-center justify-center", children: _jsx("img", { src: "/lovable-uploads/65d67880-f4ae-4ca0-841d-1a60dd73a2d5.png", alt: "Estate Nest Capital Logo", className: "h-10 w-10" }) }), _jsxs("div", { children: [_jsx("h2", { className: "text-lg font-bold bg-gradient-to-r from-enc-orange to-enc-yellow bg-clip-text text-transparent", children: "ENCI" }), _jsx("p", { className: "text-xs text-muted-foreground", children: "Estate Nest Capital" })] })] }) }) }), _jsx("nav", { className: "flex-1 p-4 space-y-1 overflow-y-auto", children: navItems.map((item) => {
                            const Icon = item.icon;
                            const isActive = location.pathname === item.path;
                            return (_jsx(Link, { to: item.path, children: _jsxs(Button, { variant: isActive ? "secondary" : "ghost", className: "w-full justify-start", children: [_jsx(Icon, { className: "mr-3 h-4 w-4" }), item.label] }) }, item.path));
                        }) }), _jsx("div", { className: "p-4 border-t", children: _jsxs(Button, { variant: "outline", className: "w-full justify-start text-destructive hover:text-destructive", onClick: handleLogout, children: [_jsx(LogOut, { className: "mr-3 h-4 w-4" }), "Logout"] }) })] }), _jsx("main", { className: "flex-1 overflow-y-auto", children: _jsx("div", { className: "container mx-auto p-8", children: children }) })] }));
};
export default DashboardLayout;
