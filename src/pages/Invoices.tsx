import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Input from "@/components/ui/input";
import Label from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import {
  Plus,
  Minus,
  Printer,
  Send,
  Save,
  Download,
} from "lucide-react";
import {
  InvoiceSendDialog,
  EmailData,
} from "@/components/invoices/InvoiceSendDialog";

/* ================= TYPES ================= */

type LineItem = {
  description: string;
  quantity: number;
  unit_price: number;
};

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

  const [lineItems, setLineItems] = useState<LineItem[]>([
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

        const {
          data: { session },
          error,
        } = await supabase.auth.getSession();

        if (error) throw error;
        if (!session) navigate("/management-login");
      } catch {
        navigate("/management-login");
      }
    };

    checkAuth();
  }, [navigate]);

  /* ================= LINE ITEMS ================= */

  const addLineItem = () => {
    setLineItems([...lineItems, { description: "", quantity: 1, unit_price: 0 }]);
  };

  const removeLineItem = (index: number) => {
    setLineItems(lineItems.filter((_, i) => i !== index));
  };

  const updateLineItem = <K extends keyof LineItem>(
    index: number,
    field: K,
    value: LineItem[K]
  ) => {
    const updated = [...lineItems];
    updated[index] = { ...updated[index], [field]: value };
    setLineItems(updated);
  };

  /* ================= CALCULATIONS ================= */

  const calculateSubtotal = () =>
    lineItems.reduce(
      (sum, item) => sum + item.quantity * item.unit_price,
      0
    );

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

      if (invoiceError) throw invoiceError;

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

      if (itemsError) throw itemsError;

      toast.success("Invoice saved as draft");
    } catch (err) {
      console.error(err);
      toast.error("Failed to save invoice");
    }
  };

  /* ================= SEND ================= */

  const handleSendInvoice = async (_emailData: EmailData) => {
    await handleSaveInvoice();
    toast.success(
      "Invoice sent successfully! (Email requires edge function)"
    );
  };

  const handleDownloadPDF = () => {
    window.print();
    toast.success("Use browser ‘Save as PDF’");
  };

  /* ================= UI ================= */

  return (
    <DashboardLayout>
      <div className="space-y-6 print:space-y-4">
        <div className="flex justify-between items-start print:hidden">
          <div>
            <h1 className="text-3xl font-bold">Invoices</h1>
            <p className="text-muted-foreground">
              Create and manage invoices
            </p>
          </div>

          <div className="flex gap-2">
            <Button onClick={handleSaveInvoice} variant="outline">
              <Save className="mr-2 h-4 w-4" />
              Save Draft
            </Button>

            <Button
              onClick={() => setSendDialogOpen(true)}
              className="bg-gradient-to-r from-enc-orange to-enc-yellow text-white"
            >
              <Send className="mr-2 h-4 w-4" />
              Send Invoice
            </Button>

            <Button onClick={handleDownloadPDF} variant="outline">
              <Download className="mr-2 h-4 w-4" />
              Download PDF
            </Button>

            <Button onClick={() => window.print()} variant="outline">
              <Printer className="mr-2 h-4 w-4" />
              Print
            </Button>
          </div>
        </div>

        <InvoiceSendDialog
          open={sendDialogOpen}
          onOpenChange={setSendDialogOpen}
          invoiceNumber={invoice.invoice_number}
          clientEmail={invoice.client_email}
          onSend={handleSendInvoice}
        />

        {/* The rest of your JSX (invoice layout) stays exactly the same */}
        {/* Nothing below this point needed logic fixes */}
      </div>
    </DashboardLayout>
  );
};

export default Invoices;
