import React, { useMemo, useState } from "react";
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
import { Loader2, X, Plus } from "lucide-react";

const PHASES = [
  "1. Pre-Construction",
  "2. Foundation",
  "3. Framing",
  "4. Rough-Ins",
  "5. Drywall",
  "6. Finishing",
  "7. Exterior",
  "8. Close-Out",
];

const STATUSES = ["Not Started", "In Progress", "Completed", "On Hold"];

type Project = {
  id: string;
  project_name?: string;
};

type Vendor = {
  id: string;
  company_name?: string;
};

type Task = {
  id?: string;
  project_id: string;
  vendor_id: string;
  task_name: string;
  phase: string;
  start_date: string;
  duration_days: string | number;
  predecessor_task_id: string;
  status: string;
  site_photos: string[];
  city_inspection_passed: boolean;
  notes: string;
};

type ManagementTaskFormProps = {
  task?: Partial<Task> | null;
  projects: Project[];
  vendors: Vendor[];
  allTasks?: Task[];
  open: boolean;
  onClose: () => void;
  onSaved: () => void;
  defaultProjectId?: string;
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

export default function ManagementTaskForm({
  task,
  projects,
  vendors,
  allTasks = [],
  open,
  onClose,
  onSaved,
  defaultProjectId,
}: ManagementTaskFormProps) {
  const [formData, setFormData] = useState<Task>(
    task
      ? {
          id: task.id,
          project_id: task.project_id || defaultProjectId || "",
          vendor_id: task.vendor_id || "",
          task_name: task.task_name || "",
          phase: task.phase || "",
          start_date: task.start_date || "",
          duration_days:
            task.duration_days !== undefined && task.duration_days !== null
              ? task.duration_days
              : "",
          predecessor_task_id: task.predecessor_task_id || "",
          status: task.status || "Not Started",
          site_photos: task.site_photos || [],
          city_inspection_passed: !!task.city_inspection_passed,
          notes: task.notes || "",
        }
      : {
          project_id: defaultProjectId || "",
          vendor_id: "",
          task_name: "",
          phase: "",
          start_date: "",
          duration_days: "",
          predecessor_task_id: "",
          status: "Not Started",
          site_photos: [],
          city_inspection_passed: false,
          notes: "",
        }
  );

  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);

  const handleChange = (field: keyof Task, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handlePhotoUpload = async (file?: File) => {
    if (!file) return;

    setUploading(true);
    try {
      const uploadResult = await uploadFile(file);
      handleChange("site_photos", [...(formData.site_photos || []), uploadResult.file_url]);
    } catch (error) {
      console.error("Upload failed:", error);
      alert(error instanceof Error ? error.message : "Upload failed.");
    } finally {
      setUploading(false);
    }
  };

  const removePhoto = (index: number) => {
    const newPhotos = [...formData.site_photos];
    newPhotos.splice(index, 1);
    handleChange("site_photos", newPhotos);
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSaving(true);

    try {
      const data = {
        ...formData,
        duration_days:
          formData.duration_days !== "" && formData.duration_days !== null
            ? parseInt(String(formData.duration_days), 10)
            : null,
      };

      if (task?.id) {
        await fetchJson(`/api/management/tasks/${task.id}`, {
          method: "PATCH",
          body: JSON.stringify(data),
        });
      } else {
        await fetchJson(`/api/management/tasks`, {
          method: "POST",
          body: JSON.stringify(data),
        });
      }

      onSaved();
      onClose();
    } catch (error) {
      console.error("Save failed:", error);
      alert(error instanceof Error ? error.message : "Failed to save task.");
    } finally {
      setSaving(false);
    }
  };

  const projectTasks = useMemo(() => {
    return allTasks.filter(
      (item) => item.project_id === formData.project_id && item.id !== task?.id
    );
  }, [allTasks, formData.project_id, task?.id]);

  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{task ? "Edit Task" : "Add Task"}</DialogTitle>
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
              <Label>Task Name *</Label>
              <Input
                value={formData.task_name}
                onChange={(e) => handleChange("task_name", e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label>Phase *</Label>
              <Select
                value={formData.phase}
                onValueChange={(value) => handleChange("phase", value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select phase" />
                </SelectTrigger>
                <SelectContent>
                  {PHASES.map((phase) => (
                    <SelectItem key={phase} value={phase}>
                      {phase}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Assigned Vendor</Label>
              <Select
                value={formData.vendor_id || ""}
                onValueChange={(value) => handleChange("vendor_id", value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select vendor" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">No vendor</SelectItem>
                  {vendors.map((vendor) => (
                    <SelectItem key={vendor.id} value={vendor.id}>
                      {vendor.company_name || "Unnamed Vendor"}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Start Date</Label>
              <Input
                type="date"
                value={formData.start_date}
                onChange={(e) => handleChange("start_date", e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label>Duration (Days)</Label>
              <Input
                type="number"
                value={formData.duration_days}
                onChange={(e) => handleChange("duration_days", e.target.value)}
                placeholder="e.g. 5"
              />
            </div>

            <div className="space-y-2 sm:col-span-2">
              <Label>Predecessor Task (Dependency)</Label>
              <Select
                value={formData.predecessor_task_id || ""}
                onValueChange={(value) =>
                  handleChange(
                    "predecessor_task_id",
                    value === "none" ? "" : value
                  )
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select predecessor task" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">No dependency</SelectItem>
                  {projectTasks.map((item) => (
                    <SelectItem key={item.id} value={item.id || ""}>
                      {item.task_name} ({item.phase})
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

            <div className="space-y-2 flex items-end">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="inspection"
                  checked={formData.city_inspection_passed}
                  onCheckedChange={(checked) =>
                    handleChange("city_inspection_passed", checked === true)
                  }
                />
                <Label htmlFor="inspection" className="text-sm font-normal">
                  City Inspection Passed
                </Label>
              </div>
            </div>

            <div className="space-y-2 sm:col-span-2">
              <Label>Notes</Label>
              <Textarea
                value={formData.notes}
                onChange={(e) => handleChange("notes", e.target.value)}
                rows={2}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Site Photos</Label>

            <div className="grid grid-cols-4 gap-2">
              {formData.site_photos?.map((photo, index) => (
                <div
                  key={index}
                  className="relative aspect-square rounded-lg overflow-hidden group"
                >
                  <img
                    src={photo}
                    alt={`Site photo ${index + 1}`}
                    className="w-full h-full object-cover"
                  />
                  <button
                    type="button"
                    onClick={() => removePhoto(index)}
                    className="absolute top-1 right-1 p-1 bg-black/50 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <X className="h-3 w-3 text-white" />
                  </button>
                </div>
              ))}

              <label className="aspect-square rounded-lg border-2 border-dashed border-slate-200 flex items-center justify-center cursor-pointer hover:border-slate-300 transition-colors">
                {uploading ? (
                  <Loader2 className="h-6 w-6 animate-spin text-slate-400" />
                ) : (
                  <Plus className="h-6 w-6 text-slate-400" />
                )}

                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => handlePhotoUpload(e.target.files?.[0])}
                  className="hidden"
                  disabled={uploading}
                />
              </label>
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>

            <Button type="submit" disabled={saving}>
              {saving && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              {task ? "Update" : "Add"} Task
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
