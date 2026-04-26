import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { Download, FileDown, Printer, TriangleAlert } from "lucide-react";
import ManagementLayout from "@/components/management/ManagementLayout";
import ProjectDecisionSupportPanel from "@/components/projects/ProjectDecisionSupportPanel";
import ProjectParticipantPresence from "@/components/projects/ProjectParticipantPresence";
import ProjectSignalBadgeCluster from "@/components/projects/ProjectSignalBadgeCluster";
import Badge from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  buildPortfolioAlerts,
  getPortfolioFinancialOverview,
} from "@/lib/buildosIntelligence";
import { buildProjectAuditSnapshot } from "@/lib/projectAudit";
import { buildProjectControlSnapshot } from "@/lib/projectControl";
import {
  loadBuildOsChangeOrders,
  loadBuildOsClientInvoices,
  loadBuildOsDailyLogs,
  loadBuildOsDeficiencies,
  loadBuildOsDocuments,
  loadBuildOsProjectParticipantAssignments,
  loadBuildOsTasks,
  loadBuildOsVendorBills,
  loadMasterDatabaseRecords,
} from "@/lib/buildosShared";
import {
  buildProjectsCsv,
  fetchManagementProjects,
  formatCurrency,
} from "@/lib/managementData";
import { buildTasksCsv } from "@/lib/buildosTasks";

function downloadCsv(filename: string, content: string) {
  const blob = new Blob([content], { type: "text/csv;charset=utf-8" });
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement("a");

  link.href = url;
  link.download = filename;
  link.click();

  window.URL.revokeObjectURL(url);
}

