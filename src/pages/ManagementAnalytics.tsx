import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { ChartNoAxesColumn, TriangleAlert } from "lucide-react";
import ManagementLayout from "@/components/management/ManagementLayout";
import Badge from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  buildProjectCompliance,
  buildProjectDocuments,
  fetchManagementJson,
  getRegistryCoverage,
  type ManagementProject,
} from "@/lib/managementData";

export default function ManagementAnalytics() {
  const {
    data: projects = [],
    error,
    isLoading,
  } = useQuery({
    queryKey: ["management-projects"],
    queryFn: () => fetchManagementJson<ManagementProject[]>("/api/management/projects"),
  });

  const complianceRows = useMemo(() => buildProjectCompliance(projects), [projects]);
  const documents = useMemo(() => buildProjectDocuments(projects), [projects]);
  const coverage = useMemo(() => getRegistryCoverage(projects), [projects]);
  const statusCounts = useMemo(() => {
    return projects.reduce<Record<string, number>>((counts, project) => {
      const key = project.status || "Unknown";
      counts[key] = (counts[key] || 0) + 1;
      return counts;
    }, {});
  }, [projects]);

  return (
    <ManagementLayout currentPageName="analytics">
      <div className="space-y-6">
        <div className="dashboard-panel overflow-hidden p-8">
          <div className="absolute inset-y-0 right-0 w-44 bg-gradient-to-l from-enc-yellow/10 via-enc-orange/10 to-transparent" />
          <div className="relative">
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-enc-orange">
              Registry Analytics
            </p>
            <h1 className="mt-3 text-3xl font-bold text-foreground">Analytics</h1>
            <p className="mt-4 max-w-3xl text-sm leading-6 text-muted-foreground">
              These analytics are intentionally grounded in the current project registry only. They help spot data coverage gaps without pretending the platform already has full operational telemetry.
            </p>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
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
              <p className="text-sm font-medium text-muted-foreground">Date coverage</p>
              <p className="mt-3 text-3xl font-semibold text-foreground">{coverage.datedProjectsCoverage}%</p>
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
              Loading analytics...
            </CardContent>
          </Card>
        ) : error ? (
          <Card className="dashboard-panel p-2">
            <CardContent className="flex items-start gap-3 p-6 text-sm leading-6 text-muted-foreground">
              <TriangleAlert className="mt-0.5 h-4 w-4 shrink-0 text-rose-500" />
              Analytics could not be loaded from the management API.
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-6 xl:grid-cols-[minmax(0,1.1fr)_minmax(320px,0.9fr)]">
            <Card className="dashboard-panel p-2">
              <CardHeader>
                <CardTitle className="text-xl text-foreground">Project status mix</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {Object.entries(statusCounts).length ? (
                  Object.entries(statusCounts).map(([status, count]) => (
                    <div key={status} className="dashboard-item p-4">
                      <div className="flex items-center justify-between gap-4">
                        <div className="flex items-center gap-3">
                          <div className="dashboard-icon h-11 w-11">
                            <ChartNoAxesColumn className="h-5 w-5 text-white" />
                          </div>
                          <div>
                            <p className="text-sm font-semibold text-foreground">{status}</p>
                            <p className="text-sm text-muted-foreground">{count} project(s)</p>
                          </div>
                        </div>
                        <div className="w-32 overflow-hidden rounded-full bg-muted">
                          <div
                            className="h-3 rounded-full bg-gradient-to-r from-enc-red via-enc-orange to-enc-yellow"
                            style={{
                              width: `${projects.length ? Math.max((count / projects.length) * 100, 10) : 0}%`,
                            }}
                          />
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="dashboard-item p-6 text-sm leading-6 text-muted-foreground">
                    No projects are configured yet, so there is no status analytics to display.
                  </div>
                )}
              </CardContent>
            </Card>

            <Card className="dashboard-panel p-2">
              <CardHeader>
                <CardTitle className="text-xl text-foreground">Readiness flags</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="dashboard-item p-4">
                  <p className="text-sm font-medium text-foreground">Projects with linked documents</p>
                  <p className="mt-2 text-sm text-muted-foreground">
                    {new Set(documents.map((document) => document.projectId)).size} of {projects.length}
                  </p>
                </div>
                <div className="dashboard-item p-4">
                  <p className="text-sm font-medium text-foreground">Projects below 60% compliance</p>
                  <p className="mt-2 text-sm text-muted-foreground">
                    {complianceRows.filter((row) => row.score < 60).length} project(s)
                  </p>
                </div>
                <div className="dashboard-item p-4">
                  <p className="text-sm font-medium text-foreground">Projects with complete registry dates</p>
                  <p className="mt-2 text-sm text-muted-foreground">
                    {projects.filter((project) => project.start_date && project.estimated_end_date).length} project(s)
                  </p>
                </div>
                <div className="dashboard-item p-4">
                  <p className="text-sm font-medium text-foreground">Purpose of this view</p>
                  <p className="mt-2 text-sm leading-6 text-muted-foreground">
                    This page helps identify coverage gaps in the current registry. It is not a substitute for project controls, field telemetry, or financial reporting.
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </ManagementLayout>
  );
}
