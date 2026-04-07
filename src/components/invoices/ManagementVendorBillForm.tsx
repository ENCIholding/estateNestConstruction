import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Loader2, X } from "lucide-react";

type Vendor = {
  id: string;
  company_name?: string;
};

type Project = {
  id: string;
  project_name?: string;
};

type VendorBill = {
  id?: string;
  vendor_id: string;
  project_id: string;
  invoice_amount: string | number;
  due_date: string;
  invoice_year: string | number;
  status: "Received" | "Verified" | "Paid" | string;
  invoice_file: string;
};

type ManagementVendorBillFormProps = {
  bill?: Partial<VendorBill> | null;
  vendors: Vendor[];
  projects: Project[];
  open: boolean;
  onClose: () => void;
  onSaved: () => void;
};

async function uploadFile(file: File): Promise<{ file_url: string }> {
  const formData = new FormData();
  formData.append("file", file);

  const response = await fetch("/api/management/upload", {
    method: "POST",
    credentials: "include",
    body: formData,
  });

  if (!response.ok) {
    throw new Error("Upload failed");
  }

  return response.json();
}

async function fetchJson(url: string, options: RequestInit = {}): Promise<any> {
  const response = await fetch(url, {
    credentials: "include",
    headers: {
      ...(options.body instanceof FormData ? {} : { "Content-Type": "application/json" }),
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

export default function ManagementVendorBillForm({
  bill,
  vendors,
  projects,
  open,
  onClose,
  onSaved,
}: ManagementVendorBillFormProps) {
  const [formData, setFormData] = useState<VendorBill>(
    bill
      ? {
          id: bill.id,
          vendor_id: bill.vendor_id || "",
          project_id: bill.project_id || "",
          invoice_amount:
            bill.invoice_amount !== undefined && bill.invoice_amount !== null
              ? bill.invoice_amount
              : "",
          due_date: bill.due_date || "",
          invoice_year:
            bill.invoice_year !== undefined && bill.invoice_year !== null
              ? bill.invoice_year
              : "",
          status: bill.status || "Received",
          invoice_file: bill.invoice_file || "",
        }
      : {
          vendor_id: "",
          project_id: "",
          invoice_amount: "",
          due_date: "",
          invoice_year: "",
          status: "Received",
          invoice_file: "",
        }
  );

  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);

  const handleChange = (field: keyof VendorBill, value: string) => {
    const updates: Partial<VendorBill> = { [field]: value };

    if (field === "due_date" && value) {
      updates.invoice_year = new Date(value).getFullYear();
    }

    setFormData((prev) => ({ ...prev, ...updates }));
  };

  const handleFileUpload = async (file?: File) => {
    if (!file) return;

    setUploading(true);
    try {
      const uploadResult = await uploadFile(file);
      handleChange("invoice_file", uploadResult.file_url);
    } catch (error) {
      console.error("Upload failed:", error);
      alert(error instanceof Error ? error.message : "Upload failed.");
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      const data = {
        ...formData,
        invoice_amount:
          formData.invoice_amount !== "" && formData.invoice_amount !== null
            ? parseFloat(String(formData.invoice_amount))
            : null,
        invoice_year:
          formData.invoice_year !== "" && formData.invoice_year !== null
            ? parseInt(String(formData.invoice_year), 10)
            : null,
      };

      if (bill?.id) {
        await fetchJson(`/api/management/vendor-bills/${bill.id}`, {
          method: "PATCH",
          body: JSON.stringify(data),
        });
      } else {
        await fetchJson(`/api/management/vendor-bills`, {
          method: "POST",
          body: JSON.stringify(data),
        });
      }

      onSaved();
      onClose();
    } catch (error) {
      console.error("Save failed:", error);
      alert(error instanceof Error ? error.message : "Failed to save vendor bill.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{bill ? "Edit Bill" : "Add Bill"}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Vendor */}
          <div>
            <Label>Vendor *</Label>
            <select
              value={formData.vendor_id}
              onChange={(e) => handleChange("vendor_id", e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-md"
              required
            >
              <option value="">-- Select a vendor --</option>
              {vendors.map((vendor) => (
                <option key={vendor.id} value={vendor.id}>
                  {vendor.company_name || "Unnamed Vendor"}
                </option>
              ))}
            </select>
          </div>

          {/* Project */}
          <div>
            <Label>Project *</Label>
            <select
              value={formData.project_id}
              onChange={(e) => handleChange("project_id", e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-md"
              required
            >
              <option value="">-- Select a project --</option>
              {projects.map((project) => (
                <option key={project.id} value={project.id}>
                  {project.project_name || "Unnamed Project"}
                </option>
              ))}
            </select>
          </div>

          {/* Invoice Amount */}
          <div>
            <Label>Invoice Amount *</Label>
            <Input
              type="number"
              value={formData.invoice_amount}
              onChange={(e) => handleChange("invoice_amount", e.target.value)}
              required
            />
          </div>

          {/* Due Date */}
          <div>
            <Label>Due Date</Label>
            <Input
              type="date"
              value={formData.due_date}
              onChange={(e) => handleChange("due_date", e.target.value)}
            />
          </div>

          {/* Invoice Year */}
          <div>
            <Label>Invoice Year</Label>
            <Input
              type="number"
              value={formData.invoice_year}
              onChange={(e) => handleChange("invoice_year", e.target.value)}
            />
          </div>

          {/* Status */}
          <div>
            <Label>Status</Label>
            <select
              value={formData.status}
              onChange={(e) => handleChange("status", e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-md"
            >
              <option value="Received">Received</option>
              <option value="Verified">Verified</option>
              <option value="Paid">Paid</option>
            </select>
          </div>

          {/* Invoice File */}
          <div>
            <Label>Invoice File</Label>
            {formData.invoice_file ? (
              <div className="flex items-center gap-2">
                <a
                  href={formData.invoice_file}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:underline"
                >
                  View File
                </a>
                <button
                  type="button"
                  onClick={() => handleChange("invoice_file", "")}
                  className="text-red-600 hover:text-red-800"
                >
                  <X size={16} />
                </button>
              </div>
            ) : (
              <div>
                <input
                  type="file"
                  onChange={(e) => handleFileUpload(e.target.files?.[0])}
                  disabled={uploading}
                />
                {uploading && (
                  <div className="flex items-center gap-2 mt-2">
                    <Loader2 size={16} className="animate-spin" />
                    <span>Uploading...</span>
                  </div>
                )}
              </div>
            )}
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={saving}>
              {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {bill ? "Update" : "Add"} Bill
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
