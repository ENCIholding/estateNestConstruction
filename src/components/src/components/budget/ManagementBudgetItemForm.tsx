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
import { Loader2, X } from "lucide-react";

const CATEGORIES = [
  "Land Acquisition",
  "Permits & Fees",
  "Architectural & Engineering",
  "Site Preparation",
  "Foundation",
  "Framing",
  "Roofing",
  "Exterior Finishes",
  "Windows & Doors",
  "Plumbing",
  "Electrical",
  "HVAC",
  "Insulation",
  "Drywall",
  "Interior Finishes",
  "Flooring",
  "Cabinets & Countertops",
  "Painting",
  "Appliances",
  "Landscaping",
  "Utilities Connection",
  "Cleanup",
  "Contingency",
  "Other",
];

async function uploadFile(file: File): Promise<{ file_url: string }> {
  const formData = new FormData();
  formData.append("file", file);

  const res = await fetch("/api/management/upload", {
    method: "POST",
    body: formData,
  });

  if (!res.ok) throw new Error("Upload failed");
  return res.json();
}

export default function ManagementBudgetItemForm({
  item,
  projects,
  vendors,
  open,
  onClose,
  onSaved,
  defaultProjectId,
}: any) {
  const [formData, setFormData] = useState(
    item || {
      project_id: defaultProjectId || "",
      vendor_id: "",
      category_name: "",
      description: "",
      estimated_cost: "",
      actual_cost: "",
      invoice_status: "Pending",
      payment_due_date: "",
      invoice_number: "",
      invoice_file: "",
    }
  );

  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);

  const handleChange = (field: string, value: any) => {
    setFormData((prev: any) => ({ ...prev, [field]: value }));
  };

  const handleFileUpload = async (file?: File) => {
    if (!file) return;

    setUploading(true);
    try {
      const { file_url } = await uploadFile(file);
      handleChange("invoice_file", file_url);
    } catch (e) {
      console.error("Upload failed:", e);
    }
    setUploading(false);
  };

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    setSaving(true);

    try {
      const data = {
        ...formData,
        estimated_cost: formData.estimated_cost
          ? parseFloat(formData.estimated_cost)
          : null,
        actual_cost: formData.actual_cost
          ? parseFloat(formData.actual_cost)
          : null,
      };

      if (item?.id) {
        await fetch(`/api/management/budget-items/${item.id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(data),
        });
      } else {
        await fetch(`/api/management/budget-items`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(data),
        });
      }

      onSaved();
      onClose();
    } catch (e) {
      console.error("Save failed:", e);
    }

    setSaving(false);
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>
            {item ? "Edit Cost Item" : "Add Cost Item"}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid sm:grid-cols-2 gap-4">

            {/* PROJECT */}
            <div className="space-y-2">
              <Label>Project *</Label>
              <Select
                value={formData.project_id}
                onValueChange={(v) => handleChange("project_id", v)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select project" />
                </SelectTrigger>
                <SelectContent>
                  {projects.map((p: any) => (
                    <SelectItem key={p.id} value={p.id}>
                      {p.project_name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* VENDOR */}
            <div className="space-y-2">
              <Label>Vendor</Label>
              <Select
                value={formData.vendor_id || ""}
                onValueChange={(v) => handleChange("vendor_id", v)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select vendor" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">No vendor</SelectItem>
                  {vendors.map((v: any) => (
                    <SelectItem key={v.id} value={v.id}>
                      {v.company_name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* CATEGORY */}
            <div className="space-y-2 sm:col-span-2">
              <Label>Category *</Label>
              <Select
                value={formData.category_name}
                onValueChange={(v) => handleChange("category_name", v)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {CATEGORIES.map((c) => (
                    <SelectItem key={c} value={c}>
                      {c}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* DESCRIPTION */}
            <div className="space-y-2 sm:col-span-2">
              <Label>Description</Label>
              <Textarea
                value={formData.description}
                onChange={(e) =>
                  handleChange("description", e.target.value)
                }
              />
            </div>

            {/* COSTS */}
            <Input
              type="number"
              placeholder="Estimated"
              value={formData.estimated_cost}
              onChange={(e) =>
                handleChange("estimated_cost", e.target.value)
              }
            />

            <Input
              type="number"
              placeholder="Actual"
              value={formData.actual_cost}
              onChange={(e) =>
                handleChange("actual_cost", e.target.value)
              }
            />

            {/* STATUS */}
            <Select
              value={formData.invoice_status}
              onValueChange={(v) => handleChange("invoice_status", v)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Pending">Pending</SelectItem>
                <SelectItem value="Paid">Paid</SelectItem>
                <SelectItem value="Holdback">Holdback</SelectItem>
              </SelectContent>
            </Select>

            {/* DATE */}
            <Input
              type="date"
              value={formData.payment_due_date}
              onChange={(e) =>
                handleChange("payment_due_date", e.target.value)
              }
            />

            {/* FILE */}
            <div className="space-y-2 sm:col-span-2">
              <Label>Invoice File</Label>

              {formData.invoice_file ? (
                <div className="flex gap-2">
                  <a href={formData.invoice_file} target="_blank">
                    View
                  </a>
                  <Button
                    type="button"
                    onClick={() => handleChange("invoice_file", "")}
                  >
                    <X />
                  </Button>
                </div>
              ) : (
                <Input
                  type="file"
                  onChange={(e) =>
                    handleFileUpload(e.target.files?.[0])
                  }
                />
              )}
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>

            <Button type="submit" disabled={saving}>
              {saving && <Loader2 className="mr-2 animate-spin" />}
              {item ? "Update" : "Add"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
