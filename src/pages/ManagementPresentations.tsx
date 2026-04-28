import { useMemo, useState } from "react";
import type { FormEvent } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
  FileDown,
  Pencil,
  Plus,
  RotateCcw,
  Search,
  ShieldAlert,
  Trash2,
  XCircle,
} from "lucide-react";
import ManagementLayout from "@/components/management/ManagementLayout";
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
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import Input from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/components/ui/sonner";
import { exportPresentationPdf } from "@/lib/buildosClientOutputs";
import {
  appendBuildOsAuditEntry,
  BUILDOS_PRESENTATION_TYPES,
  BUILDOS_VISIBILITY_LEVELS,
  BUILDOS_WORKFLOW_STATUSES,
  type BuildOsPresentationRecord,
} from "@/lib/buildosWorkspace";
import {
  deletePresentation,
  loadPresentations,
  purgePresentation,
  restorePresentation,
  savePresentation,
} from "@/lib/buildosShared";
import {
  fetchManagementJson,
  fetchManagementProjects,
  formatDate,
} from "@/lib/managementData";

type PresentationFormState = {
  budgetSnapshot: string;
  deckUrl: string;
  imageUrl: string;
  internalReviewNotes: string;
  permitStatus: string;
  preparedFor: string;
  presentationType: BuildOsPresentationRecord["presentationType"];
  projectId: string;
  riskRegister: string;
  safeForExternal: boolean;
  scheduleMilestones: string;
  scopeSummary: string;
  status: BuildOsPresentationRecord["status"];
  summary: string;
  title: string;
  visibility: BuildOsPresentationRecord["visibility"];
  nextSteps: string;
};

type ManagementSessionResponse = {
  authenticated: boolean;
  user: {
    app_role: string;
    username: string;
  } | null;
};

function initialForm(record?: BuildOsPresentationRecord | null): PresentationFormState {
  return {
    budgetSnapshot: record?.budgetSnapshot || "",
    deckUrl: record?.deckUrl || "",
    imageUrl: record?.imageUrl || "",
    internalReviewNotes: record?.internalReviewNotes || "",
    permitStatus: record?.permitStatus || "",
    preparedFor: record?.preparedFor || "",
    presentationType: record?.presentationType || "Internal Deck",
    projectId: record?.projectId || "",
    riskRegister: record?.riskRegister || "",
    safeForExternal: record?.safeForExternal || false,
    scheduleMilestones: record?.scheduleMilestones || "",
    scopeSummary: record?.scopeSummary || "",
    status: record?.status || "Draft",
    summary: record?.summary || "",
    title: record?.title || "",
    visibility: record?.visibility || "Internal",
    nextSteps: record?.nextSteps || "",
  };
}

