import React, { useMemo, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import {
  Loader2,
  Camera,
  CheckCircle2,
  MapPin,
  Clock,
  X,
  ChevronRight,
} from "lucide-react";
import { format, addDays } from "date-fns";

type User = {
  id: string;
  name?: string;
  email?: string;
  app_role?: string;
};

type Project = {
  id: string;
  project_name?: string;
  civic_address?: string;
};

type Task = {
  id: string;
  task_name?: string;
  phase?: string;
  project_id?: string;
  status?: "Not Started" | "In Progress" | "Completed" | "On Hold" | string;
  city_inspection_passed?: boolean;
  site_photos?: string[];
  start_date?: string;
  duration_days?: number;
  notes?: string;
};

const statusColors: Record<string, string> = {
  "Not Started": "bg-slate-100 text-slate-700",
  "In Progress": "bg-blue-50 text-blue-700",
  Completed: "bg-emerald-50 text-emerald-700",
  "On Hold": "bg-amber-50 text-amber-700",
};

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

  return response.json();
}

async function uploadFile(file: File): Promise<{ file_url: string }> {
  const formData = new FormData();
  formData.append("file", file);

  const response = await fetch("/api/management/upload", {
    method: "POST",
    credentials: "include",
    body: formData,
  });

  if (!response.ok) {
    let message = "Upload failed";
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

export default function ManagementMobileTasks() {
  const [projectFilter, setProjectFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("pending");
  const [expandedTask, setExpandedTask] = useState<string | null>(null);
  const [uploadingTaskId, setUploadingTaskId] = useState<string | null>(null);
  const [updatingTaskId, setUpdatingTaskId] = useState<string | null>(null);

  const queryClient = useQueryClient();

  const { data: sessionData, isLoading: loadingSession } = useQuery({
    queryKey: ["management-session"],
    queryFn: () => fetchJson<{ user: User | null }>("/api/management/session"),
    retry: false,
  });

  const { data: tasks = [], isLoading: loadingTasks } = useQuery({
    queryKey: ["tasks"],
    queryFn: () => fetchJson<Task[]>("/api/management/tasks"),
  });

  const { data: projects = [], isLoading: loadingProjects } = useQuery({
    queryKey: ["projects"],
    queryFn: () => fetchJson<Project[]>("/api/management/projects"),
  });

  const user = sessionData?.user || null;

  const projectMap = useMemo(() => {
    return projects.reduce<Record<string, Project>>((acc, project) => {
      acc[project.id] = project;
      return acc;
    }, {});
  }, [projects]);

  const filteredTasks = useMemo(() => {
    return tasks.filter((task) => {
      const matchesProject =
        projectFilter === "all" || task.project_id === projectFilter;

      const matchesStatus =
        statusFilter === "all" ||
        (statusFilter === "pending" && task.status !== "Completed") ||
        (statusFilter === "completed" && task.status === "Completed");

      return matchesProject && matchesStatus;
    });
  }, [tasks, projectFilter, statusFilter]);

  const refreshTasks = async () => {
    await queryClient.invalidateQueries({ queryKey: ["tasks"] });
  };

  const updateTask = async (taskId: string, payload: Partial<Task>) => {
    setUpdatingTaskId(taskId);
    try {
      await fetchJson(`/api/management/tasks/${taskId}`, {
        method: "PATCH",
        body: JSON.stringify(payload),
      });
      await refreshTasks();
    } catch (error) {
      console.error("Failed to update task:", error);
      alert(error instanceof Error ? error.message : "Failed to update task.");
    } finally {
      setUpdatingTaskId(null);
    }
  };

  const handleStatusChange = async (task: Task, newStatus: string) => {
    await updateTask(task.id, { status: newStatus });
  };

  const handleInspectionChange = async (
    task: Task,
    checked: boolean | "indeterminate"
  ) => {
    await updateTask(task.id, {
      city_inspection_passed: checked === true,
    });
  };

  const handlePhotoUpload = async (task: Task, file?: File) => {
    if (!file) return;

    setUploadingTaskId(task.id);

    try {
      const uploadResult = await uploadFile(file);
      const newPhotos = [...(task.site_photos || []), uploadResult.file_url];

      await fetchJson(`/api/management/tasks/${task.id}`, {
        method: "PATCH",
        body: JSON.stringify({ site_photos: newPhotos }),
      });

      await refreshTasks();
    } catch (error) {
      console.error("Upload failed:", error);
      alert(error instanceof Error ? error.message : "Photo upload failed.");
    } finally {
      setUploadingTaskId(null);
    }
  };

  const removePhoto = async (task: Task, index: number) => {
    const existingPhotos = [...(task.site_photos || [])];
    existingPhotos.splice(index, 1);

    await updateTask(task.id, {
      site_photos: existingPhotos,
    });
  };

  const isLoading = loadingSession || loadingTasks || loadingProjects;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="h-8 w-8 animate-spin text-slate-400" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="max-w-lg mx-auto p-4">
        <div className="rounded-lg border border-amber-200 bg-amber-50 p-4 text-amber-700">
          You are not logged in. Please log in to access mobile tasks.
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4 max-w-lg mx-auto">
      <div>
        <h1 className="text-xl font-bold text-slate-900">My Tasks</h1>
        <p className="text-slate-500 text-sm">Site superintendent task list</p>
      </div>

      <div className="flex gap-2">
        <Select value={projectFilter} onValueChange={setProjectFilter}>
          <SelectTrigger className="flex-1">
            <SelectValue placeholder="All Projects" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Projects</SelectItem>
            {projects.map((project) => (
              <SelectItem key={project.id} value={project.id}>
                {project.project_name || "Unnamed Project"}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-32">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="completed">Completed</SelectItem>
            <SelectItem value="all">All</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-3">
        {filteredTasks.length === 0 ? (
          <div className="text-center py-12 text-slate-500">No tasks found</div>
        ) : (
          filteredTasks.map((task) => {
            const project = task.project_id ? projectMap[task.project_id] : undefined;
            const isExpanded = expandedTask === task.id;

            const hasValidDates =
              task.start_date &&
              task.duration_days !== undefined &&
              task.duration_days !== null &&
              !Number.isNaN(new Date(task.start_date).getTime());

            const endDate = hasValidDates
              ? addDays(new Date(task.start_date as string), Number(task.duration_days))
              : null;

            const isUploading = uploadingTaskId === task.id;
            const isUpdating = updatingTaskId === task.id;

            return (
              <Card key={task.id} className="border-0 shadow-sm overflow-hidden">
                <button
                  onClick={() => setExpandedTask(isExpanded ? null : task.id)}
                  className="w-full p-4 text-left flex items-start gap-3"
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <Badge
                        className={
                          statusColors[task.status || ""] || "bg-slate-100 text-slate-700"
                        }
                        variant="secondary"
                      >
                        {task.status || "Not Started"}
                      </Badge>

                      {task.city_inspection_passed && (
                        <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                      )}

                      {(isUploading || isUpdating) && (
                        <Loader2 className="h-4 w-4 animate-spin text-slate-400" />
                      )}
                    </div>

                    <h3 className="font-medium text-slate-900">
                      {task.task_name || "Untitled Task"}
                    </h3>

                    <p className="text-sm text-slate-500">{task.phase || "—"}</p>

                    <div className="flex items-center gap-1 mt-2 text-sm text-slate-500">
                      <MapPin className="h-3 w-3" />
                      <span className="truncate">
                        {project?.civic_address || project?.project_name || "No project address"}
                      </span>
                    </div>

                    {task.start_date && (
                      <div className="flex items-center gap-1 mt-1 text-sm text-slate-500">
                        <Clock className="h-3 w-3" />
                        <span>
                          {format(new Date(task.start_date), "MMM d")}
                          {endDate ? ` - ${format(endDate, "MMM d")}` : ""}
                        </span>
                      </div>
                    )}
                  </div>

                  <ChevronRight
                    className={`h-5 w-5 text-slate-400 transition-transform ${
                      isExpanded ? "rotate-90" : ""
                    }`}
                  />
                </button>

                {isExpanded && (
                  <div className="border-t border-slate-100 p-4 space-y-4 bg-slate-50/50">
                    <div className="space-y-2">
                      <Label className="text-xs font-medium text-slate-500 uppercase tracking-wider">
                        Update Status
                      </Label>

                      <div className="flex flex-wrap gap-2">
                        {["Not Started", "In Progress", "Completed", "On Hold"].map(
                          (status) => (
                            <Button
                              key={status}
                              variant={task.status === status ? "default" : "outline"}
                              size="sm"
                              onClick={() => handleStatusChange(task, status)}
                              className={task.status === status ? "bg-slate-900" : ""}
                              disabled={isUpdating}
                            >
                              {status}
                            </Button>
                          )
                        )}
                      </div>
                    </div>

                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id={`inspection-${task.id}`}
                        checked={!!task.city_inspection_passed}
                        onCheckedChange={(checked) =>
                          handleInspectionChange(task, checked)
                        }
                        disabled={isUpdating}
                      />
                      <Label htmlFor={`inspection-${task.id}`} className="text-sm">
                        City Inspection Passed
                      </Label>
                    </div>

                    <div className="space-y-2">
                      <Label className="text-xs font-medium text-slate-500 uppercase tracking-wider">
                        Site Photos
                      </Label>

                      <div className="grid grid-cols-3 gap-2">
                        {(task.site_photos || []).map((photo, index) => (
                          <div
                            key={`${task.id}-photo-${index}`}
                            className="relative aspect-square rounded-lg overflow-hidden group"
                          >
                            <img
                              src={photo}
                              alt={`Site photo ${index + 1}`}
                              className="w-full h-full object-cover"
                            />
                            <button
                              type="button"
                              onClick={() => removePhoto(task, index)}
                              className="absolute top-1 right-1 p-1 bg-black/50 rounded-full"
                              disabled={isUpdating}
                            >
                              <X className="h-3 w-3 text-white" />
                            </button>
                          </div>
                        ))}

                        <label className="aspect-square rounded-lg border-2 border-dashed border-slate-300 flex flex-col items-center justify-center cursor-pointer hover:border-slate-400 bg-white transition-colors">
                          {isUploading ? (
                            <Loader2 className="h-6 w-6 animate-spin text-slate-400" />
                          ) : (
                            <>
                              <Camera className="h-6 w-6 text-slate-400" />
                              <span className="text-xs text-slate-500 mt-1">Add Photo</span>
                            </>
                          )}

                          <input
                            type="file"
                            accept="image/*"
                            capture="environment"
                            onChange={(e) => handlePhotoUpload(task, e.target.files?.[0])}
                            className="hidden"
                            disabled={isUploading}
                          />
                        </label>
                      </div>
                    </div>

                    {task.notes && (
                      <div className="space-y-1">
                        <Label className="text-xs font-medium text-slate-500 uppercase tracking-wider">
                          Notes
                        </Label>
                        <p className="text-sm text-slate-600 bg-white p-3 rounded-lg">
                          {task.notes}
                        </p>
                      </div>
                    )}
                  </div>
                )}
              </Card>
            );
          })
        )}
      </div>
    </div>
  );
}
