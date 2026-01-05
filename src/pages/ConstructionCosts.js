import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Input from "@/components/ui/input";
import Label from "@/components/ui/label";
import Dialog, { DialogContent, DialogHeader, DialogTitle, DialogTrigger, } from "@/components/ui/dialog";
import Select, { SelectContent, SelectItem, SelectTrigger, SelectValue, } from "@/components/ui/select";
import Table, { TableBody, TableCell, TableHead, TableHeader, TableRow, } from "@/components/ui/table";
import { toast } from "sonner";
import { Plus, Download } from "lucide-react";
const ConstructionCosts = () => {
    const navigate = useNavigate();
    const [costs, setCosts] = useState([]);
    const [filteredCosts, setFilteredCosts] = useState([]);
    const [selectedYear, setSelectedYear] = useState("all");
    const [years, setYears] = useState([]);
    const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
    const [newCost, setNewCost] = useState({
        cost_item: "",
        vendor_name: "",
        vendor_contact: "",
        vendor_email: "",
        vendor_phone: "",
        cost_amount: "",
        year: new Date().getFullYear().toString(),
        comments: "",
    });
    /* =======================
       Fetch Costs
    ======================= */
    const fetchCosts = async () => {
        if (!supabase) {
            console.warn("Supabase not configured");
            return;
        }
        const { data, error } = await supabase
            .from("construction_costs")
            .select("*")
            .order("year", { ascending: false })
            .order("created_at", { ascending: false });
        if (error) {
            toast.error("Failed to fetch construction costs");
            return;
        }
        if (!data)
            return;
        const typedData = data;
        setCosts(typedData);
        setFilteredCosts(typedData);
        const uniqueYears = Array.from(new Set(typedData.map((c) => c.year))).sort((a, b) => b - a);
        setYears(uniqueYears);
    };
    /* =======================
       Auth Check
    ======================= */
    useEffect(() => {
        const checkAuth = async () => {
            try {
                // If Supabase is not configured, force login
                if (!supabase) {
                    navigate("/management-login");
                    return;
                }
                const { data: { session }, error, } = await supabase.auth.getSession();
                if (error) {
                    throw error;
                }
                if (!session) {
                    navigate("/management-login");
                }
            }
            catch (err) {
                console.error("Auth check failed:", err);
                navigate("/management-login");
            }
        };
        checkAuth();
    }, [navigate]);
    /* =======================
       Filters
    ======================= */
    const filterByYear = (year) => {
        setSelectedYear(year);
        if (year === "all") {
            setFilteredCosts(costs);
        }
        else {
            const parsedYear = parseInt(year, 10);
            setFilteredCosts(costs.filter((c) => c.year === parsedYear));
        }
    };
    /* =======================
       Add Cost
    ======================= */
    const handleAddCost = async () => {
        if (!newCost.cost_item || !newCost.vendor_name || !newCost.cost_amount) {
            toast.error("Please fill in required fields");
            return;
        }
        try {
            if (!supabase)
                return;
            const row = {
                cost_item: newCost.cost_item,
                vendor_name: newCost.vendor_name, // ✅ REQUIRED (string)
                vendor_contact: newCost.vendor_contact || "",
                vendor_email: newCost.vendor_email || "",
                vendor_phone: newCost.vendor_phone || "",
                cost_amount: Number(newCost.cost_amount),
                year: Number(newCost.year),
                comments: newCost.comments || "",
            };
            const { error } = await supabase
                .from("construction_costs")
                .insert([row]);
            if (error) {
                throw error;
            }
            // success handling here (toast, reset form, refetch, etc.)
        }
        catch (err) {
            console.error("Failed to insert construction cost:", err);
        }
        toast.success("Cost item added successfully");
        setIsAddDialogOpen(false);
        setNewCost({
            cost_item: "",
            vendor_name: "",
            vendor_contact: "",
            vendor_email: "",
            vendor_phone: "",
            cost_amount: "",
            year: new Date().getFullYear().toString(),
            comments: "",
        });
        fetchCosts();
    };
    /* =======================
       CSV Download
    ======================= */
    const downloadCSV = () => {
        const headers = [
            "Cost Item",
            "Vendor Name",
            "Contact",
            "Email",
            "Phone",
            "Cost (CAD)",
            "Year",
            "Comments",
        ];
        const csvContent = [
            headers.join(","),
            ...filteredCosts.map((c) => [
                c.cost_item,
                c.vendor_name,
                c.vendor_contact,
                c.vendor_email,
                c.vendor_phone,
                c.cost_amount,
                c.year,
                c.comments,
            ]
                .map((v) => `"${v ?? ""}"`)
                .join(",")),
        ].join("\n");
        const blob = new Blob([csvContent], { type: "text/csv" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `construction-costs-${selectedYear}.csv`;
        a.click();
        URL.revokeObjectURL(url);
    };
    const totalCost = filteredCosts.reduce((sum, c) => sum + c.cost_amount, 0);
    /* =======================
       Render
    ======================= */
    return (_jsx(DashboardLayout, { children: _jsxs("div", { className: "space-y-6", children: [_jsxs("div", { className: "flex justify-between items-start", children: [_jsxs("div", { children: [_jsx("h1", { className: "text-3xl font-bold", children: "Construction Cost Tracking" }), _jsx("p", { className: "text-muted-foreground", children: "Monitor and manage construction expenses" })] }), _jsxs(Dialog, { open: isAddDialogOpen, onOpenChange: setIsAddDialogOpen, children: [_jsx(DialogTrigger, { asChild: true, children: _jsxs(Button, { children: [_jsx(Plus, { className: "mr-2 h-4 w-4" }), "Add Line"] }) }), _jsxs(DialogContent, { className: "max-w-2xl", children: [_jsx(DialogHeader, { children: _jsx(DialogTitle, { children: "Add New Cost Item" }) }), _jsxs("div", { className: "grid grid-cols-2 gap-4", children: [_jsxs("div", { children: [_jsx(Label, { children: "Cost Item *" }), _jsx(Input, { value: newCost.cost_item, onChange: (e) => setNewCost({ ...newCost, cost_item: e.target.value }) })] }), _jsxs("div", { children: [_jsx(Label, { children: "Vendor Name *" }), _jsx(Input, { value: newCost.vendor_name, onChange: (e) => setNewCost({ ...newCost, vendor_name: e.target.value }) })] }), _jsxs("div", { children: [_jsx(Label, { children: "Vendor Contact" }), _jsx(Input, { value: newCost.vendor_contact, onChange: (e) => setNewCost({
                                                                ...newCost,
                                                                vendor_contact: e.target.value,
                                                            }) })] }), _jsxs("div", { children: [_jsx(Label, { children: "Vendor Email" }), _jsx(Input, { type: "email", value: newCost.vendor_email, onChange: (e) => setNewCost({
                                                                ...newCost,
                                                                vendor_email: e.target.value,
                                                            }) })] }), _jsxs("div", { children: [_jsx(Label, { children: "Vendor Phone" }), _jsx(Input, { value: newCost.vendor_phone, onChange: (e) => setNewCost({
                                                                ...newCost,
                                                                vendor_phone: e.target.value,
                                                            }) })] }), _jsxs("div", { children: [_jsx(Label, { children: "Cost (CAD) *" }), _jsx(Input, { type: "number", step: "0.01", value: newCost.cost_amount, onChange: (e) => setNewCost({
                                                                ...newCost,
                                                                cost_amount: e.target.value,
                                                            }) })] }), _jsxs("div", { children: [_jsx(Label, { children: "Year *" }), _jsx(Input, { type: "number", value: newCost.year, onChange: (e) => setNewCost({ ...newCost, year: e.target.value }) })] }), _jsxs("div", { className: "col-span-2", children: [_jsx(Label, { children: "Comments" }), _jsx(Input, { value: newCost.comments, onChange: (e) => setNewCost({ ...newCost, comments: e.target.value }) })] })] }), _jsx(Button, { onClick: handleAddCost, className: "w-full mt-4", children: "Add Cost Item" })] })] })] }), _jsxs("div", { className: "flex gap-4 items-center", children: [_jsxs(Select, { value: selectedYear, onValueChange: filterByYear, children: [_jsx(SelectTrigger, { className: "w-48", children: _jsx(SelectValue, { placeholder: "Filter by year" }) }), _jsxs(SelectContent, { children: [_jsx(SelectItem, { value: "all", children: "All Years" }), years.map((y) => (_jsx(SelectItem, { value: y.toString(), children: y }, y)))] })] }), _jsxs(Button, { variant: "outline", onClick: downloadCSV, children: [_jsx(Download, { className: "mr-2 h-4 w-4" }), "Download CSV"] })] }), _jsxs(Card, { children: [_jsx(CardHeader, { children: _jsxs(CardTitle, { className: "flex justify-between", children: [_jsxs("span", { children: ["Cost Summary \u2013", " ", selectedYear === "all" ? "All Years" : selectedYear] }), _jsxs("span", { className: "text-primary", children: ["Total: CA$", totalCost.toLocaleString()] })] }) }), _jsx(CardContent, { children: _jsxs(Table, { children: [_jsx(TableHeader, { children: _jsxs(TableRow, { children: [_jsx(TableHead, { children: "Cost Item" }), _jsx(TableHead, { children: "Vendor Name" }), _jsx(TableHead, { children: "Contact" }), _jsx(TableHead, { children: "Email" }), _jsx(TableHead, { children: "Phone" }), _jsx(TableHead, { className: "text-right", children: "Cost (CAD)" }), _jsx(TableHead, { children: "Year" }), _jsx(TableHead, { children: "Comments" })] }) }), _jsx(TableBody, { children: filteredCosts.length === 0 ? (_jsx(TableRow, { children: _jsx(TableCell, { colSpan: 8, className: "text-center text-muted-foreground", children: "No cost items found" }) })) : (filteredCosts.map((cost) => (_jsxs(TableRow, { children: [_jsx(TableCell, { children: cost.cost_item }), _jsx(TableCell, { children: cost.vendor_name }), _jsx(TableCell, { children: cost.vendor_contact }), _jsx(TableCell, { children: cost.vendor_email }), _jsx(TableCell, { children: cost.vendor_phone }), _jsxs(TableCell, { className: "text-right font-semibold", children: ["CA$", cost.cost_amount.toLocaleString()] }), _jsx(TableCell, { children: cost.year }), _jsx(TableCell, { children: cost.comments })] }, cost.id)))) })] }) })] })] }) }));
};
export default ConstructionCosts;
