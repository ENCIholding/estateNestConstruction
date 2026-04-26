import { useEffect, useMemo, useState } from "react";
import type { FormEvent } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { AlertTriangle, CheckCircle2, FileWarning, Info, Loader2, Pencil, Plus, Search, Trash2 } from "lucide-react";
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
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import Input from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/components/ui/sonner";
import { fetchManagementProjects, formatCurrency } from "@/lib/managementData";
import {
  deleteChangeOrder,
  loadChangeOrders,
  loadMasterDatabaseRecords,
  saveChangeOrder,
  type BuildOsChangeOrder,
} from "@/lib/buildosShared";
import {
  getVendorInsightByRecordId,
  getVendorMemoryShortlist,
} from "@/lib/vendorMemory";

type ChangeOrderFormState = {
  projectId: string;
  title: string;
  vendorRecordId: string;
  costCategory: string;
  scopeSummary: string;
  reason: string;
  budgetImpact: string;
  timeImpactDays: string;
  status: BuildOsChangeOrder["status"];
  updatedBy: string;
  internalNotes: string;
  clientSummary: string;
  vendorSummary: string;
  attachmentUrl: string;
};

function formatAuditDateTime(value?: string) {
  if (!value) {
    return "Not recorded";
  }

  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) {
    return value;
  }

  return new Intl.DateTimeFormat("en-CA", {
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
    month: "short",
  }).format(parsed);
}

