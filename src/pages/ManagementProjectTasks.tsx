import { useMemo, useState } from "react";
import type { FormEvent } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Pencil, Plus, Search, TimerReset, Trash2 } from "lucide-react";
import FormSaveStateNotice from "@/components/forms/FormSaveStateNotice";
import ManagementLayout from "@/components/management/ManagementLayout";
import BuildOsTaskForm, {
  createTaskFormState,
  type BuildOsTaskFormState,
} from "@/components/tasks/BuildOsTaskForm";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import Badge from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import Input from "@/components/ui/input";
import { toast } from "@/components/ui/sonner";
import useUnsavedChangesGuard from "@/hooks/useUnsavedChangesGuard";
import { fetchManagementProjects } from "@/lib/managementData";
import {
  deleteTask,
  loadMasterDatabaseRecords,
  loadTasks,
  saveTask,
  type BuildOsTask,
} from "@/lib/buildosShared";
import {
  getTaskSummary,
  getProjectTaskSummary,
  getTaskAssigneeLabel,
  isTaskDueSoon,
  isTaskOverdue,
} from "@/lib/buildosTasks";
import { getVendorInsightByRecordId } from "@/lib/vendorMemory";

function getStatusBadge(status: BuildOsTask["status"]) {
  if (status === "Completed") {
    return "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300";
  }

  if (status === "Blocked") {
    return "bg-rose-500/10 text-rose-700 dark:text-rose-300";
  }

  if (status === "Waiting Review") {
    return "bg-blue-500/10 text-blue-700 dark:text-blue-300";
  }

  if (status === "In Progress") {
    return "bg-amber-500/10 text-amber-700 dark:text-amber-300";
  }

  return "bg-muted text-muted-foreground";
}

function getPriorityBadge(priority: BuildOsTask["priority"]) {
  if (priority === "Critical") {
    return "bg-rose-500/10 text-rose-700 dark:text-rose-300";
  }

  if (priority === "High") {
    return "bg-amber-500/10 text-amber-700 dark:text-amber-300";
  }

  if (priority === "Medium") {
    return "bg-blue-500/10 text-blue-700 dark:text-blue-300";
  }

  return "bg-muted text-muted-foreground";
}

function invalidateBuildOsQueries(queryClient: ReturnType<typeof useQueryClient>) {
  return queryClient.invalidateQueries({
    predicate: (query) =>
      Array.isArray(query.queryKey) &&
      typeof query.queryKey[0] === "string" &&
      (query.queryKey[0].startsWith("buildos") || query.queryKey[0].startsWith("management")),
  });
}

