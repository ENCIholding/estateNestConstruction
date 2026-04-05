import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Loader2, Plus, X } from "lucide-react";

type Project = {
  id: string;
  project_name?: string;
};

type InvoiceLineItem = {
  description: string;
  quantity: number;
  rate: number;
  amount: number;
};

type ClientInvoice = {
  id?: string;
  project_id: string;
  client_name: string;
  invoice_date: string;
  due_date: string;
  gst_number: string;
  line_items: InvoiceLineItem[];
  total_amount: number;
  status: "Draft" | "Sent" | "Paid" | "Overdue" | string;
  banking_details: string;
  etransfer_email: string;
  special_instructions: string;
};

type ManagementClientInvoiceFormProps = {
  invoice?: Partial<ClientInvoice> | null;
  projects: Project[];
  open: boolean;
  onClose: () => void;
  onSaved: () => void;
};

async function fetchJson(url: string, options: RequestInit = {}) {
  const response = await fetch(url, {
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      ...(options.headers || {}),
    },
    ...options,
  });

  if (!response.ok) {
    let message = "Request failed";
    try {
      const errorData = await response.json();
      message = errorData?.error || message;
    } catch {
      message = `${response.status} ${response.statusText}`;
    }
    throw new Error(message);
  }

  return response.json();
}

