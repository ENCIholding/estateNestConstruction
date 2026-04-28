import { useMemo, useState } from "react";
import type { FormEvent } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { ClipboardCheck, Pencil, Plus, RotateCcw, Search, Trash, Trash2 } from "lucide-react";
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
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import Input from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { fetchManagementProjects } from "@/lib/managementData";
import {
  deleteDeficiency,
  loadDeficiencies,
  loadMasterDatabaseRecords,
  purgeDeficiency,
  restoreDeficiency,
  saveDeficiency,
  type BuildOsDeficiency,
} from "@/lib/buildosShared";
import { toast } from "@/components/ui/sonner";

type DeficiencyFormState = {
  projectId: string;
  title: string;
  description: string;
  location: string;
  severity: BuildOsDeficiency["severity"];
  assignedRecordId: string;
  dueDate: string;
  status: BuildOsDeficiency["status"];
  beforePhotoUrl: string;
  completionPhotoUrl: string;
  notes: string;
  closeoutConfirmation: string;
  warrantyLinked: boolean;
};

function initialForm(record?: BuildOsDeficiency | null): DeficiencyFormState {
  return {
    projectId: record?.projectId || "",
    title: record?.title || "",
    description: record?.description || "",
    location: record?.location || "",
    severity: record?.severity || "Medium",
    assignedRecordId: record?.assignedRecordId || "",
    dueDate: record?.dueDate || "",
    status: record?.status || "Open",
    beforePhotoUrl: record?.beforePhotoUrl || "",
    completionPhotoUrl: record?.completionPhotoUrl || "",
    notes: record?.notes || "",
    closeoutConfirmation: record?.closeoutConfirmation || "",
    warrantyLinked: record?.warrantyLinked || false,
  };
}

