import { useMemo, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { CheckCircle2, Clock3, FileText, Pencil, Plus, Search, ShieldAlert, Users } from "lucide-react";
import { Link } from "react-router-dom";
import FormSaveStateNotice from "@/components/forms/FormSaveStateNotice";
import ManagementLayout from "@/components/management/ManagementLayout";
import BuildOsTaskForm, {
  createTaskFormState,
  type BuildOsTaskFormState,
} from "@/components/tasks/BuildOsTaskForm";
import Badge from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import Input from "@/components/ui/input";
import { toast } from "@/components/ui/sonner";
import useUnsavedChangesGuard from "@/hooks/useUnsavedChangesGuard";
import { fetchManagementProjects } from "@/lib/managementData";
import { getTaskAssigneeLabel, isTaskDueSoon, isTaskOverdue } from "@/lib/buildosTasks";
import {
  loadMasterDatabaseRecords,
  loadTasks,
  saveTask,
  type BuildOsTask,
} from "@/lib/buildosShared";
import { getVendorInsightByRecordId } from "@/lib/vendorMemory";

function cycleStatus(status: BuildOsTask["status"]): BuildOsTask["status"] {
  switch (status) {
    case "Not Started":
      return "In Progress";
    case "In Progress":
      return "Waiting Review";
    case "Waiting Review":
      return "Completed";
    case "Blocked":
      return "In Progress";
    default:
      return "Not Started";
  }
}

export default function ManagementMobileTasks() {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [showForm, setShowForm] = useState(false);
  const [editingRecord, setEditingRecord] = useState<BuildOsTask | null>(null);
  const [form, setForm] = useState<BuildOsTaskFormState>(createTaskFormState());
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
    () => new Map(projects.map((project) => [project.id, project.project_name])),
    [projects]
  );

  const filteredTasks = useMemo(() => {
    const query = search.trim().toLowerCase();
    return tasks.filter((task) => {
      const matchesSearch =
        !query ||
        task.title.toLowerCase().includes(query) ||
        (task.mobileNote || "").toLowerCase().includes(query) ||
        (projectMap.get(task.projectId) || "").toLowerCase().includes(query);
      const matchesStatus = statusFilter === "all" || task.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [projectMap, search, statusFilter, tasks]);

  const mobileSummary = useMemo(() => {
    const dueSoon = tasks.filter((task) => isTaskDueSoon(task)).length;
    const overdue = tasks.filter((task) => isTaskOverdue(task)).length;
    const blocked = tasks.filter((task) => task.status === "Blocked").length;
    const review = tasks.filter((task) => task.status === "Waiting Review").length;

    return {
      dueSoon,
      overdue,
      blocked,
      review,
    };
  }, [tasks]);

  const openForm = (record?: BuildOsTask | null) => {
    setEditingRecord(record || null);
    const nextState = createTaskFormState(record);
    setForm(nextState);
    setInitialFingerprint(JSON.stringify(nextState));
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
      "Discard the unsaved field-task changes? This form does not autosave until you click Save.",
    isDirty,
    onConfirmClose: () => {
      setShowForm(false);
      setEditingRecord(null);
    },
    open: showForm,
    saving,
  });

  const saveAndRefresh = async (record: Partial<BuildOsTask>) => {
    await saveTask(record);
    await queryClient.invalidateQueries({
      predicate: (query) =>
        Array.isArray(query.queryKey) &&
        typeof query.queryKey[0] === "string" &&
        query.queryKey[0].startsWith("buildos"),
    });
  };

  return (
    <ManagementLayout currentPageName="mobile-tasks">
      <div className="space-y-6">
        <div className="dashboard-panel overflow-hidden p-8">
          <div className="absolute inset-y-0 right-0 w-44 bg-gradient-to-l from-enc-yellow/10 via-enc-orange/10 to-transparent" />
          <div className="relative flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.3em] text-enc-orange">
                Beta Field Updates
              </p>
              <h1 className="mt-3 text-3xl font-bold text-foreground">Mobile Tasks</h1>
              <p className="mt-4 max-w-4xl text-sm leading-6 text-muted-foreground">
                This beta mobile surface writes back into the same BuildOS task model used on desktop. Keep updates short, tap-friendly, and operational.
              </p>
            </div>
            <Button
              className="rounded-full bg-gradient-to-r from-enc-red via-enc-orange to-enc-yellow text-white shadow-glow"
              onClick={() => openForm()}
            >
              <Plus className="mr-2 h-4 w-4" />
              Quick Add Task
            </Button>
          </div>
        </div>

        <Card className="dashboard-panel p-2">
          <CardHeader>
            <CardTitle className="text-xl text-foreground">Find field work</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4 md:grid-cols-[minmax(0,1fr)_220px]">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                className="pl-10"
                placeholder="Search by task, project, or field note"
              />
            </div>
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

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <Card className="dashboard-panel p-2">
            <CardContent className="p-5">
              <p className="text-sm font-medium text-muted-foreground">Due soon</p>
              <p className="mt-3 text-3xl font-semibold text-foreground">{mobileSummary.dueSoon}</p>
            </CardContent>
          </Card>
          <Card className="dashboard-panel p-2">
            <CardContent className="p-5">
              <p className="text-sm font-medium text-muted-foreground">Overdue</p>
              <p className="mt-3 text-3xl font-semibold text-foreground">{mobileSummary.overdue}</p>
            </CardContent>
          </Card>
          <Card className="dashboard-panel p-2">
            <CardContent className="p-5">
              <p className="text-sm font-medium text-muted-foreground">Blocked</p>
              <p className="mt-3 text-3xl font-semibold text-foreground">{mobileSummary.blocked}</p>
            </CardContent>
          </Card>
          <Card className="dashboard-panel p-2">
            <CardContent className="p-5">
              <p className="text-sm font-medium text-muted-foreground">Waiting review</p>
              <p className="mt-3 text-3xl font-semibold text-foreground">{mobileSummary.review}</p>
            </CardContent>
          </Card>
        </div>

        <Card className="dashboard-panel p-2">
          <CardHeader>
            <CardTitle className="text-xl text-foreground">Field quick actions</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            <Button asChild variant="outline" className="h-auto min-h-24 rounded-2xl justify-start px-5 py-4">
              <Link to="/management/daily-log">
                <div className="text-left">
                  <p className="flex items-center gap-2 text-base font-semibold">
                    <Clock3 className="h-4 w-4" />
                    Daily Log
                  </p>
                  <p className="mt-2 text-sm leading-6 text-muted-foreground">
                    Capture weather, crews, blockers, and site notes without leaving the field workflow.
                  </p>
                </div>
              </Link>
            </Button>
            <Button asChild variant="outline" className="h-auto min-h-24 rounded-2xl justify-start px-5 py-4">
              <Link to="/management/deficiency-punch-list">
                <div className="text-left">
                  <p className="flex items-center gap-2 text-base font-semibold">
                    <ShieldAlert className="h-4 w-4" />
                    Deficiencies
                  </p>
                  <p className="mt-2 text-sm leading-6 text-muted-foreground">
                    Open, assign, and close field issues tied back to the real project and responsible party.
                  </p>
                </div>
              </Link>
            </Button>
            <Button asChild variant="outline" className="h-auto min-h-24 rounded-2xl justify-start px-5 py-4">
              <Link to="/management/documents">
                <div className="text-left">
                  <p className="flex items-center gap-2 text-base font-semibold">
                    <FileText className="h-4 w-4" />
                    Documents
                  </p>
                  <p className="mt-2 text-sm leading-6 text-muted-foreground">
                    Pull permits, insurance, drawings, and support files without hunting through email.
                  </p>
                </div>
              </Link>
            </Button>
            <Button asChild variant="outline" className="h-auto min-h-24 rounded-2xl justify-start px-5 py-4">
              <Link to="/management/vendors">
                <div className="text-left">
                  <p className="flex items-center gap-2 text-base font-semibold">
                    <Users className="h-4 w-4" />
                    Vendors (Trades)
                  </p>
                  <p className="mt-2 text-sm leading-6 text-muted-foreground">
                    Reach the right trade, check notes, and stay relationship-aware while work is moving onsite.
                  </p>
                </div>
              </Link>
            </Button>
          </CardContent>
        </Card>

        <div className="grid gap-4">
          {filteredTasks.length ? (
            filteredTasks.map((task) => {
              const vendorInsight = getVendorInsightByRecordId(records, task.assignedRecordId);

              return (
              <Card key={task.id} className="dashboard-panel p-2">
                <CardContent className="space-y-4 p-5">
                  <div className="flex items-start gap-4">
                    <div className="mt-1">
                      {task.status === "Completed" ? (
                        <CheckCircle2 className="h-6 w-6 text-emerald-600" />
                      ) : (
                        <Clock3 className="h-6 w-6 text-enc-orange" />
                      )}
                    </div>
                    <div className="flex-1 space-y-3">
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="text-lg font-semibold text-foreground">{task.title}</p>
                        <Badge className="rounded-full bg-muted text-muted-foreground">
                          {task.status}
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
                        {isTaskOverdue(task) ? (
                          <Badge className="rounded-full bg-rose-500/10 text-rose-700 dark:text-rose-300">
                            Overdue
                          </Badge>
                        ) : isTaskDueSoon(task) ? (
                          <Badge className="rounded-full bg-amber-500/10 text-amber-700 dark:text-amber-300">
                            Due Soon
                          </Badge>
                        ) : null}
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {projectMap.get(task.projectId) || "Unlinked project"} · {task.phase}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        Assignee: {getTaskAssigneeLabel(task, records)}
                      </p>
                      {vendorInsight ? (
                        <p className="text-sm text-muted-foreground">
                          Vendor memory: {vendorInsight.deficiencyCount} repeat issue{vendorInsight.deficiencyCount === 1 ? "" : "s"} | Work again: {vendorInsight.workAgain}
                        </p>
                      ) : null}
                      <p className="text-xs text-muted-foreground">
                        Audit: {task.lastUpdatedBy || "Actor not recorded"} | {task.updatedAt}
                      </p>
                      {task.mobileNote ? (
                        <div className="rounded-2xl border border-border/70 bg-background/80 px-4 py-3 text-sm leading-6 text-muted-foreground">
                          {task.mobileNote}
                        </div>
                      ) : null}
                    </div>
                  </div>

                  <div className="grid gap-3 sm:grid-cols-2">
                    <Button
                      variant="outline"
                      className="h-12 rounded-2xl"
                      onClick={() =>
                        void saveAndRefresh({
                          ...task,
                          status: cycleStatus(task.status),
                          percentComplete:
                            task.status === "Waiting Review"
                              ? 100
                              : task.status === "In Progress"
                                ? Math.max(75, task.percentComplete)
                                : Math.max(25, task.percentComplete),
                        })
                      }
                    >
                      Advance Status
                    </Button>
                    <Button variant="outline" className="h-12 rounded-2xl" onClick={() => openForm(task)}>
                      <Pencil className="mr-2 h-4 w-4" />
                      Edit Details
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })
          ) : (
            <Card className="dashboard-panel p-2">
              <CardContent className="p-6 text-sm leading-6 text-muted-foreground">
                No task records are available for the current filter. This beta view stays empty instead of fabricating field work.
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      <Dialog open={showForm} onOpenChange={(nextOpen) => !nextOpen && handleAttemptClose()}>
        <DialogContent className="max-h-[90vh] max-w-4xl overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingRecord ? "Update Field Task" : "New Field Task"}</DialogTitle>
          </DialogHeader>
          <form
            onSubmit={async (event) => {
              event.preventDefault();
              try {
                setSaving(true);
                await saveAndRefresh({
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
                setInitialFingerprint(JSON.stringify(form));
                setLastSavedAt(new Date().toISOString());
                toast.success(
                  editingRecord
                    ? "Field-task changes were saved to ENCI BuildOS."
                    : "Field task was added to ENCI BuildOS."
                );
                setShowForm(false);
                setEditingRecord(null);
              } finally {
                setSaving(false);
              }
            }}
            className="space-y-6"
          >
            <FormSaveStateNotice
              isDirty={isDirty}
              lastSavedAt={lastSavedAt}
              message="This form does not autosave. Click Save to persist the field task in ENCI BuildOS."
              saving={saving}
            />
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
              <Button type="submit" disabled={saving}>{editingRecord ? "Save Update" : "Create Task"}</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </ManagementLayout>
  );
}