export default function ManagementClientInvoiceForm({
  invoice,
  projects,
  open,
  onClose,
  onSaved,
}: ManagementClientInvoiceFormProps) {
  const [formData, setFormData] = useState<ClientInvoice>(
    invoice
      ? {
          id: invoice.id,
          project_id: invoice.project_id || "",
          client_name: invoice.client_name || "",
          invoice_date: invoice.invoice_date || "",
          due_date: invoice.due_date || "",
          gst_number: invoice.gst_number || "",
          line_items:
            invoice.line_items && invoice.line_items.length > 0
              ? invoice.line_items
              : [{ description: "", quantity: 1, rate: 0, amount: 0 }],
          total_amount: invoice.total_amount || 0,
          status: invoice.status || "Draft",
          banking_details: invoice.banking_details || "",
          etransfer_email: invoice.etransfer_email || "",
          special_instructions: invoice.special_instructions || "",
        }
      : {
          project_id: "",
          client_name: "",
          invoice_date: "",
          due_date: "",
          gst_number: "",
          line_items: [{ description: "", quantity: 1, rate: 0, amount: 0 }],
          total_amount: 0,
          status: "Draft",
          banking_details: "",
          etransfer_email: "",
          special_instructions: "",
        }
  );

  const [saving, setSaving] = useState(false);

  const handleChange = (field: keyof ClientInvoice, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleLineItemChange = (
    index: number,
    field: keyof InvoiceLineItem,
    value: string | number
  ) => {
    const newItems = [...formData.line_items];
    const updatedItem = { ...newItems[index], [field]: value };

    if (field === "quantity" || field === "rate") {
      const quantity = Number(field === "quantity" ? value : updatedItem.quantity) || 0;
      const rate = Number(field === "rate" ? value : updatedItem.rate) || 0;
      updatedItem.amount = quantity * rate;
    }

    newItems[index] = updatedItem;

    const total = newItems.reduce((sum, item) => sum + (Number(item.amount) || 0), 0);

    setFormData((prev) => ({
      ...prev,
      line_items: newItems,
      total_amount: total,
    }));
  };

  const addLineItem = () => {
    setFormData((prev) => ({
      ...prev,
      line_items: [
        ...prev.line_items,
        { description: "", quantity: 1, rate: 0, amount: 0 },
      ],
    }));
  };

  const removeLineItem = (index: number) => {
    const newItems = formData.line_items.filter((_, i) => i !== index);
    const total = newItems.reduce((sum, item) => sum + (Number(item.amount) || 0), 0);

    setFormData((prev) => ({
      ...prev,
      line_items: newItems.length > 0 ? newItems : [{ description: "", quantity: 1, rate: 0, amount: 0 }],
      total_amount: newItems.length > 0 ? total : 0,
    }));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSaving(true);

    try {
      if (invoice?.id) {
        await fetchJson(`/api/management/client-invoices/${invoice.id}`, {
          method: "PATCH",
          body: JSON.stringify(formData),
        });
      } else {
        await fetchJson(`/api/management/client-invoices`, {
          method: "POST",
          body: JSON.stringify(formData),
        });
      }

      onSaved();
      onClose();
    } catch (error) {
      console.error("Save failed:", error);
      alert(error instanceof Error ? error.message : "Failed to save invoice.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{invoice ? "Edit Invoice" : "New Invoice"}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Project *</Label>
              <Select
                value={formData.project_id}
                onValueChange={(value) => handleChange("project_id", value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select project" />
                </SelectTrigger>
                <SelectContent>
                  {projects.map((project) => (
                    <SelectItem key={project.id} value={project.id}>
                      {project.project_name || "Unnamed Project"}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Client Name *</Label>
              <Input
                value={formData.client_name}
                onChange={(e) => handleChange("client_name", e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label>Invoice Date</Label>
              <Input
                type="date"
                value={formData.invoice_date}
                onChange={(e) => handleChange("invoice_date", e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label>Due Date</Label>
              <Input
                type="date"
                value={formData.due_date}
                onChange={(e) => handleChange("due_date", e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label>GST Number</Label>
              <Input
                value={formData.gst_number}
                onChange={(e) => handleChange("gst_number", e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label>Status</Label>
              <Select
                value={formData.status}
                onValueChange={(value) => handleChange("status", value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Draft">Draft</SelectItem>
                  <SelectItem value="Sent">Sent</SelectItem>
                  <SelectItem value="Paid">Paid</SelectItem>
                  <SelectItem value="Overdue">Overdue</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label>Line Items</Label>
              <Button type="button" size="sm" variant="outline" onClick={addLineItem}>
                <Plus className="h-4 w-4 mr-1" />
                Add Line
              </Button>
            </div>

            {formData.line_items.map((item, index) => (
              <div key={index} className="grid grid-cols-12 gap-2 p-3 border rounded-lg">
                <Input
                  placeholder="Description"
                  className="col-span-5"
                  value={item.description}
                  onChange={(e) =>
                    handleLineItemChange(index, "description", e.target.value)
                  }
                />
                <Input
                  type="number"
                  placeholder="Qty"
                  className="col-span-2"
                  value={item.quantity}
                  onChange={(e) =>
                    handleLineItemChange(index, "quantity", parseFloat(e.target.value || "0"))
                  }
                />
                <Input
                  type="number"
                  placeholder="Rate"
                  className="col-span-2"
                  value={item.rate}
                  onChange={(e) =>
                    handleLineItemChange(index, "rate", parseFloat(e.target.value || "0"))
                  }
                />
                <Input
                  type="number"
                  placeholder="Amount"
                  className="col-span-2"
                  value={item.amount}
                  disabled
                />
                <Button
                  type="button"
                  size="icon"
                  variant="ghost"
                  className="col-span-1"
                  onClick={() => removeLineItem(index)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ))}

            <div className="text-right">
              <p className="text-lg font-bold">
                Total: ${formData.total_amount.toLocaleString()}
              </p>
            </div>
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Banking Details</Label>
              <Textarea
                value={formData.banking_details}
                onChange={(e) => handleChange("banking_details", e.target.value)}
                rows={3}
              />
            </div>

            <div className="space-y-2">
              <Label>E-Transfer Email</Label>
              <Input
                type="email"
                value={formData.etransfer_email}
                onChange={(e) => handleChange("etransfer_email", e.target.value)}
              />
            </div>

            <div className="space-y-2 sm:col-span-2">
              <Label>Special Instructions</Label>
              <Textarea
                value={formData.special_instructions}
                onChange={(e) => handleChange("special_instructions", e.target.value)}
                rows={2}
              />
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>

            <Button type="submit" disabled={saving}>
              {saving && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              {invoice ? "Update" : "Create"} Invoice
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
