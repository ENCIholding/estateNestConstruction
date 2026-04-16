import { useQuery } from "@tanstack/react-query";
import {
  ArrowLeft,
  CalendarClock,
  ExternalLink,
  FileText,
  Mail,
  MapPin,
  ShieldCheck,
  TriangleAlert,
  UserRound,
} from "lucide-react";
import { Link, useSearchParams } from "react-router-dom";
import ManagementLayout from "@/components/management/ManagementLayout";
import Badge from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

type ManagementProject = {
  id: string;
  project_name: string;
  civic_address: string;
  status: string;
  estimated_budget?: number;
  selling_price?: number;
  start_date?: string;
  estimated_end_date?: string;
  actual_end_date?: string;
  legal_land_description?: string;
  warranty_start_date?: string;
  zoning_code?: string;
  deposit_amount?: number;
  development_permit_pdf?: string;
  building_permit_pdf?: string;
  real_property_report?: string;
  project_owner?: string;
  project_manager?: string;
  primary_contact_email?: string;
  next_milestone?: string;
  status_note?: string;
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
    return "Not set";
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

function getStatusClass(status?: string) {
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

export default function ManagementProjectDetails() {
  const [searchParams] = useSearchParams();
  const projectId = searchParams.get("id");

  const {
    data: project,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["management-project", projectId],
    queryFn: () => fetchJson<ManagementProject>(`/api/management/projects/${projectId}`),
    enabled: Boolean(projectId),
  });

  const diligenceLinks = [
    {
      href: project?.development_permit_pdf,
      label: "Development permit",
    },
    {
      href: project?.building_permit_pdf,
      label: "Building permit",
    },
    {
      href: project?.real_property_report,
      label: "Real property report",
    },
  ].filter((item) => item.href);

  const controlGaps = project
    ? [
        !project.legal_land_description ? "Legal land description is missing." : null,
        !project.estimated_budget ? "Budget baseline is missing." : null,
        !project.project_manager && !project.project_owner
          ? "Project owner or manager is not assigned."
          : null,
        !project.primary_contact_email ? "Primary contact email is not set." : null,
        !diligenceLinks.length ? "No permit or diligence links are attached." : null,
      ].filter(Boolean)
    : [];

  return (
    <ManagementLayout currentPageName="projects">
      <div className="space-y-6">
        <div className="flex items-center justify-between gap-4">
          <div>
            <Button asChild variant="ghost" className="mb-3 rounded-full px-0 text-muted-foreground hover:bg-transparent">
              <Link to="/management/projects">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to projects
              </Link>
            </Button>

            <h1 className="text-3xl font-bold text-foreground">
              {isLoading ? "Loading project..." : project?.project_name || "Project details"}
            </h1>
          </div>
        </div>

        {isLoading ? (
          <Card className="dashboard-panel p-2">
            <CardContent className="p-6 text-sm text-muted-foreground">
              Loading project record...
            </CardContent>
          </Card>
        ) : error || !project ? (
          <Card className="dashboard-panel p-2">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-foreground">
                <TriangleAlert className="h-5 w-5 text-rose-500" />
                Project record unavailable
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm leading-6 text-muted-foreground">
              <p>The requested project could not be loaded from the management API.</p>
              <p>Return to the project registry and verify the project ID and source data.</p>
            </CardContent>
          </Card>
        ) : (
          <>
            <Card className="dashboard-panel p-2">
              <CardContent className="space-y-4 p-6">
                <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <h2 className="text-2xl font-semibold text-foreground">{project.project_name}</h2>
                      <Badge className={`rounded-full ${getStatusClass(project.status)}`}>
                        {project.status}
                      </Badge>
                    </div>
                    <p className="mt-3 flex items-center gap-2 text-sm text-muted-foreground">
                      <MapPin className="h-4 w-4 text-enc-orange" />
                      {project.civic_address}
                    </p>
                  </div>
                  <div className="rounded-2xl border border-border/80 bg-background/80 px-4 py-3 text-sm text-muted-foreground">
                    Last noted milestone: {project.next_milestone || "Not set"}
                  </div>
                </div>

                <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                  <div className="dashboard-item p-4">
                    <p className="text-sm font-medium text-foreground">Budget baseline</p>
                    <p className="mt-2 text-sm text-muted-foreground">
                      {formatCurrency(project.estimated_budget)}
                    </p>
                  </div>
                  <div className="dashboard-item p-4">
                    <p className="text-sm font-medium text-foreground">Target completion</p>
                    <p className="mt-2 text-sm text-muted-foreground">
                      {formatDate(project.estimated_end_date)}
                    </p>
                  </div>
                  <div className="dashboard-item p-4">
                    <p className="text-sm font-medium text-foreground">Warranty start</p>
                    <p className="mt-2 text-sm text-muted-foreground">
                      {formatDate(project.warranty_start_date)}
                    </p>
                  </div>
                  <div className="dashboard-item p-4">
                    <p className="text-sm font-medium text-foreground">Deposit recorded</p>
                    <p className="mt-2 text-sm text-muted-foreground">
                      {formatCurrency(project.deposit_amount)}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="grid gap-6 xl:grid-cols-[minmax(0,1.2fr)_minmax(320px,0.9fr)]">
              <Card className="dashboard-panel p-2">
                <CardHeader>
                  <CardTitle className="text-xl text-foreground">Project controls</CardTitle>
                </CardHeader>
                <CardContent className="grid gap-4 md:grid-cols-2">
                  <div className="dashboard-item p-4">
                    <p className="text-sm font-medium text-foreground">Start date</p>
                    <p className="mt-2 text-sm text-muted-foreground">{formatDate(project.start_date)}</p>
                  </div>
                  <div className="dashboard-item p-4">
                    <p className="text-sm font-medium text-foreground">Actual completion</p>
                    <p className="mt-2 text-sm text-muted-foreground">{formatDate(project.actual_end_date)}</p>
                  </div>
                  <div className="dashboard-item p-4">
                    <p className="text-sm font-medium text-foreground">Selling price</p>
                    <p className="mt-2 text-sm text-muted-foreground">
                      {formatCurrency(project.selling_price)}
                    </p>
                  </div>
                  <div className="dashboard-item p-4">
                    <p className="text-sm font-medium text-foreground">Zoning code</p>
                    <p className="mt-2 text-sm text-muted-foreground">{project.zoning_code || "Not set"}</p>
                  </div>
                  <div className="dashboard-item p-4 md:col-span-2">
                    <p className="text-sm font-medium text-foreground">Legal land description</p>
                    <p className="mt-2 text-sm leading-6 text-muted-foreground">
                      {project.legal_land_description || "No legal land description has been recorded in the current registry."}
                    </p>
                  </div>
                  <div className="dashboard-item p-4 md:col-span-2">
                    <p className="text-sm font-medium text-foreground">Status note</p>
                    <p className="mt-2 text-sm leading-6 text-muted-foreground">
                      {project.status_note || "No internal status note has been captured for this project yet."}
                    </p>
                  </div>
                </CardContent>
              </Card>

              <Card className="dashboard-panel p-2">
                <CardHeader>
                  <CardTitle className="text-xl text-foreground">Ownership & communications</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="dashboard-item p-4">
                    <p className="flex items-center gap-2 text-sm font-medium text-foreground">
                      <UserRound className="h-4 w-4 text-enc-orange" />
                      Project owner
                    </p>
                    <p className="mt-2 text-sm text-muted-foreground">
                      {project.project_owner || "Not assigned"}
                    </p>
                  </div>
                  <div className="dashboard-item p-4">
                    <p className="flex items-center gap-2 text-sm font-medium text-foreground">
                      <ShieldCheck className="h-4 w-4 text-enc-orange" />
                      Project manager
                    </p>
                    <p className="mt-2 text-sm text-muted-foreground">
                      {project.project_manager || "Not assigned"}
                    </p>
                  </div>
                  <div className="dashboard-item p-4">
                    <p className="flex items-center gap-2 text-sm font-medium text-foreground">
                      <Mail className="h-4 w-4 text-enc-orange" />
                      Primary contact
                    </p>
                    <p className="mt-2 text-sm text-muted-foreground">
                      {project.primary_contact_email || "No project contact email has been recorded."}
                    </p>
                  </div>
                  <div className="dashboard-item p-4">
                    <p className="flex items-center gap-2 text-sm font-medium text-foreground">
                      <CalendarClock className="h-4 w-4 text-enc-orange" />
                      Next milestone
                    </p>
                    <p className="mt-2 text-sm text-muted-foreground">
                      {project.next_milestone || "No upcoming milestone is recorded yet."}
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_minmax(320px,0.9fr)]">
              <Card className="dashboard-panel p-2">
                <CardHeader>
                  <CardTitle className="text-xl text-foreground">Documents & diligence</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {diligenceLinks.length ? (
                    diligenceLinks.map((item) => (
                      <a
                        key={item.label}
                        href={item.href}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="dashboard-item flex items-center justify-between gap-4 p-4"
                      >
                        <div className="flex items-center gap-3">
                          <FileText className="h-4 w-4 text-enc-orange" />
                          <span className="text-sm font-medium text-foreground">{item.label}</span>
                        </div>
                        <ExternalLink className="h-4 w-4 text-muted-foreground" />
                      </a>
                    ))
                  ) : (
                    <div className="dashboard-item p-4 text-sm leading-6 text-muted-foreground">
                      No permit or diligence links are attached to this project yet. Keep lender/client-facing references offline until these records are linked.
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card className="dashboard-panel p-2">
                <CardHeader>
                  <CardTitle className="text-xl text-foreground">Readiness gaps</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {controlGaps.length ? (
                    controlGaps.map((gap) => (
                      <div key={gap} className="dashboard-item p-4 text-sm leading-6 text-muted-foreground">
                        {gap}
                      </div>
                    ))
                  ) : (
                    <div className="dashboard-item p-4 text-sm leading-6 text-muted-foreground">
                      No obvious project-control gaps were detected from the current record.
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </>
        )}
      </div>
    </ManagementLayout>
  );
}
