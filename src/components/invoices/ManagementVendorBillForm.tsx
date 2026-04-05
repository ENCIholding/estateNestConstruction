import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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

async function fetchJson(url: string, options: RequestInit = {}) {
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

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
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
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>{bill ? "Edit Bill" : "Add Bill"}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid sm:grid-cols-2 gap-4">
            <div className="space-y-2 sm:col-span-2">
              <Label>Vendor *</Label>
              <Select
                value={formData.vendor_id}
                onValueChange={(value) => handleChange("vendor_id", value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select vendor" />
                </SelectTrigger>
                <SelectContent>
                  {vendors.map((vendor) => (
                    <SelectItem key={vendor.id} value={vendor.id}>
                      {vendor.company_name || "Unnamed Vendor"}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2 sm:col-span-2">
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
              <Label>Invoice Amount *</Label>
              <Input
                type="number"
                value={formData.invoice_amount}
                onChange={(e) => handleChange("invoice_amount", e.target.value)}
                required
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
              <Label>Invoice Year</Label>
              <Input
                type="number"
                value={formData.invoice_year}
                onChange={(e) => handleChange("invoice_year", e.target.value)}
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
                  <SelectItem value="Received">Received</SelectItem>
                  <SelectItem value="Verified">Verified</SelectItem>
                  <SelectItem value="Paid">Paid</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2 sm:col-span-2">
              <Label>Invoice File</Label>

              {formData.invoice_file ? (
                <div className="flex items-center gap-2 p-2 bg-slate-50 rounded-lg">
                  <a
                    href={formData.invoice_file}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-blue-600 hover:underline truncate flex-1"
                  >
                    View File
                  </a>

                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => handleChange("invoice_file", "")}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ) : (
                <div className="relative">
                  <Input
                    type="file"
                    accept=".pdf,.jpg,.jpeg,.png"
                    onChange={(e) => handleFileUpload(e.target.files?.[0])}
                    disabled={uploading}
                  />

                  {uploading && (
                    <div className="absolute inset-0 flex items-center justify-center bg-white/80">
                      <Loader2 className="h-4 w-4 animate-spin" />
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>

            <Button type="submit" disabled={saving}>
              {saving && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              {bill ? "Update" : "Add"} Bill
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
