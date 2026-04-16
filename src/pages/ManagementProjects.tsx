import { useQuery } from "@tanstack/react-query";
import { FileCheck2, Link2, Mail, MapPin } from "lucide-react";
import { Link } from "react-router-dom";
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
  legal_land_description?: string;
  project_owner?: string;
  project_manager?: string;
  primary_contact_email?: string;
  building_permit_pdf?: string;
  development_permit_pdf?: string;
  real_property_report?: string;
};

type ProjectsStatus = {
  projectRegistry: {
    editable: boolean;
    source: "environment" | "temporary" | "unconfigured";
  };
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

function getRegistryMessage(source: ProjectsStatus["projectRegistry"]["source"]) {
  if (source === "environment") {
    return "This registry is being served from MANAGEMENT_PROJECTS_JSON. That is stable for deployment previews, but the records are read-only from the dashboard.";
  }

  if (source === "temporary") {
    return "These records exist only in temporary server memory and should not be treated as durable production records.";
  }

  return "No project registry is configured yet. The projects module stays empty instead of showing demo records.";
}

export default function ManagementProjects() {
  const {
    data: projects = [],
    isLoading,
    error,
  } = useQuery({
    queryKey: ["management-projects"],
    queryFn: () => fetchJson<ManagementProject[]>("/api/management/projects"),
  });

  const { data: status } = useQuery({
    queryKey: ["management-status"],
    queryFn: () => fetchJson<ProjectsStatus>("/api/management/status"),
  });

  return (
    <ManagementLayout currentPageName="projects">
      <div className="space-y-6">
        <div className="dashboard-panel overflow-hidden p-8">
          <div className="absolute inset-y-0 right-0 w-40 bg-gradient-to-l from-enc-yellow/10 via-enc-orange/10 to-transparent" />
          <div className="relative">
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-enc-orange">
              Project Registry
            </p>
            <h1 className="mt-3 text-3xl font-bold text-foreground">Projects</h1>
            <p className="mt-4 max-w-3xl text-sm leading-6 text-muted-foreground">
              Project records are shown only when real data is configured. This page no longer uses sample budgets, addresses, or fake project cards.
            </p>
          </div>
        </div>

        <Card className="dashboard-panel p-2">
          <CardHeader>
            <CardTitle className="text-xl text-foreground">Registry status</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm leading-6 text-muted-foreground">
              {getRegistryMessage(status?.projectRegistry.source || "unconfigured")}
            </p>
          </CardContent>
        </Card>

        {isLoading ? (
          <Card className="dashboard-panel p-2">
            <CardContent className="p-6 text-sm text-muted-foreground">
              Loading project registry...
            </CardContent>
          </Card>
        ) : error ? (
          <Card className="dashboard-panel p-2">
            <CardContent className="p-6 text-sm leading-6 text-muted-foreground">
              The project registry could not be loaded. Review the management API before relying on this page.
            </CardContent>
          </Card>
        ) : projects.length ? (
          <div className="grid gap-4">
            {projects.map((project) => {
              const diligenceLinks = [
                project.development_permit_pdf,
                project.building_permit_pdf,
                project.real_property_report,
              ].filter(Boolean).length;

              return (
                <Card key={project.id} className="dashboard-panel p-2">
                  <CardContent className="space-y-4 p-6">
                    <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                      <div className="space-y-3">
                        <div className="flex flex-wrap items-center gap-2">
                          <h2 className="text-xl font-semibold text-foreground">
                            {project.project_name}
                          </h2>
                          <Badge className={`rounded-full ${getStatusClass(project.status)}`}>
                            {project.status}
                          </Badge>
                        </div>

                        <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                          <span className="flex items-center gap-2">
                            <MapPin className="h-4 w-4 text-enc-orange" />
                            {project.civic_address}
                          </span>
                          <span>Budget baseline: {formatCurrency(project.estimated_budget)}</span>
                        </div>

                        <div className="grid gap-3 text-sm text-muted-foreground md:grid-cols-3">
                          <div className="dashboard-item p-3">
                            <p className="font-medium text-foreground">Responsibility</p>
                            <p className="mt-2">
                              {project.project_manager || project.project_owner || "Not assigned"}
                            </p>
                          </div>
                          <div className="dashboard-item p-3">
                            <p className="font-medium text-foreground">Primary contact</p>
                            <p className="mt-2 flex items-center gap-2">
                              <Mail className="h-4 w-4 text-enc-orange" />
                              {project.primary_contact_email || "Not set"}
                            </p>
                          </div>
                          <div className="dashboard-item p-3">
                            <p className="font-medium text-foreground">Diligence references</p>
                            <p className="mt-2 flex items-center gap-2">
                              <FileCheck2 className="h-4 w-4 text-enc-orange" />
                              {diligenceLinks} linked document{diligenceLinks === 1 ? "" : "s"}
                            </p>
                          </div>
                        </div>

                        <div className="flex flex-wrap gap-2 text-sm">
                          <Badge className="rounded-full bg-muted text-muted-foreground">
                            Legal land: {project.legal_land_description ? "recorded" : "missing"}
                          </Badge>
                          <Badge className="rounded-full bg-muted text-muted-foreground">
                            Permit links: {diligenceLinks ? "attached" : "missing"}
                          </Badge>
                        </div>
                      </div>

                      <Button asChild variant="outline" className="rounded-full">
                        <Link to={`/management/project-details?id=${project.id}`}>
                          <Link2 className="mr-2 h-4 w-4" />
                          Open project
                        </Link>
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        ) : (
          <Card className="dashboard-panel p-2">
            <CardContent className="space-y-4 p-6">
              <p className="text-base font-semibold text-foreground">No live project records are available</p>
              <p className="max-w-3xl text-sm leading-6 text-muted-foreground">
                To make this module operational, connect a reviewed project registry through a durable backend or deploy a verified MANAGEMENT_PROJECTS_JSON data set. Until then, the page stays empty rather than presenting fake pipeline data.
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </ManagementLayout>
  );
}
