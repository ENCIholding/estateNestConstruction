import React, { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Loader2 } from "lucide-react";
import type { ManagementProject } from "@/lib/managementData";

const ZONING_CODES = [
  "RF1",
  "RF2",
  "RF3",
  "RF4",
  "RF5",
  "RF6",
  "RPL",
  "RSL",
  "RR",
  "RA7",
  "RA8",
  "RA9",
  "DC1",
  "DC2",
  "Other",
];

const STATUSES = [
  "Planning",
  "Pre-Construction",
  "Active",
  "Warranty",
  "Completed",
];

type ProjectFormData = {
  id?: string;
  project_name: string;
  civic_address: string;
  legal_land_description: string;
  zoning_code: string;
  status: string;
  estimated_budget: string | number;
  selling_price: string | number;
  deposit_amount: string | number;
  start_date: string;
  estimated_end_date: string;
  actual_end_date: string;
  warranty_start_date: string;
  development_permit_pdf: string;
  building_permit_pdf: string;
  real_property_report: string;
  project_owner: string;
  project_manager: string;
  primary_contact_email: string;
  next_milestone: string;
  status_note: string;
};

type ManagementProjectFormProps = {
  open: boolean;
  onClose: () => void;
  onSaved: () => void;
  onSubmitRecord?: (project: ManagementProject) => Promise<void>;
  project?: Partial<ManagementProject> | null;
};

function toStringValue(value?: string | number | null) {
  return value === undefined || value === null ? "" : String(value);
}

function toNumber(value: string | number) {
  const normalized = String(value).trim();
  if (!normalized) {
    return undefined;
  }

  const parsed = Number(normalized);
  return Number.isFinite(parsed) ? parsed : undefined;
}

function createInitialState(project?: Partial<ManagementProject> | null): ProjectFormData {
  return {
    id: project?.id,
    project_name: project?.project_name || "",
    civic_address: project?.civic_address || "",
    legal_land_description: project?.legal_land_description || "",
    zoning_code: project?.zoning_code || "",
    status: project?.status || "Planning",
    estimated_budget: toStringValue(project?.estimated_budget),
    selling_price: toStringValue(project?.selling_price),
    deposit_amount: toStringValue(project?.deposit_amount),
    start_date: project?.start_date || "",
    estimated_end_date: project?.estimated_end_date || "",
    actual_end_date: project?.actual_end_date || "",
    warranty_start_date: project?.warranty_start_date || "",
    development_permit_pdf: project?.development_permit_pdf || "",
    building_permit_pdf: project?.building_permit_pdf || "",
    real_property_report: project?.real_property_report || "",
    project_owner: project?.project_owner || "",
    project_manager: project?.project_manager || "",
    primary_contact_email: project?.primary_contact_email || "",
    next_milestone: project?.next_milestone || "",
    status_note: project?.status_note || "",
  };
}

