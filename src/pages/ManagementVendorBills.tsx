import { useMemo, useState } from "react";
import type { FormEvent } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Download, Pencil, Plus, RotateCcw, Search, Trash, Trash2 } from "lucide-react";
import FormSaveStateNotice from "@/components/forms/FormSaveStateNotice";
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
import { toast } from "@/components/ui/sonner";
import useUnsavedChangesGuard from "@/hooks/useUnsavedChangesGuard";
import { fetchManagementProjects, formatCurrency } from "@/lib/managementData";
import {
  deleteVendorBill,
  loadMasterDatabaseRecords,
  loadVendorBills,
  purgeVendorBill,
  restoreVendorBill,
  saveVendorBill,
  type BuildOsVendorBill,
} from "@/lib/buildosShared";
import {
  getVendorInsightByRecordId,
  getVendorMemoryShortlist,
} from "@/lib/vendorMemory";

type BillFormState = {
  projectId: string;
  vendorRecordId: string;
  invoiceNumber: string;
  invoiceDate: string;
  dueDate: string;
  amount: string;
  status: BuildOsVendorBill["status"];
  updatedBy: string;
  notes: string;
  attachmentUrl: string;
};

function initialForm(record?: BuildOsVendorBill | null): BillFormState {
  return {
    projectId: record?.projectId || "",
    vendorRecordId: record?.vendorRecordId || "",
    invoiceNumber: record?.invoiceNumber || "",
    invoiceDate: record?.invoiceDate || new Date().toISOString().slice(0, 10),
    dueDate: record?.dueDate || new Date().toISOString().slice(0, 10),
    amount: record?.amount ? String(record.amount) : "",
    status: record?.status || "Received",
    updatedBy: record?.updatedBy || "Estate Nest Team",
    notes: record?.notes || "",
    attachmentUrl: record?.attachmentUrl || "",
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

export default function ManagementVendorBills() {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [showArchived, setShowArchived] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editingRecord, setEditingRecord] = useState<BuildOsVendorBill | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<BuildOsVendorBill | null>(null);
  const [deleteReason, setDeleteReason] = useState("");
  const [form, setForm] = useState<BillFormState>(initialForm());
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
  const { data: bills = [] } = useQuery({
    queryKey: ["buildos-vendor-bills", showArchived],
    queryFn: async () => loadVendorBills({ includeDeleted: showArchived }),
  });

  const vendors = useMemo(
    () => records.filter((record) => record.type === "Vendor (Trade)"),
    [records]
  );
  const projectMap = useMemo(
    () => new Map(projects.map((project) => [project.id, project.project_name])),
    [projects]
  );
  const vendorMap = useMemo(
    () => new Map(vendors.map((record) => [record.id, record.companyName || record.personName])),
    [vendors]
  );
  const selectedVendorInsight = useMemo(
    () => getVendorInsightByRecordId(records, form.vendorRecordId),
    [form.vendorRecordId, records]
  );
  const vendorShortlist = useMemo(
    () => getVendorMemoryShortlist(records, form.projectId || undefined),
    [form.projectId, records]
  );

  const filteredBills = useMemo(() => {
    const query = search.trim().toLowerCase();
    return bills.filter((bill) => {
      const matchesSearch =
        !query ||
        bill.invoiceNumber.toLowerCase().includes(query) ||
        (projectMap.get(bill.projectId) || "").toLowerCase().includes(query) ||
        (vendorMap.get(bill.vendorRecordId || "") || "").toLowerCase().includes(query);
      const matchesStatus = statusFilter === "all" || bill.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [bills, projectMap, search, statusFilter, vendorMap]);

  const csv = useMemo(() => {
    const headers = ["Invoice", "Project", "Vendor", "Invoice Date", "Due Date", "Amount", "Status"];
    const rows = filteredBills.map((bill) => [
      bill.invoiceNumber,
      projectMap.get(bill.projectId) || "",
      vendorMap.get(bill.vendorRecordId || "") || "",
      bill.invoiceDate,
      bill.dueDate,
      bill.amount,
      bill.status,
    ]);
    return [headers, ...rows].map((row) => row.join(",")).join("\n");
  }, [filteredBills, projectMap, vendorMap]);

  const openForm = (record?: BuildOsVendorBill | null) => {
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
      "Discard the unsaved vendor-bill changes? This form does not autosave until you click Save.",
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
      await saveVendorBill({
        id: editingRecord?.id,
        projectId: form.projectId,
        vendorRecordId: form.vendorRecordId || undefined,
        invoiceNumber: form.invoiceNumber,
        invoiceDate: form.invoiceDate,
        dueDate: form.dueDate,
        amount: Number(form.amount) || 0,
        status: form.status,
        updatedBy: form.updatedBy,
        notes: form.notes,
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
          ? "Vendor-bill changes were saved to ENCI BuildOS."
          : "Vendor bill was added to ENCI BuildOS."
      );
      setShowForm(false);
      setEditingRecord(null);
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : "Failed to save vendor bill.");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    await deleteVendorBill(deleteTarget.id, {
      actor: deleteTarget.updatedBy || "ENCI BuildOS",
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
    toast.success("Vendor bill archived.");
  };

  const handleRestore = async (bill: BuildOsVendorBill) => {
    await restoreVendorBill(bill.id, {
      actor: bill.updatedBy || "ENCI BuildOS",
      reason: "Vendor bill restored for active review.",
    });
    await queryClient.invalidateQueries({
      predicate: (query) =>
        Array.isArray(query.queryKey) &&
        typeof query.queryKey[0] === "string" &&
        (query.queryKey[0].startsWith("buildos") || query.queryKey[0].startsWith("management")),
    });
    toast.success("Vendor bill restored.");
  };

  const handlePurge = async (bill: BuildOsVendorBill) => {
    await purgeVendorBill(bill.id);
    await queryClient.invalidateQueries({
      predicate: (query) =>
        Array.isArray(query.queryKey) &&
        typeof query.queryKey[0] === "string" &&
        (query.queryKey[0].startsWith("buildos") || query.queryKey[0].startsWith("management")),
    });
    toast.success("Archived vendor bill purged.");
  };

  return (
    <ManagementLayout currentPageName="vendor-bills">
      <div className="space-y-6">
        <div className="dashboard-panel overflow-hidden p-8">
          <div className="absolute inset-y-0 right-0 w-44 bg-gradient-to-l from-enc-yellow/10 via-enc-orange/10 to-transparent" />
          <div className="relative flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.3em] text-enc-orange">Cash Outflows</p>
              <h1 className="mt-3 text-3xl font-bold text-foreground">Vendor Bills</h1>
              <p className="mt-4 max-w-4xl text-sm leading-6 text-muted-foreground">
                Track vendor commitments, payment obligations, and document links so project costs stay visible without pretending there is already a full ERP behind the scenes.
              </p>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" className="rounded-full" onClick={() => downloadCsv("enci-buildos-vendor-bills.csv", csv)}>
                <Download className="mr-2 h-4 w-4" />
                Export CSV
              </Button>
              <Button className="rounded-full bg-gradient-to-r from-enc-red via-enc-orange to-enc-yellow text-white shadow-glow" onClick={() => openForm()}>
                <Plus className="mr-2 h-4 w-4" />
                New Vendor Bill
              </Button>
            </div>
          </div>
        </div>

        <Card className="dashboard-panel p-2">
          <CardHeader>
            <CardTitle className="text-xl text-foreground">Filter vendor bills</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_220px_auto]">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input value={search} onChange={(event) => setSearch(event.target.value)} className="pl-10" placeholder="Search invoice number, project, or vendor" />
            </div>
            <select value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)} className="flex h-10 rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground">
              <option value="all">All statuses</option>
              <option value="Received">Received</option>
              <option value="Verified">Verified</option>
              <option value="Paid">Paid</option>
              <option value="Overdue">Overdue</option>
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

        <div className="grid gap-4">
          {filteredBills.length ? (
            filteredBills.map((bill) => {
              const vendorInsight = getVendorInsightByRecordId(records, bill.vendorRecordId);

              return (
                <Card key={bill.id} className="dashboard-panel p-2">
                  <CardContent className="space-y-4 p-6">
                    <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                      <div className="space-y-3">
                        <div className="flex flex-wrap items-center gap-2">
                          <h2 className="text-xl font-semibold text-foreground">{bill.invoiceNumber}</h2>
                          <Badge className="rounded-full bg-muted text-muted-foreground">{projectMap.get(bill.projectId) || "Unlinked project"}</Badge>
                          <Badge className="rounded-full bg-enc-orange/10 text-enc-orange">
                            {bill.deletedAt ? "Archived" : bill.status}
                          </Badge>
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
                        </div>
                        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
                          <div className="dashboard-item p-3">
                            <p className="text-sm font-medium text-foreground">Vendor</p>
                            <p className="mt-2 text-sm text-muted-foreground">{vendorMap.get(bill.vendorRecordId || "") || "Not linked"}</p>
                          </div>
                          <div className="dashboard-item p-3">
                            <p className="text-sm font-medium text-foreground">Invoice date</p>
                            <p className="mt-2 text-sm text-muted-foreground">{bill.invoiceDate}</p>
                          </div>
                          <div className="dashboard-item p-3">
                            <p className="text-sm font-medium text-foreground">Due date</p>
                            <p className="mt-2 text-sm text-muted-foreground">{bill.dueDate}</p>
                          </div>
                          <div className="dashboard-item p-3">
                            <p className="text-sm font-medium text-foreground">Amount</p>
                            <p className="mt-2 text-sm text-muted-foreground">{formatCurrency(bill.amount)}</p>
                          </div>
                        </div>
                        {vendorInsight ? (
                          <div className="dashboard-item p-3">
                            <p className="text-sm font-medium text-foreground">Vendor memory</p>
                            <p className="mt-2 text-sm text-muted-foreground">
                              {vendorInsight.deficiencyCount} repeat issue{vendorInsight.deficiencyCount === 1 ? "" : "s"} | Work again: {vendorInsight.workAgain}
                            </p>
                            <p className="mt-1 text-xs text-muted-foreground">
                              {vendorInsight.averageScore
                                ? `${vendorInsight.averageScore.toFixed(1)}/5 average score`
                                : "No score recorded yet"}{" "}
                              | {vendorInsight.tradeCategory}
                            </p>
                          </div>
                        ) : null}
                        <div className="dashboard-item p-3">
                          <p className="text-sm font-medium text-foreground">Audit</p>
                          <p className="mt-2 text-sm text-muted-foreground">
                            {bill.updatedBy || "Actor not recorded"}
                          </p>
                          <p className="mt-1 text-xs text-muted-foreground">
                            Last changed {bill.updatedAt}
                          </p>
                          {bill.deletedAt ? (
                            <p className="mt-1 text-xs text-amber-700 dark:text-amber-300">
                              Archived {bill.deletedAt} | {bill.deletionReason || "Reason not recorded"}
                            </p>
                          ) : null}
                        </div>
                        {bill.notes ? (
                          <div className="dashboard-item p-3">
                            <p className="text-sm font-medium text-foreground">Notes</p>
                            <p className="mt-2 text-sm leading-6 text-muted-foreground">{bill.notes}</p>
                          </div>
                        ) : null}
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {!bill.deletedAt ? (
                          <>
                            <Button variant="outline" className="rounded-full" onClick={() => openForm(bill)}>
                              <Pencil className="mr-2 h-4 w-4" />
                              Edit
                            </Button>
                            <Button
                              variant="outline"
                              className="rounded-full text-rose-600 hover:text-rose-700"
                              onClick={() => {
                                setDeleteTarget(bill);
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
                              onClick={() => void handleRestore(bill)}
                            >
                              <RotateCcw className="mr-2 h-4 w-4" />
                              Restore
                            </Button>
                            <Button
                              variant="outline"
                              className="rounded-full text-rose-600 hover:text-rose-700"
                              onClick={() => void handlePurge(bill)}
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
              );
            })
          ) : (
            <Card className="dashboard-panel p-2">
              <CardContent className="p-6 text-sm leading-6 text-muted-foreground">
                No vendor bills match the current filter yet.
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      <Dialog open={showForm} onOpenChange={(nextOpen) => !nextOpen && handleAttemptClose()}>
        <DialogContent className="max-h-[90vh] max-w-3xl overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingRecord ? "Edit Vendor Bill" : "New Vendor Bill"}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSave} className="space-y-6">
            <FormSaveStateNotice
              isDirty={isDirty}
              lastSavedAt={lastSavedAt}
              message="This form does not autosave. Click Save to persist the vendor bill in ENCI BuildOS."
              saving={saving}
            />
            {error ? <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">{error}</div> : null}
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label>Project</Label>
                <select value={form.projectId} onChange={(event) => setForm((current) => ({ ...current, projectId: event.target.value }))} className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm">
                  <option value="">Select project</option>
                  {projects.map((project) => <option key={project.id} value={project.id}>{project.project_name}</option>)}
                </select>
              </div>
              <div className="space-y-2">
                <Label>Vendor</Label>
                <select value={form.vendorRecordId} onChange={(event) => setForm((current) => ({ ...current, vendorRecordId: event.target.value }))} className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm">
                  <option value="">Select vendor</option>
                  {vendors.map((record) => <option key={record.id} value={record.id}>{record.companyName || record.personName}</option>)}
                </select>
              </div>
              <div className="space-y-2">
                <Label>Invoice number</Label>
                <Input value={form.invoiceNumber} onChange={(event) => setForm((current) => ({ ...current, invoiceNumber: event.target.value }))} />
              </div>
              <div className="space-y-2">
                <Label>Status</Label>
                <select value={form.status} onChange={(event) => setForm((current) => ({ ...current, status: event.target.value as BuildOsVendorBill["status"] }))} className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm">
                  <option value="Received">Received</option>
                  <option value="Verified">Verified</option>
                  <option value="Paid">Paid</option>
                  <option value="Overdue">Overdue</option>
                </select>
              </div>
              <div className="space-y-2">
                <Label>Updated by</Label>
                <Input value={form.updatedBy} onChange={(event) => setForm((current) => ({ ...current, updatedBy: event.target.value }))} />
              </div>
              <div className="space-y-2">
                <Label>Invoice date</Label>
                <Input type="date" value={form.invoiceDate} onChange={(event) => setForm((current) => ({ ...current, invoiceDate: event.target.value }))} />
              </div>
              <div className="space-y-2">
                <Label>Due date</Label>
                <Input type="date" value={form.dueDate} onChange={(event) => setForm((current) => ({ ...current, dueDate: event.target.value }))} />
              </div>
              <div className="space-y-2">
                <Label>Amount</Label>
                <Input type="number" value={form.amount} onChange={(event) => setForm((current) => ({ ...current, amount: event.target.value }))} />
              </div>
              <div className="space-y-2">
                <Label>Attachment URL</Label>
                <Input value={form.attachmentUrl} onChange={(event) => setForm((current) => ({ ...current, attachmentUrl: event.target.value }))} />
              </div>
              <div className="space-y-2 md:col-span-2">
                <Label>Notes</Label>
                <Textarea rows={3} value={form.notes} onChange={(event) => setForm((current) => ({ ...current, notes: event.target.value }))} />
              </div>
            </div>
            {selectedVendorInsight || vendorShortlist.topVendors.length || vendorShortlist.cautionVendors.length || vendorShortlist.blockedVendors.length ? (
              <section className="rounded-3xl border border-border/70 bg-background/70 p-5">
                <div className="space-y-2">
                  <p className="text-sm font-semibold text-foreground">Vendor memory in this bill</p>
                  <p className="text-sm leading-6 text-muted-foreground">
                    Keep payment decisions tied to real vendor memory so repeat issues, caution flags, and preferred trades stay visible when bills are approved.
                  </p>
                </div>

                {selectedVendorInsight ? (
                  <div className="mt-4 rounded-2xl border border-border/70 bg-background/80 p-4">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="text-sm font-semibold text-foreground">{selectedVendorInsight.label}</p>
                      <span className="rounded-full bg-muted px-3 py-1 text-xs text-muted-foreground">
                        {selectedVendorInsight.riskStatus}
                      </span>
                      <span className="rounded-full bg-muted px-3 py-1 text-xs text-muted-foreground">
                        {selectedVendorInsight.tradeCategory}
                      </span>
                    </div>
                    <p className="mt-3 text-sm text-muted-foreground">
                      {selectedVendorInsight.averageScore
                        ? `${selectedVendorInsight.averageScore.toFixed(1)}/5 average score`
                        : "No score recorded yet"}{" "}
                      | {selectedVendorInsight.deficiencyCount} repeat issue{selectedVendorInsight.deficiencyCount === 1 ? "" : "s"} | Work again: {selectedVendorInsight.workAgain}
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
              </section>
            ) : null}
            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={handleAttemptClose}>Cancel</Button>
              <Button type="submit" disabled={saving}>{editingRecord ? "Update Vendor Bill" : "Save Vendor Bill"}</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      <AlertDialog open={Boolean(deleteTarget)} onOpenChange={() => setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Archive vendor bill</AlertDialogTitle>
            <AlertDialogDescription>
              Archive "{deleteTarget?.invoiceNumber}" and keep an audit reason.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="space-y-2">
            <Label htmlFor="vendor-bill-delete-reason">Reason for archive *</Label>
            <Textarea
              id="vendor-bill-delete-reason"
              rows={3}
              value={deleteReason}
              onChange={(event) => setDeleteReason(event.target.value)}
              placeholder="Example: duplicate invoice entry"
            />
          </div>
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
