import { useMemo, useState } from "react";
import type { FormEvent } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Download, Pencil, Plus, Search, Trash2 } from "lucide-react";
import FormSaveStateNotice from "@/components/forms/FormSaveStateNotice";
import ManagementLayout from "@/components/management/ManagementLayout";
import ProjectDecisionSupportPanel from "@/components/projects/ProjectDecisionSupportPanel";
import ProjectParticipantPresence from "@/components/projects/ProjectParticipantPresence";
import ProjectSignalBadgeCluster from "@/components/projects/ProjectSignalBadgeCluster";
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
import { toast } from "@/components/ui/sonner";
import useUnsavedChangesGuard from "@/hooks/useUnsavedChangesGuard";
import { fetchManagementProjects, formatCurrency } from "@/lib/managementData";
import { buildProjectControlSnapshot } from "@/lib/projectControl";
import {
  deleteClientInvoice,
  loadBuildOsChangeOrders,
  loadBuildOsDocuments,
  loadBuildOsProjectParticipantAssignments,
  loadBuildOsTasks,
  loadBuildOsVendorBills,
  loadClientInvoices,
  loadMasterDatabaseRecords,
  loadDeficiencies,
  saveClientInvoice,
  type BuildOsClientInvoice,
} from "@/lib/buildosShared";

type InvoiceFormState = {
  projectId: string;
  stakeholderRecordId: string;
  invoiceNumber: string;
  invoiceDate: string;
  dueDate: string;
  amount: string;
  status: BuildOsClientInvoice["status"];
  updatedBy: string;
  notes: string;
  drawReference: string;
};

function initialForm(record?: BuildOsClientInvoice | null): InvoiceFormState {
  return {
    projectId: record?.projectId || "",
    stakeholderRecordId: record?.stakeholderRecordId || "",
    invoiceNumber: record?.invoiceNumber || "",
    invoiceDate: record?.invoiceDate || new Date().toISOString().slice(0, 10),
    dueDate: record?.dueDate || new Date().toISOString().slice(0, 10),
    amount: record?.amount ? String(record.amount) : "",
    status: record?.status || "Draft",
    updatedBy: record?.updatedBy || "Estate Nest Team",
    notes: record?.notes || "",
    drawReference: record?.drawReference || "",
  };
}

function downloadCsv(filename: string, content: string) {
  const blob = new Blob([content], { type: "text/csv;charset=utf-8" });
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.click();
  window.URL.revokeObjectURL(url);
}

