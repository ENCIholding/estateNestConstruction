import { useMemo, useState } from "react";
import type { FormEvent } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { FileWarning, Pencil, Plus, Search, Trash2 } from "lucide-react";
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
import { fetchManagementProjects, formatCurrency } from "@/lib/managementData";
import {
  deleteChangeOrder,
  loadChangeOrders,
  saveChangeOrder,
  type BuildOsChangeOrder,
} from "@/lib/buildosShared";

type ChangeOrderFormState = {
  projectId: string;
  title: string;
  costCategory: string;
  scopeSummary: string;
  reason: string;
  budgetImpact: string;
  timeImpactDays: string;
  status: BuildOsChangeOrder["status"];
  internalNotes: string;
  clientSummary: string;
  vendorSummary: string;
  attachmentUrl: string;
};

function initialForm(record?: BuildOsChangeOrder | null): ChangeOrderFormState {
  return {
    projectId: record?.projectId || "",
    title: record?.title || "",
    costCategory: record?.costCategory || "",
    scopeSummary: record?.scopeSummary || "",
    reason: record?.reason || "",
    budgetImpact: record?.budgetImpact ? String(record.budgetImpact) : "",
    timeImpactDays: record?.timeImpactDays ? String(record.timeImpactDays) : "",
    status: record?.status || "Draft",
    internalNotes: record?.internalNotes || "",
    clientSummary: record?.clientSummary || "",
    vendorSummary: record?.vendorSummary || "",
    attachmentUrl: record?.attachmentUrl || "",
  };
}

