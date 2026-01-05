import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Badge from "@/components/ui/badge";
const Transactions = () => {
    const navigate = useNavigate();
    const [projects, setProjects] = useState([]);
    const [loading, setLoading] = useState(true);
    const fetchProjects = async () => {
        if (!supabase) {
            setLoading(false);
            return;
        }
        try {
            setLoading(true);
            const { data, error } = await supabase
                .from("projects")
                .select("*")
                .order("created_at", { ascending: false });
            if (error)
                throw error;
            if (data)
                setProjects(data);
        }
        catch (err) {
            console.error("Failed to fetch projects:", err);
        }
        finally {
            setLoading(false);
        }
    };
    useEffect(() => {
        const checkAuth = async () => {
            try {
                if (!supabase) {
                    navigate("/management-login");
                    return;
                }
                const { data: { session }, error, } = await supabase.auth.getSession();
                if (error)
                    throw error;
                if (!session) {
                    navigate("/management-login");
                }
                else {
                    fetchProjects();
                }
            }
            catch (err) {
                console.error("Auth check failed:", err);
                navigate("/management-login");
            }
        };
        checkAuth();
    }, [navigate]);
    const getStatusColor = (status) => {
        const colors = {
            active: "bg-green-100 text-green-800",
            completed: "bg-blue-100 text-blue-800",
            archived: "bg-gray-100 text-gray-800",
        };
        return colors[status] || colors.archived;
    };
    return (_jsx(DashboardLayout, { children: _jsxs("div", { className: "space-y-6", children: [_jsxs("div", { children: [_jsx("h1", { className: "text-3xl font-bold", children: "Transactions / Current Projects" }), _jsx("p", { className: "text-muted-foreground", children: "View all project transactions and details" })] }), loading ? (_jsx("div", { className: "text-center py-12", children: "Loading transactions..." })) : projects.length === 0 ? (_jsx(Card, { children: _jsx(CardContent, { className: "py-12 text-center text-muted-foreground", children: "No transactions found" }) })) : (_jsx("div", { className: "grid gap-6", children: projects.map((project) => (_jsxs(Card, { children: [_jsx(CardHeader, { children: _jsxs("div", { className: "flex items-start justify-between", children: [_jsxs("div", { children: [_jsx(CardTitle, { children: project.project_name }), _jsx("p", { className: "text-sm text-muted-foreground mt-1", children: project.project_address })] }), _jsx(Badge, { className: getStatusColor(project.status ?? "archived"), children: project.status ?? "archived" })] }) }), _jsx(CardContent, {})] }, project.id))) }))] }) }));
};
export default Transactions;
