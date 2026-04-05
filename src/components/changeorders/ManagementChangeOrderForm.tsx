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

type Project = {
  id: string;
  project_name?: string;
};

type ChangeOrder = {
  id?: string;
  project_id: string;
  description: string;
  cost_impact: string | number | null;
  client_approval_status: string;
  approved_date: string;
  requested_by: string;
  notes: string;
};

type ManagementChangeOrderFormProps = {
  changeOrder?: Partial<ChangeOrder> | null;
  projects: Project[];
  open: boolean;
  onClose: () => void;
  onSaved: () => void;
  defaultProjectId?: string;
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

export default function ManagementChangeOrderForm({
  changeOrder,
  projects,
  open,
  onClose,
  onSaved,
  defaultProjectId,
}: ManagementChangeOrderFormProps) {
  const [formData, setFormData] = useState<ChangeOrder>(
    changeOrder
      ? {
          id: changeOrder.id,
          project_id: changeOrder.project_id || defaultProjectId || "",
          description: changeOrder.description || "",
          cost_impact:
            changeOrder.cost_impact !== undefined && changeOrder.cost_impact !== null
              ? changeOrder.cost_impact
              : "",
          client_approval_status: changeOrder.client_approval_status || "Pending",
          approved_date: changeOrder.approved_date || "",
          requested_by: changeOrder.requested_by || "",
          notes: changeOrder.notes || "",
        }
      : {
          project_id: defaultProjectId || "",
          description: "",
          cost_impact: "",
          client_approval_status: "Pending",
          approved_date: "",
          requested_by: "",
          notes: "",
        }
  );

  const [saving, setSaving] = useState(false);

  const handleChange = (field: keyof ChangeOrder, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSaving(true);

    try {
      const data = {
        ...formData,
        cost_impact:
          formData.cost_impact !== "" && formData.cost_impact !== null
            ? parseFloat(String(formData.cost_impact))
            : null,
      };

      if (changeOrder?.id) {
        await fetchJson(`/api/management/change-orders/${changeOrder.id}`, {
          method: "PATCH",
          body: JSON.stringify(data),
        });
      } else {
        await fetchJson(`/api/management/change-orders`, {
          method: "POST",
          body: JSON.stringify(data),
        });
      }

      onSaved();
      onClose();
    } catch (error) {
      console.error("Save failed:", error);
      alert(error instanceof Error ? error.message : "Failed to save change order.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>
            {changeOrder ? "Edit Change Order" : "New Change Order"}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
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
            <Label>Description *</Label>
            <Textarea
              value={formData.description}
              onChange={(e) => handleChange("description", e.target.value)}
              rows={3}
              required
            />
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Cost Impact (+/-)</Label>
              <Input
                type="number"
                value={formData.cost_impact ?? ""}
                onChange={(e) => handleChange("cost_impact", e.target.value)}
                placeholder="e.g. 5000 or -2000"
              />
            </div>

            <div className="space-y-2">
              <Label>Approval Status</Label>
              <Select
                value={formData.client_approval_status}
                onValueChange={(value) =>
                  handleChange("client_approval_status", value)
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Pending">Pending</SelectItem>
                  <SelectItem value="Approved">Approved</SelectItem>
                  <SelectItem value="Rejected">Rejected</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Approved Date</Label>
              <Input
                type="date"
                value={formData.approved_date}
                onChange={(e) => handleChange("approved_date", e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label>Requested By</Label>
              <Input
                value={formData.requested_by}
                onChange={(e) => handleChange("requested_by", e.target.value)}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Notes</Label>
            <Textarea
              value={formData.notes}
              onChange={(e) => handleChange("notes", e.target.value)}
              rows={2}
            />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>

            <Button type="submit" disabled={saving}>
              {saving && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              {changeOrder ? "Update" : "Create"} Change Order
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
