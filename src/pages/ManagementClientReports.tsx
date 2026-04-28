import { useMemo, useState } from "react";
import type { FormEvent } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
  CheckCircle2,
  FileDown,
  Pencil,
  Plus,
  RotateCcw,
  Search,
  ShieldCheck,
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
import { Card, CardContent } from "@/components/ui/card";
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
import {
  buildClientReportDraft,
  exportClientReportPdf,
} from "@/lib/buildosClientOutputs";
import {
  appendBuildOsAuditEntry,
  BUILDOS_VISIBILITY_LEVELS,
  type BuildOsClientReportRecord,
} from "@/lib/buildosWorkspace";
import {
  deleteClientReport,
  loadBuildOsChangeOrders,
  loadBuildOsClientInvoices,
  loadBuildOsDailyLogs,
  loadBuildOsDeficiencies,
  loadBuildOsDocuments,
  loadBuildOsProjectParticipantAssignments,
  loadBuildOsTasks,
  loadBuildOsVendorBills,
  loadClientReports,
  loadMasterDatabaseRecords,
  purgeClientReport,
  restoreClientReport,
  saveClientReport,
} from "@/lib/buildosShared";
import {
  fetchManagementJson,
  fetchManagementProjects,
  formatDate,
} from "@/lib/managementData";

type ReportFormState = {
  audience: BuildOsClientReportRecord["audience"];
  internalReviewNotes: string;
  preparedFor: string;
  projectId: string;
  reportDate: string;
  safeContextNotes: string;
  title: string;
  visibility: BuildOsClientReportRecord["visibility"];
};

type ManagementSessionResponse = {
  authenticated: boolean;
  user: {
    app_role: string;
    permissions: string[];
    username: string;
  } | null;
};

function initialForm(record?: BuildOsClientReportRecord | null): ReportFormState {
  return {
    audience: record?.audience || "Client",
    internalReviewNotes: record?.internalReviewNotes || "",
    preparedFor: record?.preparedFor || "",
    projectId: record?.projectId || "",
    reportDate: record?.reportDate || new Date().toISOString().slice(0, 10),
    safeContextNotes: record?.safeContextNotes || "",
    title: record?.title || "",
    visibility: record?.visibility || "Internal",
  };
}

