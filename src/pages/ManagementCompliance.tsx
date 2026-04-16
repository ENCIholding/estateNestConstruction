import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { FileCheck2, Search, ShieldAlert, TriangleAlert } from "lucide-react";
import ManagementLayout from "@/components/management/ManagementLayout";
import Badge from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Input from "@/components/ui/input";
import {
  buildProjectCompliance,
  fetchManagementProjects,
} from "@/lib/managementData";

export default function ManagementCompliance() {
  const [search, setSearch] = useState("");

  const {
    data: projects = [],
    error,
    isLoading,
  } = useQuery({
    queryKey: ["management-projects"],
    queryFn: fetchManagementProjects,
  });

  const complianceRows = useMemo(() => buildProjectCompliance(projects), [projects]);

  const filteredRows = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) {
      return complianceRows;
    }

    return complianceRows.filter(
      (row) =>
        row.projectName.toLowerCase().includes(query) ||
        row.checks.some(
          (check) =>
            check.label.toLowerCase().includes(query) ||
            check.detail.toLowerCase().includes(query)
        )
    );
  }, [complianceRows, search]);

  const averageScore =
    complianceRows.length > 0
      ? Math.round(
          complianceRows.reduce((sum, row) => sum + row.score, 0) /
            complianceRows.length
        )
      : 0;
  const criticalGaps = complianceRows.filter((row) => row.missingCount >= 3).length;

  return (
    <ManagementLayout currentPageName="compliance">
      <div className="space-y-6">
        <div className="dashboard-panel overflow-hidden p-8">
          <div className="absolute inset-y-0 right-0 w-44 bg-gradient-to-l from-enc-yellow/10 via-enc-orange/10 to-transparent" />
          <div className="relative">
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-enc-orange">
              Compliance Readiness
            </p>
            <h1 className="mt-3 text-3xl font-bold text-foreground">Compliance</h1>
            <p className="mt-4 max-w-3xl text-sm leading-6 text-muted-foreground">
              This view scores only the compliance signals currently stored in each live project record. It does not invent permit status, inspections, or third-party approvals that are not actually linked.
            </p>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <Card className="dashboard-panel p-2">
            <CardContent className="p-5">
              <p className="text-sm font-medium text-muted-foreground">Average registry score</p>
              <p className="mt-3 text-3xl font-semibold text-foreground">{averageScore}%</p>
            </CardContent>
          </Card>
          <Card className="dashboard-panel p-2">
            <CardContent className="p-5">
              <p className="text-sm font-medium text-muted-foreground">Projects with critical gaps</p>
              <p className="mt-3 text-3xl font-semibold text-foreground">{criticalGaps}</p>
            </CardContent>
          </Card>
          <Card className="dashboard-panel p-2">
            <CardContent className="p-5">
              <p className="text-sm font-medium text-muted-foreground">Projects reviewed</p>
              <p className="mt-3 text-3xl font-semibold text-foreground">{complianceRows.length}</p>
            </CardContent>
          </Card>
          <Card className="dashboard-panel p-2">
            <CardContent className="p-5">
              <p className="text-sm font-medium text-muted-foreground">Fully documented</p>
              <p className="mt-3 text-3xl font-semibold text-foreground">
                {complianceRows.filter((row) => row.missingCount === 0).length}
              </p>
            </CardContent>
          </Card>
        </div>

        <Card className="dashboard-panel p-2">
          <CardHeader>
            <CardTitle className="text-xl text-foreground">Filter compliance rows</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                className="pl-10"
                placeholder="Search by project or compliance requirement"
              />
            </div>
          </CardContent>
        </Card>

        {isLoading ? (
          <Card className="dashboard-panel p-2">
            <CardContent className="p-6 text-sm text-muted-foreground">
              Loading compliance readiness...
            </CardContent>
          </Card>
        ) : error ? (
          <Card className="dashboard-panel p-2">
            <CardContent className="flex items-start gap-3 p-6 text-sm leading-6 text-muted-foreground">
              <TriangleAlert className="mt-0.5 h-4 w-4 shrink-0 text-rose-500" />
              Compliance readiness could not be loaded from the management API.
            </CardContent>
          </Card>
        ) : (
          <Card className="dashboard-panel p-2">
            <CardHeader className="flex flex-row items-start justify-between gap-4">
              <div>
                <CardTitle className="text-xl text-foreground">Project controls</CardTitle>
                <p className="mt-2 text-sm text-muted-foreground">
                  Readiness is based on what is actually attached to each live record.
                </p>
              </div>
              <Badge className="rounded-full bg-muted text-muted-foreground">
                {filteredRows.length} shown
              </Badge>
            </CardHeader>
            <CardContent className="space-y-4">
              {filteredRows.length ? (
                filteredRows.map((row) => (
                  <div key={row.projectId} className="dashboard-item p-4">
                    <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                      <div className="space-y-3">
                        <div className="flex flex-wrap items-center gap-2">
                          <p className="text-base font-semibold text-foreground">{row.projectName}</p>
                          <Badge className="rounded-full bg-muted text-muted-foreground">
                            {row.score}% ready
                          </Badge>
                          {row.missingCount >= 3 ? (
                            <Badge className="rounded-full bg-rose-500/10 text-rose-700 dark:text-rose-300">
                              Critical gaps
                            </Badge>
                          ) : null}
                        </div>

                        <div className="grid gap-3 md:grid-cols-2">
                          {row.checks.map((check) => (
                            <div key={`${row.projectId}-${check.label}`} className="rounded-2xl border border-border/70 bg-background/80 p-4">
                              <div className="flex items-center gap-2">
                                {check.ready ? (
                                  <FileCheck2 className="h-4 w-4 text-emerald-500" />
                                ) : (
                                  <ShieldAlert className="h-4 w-4 text-amber-500" />
                                )}
                                <p className="text-sm font-medium text-foreground">{check.label}</p>
                              </div>
                              <p className="mt-2 text-sm leading-6 text-muted-foreground">{check.detail}</p>
                            </div>
                          ))}
                        </div>
                      </div>

                      <div className="min-w-[180px] rounded-2xl border border-border/70 bg-background/80 p-4 text-sm text-muted-foreground">
                        <p className="font-medium text-foreground">Summary</p>
                        <p className="mt-2">{row.readyCount} ready</p>
                        <p className="mt-2">{row.missingCount} missing</p>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="dashboard-item p-6 text-sm leading-6 text-muted-foreground">
                  No compliance rows match the current filter.
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </ManagementLayout>
  );
}
