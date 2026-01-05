import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Printer, Send, Save, Download, } from "lucide-react";
import { InvoiceSendDialog, } from "@/components/invoices/InvoiceSendDialog";
/* ================= COMPONENT ================= */
const Invoices = () => {
    const navigate = useNavigate();
    const [sendDialogOpen, setSendDialogOpen] = useState(false);
    const [invoice, setInvoice] = useState(() => {
        const now = Date.now();
        const today = new Date().toISOString().split("T")[0];
        const due = new Date(now + 14 * 24 * 60 * 60 * 1000)
            .toISOString()
            .split("T")[0];
        return {
            invoice_number: `INV-${now}`,
            invoice_date: today,
            due_date: due,
            terms: "Net 14",
            client_name: "",
            client_company: "",
            client_address: "",
            client_email: "",
            client_phone: "",
            notes: "",
        };
    });
    const [lineItems, setLineItems] = useState([
        { description: "", quantity: 1, unit_price: 0 },
    ]);
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
                if (!session)
                    navigate("/management-login");
            }
            catch {
                navigate("/management-login");
            }
        };
        checkAuth();
    }, [navigate]);
    /* ================= LINE ITEMS ================= */
    const addLineItem = () => {
        setLineItems([...lineItems, { description: "", quantity: 1, unit_price: 0 }]);
    };
    const removeLineItem = (index) => {
        setLineItems(lineItems.filter((_, i) => i !== index));
    };
    const updateLineItem = (index, field, value) => {
        const updated = [...lineItems];
        updated[index] = { ...updated[index], [field]: value };
        setLineItems(updated);
    };
    /* ================= CALCULATIONS ================= */
    const calculateSubtotal = () => lineItems.reduce((sum, item) => sum + item.quantity * item.unit_price, 0);
    const calculateGST = () => calculateSubtotal() * 0.05;
    const calculateTotal = () => calculateSubtotal() + calculateGST();
    /* ================= SAVE ================= */
    const handleSaveInvoice = async () => {
        if (!supabase) {
            toast.error("Backend not configured");
            return;
        }
        if (!invoice.client_name) {
            toast.error("Client name is required");
            return;
        }
        try {
            const subtotal = calculateSubtotal();
            const gst = calculateGST();
            const total = calculateTotal();
            const { data: invoiceData, error: invoiceError } = await supabase
                .from("invoices")
                .insert([
                {
                    ...invoice,
                    subtotal,
                    gst_amount: gst,
                    total_amount: total,
                    status: "draft",
                },
            ])
                .select()
                .single();
            if (invoiceError)
                throw invoiceError;
            const itemsToInsert = lineItems.map((item) => ({
                invoice_id: invoiceData.id,
                description: item.description,
                quantity: item.quantity,
                unit_price: item.unit_price,
                line_total: item.quantity * item.unit_price,
            }));
            const { error: itemsError } = await supabase
                .from("invoice_items")
                .insert(itemsToInsert);
            if (itemsError)
                throw itemsError;
            toast.success("Invoice saved as draft");
        }
        catch (err) {
            console.error(err);
            toast.error("Failed to save invoice");
        }
    };
    /* ================= SEND ================= */
    const handleSendInvoice = async (_emailData) => {
        await handleSaveInvoice();
        toast.success("Invoice sent successfully! (Email requires edge function)");
    };
    const handleDownloadPDF = () => {
        window.print();
        toast.success("Use browser ‘Save as PDF’");
    };
    /* ================= UI ================= */
    return (_jsx(DashboardLayout, { children: _jsxs("div", { className: "space-y-6 print:space-y-4", children: [_jsxs("div", { className: "flex justify-between items-start print:hidden", children: [_jsxs("div", { children: [_jsx("h1", { className: "text-3xl font-bold", children: "Invoices" }), _jsx("p", { className: "text-muted-foreground", children: "Create and manage invoices" })] }), _jsxs("div", { className: "flex gap-2", children: [_jsxs(Button, { onClick: handleSaveInvoice, variant: "outline", children: [_jsx(Save, { className: "mr-2 h-4 w-4" }), "Save Draft"] }), _jsxs(Button, { onClick: () => setSendDialogOpen(true), className: "bg-gradient-to-r from-enc-orange to-enc-yellow text-white", children: [_jsx(Send, { className: "mr-2 h-4 w-4" }), "Send Invoice"] }), _jsxs(Button, { onClick: handleDownloadPDF, variant: "outline", children: [_jsx(Download, { className: "mr-2 h-4 w-4" }), "Download PDF"] }), _jsxs(Button, { onClick: () => window.print(), variant: "outline", children: [_jsx(Printer, { className: "mr-2 h-4 w-4" }), "Print"] })] })] }), _jsx(InvoiceSendDialog, { open: sendDialogOpen, onOpenChange: setSendDialogOpen, invoiceNumber: invoice.invoice_number, clientEmail: invoice.client_email, onSend: handleSendInvoice })] }) }));
};
export default Invoices;