export default function ManagementPresentations() {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [showArchived, setShowArchived] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editingRecord, setEditingRecord] = useState<BuildOsPresentationRecord | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<BuildOsPresentationRecord | null>(null);
  const [deleteReason, setDeleteReason] = useState("");
  const [form, setForm] = useState<PresentationFormState>(initialForm());
  const [saving, setSaving] = useState(false);

  const { data: session } = useQuery({
    queryKey: ["management-session"],
    queryFn: async () =>
      fetchManagementJson<ManagementSessionResponse>("/api/management/session"),
  });
  const { data: projects = [] } = useQuery({
    queryKey: ["management-projects"],
    queryFn: fetchManagementProjects,
  });
  const { data: records = [] } = useQuery({
    queryKey: ["buildos-presentations", showArchived],
    queryFn: async () => loadPresentations({ includeDeleted: showArchived }),
  });

  const projectMap = useMemo(
    () => new Map(projects.map((project) => [project.id, project])),
    [projects]
  );
  const username = session?.user?.username || "ENCI BuildOS";
  const isAdmin = session?.user?.app_role === "Admin";

  const visibleRecords = useMemo(() => {
    const query = search.trim().toLowerCase();
    return records.filter((record) => {
      const projectName = projectMap.get(record.projectId)?.project_name || "";
      return (
        !query ||
        record.title.toLowerCase().includes(query) ||
        projectName.toLowerCase().includes(query) ||
        record.preparedFor.toLowerCase().includes(query)
      );
    });
  }, [projectMap, records, search]);

  const summary = useMemo(
    () => ({
      approved: records.filter((record) => record.status === "Approved").length,
      archived: records.filter((record) => Boolean(record.deletedAt)).length,
      exported: records.filter((record) => record.status === "Exported").length,
      total: records.filter((record) => !record.deletedAt).length,
    }),
    [records]
  );

  const resetForm = (record?: BuildOsPresentationRecord | null) => {
    setEditingRecord(record || null);
    setForm(initialForm(record));
    setShowForm(true);
  };

  async function refreshRecords() {
    await queryClient.invalidateQueries({ queryKey: ["buildos-presentations"] });
  }

  async function handleSave(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);

    try {
      await savePresentation({
        ...(editingRecord || {}),
        budgetSnapshot: form.budgetSnapshot,
        deckUrl: form.deckUrl,
        imageUrl: form.imageUrl,
        internalReviewNotes: form.internalReviewNotes,
        permitStatus: form.permitStatus,
        preparedFor: form.preparedFor,
        presentationType: form.presentationType,
        projectId: form.projectId,
        riskRegister: form.riskRegister,
        safeForExternal: form.safeForExternal,
        scheduleMilestones: form.scheduleMilestones,
        scopeSummary: form.scopeSummary,
        status: form.status,
        summary: form.summary,
        title: form.title,
        updatedBy: username,
        visibility: form.visibility,
      });

      toast.success("Presentation record saved.");
      setShowForm(false);
      await refreshRecords();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Presentation could not be saved.");
    } finally {
      setSaving(false);
    }
  }

  async function handleApprove(record: BuildOsPresentationRecord) {
    try {
      await savePresentation(
        appendBuildOsAuditEntry(
          {
            ...record,
            approvedAt: new Date().toISOString(),
            approvedBy: username,
            status: "Approved",
            updatedBy: username,
          },
          "approved",
          username,
          "Presentation approved for controlled export."
        )
      );
      toast.success("Presentation approved.");
      await refreshRecords();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Approval failed.");
    }
  }

  async function handleExport(record: BuildOsPresentationRecord) {
    const project = projectMap.get(record.projectId);
    if (!project) {
      toast.error("Link the presentation to a project before exporting.");
      return;
    }

    try {
      await exportPresentationPdf({
        presentation: record,
        project,
      });
      await savePresentation(
        appendBuildOsAuditEntry(
          {
            ...record,
            exportedAt: new Date().toISOString(),
            exportedBy: username,
            status: "Exported",
            updatedBy: username,
          },
          "exported",
          username,
          "Presentation exported to PDF for meeting use."
        )
      );
      toast.success("Presentation PDF exported.");
      await refreshRecords();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Export failed.");
    }
  }

  async function handleDelete() {
    if (!deleteTarget) {
      return;
    }

    try {
      await deletePresentation(deleteTarget.id, {
        actor: username,
        reason: deleteReason,
      });
      toast.success("Presentation archived.");
      setDeleteTarget(null);
      setDeleteReason("");
      await refreshRecords();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Archive failed.");
    }
  }

  async function handleRestore(record: BuildOsPresentationRecord) {
    try {
      await restorePresentation(record.id, {
        actor: username,
        reason: "Presentation restored to the active review queue.",
      });
      toast.success("Presentation restored.");
      await refreshRecords();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Restore failed.");
    }
  }

  async function handlePurge(record: BuildOsPresentationRecord) {
    if (!isAdmin) {
      toast.error("Only admins can purge archived records.");
      return;
    }

    try {
      await purgePresentation(record.id);
      toast.success("Presentation permanently removed.");
      await refreshRecords();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Purge failed.");
    }
  }

  return (
    <ManagementLayout currentPageName="presentations">
      <div className="space-y-6">
        <div className="dashboard-panel overflow-hidden p-8">
          <div className="absolute inset-y-0 right-0 w-44 bg-gradient-to-l from-enc-yellow/10 via-enc-orange/10 to-transparent" />
          <div className="relative">
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-enc-orange">
              Internal Review First
            </p>
            <h1 className="mt-3 text-3xl font-bold text-foreground">Presentations</h1>
            <p className="mt-4 max-w-4xl text-sm leading-6 text-muted-foreground">
              Client, lender, investor, and diligence decks stay inside ENCI BuildOS until
              they are reviewed, approved, and exported deliberately. The module keeps
              project-linked decks, prepared-for context, and audit visibility in one place.
            </p>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-4">
          <Card className="dashboard-panel p-2">
            <CardContent className="p-5">
              <p className="text-sm text-muted-foreground">Active presentations</p>
              <p className="mt-3 text-3xl font-semibold text-foreground">{summary.total}</p>
            </CardContent>
          </Card>
          <Card className="dashboard-panel p-2">
            <CardContent className="p-5">
              <p className="text-sm text-muted-foreground">Approved</p>
              <p className="mt-3 text-3xl font-semibold text-foreground">{summary.approved}</p>
            </CardContent>
          </Card>
          <Card className="dashboard-panel p-2">
            <CardContent className="p-5">
              <p className="text-sm text-muted-foreground">Exported</p>
              <p className="mt-3 text-3xl font-semibold text-foreground">{summary.exported}</p>
            </CardContent>
          </Card>
          <Card className="dashboard-panel p-2">
            <CardContent className="p-5">
              <p className="text-sm text-muted-foreground">Archived</p>
              <p className="mt-3 text-3xl font-semibold text-foreground">{summary.archived}</p>
            </CardContent>
          </Card>
        </div>

        <Card className="dashboard-panel p-2">
          <CardContent className="flex flex-col gap-4 p-6 xl:flex-row xl:items-center xl:justify-between">
            <div className="flex flex-1 items-center gap-3 rounded-full border border-border/70 bg-background/80 px-4 py-3">
              <Search className="h-4 w-4 text-muted-foreground" />
              <input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search by title, project, or prepared-for"
                className="w-full bg-transparent text-sm outline-none"
              />
            </div>
            <div className="flex flex-wrap gap-3">
              <Button
                type="button"
                variant="outline"
                className="rounded-full"
                onClick={() => setShowArchived((value) => !value)}
              >
                <RotateCcw className="mr-2 h-4 w-4" />
                {showArchived ? "Hide archived" : "Show archived"}
              </Button>
              <Button
                type="button"
                className="rounded-full bg-gradient-to-r from-enc-red via-enc-orange to-enc-yellow text-white shadow-glow"
                onClick={() => resetForm(null)}
              >
                <Plus className="mr-2 h-4 w-4" />
                New presentation
              </Button>
            </div>
          </CardContent>
        </Card>

        <div className="grid gap-4">
          {visibleRecords.length ? (
            visibleRecords.map((record) => {
              const project = projectMap.get(record.projectId);
              const latestAudit = record.auditLog?.slice(-3).reverse() || [];

              return (
                <Card key={record.id} className="dashboard-panel p-2">
                  <CardContent className="space-y-4 p-6">
                    <div className="flex flex-col gap-3 xl:flex-row xl:items-start xl:justify-between">
                      <div className="space-y-3">
                        <div className="flex flex-wrap items-center gap-2">
                          <p className="text-lg font-semibold text-foreground">{record.title}</p>
                          <Badge className="rounded-full bg-muted text-muted-foreground">
                            {record.status}
                          </Badge>
                          <Badge className="rounded-full bg-muted text-muted-foreground">
                            {record.visibility}
                          </Badge>
                          <Badge className="rounded-full bg-muted text-muted-foreground">
                            {record.presentationType}
                          </Badge>
                          {record.deletedAt ? (
                            <Badge className="rounded-full bg-rose-500/10 text-rose-700 dark:text-rose-300">
                              Archived
                            </Badge>
                          ) : null}
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {project?.project_name || "Project not linked"} | Prepared for{" "}
                          {record.preparedFor}
                        </p>
                        <p className="text-sm leading-6 text-muted-foreground">
                          {record.summary || "No summary recorded yet."}
                        </p>
                      </div>

                      <div className="flex flex-wrap gap-2">
                        {!record.deletedAt ? (
                          <>
                            <Button
                              type="button"
                              variant="outline"
                              className="rounded-full"
                              onClick={() => resetForm(record)}
                            >
                              <Pencil className="mr-2 h-4 w-4" />
                              Edit
                            </Button>
                            <Button
                              type="button"
                              variant="outline"
                              className="rounded-full"
                              onClick={() => void handleApprove(record)}
                              disabled={record.status === "Approved" || record.status === "Exported"}
                            >
                              <ShieldAlert className="mr-2 h-4 w-4" />
                              Approve
                            </Button>
                            <Button
                              type="button"
                              variant="outline"
                              className="rounded-full"
                              onClick={() => void handleExport(record)}
                              disabled={record.status !== "Approved" && record.status !== "Exported"}
                            >
                              <FileDown className="mr-2 h-4 w-4" />
                              Export PDF
                            </Button>
                            <Button
                              type="button"
                              variant="outline"
                              className="rounded-full"
                              onClick={() => {
                                setDeleteTarget(record);
                                setDeleteReason("");
                              }}
                            >
                              <Trash2 className="mr-2 h-4 w-4" />
                              Archive
                            </Button>
                          </>
                        ) : (
                          <>
                            <Button
                              type="button"
                              variant="outline"
                              className="rounded-full"
                              onClick={() => void handleRestore(record)}
                            >
                              <RotateCcw className="mr-2 h-4 w-4" />
                              Restore
                            </Button>
                            {isAdmin ? (
                              <Button
                                type="button"
                                variant="outline"
                                className="rounded-full"
                                onClick={() => void handlePurge(record)}
                              >
                                <XCircle className="mr-2 h-4 w-4" />
                                Purge
                              </Button>
                            ) : null}
                          </>
                        )}
                      </div>
                    </div>

                    <div className="grid gap-4 xl:grid-cols-[minmax(0,1.1fr)_minmax(320px,0.9fr)]">
                      <div className="dashboard-item p-4">
                        <p className="text-sm font-semibold text-foreground">Deck structure</p>
                        <div className="mt-3 space-y-2 text-sm text-muted-foreground">
                          <p>Scope summary: {record.scopeSummary || "Not recorded"}</p>
                          <p>Permit status: {record.permitStatus || "Not recorded"}</p>
                          <p>Budget snapshot: {record.budgetSnapshot || "Not recorded"}</p>
                          <p>Milestones: {record.scheduleMilestones || "Not recorded"}</p>
                          <p>Risk register: {record.riskRegister || "Not recorded"}</p>
                          <p>Next steps: {record.nextSteps || "Not recorded"}</p>
                        </div>
                      </div>
                      <div className="dashboard-item p-4">
                        <p className="text-sm font-semibold text-foreground">Latest audit entries</p>
                        <div className="mt-3 space-y-2 text-sm text-muted-foreground">
                          {latestAudit.length ? (
                            latestAudit.map((entry) => (
                              <p key={entry.id}>
                                {entry.action} | {entry.actor} | {formatDate(entry.occurredAt)} |{" "}
                                {entry.detail}
                              </p>
                            ))
                          ) : (
                            <p>No audit entries recorded yet.</p>
                          )}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })
          ) : (
            <Card className="dashboard-panel p-2">
              <CardContent className="p-6 text-sm text-muted-foreground">
                No presentation records match the current view.
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      <Dialog open={showForm} onOpenChange={setShowForm}>
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-3xl">
          <DialogHeader>
            <DialogTitle>
              {editingRecord ? "Edit presentation record" : "Create presentation record"}
            </DialogTitle>
          </DialogHeader>
          <form className="space-y-5" onSubmit={handleSave}>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="presentation-project">Project *</Label>
                <select
                  id="presentation-project"
                  value={form.projectId}
                  onChange={(event) =>
                    setForm((current) => ({ ...current, projectId: event.target.value }))
                  }
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                >
                  <option value="">Select a project</option>
                  {projects.map((project) => (
                    <option key={project.id} value={project.id}>
                      {project.project_name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="presentation-title">Title *</Label>
                <Input
                  id="presentation-title"
                  value={form.title}
                  onChange={(event) =>
                    setForm((current) => ({ ...current, title: event.target.value }))
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="presentation-prepared-for">Prepared for *</Label>
                <Input
                  id="presentation-prepared-for"
                  value={form.preparedFor}
                  onChange={(event) =>
                    setForm((current) => ({ ...current, preparedFor: event.target.value }))
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="presentation-type">Presentation type *</Label>
                <select
                  id="presentation-type"
                  value={form.presentationType}
                  onChange={(event) =>
                    setForm((current) => ({
                      ...current,
                      presentationType: event.target.value as BuildOsPresentationRecord["presentationType"],
                    }))
                  }
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                >
                  {BUILDOS_PRESENTATION_TYPES.map((value) => (
                    <option key={value} value={value}>
                      {value}
                    </option>
                  ))}
                </select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="presentation-visibility">Visibility *</Label>
                <select
                  id="presentation-visibility"
                  value={form.visibility}
                  onChange={(event) =>
                    setForm((current) => ({
                      ...current,
                      visibility: event.target.value as BuildOsPresentationRecord["visibility"],
                    }))
                  }
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                >
                  {BUILDOS_VISIBILITY_LEVELS.map((value) => (
                    <option key={value} value={value}>
                      {value}
                    </option>
                  ))}
                </select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="presentation-status">Status *</Label>
                <select
                  id="presentation-status"
                  value={form.status}
                  onChange={(event) =>
                    setForm((current) => ({
                      ...current,
                      status: event.target.value as BuildOsPresentationRecord["status"],
                    }))
                  }
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                >
                  {BUILDOS_WORKFLOW_STATUSES.map((value) => (
                    <option key={value} value={value}>
                      {value}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="presentation-summary">Summary</Label>
              <Textarea
                id="presentation-summary"
                value={form.summary}
                onChange={(event) =>
                  setForm((current) => ({ ...current, summary: event.target.value }))
                }
              />
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="presentation-scope">Scope summary</Label>
                <Textarea
                  id="presentation-scope"
                  value={form.scopeSummary}
                  onChange={(event) =>
                    setForm((current) => ({ ...current, scopeSummary: event.target.value }))
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="presentation-permit">Permit status</Label>
                <Textarea
                  id="presentation-permit"
                  value={form.permitStatus}
                  onChange={(event) =>
                    setForm((current) => ({ ...current, permitStatus: event.target.value }))
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="presentation-budget">Budget snapshot</Label>
                <Textarea
                  id="presentation-budget"
                  value={form.budgetSnapshot}
                  onChange={(event) =>
                    setForm((current) => ({ ...current, budgetSnapshot: event.target.value }))
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="presentation-schedule">Schedule milestones</Label>
                <Textarea
                  id="presentation-schedule"
                  value={form.scheduleMilestones}
                  onChange={(event) =>
                    setForm((current) => ({
                      ...current,
                      scheduleMilestones: event.target.value,
                    }))
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="presentation-risk">Risk register</Label>
                <Textarea
                  id="presentation-risk"
                  value={form.riskRegister}
                  onChange={(event) =>
                    setForm((current) => ({ ...current, riskRegister: event.target.value }))
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="presentation-review">Internal review notes</Label>
                <Textarea
                  id="presentation-review"
                  value={form.internalReviewNotes}
                  onChange={(event) =>
                    setForm((current) => ({
                      ...current,
                      internalReviewNotes: event.target.value,
                    }))
                  }
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="presentation-next-steps">Next steps</Label>
              <Textarea
                id="presentation-next-steps"
                value={form.nextSteps}
                onChange={(event) =>
                  setForm((current) => ({ ...current, nextSteps: event.target.value }))
                }
              />
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="presentation-deck-url">Deck / source URL</Label>
                <Input
                  id="presentation-deck-url"
                  value={form.deckUrl}
                  onChange={(event) =>
                    setForm((current) => ({ ...current, deckUrl: event.target.value }))
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="presentation-image-url">Image / rendering URL</Label>
                <Input
                  id="presentation-image-url"
                  value={form.imageUrl}
                  onChange={(event) =>
                    setForm((current) => ({ ...current, imageUrl: event.target.value }))
                  }
                />
              </div>
            </div>

            <label className="flex items-center gap-3 rounded-2xl border border-border/70 px-4 py-3 text-sm">
              <input
                type="checkbox"
                checked={form.safeForExternal}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    safeForExternal: event.target.checked,
                  }))
                }
              />
              Safe for controlled external review once approved
            </label>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setShowForm(false)}>
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={saving}
                className="rounded-full bg-gradient-to-r from-enc-red via-enc-orange to-enc-yellow text-white shadow-glow"
              >
                {saving ? "Saving..." : "Save presentation"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <AlertDialog open={Boolean(deleteTarget)} onOpenChange={(open) => !open && setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Archive presentation?</AlertDialogTitle>
            <AlertDialogDescription>
              ENCI BuildOS now uses archive-first controls. Record why this deck is being removed
              from the active review queue.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="space-y-2">
            <Label htmlFor="presentation-delete-reason">Reason for archive *</Label>
            <Textarea
              id="presentation-delete-reason"
              value={deleteReason}
              onChange={(event) => setDeleteReason(event.target.value)}
            />
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={() => void handleDelete()} disabled={!deleteReason.trim()}>
              Archive
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </ManagementLayout>
  );
}
