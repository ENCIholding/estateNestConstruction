import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Building2, DollarSign, Receipt, FolderKanban, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
const Dashboard = () => {
    const navigate = useNavigate();
    const [stats, setStats] = useState({
        activeProjects: 0,
        totalCosts: 0,
        pendingInvoices: 0,
        pipelineProjects: 0,
    });
    const fetchStats = async () => {
        if (!supabase)
            return;
        const [projects, costs, invoices, pipeline] = await Promise.all([
            supabase.from("projects").select("*", { count: "exact" }).eq("status", "active"),
            supabase.from("construction_costs").select("cost_amount"),
            supabase.from("invoices").select("*", { count: "exact" }).eq("status", "pending"),
            supabase.from("pipeline_projects").select("*", { count: "exact" }),
        ]);
        const totalCosts = costs.data?.reduce((sum, item) => sum + Number(item.cost_amount), 0) || 0;
        setStats({
            activeProjects: projects.count || 0,
            totalCosts,
            pendingInvoices: invoices.count || 0,
            pipelineProjects: pipeline.count || 0,
        });
    };
    useEffect(() => {
        const checkAuth = async () => {
            if (!supabase)
                return;
            const { data: { session } } = await supabase.auth.getSession();
            if (!session) {
                navigate("/management-login");
            }
            else {
                fetchStats();
            }
        };
        checkAuth();
    }, [navigate]);
    const statCards = [
        {
            title: "Active Projects",
            value: stats.activeProjects,
            icon: Building2,
            color: "text-blue-600",
            bgColor: "bg-blue-50",
        },
        {
            title: "Total Construction Costs",
            value: `CA$${stats.totalCosts.toLocaleString()}`,
            icon: DollarSign,
            color: "text-green-600",
            bgColor: "bg-green-50",
        },
        {
            title: "Pending Invoices",
            value: stats.pendingInvoices,
            icon: Receipt,
            color: "text-orange-600",
            bgColor: "bg-orange-50",
        },
        {
            title: "Pipeline Projects",
            value: stats.pipelineProjects,
            icon: FolderKanban,
            color: "text-purple-600",
            bgColor: "bg-purple-50",
        },
    ];
    return (_jsx(DashboardLayout, { children: _jsxs("div", { className: "space-y-6", children: [_jsxs("div", { className: "flex justify-between items-center", children: [_jsxs("div", { children: [_jsx("h1", { className: "text-3xl font-bold", children: "Dashboard" }), _jsx("p", { className: "text-muted-foreground", children: "Welcome to Estate Nest Capital Inc. Management" })] }), _jsxs("div", { className: "flex gap-2", children: [_jsxs(Button, { onClick: () => navigate("/dashboard/transactions?action=add"), className: "bg-gradient-to-r from-enc-orange to-enc-yellow text-white", children: [_jsx(Plus, { className: "mr-2 h-4 w-4" }), "Add Transaction"] }), _jsxs(Button, { onClick: () => navigate("/dashboard/projects?action=add"), className: "bg-gradient-to-r from-enc-orange to-enc-yellow text-white", children: [_jsx(Plus, { className: "mr-2 h-4 w-4" }), "Add Project"] }), _jsxs(Button, { onClick: () => navigate("/dashboard/invoices"), className: "bg-gradient-to-r from-enc-orange to-enc-yellow text-white", children: [_jsx(Plus, { className: "mr-2 h-4 w-4" }), "Add Invoice"] })] })] }), _jsx("div", { className: "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6", children: statCards.map((stat) => {
                        const Icon = stat.icon;
                        return (_jsxs(Card, { children: [_jsxs(CardHeader, { className: "flex flex-row items-center justify-between pb-2", children: [_jsx(CardTitle, { className: "text-sm font-medium text-muted-foreground", children: stat.title }), _jsx("div", { className: `p-2 rounded-lg ${stat.bgColor}`, children: _jsx(Icon, { className: `h-4 w-4 ${stat.color}` }) })] }), _jsx(CardContent, { children: _jsx("div", { className: "text-2xl font-bold", children: stat.value }) })] }, stat.title));
                    }) }), _jsxs(Card, { children: [_jsx(CardHeader, { children: _jsx(CardTitle, { children: "Quick Actions" }) }), _jsxs(CardContent, { className: "grid grid-cols-1 md:grid-cols-3 gap-4", children: [_jsx(Card, { className: "cursor-pointer hover:bg-accent transition-colors", onClick: () => navigate("/dashboard/projects"), children: _jsxs(CardContent, { className: "pt-6", children: [_jsx(Building2, { className: "h-8 w-8 mb-2 text-primary" }), _jsx("h3", { className: "font-semibold", children: "View Projects" }), _jsx("p", { className: "text-sm text-muted-foreground", children: "Manage current projects" })] }) }), _jsx(Card, { className: "cursor-pointer hover:bg-accent transition-colors", onClick: () => navigate("/dashboard/costs"), children: _jsxs(CardContent, { className: "pt-6", children: [_jsx(DollarSign, { className: "h-8 w-8 mb-2 text-primary" }), _jsx("h3", { className: "font-semibold", children: "Track Costs" }), _jsx("p", { className: "text-sm text-muted-foreground", children: "Monitor construction expenses" })] }) }), _jsx(Card, { className: "cursor-pointer hover:bg-accent transition-colors", onClick: () => navigate("/dashboard/invoices"), children: _jsxs(CardContent, { className: "pt-6", children: [_jsx(Receipt, { className: "h-8 w-8 mb-2 text-primary" }), _jsx("h3", { className: "font-semibold", children: "Create Invoice" }), _jsx("p", { className: "text-sm text-muted-foreground", children: "Generate new invoices" })] }) })] })] })] }) }));
};
export default Dashboard;
