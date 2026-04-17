import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { Download, FileDown, Printer, TriangleAlert } from "lucide-react";
import ManagementLayout from "@/components/management/ManagementLayout";
import Badge from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  buildProjectAlerts,
  getPortfolioFinancialOverview,
  getProjectFinancialSummary,
  getProjectHealthStatus,
} from "@/lib/buildosIntelligence";
import {
  loadBuildOsChangeOrders,
  loadBuildOsClientInvoices,
  loadBuildOsDailyLogs,
  loadBuildOsDeficiencies,
  loadBuildOsDocuments,
  loadBuildOsTasks,
  loadMasterDatabaseRecords,
  loadBuildOsVendorBills,
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

  const projectHealthRows = useMemo(
    () =>
      projects.map((project) => {
        const alerts = buildProjectAlerts(
          project,
          changeOrders,
          clientInvoices,
          vendorBills,
          deficiencies,
          documents,
          tasks
        );
        const financialSummary = getProjectFinancialSummary(
          project,
          changeOrders,
          clientInvoices,
          vendorBills
        );
        const health = getProjectHealthStatus(
          project,
          financialSummary,
          deficiencies,
          alerts
        );

        return {
          project,
          alerts,
          financialSummary,
          health,
        };
      }),
    [projects, changeOrders, clientInvoices, vendorBills, deficiencies, documents, tasks]
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

  const tasksCsv = useMemo(
    () => buildTasksCsv(tasks, projects, records),
    [projects, records, tasks]
  );

  const projectHealthCsv = useMemo(
    () =>
      buildCsv(
        [
          "Project",
          "Status",
          "Health",
          "Revised Budget",
          "Unpaid Client Invoices",
          "Unpaid Vendor Bills",
          "Open Alerts",
        ],
        projectHealthRows.map(({ project, health, financialSummary, alerts }) => [
          project.project_name,
          project.status,
          health,
          financialSummary.revisedBudget,
          financialSummary.unpaidClientInvoices,
          financialSummary.unpaidVendorBills,
          alerts.length,
        ])
      ),
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
              ENCI BuildOS now exports the live records that exist today: project
              registry, financial entries, change orders, daily logs, and
              deficiencies. These are operational exports, not legal or accounting
              statements, unless the underlying source data has been reviewed for
              that purpose.
            </p>
          </div>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row">
          <Button
            className="rounded-full bg-gradient-to-r from-enc-red via-enc-orange to-enc-yellow text-white shadow-glow"
            onClick={() => downloadCsv("enci-buildos-project-health.csv", projectHealthCsv)}
            disabled={!projects.length}
          >
            <Download className="mr-2 h-4 w-4" />
            Download Project Health CSV
          </Button>
          <Button variant="outline" className="rounded-full" onClick={() => window.print()}>
            <Printer className="mr-2 h-4 w-4" />
            Print Report Summary
          </Button>
          <Button
            variant="outline"
            className="rounded-full"
            onClick={() =>
              void downloadPdf("enci-buildos-financial-summary.pdf", [
                "ENCI BuildOS Financial Summary",
                `Projects in registry: ${projects.length}`,
                `Revised portfolio budget: ${formatCurrency(portfolioOverview.revisedBudget)}`,
                `Committed costs: ${formatCurrency(portfolioOverview.committedCosts)}`,
                `Cash inflows tracked: ${formatCurrency(portfolioOverview.cashInflows)}`,
                `Cash outflows tracked: ${formatCurrency(portfolioOverview.cashOutflows)}`,
                `Unpaid client invoices: ${formatCurrency(portfolioOverview.unpaidClientInvoices)}`,
                `Unpaid vendor bills: ${formatCurrency(portfolioOverview.unpaidVendorBills)}`,
              ])
            }
            disabled={!projects.length}
          >
            <FileDown className="mr-2 h-4 w-4" />
            Financial Summary PDF
          </Button>
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
                      projects.find((project) => project.id === invoice.projectId)?.project_name ||
                      invoice.projectId;
                    return `${projectName} | ${invoice.drawReference} | ${formatCurrency(invoice.amount)} | ${invoice.status}`;
                  }),
              ])
            }
            disabled={!clientInvoices.some((invoice) => invoice.drawReference)}
          >
            <FileDown className="mr-2 h-4 w-4" />
            Lender Draw PDF
          </Button>
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
              <p className="text-sm font-medium text-muted-foreground">Unpaid obligations</p>
              <p className="mt-3 text-3xl font-semibold text-foreground">
                {formatCurrency(
                  portfolioOverview.unpaidClientInvoices +
                    portfolioOverview.unpaidVendorBills
                )}
              </p>
            </CardContent>
          </Card>
        </div>

        <Card className="dashboard-panel p-2">
          <CardHeader>
            <CardTitle className="text-xl text-foreground">Reporting depth that stays builder-friendly</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4 lg:grid-cols-3">
            <div className="dashboard-item p-4">
              <p className="text-sm font-semibold text-foreground">Relationship-aware exports</p>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">
                BuildOS is not only tasks and schedules. Reports can now include vendors, stakeholders, lawyers, realtors, lenders, and investors from the same operating register.
              </p>
            </div>
            <div className="dashboard-item p-4">
              <p className="text-sm font-semibold text-foreground">Audit-ready summaries</p>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">
                Financials, change orders, deficiencies, documents, and task health all export from the same structured records instead of disconnected spreadsheets.
              </p>
            </div>
            <div className="dashboard-item p-4">
              <p className="text-sm font-semibold text-foreground">Supportable rollout</p>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">
                The reporting layer stays lean: real CSV and PDF outputs today, with room for deeper lender/admin packs as more verified project data is added.
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
            <div className="grid gap-4 xl:grid-cols-2">
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
            </div>

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
                  projectHealthRows.map(({ project, health, financialSummary, alerts }) => (
                    <div key={project.id} className="dashboard-item p-4">
                      <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
                        <div>
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
                          </div>
                          <div className="mt-3 flex flex-wrap gap-4 text-sm text-muted-foreground">
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
                          </div>
                        </div>

                        <div className="rounded-2xl border border-border/70 bg-background/80 px-4 py-3 text-sm text-muted-foreground">
                          <p className="font-medium text-foreground">Alert count</p>
                          <p className="mt-2">{alerts.length}</p>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="dashboard-item p-6 text-sm leading-6 text-muted-foreground">
                    No registry-backed projects are available to report yet.
                  </div>
                )}
              </CardContent>
            </Card>
          </>
        )}
      </div>
    </ManagementLayout>
  );
}