function initialForm(record?: BuildOsChangeOrder | null): ChangeOrderFormState {
  return {
    projectId: record?.projectId || "",
    title: record?.title || "",
    vendorRecordId: record?.vendorRecordId || "",
    costCategory: record?.costCategory || "",
    scopeSummary: record?.scopeSummary || "",
    reason: record?.reason || "",
    budgetImpact: record?.budgetImpact ? String(record.budgetImpact) : "",
    timeImpactDays: record?.timeImpactDays ? String(record.timeImpactDays) : "",
    status: record?.status || "Draft",
    updatedBy: record?.updatedBy || "Estate Nest Team",
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
  const [saving, setSaving] = useState(false);
  const [initialFingerprint, setInitialFingerprint] = useState(JSON.stringify(initialForm()));
  const [lastSavedAt, setLastSavedAt] = useState<string | null>(null);

  const { data: projects = [] } = useQuery({
    queryKey: ["management-projects"],
    queryFn: fetchManagementProjects,
  });
  const { data: changeOrders = [] } = useQuery({
    queryKey: ["buildos-change-orders"],
    queryFn: async () => loadChangeOrders(),
  });
  const { data: masterRecords = [] } = useQuery({
    queryKey: ["buildos-master-database"],
    queryFn: async () => loadMasterDatabaseRecords(),
  });

  const projectMap = useMemo(
    () => new Map(projects.map((project) => [project.id, project])),
    [projects]
  );
  const vendorMap = useMemo(
    () =>
      new Map(
        masterRecords
          .filter((record) => record.type === "Vendor (Trade)")
          .map((record) => [record.id, record.companyName || record.personName])
      ),
    [masterRecords]
  );
  const selectedVendorInsight = useMemo(
    () => getVendorInsightByRecordId(masterRecords, form.vendorRecordId),
    [form.vendorRecordId, masterRecords]
  );
  const vendorShortlist = useMemo(
    () => getVendorMemoryShortlist(masterRecords, form.projectId || undefined),
    [form.projectId, masterRecords]
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
    const nextState = initialForm(record);
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

  useEffect(() => {
    if (!showForm || !isDirty) {
      return;
    }

    const handleBeforeUnload = (event: BeforeUnloadEvent) => {
      event.preventDefault();
      event.returnValue = "";
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [isDirty, showForm]);

  const handleAttemptClose = () => {
    if (saving) {
      return;
    }

    if (
      isDirty &&
      !window.confirm(
        "Discard the unsaved change-order changes? This form does not autosave until you click Save."
      )
    ) {
      return;
    }

    setShowForm(false);
    setEditingRecord(null);
  };

  const handleSave = async (event: FormEvent) => {
    event.preventDefault();
    setError("");

    if (!form.projectId || !form.title.trim() || !form.scopeSummary.trim()) {
      setError("Project, title, and scope summary are required.");
      return;
    }

    try {
      setSaving(true);
      await saveChangeOrder({
        id: editingRecord?.id,
        projectId: form.projectId,
        title: form.title,
        vendorRecordId: form.vendorRecordId || undefined,
        costCategory: form.costCategory,
        scopeSummary: form.scopeSummary,
        reason: form.reason,
        budgetImpact: Number(form.budgetImpact) || 0,
        timeImpactDays: Number(form.timeImpactDays) || 0,
        status: form.status,
        updatedBy: form.updatedBy,
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

      setInitialFingerprint(JSON.stringify(form));
      setLastSavedAt(new Date().toISOString());
      toast.success(
        editingRecord
          ? "Change-order changes were saved to ENCI BuildOS."
          : "Change order was added to ENCI BuildOS."
      );
      setShowForm(false);
      setEditingRecord(null);
    } finally {
      setSaving(false);
    }
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
                        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
                          <div className="dashboard-item p-3">
                            <p className="text-sm font-medium text-foreground">Vendor memory</p>
                            <p className="mt-2 text-sm text-muted-foreground">
                              {record.vendorRecordId
                                ? vendorMap.get(record.vendorRecordId) || "Linked vendor not found"
                                : "No vendor linked"}
                            </p>
                            <p className="mt-1 text-xs text-muted-foreground">
                              {record.vendorRecordId
                                ? getVendorInsightByRecordId(masterRecords, record.vendorRecordId)?.riskStatus || "No vendor memory yet"
                                : "Add the trade responsible for this scope movement."}
                            </p>
                          </div>
                          <div className="dashboard-item p-3">
                            <p className="text-sm font-medium text-foreground">Audit actor</p>
                            <p className="mt-2 text-sm text-muted-foreground">
                              {record.updatedBy || "Actor not recorded"}
                            </p>
                            <p className="mt-1 text-xs text-muted-foreground">
                              Last changed {formatAuditDateTime(record.updatedAt)}
                            </p>
                          </div>
                          <div className="dashboard-item p-3">
                            <p className="text-sm font-medium text-foreground">Revenue control</p>
                            <p className="mt-2 text-sm text-muted-foreground">
                              {record.status === "Pending Approval" || record.status === "Draft"
                                ? `${formatCurrency(record.budgetImpact)} remains unapproved revenue at risk`
                                : "Impact is already reflected in the approved / implemented layer."}
                            </p>
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

      <Dialog open={showForm} onOpenChange={(nextOpen) => !nextOpen && handleAttemptClose()}>
        <DialogContent className="max-h-[90vh] max-w-3xl overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingRecord ? "Edit Change Order" : "New Change Order"}
            </DialogTitle>
            <DialogDescription>
              This form does not autosave. Click Save to persist the change order into ENCI BuildOS.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSave} className="space-y-6">
            <div className="flex flex-wrap items-center gap-3 rounded-2xl border border-border/70 bg-background/70 px-4 py-3 text-sm">
              <Badge
                className={
                  saving
                    ? "rounded-full bg-blue-500/10 text-blue-700 dark:text-blue-300"
                    : isDirty
                      ? "rounded-full bg-amber-500/10 text-amber-700 dark:text-amber-300"
                      : "rounded-full bg-emerald-500/10 text-emerald-700 dark:text-emerald-300"
                }
              >
                {saving ? "Saving" : isDirty ? "Unsaved changes" : "Ready"}
              </Badge>
              <div className="flex items-center gap-2 text-muted-foreground">
                {saving ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : isDirty ? (
                  <AlertTriangle className="h-4 w-4 text-amber-500" />
                ) : (
                  <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                )}
                <span>
                  {saving
                    ? "Saving the change order..."
                    : isDirty
                      ? "Changes are not saved until you click Save."
                      : lastSavedAt
                        ? `Saved ${new Intl.DateTimeFormat("en-CA", {
                            hour: "numeric",
                            minute: "2-digit",
                          }).format(new Date(lastSavedAt))}.`
                        : "Loaded values are ready for review or editing."}
                </span>
              </div>
            </div>

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
                <Label>Responsible vendor / trade</Label>
                <select
                  value={form.vendorRecordId}
                  onChange={(event) =>
                    setForm((current) => ({
                      ...current,
                      vendorRecordId: event.target.value,
                    }))
                  }
                  className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                >
                  <option value="">Select vendor</option>
                  {masterRecords
                    .filter((record) => record.type === "Vendor (Trade)")
                    .map((record) => (
                      <option key={record.id} value={record.id}>
                        {record.companyName || record.personName}
                      </option>
                    ))}
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
                <Label>Updated by</Label>
                <Input
                  value={form.updatedBy}
                  onChange={(event) =>
                    setForm((current) => ({ ...current, updatedBy: event.target.value }))
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

            {selectedVendorInsight || vendorShortlist.topVendors.length || vendorShortlist.cautionVendors.length || vendorShortlist.blockedVendors.length ? (
              <div className="rounded-3xl border border-border/70 bg-background/70 p-5">
                <div className="space-y-2">
                  <p className="text-sm font-semibold text-foreground">Vendor memory in scope control</p>
                  <p className="text-sm leading-6 text-muted-foreground">
                    Link the responsible trade so change orders become relationship-aware revenue control, not isolated paperwork.
                  </p>
                </div>

                {selectedVendorInsight ? (
                  <div className="mt-4 rounded-2xl border border-border/70 bg-background/80 p-4">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="text-sm font-semibold text-foreground">{selectedVendorInsight.label}</p>
                      <span className="rounded-full bg-muted px-3 py-1 text-xs text-muted-foreground">
                        {selectedVendorInsight.riskStatus}
                      </span>
                    </div>
                    <p className="mt-3 text-sm text-muted-foreground">
                      {selectedVendorInsight.averageScore
                        ? `${selectedVendorInsight.averageScore.toFixed(1)}/5 average score`
                        : "No score recorded yet"}{" "}
                      · {selectedVendorInsight.deficiencyCount} repeat issue{selectedVendorInsight.deficiencyCount === 1 ? "" : "s"} · Work again: {selectedVendorInsight.workAgain}
                    </p>
                  </div>
                ) : null}

                <div className="mt-4 grid gap-3 md:grid-cols-3">
                  <div className="rounded-2xl border border-border/70 bg-background/80 p-4">
                    <p className="text-sm font-medium text-foreground">Top vendors</p>
                    <div className="mt-3 flex flex-wrap gap-2">
                      {vendorShortlist.topVendors.length ? vendorShortlist.topVendors.map((vendor) => (
                        <span key={vendor.id} className="rounded-full bg-emerald-500/10 px-3 py-1 text-xs text-emerald-700 dark:text-emerald-300">
                          {vendor.label}
                        </span>
                      )) : <span className="text-xs text-muted-foreground">No preferred vendors linked yet.</span>}
                    </div>
                  </div>
                  <div className="rounded-2xl border border-border/70 bg-background/80 p-4">
                    <p className="text-sm font-medium text-foreground">Use with caution</p>
                    <div className="mt-3 flex flex-wrap gap-2">
                      {vendorShortlist.cautionVendors.length ? vendorShortlist.cautionVendors.map((vendor) => (
                        <span key={vendor.id} className="rounded-full bg-amber-500/10 px-3 py-1 text-xs text-amber-700 dark:text-amber-300">
                          {vendor.label}
                        </span>
                      )) : <span className="text-xs text-muted-foreground">No caution vendors in view.</span>}
                    </div>
                  </div>
                  <div className="rounded-2xl border border-border/70 bg-background/80 p-4">
                    <p className="text-sm font-medium text-foreground">Do not use</p>
                    <div className="mt-3 flex flex-wrap gap-2">
                      {vendorShortlist.blockedVendors.length ? vendorShortlist.blockedVendors.map((vendor) => (
                        <span key={vendor.id} className="rounded-full bg-rose-500/10 px-3 py-1 text-xs text-rose-700 dark:text-rose-300">
                          {vendor.label}
                        </span>
                      )) : <span className="text-xs text-muted-foreground">No blocked vendors in this shortlist.</span>}
                    </div>
                  </div>
                </div>
              </div>
            ) : null}

            <DialogFooter className="items-center justify-between gap-3 sm:space-x-0">
              <div className="flex items-start gap-2 text-sm text-muted-foreground">
                <Info className="mt-0.5 h-4 w-4 shrink-0 text-enc-orange" />
                <p>
                  {isDirty
                    ? "Unsaved change-order edits will be lost if you close this form now."
                    : "Change orders stay saved after you click Save. Until then, the edits only live in this form window."}
                </p>
              </div>
              <div className="flex flex-col-reverse gap-2 sm:flex-row">
              <Button type="button" variant="outline" onClick={handleAttemptClose}>
                Cancel
              </Button>
              <Button type="submit" disabled={saving}>
                {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                {editingRecord ? "Save Change Order Changes" : "Save Change Order"}
              </Button>
              </div>
            </DialogFooter>
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
