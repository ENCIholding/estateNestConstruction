import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Input from "@/components/ui/input";
import Label from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import Dialog, { DialogContent, DialogHeader, DialogTitle, DialogTrigger, } from "@/components/ui/dialog";
import Select, { SelectContent, SelectItem, SelectTrigger, SelectValue, } from "@/components/ui/select";
import Badge from "@/components/ui/badge";
import { toast } from "sonner";
import { Plus, Calendar } from "lucide-react";
/* ================= COMPONENT ================= */
const Pipeline = () => {
    const navigate = useNavigate();
    const [projects, setProjects] = useState([]);
    const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
    const [newProject, setNewProject] = useState({
        project_name: "",
        project_address: "",
        primary_contact_name: "",
        primary_contact_phone: "",
        comments: "",
        target_month: new Date().getMonth() + 1,
        target_year: new Date().getFullYear(),
    });
    const months = [
        "January", "February", "March", "April", "May", "June",
        "July", "August", "September", "October", "November", "December",
    ];
    /* ================= DATA ================= */
    const fetchProjects = async () => {
        if (!supabase)
            return;
        try {
            const { data, error } = await supabase
                .from("pipeline_projects")
                .select("*")
                .order("target_year", { ascending: false })
                .order("target_month", { ascending: false });
            if (error)
                throw error;
            if (data)
                setProjects(data);
        }
        catch (err) {
            console.error("Failed to fetch pipeline projects:", err);
        }
    };
    /* ================= AUTH ================= */
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
            catch {
                navigate("/management-login");
            }
        };
        checkAuth();
    }, [navigate]);
    /* ================= ACTIONS ================= */
    const handleAddProject = async () => {
        if (!supabase) {
            toast.error("Backend not configured");
            return;
        }
        if (!newProject.project_name || !newProject.project_address) {
            toast.error("Please fill in required fields");
            return;
        }
        try {
            const row = {
                project_name: newProject.project_name,
                project_address: newProject.project_address,
                primary_contact_name: newProject.primary_contact_name || "",
                primary_contact_phone: newProject.primary_contact_phone || "",
                comments: newProject.comments || "",
                target_month: Number(newProject.target_month),
                target_year: Number(newProject.target_year),
            };
            const { error } = await supabase
                .from("pipeline_projects")
                .insert([row]); // ✅ MUST be array
            if (error)
                throw error;
            toast.success("Pipeline project added successfully");
            setIsAddDialogOpen(false);
            setNewProject({
                project_name: "",
                project_address: "",
                primary_contact_name: "",
                primary_contact_phone: "",
                comments: "",
                target_month: new Date().getMonth() + 1,
                target_year: new Date().getFullYear(),
            });
            fetchProjects();
        }
        catch (err) {
            console.error(err);
            toast.error("Failed to add pipeline project");
        }
    };
    /* ================= UI ================= */
    return (_jsx(DashboardLayout, { children: _jsxs("div", { className: "space-y-6", children: [_jsxs("div", { className: "flex justify-between items-start", children: [_jsxs("div", { children: [_jsx("h1", { className: "text-3xl font-bold", children: "Pipeline - Future Projects" }), _jsx("p", { className: "text-muted-foreground", children: "Track upcoming project opportunities" })] }), _jsxs(Dialog, { open: isAddDialogOpen, onOpenChange: setIsAddDialogOpen, children: [_jsx(DialogTrigger, { asChild: true, children: _jsxs(Button, { children: [_jsx(Plus, { className: "mr-2 h-4 w-4" }), "Add Project"] }) }), _jsxs(DialogContent, { className: "max-w-2xl", children: [_jsx(DialogHeader, { children: _jsx(DialogTitle, { children: "Add New Pipeline Project" }) }), _jsxs("div", { className: "grid grid-cols-2 gap-4", children: [_jsxs("div", { className: "space-y-2 col-span-2", children: [_jsx(Label, { children: "Project Name *" }), _jsx(Input, { value: newProject.project_name, onChange: (e) => setNewProject({ ...newProject, project_name: e.target.value }) })] }), _jsxs("div", { className: "space-y-2 col-span-2", children: [_jsx(Label, { children: "Project Address *" }), _jsx(Input, { value: newProject.project_address, onChange: (e) => setNewProject({ ...newProject, project_address: e.target.value }) })] }), _jsxs("div", { className: "space-y-2", children: [_jsx(Label, { children: "Primary Contact Name" }), _jsx(Input, { value: newProject.primary_contact_name, onChange: (e) => setNewProject({ ...newProject, primary_contact_name: e.target.value }) })] }), _jsxs("div", { className: "space-y-2", children: [_jsx(Label, { children: "Primary Contact Phone" }), _jsx(Input, { value: newProject.primary_contact_phone, onChange: (e) => setNewProject({ ...newProject, primary_contact_phone: e.target.value }) })] }), _jsxs("div", { className: "space-y-2", children: [_jsx(Label, { children: "Target Month" }), _jsxs(Select, { value: newProject.target_month.toString(), onValueChange: (v) => setNewProject({ ...newProject, target_month: Number(v) }), children: [_jsx(SelectTrigger, { children: _jsx(SelectValue, {}) }), _jsx(SelectContent, { children: months.map((month, idx) => (_jsx(SelectItem, { value: (idx + 1).toString(), children: month }, idx))) })] })] }), _jsxs("div", { className: "space-y-2", children: [_jsx(Label, { children: "Target Year" }), _jsx(Input, { type: "number", value: newProject.target_year, onChange: (e) => setNewProject({
                                                                ...newProject,
                                                                target_year: Number(e.target.value),
                                                            }) })] }), _jsxs("div", { className: "space-y-2 col-span-2", children: [_jsx(Label, { children: "Comments / Status Updates" }), _jsx(Textarea, { rows: 3, value: newProject.comments, onChange: (e) => setNewProject({ ...newProject, comments: e.target.value }) })] })] }), _jsx(Button, { onClick: handleAddProject, className: "w-full", children: "Add Pipeline Project" })] })] })] }), projects.length === 0 ? (_jsx(Card, { children: _jsx(CardContent, { className: "py-12 text-center text-muted-foreground", children: "No pipeline projects found" }) })) : (_jsx("div", { className: "grid gap-6", children: projects.map((project) => (_jsxs(Card, { children: [_jsx(CardHeader, { children: _jsxs("div", { className: "flex items-start justify-between", children: [_jsxs("div", { children: [_jsx(CardTitle, { children: project.project_name ?? "Untitled Project" }), _jsx("p", { className: "text-sm text-muted-foreground mt-1", children: project.project_address ?? "N/A" })] }), project.target_month && project.target_year && (_jsxs(Badge, { variant: "outline", className: "flex items-center gap-1", children: [_jsx(Calendar, { className: "h-3 w-3" }), months[project.target_month - 1], " ", project.target_year] }))] }) }), _jsx(CardContent, { children: _jsxs("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-6", children: [_jsxs("div", { children: [_jsx("h3", { className: "font-semibold text-sm mb-2 bg-gradient-to-r from-amber-600 to-orange-600 bg-clip-text text-transparent", children: "Primary Contact" }), _jsxs("dl", { className: "space-y-1 text-sm", children: [_jsxs("div", { children: [_jsx("dt", { className: "text-muted-foreground inline", children: "Name:" }), _jsx("dd", { className: "inline ml-2", children: project.primary_contact_name || "N/A" })] }), _jsxs("div", { children: [_jsx("dt", { className: "text-muted-foreground inline", children: "Phone:" }), _jsx("dd", { className: "inline ml-2", children: project.primary_contact_phone || "N/A" })] })] })] }), project.comments && (_jsxs("div", { children: [_jsx("h3", { className: "font-semibold text-sm mb-2 bg-gradient-to-r from-amber-600 to-orange-600 bg-clip-text text-transparent", children: "Comments / Status" }), _jsx("p", { className: "text-sm", children: project.comments })] }))] }) })] }, project.id))) }))] }) }));
};
export default Pipeline;
