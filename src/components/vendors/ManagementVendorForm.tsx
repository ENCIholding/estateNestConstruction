import React, { useEffect, useMemo, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Loader2 } from "lucide-react";

export type ManagementVendor = {
  id?: string;
  company_name?: string;
  trade_type?: string;
  contact_person?: string;
  phone?: string;
  email?: string;
  website?: string;
  wcb_account_number?: string;
  gst_number?: string;
  insurance_expiry_date?: string;
  notes?: string;
  vendor_rating?: string;
  work_again?: boolean;
  internal_notes?: string;
  status?: string;
};

type ManagementVendorFormProps = {
  open: boolean;
  onClose: () => void;
  onSaved: () => void;
  onSubmitRecord?: (vendor: ManagementVendor) => Promise<void>;
  vendor?: ManagementVendor | null;
};

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

const VENDOR_RATINGS = ["Excellent", "Good", "Average", "Poor"];

async function fetchJson<T>(url: string, options: RequestInit = {}): Promise<T> {
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

  if (response.status === 204) {
    return {} as T;
  }

  return response.json();
}

function normalizeDateInput(value?: string) {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return date.toISOString().slice(0, 10);
}

export default function ManagementVendorForm({
  open,
  onClose,
  onSaved,
  onSubmitRecord,
  vendor,
}: ManagementVendorFormProps) {
  const isEdit = useMemo(() => Boolean(vendor?.id), [vendor?.id]);

  const [form, setForm] = useState({
    company_name: "",
    trade_type: "",
    contact_person: "",
    phone: "",
    email: "",
    website: "",
    wcb_account_number: "",
    gst_number: "",
    insurance_expiry_date: "",
    notes: "",
    vendor_rating: "",
    work_again: true,
    internal_notes: "",
    status: "Active",
  });

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (open) {
      setForm({
        company_name: vendor?.company_name || "",
        trade_type: vendor?.trade_type || "",
        contact_person: vendor?.contact_person || "",
        phone: vendor?.phone || "",
        email: vendor?.email || "",
        website: vendor?.website || "",
        wcb_account_number: vendor?.wcb_account_number || "",
        gst_number: vendor?.gst_number || "",
        insurance_expiry_date: normalizeDateInput(
          vendor?.insurance_expiry_date
        ),
        notes: vendor?.notes || "",
        vendor_rating: vendor?.vendor_rating || "",
        work_again: vendor?.work_again ?? true,
        internal_notes: vendor?.internal_notes || "",
        status: vendor?.status || "Active",
      });
      setError("");
      setSaving(false);
    }
  }, [open, vendor]);

  const setField = <K extends keyof ManagementVendor>(
    key: K,
    value: ManagementVendor[K]
  ) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!form.company_name?.trim()) {
      setError("Company name is required.");
      return;
    }

    try {
      setSaving(true);

      const payload = {
        company_name: form.company_name?.trim() || null,
        trade_type: form.trade_type || null,
        contact_person: form.contact_person?.trim() || null,
        phone: form.phone?.trim() || null,
        email: form.email?.trim() || null,
        website: form.website?.trim() || null,
        wcb_account_number: form.wcb_account_number?.trim() || null,
        gst_number: form.gst_number?.trim() || null,
        insurance_expiry_date: form.insurance_expiry_date || null,
        notes: form.notes?.trim() || null,
        vendor_rating: form.vendor_rating || null,
        work_again: Boolean(form.work_again),
        internal_notes: form.internal_notes?.trim() || null,
        status: form.status || "Active",
      };

      if (onSubmitRecord) {
        await onSubmitRecord({
          ...payload,
          id: vendor?.id,
        });
      } else if (isEdit && vendor?.id) {
        await fetchJson(`/api/management/vendors/${vendor.id}`, {
          method: "PUT",
          body: JSON.stringify(payload),
        });
      } else {
        await fetchJson("/api/management/vendors", {
          method: "POST",
          body: JSON.stringify(payload),
        });
      }

      onSaved();
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save vendor.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(nextOpen) => {
        if (!saving && !nextOpen) onClose();
      }}
    >
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {isEdit ? "Edit Vendor" : "Add Vendor"}
          </DialogTitle>
          <DialogDescription>
            Maintain vendor contact, compliance, and performance details.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {error ? (
            <div className="p-3 bg-rose-50 text-rose-700 rounded text-sm">
              {error}
            </div>
          ) : null}

          <div>
            <Label>Company Name *</Label>
            <Input
              value={form.company_name}
              onChange={(e) => setField("company_name", e.target.value)}
              placeholder="ABC Electrical Ltd."
            />
          </div>

          <div>
            <Label>Trade Type</Label>
            <select
              value={form.trade_type}
              onChange={(e) => setField("trade_type", e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-md"
            >
              <option value="">Select a trade...</option>
              {TRADE_TYPES.map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </select>
          </div>

          <div>
            <Label>Contact Person</Label>
            <Input
              value={form.contact_person}
              onChange={(e) => setField("contact_person", e.target.value)}
              placeholder="John Doe"
            />
          </div>

          <div>
            <Label>Phone</Label>
            <Input
              value={form.phone}
              onChange={(e) => setField("phone", e.target.value)}
              placeholder="780-000-0000"
            />
          </div>

          <div>
            <Label>Email</Label>
            <Input
              type="email"
              value={form.email}
              onChange={(e) => setField("email", e.target.value)}
              placeholder="vendor@email.com"
            />
          </div>

          <div>
            <Label>Website</Label>
            <Input
              value={form.website}
              onChange={(e) => setField("website", e.target.value)}
              placeholder="https://example.com"
            />
          </div>

          <div>
            <Label>WCB Account Number</Label>
            <Input
              value={form.wcb_account_number}
              onChange={(e) =>
                setField("wcb_account_number", e.target.value)
              }
            />
          </div>

          <div>
            <Label>GST Number</Label>
            <Input
              value={form.gst_number}
              onChange={(e) => setField("gst_number", e.target.value)}
            />
          </div>

          <div>
            <Label>Insurance Expiry Date</Label>
            <Input
              type="date"
              value={form.insurance_expiry_date}
              onChange={(e) =>
                setField("insurance_expiry_date", e.target.value)
              }
            />
          </div>

          <div>
            <Label>Status</Label>
            <select
              value={form.status}
              onChange={(e) => setField("status", e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-md"
            >
              <option value="Active">Active</option>
              <option value="Preferred">Preferred</option>
              <option value="Watchlist">Watchlist</option>
              <option value="Inactive">Inactive</option>
            </select>
          </div>

          <div>
            <Label>Vendor Rating</Label>
            <select
              value={form.vendor_rating}
              onChange={(e) => setField("vendor_rating", e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-md"
            >
              <option value="">Select a rating...</option>
              {VENDOR_RATINGS.map((rating) => (
                <option key={rating} value={rating}>
                  {rating}
                </option>
              ))}
            </select>
          </div>

          <div>
            <Label>Work Again?</Label>
            <select
              value={form.work_again ? "true" : "false"}
              onChange={(e) =>
                setField("work_again", e.target.value === "true")
              }
              className="w-full px-3 py-2 border border-slate-300 rounded-md"
            >
              <option value="true">Yes</option>
              <option value="false">No</option>
            </select>
          </div>

          <div>
            <Label>Notes</Label>
            <Textarea
              value={form.notes}
              onChange={(e) => setField("notes", e.target.value)}
              rows={4}
              placeholder="General vendor notes"
            />
          </div>

          <div>
            <Label>Internal Notes</Label>
            <Textarea
              value={form.internal_notes}
              onChange={(e) => setField("internal_notes", e.target.value)}
              rows={4}
              placeholder="Internal performance or admin notes"
            />
          </div>

          <div className="flex gap-2">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={saving}>
              {saving ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : isEdit ? (
                "Update Vendor"
              ) : (
                "Create Vendor"
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
