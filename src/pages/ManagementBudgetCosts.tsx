import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Landmark, Search, TriangleAlert } from "lucide-react";
import ManagementLayout from "@/components/management/ManagementLayout";
import Badge from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Input from "@/components/ui/input";
import {
  buildBudgetRows,
  buildBudgetSummary,
  fetchManagementProjects,
  formatCurrency,
} from "@/lib/managementData";

function formatRatio(value: number | null) {
  if (value === null) {
    return "Not enough data";
  }

  return `${Math.round(value * 100)}% of budget`;
}

export default function ManagementBudgetCosts() {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const {
    data: projects = [],
    error,
    isLoading,
  } = useQuery({
    queryKey: ["management-projects"],
    queryFn: fetchManagementProjects,
  });

  const budgetRows = useMemo(() => buildBudgetRows(projects), [projects]);
  const budgetSummary = useMemo(() => buildBudgetSummary(budgetRows), [budgetRows]);

  const filteredRows = useMemo(() => {
    const query = search.trim().toLowerCase();

    return budgetRows.filter((row) => {
      const matchesSearch =
        !query ||
        row.projectName.toLowerCase().includes(query) ||
        row.status.toLowerCase().includes(query);
      const matchesStatus =
        statusFilter === "all" || row.status.toLowerCase() === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [budgetRows, search, statusFilter]);

  return (
    <ManagementLayout currentPageName="budget-costs">
      <div className="space-y-6">
        <div className="dashboard-panel overflow-hidden p-8">
          <div className="absolute inset-y-0 right-0 w-44 bg-gradient-to-l from-enc-yellow/10 via-enc-orange/10 to-transparent" />
          <div className="relative">
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-enc-orange">
              Budget Readiness
            </p>
            <h1 className="mt-3 text-3xl font-bold text-foreground">Budget & Costs</h1>
            <p className="mt-4 max-w-3xl text-sm leading-6 text-muted-foreground">
              This screen now reports only registry-backed budget baselines, deposits, and indicative selling values. Client invoices, vendor bills, and actual cost ledgers remain offline until a durable transaction model exists.
            </p>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <Card className="dashboard-panel p-2">
            <CardContent className="p-5">
              <p className="text-sm font-medium text-muted-foreground">Budget baselines</p>
              <p className="mt-3 text-3xl font-semibold text-foreground">
                {formatCurrency(budgetSummary.totalBudget)}
              </p>
            </CardContent>
          </Card>
          <Card className="dashboard-panel p-2">
            <CardContent className="p-5">
              <p className="text-sm font-medium text-muted-foreground">Deposits recorded</p>
              <p className="mt-3 text-3xl font-semibold text-foreground">
                {formatCurrency(budgetSummary.totalDeposits)}
              </p>
            </CardContent>
          </Card>
          <Card className="dashboard-panel p-2">
            <CardContent className="p-5">
              <p className="text-sm font-medium text-muted-foreground">Indicative selling value</p>
              <p className="mt-3 text-3xl font-semibold text-foreground">
                {formatCurrency(budgetSummary.totalSelling)}
              </p>
            </CardContent>
          </Card>
          <Card className="dashboard-panel p-2">
            <CardContent className="p-5">
              <p className="text-sm font-medium text-muted-foreground">Missing baselines</p>
              <p className="mt-3 text-3xl font-semibold text-foreground">
                {budgetSummary.missingBaselines}
              </p>
            </CardContent>
          </Card>
        </div>

        <Card className="dashboard-panel p-2">
          <CardHeader>
            <CardTitle className="text-xl text-foreground">Filter registry budgets</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4 md:grid-cols-[minmax(0,1fr)_220px]">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                className="pl-10"
                placeholder="Search by project or status"
              />
            </div>
            <select
              value={statusFilter}
              onChange={(event) => setStatusFilter(event.target.value)}
              className="flex h-10 rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground"
            >
              <option value="all">All statuses</option>
              {Array.from(new Set(budgetRows.map((row) => row.status.toLowerCase()))).map((status) => (
                <option key={status} value={status}>
                  {status}
                </option>
              ))}
            </select>
          </CardContent>
        </Card>

        {isLoading ? (
          <Card className="dashboard-panel p-2">
            <CardContent className="p-6 text-sm text-muted-foreground">
              Loading budget readiness...
            </CardContent>
          </Card>
        ) : error ? (
          <Card className="dashboard-panel p-2">
            <CardContent className="flex items-start gap-3 p-6 text-sm leading-6 text-muted-foreground">
              <TriangleAlert className="mt-0.5 h-4 w-4 shrink-0 text-rose-500" />
              Budget readiness could not be loaded from the management API.
            </CardContent>
          </Card>
        ) : (
          <Card className="dashboard-panel p-2">
            <CardHeader className="flex flex-row items-start justify-between gap-4">
              <div>
                <CardTitle className="text-xl text-foreground">Registry budget rows</CardTitle>
                <p className="mt-2 text-sm text-muted-foreground">
                  These numbers come from the live project registry only and should not be mistaken for a full accounting ledger.
                </p>
              </div>
              <Badge className="rounded-full bg-muted text-muted-foreground">
                {filteredRows.length} shown
              </Badge>
            </CardHeader>
            <CardContent className="space-y-3">
              {filteredRows.length ? (
                filteredRows.map((row) => (
                  <div key={row.projectId} className="dashboard-item p-4">
                    <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                      <div className="space-y-3">
                        <div className="flex flex-wrap items-center gap-2">
                          <p className="text-base font-semibold text-foreground">{row.projectName}</p>
                          <Badge className="rounded-full bg-muted text-muted-foreground">
                            {row.status}
                          </Badge>
                          {!row.hasBaseline ? (
                            <Badge className="rounded-full bg-rose-500/10 text-rose-700 dark:text-rose-300">
                              Budget missing
                            </Badge>
                          ) : null}
                        </div>

                        <div className="grid gap-3 text-sm text-muted-foreground md:grid-cols-3">
                          <div>
                            <p className="font-medium text-foreground">Budget baseline</p>
                            <p className="mt-1">{formatCurrency(row.estimatedBudget)}</p>
                          </div>
                          <div>
                            <p className="font-medium text-foreground">Deposit recorded</p>
                            <p className="mt-1">{formatCurrency(row.depositAmount)}</p>
                          </div>
                          <div>
                            <p className="font-medium text-foreground">Indicative sell value</p>
                            <p className="mt-1">{formatCurrency(row.sellingPrice)}</p>
                          </div>
                        </div>
                      </div>

                      <div className="min-w-[220px] rounded-2xl border border-border/70 bg-background/80 p-4 text-sm text-muted-foreground">
                        <p className="font-medium text-foreground">Readiness notes</p>
                        <p className="mt-2">Deposit coverage: {formatRatio(row.budgetCoverageRatio)}</p>
                        <p className="mt-2">Indicative spread: {formatCurrency(row.grossSpread, "Not enough data")}</p>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="dashboard-item p-6 text-sm leading-6 text-muted-foreground">
                  No budget rows match the current filter.
                </div>
              )}
            </CardContent>
          </Card>
        )}

        <Card className="dashboard-panel p-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-xl text-foreground">
              <Landmark className="h-5 w-5 text-enc-orange" />
              What still stays offline
            </CardTitle>
          </CardHeader>
          <CardContent className="text-sm leading-6 text-muted-foreground">
            Vendor bills, client invoices, payment approvals, and actual cost variance tracking remain offline until they have server-backed CRUD, validation, and reconciliation rules.
          </CardContent>
        </Card>
      </div>
    </ManagementLayout>
  );
}
