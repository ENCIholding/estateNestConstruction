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
import { toast } from "sonner";
import { Plus, Calendar } from "lucide-react";
/* ================= COMPONENT ================= */
const TaxRecords = () => {
    const navigate = useNavigate();
    const [records, setRecords] = useState([]);
    const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
    const [newRecord, setNewRecord] = useState({
        fiscal_year: new Date().getFullYear(),
        accountant_name: "",
        accountant_phone: "",
        accountant_email: "",
        cra_tax_paid: "",
        cra_tax_year: new Date().getFullYear(),
        gst_paid: "",
        gst_year: new Date().getFullYear(),
        year_end_date: "",
        filing_deadline: "",
        notes: "",
    });
    /* ================= DATA ================= */
    const fetchRecords = async () => {
        if (!supabase)
            return;
        try {
            const { data, error } = await supabase
                .from("tax_records")
                .select("*")
                .order("fiscal_year", { ascending: false });
            if (error)
                throw error;
            if (data)
                setRecords(data);
        }
        catch (err) {
            console.error("Failed to fetch tax records:", err);
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
                    fetchRecords();
                }
            }
            catch {
                navigate("/management-login");
            }
        };
        checkAuth();
    }, [navigate]);
    /* ================= ACTIONS ================= */
    const handleAddRecord = async () => {
        if (!supabase) {
            toast.error("Backend not configured");
            return;
        }
        if (!newRecord.accountant_name || !newRecord.fiscal_year) {
            toast.error("Please fill in required fields");
            return;
        }
        try {
            const row = {
                fiscal_year: Number(newRecord.fiscal_year),
                accountant_name: newRecord.accountant_name,
                accountant_phone: newRecord.accountant_phone || "",
                accountant_email: newRecord.accountant_email || "",
                cra_tax_paid: newRecord.cra_tax_paid
                    ? Number(newRecord.cra_tax_paid)
                    : null,
                cra_tax_year: Number(newRecord.cra_tax_year),
                gst_paid: newRecord.gst_paid ? Number(newRecord.gst_paid) : null,
                gst_year: Number(newRecord.gst_year),
                year_end_date: newRecord.year_end_date || null,
                filing_deadline: newRecord.filing_deadline || null,
                notes: newRecord.notes || "",
            };
            const { error } = await supabase
                .from("tax_records")
                .insert([row]); // ✅ MUST be array
            if (error)
                throw error;
            toast.success("Tax record added successfully");
            setIsAddDialogOpen(false);
            setNewRecord({
                fiscal_year: new Date().getFullYear(),
                accountant_name: "",
                accountant_phone: "",
                accountant_email: "",
                cra_tax_paid: "",
                cra_tax_year: new Date().getFullYear(),
                gst_paid: "",
                gst_year: new Date().getFullYear(),
                year_end_date: "",
                filing_deadline: "",
                notes: "",
            });
            fetchRecords();
        }
        catch (err) {
            console.error(err);
            toast.error("Failed to add tax record");
        }
    };
    /* ================= UI ================= */
    return (_jsx(DashboardLayout, { children: _jsxs("div", { className: "space-y-6", children: [_jsxs("div", { className: "flex justify-between items-start", children: [_jsxs("div", { children: [_jsx("h1", { className: "text-3xl font-bold", children: "Tax Records" }), _jsx("p", { className: "text-muted-foreground", children: "Manage tax filings and accountant information" })] }), _jsxs(Dialog, { open: isAddDialogOpen, onOpenChange: setIsAddDialogOpen, children: [_jsx(DialogTrigger, { asChild: true, children: _jsxs(Button, { children: [_jsx(Plus, { className: "mr-2 h-4 w-4" }), "Add Tax Record"] }) }), _jsxs(DialogContent, { className: "max-w-2xl max-h-[90vh] overflow-y-auto", children: [_jsx(DialogHeader, { children: _jsx(DialogTitle, { children: "Add New Tax Record" }) }), _jsxs("div", { className: "grid grid-cols-2 gap-4", children: [_jsxs("div", { className: "space-y-2", children: [_jsx(Label, { children: "Fiscal Year *" }), _jsx(Input, { type: "number", value: newRecord.fiscal_year, onChange: (e) => setNewRecord({
                                                                ...newRecord,
                                                                fiscal_year: Number(e.target.value),
                                                            }) })] }), _jsxs("div", { className: "space-y-2", children: [_jsx(Label, { children: "Accountant Name *" }), _jsx(Input, { value: newRecord.accountant_name, onChange: (e) => setNewRecord({
                                                                ...newRecord,
                                                                accountant_name: e.target.value,
                                                            }) })] }), _jsxs("div", { className: "space-y-2", children: [_jsx(Label, { children: "Accountant Phone" }), _jsx(Input, { value: newRecord.accountant_phone, onChange: (e) => setNewRecord({
                                                                ...newRecord,
                                                                accountant_phone: e.target.value,
                                                            }) })] }), _jsxs("div", { className: "space-y-2", children: [_jsx(Label, { children: "Accountant Email" }), _jsx(Input, { type: "email", value: newRecord.accountant_email, onChange: (e) => setNewRecord({
                                                                ...newRecord,
                                                                accountant_email: e.target.value,
                                                            }) })] }), _jsxs("div", { className: "space-y-2", children: [_jsx(Label, { children: "CRA Tax Paid (CAD)" }), _jsx(Input, { type: "number", step: "0.01", value: newRecord.cra_tax_paid, onChange: (e) => setNewRecord({
                                                                ...newRecord,
                                                                cra_tax_paid: e.target.value,
                                                            }) })] }), _jsxs("div", { className: "space-y-2", children: [_jsx(Label, { children: "CRA Tax Year" }), _jsx(Input, { type: "number", value: newRecord.cra_tax_year, onChange: (e) => setNewRecord({
                                                                ...newRecord,
                                                                cra_tax_year: Number(e.target.value),
                                                            }) })] }), _jsxs("div", { className: "space-y-2", children: [_jsx(Label, { children: "GST Paid (CAD)" }), _jsx(Input, { type: "number", step: "0.01", value: newRecord.gst_paid, onChange: (e) => setNewRecord({
                                                                ...newRecord,
                                                                gst_paid: e.target.value,
                                                            }) })] }), _jsxs("div", { className: "space-y-2", children: [_jsx(Label, { children: "GST Year" }), _jsx(Input, { type: "number", value: newRecord.gst_year, onChange: (e) => setNewRecord({
                                                                ...newRecord,
                                                                gst_year: Number(e.target.value),
                                                            }) })] }), _jsxs("div", { className: "space-y-2", children: [_jsx(Label, { children: "Year-End Date" }), _jsx(Input, { type: "date", value: newRecord.year_end_date, onChange: (e) => setNewRecord({
                                                                ...newRecord,
                                                                year_end_date: e.target.value,
                                                            }) })] }), _jsxs("div", { className: "space-y-2", children: [_jsx(Label, { children: "Filing Deadline" }), _jsx(Input, { type: "date", value: newRecord.filing_deadline, onChange: (e) => setNewRecord({
                                                                ...newRecord,
                                                                filing_deadline: e.target.value,
                                                            }) })] }), _jsxs("div", { className: "space-y-2 col-span-2", children: [_jsx(Label, { children: "Notes" }), _jsx(Textarea, { rows: 3, value: newRecord.notes, onChange: (e) => setNewRecord({
                                                                ...newRecord,
                                                                notes: e.target.value,
                                                            }) })] })] }), _jsx(Button, { onClick: handleAddRecord, className: "w-full", children: "Add Tax Record" })] })] })] }), records.length === 0 ? (_jsx(Card, { children: _jsx(CardContent, { className: "py-12 text-center text-muted-foreground", children: "No tax records found" }) })) : (_jsx("div", { className: "grid gap-6", children: records.map((record) => (_jsxs(Card, { children: [_jsx(CardHeader, { children: _jsxs("div", { className: "flex items-start justify-between", children: [_jsxs(CardTitle, { children: ["Fiscal Year ", record.fiscal_year ?? "N/A"] }), record.filing_deadline && (_jsxs("div", { className: "flex items-center gap-1 text-sm text-muted-foreground", children: [_jsx(Calendar, { className: "h-4 w-4" }), "Filing:", " ", new Date(record.filing_deadline).toLocaleDateString()] }))] }) }), _jsx(CardContent, { children: _jsxs("div", { className: "grid grid-cols-1 md:grid-cols-3 gap-6", children: [_jsxs("div", { children: [_jsx("h3", { className: "font-semibold text-sm mb-2 bg-gradient-to-r from-amber-600 to-orange-600 bg-clip-text text-transparent", children: "Accountant Information" }), _jsxs("dl", { className: "space-y-1 text-sm", children: [_jsxs("div", { children: [_jsx("dt", { className: "text-muted-foreground inline", children: "Name:" }), _jsx("dd", { className: "inline ml-2", children: record.accountant_name })] }), _jsxs("div", { children: [_jsx("dt", { className: "text-muted-foreground inline", children: "Phone:" }), _jsx("dd", { className: "inline ml-2", children: record.accountant_phone || "N/A" })] }), _jsxs("div", { children: [_jsx("dt", { className: "text-muted-foreground inline", children: "Email:" }), _jsx("dd", { className: "inline ml-2", children: record.accountant_email || "N/A" })] })] })] }), _jsxs("div", { children: [_jsx("h3", { className: "font-semibold text-sm mb-2 bg-gradient-to-r from-amber-600 to-orange-600 bg-clip-text text-transparent", children: "Tax Payments" }), _jsxs("dl", { className: "space-y-1 text-sm", children: [_jsxs("div", { children: [_jsx("dt", { className: "text-muted-foreground inline", children: "CRA Tax:" }), _jsx("dd", { className: "inline ml-2 font-semibold", children: record.cra_tax_paid !== null
                                                                        ? `CA$${record.cra_tax_paid.toLocaleString()}`
                                                                        : "N/A" })] }), _jsxs("div", { children: [_jsx("dt", { className: "text-muted-foreground inline", children: "Tax Year:" }), _jsx("dd", { className: "inline ml-2", children: record.cra_tax_year ?? "N/A" })] }), _jsxs("div", { children: [_jsx("dt", { className: "text-muted-foreground inline", children: "GST Paid:" }), _jsx("dd", { className: "inline ml-2 font-semibold", children: record.gst_paid !== null
                                                                        ? `CA$${record.gst_paid.toLocaleString()}`
                                                                        : "N/A" })] }), _jsxs("div", { children: [_jsx("dt", { className: "text-muted-foreground inline", children: "GST Year:" }), _jsx("dd", { className: "inline ml-2", children: record.gst_year ?? "N/A" })] })] })] }), _jsxs("div", { children: [_jsx("h3", { className: "font-semibold text-sm mb-2 bg-gradient-to-r from-amber-600 to-orange-600 bg-clip-text text-transparent", children: "Key Dates" }), _jsxs("dl", { className: "space-y-1 text-sm", children: [_jsxs("div", { children: [_jsx("dt", { className: "text-muted-foreground inline", children: "Year-End:" }), _jsx("dd", { className: "inline ml-2", children: record.year_end_date
                                                                        ? new Date(record.year_end_date).toLocaleDateString()
                                                                        : "N/A" })] }), _jsxs("div", { children: [_jsx("dt", { className: "text-muted-foreground inline", children: "Deadline:" }), _jsx("dd", { className: "inline ml-2", children: record.filing_deadline
                                                                        ? new Date(record.filing_deadline).toLocaleDateString()
                                                                        : "N/A" })] })] })] }), record.notes && (_jsxs("div", { className: "col-span-full", children: [_jsx("h3", { className: "font-semibold text-sm mb-2 bg-gradient-to-r from-amber-600 to-orange-600 bg-clip-text text-transparent", children: "Notes" }), _jsx("p", { className: "text-sm", children: record.notes })] }))] }) })] }, record.id))) }))] }) }));
};
export default TaxRecords;