export default function ManagementDeficiencyPunchList() {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [showArchived, setShowArchived] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editingRecord, setEditingRecord] = useState<BuildOsDeficiency | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<BuildOsDeficiency | null>(null);
  const [deleteReason, setDeleteReason] = useState("");
  const [form, setForm] = useState<DeficiencyFormState>(initialForm());
  const [error, setError] = useState("");

  const { data: projects = [] } = useQuery({
    queryKey: ["management-projects"],
    queryFn: fetchManagementProjects,
  });
  const { data: deficiencies = [] } = useQuery({
    queryKey: ["buildos-deficiencies", showArchived],
    queryFn: async () => loadDeficiencies({ includeDeleted: showArchived }),
  });
  const { data: contacts = [] } = useQuery({
    queryKey: ["buildos-master-database"],
    queryFn: async () => loadMasterDatabaseRecords(),
  });

  const projectMap = useMemo(
    () => new Map(projects.map((project) => [project.id, project.project_name])),
    [projects]
  );
  const contactMap = useMemo(
    () => new Map(contacts.map((record) => [record.id, record.companyName || record.personName])),
    [contacts]
  );

  const filteredRecords = useMemo(() => {
    const query = search.trim().toLowerCase();
    return deficiencies.filter((record) => {
      const matchesSearch =
        !query ||
        record.title.toLowerCase().includes(query) ||
        record.description.toLowerCase().includes(query) ||
        (record.location || "").toLowerCase().includes(query) ||
        (projectMap.get(record.projectId) || "").toLowerCase().includes(query);
      const matchesStatus = statusFilter === "all" || record.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [deficiencies, projectMap, search, statusFilter]);

  const openForm = (record?: BuildOsDeficiency | null) => {
    setEditingRecord(record || null);
    setForm(initialForm(record));
    setError("");
    setShowForm(true);
  };

  const handleSave = async (event: FormEvent) => {
    event.preventDefault();
    setError("");
    if (!form.projectId || !form.title.trim() || !form.description.trim()) {
      setError("Project, title, and description are required.");
      return;
    }

    await saveDeficiency({
      id: editingRecord?.id,
      projectId: form.projectId,
      title: form.title,
      description: form.description,
      location: form.location,
      severity: form.severity,
      assignedRecordId: form.assignedRecordId || undefined,
      dueDate: form.dueDate || undefined,
      status: form.status,
      beforePhotoUrl: form.beforePhotoUrl,
      completionPhotoUrl: form.completionPhotoUrl,
      notes: form.notes,
      closeoutConfirmation: form.closeoutConfirmation,
      warrantyLinked: form.warrantyLinked,
    });

    await queryClient.invalidateQueries({
      predicate: (query) =>
        Array.isArray(query.queryKey) &&
        typeof query.queryKey[0] === "string" &&
        (query.queryKey[0].startsWith("buildos") || query.queryKey[0].startsWith("management")),
    });

    setShowForm(false);
    setEditingRecord(null);
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    await deleteDeficiency(deleteTarget.id, {
      actor: "ENCI BuildOS",
      reason: deleteReason,
    });
    setDeleteTarget(null);
    setDeleteReason("");
    await queryClient.invalidateQueries({
      predicate: (query) =>
        Array.isArray(query.queryKey) &&
        typeof query.queryKey[0] === "string" &&
        (query.queryKey[0].startsWith("buildos") || query.queryKey[0].startsWith("management")),
    });
    toast.success("Deficiency item archived.");
  };

  const handleRestore = async (record: BuildOsDeficiency) => {
    await restoreDeficiency(record.id, {
      actor: "ENCI BuildOS",
      reason: "Deficiency item restored for active tracking.",
    });
    await queryClient.invalidateQueries({
      predicate: (query) =>
        Array.isArray(query.queryKey) &&
        typeof query.queryKey[0] === "string" &&
        (query.queryKey[0].startsWith("buildos") || query.queryKey[0].startsWith("management")),
    });
    toast.success("Deficiency item restored.");
  };

  const handlePurge = async (record: BuildOsDeficiency) => {
    await purgeDeficiency(record.id);
    await queryClient.invalidateQueries({
      predicate: (query) =>
        Array.isArray(query.queryKey) &&
        typeof query.queryKey[0] === "string" &&
        (query.queryKey[0].startsWith("buildos") || query.queryKey[0].startsWith("management")),
    });
    toast.success("Archived deficiency item purged.");
  };

  return (
    <ManagementLayout currentPageName="deficiency-punch-list">
      <div className="space-y-6">
        <div className="dashboard-panel overflow-hidden p-8">
          <div className="absolute inset-y-0 right-0 w-44 bg-gradient-to-l from-enc-yellow/10 via-enc-orange/10 to-transparent" />
          <div className="relative flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.3em] text-enc-orange">
                Closeout & Warranty
              </p>
              <h1 className="mt-3 text-3xl font-bold text-foreground">Deficiency Punch List</h1>
              <p className="mt-4 max-w-4xl text-sm leading-6 text-muted-foreground">
                Track punch items, warranty issues, severity, assigned party, photos, closeout notes, and due dates in one practical workflow.
              </p>
            </div>

            <Button className="rounded-full bg-gradient-to-r from-enc-red via-enc-orange to-enc-yellow text-white shadow-glow" onClick={() => openForm()}>
              <Plus className="mr-2 h-4 w-4" />
              New Item
            </Button>
          </div>
        </div>

        <Card className="dashboard-panel p-2">
          <CardHeader>
            <CardTitle className="text-xl text-foreground">Filter items</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_220px_auto]">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                className="pl-10"
                placeholder="Search by project, title, description, or location"
              />
            </div>
            <select
              value={statusFilter}
              onChange={(event) => setStatusFilter(event.target.value)}
              className="flex h-10 rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground"
            >
              <option value="all">All statuses</option>
              <option value="Open">Open</option>
              <option value="In Progress">In Progress</option>
              <option value="Ready for Review">Ready for Review</option>
              <option value="Closed">Closed</option>
            </select>
            <Button
              variant="outline"
              className="rounded-full"
              onClick={() => setShowArchived((current) => !current)}
            >
              {showArchived ? "Hide archived" : "Show archived"}
            </Button>
          </CardContent>
        </Card>

        {filteredRecords.length ? (
          <div className="grid gap-4">
            {filteredRecords.map((record) => (
              <Card key={record.id} className="dashboard-panel p-2">
                <CardContent className="space-y-4 p-6">
                  <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                    <div className="space-y-3">
                      <div className="flex flex-wrap items-center gap-2">
                        <h2 className="text-xl font-semibold text-foreground">{record.title}</h2>
                        <Badge className="rounded-full bg-muted text-muted-foreground">
                          {projectMap.get(record.projectId) || "Unlinked project"}
                        </Badge>
                        <Badge
                          className={
                            record.severity === "Critical"
                              ? "rounded-full bg-rose-500/10 text-rose-700 dark:text-rose-300"
                              : record.severity === "High"
                                ? "rounded-full bg-amber-500/10 text-amber-700 dark:text-amber-300"
                                : "rounded-full bg-blue-500/10 text-blue-700 dark:text-blue-300"
                          }
                        >
                          {record.severity}
                        </Badge>
                        <Badge className="rounded-full bg-muted text-muted-foreground">
                          {record.deletedAt ? "Archived" : record.status}
                        </Badge>
                      </div>
                      <p className="text-sm leading-6 text-muted-foreground">{record.description}</p>
                      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
                        <div className="dashboard-item p-3">
                          <p className="text-sm font-medium text-foreground">Location</p>
                          <p className="mt-2 text-sm text-muted-foreground">{record.location || "Not set"}</p>
                        </div>
                        <div className="dashboard-item p-3">
                          <p className="text-sm font-medium text-foreground">Assigned party</p>
                          <p className="mt-2 text-sm text-muted-foreground">
                            {contactMap.get(record.assignedRecordId || "") || "Not assigned"}
                          </p>
                        </div>
                        <div className="dashboard-item p-3">
                          <p className="text-sm font-medium text-foreground">Due date</p>
                          <p className="mt-2 text-sm text-muted-foreground">{record.dueDate || "Not set"}</p>
                        </div>
                        <div className="dashboard-item p-3">
                          <p className="text-sm font-medium text-foreground">Warranty linked</p>
                          <p className="mt-2 text-sm text-muted-foreground">{record.warrantyLinked ? "Yes" : "No"}</p>
                          {record.deletedAt ? (
                            <p className="mt-1 text-xs text-amber-700 dark:text-amber-300">
                              Archived {record.deletedAt} | {record.deletionReason || "Reason not recorded"}
                            </p>
                          ) : null}
                        </div>
                      </div>
                      {record.notes ? (
                        <div className="dashboard-item p-3">
                          <p className="text-sm font-medium text-foreground">Notes</p>
                          <p className="mt-2 text-sm leading-6 text-muted-foreground">{record.notes}</p>
                        </div>
                      ) : null}
                    </div>

                    <div className="flex flex-wrap gap-2">
                      {!record.deletedAt ? (
                        <>
                          <Button variant="outline" className="rounded-full" onClick={() => openForm(record)}>
                            <Pencil className="mr-2 h-4 w-4" />
                            Edit
                          </Button>
                          <Button
                            variant="outline"
                            className="rounded-full text-rose-600 hover:text-rose-700"
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
                            variant="outline"
                            className="rounded-full"
                            onClick={() => void handleRestore(record)}
                          >
                            <RotateCcw className="mr-2 h-4 w-4" />
                            Restore
                          </Button>
                          <Button
                            variant="outline"
                            className="rounded-full text-rose-600 hover:text-rose-700"
                            onClick={() => void handlePurge(record)}
                          >
                            <Trash className="mr-2 h-4 w-4" />
                            Purge
                          </Button>
                        </>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Card className="dashboard-panel p-2">
            <CardContent className="p-6 text-sm leading-6 text-muted-foreground">
              No deficiency items match the current filter yet.
            </CardContent>
          </Card>
        )}
      </div>

      <Dialog open={showForm} onOpenChange={(nextOpen) => !nextOpen && setShowForm(false)}>
        <DialogContent className="max-h-[90vh] max-w-3xl overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingRecord ? "Edit Deficiency Item" : "New Deficiency Item"}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSave} className="space-y-6">
            {error ? (
              <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
                {error}
              </div>
            ) : null}
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label>Project</Label>
                <select value={form.projectId} onChange={(event) => setForm((current) => ({ ...current, projectId: event.target.value }))} className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm">
                  <option value="">Select project</option>
                  {projects.map((project) => (
                    <option key={project.id} value={project.id}>
                      {project.project_name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="space-y-2">
                <Label>Status</Label>
                <select value={form.status} onChange={(event) => setForm((current) => ({ ...current, status: event.target.value as BuildOsDeficiency["status"] }))} className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm">
                  <option value="Open">Open</option>
                  <option value="In Progress">In Progress</option>
                  <option value="Ready for Review">Ready for Review</option>
                  <option value="Closed">Closed</option>
                </select>
              </div>
              <div className="space-y-2 md:col-span-2">
                <Label>Issue title</Label>
                <Input value={form.title} onChange={(event) => setForm((current) => ({ ...current, title: event.target.value }))} />
              </div>
              <div className="space-y-2 md:col-span-2">
                <Label>Description</Label>
                <Textarea rows={3} value={form.description} onChange={(event) => setForm((current) => ({ ...current, description: event.target.value }))} />
              </div>
              <div className="space-y-2">
                <Label>Location / area</Label>
                <Input value={form.location} onChange={(event) => setForm((current) => ({ ...current, location: event.target.value }))} />
              </div>
              <div className="space-y-2">
                <Label>Severity</Label>
                <select value={form.severity} onChange={(event) => setForm((current) => ({ ...current, severity: event.target.value as BuildOsDeficiency["severity"] }))} className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm">
                  <option value="Low">Low</option>
                  <option value="Medium">Medium</option>
                  <option value="High">High</option>
                  <option value="Critical">Critical</option>
                </select>
              </div>
              <div className="space-y-2">
                <Label>Assigned party</Label>
                <select value={form.assignedRecordId} onChange={(event) => setForm((current) => ({ ...current, assignedRecordId: event.target.value }))} className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm">
                  <option value="">Select record</option>
                  {contacts.map((record) => (
                    <option key={record.id} value={record.id}>
                      {record.companyName || record.personName}
                    </option>
                  ))}
                </select>
              </div>
              <div className="space-y-2">
                <Label>Due date</Label>
                <Input type="date" value={form.dueDate} onChange={(event) => setForm((current) => ({ ...current, dueDate: event.target.value }))} />
              </div>
              <div className="space-y-2">
                <Label>Before photo URL</Label>
                <Input value={form.beforePhotoUrl} onChange={(event) => setForm((current) => ({ ...current, beforePhotoUrl: event.target.value }))} />
              </div>
              <div className="space-y-2">
                <Label>Completion photo URL</Label>
                <Input value={form.completionPhotoUrl} onChange={(event) => setForm((current) => ({ ...current, completionPhotoUrl: event.target.value }))} />
              </div>
              <div className="space-y-2 md:col-span-2">
                <Label>Notes</Label>
                <Textarea rows={3} value={form.notes} onChange={(event) => setForm((current) => ({ ...current, notes: event.target.value }))} />
              </div>
              <div className="space-y-2 md:col-span-2">
                <Label>Closeout confirmation</Label>
                <Textarea rows={2} value={form.closeoutConfirmation} onChange={(event) => setForm((current) => ({ ...current, closeoutConfirmation: event.target.value }))} />
              </div>
              <div className="space-y-2 md:col-span-2">
                <Label className="flex items-center gap-2">
                  <input type="checkbox" checked={form.warrantyLinked} onChange={(event) => setForm((current) => ({ ...current, warrantyLinked: event.target.checked }))} />
                  Link this item to warranty follow-up
                </Label>
              </div>
            </div>
            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={() => setShowForm(false)}>
                Cancel
              </Button>
              <Button type="submit">{editingRecord ? "Update Item" : "Save Item"}</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      <AlertDialog open={Boolean(deleteTarget)} onOpenChange={() => setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Archive deficiency item</AlertDialogTitle>
            <AlertDialogDescription>
              Archive "{deleteTarget?.title}" and store the reason in audit history.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <Input
            value={deleteReason}
            onChange={(event) => setDeleteReason(event.target.value)}
            placeholder="Reason for archive (required)"
          />
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-rose-600 hover:bg-rose-700"
              disabled={!deleteReason.trim()}
              onClick={() => void handleDelete()}
            >
              Archive
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </ManagementLayout>
  );
}