export default function ManagementChangeOrders() {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [showForm, setShowForm] = useState(false);
  const [editingRecord, setEditingRecord] = useState<BuildOsChangeOrder | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<BuildOsChangeOrder | null>(null);
  const [form, setForm] = useState<ChangeOrderFormState>(initialForm());
  const [error, setError] = useState("");

  const { data: projects = [] } = useQuery({
    queryKey: ["management-projects"],
    queryFn: fetchManagementProjects,
  });
  const { data: changeOrders = [] } = useQuery({
    queryKey: ["buildos-change-orders"],
    queryFn: async () => loadChangeOrders(),
  });

  const projectMap = useMemo(
    () => new Map(projects.map((project) => [project.id, project])),
    [projects]
  );

  const filteredRecords = useMemo(() => {
    const query = search.trim().toLowerCase();
    return changeOrders.filter((record) => {
      const project = projectMap.get(record.projectId);
      const matchesSearch =
        !query ||
        record.title.toLowerCase().includes(query) ||
        record.scopeSummary.toLowerCase().includes(query) ||
        record.reason.toLowerCase().includes(query) ||
        (project?.project_name || "").toLowerCase().includes(query);
      const matchesStatus = statusFilter === "all" || record.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [changeOrders, projectMap, search, statusFilter]);

  const approvedImpact = changeOrders
    .filter((record) => ["Approved", "Implemented"].includes(record.status))
    .reduce((total, record) => total + record.budgetImpact, 0);
  const pendingExposure = changeOrders
    .filter((record) => ["Draft", "Pending Approval"].includes(record.status))
    .reduce((total, record) => total + record.budgetImpact, 0);

  const openForm = (record?: BuildOsChangeOrder | null) => {
    setEditingRecord(record || null);
    setForm(initialForm(record));
    setError("");
    setShowForm(true);
  };

  const handleSave = async (event: FormEvent) => {
    event.preventDefault();
    setError("");

    if (!form.projectId || !form.title.trim() || !form.scopeSummary.trim()) {
      setError("Project, title, and scope summary are required.");
      return;
    }

    await saveChangeOrder({
      id: editingRecord?.id,
      projectId: form.projectId,
      title: form.title,
      costCategory: form.costCategory,
      scopeSummary: form.scopeSummary,
      reason: form.reason,
      budgetImpact: Number(form.budgetImpact) || 0,
      timeImpactDays: Number(form.timeImpactDays) || 0,
      status: form.status,
      internalNotes: form.internalNotes,
      clientSummary: form.clientSummary,
      vendorSummary: form.vendorSummary,
      attachmentUrl: form.attachmentUrl,
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
    await deleteChangeOrder(deleteTarget.id);
    setDeleteTarget(null);
    await queryClient.invalidateQueries({
      predicate: (query) =>
        Array.isArray(query.queryKey) &&
        typeof query.queryKey[0] === "string" &&
        (query.queryKey[0].startsWith("buildos") || query.queryKey[0].startsWith("management")),
    });
  };

  return (
    <ManagementLayout currentPageName="change-orders">
      <div className="space-y-6">
        <div className="dashboard-panel overflow-hidden p-8">
          <div className="absolute inset-y-0 right-0 w-44 bg-gradient-to-l from-enc-yellow/10 via-enc-orange/10 to-transparent" />
          <div className="relative flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.3em] text-enc-orange">
                Live Cost & Scope Control
              </p>
              <h1 className="mt-3 text-3xl font-bold text-foreground">Change Orders</h1>
              <p className="mt-4 max-w-4xl text-sm leading-6 text-muted-foreground">
                Change orders now track scope, budget, time impact, status, notes, and attachment links. Approved change orders should feed revised budget visibility across ENCI BuildOS.
              </p>
            </div>

            <Button
              className="rounded-full bg-gradient-to-r from-enc-red via-enc-orange to-enc-yellow text-white shadow-glow"
              onClick={() => openForm()}
            >
              <Plus className="mr-2 h-4 w-4" />
              New Change Order
            </Button>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <Card className="dashboard-panel p-2">
            <CardContent className="p-5">
              <p className="text-sm font-medium text-muted-foreground">Change orders</p>
              <p className="mt-3 text-3xl font-semibold text-foreground">{changeOrders.length}</p>
            </CardContent>
          </Card>
          <Card className="dashboard-panel p-2">
            <CardContent className="p-5">
              <p className="text-sm font-medium text-muted-foreground">Approved impact</p>
              <p className="mt-3 text-3xl font-semibold text-foreground">{formatCurrency(approvedImpact)}</p>
            </CardContent>
          </Card>
          <Card className="dashboard-panel p-2">
            <CardContent className="p-5">
              <p className="text-sm font-medium text-muted-foreground">Pending exposure</p>
              <p className="mt-3 text-3xl font-semibold text-foreground">{formatCurrency(pendingExposure)}</p>
            </CardContent>
          </Card>
          <Card className="dashboard-panel p-2">
            <CardContent className="p-5">
              <p className="text-sm font-medium text-muted-foreground">Awaiting decision</p>
              <p className="mt-3 text-3xl font-semibold text-foreground">
                {changeOrders.filter((record) => ["Draft", "Pending Approval"].includes(record.status)).length}
              </p>
            </CardContent>
          </Card>
        </div>

        <Card className="dashboard-panel p-2">
          <CardHeader>
            <CardTitle className="text-xl text-foreground">Filter change orders</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_220px]">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                className="pl-10"
                placeholder="Search by project, title, scope, or reason"
              />
            </div>
            <select
              value={statusFilter}
              onChange={(event) => setStatusFilter(event.target.value)}
              className="flex h-10 rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground"
            >
              <option value="all">All statuses</option>
              <option value="Draft">Draft</option>
              <option value="Pending Approval">Pending Approval</option>
              <option value="Approved">Approved</option>
              <option value="Rejected">Rejected</option>
              <option value="Implemented">Implemented</option>
            </select>
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
                          {projectMap.get(record.projectId)?.project_name || "Unlinked project"}
                        </Badge>
                        <Badge
                          className={
                            record.status === "Approved" || record.status === "Implemented"
                              ? "rounded-full bg-emerald-500/10 text-emerald-700 dark:text-emerald-300"
                              : record.status === "Rejected"
                                ? "rounded-full bg-rose-500/10 text-rose-700 dark:text-rose-300"
                                : "rounded-full bg-amber-500/10 text-amber-700 dark:text-amber-300"
                          }
                        >
                          {record.status}
                        </Badge>
                      </div>

                      <p className="text-sm leading-6 text-muted-foreground">{record.scopeSummary}</p>
                      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
                        <div className="dashboard-item p-3">
                          <p className="text-sm font-medium text-foreground">Budget impact</p>
                          <p className="mt-2 text-sm text-muted-foreground">
                            {formatCurrency(record.budgetImpact)}
                          </p>
                        </div>
                        <div className="dashboard-item p-3">
                          <p className="text-sm font-medium text-foreground">Time impact</p>
                          <p className="mt-2 text-sm text-muted-foreground">
                            {record.timeImpactDays} day(s)
                          </p>
                        </div>
                        <div className="dashboard-item p-3">
                          <p className="text-sm font-medium text-foreground">Category</p>
                          <p className="mt-2 text-sm text-muted-foreground">
                            {record.costCategory || "Not set"}
                          </p>
                        </div>
                        <div className="dashboard-item p-3">
                          <p className="text-sm font-medium text-foreground">Reason</p>
                          <p className="mt-2 text-sm text-muted-foreground">{record.reason}</p>
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-2">
                      <Button variant="outline" className="rounded-full" onClick={() => openForm(record)}>
                        <Pencil className="mr-2 h-4 w-4" />
                        Edit
                      </Button>
                      <Button
                        variant="outline"
                        className="rounded-full text-rose-600 hover:text-rose-700"
                        onClick={() => setDeleteTarget(record)}
                      >
                        <Trash2 className="mr-2 h-4 w-4" />
                        Remove
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Card className="dashboard-panel p-2">
            <CardContent className="p-6 text-sm leading-6 text-muted-foreground">
              No change orders match the current filter yet.
            </CardContent>
          </Card>
        )}
      </div>

      <Dialog open={showForm} onOpenChange={(nextOpen) => !nextOpen && setShowForm(false)}>
        <DialogContent className="max-h-[90vh] max-w-3xl overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingRecord ? "Edit Change Order" : "New Change Order"}
            </DialogTitle>
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
                <select
                  value={form.projectId}
                  onChange={(event) => setForm((current) => ({ ...current, projectId: event.target.value }))}
                  className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                >
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
                <select
                  value={form.status}
                  onChange={(event) =>
                    setForm((current) => ({
                      ...current,
                      status: event.target.value as BuildOsChangeOrder["status"],
                    }))
                  }
                  className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                >
                  <option value="Draft">Draft</option>
                  <option value="Pending Approval">Pending Approval</option>
                  <option value="Approved">Approved</option>
                  <option value="Rejected">Rejected</option>
                  <option value="Implemented">Implemented</option>
                </select>
              </div>
              <div className="space-y-2 md:col-span-2">
                <Label>Title</Label>
                <Input
                  value={form.title}
                  onChange={(event) => setForm((current) => ({ ...current, title: event.target.value }))}
                />
              </div>
              <div className="space-y-2 md:col-span-2">
                <Label>Scope summary</Label>
                <Textarea
                  rows={3}
                  value={form.scopeSummary}
                  onChange={(event) =>
                    setForm((current) => ({ ...current, scopeSummary: event.target.value }))
                  }
                />
              </div>
              <div className="space-y-2 md:col-span-2">
                <Label>Reason / origin</Label>
                <Textarea
                  rows={2}
                  value={form.reason}
                  onChange={(event) => setForm((current) => ({ ...current, reason: event.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label>Budget impact</Label>
                <Input
                  type="number"
                  value={form.budgetImpact}
                  onChange={(event) =>
                    setForm((current) => ({ ...current, budgetImpact: event.target.value }))
                  }
                />
              </div>
              <div className="space-y-2">
                <Label>Time impact (days)</Label>
                <Input
                  type="number"
                  value={form.timeImpactDays}
                  onChange={(event) =>
                    setForm((current) => ({ ...current, timeImpactDays: event.target.value }))
                  }
                />
              </div>
              <div className="space-y-2">
                <Label>Cost code / category</Label>
                <Input
                  value={form.costCategory}
                  onChange={(event) =>
                    setForm((current) => ({ ...current, costCategory: event.target.value }))
                  }
                />
              </div>
              <div className="space-y-2">
                <Label>Attachment URL</Label>
                <Input
                  value={form.attachmentUrl}
                  onChange={(event) =>
                    setForm((current) => ({ ...current, attachmentUrl: event.target.value }))
                  }
                />
              </div>
              <div className="space-y-2">
                <Label>Client-facing summary</Label>
                <Textarea
                  rows={2}
                  value={form.clientSummary}
                  onChange={(event) =>
                    setForm((current) => ({ ...current, clientSummary: event.target.value }))
                  }
                />
              </div>
              <div className="space-y-2">
                <Label>Vendor-facing summary</Label>
                <Textarea
                  rows={2}
                  value={form.vendorSummary}
                  onChange={(event) =>
                    setForm((current) => ({ ...current, vendorSummary: event.target.value }))
                  }
                />
              </div>
              <div className="space-y-2 md:col-span-2">
                <Label>Internal notes</Label>
                <Textarea
                  rows={3}
                  value={form.internalNotes}
                  onChange={(event) =>
                    setForm((current) => ({ ...current, internalNotes: event.target.value }))
                  }
                />
              </div>
            </div>

            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={() => setShowForm(false)}>
                Cancel
              </Button>
              <Button type="submit">
                {editingRecord ? "Update Change Order" : "Save Change Order"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      <AlertDialog open={Boolean(deleteTarget)} onOpenChange={() => setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remove change order</AlertDialogTitle>
            <AlertDialogDescription>
              Remove "{deleteTarget?.title}" from the project record?
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
