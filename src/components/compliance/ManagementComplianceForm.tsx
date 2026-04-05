import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
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

async function fetchJson(url: string, options: RequestInit = {}) {
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

  const handleSubmit = async (e: any) => {
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
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {compliance ? "Edit Compliance Record" : "Add Compliance Record"}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
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
                {projects.map((p: Project) => (
                  <SelectItem key={p.id} value={p.id}>
                    {p.project_name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* ONE CALL */}
          <div className="border p-4 rounded-lg space-y-3">
            <h3 className="font-medium">Alberta One-Call</h3>

            <Select
              value={formData.alberta_one_call_status}
              onValueChange={(v) =>
                handleChange("alberta_one_call_status", v)
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Pending">Pending</SelectItem>
                <SelectItem value="Cleared">Cleared</SelectItem>
              </SelectContent>
            </Select>

            <Input
              placeholder="Ticket Number"
              value={formData.one_call_ticket_number}
              onChange={(e) =>
                handleChange("one_call_ticket_number", e.target.value)
              }
            />
          </div>

          {/* PERMITS */}
          <div className="border p-4 rounded-lg space-y-3">
            <Label>
              <Checkbox
                checked={formData.development_permit_issued}
                onCheckedChange={(v) =>
                  handleChange("development_permit_issued", v)
                }
              />
              Development Permit
            </Label>

            <Input
              placeholder="Permit Number"
              value={formData.development_permit_number}
              onChange={(e) =>
                handleChange("development_permit_number", e.target.value)
              }
            />

            <Label>
              <Checkbox
                checked={formData.building_permit_issued}
                onCheckedChange={(v) =>
                  handleChange("building_permit_issued", v)
                }
              />
              Building Permit
            </Label>

            <Input
              placeholder="Permit Number"
              value={formData.building_permit_number}
              onChange={(e) =>
                handleChange("building_permit_number", e.target.value)
              }
            />
          </div>

          {/* WARRANTY */}
          <div className="border p-4 rounded-lg space-y-3">
            <Label>
              <Checkbox
                checked={formData.new_home_warranty_enrolled}
                onCheckedChange={(v) =>
                  handleChange("new_home_warranty_enrolled", v)
                }
              />
              Warranty Enrolled
            </Label>

            <Input
              placeholder="Certificate Number"
              value={formData.warranty_certificate_number}
              onChange={(e) =>
                handleChange("warranty_certificate_number", e.target.value)
              }
            />
          </div>

          {/* OTHER */}
          <div className="space-y-2">
            <Label>
              <Checkbox
                checked={formData.final_grade_certificate_issued}
                onCheckedChange={(v) =>
                  handleChange("final_grade_certificate_issued", v)
                }
              />
              Final Grade Certificate
            </Label>

            <Label>
              <Checkbox
                checked={formData.occupancy_permit_issued}
                onCheckedChange={(v) =>
                  handleChange("occupancy_permit_issued", v)
                }
              />
              Occupancy Permit
            </Label>
          </div>

          {/* NOTES */}
          <Textarea
            placeholder="Notes"
            value={formData.notes}
            onChange={(e) => handleChange("notes", e.target.value)}
          />

          <DialogFooter>
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>

            <Button type="submit" disabled={saving}>
              {saving && <Loader2 className="mr-2 animate-spin" />}
              Save
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
