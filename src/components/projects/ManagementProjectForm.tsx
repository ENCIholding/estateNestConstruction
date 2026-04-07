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

  const handleSubmit = async (e: React.FormEvent) => {
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
    <div>
      <Label>{label}</Label>
      {formData[field] ? (
        <div className="flex items-center gap-2">
          <a
            href={String(formData[field])}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-600 hover:underline"
          >
            View Document
          </a>
          <button
            type="button"
            onClick={() => handleChange(field, "")}
            className="text-red-600 hover:text-red-800"
          >
            <X size={16} />
          </button>
        </div>
      ) : (
        <div>
          <input
            type="file"
            accept={accept}
            onChange={(e) => handleFileUpload(field, e.target.files?.[0])}
            disabled={!!uploading[field]}
            className="cursor-pointer"
          />
          {uploading[field] && (
            <div className="flex items-center gap-2 mt-2">
              <Loader2 size={16} className="animate-spin" />
              <span>Uploading...</span>
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
          <DialogTitle>
            {project ? "Edit Project" : "New Project"}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <h3 className="text-lg font-semibold mb-4">Basic Information</h3>
            <div className="space-y-4">
              <div>
                <Label>Project Name *</Label>
                <Input
                  value={formData.project_name}
                  onChange={(e) =>
                    handleChange("project_name", e.target.value)
                  }
                  required
                />
              </div>

              <div>
                <Label>Civic Address *</Label>
                <Input
                  value={formData.civic_address}
                  onChange={(e) =>
                    handleChange("civic_address", e.target.value)
                  }
                  required
                />
              </div>

              <div>
                <Label>Legal Land Description</Label>
                <Input
                  value={formData.legal_land_description}
                  onChange={(e) =>
                    handleChange("legal_land_description", e.target.value)
                  }
                />
              </div>

              <div>
                <Label>Zoning Code</Label>
                <select
                  value={formData.zoning_code}
                  onChange={(e) =>
                    handleChange("zoning_code", e.target.value)
                  }
                  className="w-full px-3 py-2 border border-slate-300 rounded-md"
                >
                  <option value="">Select zoning code</option>
                  {ZONING_CODES.map((code) => (
                    <option key={code} value={code}>
                      {code}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <Label>Status</Label>
                <select
                  value={formData.status}
                  onChange={(e) => handleChange("status", e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-md"
                >
                  {STATUSES.map((status) => (
                    <option key={status} value={status}>
                      {status}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-4">Financials</h3>
            <div className="space-y-4">
              <div>
                <Label>Estimated Budget</Label>
                <Input
                  type="number"
                  value={formData.estimated_budget}
                  onChange={(e) =>
                    handleChange("estimated_budget", e.target.value)
                  }
                  placeholder="$0.00"
                />
              </div>

              <div>
                <Label>Selling Price</Label>
                <Input
                  type="number"
                  value={formData.selling_price}
                  onChange={(e) =>
                    handleChange("selling_price", e.target.value)
                  }
                  placeholder="$0.00"
                />
              </div>

              <div>
                <Label>Deposit Amount</Label>
                <Input
                  type="number"
                  value={formData.deposit_amount}
                  onChange={(e) =>
                    handleChange("deposit_amount", e.target.value)
                  }
                  placeholder="$0.00"
                />
              </div>
            </div>
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-4">Key Dates</h3>
            <div className="space-y-4">
              <div>
                <Label>Start Date</Label>
                <Input
                  type="date"
                  value={formData.start_date}
                  onChange={(e) => handleChange("start_date", e.target.value)}
                />
              </div>

              <div>
                <Label>Estimated End Date</Label>
                <Input
                  type="date"
                  value={formData.estimated_end_date}
                  onChange={(e) =>
                    handleChange("estimated_end_date", e.target.value)
                  }
                />
              </div>

              <div>
                <Label>Actual End Date</Label>
                <Input
                  type="date"
                  value={formData.actual_end_date}
                  onChange={(e) =>
                    handleChange("actual_end_date", e.target.value)
                  }
                />
              </div>

              <div>
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

          <div>
            <h3 className="text-lg font-semibold mb-4">Key Documents</h3>
            <div className="space-y-4">
              <FileUploadField
                label="Development Permit PDF"
                field="development_permit_pdf"
              />
              <FileUploadField
                label="Building Permit PDF"
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
              {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {project ? "Update" : "Create"} Project
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