export default function ManagementClientReports() {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [showArchived, setShowArchived] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editingRecord, setEditingRecord] = useState<BuildOsClientReportRecord | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<BuildOsClientReportRecord | null>(null);
  const [deleteReason, setDeleteReason] = useState("");
  const [form, setForm] = useState<ReportFormState>(initialForm());
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
  const { data: reports = [] } = useQuery({
    queryKey: ["buildos-client-reports", showArchived],
    queryFn: async () => loadClientReports({ includeDeleted: showArchived }),
  });
  const { data: changeOrders = [] } = useQuery({
    queryKey: ["buildos-change-orders"],
    queryFn: async () => loadBuildOsChangeOrders(),
  });
  const { data: clientInvoices = [] } = useQuery({
    queryKey: ["buildos-client-invoices"],
    queryFn: async () => loadBuildOsClientInvoices(),
  });
  const { data: dailyLogs = [] } = useQuery({
    queryKey: ["buildos-daily-logs"],
    queryFn: async () => loadBuildOsDailyLogs(),
  });
  const { data: deficiencies = [] } = useQuery({
    queryKey: ["buildos-deficiencies"],
    queryFn: async () => loadBuildOsDeficiencies(),
  });
  const { data: documents = [] } = useQuery({
    queryKey: ["buildos-documents"],
    queryFn: async () => loadBuildOsDocuments(),
  });
  const { data: participantAssignments = [] } = useQuery({
    queryKey: ["buildos-project-participants"],
    queryFn: async () => loadBuildOsProjectParticipantAssignments(),
  });
  const { data: tasks = [] } = useQuery({
    queryKey: ["buildos-tasks"],
    queryFn: async () => loadBuildOsTasks(),
  });
  const { data: vendorBills = [] } = useQuery({
    queryKey: ["buildos-vendor-bills"],
    queryFn: async () => loadBuildOsVendorBills(),
  });
  const { data: records = [] } = useQuery({
    queryKey: ["buildos-master-database"],
    queryFn: async () => loadMasterDatabaseRecords(),
  });

  const projectMap = useMemo(
    () => new Map(projects.map((project) => [project.id, project])),
    [projects]
  );
  const username = session?.user?.username || "ENCI BuildOS";
  const isAdmin = session?.user?.app_role === "Admin";
  const canExport =
    session?.user?.permissions?.includes("buildos:client-reports:export") || false;

  const visibleReports = useMemo(() => {
    const query = search.trim().toLowerCase();
    return reports.filter((report) => {
      const projectName = projectMap.get(report.projectId)?.project_name || "";
      return (
        !query ||
        report.title.toLowerCase().includes(query) ||
        report.preparedFor.toLowerCase().includes(query) ||
        projectName.toLowerCase().includes(query)
      );
    });
  }, [projectMap, reports, search]);

  const statusSummary = useMemo(
    () => ({
      approved: reports.filter((report) => report.status === "Approved").length,
      draft: reports.filter((report) => report.status === "Draft").length,
      exported: reports.filter((report) => report.status === "Exported").length,
      review: reports.filter((report) => report.status === "Review").length,
    }),
    [reports]
  );

  async function refreshReports() {
    await queryClient.invalidateQueries({ queryKey: ["buildos-client-reports"] });
  }

  function openForm(record?: BuildOsClientReportRecord | null) {
    setEditingRecord(record || null);
    setForm(initialForm(record));
    setShowForm(true);
  }

  function buildDraftRecord(base?: BuildOsClientReportRecord | null) {
    const project = projectMap.get(form.projectId);
    if (!project) {
      throw new Error("Select a linked project before generating the report.");
    }

    const draft = buildClientReportDraft(
      {
        preparedFor: form.preparedFor,
        safeContextNotes: form.safeContextNotes,
      },
      {
        assignment:
          participantAssignments.find((item) => item.projectId === form.projectId) || null,
        changeOrders,
        clientInvoices,
        dailyLogs,
        deficiencies,
        documents,
        project,
        records,
        tasks,
        vendorBills,
      }
    );

    return appendBuildOsAuditEntry(
      {
        ...(base || {}),
        audience: form.audience,
        generatedBy: username,
        internalReviewNotes: form.internalReviewNotes,
        lastGeneratedAt: new Date().toISOString(),
        preparedFor: form.preparedFor,
        projectId: form.projectId,
        reportDate: form.reportDate,
        safeContextNotes: form.safeContextNotes,
        sectionOrder: draft.sectionOrder,
        sections: draft.sections,
        status: "Draft" as const,
        summary: draft.summary,
        title: form.title,
        updatedAt: new Date().toISOString(),
        visibility: form.visibility,
      },
      "generated",
      username,
      "Client report draft generated from live project records."
    );
  }

  async function handleGenerate(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);

    try {
      const draftRecord = buildDraftRecord(editingRecord);
      await saveClientReport(draftRecord);
      toast.success("Client report draft generated.");
      setShowForm(false);
      await refreshReports();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Report generation failed.");
    } finally {
      setSaving(false);
    }
  }

  async function sendToReview(report: BuildOsClientReportRecord) {
    try {
      await saveClientReport(
        appendBuildOsAuditEntry(
          {
            ...report,
            status: "Review",
          },
          "reviewed",
          username,
          "Report moved into internal review."
        )
      );
      toast.success("Report moved to review.");
      await refreshReports();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Review transition failed.");
    }
  }

  async function approveReport(report: BuildOsClientReportRecord) {
    try {
      await saveClientReport(
        appendBuildOsAuditEntry(
          {
            ...report,
            approvedAt: new Date().toISOString(),
            approvedBy: username,
            status: "Approved",
          },
          "approved",
          username,
          "Report approved for controlled export."
        )
      );
      toast.success("Report approved.");
      await refreshReports();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Approval failed.");
    }
  }

  async function exportReport(report: BuildOsClientReportRecord) {
    const project = projectMap.get(report.projectId);
    if (!project) {
      toast.error("Project record is missing for this report.");
      return;
    }

    if (!canExport) {
      toast.error("Your account does not have export permission for client reports.");
      return;
    }

    try {
      const draft =
        report.sections.length && report.sectionOrder.length
          ? {
              sectionOrder: report.sectionOrder,
              sections: report.sections,
              summary: report.summary || "",
            }
          : buildClientReportDraft(
              {
                preparedFor: report.preparedFor,
                safeContextNotes: report.safeContextNotes,
              },
              {
                assignment:
                  participantAssignments.find((item) => item.projectId === report.projectId) ||
                  null,
                changeOrders,
                clientInvoices,
                dailyLogs,
                deficiencies,
                documents,
                project,
                records,
                tasks,
                vendorBills,
              }
            );

      await exportClientReportPdf({
        draft,
        project,
        report,
      });

      await saveClientReport(
        appendBuildOsAuditEntry(
          {
            ...report,
            exportCount: (report.exportCount || 0) + 1,
            exportedAt: new Date().toISOString(),
            exportedBy: username,
            lastExportFormat: "PDF",
            status: "Exported",
          },
          "exported",
          username,
          "Client report exported to PDF after approval."
        )
      );

      toast.success("Client report exported.");
      await refreshReports();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Export failed.");
    }
  }

  async function handleDelete() {
    if (!deleteTarget) {
      return;
    }

    try {
      await deleteClientReport(deleteTarget.id, {
        actor: username,
        reason: deleteReason,
      });
      toast.success("Client report archived.");
      setDeleteTarget(null);
      setDeleteReason("");
      await refreshReports();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Archive failed.");
    }
  }

  async function handleRestore(report: BuildOsClientReportRecord) {
    try {
      await restoreClientReport(report.id, {
        actor: username,
        reason: "Report restored for internal review.",
      });
      toast.success("Client report restored.");
      await refreshReports();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Restore failed.");
    }
  }

  async function handlePurge(report: BuildOsClientReportRecord) {
    if (!isAdmin) {
      toast.error("Only admins can purge archived reports.");
      return;
    }

    try {
      await purgeClientReport(report.id);
      toast.success("Client report permanently removed.");
      await refreshReports();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Purge failed.");
    }
  }

  return (
    <ManagementLayout currentPageName="client-reports">
      <div className="space-y-6">
        <div className="dashboard-panel overflow-hidden p-8">
          <div className="absolute inset-y-0 right-0 w-44 bg-gradient-to-l from-enc-yellow/10 via-enc-orange/10 to-transparent" />
          <div className="relative">
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-enc-orange">
              Internal Review First
            </p>
            <h1 className="mt-3 text-3xl font-bold text-foreground">Client Reports</h1>
            <p className="mt-4 max-w-4xl text-sm leading-6 text-muted-foreground">
              ENCI BuildOS generates client, lender, and investor meeting packs from live
              project records, but nothing is treated as client-visible until the report is
              reviewed, approved, and exported deliberately.
            </p>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-4">
          <Card className="dashboard-panel p-2">
            <CardContent className="p-5">
              <p className="text-sm text-muted-foreground">Draft</p>
              <p className="mt-3 text-3xl font-semibold text-foreground">{statusSummary.draft}</p>
            </CardContent>
          </Card>
          <Card className="dashboard-panel p-2">
            <CardContent className="p-5">
              <p className="text-sm text-muted-foreground">Review</p>
              <p className="mt-3 text-3xl font-semibold text-foreground">{statusSummary.review}</p>
            </CardContent>
          </Card>
          <Card className="dashboard-panel p-2">
            <CardContent className="p-5">
              <p className="text-sm text-muted-foreground">Approved</p>
              <p className="mt-3 text-3xl font-semibold text-foreground">
                {statusSummary.approved}
              </p>
            </CardContent>
          </Card>
          <Card className="dashboard-panel p-2">
            <CardContent className="p-5">
              <p className="text-sm text-muted-foreground">Exported</p>
              <p className="mt-3 text-3xl font-semibold text-foreground">
                {statusSummary.exported}
              </p>
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
                onClick={() => openForm(null)}
              >
                <Plus className="mr-2 h-4 w-4" />
                Generate report
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card className="dashboard-panel p-2">
          <CardContent className="grid gap-4 p-6 lg:grid-cols-3">
            <div className="dashboard-item p-4">
              <p className="text-sm font-semibold text-foreground">Protected workflow</p>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">
                Internal data is entered first, ENCI reviews it, the report is generated,
                approval is recorded, and only then is a PDF exported. Restricted notes and
                internal notes are not included in the generated client-facing sections.
              </p>
            </div>
            <div className="dashboard-item p-4">
              <p className="text-sm font-semibold text-foreground">Included data pulls</p>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">
                Each report generator can pull from projects, tasks, documents, change orders,
                invoices, vendor bills, deficiencies, daily logs, and compliance references.
              </p>
            </div>
            <div className="dashboard-item p-4">
              <p className="text-sm font-semibold text-foreground">Prepared-for discipline</p>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">
                Every report records audience, prepared-for context, approval path, export count,
                and audit events to support lender/client/investor meeting workflows.
              </p>
            </div>
          </CardContent>
        </Card>

        <div className="grid gap-4">
          {visibleReports.length ? (
            visibleReports.map((report) => {
              const project = projectMap.get(report.projectId);
              const latestAudit = report.auditLog?.slice(-4).reverse() || [];

              return (
                <Card key={report.id} className="dashboard-panel p-2">
                  <CardContent className="space-y-4 p-6">
                    <div className="flex flex-col gap-3 xl:flex-row xl:items-start xl:justify-between">
                      <div className="space-y-3">
                        <div className="flex flex-wrap items-center gap-2">
                          <p className="text-lg font-semibold text-foreground">{report.title}</p>
                          <Badge className="rounded-full bg-muted text-muted-foreground">
                            {report.status}
                          </Badge>
                          <Badge className="rounded-full bg-muted text-muted-foreground">
                            {report.audience}
                          </Badge>
                          <Badge className="rounded-full bg-muted text-muted-foreground">
                            {report.visibility}
                          </Badge>
                          {report.deletedAt ? (
                            <Badge className="rounded-full bg-rose-500/10 text-rose-700 dark:text-rose-300">
                              Archived
                            </Badge>
                          ) : null}
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {project?.project_name || "Project not linked"} | Prepared for{" "}
                          {report.preparedFor} | Report date {formatDate(report.reportDate)}
                        </p>
                        <p className="text-sm leading-6 text-muted-foreground">
                          {report.summary || "No generated summary recorded yet."}
                        </p>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {!report.deletedAt ? (
                          <>
                            <Button
                              type="button"
                              variant="outline"
                              className="rounded-full"
                              onClick={() => openForm(report)}
                            >
                              <Pencil className="mr-2 h-4 w-4" />
                              Edit / Regenerate
                            </Button>
                            <Button
                              type="button"
                              variant="outline"
                              className="rounded-full"
                              onClick={() => void sendToReview(report)}
                              disabled={report.status === "Review" || report.status === "Approved" || report.status === "Exported"}
                            >
                              <ShieldCheck className="mr-2 h-4 w-4" />
                              Review
                            </Button>
                            <Button
                              type="button"
                              variant="outline"
                              className="rounded-full"
                              onClick={() => void approveReport(report)}
                              disabled={report.status === "Approved" || report.status === "Exported"}
                            >
                              <CheckCircle2 className="mr-2 h-4 w-4" />
                              Approve
                            </Button>
                            <Button
                              type="button"
                              variant="outline"
                              className="rounded-full"
                              onClick={() => void exportReport(report)}
                              disabled={!canExport || (report.status !== "Approved" && report.status !== "Exported")}
                            >
                              <FileDown className="mr-2 h-4 w-4" />
                              Export PDF
                            </Button>
                            <Button
                              type="button"
                              variant="outline"
                              className="rounded-full"
                              onClick={() => {
                                setDeleteTarget(report);
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
                              onClick={() => void handleRestore(report)}
                            >
                              <RotateCcw className="mr-2 h-4 w-4" />
                              Restore
                            </Button>
                            {isAdmin ? (
                              <Button
                                type="button"
                                variant="outline"
                                className="rounded-full"
                                onClick={() => void handlePurge(report)}
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
                        <p className="text-sm font-semibold text-foreground">Section preview</p>
                        <div className="mt-3 space-y-3 text-sm text-muted-foreground">
                          {report.sections.slice(0, 3).map((section) => (
                            <div key={section.heading}>
                              <p className="font-medium text-foreground">{section.heading}</p>
                              <p>{section.body[0] || "No summary line recorded."}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                      <div className="dashboard-item p-4">
                        <p className="text-sm font-semibold text-foreground">Audit trail</p>
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
                        <div className="mt-4 rounded-2xl border border-border/70 bg-background/80 p-3 text-xs leading-5 text-muted-foreground">
                          Export count: {report.exportCount || 0}. Internal notes stay out of
                          generated sections unless explicitly rewritten into safe context fields.
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
                No client reports match the current view.
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      <Dialog open={showForm} onOpenChange={setShowForm}>
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-3xl">
          <DialogHeader>
            <DialogTitle>
              {editingRecord ? "Edit and regenerate report" : "Generate client report"}
            </DialogTitle>
          </DialogHeader>
          <form className="space-y-5" onSubmit={handleGenerate}>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="report-project">Project *</Label>
                <select
                  id="report-project"
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
                <Label htmlFor="report-title">Report title *</Label>
                <Input
                  id="report-title"
                  value={form.title}
                  onChange={(event) =>
                    setForm((current) => ({ ...current, title: event.target.value }))
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="report-prepared-for">Prepared for *</Label>
                <Input
                  id="report-prepared-for"
                  value={form.preparedFor}
                  onChange={(event) =>
                    setForm((current) => ({ ...current, preparedFor: event.target.value }))
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="report-date">Report date *</Label>
                <Input
                  id="report-date"
                  type="date"
                  value={form.reportDate}
                  onChange={(event) =>
                    setForm((current) => ({ ...current, reportDate: event.target.value }))
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="report-audience">Audience *</Label>
                <select
                  id="report-audience"
                  value={form.audience}
                  onChange={(event) =>
                    setForm((current) => ({
                      ...current,
                      audience: event.target.value as BuildOsClientReportRecord["audience"],
                    }))
                  }
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                >
                  {["Client", "Lender", "Investor", "Internal"].map((value) => (
                    <option key={value} value={value}>
                      {value}
                    </option>
                  ))}
                </select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="report-visibility">Visibility *</Label>
                <select
                  id="report-visibility"
                  value={form.visibility}
                  onChange={(event) =>
                    setForm((current) => ({
                      ...current,
                      visibility: event.target.value as BuildOsClientReportRecord["visibility"],
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
            </div>

            <div className="space-y-2">
              <Label htmlFor="report-safe-context">Prepared context / safe notes</Label>
              <Textarea
                id="report-safe-context"
                value={form.safeContextNotes}
                onChange={(event) =>
                  setForm((current) => ({ ...current, safeContextNotes: event.target.value }))
                }
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="report-internal-review">Internal review notes</Label>
              <Textarea
                id="report-internal-review"
                value={form.internalReviewNotes}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    internalReviewNotes: event.target.value,
                  }))
                }
              />
            </div>

            <div className="rounded-2xl border border-border/70 bg-background/80 p-4 text-sm leading-6 text-muted-foreground">
              Generated sections include Project Snapshot, Scope Summary, Permit Status,
              Budget Snapshot, Schedule Milestones, Risks, Daily Log Summary, Deficiencies,
              Change Orders, Documents, Next Actions, and the ENCI BuildOS communication-only
              disclaimer. Restricted notes and internal notes are not exported.
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setShowForm(false)}>
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={saving}
                className="rounded-full bg-gradient-to-r from-enc-red via-enc-orange to-enc-yellow text-white shadow-glow"
              >
                {saving ? "Generating..." : "Generate / Save Draft"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <AlertDialog open={Boolean(deleteTarget)} onOpenChange={(open) => !open && setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Archive report?</AlertDialogTitle>
            <AlertDialogDescription>
              Record why this report is being removed from the active internal review queue.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="space-y-2">
            <Label htmlFor="client-report-delete-reason">Reason for archive *</Label>
            <Textarea
              id="client-report-delete-reason"
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
