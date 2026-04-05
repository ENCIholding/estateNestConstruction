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
  development_permit_pdf?: string;
  building_permit_pdf?: string;
  real_property_report?: string;
};

type ManagementProjectFormProps = {
  project?: Partial<ProjectFormData> | null;
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

export default function ManagementProjectForm({
  project,
  open,
  onClose,
  onSaved,
}: ManagementProjectFormProps) {
  const [formData, setFormData] = useState<ProjectFormData>(
    project
      ? {
          id: project.id,
          project_name: project.project_name || "",
          civic_address: project.civic_address || "",
          legal_land_description: project.legal_land_description || "",
          zoning_code: project.zoning_code || "",
          status: project.status || "Planning",
          estimated_budget:
            project.estimated_budget !== undefined && project.estimated_budget !== null
              ? project.estimated_budget
              : "",
          selling_price:
            project.selling_price !== undefined && project.selling_price !== null
              ? project.selling_price
              : "",
          deposit_amount:
            project.deposit_amount !== undefined && project.deposit_amount !== null
              ? project.deposit_amount
              : "",
          start_date: project.start_date || "",
          estimated_end_date: project.estimated_end_date || "",
          actual_end_date: project.actual_end_date || "",
          warranty_start_date: project.warranty_start_date || "",
          development_permit_pdf: project.development_permit_pdf || "",
          building_permit_pdf: project.building_permit_pdf || "",
          real_property_report: project.real_property_report || "",
        }
      : {
          project_name: "",
          civic_address: "",
          legal_land_description: "",
          zoning_code: "",
          status: "Planning",
          estimated_budget: "",
          selling_price: "",
          deposit_amount: "",
          start_date: "",
          estimated_end_date: "",
          actual_end_date: "",
          warranty_start_date: "",
          development_permit_pdf: "",
          building_permit_pdf: "",
          real_property_report: "",
        }
  );

  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState<Record<string, boolean>>({});

  const handleChange = (field: keyof ProjectFormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleFileUpload = async (
    field: "development_permit_pdf" | "building_permit_pdf" | "real_property_report",
    file?: File
  ) => {
    if (!file) return;

    setUploading((prev) => ({ ...prev, [field]: true }));

    try {
      const uploadResult = await uploadFile(file);
      handleChange(field, uploadResult.file_url);
    } catch (error) {
      console.error("Upload failed:", error);
      alert(error instanceof Error ? error.message : "Upload failed.");
    } finally {
      setUploading((prev) => ({ ...prev, [field]: false }));
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSaving(true);

    try {
      const data = {
        ...formData,
        estimated_budget:
          formData.estimated_budget !== "" && formData.estimated_budget !== null
            ? parseFloat(String(formData.estimated_budget))
            : null,
        selling_price:
          formData.selling_price !== "" && formData.selling_price !== null
            ? parseFloat(String(formData.selling_price))
            : null,
        deposit_amount:
          formData.deposit_amount !== "" && formData.deposit_amount !== null
            ? parseFloat(String(formData.deposit_amount))
            : null,
      };

      if (project?.id) {
        await fetchJson(`/api/management/projects/${project.id}`, {
          method: "PATCH",
          body: JSON.stringify(data),
        });
      } else {
        await fetchJson(`/api/management/projects`, {
          method: "POST",
          body: JSON.stringify(data),
        });
      }

      onSaved();
      onClose();
    } catch (error) {
      console.error("Save failed:", error);
      alert(error instanceof Error ? error.message : "Failed to save project.");
    } finally {
      setSaving(false);
    }
  };

  const FileUploadField = ({
    label,
    field,
    accept = ".pdf",
  }: {
    label: string;
    field: "development_permit_pdf" | "building_permit_pdf" | "real_property_report";
    accept?: string;
  }) => (
    <div className="space-y-2">
      <Label>{label}</Label>

      {formData[field] ? (
        <div className="flex items-center gap-2 p-2 bg-slate-50 rounded-lg">
          <a
            href={formData[field]}
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm text-blue-600 hover:underline truncate flex-1"
          >
            View Document
          </a>

          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={() => handleChange(field, "")}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      ) : (
        <div className="relative">
          <Input
            type="file"
            accept={accept}
            onChange={(e) => handleFileUpload(field, e.target.files?.[0])}
            disabled={!!uploading[field]}
            className="cursor-pointer"
          />

          {uploading[field] && (
            <div className="absolute inset-0 flex items-center justify-center bg-white/80">
              <Loader2 className="h-4 w-4 animate-spin" />
            </div>
          )}
        </div>
      )}
    </div>
  );

  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{project ? "Edit Project" : "New Project"}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-4">
            <h3 className="font-medium text-slate-900">Basic Information</h3>

            <div className="grid sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Project Name *</Label>
                <Input
                  value={formData.project_name}
                  onChange={(e) => handleChange("project_name", e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label>Civic Address *</Label>
                <Input
                  value={formData.civic_address}
                  onChange={(e) => handleChange("civic_address", e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label>Legal Land Description</Label>
                <Input
                  value={formData.legal_land_description}
                  onChange={(e) =>
                    handleChange("legal_land_description", e.target.value)
                  }
                />
              </div>

              <div className="space-y-2">
                <Label>Zoning Code</Label>
                <Select
                  value={formData.zoning_code}
                  onValueChange={(value) => handleChange("zoning_code", value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select zoning" />
                  </SelectTrigger>
                  <SelectContent>
                    {ZONING_CODES.map((code) => (
                      <SelectItem key={code} value={code}>
                        {code}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
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
                    {STATUSES.map((status) => (
                      <SelectItem key={status} value={status}>
                        {status}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="font-medium text-slate-900">Financials</h3>

            <div className="grid sm:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label>Estimated Budget</Label>
                <Input
                  type="number"
                  value={formData.estimated_budget}
                  onChange={(e) => handleChange("estimated_budget", e.target.value)}
                  placeholder="$0.00"
                />
              </div>

              <div className="space-y-2">
                <Label>Selling Price</Label>
                <Input
                  type="number"
                  value={formData.selling_price}
                  onChange={(e) => handleChange("selling_price", e.target.value)}
                  placeholder="$0.00"
                />
              </div>

              <div className="space-y-2">
                <Label>Deposit Amount</Label>
                <Input
                  type="number"
                  value={formData.deposit_amount}
                  onChange={(e) => handleChange("deposit_amount", e.target.value)}
                  placeholder="$0.00"
                />
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="font-medium text-slate-900">Key Dates</h3>

            <div className="grid sm:grid-cols-2 gap-4">
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
          </div>

          <div className="space-y-4">
            <h3 className="font-medium text-slate-900">Key Documents</h3>

            <div className="grid sm:grid-cols-3 gap-4">
              <FileUploadField
                label="Development Permit"
                field="development_permit_pdf"
              />
              <FileUploadField
                label="Building Permit"
                field="building_permit_pdf"
              />
              <FileUploadField
                label="Real Property Report"
                field="real_property_report"
              />
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>

            <Button type="submit" disabled={saving}>
              {saving && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              {project ? "Update" : "Create"} Project
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
