import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { DollarSign, Landmark, Search, TriangleAlert } from "lucide-react";
import ManagementLayout from "@/components/management/ManagementLayout";
import ProjectDecisionSupportPanel from "@/components/projects/ProjectDecisionSupportPanel";
import ProjectParticipantPresence from "@/components/projects/ProjectParticipantPresence";
import ProjectSignalBadgeCluster from "@/components/projects/ProjectSignalBadgeCluster";
import Badge from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Input from "@/components/ui/input";
import {
  buildProjectAlerts,
  getPortfolioFinancialOverview,
} from "@/lib/buildosIntelligence";
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
import { fetchManagementProjects, formatCurrency } from "@/lib/managementData";
import { buildProjectAuditSnapshot } from "@/lib/projectAudit";

function formatRatio(value: number | null) {
  if (value === null) {
    return "No committed cost baseline yet";
  }

  return `${Math.round(value * 100)}% of revised budget`;
}

export default function ManagementBudgetCosts() {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [healthFilter, setHealthFilter] = useState("all");

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

  const { data: clientInvoices = [] } = useQuery({
    queryKey: ["buildos-client-invoices"],
    queryFn: async () => loadBuildOsClientInvoices(),
  });

  const { data: vendorBills = [] } = useQuery({
    queryKey: ["buildos-vendor-bills"],
    queryFn: async () => loadBuildOsVendorBills(),
  });

  const { data: deficiencies = [] } = useQuery({
    queryKey: ["buildos-deficiencies"],
    queryFn: async () => loadBuildOsDeficiencies(),
  });
  const { data: dailyLogs = [] } = useQuery({
    queryKey: ["buildos-daily-logs"],
    queryFn: async () => loadBuildOsDailyLogs(),
  });
  const { data: tasks = [] } = useQuery({
    queryKey: ["buildos-tasks"],
    queryFn: async () => loadBuildOsTasks(),
  });
  const { data: documents = [] } = useQuery({
    queryKey: ["buildos-documents"],
    queryFn: async () => loadBuildOsDocuments(),
  });
  const { data: records = [] } = useQuery({
    queryKey: ["buildos-master-database"],
    queryFn: async () => loadMasterDatabaseRecords(),
  });
  const { data: participantAssignments = [] } = useQuery({
    queryKey: ["buildos-project-participants"],
    queryFn: async () => loadBuildOsProjectParticipantAssignments(),
  });

  const portfolioOverview = useMemo(
    () =>
      getPortfolioFinancialOverview(projects, changeOrders, clientInvoices, vendorBills),
    [projects, changeOrders, clientInvoices, vendorBills]
  );

  const financialRows = useMemo(
    () =>
      projects.map((project) => {
        const snapshot = buildProjectControlSnapshot({
          assignment:
            participantAssignments.find((item) => item.projectId === project.id) || null,
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
          assignment:
            participantAssignments.find((item) => item.projectId === project.id) || null,
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
          summary: snapshot.projectSummary,
          health: snapshot.projectHealth,
          snapshot,
        };
      }),
    [
      projects,
      changeOrders,
      clientInvoices,
      dailyLogs,
      vendorBills,
      deficiencies,
      documents,
      tasks,
      participantAssignments,
      records,
    ]
  );

  const filteredRows = useMemo(() => {
    const query = search.trim().toLowerCase();

    return financialRows.filter(({ project, health }) => {
      const matchesSearch =
        !query ||
        project.project_name.toLowerCase().includes(query) ||
        project.status.toLowerCase().includes(query) ||
        (project.project_manager || "").toLowerCase().includes(query) ||
        (project.project_owner || "").toLowerCase().includes(query);
      const matchesStatus =
        statusFilter === "all" || project.status.toLowerCase() === statusFilter;
      const matchesHealth =
        healthFilter === "all" || health.toLowerCase() === healthFilter;

      return matchesSearch && matchesStatus && matchesHealth;
    });
  }, [financialRows, healthFilter, search, statusFilter]);

  const warningCount = financialRows.filter(({ health }) => health === "Warning").length;
  const criticalCount = financialRows.filter(({ health }) => health === "Critical").length;
  const portfolioExpectedProfit = financialRows.reduce(
    (total, row) => total + (row.snapshot.expectedProfit || 0),
    0
  );
  const portfolioCurrentProfit = financialRows.reduce(
    (total, row) => total + (row.snapshot.currentProfit || 0),
    0
  );
  const portfolioProfitAtRisk = financialRows.reduce(
    (total, row) => total + row.snapshot.profitAtRisk,
    0
  );

  return (
    <ManagementLayout currentPageName="budget-costs">
      <div className="space-y-6">
        <div className="dashboard-panel overflow-hidden p-8">
          <div className="absolute inset-y-0 right-0 w-44 bg-gradient-to-l from-enc-yellow/10 via-enc-orange/10 to-transparent" />
          <div className="relative">
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-enc-orange">
              Financial Control Center
            </p>
            <h1 className="mt-3 text-3xl font-bold text-foreground">Budget & Costs</h1>
            <p className="mt-4 max-w-4xl text-sm leading-6 text-muted-foreground">
              This command center combines registry budgets with live ENCI BuildOS
              records for change orders, client invoices, vendor bills, and
              deficiency pressure. It stays lean by design: it highlights what needs
              action without pretending to be a full accounting system.
            </p>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-7">
          <Card className="dashboard-panel p-2">
            <CardContent className="p-5">
              <p className="text-sm font-medium text-muted-foreground">Original budgets</p>
              <p className="mt-3 text-3xl font-semibold text-foreground">
                {formatCurrency(portfolioOverview.originalBudget)}
              </p>
            </CardContent>
          </Card>
          <Card className="dashboard-panel p-2">
            <CardContent className="p-5">
              <p className="text-sm font-medium text-muted-foreground">Revised budgets</p>
              <p className="mt-3 text-3xl font-semibold text-foreground">
                {formatCurrency(portfolioOverview.revisedBudget)}
              </p>
            </CardContent>
          </Card>
          <Card className="dashboard-panel p-2">
            <CardContent className="p-5">
              <p className="text-sm font-medium text-muted-foreground">Expected profit</p>
              <p className="mt-3 text-3xl font-semibold text-foreground">
                {formatCurrency(portfolioExpectedProfit)}
              </p>
            </CardContent>
          </Card>
          <Card className="dashboard-panel p-2">
            <CardContent className="p-5">
              <p className="text-sm font-medium text-muted-foreground">Current profit</p>
              <p className="mt-3 text-3xl font-semibold text-foreground">
                {formatCurrency(portfolioCurrentProfit)}
              </p>
            </CardContent>
          </Card>
          <Card className="dashboard-panel p-2">
            <CardContent className="p-5">
              <p className="text-sm font-medium text-muted-foreground">Profit at risk</p>
              <p className="mt-3 text-3xl font-semibold text-foreground">
                {formatCurrency(portfolioProfitAtRisk)}
              </p>
            </CardContent>
          </Card>
          <Card className="dashboard-panel p-2">
            <CardContent className="p-5">
              <p className="text-sm font-medium text-muted-foreground">Committed costs</p>
              <p className="mt-3 text-3xl font-semibold text-foreground">
                {formatCurrency(portfolioOverview.committedCosts)}
              </p>
            </CardContent>
          </Card>
          <Card className="dashboard-panel p-2">
            <CardContent className="p-5">
              <p className="text-sm font-medium text-muted-foreground">Unpaid obligations</p>
              <p className="mt-3 text-3xl font-semibold text-foreground">
                {formatCurrency(
                  portfolioOverview.unpaidClientInvoices + portfolioOverview.unpaidVendorBills
                )}
              </p>
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_320px]">
          <Card className="dashboard-panel p-2">
            <CardHeader>
              <CardTitle className="text-xl text-foreground">Filter financial rows</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_220px_220px]">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  className="pl-10"
                  placeholder="Search by project, status, owner, or manager"
                />
              </div>
              <select
                value={statusFilter}
                onChange={(event) => setStatusFilter(event.target.value)}
                className="flex h-10 rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground"
              >
                <option value="all">All project statuses</option>
                {Array.from(new Set(projects.map((project) => project.status.toLowerCase()))).map(
                  (status) => (
                    <option key={status} value={status}>
                      {status}
                    </option>
                  )
                )}
              </select>
              <select
                value={healthFilter}
                onChange={(event) => setHealthFilter(event.target.value)}
                className="flex h-10 rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground"
              >
                <option value="all">All health states</option>
                <option value="healthy">Healthy</option>
                <option value="warning">Warning</option>
                <option value="critical">Critical</option>
              </select>
            </CardContent>
          </Card>

          <Card className="dashboard-panel p-2">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-xl text-foreground">
                <Landmark className="h-5 w-5 text-enc-orange" />
                Portfolio signal snapshot
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm leading-6 text-muted-foreground">
              <div className="dashboard-item p-4">
                <p className="font-medium text-foreground">Approved change-order impact</p>
                <p className="mt-2">{formatCurrency(portfolioOverview.approvedChangeOrderImpact)}</p>
              </div>
              <div className="dashboard-item p-4">
                <p className="font-medium text-foreground">Pending change-order exposure</p>
                <p className="mt-2">{formatCurrency(portfolioOverview.pendingChangeOrderExposure)}</p>
              </div>
              <div className="dashboard-item p-4">
                <p className="font-medium text-foreground">Real profit visibility</p>
                <p className="mt-2">
                  Expected {formatCurrency(portfolioExpectedProfit)} | Current{" "}
                  {formatCurrency(portfolioCurrentProfit)}
                </p>
                <p className="mt-1 text-xs leading-5 text-muted-foreground">
                  Profit at risk remains {formatCurrency(portfolioProfitAtRisk)} across live jobs.
                </p>
              </div>
              <div className="dashboard-item p-4">
                <p className="font-medium text-foreground">Projects in warning</p>
                <p className="mt-2">{warningCount}</p>
              </div>
              <div className="dashboard-item p-4">
                <p className="font-medium text-foreground">Projects in critical</p>
                <p className="mt-2">{criticalCount}</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {isLoading ? (
          <Card className="dashboard-panel p-2">
            <CardContent className="p-6 text-sm text-muted-foreground">
              Loading financial control center...
            </CardContent>
          </Card>
        ) : error ? (
          <Card className="dashboard-panel p-2">
            <CardContent className="flex items-start gap-3 p-6 text-sm leading-6 text-muted-foreground">
              <TriangleAlert className="mt-0.5 h-4 w-4 shrink-0 text-rose-500" />
              Financial control data could not be loaded from the management API.
            </CardContent>
          </Card>
        ) : (
          <Card className="dashboard-panel p-2">
            <CardHeader className="flex flex-row items-start justify-between gap-4">
              <div>
                <CardTitle className="text-xl text-foreground">Project financial rows</CardTitle>
                <p className="mt-2 text-sm text-muted-foreground">
                  Each row combines project registry data with live BuildOS records for
                  invoices, vendor bills, change orders, and deficiency-driven risk.
                </p>
              </div>
              <Badge className="rounded-full bg-muted text-muted-foreground">
                {filteredRows.length} shown
              </Badge>
            </CardHeader>
            <CardContent className="space-y-3">
              {filteredRows.length ? (
                filteredRows.map(({ project, summary, health, alerts, auditSnapshot, snapshot }) => (
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

                        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
                          <div>
                            <p className="text-sm font-medium text-foreground">Original budget</p>
                            <p className="mt-1 text-sm text-muted-foreground">
                              {formatCurrency(summary.originalBudget)}
                            </p>
                          </div>
                          <div>
                            <p className="text-sm font-medium text-foreground">Revised budget</p>
                            <p className="mt-1 text-sm text-muted-foreground">
                              {formatCurrency(summary.revisedBudget)}
                            </p>
                          </div>
                          <div>
                            <p className="text-sm font-medium text-foreground">Committed costs</p>
                            <p className="mt-1 text-sm text-muted-foreground">
                              {formatCurrency(summary.committedCosts)}
                            </p>
                          </div>
                          <div>
                            <p className="text-sm font-medium text-foreground">Actual costs</p>
                            <p className="mt-1 text-sm text-muted-foreground">
                              {formatCurrency(summary.actualCosts)}
                            </p>
                          </div>
                          <div>
                            <p className="text-sm font-medium text-foreground">Pending CO exposure</p>
                            <p className="mt-1 text-sm text-muted-foreground">
                              {formatCurrency(summary.pendingChangeOrderExposure)}
                            </p>
                          </div>
                          <div>
                            <p className="text-sm font-medium text-foreground">Cash inflows</p>
                            <p className="mt-1 text-sm text-muted-foreground">
                              {formatCurrency(summary.cashInflows)}
                            </p>
                          </div>
                          <div>
                            <p className="text-sm font-medium text-foreground">Unpaid client invoices</p>
                            <p className="mt-1 text-sm text-muted-foreground">
                              {formatCurrency(summary.unpaidClientInvoices)}
                            </p>
                          </div>
                          <div>
                            <p className="text-sm font-medium text-foreground">Unpaid vendor bills</p>
                            <p className="mt-1 text-sm text-muted-foreground">
                              {formatCurrency(summary.unpaidVendorBills)}
                            </p>
                          </div>
                          <div>
                            <p className="text-sm font-medium text-foreground">Expected profit</p>
                            <p className="mt-1 text-sm text-muted-foreground">
                              {formatCurrency(snapshot.expectedProfit ?? undefined)}
                            </p>
                          </div>
                          <div>
                            <p className="text-sm font-medium text-foreground">Current profit</p>
                            <p className="mt-1 text-sm text-muted-foreground">
                              {formatCurrency(snapshot.currentProfit ?? undefined)}
                            </p>
                          </div>
                          <div>
                            <p className="text-sm font-medium text-foreground">Profit at risk</p>
                            <p className="mt-1 text-sm text-muted-foreground">
                              {formatCurrency(snapshot.profitAtRisk)}
                            </p>
                          </div>
                          <div>
                            <p className="text-sm font-medium text-foreground">Scope subject</p>
                            <p className="mt-1 text-sm text-muted-foreground">
                              {project.scope_subject || "Not set"}
                            </p>
                          </div>
                        </div>
                        <div className="grid gap-4 xl:grid-cols-[minmax(0,1.1fr)_minmax(320px,0.9fr)]">
                          <ProjectDecisionSupportPanel
                            includeActions={false}
                            snapshot={snapshot}
                            title="Profit & scope control"
                            caption="Expected profit, current profit, pending scope exposure, and cash position stay visible here so money decisions are made on one read."
                          />
                          <ProjectParticipantPresence
                            compact
                            snapshot={snapshot}
                            title="Stakeholder / lawyer / realtor visibility"
                          />
                        </div>
                      </div>

                      <div className="min-w-[280px] space-y-3 rounded-2xl border border-border/70 bg-background/80 p-4 text-sm text-muted-foreground">
                        <div className="flex items-center gap-2">
                          <DollarSign className="h-4 w-4 text-enc-orange" />
                          <p className="font-medium text-foreground">Control notes</p>
                        </div>
                        <p>Budget variance: {formatRatio(summary.varianceRatio)}</p>
                        <p>
                          Projected profitability:{" "}
                          {formatCurrency(
                            summary.projectedProfitability ?? undefined,
                            "Pending revenue baseline"
                          )}
                        </p>
                        <p>Lender draw tracking: {formatCurrency(summary.lenderDrawTracked)}</p>
                        <p>Active alerts: {alerts.length}</p>
                        <p>Actor coverage: {auditSnapshot.actorCoverage}%</p>
                        <p>
                          Last linked change:{" "}
                          {auditSnapshot.entries[0]
                            ? `${auditSnapshot.entries[0].actor} | ${auditSnapshot.entries[0].changedAt}`
                            : "No tracked changes yet"}
                        </p>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="dashboard-item p-6 text-sm leading-6 text-muted-foreground">
                  No financial rows match the current filters.
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </ManagementLayout>
  );
}
