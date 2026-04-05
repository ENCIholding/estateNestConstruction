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

type ClientSelection = {
  id?: string;
  project_id: string;
  item_name: string;
  budgeted_cost: number | string;
  client_choice_description: string;
  actual_cost: number | string;
  variance: number | string;
  status: "Pending" | "Approved" | "Ordered" | "Installed" | string;
};

type ManagementClientSelectionFormProps = {
  selection?: Partial<ClientSelection> | null;
  projects: Project[];
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

export default function ManagementClientSelectionForm({
  selection,
  projects,
  open,
  onClose,
  onSaved,
}: ManagementClientSelectionFormProps) {
  const [formData, setFormData] = useState<ClientSelection>(
    selection
      ? {
          id: selection.id,
          project_id: selection.project_id || "",
          item_name: selection.item_name || "",
          budgeted_cost:
            selection.budgeted_cost !== undefined && selection.budgeted_cost !== null
              ? selection.budgeted_cost
              : 0,
          client_choice_description: selection.client_choice_description || "",
          actual_cost:
            selection.actual_cost !== undefined && selection.actual_cost !== null
              ? selection.actual_cost
              : 0,
          variance:
            selection.variance !== undefined && selection.variance !== null
              ? selection.variance
              : 0,
          status: selection.status || "Pending",
        }
      : {
          project_id: "",
          item_name: "",
          budgeted_cost: 0,
          client_choice_description: "",
          actual_cost: 0,
          variance: 0,
          status: "Pending",
        }
  );

  const [saving, setSaving] = useState(false);

  const handleChange = (field: keyof ClientSelection, value: string) => {
    setFormData((prev) => {
      const updates: Partial<ClientSelection> = { [field]: value };

      const nextBudgeted =
        field === "budgeted_cost"
          ? parseFloat(value || "0")
          : parseFloat(String(prev.budgeted_cost || 0));

      const nextActual =
        field === "actual_cost"
          ? parseFloat(value || "0")
          : parseFloat(String(prev.actual_cost || 0));

      if (field === "budgeted_cost" || field === "actual_cost") {
        updates.variance = nextActual - nextBudgeted;
      }

      return { ...prev, ...updates };
    });
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSaving(true);

    try {
      const payload = {
        ...formData,
        budgeted_cost: parseFloat(String(formData.budgeted_cost || 0)),
        actual_cost: parseFloat(String(formData.actual_cost || 0)),
        variance: parseFloat(String(formData.variance || 0)),
      };

      if (selection?.id) {
        await fetchJson(`/api/management/client-selections/${selection.id}`, {
          method: "PATCH",
          body: JSON.stringify(payload),
        });
      } else {
        await fetchJson(`/api/management/client-selections`, {
          method: "POST",
          body: JSON.stringify(payload),
        });
      }

      onSaved();
      onClose();
    } catch (error) {
      console.error("Save failed:", error);
      alert(error instanceof Error ? error.message : "Failed to save selection.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>{selection ? "Edit Selection" : "New Selection"}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid sm:grid-cols-2 gap-4">
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

            <div className="space-y-2 sm:col-span-2">
              <Label>Item Name *</Label>
              <Input
                value={formData.item_name}
                onChange={(e) => handleChange("item_name", e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label>Budgeted Cost</Label>
              <Input
                type="number"
                value={formData.budgeted_cost}
                onChange={(e) => handleChange("budgeted_cost", e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label>Actual Cost</Label>
              <Input
                type="number"
                value={formData.actual_cost}
                onChange={(e) => handleChange("actual_cost", e.target.value)}
              />
            </div>

            <div className="space-y-2 sm:col-span-2">
              <Label>Client Choice Description</Label>
              <Textarea
                value={formData.client_choice_description}
                onChange={(e) =>
                  handleChange("client_choice_description", e.target.value)
                }
                rows={2}
              />
            </div>

            <div className="space-y-2">
              <Label>Variance</Label>
              <Input type="number" value={formData.variance} disabled />
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
                  <SelectItem value="Pending">Pending</SelectItem>
                  <SelectItem value="Approved">Approved</SelectItem>
                  <SelectItem value="Ordered">Ordered</SelectItem>
                  <SelectItem value="Installed">Installed</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>

            <Button type="submit" disabled={saving}>
              {saving && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              {selection ? "Update" : "Create"} Selection
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
