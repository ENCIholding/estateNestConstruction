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
import { Loader2 } from "lucide-react";

const TRADE_TYPES = [
  "Architect",
  "Engineer",
  "Excavation",
  "Foundation",
  "Framing",
  "Electrical",
  "Plumbing",
  "HVAC",
  "Insulation",
  "Drywall",
  "Painting",
  "Flooring",
  "Cabinets",
  "Countertops",
  "Finishing",
  "Roofing",
  "Siding",
  "Windows & Doors",
  "Landscaping",
  "Concrete",
  "Masonry",
  "General Labour",
  "Other",
];

type Vendor = {
  id?: string;
  company_name: string;
  trade_type: string;
  contact_person: string;
  phone: string;
  email: string;
  website: string;
  wcb_account_number: string;
  insurance_expiry_date: string;
  gst_number: string;
  notes: string;
  internal_notes: string;
  vendor_rating: string;
  work_again: boolean;
};

type ManagementVendorFormProps = {
  vendor?: Partial<Vendor> | null;
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

export default function ManagementVendorForm({
  vendor,
  open,
  onClose,
  onSaved,
}: ManagementVendorFormProps) {
  const [formData, setFormData] = useState<Vendor>(
    vendor
      ? {
          id: vendor.id,
          company_name: vendor.company_name || "",
          trade_type: vendor.trade_type || "",
          contact_person: vendor.contact_person || "",
          phone: vendor.phone || "",
          email: vendor.email || "",
          website: vendor.website || "",
          wcb_account_number: vendor.wcb_account_number || "",
          insurance_expiry_date: vendor.insurance_expiry_date || "",
          gst_number: vendor.gst_number || "",
          notes: vendor.notes || "",
          internal_notes: vendor.internal_notes || "",
          vendor_rating: vendor.vendor_rating || "",
          work_again:
            vendor.work_again !== undefined ? !!vendor.work_again : true,
        }
      : {
          company_name: "",
          trade_type: "",
          contact_person: "",
          phone: "",
          email: "",
          website: "",
          wcb_account_number: "",
          insurance_expiry_date: "",
          gst_number: "",
          notes: "",
          internal_notes: "",
          vendor_rating: "",
          work_again: true,
        }
  );

  const [saving, setSaving] = useState(false);

  const handleChange = (field: keyof Vendor, value: string | boolean) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSaving(true);

    try {
      if (vendor?.id) {
        await fetchJson(`/api/management/vendors/${vendor.id}`, {
          method: "PATCH",
          body: JSON.stringify(formData),
        });
      } else {
        await fetchJson(`/api/management/vendors`, {
          method: "POST",
          body: JSON.stringify(formData),
        });
      }

      onSaved();
      onClose();
    } catch (error) {
      console.error("Save failed:", error);
      alert(error instanceof Error ? error.message : "Failed to save vendor.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>{vendor ? "Edit Vendor" : "New Vendor"}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Company Name *</Label>
              <Input
                value={formData.company_name}
                onChange={(e) => handleChange("company_name", e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label>Trade Type *</Label>
              <Select
                value={formData.trade_type}
                onValueChange={(value) => handleChange("trade_type", value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select trade" />
                </SelectTrigger>
                <SelectContent>
                  {TRADE_TYPES.map((type) => (
                    <SelectItem key={type} value={type}>
                      {type}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Contact Person</Label>
              <Input
                value={formData.contact_person}
                onChange={(e) => handleChange("contact_person", e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label>Phone</Label>
              <Input
                value={formData.phone}
                onChange={(e) => handleChange("phone", e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label>Email</Label>
              <Input
                type="email"
                value={formData.email}
                onChange={(e) => handleChange("email", e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label>Website</Label>
              <Input
                value={formData.website}
                onChange={(e) => handleChange("website", e.target.value)}
                placeholder="https://..."
              />
            </div>
          </div>

          <div className="border-t pt-4 space-y-4">
            <h3 className="font-medium text-slate-900">Compliance Info</h3>

            <div className="grid sm:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label>WCB Account #</Label>
                <Input
                  value={formData.wcb_account_number}
                  onChange={(e) =>
                    handleChange("wcb_account_number", e.target.value)
                  }
                />
              </div>

              <div className="space-y-2">
                <Label>Insurance Expiry</Label>
                <Input
                  type="date"
                  value={formData.insurance_expiry_date}
                  onChange={(e) =>
                    handleChange("insurance_expiry_date", e.target.value)
                  }
                />
              </div>

              <div className="space-y-2">
                <Label>GST Number</Label>
                <Input
                  value={formData.gst_number}
                  onChange={(e) => handleChange("gst_number", e.target.value)}
                />
              </div>
            </div>
          </div>

          <div className="border-t pt-4 space-y-4">
            <h3 className="font-medium text-slate-900">Performance & Notes</h3>

            <div className="grid sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Vendor Rating</Label>
                <Select
                  value={formData.vendor_rating || "none"}
                  onValueChange={(value) =>
                    handleChange("vendor_rating", value === "none" ? "" : value)
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select rating" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">No rating</SelectItem>
                    <SelectItem value="Excellent">Excellent</SelectItem>
                    <SelectItem value="Good">Good</SelectItem>
                    <SelectItem value="Average">Average</SelectItem>
                    <SelectItem value="Poor">Poor</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Work Again?</Label>
                <Select
                  value={formData.work_again ? "yes" : "no"}
                  onValueChange={(value) =>
                    handleChange("work_again", value === "yes")
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="yes">Yes</SelectItem>
                    <SelectItem value="no">No</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Notes (Public)</Label>
              <Textarea
                value={formData.notes}
                onChange={(e) => handleChange("notes", e.target.value)}
                rows={2}
              />
            </div>

            <div className="space-y-2">
              <Label>Internal Notes (Private)</Label>
              <Textarea
                value={formData.internal_notes}
                onChange={(e) => handleChange("internal_notes", e.target.value)}
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
              {vendor ? "Update" : "Create"} Vendor
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
