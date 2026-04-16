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
import { managementModules } from "@/lib/management";

type ManagementProject = {
  id: string;
  project_name: string;
  civic_address: string;
  status: string;
  estimated_budget?: number;
  estimated_end_date?: string;
  legal_land_description?: string;
  building_permit_pdf?: string;
  development_permit_pdf?: string;
  primary_contact_email?: string;
  project_manager?: string;
};

type DashboardStatus = {
  authConfigured: boolean;
  emailConfigured: boolean;
  projectRegistry: {
    editable: boolean;
    projectCount: number;
    source: "environment" | "temporary" | "unconfigured";
  };
};

type ActionItem = {
  detail: string;
  severity: "critical" | "warning" | "info";
  title: string;
};

async function fetchJson<T>(url: string): Promise<T> {
  const response = await fetch(url, {
    cache: "no-store",
    credentials: "include",
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error?.message || `Request failed: ${response.status}`);
  }

  return response.json();
}

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
    queryFn: () => fetchJson<ManagementProject[]>("/api/management/projects"),
  });

  const {
    data: status,
    isLoading: statusLoading,
    error: statusError,
  } = useQuery({
    queryKey: ["management-status"],
    queryFn: () => fetchJson<DashboardStatus>("/api/management/status"),
  });

  const activeProjects = useMemo(
    () =>
      projects.filter((project) =>
        ["active", "pre-construction"].includes(project.status.toLowerCase())
      ).length,
    [projects]
  );

  const operationalActions = useMemo<ActionItem[]>(() => {
    const actions: ActionItem[] = [];
    const today = new Date();

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
        title: "No live project registry is connected",
        detail:
          "The projects module is ready to display real records, but there are currently no verified project records loaded.",
      });
    }

    projects.forEach((project) => {
      if (project.estimated_end_date) {
        const estimatedEnd = new Date(project.estimated_end_date);
        if (
          !Number.isNaN(estimatedEnd.getTime()) &&
          estimatedEnd < today &&
          !["completed", "warranty"].includes(project.status.toLowerCase())
        ) {
          actions.push({
            severity: "warning",
            title: `${project.project_name} is past its target completion date`,
            detail: `Estimated end date ${formatDate(project.estimated_end_date)} should be reviewed and updated.`,
          });
        }
      }

      if (!project.estimated_budget) {
        actions.push({
          severity: "warning",
          title: `${project.project_name} has no budget baseline`,
          detail:
            "Budget and cost reporting should stay offline until a verified cost baseline is entered.",
        });
      }

      if (
        !project.legal_land_description ||
        !project.building_permit_pdf ||
        !project.development_permit_pdf
      ) {
        actions.push({
          severity: "info",
          title: `${project.project_name} is missing diligence references`,
          detail:
            "Add permit links and legal land details before using the dashboard as a lender/client-facing project reference.",
        });
      }

      if (!project.project_manager && !project.primary_contact_email) {
        actions.push({
          severity: "info",
          title: `${project.project_name} has no assigned owner in the registry`,
          detail:
            "Assign a project manager or contact so the dashboard reflects clear operational accountability.",
        });
      }
    });

    if (disabledModules.length) {
      actions.push({
        severity: "info",
        title: "Task, invoice, vendor, and compliance modules remain offline",
        detail:
          "Those workflows stay hidden until their server-backed data and validation paths are ready for production use.",
      });
    }

    return actions.slice(0, 6);
  }, [disabledModules.length, projects, status?.emailConfigured]);

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
              Estate Nest Capital
            </p>
            <h1 className="mt-3 text-3xl font-bold text-foreground lg:text-4xl">
              Operational Dashboard
            </h1>
            <div className="mt-4 h-1 w-24 rounded-full bg-gradient-hero" />
            <p className="mt-4 max-w-3xl text-muted-foreground">
              This dashboard now reports only live readiness, connected project records, and explicitly offline modules.
              Decorative demo stats have been removed.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          <StatsCard
            title="Project Registry"
            value={status.projectRegistry.projectCount}
            subtitle={getRegistryLabel(status.projectRegistry.source)}
            icon={FolderKanban}
          />
          <StatsCard
            title="Active Projects"
            value={activeProjects}
            subtitle={`${projects.length} total configured`}
            icon={ShieldCheck}
          />
          <StatsCard
            title="Email Delivery"
            value={status.emailConfigured ? "Ready" : "Needs Setup"}
            subtitle={
              status.emailConfigured
                ? "Dashboard email can send through Gmail SMTP"
                : "SMTP must be verified before live use"
            }
            icon={Mail}
          />
          <StatsCard
            title="Open Blockers"
            value={blockers}
            subtitle={`${disabledModules.length} modules still safely offline`}
            icon={AlertTriangle}
          />
        </div>

        <div className="grid gap-6 xl:grid-cols-[minmax(0,1.35fr)_minmax(340px,0.95fr)]">
          <Card className="dashboard-panel p-2">
            <CardHeader className="flex flex-row items-start justify-between gap-4">
              <div>
                <CardTitle className="text-2xl text-foreground">Action Center</CardTitle>
                <p className="mt-2 text-sm text-muted-foreground">
                  Operational issues are generated from live configuration and project records only.
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
                    ? "Projects are being served from MANAGEMENT_PROJECTS_JSON. This is stable for previews and production, but currently read-only."
                    : status.projectRegistry.source === "temporary"
                      ? "Projects currently exist only in temporary server memory. That is useful for short-lived testing, not for production recordkeeping."
                      : "No structured project registry is configured yet. The dashboard will stay honest and empty until records are connected."}
                </p>
              </div>

              <div className="dashboard-item p-4">
                <p className="text-sm font-semibold text-foreground">Visible modules</p>
                <p className="mt-2 text-sm leading-6 text-muted-foreground">
                  {enabledModules.length} modules are live. {disabledModules.length} modules stay offline until their backend and validation paths are complete.
                </p>
              </div>

              <Button asChild className="w-full rounded-full bg-gradient-to-r from-enc-red via-enc-orange to-enc-yellow text-white shadow-glow">
                <Link to="/management/projects">Review Project Registry</Link>
              </Button>
            </CardContent>
          </Card>
        </div>

        <Card className="dashboard-panel p-2">
          <CardHeader className="flex flex-row items-start justify-between gap-4">
            <div>
              <CardTitle className="text-2xl text-foreground">Project Registry</CardTitle>
              <p className="mt-2 text-sm text-muted-foreground">
                Only configured project records are shown. When no real records exist, the dashboard stays empty on purpose.
              </p>
            </div>
            <Badge className="rounded-full bg-muted text-muted-foreground">
              {getRegistryLabel(status.projectRegistry.source)}
            </Badge>
          </CardHeader>
          <CardContent className="space-y-3">
            {projects.length ? (
              projects.map((project) => (
                <div key={project.id} className="dashboard-item p-5">
                  <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="text-lg font-semibold text-foreground">{project.project_name}</h3>
                        <span className={`rounded-full px-3 py-1 text-xs font-semibold ${getStatusBadge(project.status)}`}>
                          {project.status}
                        </span>
                      </div>
                      <p className="mt-2 text-sm text-muted-foreground">{project.civic_address}</p>
                      <div className="mt-3 flex flex-wrap gap-4 text-sm text-muted-foreground">
                        <span>Budget: {formatCurrency(project.estimated_budget)}</span>
                        <span>Target completion: {formatDate(project.estimated_end_date)}</span>
                        <span>
                          Manager: {project.project_manager || project.primary_contact_email || "Unassigned"}
                        </span>
                      </div>
                    </div>

                    <Button asChild variant="outline" className="rounded-full">
                      <Link to={`/management/project-details?id=${project.id}`}>
                        View project
                      </Link>
                    </Button>
                  </div>
                </div>
              ))
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
