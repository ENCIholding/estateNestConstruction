import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { Download, FileDown, Printer, TriangleAlert } from "lucide-react";
import ManagementLayout from "@/components/management/ManagementLayout";
import Badge from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  buildProjectCompliance,
  buildProjectDocuments,
  buildProjectsCsv,
  fetchManagementProjects,
  formatCurrency,
  getRegistryCoverage,
} from "@/lib/managementData";

function downloadCsv(filename: string, content: string) {
  const blob = new Blob([content], { type: "text/csv;charset=utf-8" });
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement("a");

  link.href = url;
  link.download = filename;
  link.click();

  window.URL.revokeObjectURL(url);
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

  const complianceRows = useMemo(() => buildProjectCompliance(projects), [projects]);
  const documents = useMemo(() => buildProjectDocuments(projects), [projects]);
  const coverage = useMemo(() => getRegistryCoverage(projects), [projects]);
  const csv = useMemo(() => buildProjectsCsv(projects), [projects]);

  return (
    <ManagementLayout currentPageName="reports">
      <div className="space-y-6">
        <div className="dashboard-panel overflow-hidden p-8">
          <div className="absolute inset-y-0 right-0 w-44 bg-gradient-to-l from-enc-yellow/10 via-enc-orange/10 to-transparent" />
          <div className="relative">
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-enc-orange">
              Reporting
            </p>
            <h1 className="mt-3 text-3xl font-bold text-foreground">Reports</h1>
            <p className="mt-4 max-w-3xl text-sm leading-6 text-muted-foreground">
              This reporting layer is intentionally light: it exports the current project registry and its linked readiness signals without fabricating accounting, task, or compliance records that do not yet exist.
            </p>
          </div>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row">
          <Button
            className="rounded-full bg-gradient-to-r from-enc-red via-enc-orange to-enc-yellow text-white shadow-glow"
            onClick={() => downloadCsv("estate-nest-project-registry.csv", csv)}
            disabled={!projects.length}
          >
            <Download className="mr-2 h-4 w-4" />
            Download Registry CSV
          </Button>
          <Button variant="outline" className="rounded-full" onClick={() => window.print()}>
            <Printer className="mr-2 h-4 w-4" />
            Print Summary
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
              <p className="text-sm font-medium text-muted-foreground">Document coverage</p>
              <p className="mt-3 text-3xl font-semibold text-foreground">{coverage.documentCoverage}%</p>
            </CardContent>
          </Card>
          <Card className="dashboard-panel p-2">
            <CardContent className="p-5">
              <p className="text-sm font-medium text-muted-foreground">Budget coverage</p>
              <p className="mt-3 text-3xl font-semibold text-foreground">{coverage.budgetCoverage}%</p>
            </CardContent>
          </Card>
          <Card className="dashboard-panel p-2">
            <CardContent className="p-5">
              <p className="text-sm font-medium text-muted-foreground">Average compliance</p>
              <p className="mt-3 text-3xl font-semibold text-foreground">{coverage.averageCompliance}%</p>
            </CardContent>
          </Card>
        </div>

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
                  <CardTitle className="text-xl text-foreground">Registry summary</CardTitle>
                  <p className="mt-2 text-sm text-muted-foreground">
                    Print-friendly overview of the current registry-backed project set.
                  </p>
                </div>
                <Badge className="rounded-full bg-muted text-muted-foreground">
                  Read-only export
                </Badge>
              </CardHeader>
              <CardContent className="space-y-3">
                {projects.length ? (
                  projects.map((project) => {
                    const projectDocuments = documents.filter(
                      (document) => document.projectId === project.id
                    ).length;
                    const compliance = complianceRows.find(
                      (row) => row.projectId === project.id
                    );

                    return (
                      <div key={project.id} className="dashboard-item p-4">
                        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                          <div>
                            <div className="flex flex-wrap items-center gap-2">
                              <p className="text-base font-semibold text-foreground">
                                {project.project_name}
                              </p>
                              <Badge className="rounded-full bg-muted text-muted-foreground">
                                {project.status}
                              </Badge>
                            </div>
                            <p className="mt-2 text-sm text-muted-foreground">{project.civic_address}</p>
                            <div className="mt-3 flex flex-wrap gap-4 text-sm text-muted-foreground">
                              <span>Budget baseline: {formatCurrency(project.estimated_budget)}</span>
                              <span>Linked documents: {projectDocuments}</span>
                              <span>Compliance score: {compliance?.score ?? 0}%</span>
                            </div>
                          </div>

                          <div className="rounded-2xl border border-border/70 bg-background/80 px-4 py-3 text-sm text-muted-foreground">
                            <p className="font-medium text-foreground">Coverage notes</p>
                            <p className="mt-2">
                              Contact: {project.primary_contact_email || "Not recorded"}
                            </p>
                            <p className="mt-2">
                              Indicative sell value: {formatCurrency(project.selling_price)}
                            </p>
                          </div>
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <div className="dashboard-item p-6 text-sm leading-6 text-muted-foreground">
                    No registry-backed projects are available to report yet.
                  </div>
                )}
              </CardContent>
            </Card>

            <Card className="dashboard-panel p-2">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-xl text-foreground">
                  <FileDown className="h-5 w-5 text-enc-orange" />
                  Report scope note
                </CardTitle>
              </CardHeader>
              <CardContent className="text-sm leading-6 text-muted-foreground">
                These exports include only registry fields, linked diligence documents, and derived readiness summaries. They do not represent a lender package, accounting statement, or project control report until the underlying source data exists and is verified.
              </CardContent>
            </Card>
          </>
        )}
      </div>
    </ManagementLayout>
  );
}
