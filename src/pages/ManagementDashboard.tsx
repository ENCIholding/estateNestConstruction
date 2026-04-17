import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  AlertTriangle,
  FolderKanban,
  Mail,
  ShieldCheck,
  ShieldX,
  TimerReset,
  TriangleAlert,
} from "lucide-react";
import { Link } from "react-router-dom";
import ManagementLayout from "@/components/management/ManagementLayout";
import ManagementEmailComposer from "@/components/management/ManagementEmailComposer";
import StatsCard from "@/components/dashboard/StatsCard";
import Badge from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  type DashboardStatus,
  fetchManagementJson,
  fetchManagementProjects,
  type ManagementProject,
} from "@/lib/managementData";
import {
  buildPortfolioAlerts,
  getPortfolioFinancialOverview,
  getProjectFinancialSummary,
  getProjectHealthStatus,
  getSuggestedNextActions,
} from "@/lib/buildosIntelligence";
import {
  loadChangeOrders,
  loadClientInvoices,
  loadBuildOsDocuments,
  loadDeficiencies,
  loadTasks,
  loadVendorBills,
} from "@/lib/buildosShared";
import { managementModules } from "@/lib/management";
import { getTaskSummary } from "@/lib/buildosTasks";

type ActionItem = {
  projectId?: string;
  detail: string;
  severity: "critical" | "warning" | "info";
  title: string;
};

function formatCurrency(value?: number) {
  if (!value) {
    return "Not set";
  }

  return new Intl.NumberFormat("en-CA", {
    style: "currency",
    currency: "CAD",
    maximumFractionDigits: 0,
  }).format(value);
}

function formatDate(value?: string) {
  if (!value) {
    return "Not scheduled";
  }

  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) {
    return "Invalid date";
  }

  return new Intl.DateTimeFormat("en-CA", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(parsed);
}

function getStatusBadge(status?: string) {
  const normalized = status?.toLowerCase();

  if (normalized === "active") {
    return "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300";
  }

  if (normalized === "pre-construction") {
    return "bg-amber-500/10 text-amber-700 dark:text-amber-300";
  }

  if (normalized === "completed" || normalized === "warranty") {
    return "bg-slate-500/10 text-slate-700 dark:text-slate-300";
  }

  return "bg-muted text-muted-foreground";
}

function getRegistryLabel(source: DashboardStatus["projectRegistry"]["source"]) {
  if (source === "environment") {
    return "Deployment-backed";
  }

  if (source === "temporary") {
    return "Temporary memory";
  }

  return "Not configured";
}