export default function ManagementProjectForm({
  open,
  onClose,
  onSaved,
  onSubmitRecord,
  project,
}: ManagementProjectFormProps) {
  const [formData, setFormData] = useState<ProjectFormData>(createInitialState(project));
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (open) {
      setFormData(createInitialState(project));
      setError("");
      setSaving(false);
    }
  }, [open, project]);

  const isEdit = useMemo(() => Boolean(project?.id), [project?.id]);

  const handleChange = (field: keyof ProjectFormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError("");

    if (!formData.project_name.trim() || !formData.civic_address.trim()) {
      setError("Project name and civic address are required.");
      return;
    }

    const normalizedProject: ManagementProject = {
      id: formData.id || "",
      project_name: formData.project_name.trim(),
      civic_address: formData.civic_address.trim(),
      status: formData.status || "Planning",
      estimated_budget: toNumber(formData.estimated_budget),
      selling_price: toNumber(formData.selling_price),
      deposit_amount: toNumber(formData.deposit_amount),
      start_date: formData.start_date || undefined,
      estimated_end_date: formData.estimated_end_date || undefined,
      actual_end_date: formData.actual_end_date || undefined,
      legal_land_description: formData.legal_land_description.trim() || undefined,
      warranty_start_date: formData.warranty_start_date || undefined,
      zoning_code: formData.zoning_code || undefined,
      development_permit_pdf: formData.development_permit_pdf.trim() || undefined,
      building_permit_pdf: formData.building_permit_pdf.trim() || undefined,
      real_property_report: formData.real_property_report.trim() || undefined,
      project_owner: formData.project_owner.trim() || undefined,
      project_manager: formData.project_manager.trim() || undefined,
      primary_contact_email: formData.primary_contact_email.trim() || undefined,
      next_milestone: formData.next_milestone.trim() || undefined,
      status_note: formData.status_note.trim() || undefined,
    };

    try {
      setSaving(true);

      if (onSubmitRecord) {
        await onSubmitRecord(normalizedProject);
      }

      onSaved();
      onClose();
    } catch (submitError) {
      setError(
        submitError instanceof Error ? submitError.message : "Failed to save project."
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <DialogContent className="max-h-[90vh] max-w-3xl overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{isEdit ? "Edit Project" : "Add Project"}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {error ? (
            <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
              {error}
            </div>
          ) : null}

          <section className="space-y-4">
            <h3 className="text-base font-semibold text-foreground">Basic information</h3>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label>Project Name *</Label>
                <Input
                  value={formData.project_name}
                  onChange={(e) => handleChange("project_name", e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label>Status</Label>
                <select
                  value={formData.status}
                  onChange={(e) => handleChange("status", e.target.value)}
                  className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                >
                  {STATUSES.map((status) => (
                    <option key={status} value={status}>
                      {status}
                    </option>
                  ))}
                </select>
              </div>
              <div className="space-y-2 md:col-span-2">
                <Label>Civic Address *</Label>
                <Input
                  value={formData.civic_address}
                  onChange={(e) => handleChange("civic_address", e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label>Zoning Code</Label>
                <select
                  value={formData.zoning_code}
                  onChange={(e) => handleChange("zoning_code", e.target.value)}
                  className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                >
                  <option value="">Select zoning code</option>
                  {ZONING_CODES.map((code) => (
                    <option key={code} value={code}>
                      {code}
                    </option>
                  ))}
                </select>
              </div>
              <div className="space-y-2">
                <Label>Next Milestone</Label>
                <Input
                  value={formData.next_milestone}
                  onChange={(e) => handleChange("next_milestone", e.target.value)}
                />
              </div>
              <div className="space-y-2 md:col-span-2">
                <Label>Legal Land Description</Label>
                <Textarea
                  value={formData.legal_land_description}
                  onChange={(e) =>
                    handleChange("legal_land_description", e.target.value)
                  }
                  rows={3}
                />
              </div>
              <div className="space-y-2 md:col-span-2">
                <Label>Status Note</Label>
                <Textarea
                  value={formData.status_note}
                  onChange={(e) => handleChange("status_note", e.target.value)}
                  rows={3}
                />
              </div>
            </div>
          </section>

          <section className="space-y-4">
            <h3 className="text-base font-semibold text-foreground">Ownership & contacts</h3>
            <div className="grid gap-4 md:grid-cols-3">
              <div className="space-y-2">
                <Label>Project Owner</Label>
                <Input
                  value={formData.project_owner}
                  onChange={(e) => handleChange("project_owner", e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label>Project Manager</Label>
                <Input
                  value={formData.project_manager}
                  onChange={(e) => handleChange("project_manager", e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label>Primary Contact Email</Label>
                <Input
                  type="email"
                  value={formData.primary_contact_email}
                  onChange={(e) =>
                    handleChange("primary_contact_email", e.target.value)
                  }
                />
              </div>
            </div>
          </section>

          <section className="space-y-4">
            <h3 className="text-base font-semibold text-foreground">Financials</h3>
            <div className="grid gap-4 md:grid-cols-3">
              <div className="space-y-2">
                <Label>Estimated Budget</Label>
                <Input
                  type="number"
                  value={formData.estimated_budget}
                  onChange={(e) => handleChange("estimated_budget", e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label>Selling Price</Label>
                <Input
                  type="number"
                  value={formData.selling_price}
                  onChange={(e) => handleChange("selling_price", e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label>Deposit Amount</Label>
                <Input
                  type="number"
                  value={formData.deposit_amount}
                  onChange={(e) => handleChange("deposit_amount", e.target.value)}
                />
              </div>
            </div>
          </section>

          <section className="space-y-4">
            <h3 className="text-base font-semibold text-foreground">Key dates</h3>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label>Start Date</Label>
                <Input
                  type="date"
                  value={formData.start_date}
                  onChange={(e) => handleChange("start_date", e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label>Estimated End Date</Label>
                <Input
                  type="date"
                  value={formData.estimated_end_date}
                  onChange={(e) =>
                    handleChange("estimated_end_date", e.target.value)
                  }
                />
              </div>
              <div className="space-y-2">
                <Label>Actual End Date</Label>
                <Input
                  type="date"
                  value={formData.actual_end_date}
                  onChange={(e) => handleChange("actual_end_date", e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label>Warranty Start Date</Label>
                <Input
                  type="date"
                  value={formData.warranty_start_date}
                  onChange={(e) =>
                    handleChange("warranty_start_date", e.target.value)
                  }
                />
              </div>
            </div>
          </section>

          <section className="space-y-4">
            <h3 className="text-base font-semibold text-foreground">Document links</h3>
            <div className="grid gap-4 md:grid-cols-3">
              <div className="space-y-2">
                <Label>Development Permit URL</Label>
                <Input
                  value={formData.development_permit_pdf}
                  onChange={(e) =>
                    handleChange("development_permit_pdf", e.target.value)
                  }
                  placeholder="https://..."
                />
              </div>
              <div className="space-y-2">
                <Label>Building Permit URL</Label>
                <Input
                  value={formData.building_permit_pdf}
                  onChange={(e) =>
                    handleChange("building_permit_pdf", e.target.value)
                  }
                  placeholder="https://..."
                />
              </div>
              <div className="space-y-2">
                <Label>Real Property Report URL</Label>
                <Input
                  value={formData.real_property_report}
                  onChange={(e) =>
                    handleChange("real_property_report", e.target.value)
                  }
                  placeholder="https://..."
                />
              </div>
            </div>
          </section>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={saving}>
              {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
              {isEdit ? "Update Project" : "Add Project"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
