import React, { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Search, Loader2, Plus, CheckCircle2, Clock } from "lucide-react";

type Project = {
  id: string;
  project_name?: string;
};

type Task = {
  id: string;
  project_id?: string;
  task_name?: string;
  status?: string;
  assigned_to?: string;
};

async function fetchJson(url: string, options: RequestInit = {}): Promise<any> {
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

export default function ManagementMobileTasks() {
  const [search, setSearch] = useState("");
  const [projectFilter, setProjectFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");

  const { data: tasks = [], isLoading: loadingTasks } = useQuery<Task[]>({
    queryKey: ["tasks"],
    queryFn: () => fetchJson("/api/management/tasks"),
  });

  const { data: projects = [] } = useQuery<Project[]>({
    queryKey: ["projects"],
    queryFn: () => fetchJson("/api/management/projects"),
  });

  const projectMap = useMemo(() => {
    return projects.reduce<Record<string, Project>>((acc, project: Project) => {
      acc[project.id] = project;
      return acc;
    }, {});
  }, [projects]);

  const filteredTasks = useMemo(() => {
    const lowerSearch = search.toLowerCase().trim();

    return tasks.filter((task: Task) => {
      const project = task.project_id
        ? projectMap[task.project_id]
        : undefined;

      const matchesSearch =
        lowerSearch === ""
          ? true
          : task.task_name?.toLowerCase().includes(lowerSearch) ||
            project?.project_name?.toLowerCase().includes(lowerSearch);

      const matchesProject =
        projectFilter === "all" || task.project_id === projectFilter;

      const matchesStatus =
        statusFilter === "all" || task.status === statusFilter;

      return matchesSearch && matchesProject && matchesStatus;
    });
  }, [tasks, projectMap, search, projectFilter, statusFilter]);

  const completedCount = filteredTasks.filter(
    (t: Task) => t.status === "Completed"
  ).length;

  if (loadingTasks) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 p-8">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold mb-2">Mobile Tasks</h1>
          <p className="text-slate-600">
            {completedCount} of {filteredTasks.length} completed
          </p>
        </div>

        <Button className="bg-slate-900 hover:bg-slate-800">
          <Plus className="mr-2 h-4 w-4" />
          New Task
        </Button>
      </div>

      <Card className="mb-8">
        <CardContent className="pt-6">
          <div className="flex flex-col gap-4 md:flex-row md:items-center">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
              <Input
                placeholder="Search tasks..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10"
              />
            </div>

            <div className="flex gap-2">
              <span className="text-sm font-medium text-slate-600 py-2">
                Project:
              </span>
              <select
                value={projectFilter}
                onChange={(e) => setProjectFilter(e.target.value)}
                className="px-3 py-2 border border-slate-300 rounded-md text-sm"
              >
                <option value="all">All Projects</option>
                {projects.map((project: Project) => (
                  <option key={project.id} value={project.id}>
                    {project.project_name || "Unnamed"}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex gap-2">
              <span className="text-sm font-medium text-slate-600 py-2">
                Status:
              </span>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-3 py-2 border border-slate-300 rounded-md text-sm"
              >
                <option value="all">All</option>
                <option value="Pending">Pending</option>
                <option value="Completed">Completed</option>
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-4">
        {filteredTasks.map((task: Task) => {
          const project = task.project_id
            ? projectMap[task.project_id]
            : undefined;
          const isCompleted = task.status === "Completed";

          return (
            <Card key={task.id}>
              <CardContent className="pt-6">
                <div className="flex items-start gap-4">
                  <div className="mt-1">
                    {isCompleted ? (
                      <CheckCircle2 className="h-6 w-6 text-emerald-600" />
                    ) : (
                      <Clock className="h-6 w-6 text-slate-400" />
                    )}
                  </div>

                  <div className="flex-1">
                    <p className="font-semibold text-lg">{task.task_name}</p>
                    <p className="text-sm text-slate-600 mb-2">
                      {project?.project_name || "—"}
                    </p>
                    {task.assigned_to && (
                      <p className="text-sm text-slate-600">
                        Assigned to: {task.assigned_to}
                      </p>
                    )}
                  </div>

                  <div
                    className={`px-3 py-1 rounded text-sm font-medium ${
                      isCompleted
                        ? "bg-emerald-50 text-emerald-700"
                        : "bg-amber-50 text-amber-700"
                    }`}
                  >
                    {task.status || "Pending"}
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {filteredTasks.length === 0 && (
        <div className="text-center py-12">
          <p className="text-slate-600">No tasks found</p>
        </div>
      )}
    </div>
  );
}