export default function ManagementClientInvoices() {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [showForm, setShowForm] = useState(false);
  const [editingRecord, setEditingRecord] = useState<BuildOsClientInvoice | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<BuildOsClientInvoice | null>(null);
  const [form, setForm] = useState<InvoiceFormState>(initialForm());
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const [initialFingerprint, setInitialFingerprint] = useState(JSON.stringify(initialForm()));
  const [lastSavedAt, setLastSavedAt] = useState<string | null>(null);

  const { data: projects = [] } = useQuery({
    queryKey: ["management-projects"],
    queryFn: fetchManagementProjects,
  });
  const { data: records = [] } = useQuery({
    queryKey: ["buildos-master-database"],
    queryFn: async () => loadMasterDatabaseRecords(),
  });
  const { data: invoices = [] } = useQuery({
    queryKey: ["buildos-client-invoices"],
    queryFn: async () => loadClientInvoices(),
  });
  const { data: changeOrders = [] } = useQuery({
    queryKey: ["buildos-change-orders"],
    queryFn: async () => loadBuildOsChangeOrders(),
  });
  const { data: vendorBills = [] } = useQuery({
    queryKey: ["buildos-vendor-bills"],
    queryFn: async () => loadBuildOsVendorBills(),
  });
  const { data: deficiencies = [] } = useQuery({
    queryKey: ["buildos-deficiencies"],
    queryFn: async () => loadDeficiencies(),
  });
  const { data: documents = [] } = useQuery({
    queryKey: ["buildos-documents"],
    queryFn: async () => loadBuildOsDocuments(),
  });
  const { data: tasks = [] } = useQuery({
    queryKey: ["buildos-tasks"],
    queryFn: async () => loadBuildOsTasks(),
  });
  const { data: participantAssignments = [] } = useQuery({
    queryKey: ["buildos-project-participants"],
    queryFn: async () => loadBuildOsProjectParticipantAssignments(),
  });

  const stakeholders = useMemo(
    () =>
      records.filter((record) =>
        ["Stakeholder (Client)", "Buyer"].includes(record.type)
      ),
    [records]
  );

  const projectMap = useMemo(() => new Map(projects.map((project) => [project.id, project])), [projects]);
  const stakeholderMap = useMemo(
    () =>
      new Map(
        stakeholders.map((record) => [record.id, record.companyName || record.personName])
      ),
    [stakeholders]
  );

  const projectControlById = useMemo(
    () =>
      new Map(
        projects.map((project) => [
          project.id,
          buildProjectControlSnapshot({
            assignment:
              participantAssignments.find((item) => item.projectId === project.id) || null,
            changeOrders,
            clientInvoices: invoices,
            deficiencies,
            documents,
            project,
            records,
            tasks,
            vendorBills,
          }),
        ] as const)
      ),
    [
      changeOrders,
      deficiencies,
      documents,
      invoices,
      participantAssignments,
      projects,
      records,
      tasks,
      vendorBills,
    ]
  );

  const filteredInvoices = useMemo(() => {
    const query = search.trim().toLowerCase();
    return invoices.filter((invoice) => {
      const projectName = projectMap.get(invoice.projectId)?.project_name || "";
      const stakeholderName = stakeholderMap.get(invoice.stakeholderRecordId || "") || "";
      const matchesSearch =
        !query ||
        invoice.invoiceNumber.toLowerCase().includes(query) ||
        projectName.toLowerCase().includes(query) ||
        stakeholderName.toLowerCase().includes(query) ||
        (invoice.drawReference || "").toLowerCase().includes(query);
      const matchesStatus = statusFilter === "all" || invoice.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [invoices, projectMap, search, stakeholderMap, statusFilter]);

  const csv = useMemo(() => {
    const headers = [
      "Invoice",
      "Project",
      "Stakeholder",
      "Invoice Date",
      "Due Date",
      "Amount",
      "Status",
      "Draw Reference",
    ];
    const rows = filteredInvoices.map((invoice) => [
      invoice.invoiceNumber,
      projectMap.get(invoice.projectId)?.project_name || "",
      stakeholderMap.get(invoice.stakeholderRecordId || "") || "",
      invoice.invoiceDate,
      invoice.dueDate,
      invoice.amount,
      invoice.status,
      invoice.drawReference || "",
    ]);
    return [headers, ...rows].map((row) => row.join(",")).join("\n");
  }, [filteredInvoices, projectMap, stakeholderMap]);

  const openForm = (record?: BuildOsClientInvoice | null) => {
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
  const handleAttemptClose = useUnsavedChangesGuard({
    discardMessage:
      "Discard the unsaved invoice changes? This form does not autosave until you click Save.",
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
    if (!form.projectId || !form.invoiceNumber.trim() || !form.amount) {
      setError("Project, invoice number, and amount are required.");
      return;
    }
    try {
      setSaving(true);
      await saveClientInvoice({
        id: editingRecord?.id,
        projectId: form.projectId,
        stakeholderRecordId: form.stakeholderRecordId || undefined,
        invoiceNumber: form.invoiceNumber,
        invoiceDate: form.invoiceDate,
        dueDate: form.dueDate,
        amount: Number(form.amount) || 0,
        status: form.status,
        updatedBy: form.updatedBy,
        notes: form.notes,
        drawReference: form.drawReference,
      });
      await queryClient.invalidateQueries({
        predicate: (query) =>
          Array.isArray(query.queryKey) &&
          typeof query.queryKey[0] === "string" &&
          (query.queryKey[0].startsWith("buildos") ||
            query.queryKey[0].startsWith("management")),
      });
      setInitialFingerprint(JSON.stringify(form));
      setLastSavedAt(new Date().toISOString());
      toast.success(
        editingRecord
          ? "Invoice changes were saved to ENCI BuildOS."
          : "Client invoice was added to ENCI BuildOS."
      );
      setShowForm(false);
      setEditingRecord(null);
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : "Failed to save invoice.");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    await deleteClientInvoice(deleteTarget.id);
    setDeleteTarget(null);
    await queryClient.invalidateQueries({
      predicate: (query) =>
        Array.isArray(query.queryKey) &&
        typeof query.queryKey[0] === "string" &&
        (query.queryKey[0].startsWith("buildos") || query.queryKey[0].startsWith("management")),
    });
  };

  const totalOutstanding = filteredInvoices
    .filter((invoice) => invoice.status !== "Paid")
    .reduce((total, invoice) => total + invoice.amount, 0);
  const overdueCount = filteredInvoices.filter((invoice) => invoice.status === "Overdue").length;

  return (
    <ManagementLayout currentPageName="client-invoices">
      <div className="space-y-6">
        <div className="dashboard-panel overflow-hidden p-8">
          <div className="absolute inset-y-0 right-0 w-44 bg-gradient-to-l from-enc-yellow/10 via-enc-orange/10 to-transparent" />
          <div className="relative flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.3em] text-enc-orange">
                Cash Inflows
              </p>
              <h1 className="mt-3 text-3xl font-bold text-foreground">Client Invoices</h1>
              <p className="mt-4 max-w-4xl text-sm leading-6 text-muted-foreground">
                Track receivables with stakeholder visibility, draw references,
                and project-level profit and scope context so collections are not
                disconnected from the real job.
              </p>
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                className="rounded-full"
                onClick={() => downloadCsv("enci-buildos-client-invoices.csv", csv)}
              >
                <Download className="mr-2 h-4 w-4" />
                Export CSV
              </Button>
              <Button
                className="rounded-full bg-gradient-to-r from-enc-red via-enc-orange to-enc-yellow text-white shadow-glow"
                onClick={() => openForm()}
              >
                <Plus className="mr-2 h-4 w-4" />
                New Invoice
              </Button>
            </div>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <Card className="dashboard-panel p-2">
            <CardContent className="p-5">
              <p className="text-sm font-medium text-muted-foreground">Invoices shown</p>
              <p className="mt-3 text-3xl font-semibold text-foreground">{filteredInvoices.length}</p>
            </CardContent>
          </Card>
          <Card className="dashboard-panel p-2">
            <CardContent className="p-5">
              <p className="text-sm font-medium text-muted-foreground">Outstanding receivables</p>
              <p className="mt-3 text-3xl font-semibold text-foreground">{formatCurrency(totalOutstanding)}</p>
            </CardContent>
          </Card>
          <Card className="dashboard-panel p-2">
            <CardContent className="p-5">
              <p className="text-sm font-medium text-muted-foreground">Overdue invoices</p>
              <p className="mt-3 text-3xl font-semibold text-foreground">{overdueCount}</p>
            </CardContent>
          </Card>
          <Card className="dashboard-panel p-2">
            <CardContent className="p-5">
              <p className="text-sm font-medium text-muted-foreground">Draw references</p>
              <p className="mt-3 text-3xl font-semibold text-foreground">
                {filteredInvoices.filter((invoice) => invoice.drawReference).length}
              </p>
            </CardContent>
          </Card>
        </div>

        <Card className="dashboard-panel p-2">
          <CardHeader>
            <CardTitle className="text-xl text-foreground">Filter invoices</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_220px]">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                className="pl-10"
                placeholder="Search invoice number, project, stakeholder, or draw reference"
              />
            </div>
            <select
              value={statusFilter}
              onChange={(event) => setStatusFilter(event.target.value)}
              className="flex h-10 rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground"
            >
              <option value="all">All statuses</option>
              <option value="Draft">Draft</option>
              <option value="Sent">Sent</option>
              <option value="Partially Paid">Partially Paid</option>
              <option value="Paid">Paid</option>
              <option value="Overdue">Overdue</option>
            </select>
          </CardContent>
        </Card>

        <div className="grid gap-4">
          {filteredInvoices.length ? (
            filteredInvoices.map((invoice) => {
              const project = projectMap.get(invoice.projectId);
              const snapshot = project ? projectControlById.get(project.id) : null;
              const stakeholderLabel =
                stakeholderMap.get(invoice.stakeholderRecordId || "") || "Not linked";

              return (
                <Card key={invoice.id} className="dashboard-panel p-2">
                  <CardContent className="space-y-4 p-6">
                    <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                      <div className="space-y-4">
                        <div className="flex flex-wrap items-center gap-2">
                          <h2 className="text-xl font-semibold text-foreground">
                            {invoice.invoiceNumber}
                          </h2>
                          <Badge className="rounded-full bg-muted text-muted-foreground">
                            {project?.project_name || "Unlinked project"}
                          </Badge>
                          <Badge className="rounded-full bg-enc-orange/10 text-enc-orange">
                            {invoice.status}
                          </Badge>
                        </div>
                        {snapshot ? <ProjectSignalBadgeCluster snapshot={snapshot} /> : null}

                        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-5">
                          <div className="dashboard-item p-3">
                            <p className="text-sm font-medium text-foreground">Stakeholder</p>
                            <p className="mt-2 text-sm text-muted-foreground">{stakeholderLabel}</p>
                          </div>
                          <div className="dashboard-item p-3">
                            <p className="text-sm font-medium text-foreground">Invoice date</p>
                            <p className="mt-2 text-sm text-muted-foreground">{invoice.invoiceDate}</p>
                          </div>
                          <div className="dashboard-item p-3">
                            <p className="text-sm font-medium text-foreground">Due date</p>
                            <p className="mt-2 text-sm text-muted-foreground">{invoice.dueDate}</p>
                          </div>
                          <div className="dashboard-item p-3">
                            <p className="text-sm font-medium text-foreground">Amount</p>
                            <p className="mt-2 text-sm text-muted-foreground">{formatCurrency(invoice.amount)}</p>
                          </div>
                          <div className="dashboard-item p-3">
                            <p className="text-sm font-medium text-foreground">Draw reference</p>
                            <p className="mt-2 text-sm text-muted-foreground">
                              {invoice.drawReference || "Not set"}
                            </p>
                          </div>
                        </div>

                        {snapshot ? (
                          <div className="grid gap-4 xl:grid-cols-[minmax(0,1.05fr)_minmax(320px,0.95fr)]">
                            <ProjectDecisionSupportPanel
                              includeActions={false}
                              snapshot={snapshot}
                              title="Project profit & scope context"
                              caption="This invoice is shown alongside the project’s live profit, scope, and exposure signals so collections stay tied to margin and approvals."
                            />
                            <ProjectParticipantPresence
                              compact
                              snapshot={snapshot}
                              title="Visible deal participants"
                            />
                          </div>
                        ) : null}

                        <div className="dashboard-item p-3">
                          <p className="text-sm font-medium text-foreground">Audit</p>
                          <p className="mt-2 text-sm text-muted-foreground">
                            {invoice.updatedBy || "Actor not recorded"}
                          </p>
                          <p className="mt-1 text-xs text-muted-foreground">
                            Last changed {invoice.updatedAt}
                          </p>
                        </div>

                        {invoice.notes ? (
                          <div className="dashboard-item p-3">
                            <p className="text-sm font-medium text-foreground">Notes</p>
                            <p className="mt-2 text-sm leading-6 text-muted-foreground">
                              {invoice.notes}
                            </p>
                          </div>
                        ) : null}
                      </div>
                      <div className="flex flex-wrap gap-2">
                        <Button
                          variant="outline"
                          className="rounded-full"
                          onClick={() => openForm(invoice)}
                        >
                          <Pencil className="mr-2 h-4 w-4" />
                          Edit
                        </Button>
                        <Button
                          variant="outline"
                          className="rounded-full text-rose-600 hover:text-rose-700"
                          onClick={() => setDeleteTarget(invoice)}
                        >
                          <Trash2 className="mr-2 h-4 w-4" />
                          Remove
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })
          ) : (
            <Card className="dashboard-panel p-2">
              <CardContent className="p-6 text-sm leading-6 text-muted-foreground">
                No invoices match the current filter yet.
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      <Dialog open={showForm} onOpenChange={(nextOpen) => !nextOpen && handleAttemptClose()}>
        <DialogContent className="max-h-[90vh] max-w-3xl overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingRecord ? "Edit Client Invoice" : "New Client Invoice"}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSave} className="space-y-6">
            <FormSaveStateNotice
              isDirty={isDirty}
              lastSavedAt={lastSavedAt}
              message="This form does not autosave. Click Save to persist the invoice in ENCI BuildOS."
              saving={saving}
            />
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
                  onChange={(event) =>
                    setForm((current) => ({ ...current, projectId: event.target.value }))
                  }
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
                <Label>Stakeholder</Label>
                <select
                  value={form.stakeholderRecordId}
                  onChange={(event) =>
                    setForm((current) => ({
                      ...current,
                      stakeholderRecordId: event.target.value,
                    }))
                  }
                  className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                >
                  <option value="">Select stakeholder</option>
                  {stakeholders.map((record) => (
                    <option key={record.id} value={record.id}>
                      {record.companyName || record.personName}
                    </option>
                  ))}
                </select>
              </div>
              <div className="space-y-2">
                <Label>Invoice number</Label>
                <Input
                  value={form.invoiceNumber}
                  onChange={(event) =>
                    setForm((current) => ({ ...current, invoiceNumber: event.target.value }))
                  }
                />
              </div>
              <div className="space-y-2">
                <Label>Status</Label>
                <select
                  value={form.status}
                  onChange={(event) =>
                    setForm((current) => ({
                      ...current,
                      status: event.target.value as BuildOsClientInvoice["status"],
                    }))
                  }
                  className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                >
                  <option value="Draft">Draft</option>
                  <option value="Sent">Sent</option>
                  <option value="Partially Paid">Partially Paid</option>
                  <option value="Paid">Paid</option>
                  <option value="Overdue">Overdue</option>
                </select>
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
                <Label>Invoice date</Label>
                <Input
                  type="date"
                  value={form.invoiceDate}
                  onChange={(event) =>
                    setForm((current) => ({ ...current, invoiceDate: event.target.value }))
                  }
                />
              </div>
              <div className="space-y-2">
                <Label>Due date</Label>
                <Input
                  type="date"
                  value={form.dueDate}
                  onChange={(event) =>
                    setForm((current) => ({ ...current, dueDate: event.target.value }))
                  }
                />
              </div>
              <div className="space-y-2">
                <Label>Amount</Label>
                <Input
                  type="number"
                  value={form.amount}
                  onChange={(event) =>
                    setForm((current) => ({ ...current, amount: event.target.value }))
                  }
                />
              </div>
              <div className="space-y-2">
                <Label>Lender draw reference</Label>
                <Input
                  value={form.drawReference}
                  onChange={(event) =>
                    setForm((current) => ({ ...current, drawReference: event.target.value }))
                  }
                />
              </div>
              <div className="space-y-2 md:col-span-2">
                <Label>Notes</Label>
                <Textarea
                  rows={3}
                  value={form.notes}
                  onChange={(event) =>
                    setForm((current) => ({ ...current, notes: event.target.value }))
                  }
                />
              </div>
            </div>
            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={handleAttemptClose}>
                Cancel
              </Button>
              <Button type="submit" disabled={saving}>
                {editingRecord ? "Update Invoice" : "Save Invoice"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      <AlertDialog open={Boolean(deleteTarget)} onOpenChange={() => setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remove invoice</AlertDialogTitle>
            <AlertDialogDescription>
              Remove "{deleteTarget?.invoiceNumber}" from Client Invoices?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-rose-600 hover:bg-rose-700"
              onClick={() => void handleDelete()}
            >
              Remove
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </ManagementLayout>
  );
}