export default function ManagementDashboard() {
  const enabledModules = managementModules.filter((module) => module.enabled);
  const disabledModules = managementModules.filter((module) => !module.enabled);

  const {
    data: projects = [],
    isLoading: projectsLoading,
    error: projectsError,
  } = useQuery({
    queryKey: ["management-projects"],
    queryFn: fetchManagementProjects,
  });

  const {
    data: status,
    isLoading: statusLoading,
    error: statusError,
  } = useQuery({
    queryKey: ["management-status"],
    queryFn: () => fetchManagementJson<DashboardStatus>("/api/management/status"),
  });
  const { data: changeOrders = [] } = useQuery({
    queryKey: ["buildos-change-orders"],
    queryFn: async () => loadChangeOrders(),
  });
  const { data: clientInvoices = [] } = useQuery({
    queryKey: ["buildos-client-invoices"],
    queryFn: async () => loadClientInvoices(),
  });
  const { data: vendorBills = [] } = useQuery({
    queryKey: ["buildos-vendor-bills"],
    queryFn: async () => loadVendorBills(),
  });
  const { data: deficiencies = [] } = useQuery({
    queryKey: ["buildos-deficiencies"],
    queryFn: async () => loadDeficiencies(),
  });
  const { data: tasks = [] } = useQuery({
    queryKey: ["buildos-tasks"],
    queryFn: async () => loadTasks(),
  });
  const { data: documents = [] } = useQuery({
    queryKey: ["buildos-documents"],
    queryFn: async () => loadBuildOsDocuments(),
  });

  const activeProjects = useMemo(
    () =>
      projects.filter((project) =>
        ["active", "pre-construction"].includes(project.status.toLowerCase())
      ).length,
    [projects]
  );

  const portfolioFinancials = useMemo(
    () => getPortfolioFinancialOverview(projects, changeOrders, clientInvoices, vendorBills),
    [changeOrders, clientInvoices, projects, vendorBills]
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
    [changeOrders, clientInvoices, deficiencies, documents, projects, tasks, vendorBills]
  );
  const taskSummary = useMemo(() => getTaskSummary(tasks), [tasks]);

  const operationalActions = useMemo<ActionItem[]>(() => {
    const actions: ActionItem[] = [];

    if (!status?.emailConfigured) {
      actions.push({
        severity: "critical",
        title: "Dashboard email is not fully configured",
        detail:
          "SMTP environment variables still need to be confirmed before management can send live email from the dashboard.",
      });
    }

    if (!projects.length) {
      actions.push({
        severity: "warning",
        title: "No project records are loaded yet",
        detail:
          "Use Projects to add a deployment-backed record or a browser workspace draft so the operational views stop staying empty.",
      });
    }

    if (!status?.buildOsStorage.configured) {
      actions.push({
        severity: "warning",
        title: "Shared BuildOS persistence is not configured",
        detail:
          "Newer BuildOS modules can still fall back locally, but durable shared recordkeeping needs Supabase service-role storage and the BuildOS migration applied before the system is fully multi-user safe.",
      });
    }

    portfolioAlerts.forEach((alert) =>
      actions.push({
        projectId: alert.projectId,
        severity: alert.severity,
        title: alert.title,
        detail: alert.detail,
      })
    );

    if (disabledModules.length) {
      actions.push({
        severity: "info",
        title: "Advanced workflow modules remain offline",
        detail:
          "Only workflows with real storage and validation stay live. The remaining modules still need their own backend paths before they can be trusted.",
      });
    }

    if (!tasks.length) {
      actions.push({
        severity: "warning",
        title: "Task execution layer is still empty",
        detail:
          "Add the first real task records so schedule pressure, mobile updates, and automation warnings can reflect live execution work.",
      });
    }

    return actions.slice(0, 6);
  }, [
    disabledModules.length,
    portfolioAlerts,
    projects.length,
    status?.buildOsStorage.configured,
    status?.emailConfigured,
    tasks.length,
  ]);

  const blockers = operationalActions.filter(
    (action) => action.severity === "critical" || action.severity === "warning"
  ).length;

  if (projectsLoading || statusLoading) {
    return (
      <ManagementLayout currentPageName="dashboard">
        <div className="dashboard-panel p-8">
          <p className="text-sm text-muted-foreground">Loading dashboard readiness...</p>
        </div>
      </ManagementLayout>
    );
  }

  if (projectsError || statusError || !status) {
    return (
      <ManagementLayout currentPageName="dashboard">
        <Card className="dashboard-panel p-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-foreground">
              <TriangleAlert className="h-5 w-5 text-rose-500" />
              Dashboard status unavailable
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm text-muted-foreground">
            <p>
              The management shell loaded, but the readiness data could not be fetched from the server.
            </p>
            <p>
              Review the management API logs before relying on this dashboard for live operations.
            </p>
          </CardContent>
        </Card>
      </ManagementLayout>
    );
  }

  return (
    <ManagementLayout currentPageName="dashboard">
      <div className="space-y-6">
        <div className="dashboard-panel overflow-hidden p-8">
          <div className="absolute inset-y-0 right-0 w-48 bg-gradient-to-l from-enc-yellow/10 via-enc-orange/10 to-transparent" />
          <div className="relative">
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-enc-orange">
              ENCI BuildOS
            </p>
            <h1 className="mt-3 text-3xl font-bold text-foreground lg:text-4xl">
              Operational Command Center
            </h1>
            <div className="mt-4 h-1 w-24 rounded-full bg-gradient-hero" />
            <p className="mt-4 max-w-3xl text-muted-foreground">
              This command center reports only live readiness, connected project
              records, browser workspace drafts, and explicitly limited modules.
              Decorative demo stats have been removed in favor of operational signals.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          <StatsCard
            title="Revised Budget"
            value={formatCurrency(portfolioFinancials.revisedBudget)}
            subtitle="Original budget plus approved changes"
            icon={FolderKanban}
          />
          <StatsCard
            title="Active Projects"
            value={activeProjects}
            subtitle={`${projects.length} projects in registry`}
            icon={ShieldCheck}
          />
          <StatsCard
            title="Unpaid Client Invoices"
            value={formatCurrency(portfolioFinancials.unpaidClientInvoices)}
            subtitle="Open inflow pressure across the portfolio"
            icon={Mail}
          />
          <StatsCard
            title="Execution Pressure"
            value={taskSummary.overdue + taskSummary.blocked}
            subtitle={`${taskSummary.overdue} overdue · ${taskSummary.blocked} blocked`}
            icon={AlertTriangle}
          />
        </div>

        <div className="grid gap-6 xl:grid-cols-[minmax(0,1.35fr)_minmax(340px,0.95fr)]">
          <Card className="dashboard-panel p-2">
            <CardHeader className="flex flex-row items-start justify-between gap-4">
              <div>
                <CardTitle className="text-2xl text-foreground">Action Center</CardTitle>
                <p className="mt-2 text-sm text-muted-foreground">
                  Operational issues are generated from live configuration, project data, invoices, bills, change orders, and deficiencies only.
                </p>
              </div>
              <Badge className="rounded-full bg-foreground text-background">
                {operationalActions.length} checks
              </Badge>
            </CardHeader>
            <CardContent className="space-y-3">
              {operationalActions.length ? (
                operationalActions.map((action) => (
                  <div key={`${action.title}-${action.detail}`} className="dashboard-item p-4">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <p className="text-sm font-semibold text-foreground">{action.title}</p>
                        <p className="mt-2 text-sm leading-6 text-muted-foreground">{action.detail}</p>
                      </div>
                      <Badge
                        className={
                          action.severity === "critical"
                            ? "bg-rose-500/10 text-rose-700 dark:text-rose-300"
                            : action.severity === "warning"
                              ? "bg-amber-500/10 text-amber-700 dark:text-amber-300"
                              : "bg-blue-500/10 text-blue-700 dark:text-blue-300"
                        }
                      >
                        {action.severity}
                      </Badge>
                    </div>
                  </div>
                ))
              ) : (
                <div className="dashboard-item p-6">
                  <p className="text-base font-semibold text-foreground">No immediate blockers detected</p>
                  <p className="mt-2 text-sm leading-6 text-muted-foreground">
                    The current dashboard configuration is clean, but hidden modules still need their own backend work before they can be safely shown.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="dashboard-panel p-2">
            <CardHeader>
              <CardTitle className="text-2xl text-foreground">Readiness Snapshot</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="dashboard-item p-4">
                <p className="text-sm font-semibold text-foreground">Authentication</p>
                <p className="mt-2 flex items-center gap-2 text-sm text-muted-foreground">
                  {status.authConfigured ? (
                    <ShieldCheck className="h-4 w-4 text-emerald-500" />
                  ) : (
                    <ShieldX className="h-4 w-4 text-rose-500" />
                  )}
                  {status.authConfigured
                    ? "Server-side management auth variables are configured."
                    : "Management auth variables are incomplete."}
                </p>
              </div>

              <div className="dashboard-item p-4">
                <p className="text-sm font-semibold text-foreground">Project source</p>
                <p className="mt-2 text-sm leading-6 text-muted-foreground">
                  {status.projectRegistry.source === "environment"
                    ? "Projects are being served from MANAGEMENT_PROJECTS_JSON. This is stable for previews and production, and browser workspace edits can now layer on top for this device."
                    : status.projectRegistry.source === "temporary"
                      ? "Projects currently exist only in temporary server memory, and browser workspace edits can layer on top. That is useful for short-lived testing, not for production recordkeeping."
                      : "No structured project registry is configured yet. The dashboard will stay honest until records are added in the browser workspace or connected through a durable source."}
                </p>
              </div>

              <div className="dashboard-item p-4">
                <p className="text-sm font-semibold text-foreground">BuildOS shared storage</p>
                <p className="mt-2 text-sm leading-6 text-muted-foreground">
                  {status.buildOsStorage.configured
                    ? `${status.buildOsStorage.provider} is configured for workspace ${status.buildOsStorage.workspaceSlug}. Newer BuildOS modules can use durable shared persistence.`
                    : "Shared BuildOS persistence is not configured yet. Newer modules will fall back to local browser storage until the Supabase service-role env and migration are applied."}
                </p>
              </div>

              <div className="dashboard-item p-4">
                <p className="text-sm font-semibold text-foreground">Financial command center</p>
                <p className="mt-2 text-sm leading-6 text-muted-foreground">
                  Portfolio revised budget: {formatCurrency(portfolioFinancials.revisedBudget)}. Pending change exposure: {formatCurrency(portfolioFinancials.pendingChangeOrderExposure)}. Paid-out costs: {formatCurrency(portfolioFinancials.cashOutflows)}.
                </p>
              </div>

              <div className="dashboard-item p-4">
                <p className="text-sm font-semibold text-foreground">Visible modules</p>
                <p className="mt-2 text-sm leading-6 text-muted-foreground">
                  {enabledModules.length} modules are live. {disabledModules.length} modules stay offline until their backend and validation paths are complete.
                </p>
              </div>
              <div className="dashboard-item p-4">
                <p className="text-sm font-semibold text-foreground">Execution layer</p>
                <p className="mt-2 text-sm leading-6 text-muted-foreground">
                  {tasks.length} tasks loaded across BuildOS. {taskSummary.milestones} milestone checkpoint(s) are currently being tracked.
                </p>
              </div>

              <Button asChild className="w-full rounded-full bg-gradient-to-r from-enc-red via-enc-orange to-enc-yellow text-white shadow-glow">
                <Link to="/management/projects">Review Project Registry</Link>
              </Button>
              <Button asChild variant="outline" className="w-full rounded-full">
                <Link to="/management/vendors">Open Vendor Registry</Link>
              </Button>
              <Button asChild variant="outline" className="w-full rounded-full">
                <Link to="/management/master-database">Open Master Database</Link>
              </Button>
              <Button asChild variant="outline" className="w-full rounded-full">
                <Link to="/management/tasks">Open Project Tasks</Link>
              </Button>
            </CardContent>
          </Card>
        </div>

        <Card className="dashboard-panel p-2">
          <CardHeader className="flex flex-row items-start justify-between gap-4">
            <div>
              <CardTitle className="text-2xl text-foreground">Project Registry</CardTitle>
                <p className="mt-2 text-sm text-muted-foreground">
                  Only configured project records and browser workspace drafts are shown. When no real records exist, the dashboard stays empty on purpose.
                </p>
              </div>
            <Badge className="rounded-full bg-muted text-muted-foreground">
              {getRegistryLabel(status.projectRegistry.source)}
            </Badge>
          </CardHeader>
          <CardContent className="space-y-3">
            {projects.length ? (
              projects.map((project) => {
                const projectSummary = getProjectFinancialSummary(
                  project,
                  changeOrders,
                  clientInvoices,
                  vendorBills
                );
                const health = getProjectHealthStatus(
                  project,
                  projectSummary,
                  deficiencies,
                  portfolioAlerts
                );
                const nextActions = getSuggestedNextActions(
                  project,
                  projectSummary,
                  portfolioAlerts
                );
                const projectTasks = tasks.filter((item) => item.projectId === project.id);

                return (
                <div key={project.id} className="dashboard-item p-5">
                  <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="text-lg font-semibold text-foreground">{project.project_name}</h3>
                        <span className={`rounded-full px-3 py-1 text-xs font-semibold ${getStatusBadge(project.status)}`}>
                          {project.status}
                        </span>
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
                      <p className="mt-2 text-sm text-muted-foreground">{project.civic_address}</p>
                      <div className="mt-3 flex flex-wrap gap-4 text-sm text-muted-foreground">
                        <span>Original budget: {formatCurrency(projectSummary.originalBudget)}</span>
                        <span>Revised budget: {formatCurrency(projectSummary.revisedBudget)}</span>
                        <span>Target completion: {formatDate(project.estimated_end_date)}</span>
                        <span>{projectTasks.length} live task(s)</span>
                        <span>
                          Manager: {project.project_manager || project.primary_contact_email || "Unassigned"}
                        </span>
                      </div>
                      {nextActions.length ? (
                        <div className="mt-3 rounded-2xl border border-border/70 bg-background/80 p-3">
                          <p className="text-sm font-medium text-foreground">Suggested next actions</p>
                          <ul className="mt-2 space-y-1 text-sm leading-6 text-muted-foreground">
                            {nextActions.map((action) => (
                              <li key={`${project.id}-${action}`}>{action}</li>
                            ))}
                          </ul>
                        </div>
                      ) : null}
                    </div>

                    <Button asChild variant="outline" className="rounded-full">
                      <Link to={`/management/project-details?id=${project.id}`}>
                        View project
                      </Link>
                    </Button>
                  </div>
                </div>
              )})
            ) : (
              <div className="dashboard-item p-6">
                <p className="text-base font-semibold text-foreground">No live projects are loaded</p>
                <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">
                  To make this module operational, connect a verified project registry through a durable backend or supply a reviewed MANAGEMENT_PROJECTS_JSON record set for preview and production.
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="dashboard-panel p-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-2xl text-foreground">
              <TimerReset className="h-5 w-5 text-enc-orange" />
              Modules Still Offline For Safety
            </CardTitle>
          </CardHeader>
          <CardContent className="flex flex-wrap gap-2">
            {disabledModules.map((module) => (
              <Badge key={module.page} className="rounded-full bg-muted px-3 py-1 text-muted-foreground">
                {module.name}
              </Badge>
            ))}
          </CardContent>
        </Card>

        <ManagementEmailComposer />
      </div>
    </ManagementLayout>
  );
}