function buildCsv(headers: string[], rows: Array<Array<string | number | boolean | undefined>>) {
  const escapeCell = (value: string) =>
    /[",\n]/.test(value) ? `"${value.replace(/"/g, '""')}"` : value;

  return [headers, ...rows]
    .map((row) => row.map((cell) => escapeCell(String(cell ?? ""))).join(","))
    .join("\n");
}

async function downloadPdf(filename: string, lines: string[]) {
  const { jsPDF } = await import("jspdf");
  const pdf = new jsPDF({
    unit: "pt",
    format: "letter",
  });

  let y = 48;
  lines.forEach((line, index) => {
    if (y > 730) {
      pdf.addPage();
      y = 48;
    }

    pdf.setFont("helvetica", index === 0 ? "bold" : "normal");
    pdf.setFontSize(index === 0 ? 16 : 10);
    pdf.text(line, 48, y);
    y += index === 0 ? 24 : 16;
  });

  pdf.save(filename);
}

async function downloadWorkbook(
  filename: string,
  sheets: Record<string, Array<Record<string, string | number>>>
) {
  const XLSX = await import("xlsx");
  const workbook = XLSX.utils.book_new();

  Object.entries(sheets).forEach(([sheetName, rows]) => {
    const worksheet = XLSX.utils.json_to_sheet(rows);
    XLSX.utils.book_append_sheet(workbook, worksheet, sheetName.slice(0, 31));
  });

  XLSX.writeFile(workbook, filename);
}

export default function ManagementReports() {
  const {
    data: projects = [],
    error,
    isLoading,
  } = useQuery({
    queryKey: ["management-projects"],
    queryFn: fetchManagementProjects,
  });

  const { data: changeOrders = [] } = useQuery({
    queryKey: ["buildos-change-orders"],
    queryFn: async () => loadBuildOsChangeOrders(),
  });

  const { data: dailyLogs = [] } = useQuery({
    queryKey: ["buildos-daily-logs"],
    queryFn: async () => loadBuildOsDailyLogs(),
  });

  const { data: deficiencies = [] } = useQuery({
    queryKey: ["buildos-deficiencies"],
    queryFn: async () => loadBuildOsDeficiencies(),
  });

  const { data: clientInvoices = [] } = useQuery({
    queryKey: ["buildos-client-invoices"],
    queryFn: async () => loadBuildOsClientInvoices(),
  });

  const { data: vendorBills = [] } = useQuery({
    queryKey: ["buildos-vendor-bills"],
    queryFn: async () => loadBuildOsVendorBills(),
  });
  const { data: tasks = [] } = useQuery({
    queryKey: ["buildos-tasks"],
    queryFn: async () => loadBuildOsTasks(),
  });
  const { data: records = [] } = useQuery({
    queryKey: ["buildos-master-database"],
    queryFn: async () => loadMasterDatabaseRecords(),
  });
  const { data: documents = [] } = useQuery({
    queryKey: ["buildos-documents"],
    queryFn: async () => loadBuildOsDocuments(),
  });
  const { data: participantAssignments = [] } = useQuery({
    queryKey: ["buildos-project-participants"],
    queryFn: async () => loadBuildOsProjectParticipantAssignments(),
  });

  const documentCsv = useMemo(
    () =>
      buildCsv(
        [
          "Title",
          "Project ID",
          "Linked Record",
          "Type",
          "Version",
          "Upload Date",
          "Expiry Date",
        ],
        documents.map((item) => [
          item.title,
          item.projectId,
          item.linkedRecordId,
          item.documentType,
          item.versionLabel,
          item.uploadDate,
          item.expiryDate,
        ])
      ),
    [documents]
  );

  const masterDatabaseCsv = useMemo(
    () =>
      buildCsv(
        [
          "Type",
          "Company",
          "Person",
          "Trade",
          "Phone",
          "Email",
          "Status",
          "Work Again",
          "Recommended",
        ],
        records.map((item) => [
          item.type,
          item.companyName,
          item.personName,
          item.tradeCategory,
          item.phone,
          item.email,
          item.status,
          item.workAgain,
          item.recommended,
        ])
      ),
    [records]
  );

  const portfolioOverview = useMemo(
    () =>
      getPortfolioFinancialOverview(projects, changeOrders, clientInvoices, vendorBills),
    [projects, changeOrders, clientInvoices, vendorBills]
  );

  const portfolioAlerts = useMemo(
    () =>
      buildPortfolioAlerts(
        projects,
        changeOrders,
        clientInvoices,
        vendorBills,
        deficiencies,
        documents,
        tasks
      ),
    [projects, changeOrders, clientInvoices, vendorBills, deficiencies, documents, tasks]
  );

  const projectHealthRows = useMemo(
    () =>
      projects.map((project) => {
        const assignment =
          participantAssignments.find((item) => item.projectId === project.id) || null;
        const snapshot = buildProjectControlSnapshot({
          assignment,
          changeOrders,
          clientInvoices,
          deficiencies,
          documents,
          project,
          records,
          tasks,
          vendorBills,
        });
        const auditSnapshot = buildProjectAuditSnapshot({
          assignment,
          changeOrders,
          clientInvoices,
          dailyLogs,
          documents,
          projectId: project.id,
          records,
          tasks,
          vendorBills,
        });

        return {
          auditSnapshot,
          project,
          alerts: snapshot.alerts,
          dailyLogCount: dailyLogs.filter((item) => item.projectId === project.id).length,
          deficiencyCount: deficiencies.filter(
            (item) => item.projectId === project.id && item.status !== "Closed"
          ).length,
          documentCount: documents.filter((item) => item.projectId === project.id).length,
          financialSummary: snapshot.projectSummary,
          health: snapshot.projectHealth,
          snapshot,
        };
      }),
    [
      projects,
      participantAssignments,
      changeOrders,
      clientInvoices,
      deficiencies,
      documents,
      records,
      tasks,
      vendorBills,
      dailyLogs,
    ]
  );

  const registryCsv = useMemo(() => buildProjectsCsv(projects), [projects]);

  const changeOrderCsv = useMemo(
    () =>
      buildCsv(
        [
          "Project ID",
          "Title",
          "Category",
          "Status",
          "Budget Impact",
          "Time Impact Days",
          "Updated At",
        ],
        changeOrders.map((item) => [
          item.projectId,
          item.title,
          item.costCategory,
          item.status,
          item.budgetImpact,
          item.timeImpactDays,
          item.updatedAt,
        ])
      ),
    [changeOrders]
  );

  const dailyLogCsv = useMemo(
    () =>
      buildCsv(
        [
          "Project ID",
          "Date",
          "Weather",
          "Crew Count",
          "Trades Onsite",
          "Inspections",
          "Created By",
        ],
        dailyLogs.map((item) => [
          item.projectId,
          item.date,
          item.weather,
          item.crewCount,
          item.tradesOnsite.join(" | "),
          item.inspections,
          item.createdBy,
        ])
      ),
    [dailyLogs]
  );

  const deficiencyCsv = useMemo(
    () =>
      buildCsv(
        [
          "Project ID",
          "Title",
          "Location",
          "Severity",
          "Status",
          "Warranty Linked",
          "Due Date",
        ],
        deficiencies.map((item) => [
          item.projectId,
          item.title,
          item.location,
          item.severity,
          item.status,
          item.warrantyLinked,
          item.dueDate,
        ])
      ),
    [deficiencies]
  );

  const invoiceCsv = useMemo(
    () =>
      buildCsv(
        [
          "Project ID",
          "Invoice Number",
          "Invoice Date",
          "Due Date",
          "Amount",
          "Status",
          "Draw Reference",
        ],
        clientInvoices.map((item) => [
          item.projectId,
          item.invoiceNumber,
          item.invoiceDate,
          item.dueDate,
          item.amount,
          item.status,
          item.drawReference,
        ])
      ),
    [clientInvoices]
  );

  const vendorBillsCsv = useMemo(
    () =>
      buildCsv(
        [
          "Project ID",
          "Invoice Number",
          "Invoice Date",
          "Due Date",
          "Amount",
          "Status",
          "Attachment",
        ],
        vendorBills.map((item) => [
          item.projectId,
          item.invoiceNumber,
          item.invoiceDate,
          item.dueDate,
          item.amount,
          item.status,
          item.attachmentUrl,
        ])
      ),
    [vendorBills]
  );

  const tasksCsv = useMemo(() => buildTasksCsv(tasks, projects, records), [projects, records, tasks]);

  const projectHealthCsv = useMemo(
    () =>
      buildCsv(
        [
          "Project",
          "Status",
          "Health",
          "Scope Status",
          "Expected Profit",
          "Current Profit",
          "Profit At Risk",
          "Revised Budget",
          "Unpaid Client Invoices",
          "Unpaid Vendor Bills",
          "Open Alerts",
          "Participants Visible",
        ],
        projectHealthRows.map(({ project, health, financialSummary, alerts, snapshot }) => [
          project.project_name,
          project.status,
          health,
          snapshot.scopeStatus,
          snapshot.expectedProfit ?? "",
          snapshot.currentProfit ?? "",
          snapshot.profitAtRisk,
          financialSummary.revisedBudget,
          financialSummary.unpaidClientInvoices,
          financialSummary.unpaidVendorBills,
          alerts.length,
          snapshot.participantHighlights
            .map((group) => `${group.role} ${group.count}`)
            .join(" | "),
        ])
      ),
    [projectHealthRows]
  );

  const decisionWorkbookSheets = useMemo(
    () => ({
      "Portfolio Summary": [
        { Metric: "Projects in registry", Value: projects.length },
        { Metric: "Revised portfolio budget", Value: portfolioOverview.revisedBudget },
        { Metric: "Approved change-order impact", Value: portfolioOverview.approvedChangeOrderImpact },
        { Metric: "Pending change-order exposure", Value: portfolioOverview.pendingChangeOrderExposure },
        { Metric: "Unpaid client invoices", Value: portfolioOverview.unpaidClientInvoices },
        { Metric: "Unpaid vendor bills", Value: portfolioOverview.unpaidVendorBills },
      ],
      "Project Health": projectHealthRows.map(({ project, health, snapshot, alerts }) => ({
        Project: project.project_name,
        Status: project.status,
        Health: health,
        ScopeStatus: snapshot.scopeStatus,
        ExpectedProfit: snapshot.expectedProfit ?? "",
        CurrentProfit: snapshot.currentProfit ?? "",
        ProfitAtRisk: snapshot.profitAtRisk,
        PendingCOExposure: snapshot.projectSummary.pendingChangeOrderExposure,
        OpenAlerts: alerts.length,
      })),
      "Profit Scope": projectHealthRows.map(({ project, snapshot }) => ({
        Project: project.project_name,
        ScopeSubject: project.scope_subject || "Not set",
        RevisedBudget: snapshot.projectSummary.revisedBudget,
        CurrentCostProjection: snapshot.currentCostProjection,
        ExpectedProfit: snapshot.expectedProfit ?? "",
        CurrentProfit: snapshot.currentProfit ?? "",
        ProfitAtRisk: snapshot.profitAtRisk,
        MarginImpact: snapshot.marginImpact ?? "",
        ScopeStatus: snapshot.scopeStatus,
      })),
      "Relationship Visibility": projectHealthRows.flatMap(({ project, snapshot }) =>
        snapshot.participantHighlights.length
          ? snapshot.participantHighlights.map((group) => ({
              Project: project.project_name,
              Role: group.role,
              Count: group.count,
              VisibleNames: group.labels.join(", "),
            }))
          : [
              {
                Project: project.project_name,
                Role: "No linked participants",
                Count: 0,
                VisibleNames: "",
              },
            ]
      ),
    }),
    [portfolioOverview, projectHealthRows, projects.length]
  );

  const projectHealthPdfLines = useMemo(
    () => [
      "ENCI BuildOS Project Health Report",
      ...projectHealthRows.flatMap(({ project, snapshot, alerts }) => [
        `${project.project_name} | ${project.status} | ${snapshot.projectHealth} | ${snapshot.scopeStatus}`,
        `Expected profit ${formatCurrency(snapshot.expectedProfit)} | Current profit ${formatCurrency(snapshot.currentProfit)} | Profit at risk ${formatCurrency(snapshot.profitAtRisk)}`,
        `Pending CO exposure ${formatCurrency(snapshot.projectSummary.pendingChangeOrderExposure)} | Alerts ${alerts.length} | Participants ${snapshot.participantHighlights.map((group) => `${group.role} ${group.count}`).join(", ") || "None"}`,
        `Next actions: ${snapshot.nextThreeActions.join(" | ") || "None generated"}`,
      ]),
    ],
    [projectHealthRows]
  );

  const financialSummaryPdfLines = useMemo(
    () => [
      "ENCI BuildOS Financial Summary",
      `Projects in registry: ${projects.length}`,
      `Revised portfolio budget: ${formatCurrency(portfolioOverview.revisedBudget)}`,
      `Committed costs: ${formatCurrency(portfolioOverview.committedCosts)}`,
      `Cash inflows tracked: ${formatCurrency(portfolioOverview.cashInflows)}`,
      `Cash outflows tracked: ${formatCurrency(portfolioOverview.cashOutflows)}`,
      `Approved change-order impact: ${formatCurrency(portfolioOverview.approvedChangeOrderImpact)}`,
      `Pending change-order exposure: ${formatCurrency(portfolioOverview.pendingChangeOrderExposure)}`,
      `Unpaid client invoices: ${formatCurrency(portfolioOverview.unpaidClientInvoices)}`,
      `Unpaid vendor bills: ${formatCurrency(portfolioOverview.unpaidVendorBills)}`,
      ...projectHealthRows.map(
        ({ project, snapshot }) =>
          `${project.project_name} | Expected profit ${formatCurrency(snapshot.expectedProfit)} | Current profit ${formatCurrency(snapshot.currentProfit)} | Profit at risk ${formatCurrency(snapshot.profitAtRisk)}`
      ),
    ],
    [portfolioOverview, projectHealthRows, projects.length]
  );

  const progressReportPdfLines = useMemo(
    () => [
      "ENCI BuildOS Progress Report",
      ...projectHealthRows.flatMap(
        ({ project, snapshot, dailyLogCount, documentCount, deficiencyCount }) => [
          `${project.project_name} | ${project.status} | ${snapshot.scopeStatus}`,
          `Scope: ${project.scope_subject || "Not set"}`,
          `Next milestone: ${project.next_milestone || "Not set"} | Daily logs ${dailyLogCount} | Documents ${documentCount} | Open deficiencies ${deficiencyCount}`,
          `Participants: ${snapshot.participantHighlights.map((group) => `${group.role} ${group.count}`).join(", ") || "No linked participants"}`,
          `Next actions: ${snapshot.nextThreeActions.join(" | ") || "None generated"}`,
        ]
      ),
    ],
    [projectHealthRows]
  );

  const exportCards = [
    {
      title: "Project Registry",
      detail: "Projects, statuses, addresses, and registry baselines.",
      count: projects.length,
      filename: "enci-buildos-project-registry.csv",
      content: registryCsv,
    },
    {
      title: "Change Orders",
      detail: "Budget impact, time impact, and approval tracking.",
      count: changeOrders.length,
      filename: "enci-buildos-change-orders.csv",
      content: changeOrderCsv,
    },
    {
      title: "Daily Logs",
      detail: "Field execution records, crew counts, and inspections.",
      count: dailyLogs.length,
      filename: "enci-buildos-daily-logs.csv",
      content: dailyLogCsv,
    },
    {
      title: "Deficiencies",
      detail: "Punch, closeout, and warranty-linked issue tracking.",
      count: deficiencies.length,
      filename: "enci-buildos-deficiencies.csv",
      content: deficiencyCsv,
    },
    {
      title: "Client Invoices",
      detail: "Receivables and lender draw references.",
      count: clientInvoices.length,
      filename: "enci-buildos-client-invoices.csv",
      content: invoiceCsv,
    },
    {
      title: "Vendor Bills",
      detail: "Payables, due dates, and attachment references.",
      count: vendorBills.length,
      filename: "enci-buildos-vendor-bills.csv",
      content: vendorBillsCsv,
    },
    {
      title: "Project Tasks",
      detail: "Execution tasks, assignees, dates, and milestone flags.",
      count: tasks.length,
      filename: "enci-buildos-project-tasks.csv",
      content: tasksCsv,
    },
    {
      title: "Document Register",
      detail: "Version labels, linked entities, expiry dates, and preview references.",
      count: documents.length,
      filename: "enci-buildos-documents.csv",
      content: documentCsv,
    },
    {
      title: "Master Database",
      detail: "Relationship intelligence across trades, clients, realtors, lawyers, lenders, and investors.",
      count: records.length,
      filename: "enci-buildos-master-database.csv",
      content: masterDatabaseCsv,
    },
  ];

  return (
    <ManagementLayout currentPageName="reports">
      <div className="space-y-6">
        <div className="dashboard-panel overflow-hidden p-8">
          <div className="absolute inset-y-0 right-0 w-44 bg-gradient-to-l from-enc-yellow/10 via-enc-orange/10 to-transparent" />
          <div className="relative">
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-enc-orange">
              Reporting & Exports
            </p>
            <h1 className="mt-3 text-3xl font-bold text-foreground">Reports</h1>
            <p className="mt-4 max-w-4xl text-sm leading-6 text-muted-foreground">
              ENCI BuildOS keeps the front-stage reporting layer disciplined:
              Project Health Report, Financial Summary, and Progress Report.
              Raw exports still exist below for operators, but the main reporting
              experience stays readable for owners, lenders, and project leads.
            </p>
          </div>
        </div>

        <div className="grid gap-4 xl:grid-cols-3">
          <Card className="dashboard-panel p-2">
            <CardContent className="flex h-full flex-col justify-between gap-4 p-6">
              <div>
                <p className="text-lg font-semibold text-foreground">Project Health Report</p>
                <p className="mt-3 text-sm leading-6 text-muted-foreground">
                  Front-stage health report for owners, lenders, and internal
                  review. Status, scope, profit pressure, participant visibility,
                  and next actions stay on one readable page.
                </p>
              </div>
              <div className="flex flex-col gap-2">
                <Button
                  className="rounded-full bg-gradient-to-r from-enc-red via-enc-orange to-enc-yellow text-white shadow-glow"
                  onClick={() =>
                    void downloadPdf(
                      "enci-buildos-project-health-report.pdf",
                      projectHealthPdfLines
                    )
                  }
                  disabled={!projects.length}
                >
                  <FileDown className="mr-2 h-4 w-4" />
                  Export PDF
                </Button>
                <Button
                  variant="outline"
                  className="rounded-full"
                  onClick={() => downloadCsv("enci-buildos-project-health.csv", projectHealthCsv)}
                  disabled={!projects.length}
                >
                  <Download className="mr-2 h-4 w-4" />
                  Export CSV
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card className="dashboard-panel p-2">
            <CardContent className="flex h-full flex-col justify-between gap-4 p-6">
              <div>
                <p className="text-lg font-semibold text-foreground">Financial Summary</p>
                <p className="mt-3 text-sm leading-6 text-muted-foreground">
                  Expected profit, current profit, profit at risk, pending scope
                  exposure, and cash pressure. This is where BuildOS behaves like
                  decision support instead of raw accounting support.
                </p>
              </div>
              <div className="flex flex-col gap-2">
                <Button
                  className="rounded-full bg-gradient-to-r from-enc-red via-enc-orange to-enc-yellow text-white shadow-glow"
                  onClick={() =>
                    void downloadPdf(
                      "enci-buildos-financial-summary.pdf",
                      financialSummaryPdfLines
                    )
                  }
                  disabled={!projects.length}
                >
                  <FileDown className="mr-2 h-4 w-4" />
                  Export PDF
                </Button>
                <Button
                  variant="outline"
                  className="rounded-full"
                  onClick={() =>
                    void downloadWorkbook(
                      "enci-buildos-decision-workbook.xlsx",
                      decisionWorkbookSheets
                    )
                  }
                  disabled={!projects.length}
                >
                  <Download className="mr-2 h-4 w-4" />
                  Export Workbook
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card className="dashboard-panel p-2">
            <CardContent className="flex h-full flex-col justify-between gap-4 p-6">
              <div>
                <p className="text-lg font-semibold text-foreground">Progress Report</p>
                <p className="mt-3 text-sm leading-6 text-muted-foreground">
                  Cleaner project progress pack with scope, documents, daily logs,
                  deficiencies, participant presence, and immediate next actions.
                </p>
              </div>
              <div className="flex flex-col gap-2">
                <Button
                  className="rounded-full bg-gradient-to-r from-enc-red via-enc-orange to-enc-yellow text-white shadow-glow"
                  onClick={() =>
                    void downloadPdf(
                      "enci-buildos-progress-report.pdf",
                      progressReportPdfLines
                    )
                  }
                  disabled={!projects.length}
                >
                  <FileDown className="mr-2 h-4 w-4" />
                  Export PDF
                </Button>
                <Button
                  variant="outline"
                  className="rounded-full"
                  onClick={() => window.print()}
                >
                  <Printer className="mr-2 h-4 w-4" />
                  Print Summary
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <Card className="dashboard-panel p-2">
            <CardContent className="p-5">
              <p className="text-sm font-medium text-muted-foreground">Projects in registry</p>
              <p className="mt-3 text-3xl font-semibold text-foreground">{projects.length}</p>
            </CardContent>
          </Card>
          <Card className="dashboard-panel p-2">
            <CardContent className="p-5">
              <p className="text-sm font-medium text-muted-foreground">Live operational records</p>
              <p className="mt-3 text-3xl font-semibold text-foreground">
                {changeOrders.length +
                  dailyLogs.length +
                  deficiencies.length +
                  clientInvoices.length +
                  vendorBills.length}
              </p>
            </CardContent>
          </Card>
          <Card className="dashboard-panel p-2">
            <CardContent className="p-5">
              <p className="text-sm font-medium text-muted-foreground">Revised portfolio budget</p>
              <p className="mt-3 text-3xl font-semibold text-foreground">
                {formatCurrency(portfolioOverview.revisedBudget)}
              </p>
            </CardContent>
          </Card>
          <Card className="dashboard-panel p-2">
            <CardContent className="p-5">
              <p className="text-sm font-medium text-muted-foreground">Portfolio alerts</p>
              <p className="mt-3 text-3xl font-semibold text-foreground">
                {portfolioAlerts.length}
              </p>
            </CardContent>
          </Card>
        </div>

        <Card className="dashboard-panel p-2">
          <CardHeader>
            <CardTitle className="text-xl text-foreground">
              Disciplined reporting, not report sprawl
            </CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4 lg:grid-cols-3">
            <div className="dashboard-item p-4">
              <p className="text-sm font-semibold text-foreground">Three flagship reports first</p>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">
                BuildOS keeps the front-stage reporting layer disciplined:
                Project Health Report, Financial Summary, and Progress Report.
                The raw exports still exist, but they do not clutter the main
                operator flow.
              </p>
            </div>
            <div className="dashboard-item p-4">
              <p className="text-sm font-semibold text-foreground">Relationship-aware visibility</p>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">
                Reports now carry stakeholders, lawyers, realtors, lenders,
                investors, and vendors from the same operating register, so the
                project is reported as a real deal and real build at the same time.
              </p>
            </div>
            <div className="dashboard-item p-4">
              <p className="text-sm font-semibold text-foreground">Supportable rollout</p>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">
                The reporting layer stays lean: real CSV, workbook, and PDF
                outputs today, with room for deeper lender/admin packs as more
                verified project data is added.
              </p>
            </div>
          </CardContent>
        </Card>

        {isLoading ? (
          <Card className="dashboard-panel p-2">
            <CardContent className="p-6 text-sm text-muted-foreground">
              Loading report data...
            </CardContent>
          </Card>
        ) : error ? (
          <Card className="dashboard-panel p-2">
            <CardContent className="flex items-start gap-3 p-6 text-sm leading-6 text-muted-foreground">
              <TriangleAlert className="mt-0.5 h-4 w-4 shrink-0 text-rose-500" />
              Reporting data could not be loaded from the management API.
            </CardContent>
          </Card>
        ) : (
          <>
            <Card className="dashboard-panel p-2">
              <CardHeader className="flex flex-row items-start justify-between gap-4">
                <div>
                  <CardTitle className="text-xl text-foreground">Operational data exports</CardTitle>
                  <p className="mt-2 text-sm text-muted-foreground">
                    Raw CSV exports remain available for operators who need the
                    underlying data behind the flagship reports.
                  </p>
                </div>
                <Badge className="rounded-full bg-muted text-muted-foreground">
                  Secondary export layer
                </Badge>
              </CardHeader>
              <CardContent className="grid gap-4 xl:grid-cols-2">
                {exportCards.map((card) => (
                  <Card key={card.title} className="dashboard-panel p-2">
                    <CardContent className="flex h-full flex-col justify-between gap-4 p-6">
                      <div>
                        <div className="flex items-center justify-between gap-3">
                          <p className="text-lg font-semibold text-foreground">{card.title}</p>
                          <Badge className="rounded-full bg-muted text-muted-foreground">
                            {card.count} records
                          </Badge>
                        </div>
                        <p className="mt-3 text-sm leading-6 text-muted-foreground">
                          {card.detail}
                        </p>
                      </div>

                      <Button
                        variant="outline"
                        className="w-full rounded-full"
                        onClick={() => downloadCsv(card.filename, card.content)}
                        disabled={!card.count}
                      >
                        <FileDown className="mr-2 h-4 w-4" />
                        Export CSV
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </CardContent>
            </Card>

            <Card className="dashboard-panel p-2">
              <CardHeader className="flex flex-row items-start justify-between gap-4">
                <div>
                  <CardTitle className="text-xl text-foreground">Project health register</CardTitle>
                  <p className="mt-2 text-sm text-muted-foreground">
                    Simple, explainable health signals for lender and operator review.
                  </p>
                </div>
                <Badge className="rounded-full bg-muted text-muted-foreground">
                  Read-only summary
                </Badge>
              </CardHeader>
              <CardContent className="space-y-3">
                {projectHealthRows.length ? (
                  projectHealthRows.map(
                    ({
                      project,
                      health,
                      financialSummary,
                      alerts,
                      auditSnapshot,
                      snapshot,
                    }) => (
                      <div key={project.id} className="dashboard-item p-4">
                        <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
                          <div className="space-y-4">
                            <div className="flex flex-wrap items-center gap-2">
                              <p className="text-base font-semibold text-foreground">
                                {project.project_name}
                              </p>
                              <Badge className="rounded-full bg-muted text-muted-foreground">
                                {project.status}
                              </Badge>
                              <Badge
                                className={
                                  health === "Critical"
                                    ? "rounded-full bg-rose-500/10 text-rose-700 dark:text-rose-300"
                                    : health === "Warning"
                                      ? "rounded-full bg-amber-500/10 text-amber-700 dark:text-amber-300"
                                      : "rounded-full bg-emerald-500/10 text-emerald-700 dark:text-emerald-300"
                                }
                              >
                                {health}
                              </Badge>
                              <Badge
                                className={
                                  snapshot.scopeTone === "red"
                                    ? "rounded-full bg-rose-500/10 text-rose-700 dark:text-rose-300"
                                    : snapshot.scopeTone === "yellow"
                                      ? "rounded-full bg-amber-500/10 text-amber-700 dark:text-amber-300"
                                      : "rounded-full bg-emerald-500/10 text-emerald-700 dark:text-emerald-300"
                                }
                              >
                                {snapshot.scopeStatus}
                              </Badge>
                            </div>

                            <ProjectSignalBadgeCluster snapshot={snapshot} />

                            <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                              <span>
                                Revised budget: {formatCurrency(financialSummary.revisedBudget)}
                              </span>
                              <span>
                                Unpaid client invoices:{" "}
                                {formatCurrency(financialSummary.unpaidClientInvoices)}
                              </span>
                              <span>
                                Unpaid vendor bills:{" "}
                                {formatCurrency(financialSummary.unpaidVendorBills)}
                              </span>
                              <span>
                                Profit at risk: {formatCurrency(snapshot.profitAtRisk)}
                              </span>
                            </div>

                            <div className="grid gap-4 xl:grid-cols-[minmax(0,1.1fr)_minmax(320px,0.9fr)]">
                              <ProjectDecisionSupportPanel
                                includeActions={false}
                                snapshot={snapshot}
                                title="Profit & scope control"
                                caption="The operator read: where the margin sits now, what is still unresolved, and whether scope is staying aligned."
                              />
                              <ProjectParticipantPresence compact snapshot={snapshot} />
                            </div>
                          </div>

                          <div className="rounded-2xl border border-border/70 bg-background/80 px-4 py-3 text-sm text-muted-foreground">
                            <p className="font-medium text-foreground">Alert count</p>
                            <p className="mt-2">{alerts.length}</p>
                            <p className="mt-3 font-medium text-foreground">Audit coverage</p>
                            <p className="mt-2">{auditSnapshot.actorCoverage}%</p>
                            <p className="mt-3 font-medium text-foreground">Last linked change</p>
                            <p className="mt-2">
                              {auditSnapshot.entries[0]
                                ? `${auditSnapshot.entries[0].actor} | ${auditSnapshot.entries[0].changedAt}`
                                : "No tracked changes yet"}
                            </p>
                            <p className="mt-3 font-medium text-foreground">Scope headline</p>
                            <p className="mt-2">{project.scope_subject || "Scope subject not set"}</p>
                          </div>
                        </div>
                      </div>
                    )
                  )
                ) : (
                  <div className="dashboard-item p-6 text-sm leading-6 text-muted-foreground">
                    No registry-backed projects are available to report yet.
                  </div>
                )}
              </CardContent>
            </Card>

            <Button
              variant="outline"
              className="rounded-full"
              onClick={() =>
                void downloadPdf("enci-buildos-lender-draw-pack.pdf", [
                  "ENCI BuildOS Lender Draw Pack",
                  ...clientInvoices
                    .filter((invoice) => invoice.drawReference)
                    .map((invoice) => {
                      const projectName =
                        projects.find((project) => project.id === invoice.projectId)
                          ?.project_name || invoice.projectId;
                      return `${projectName} | ${invoice.drawReference} | ${formatCurrency(invoice.amount)} | ${invoice.status}`;
                    }),
                ])
              }
              disabled={!clientInvoices.some((invoice) => invoice.drawReference)}
            >
              <FileDown className="mr-2 h-4 w-4" />
              Export Lender Draw PDF
            </Button>
          </>
        )}
      </div>
    </ManagementLayout>
  );
}
