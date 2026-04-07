import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Loader2 } from "lucide-react";

type Project = {
  id: string;
  project_name?: string;
};

type Compliance = {
  id?: string;
  project_id: string;
  alberta_one_call_status: string;
  one_call_ticket_number: string;
  development_permit_issued: boolean;
  development_permit_number: string;
  building_permit_issued: boolean;
  building_permit_number: string;
  new_home_warranty_enrolled: boolean;
  warranty_certificate_number: string;
  final_grade_certificate_issued: boolean;
  occupancy_permit_issued: boolean;
  notes: string;
};

async function fetchJson(url: string, options: RequestInit = {}): Promise<any> {
  const res = await fetch(url, {
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    ...options,
  });

  if (!res.ok) throw new Error("API error");
  return res.json();
}

export default function ManagementComplianceForm({
  compliance,
  projects,
  open,
  onClose,
  onSaved,
  defaultProjectId,
}: any) {
  const [formData, setFormData] = useState<Compliance>(
    compliance || {
      project_id: defaultProjectId || "",
      alberta_one_call_status: "Pending",
      one_call_ticket_number: "",
      development_permit_issued: false,
      development_permit_number: "",
      building_permit_issued: false,
      building_permit_number: "",
      new_home_warranty_enrolled: false,
      warranty_certificate_number: "",
      final_grade_certificate_issued: false,
      occupancy_permit_issued: false,
      notes: "",
    }
  );

  const [saving, setSaving] = useState(false);

  const handleChange = (field: keyof Compliance, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      if (compliance?.id) {
        await fetchJson(`/api/management/compliance/${compliance.id}`, {
          method: "PATCH",
          body: JSON.stringify(formData),
        });
      } else {
        await fetchJson(`/api/management/compliance`, {
          method: "POST",
          body: JSON.stringify(formData),
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
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {compliance ? "Edit Compliance Record" : "Add Compliance Record"}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* PROJECT */}
          <div>
            <Label>Project *</Label>
            <select
              value={formData.project_id}
              onChange={(e) => handleChange("project_id", e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-md"
            >
              <option value="">-- Select a project --</option>
              {projects.map((p: Project) => (
                <option key={p.id} value={p.id}>
                  {p.project_name}
                </option>
              ))}
            </select>
          </div>

          {/* ONE CALL */}
          <div className="space-y-2">
            <Label>Alberta One-Call</Label>
            <div className="space-y-2">
              <select
                value={formData.alberta_one_call_status}
                onChange={(e) =>
                  handleChange("alberta_one_call_status", e.target.value)
                }
                className="w-full px-3 py-2 border border-slate-300 rounded-md"
              >
                <option value="Pending">Pending</option>
                <option value="Cleared">Cleared</option>
              </select>

              <Input
                placeholder="Ticket Number"
                value={formData.one_call_ticket_number}
                onChange={(e) =>
                  handleChange("one_call_ticket_number", e.target.value)
                }
              />
            </div>
          </div>

          {/* PERMITS */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Checkbox
                checked={formData.development_permit_issued}
                onCheckedChange={(v) =>
                  handleChange("development_permit_issued", v)
                }
              />
              <Label>Development Permit</Label>
            </div>

            {formData.development_permit_issued && (
              <Input
                placeholder="Permit Number"
                value={formData.development_permit_number}
                onChange={(e) =>
                  handleChange("development_permit_number", e.target.value)
                }
              />
            )}

            <div className="flex items-center gap-2">
              <Checkbox
                checked={formData.building_permit_issued}
                onCheckedChange={(v) =>
                  handleChange("building_permit_issued", v)
                }
              />
              <Label>Building Permit</Label>
            </div>

            {formData.building_permit_issued && (
              <Input
                placeholder="Permit Number"
                value={formData.building_permit_number}
                onChange={(e) =>
                  handleChange("building_permit_number", e.target.value)
                }
              />
            )}
          </div>

          {/* WARRANTY */}
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Checkbox
                checked={formData.new_home_warranty_enrolled}
                onCheckedChange={(v) =>
                  handleChange("new_home_warranty_enrolled", v)
                }
              />
              <Label>Warranty Enrolled</Label>
            </div>

            {formData.new_home_warranty_enrolled && (
              <Input
                placeholder="Certificate Number"
                value={formData.warranty_certificate_number}
                onChange={(e) =>
                  handleChange("warranty_certificate_number", e.target.value)
                }
              />
            )}
          </div>

          {/* OTHER */}
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Checkbox
                checked={formData.final_grade_certificate_issued}
                onCheckedChange={(v) =>
                  handleChange("final_grade_certificate_issued", v)
                }
              />
              <Label>Final Grade Certificate</Label>
            </div>

            <div className="flex items-center gap-2">
              <Checkbox
                checked={formData.occupancy_permit_issued}
                onCheckedChange={(v) =>
                  handleChange("occupancy_permit_issued", v)
                }
              />
              <Label>Occupancy Permit</Label>
            </div>
          </div>

          {/* NOTES */}
          <div>
            <Label>Notes</Label>
            <Textarea
              value={formData.notes}
              onChange={(e) => handleChange("notes", e.target.value)}
              rows={4}
              placeholder="Additional notes..."
            />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={saving}>
              {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Save
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