export default function ManagementProjectTasks() {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [projectFilter, setProjectFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [showForm, setShowForm] = useState(false);
  const [editingRecord, setEditingRecord] = useState<BuildOsTask | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<BuildOsTask | null>(null);
  const [form, setForm] = useState<BuildOsTaskFormState>(createTaskFormState());
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const [initialFingerprint, setInitialFingerprint] = useState(
    JSON.stringify(createTaskFormState())
  );
  const [lastSavedAt, setLastSavedAt] = useState<string | null>(null);

  const { data: projects = [] } = useQuery({
    queryKey: ["management-projects"],
    queryFn: fetchManagementProjects,
  });
  const { data: records = [] } = useQuery({
    queryKey: ["buildos-master-database"],
    queryFn: async () => loadMasterDatabaseRecords(),
  });
  const { data: tasks = [] } = useQuery({
    queryKey: ["buildos-tasks"],
    queryFn: async () => loadTasks(),
  });

  const projectMap = useMemo(
    () => new Map(projects.map((project) => [project.id, project])),
    [projects]
  );

  const filteredTasks = useMemo(() => {
    const query = search.trim().toLowerCase();
    return tasks.filter((task) => {
      const project = projectMap.get(task.projectId);
      const assignee = getTaskAssigneeLabel(task, records).toLowerCase();
      const matchesSearch =
        !query ||
        task.title.toLowerCase().includes(query) ||
        (task.description || "").toLowerCase().includes(query) ||
        (project?.project_name || "").toLowerCase().includes(query) ||
        assignee.includes(query);
      const matchesProject = projectFilter === "all" || task.projectId === projectFilter;
      const matchesStatus = statusFilter === "all" || task.status === statusFilter;
      return matchesSearch && matchesProject && matchesStatus;
    });
  }, [projectFilter, projectMap, records, search, statusFilter, tasks]);

  const summary = useMemo(
    () =>
      projectFilter === "all"
        ? getTaskSummary(tasks)
        : getProjectTaskSummary(projectFilter, tasks),
    [projectFilter, tasks]
  );

  const openForm = (record?: BuildOsTask | null) => {
    setEditingRecord(record || null);
    const nextState = createTaskFormState(record);
    setForm(nextState);
    setInitialFingerprint(JSON.stringify(nextState));
    setError("");
    setSaving(false);
    setLastSavedAt(null);
    setShowForm(true);
  };
  const isDirty = useMemo(
    () => JSON.stringify(form) !== initialFingerprint,
    [form, initialFingerprint]
  );
  const handleAttemptClose = useUnsavedChangesGuard({
    discardMessage:
      "Discard the unsaved task changes? This form does not autosave until you click Save.",
    isDirty,
    onConfirmClose: () => {
      setShowForm(false);
      setEditingRecord(null);
    },
    open: showForm,
    saving,
  });

  const handleSave = async (event: FormEvent) => {
    event.preventDefault();
    setError("");

    if (!form.projectId || !form.title.trim()) {
      setError("Project and task title are required.");
      return;
    }

    if (form.startDate && form.dueDate && new Date(form.dueDate) < new Date(form.startDate)) {
      setError("Due date cannot be earlier than start date.");
      return;
    }

    try {
      setSaving(true);
      await saveTask({
        id: editingRecord?.id,
        projectId: form.projectId,
        title: form.title,
        description: form.description,
        location: form.location,
        phase: form.phase,
        status: form.status,
        priority: form.priority,
        assignedRecordId: form.assignedRecordId || undefined,
        assignedLabel: form.assignedLabel,
        startDate: form.startDate,
        dueDate: form.dueDate,
        milestone: form.milestone,
        predecessorIds: form.predecessorIds,
        inspectionDate: form.inspectionDate,
        percentComplete: Number(form.percentComplete) || 0,
        mobileNote: form.mobileNote,
        lastUpdatedBy: form.lastUpdatedBy,
      });

      await invalidateBuildOsQueries(queryClient);
      setInitialFingerprint(JSON.stringify(form));
      setLastSavedAt(new Date().toISOString());
      toast.success(
        editingRecord
          ? "Task changes were saved to ENCI BuildOS."
          : "Task was added to ENCI BuildOS."
      );
      setShowForm(false);
      setEditingRecord(null);
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : "Failed to save task.");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    await deleteTask(deleteTarget.id);
    setDeleteTarget(null);
    await invalidateBuildOsQueries(queryClient);
  };

  return (
    <ManagementLayout currentPageName="tasks">
      <div className="space-y-6">
        <div className="dashboard-panel overflow-hidden p-8">
          <div className="absolute inset-y-0 right-0 w-44 bg-gradient-to-l from-enc-yellow/10 via-enc-orange/10 to-transparent" />
          <div className="relative flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.3em] text-enc-orange">
                Execution Control
              </p>
              <h1 className="mt-3 text-3xl font-bold text-foreground">Project Tasks</h1>
              <p className="mt-4 max-w-4xl text-sm leading-6 text-muted-foreground">
                Tasks now run on a shared BuildOS task model used by project views, schedule controls, Gantt visibility, mobile updates, and automation warnings. Keep entries lean and accountable.
              </p>
            </div>

            <Button
              className="rounded-full bg-gradient-to-r from-enc-red via-enc-orange to-enc-yellow text-white shadow-glow"
              onClick={() => openForm()}
            >
              <Plus className="mr-2 h-4 w-4" />
              Add Task
            </Button>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <Card className="dashboard-panel p-2">
            <CardContent className="p-5">
              <p className="text-sm font-medium text-muted-foreground">Visible tasks</p>
              <p className="mt-3 text-3xl font-semibold text-foreground">{filteredTasks.length}</p>
            </CardContent>
          </Card>
          <Card className="dashboard-panel p-2">
            <CardContent className="p-5">
              <p className="text-sm font-medium text-muted-foreground">Overdue</p>
              <p className="mt-3 text-3xl font-semibold text-foreground">{summary.overdue}</p>
            </CardContent>
          </Card>
          <Card className="dashboard-panel p-2">
            <CardContent className="p-5">
              <p className="text-sm font-medium text-muted-foreground">Blocked</p>
              <p className="mt-3 text-3xl font-semibold text-foreground">{summary.blocked}</p>
            </CardContent>
          </Card>
          <Card className="dashboard-panel p-2">
            <CardContent className="p-5">
              <p className="text-sm font-medium text-muted-foreground">Milestones</p>
              <p className="mt-3 text-3xl font-semibold text-foreground">{summary.milestones}</p>
            </CardContent>
          </Card>
        </div>

        <Card className="dashboard-panel p-2">
          <CardHeader>
            <CardTitle className="text-xl text-foreground">Filter task register</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_220px_220px]">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                className="pl-10"
                placeholder="Search by task, project, description, or assignee"
              />
            </div>
            <select
              value={projectFilter}
              onChange={(event) => setProjectFilter(event.target.value)}
              className="flex h-10 rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground"
            >
              <option value="all">All projects</option>
              {projects.map((project) => (
                <option key={project.id} value={project.id}>
                  {project.project_name}
                </option>
              ))}
            </select>
            <select
              value={statusFilter}
              onChange={(event) => setStatusFilter(event.target.value)}
              className="flex h-10 rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground"
            >
              <option value="all">All statuses</option>
              <option value="Not Started">Not Started</option>
              <option value="In Progress">In Progress</option>
              <option value="Blocked">Blocked</option>
              <option value="Waiting Review">Waiting Review</option>
              <option value="Completed">Completed</option>
            </select>
          </CardContent>
        </Card>

        {filteredTasks.length ? (
          <div className="grid gap-4">
            {filteredTasks.map((task) => {
              const project = projectMap.get(task.projectId);
              const overdue = isTaskOverdue(task);
              const dueSoon = isTaskDueSoon(task);
              const predecessorTitles = task.predecessorIds
                .map((taskId) => tasks.find((item) => item.id === taskId)?.title)
                .filter(Boolean);
              const vendorInsight = getVendorInsightByRecordId(records, task.assignedRecordId);

              return (
                <Card key={task.id} className="dashboard-panel p-2">
                  <CardContent className="space-y-4 p-6">
                    <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                      <div className="space-y-3">
                        <div className="flex flex-wrap items-center gap-2">
                          <h2 className="text-xl font-semibold text-foreground">{task.title}</h2>
                          <Badge className={`rounded-full ${getStatusBadge(task.status)}`}>
                            {task.status}
                          </Badge>
                          <Badge className={`rounded-full ${getPriorityBadge(task.priority)}`}>
                            {task.priority}
                          </Badge>
                          {task.milestone ? (
                            <Badge className="rounded-full bg-enc-orange/10 text-enc-orange">
                              Milestone
                            </Badge>
                          ) : null}
                          {vendorInsight ? (
                            <Badge
                              className={
                                vendorInsight.riskStatus === "High Risk Vendor"
                                  ? "rounded-full bg-rose-500/10 text-rose-700 dark:text-rose-300"
                                  : vendorInsight.riskStatus === "Use with Caution"
                                    ? "rounded-full bg-amber-500/10 text-amber-700 dark:text-amber-300"
                                    : "rounded-full bg-emerald-500/10 text-emerald-700 dark:text-emerald-300"
                              }
                            >
                              {vendorInsight.riskStatus}
                            </Badge>
                          ) : null}
                          {overdue ? (
                            <Badge className="rounded-full bg-rose-500/10 text-rose-700 dark:text-rose-300">
                              Overdue
                            </Badge>
                          ) : dueSoon ? (
                            <Badge className="rounded-full bg-amber-500/10 text-amber-700 dark:text-amber-300">
                              Due soon
                            </Badge>
                          ) : null}
                        </div>

                        <p className="text-sm text-muted-foreground">
                          {project?.project_name || "Unlinked project"} · {task.phase}
                        </p>
                        {task.description ? (
                          <p className="text-sm leading-6 text-muted-foreground">{task.description}</p>
                        ) : null}

                        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
                          <div className="dashboard-item p-3">
                            <p className="text-sm font-medium text-foreground">Assignee</p>
                            <p className="mt-2 text-sm text-muted-foreground">
                              {getTaskAssigneeLabel(task, records)}
                            </p>
                          </div>
                          <div className="dashboard-item p-3">
                            <p className="text-sm font-medium text-foreground">Dates</p>
                            <p className="mt-2 text-sm text-muted-foreground">
                              {task.startDate || "Start TBD"} to {task.dueDate || "Due TBD"}
                            </p>
                          </div>
                          <div className="dashboard-item p-3">
                            <p className="text-sm font-medium text-foreground">Progress</p>
                            <p className="mt-2 text-sm text-muted-foreground">{task.percentComplete}%</p>
                          </div>
                          <div className="dashboard-item p-3">
                            <p className="text-sm font-medium text-foreground">Updated by</p>
                            <p className="mt-2 text-sm text-muted-foreground">
                              {task.lastUpdatedBy || "Not recorded"}
                            </p>
                            <p className="mt-1 text-xs text-muted-foreground">
                              Last changed {task.updatedAt}
                            </p>
                          </div>
                        </div>
                        {vendorInsight ? (
                          <div className="dashboard-item p-3 text-sm text-muted-foreground">
                            Vendor memory: {vendorInsight.label} · {vendorInsight.deficiencyCount} repeat issue{vendorInsight.deficiencyCount === 1 ? "" : "s"} · Work again: {vendorInsight.workAgain}
                          </div>
                        ) : null}

                        {predecessorTitles.length ? (
                          <div className="dashboard-item p-3 text-sm leading-6 text-muted-foreground">
                            Depends on: {predecessorTitles.join(", ")}
                          </div>
                        ) : null}
                        {task.mobileNote ? (
                          <div className="dashboard-item p-3 text-sm leading-6 text-muted-foreground">
                            Field note: {task.mobileNote}
                          </div>
                        ) : null}
                      </div>

                      <div className="flex flex-wrap gap-2">
                        <Button variant="outline" className="rounded-full" onClick={() => openForm(task)}>
                          <Pencil className="mr-2 h-4 w-4" />
                          Edit
                        </Button>
                        <Button
                          variant="outline"
                          className="rounded-full text-rose-600 hover:text-rose-700"
                          onClick={() => setDeleteTarget(task)}
                        >
                          <Trash2 className="mr-2 h-4 w-4" />
                          Remove
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        ) : (
          <Card className="dashboard-panel p-2">
            <CardContent className="space-y-4 p-6">
              <p className="text-base font-semibold text-foreground">No task records match the current filter</p>
              <p className="max-w-3xl text-sm leading-6 text-muted-foreground">
                This module stays honest: if there are no real tasks, it does not fabricate a schedule. Add the first task to activate Gantt, mobile task handling, and execution alerts.
              </p>
            </CardContent>
          </Card>
        )}

        <Card className="dashboard-panel p-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-xl text-foreground">
              <TimerReset className="h-5 w-5 text-enc-orange" />
              Practical rules for this module
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm leading-6 text-muted-foreground">
            <p>Keep tasks short, assigned, and date-linked.</p>
            <p>Use milestones only for schedule-driving checkpoints.</p>
            <p>Use predecessor links only when a real dependency exists.</p>
          </CardContent>
        </Card>
      </div>

      <Dialog open={showForm} onOpenChange={(nextOpen) => !nextOpen && handleAttemptClose()}>
        <DialogContent className="max-h-[90vh] max-w-4xl overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingRecord ? "Edit Task" : "New Task"}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSave} className="space-y-6">
            <FormSaveStateNotice
              isDirty={isDirty}
              lastSavedAt={lastSavedAt}
              message="This form does not autosave. Click Save to persist the task in ENCI BuildOS."
              saving={saving}
            />
            {error ? (
              <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
                {error}
              </div>
            ) : null}
            <BuildOsTaskForm
              form={form}
              projects={projects}
              records={records}
              predecessorOptions={tasks.filter((task) => task.id !== editingRecord?.id && task.projectId === (form.projectId || editingRecord?.projectId))}
              onChange={setForm}
            />
            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={handleAttemptClose}>
                Cancel
              </Button>
              <Button type="submit" disabled={saving}>{editingRecord ? "Update Task" : "Save Task"}</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      <AlertDialog open={Boolean(deleteTarget)} onOpenChange={() => setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remove task</AlertDialogTitle>
            <AlertDialogDescription>
              Remove "{deleteTarget?.title}" from the execution register?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction className="bg-rose-600 hover:bg-rose-700" onClick={() => void handleDelete()}>
              Remove
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </ManagementLayout>
  );
}
