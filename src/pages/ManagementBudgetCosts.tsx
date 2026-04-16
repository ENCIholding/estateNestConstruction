import React, { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Plus,
  Search,
  Loader2,
  Pencil,
  Trash2,
} from "lucide-react";

type Project = {
  id: string;
  project_name?: string;
};

type BudgetItem = {
  id: string;
  project_id?: string;
  category_name?: string;
  estimated_cost?: number;
  actual_cost?: number;
  status?: string;
};

const statusColors: Record<string, string> = {
  Pending: "bg-amber-50 text-amber-700",
  Paid: "bg-emerald-50 text-emerald-700",
  Holdback: "bg-blue-50 text-blue-700",
};

async function fetchJson(url: string, options: RequestInit = {}): Promise<any> {
  const response = await fetch(url, {
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      ...(options.headers || {}),
    },
    ...options,
  });

  if (!response.ok) {
    let message = "Request failed";
    try {
      const errorData = await response.json();
      message = errorData?.error || message;
    } catch {
      message = `${response.status} ${response.statusText}`;
    }
    throw new Error(message);
  }

  return response.json();
}

export default function ManagementBudgetCosts() {
  const [search, setSearch] = useState("");
  const [projectFilter, setProjectFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [deleteBudget, setDeleteBudget] = useState<BudgetItem | null>(null);

  const { data: budgetItems = [], isLoading: loadingBudgets } = useQuery<BudgetItem[]>({
    queryKey: ["budgetItems"],
    queryFn: () => fetchJson("/api/management/budget-items"),
  });

  const { data: projects = [] } = useQuery<Project[]>({
    queryKey: ["projects"],
    queryFn: () => fetchJson("/api/management/projects"),
  });

  const projectMap = useMemo(() => {
    return projects.reduce<Record<string, Project>>((acc, project: Project) => {
      acc[project.id] = project;
      return acc;
    }, {});
  }, [projects]);

  const filteredBudgets = useMemo(() => {
    const lowerSearch = search.toLowerCase().trim();

    return budgetItems.filter((item: BudgetItem) => {
      const project = item.project_id
        ? projectMap[item.project_id]
        : undefined;

      const matchesSearch =
        lowerSearch === ""
          ? true
          : item.category_name?.toLowerCase().includes(lowerSearch) ||
            project?.project_name?.toLowerCase().includes(lowerSearch);

      const matchesProject =
        projectFilter === "all" || item.project_id === projectFilter;

      const matchesStatus =
        statusFilter === "all" || item.status === statusFilter;

      return matchesSearch && matchesProject && matchesStatus;
    });
  }, [budgetItems, projectMap, search, projectFilter, statusFilter]);

  const totalEstimated = filteredBudgets.reduce(
    (sum: number, item: BudgetItem) => sum + (item.estimated_cost || 0),
    0
  );

  const totalActual = filteredBudgets.reduce(
    (sum: number, item: BudgetItem) => sum + (item.actual_cost || 0),
    0
  );

  const variance = totalActual - totalEstimated;

  if (loadingBudgets) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 p-8">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold mb-2">Budget Costs</h1>
          <p className="text-slate-600">{budgetItems.length} budget items</p>
        </div>

        <Button className="bg-slate-900 hover:bg-slate-800">
          <Plus className="mr-2 h-4 w-4" />
          Add Budget Item
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">
              Total Estimated
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ${totalEstimated.toLocaleString()}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Actual</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ${totalActual.toLocaleString()}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Variance</CardTitle>
          </CardHeader>
          <CardContent>
            <div
              className={`text-2xl font-bold ${
                variance > 0 ? "text-red-600" : "text-green-600"
              }`}
            >
              {variance > 0 ? "+" : ""}${variance.toLocaleString()}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="mb-8">
        <CardContent className="pt-6">
          <div className="flex flex-col gap-4 md:flex-row md:items-center">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
              <Input
                placeholder="Search budget items..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10"
              />
            </div>

            <div className="flex gap-2">
              <span className="text-sm font-medium text-slate-600 py-2">
                Project:
              </span>
              <select
                value={projectFilter}
                onChange={(e) => setProjectFilter(e.target.value)}
                className="px-3 py-2 border border-slate-300 rounded-md text-sm"
              >
                <option value="all">All Projects</option>
                {projects.map((project: Project) => (
                  <option key={project.id} value={project.id}>
                    {project.project_name || "Unnamed"}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex gap-2">
              <span className="text-sm font-medium text-slate-600 py-2">
                Status:
              </span>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-3 py-2 border border-slate-300 rounded-md text-sm"
              >
                <option value="all">All Status</option>
                <option value="Pending">Pending</option>
                <option value="Paid">Paid</option>
                <option value="Holdback">Holdback</option>
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-4">
        {filteredBudgets.map((item: BudgetItem) => {
          const project = item.project_id
            ? projectMap[item.project_id]
            : undefined;

          return (
            <Card key={item.id}>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between gap-4">
                  <div className="flex-1">
                    <p className="font-semibold text-lg">
                      {item.category_name || "Uncategorized"}
                    </p>
                    <p className="text-sm text-slate-600 mb-2">
                      {project?.project_name || "—"}
                    </p>
                    <div className="flex gap-4 text-sm mb-3">
                      <span>
                        Estimated: ${item.estimated_cost?.toLocaleString() || 0}
                      </span>
                      <span>
                        Actual: ${item.actual_cost?.toLocaleString() || 0}
                      </span>
                    </div>
                    <div
                      className={`inline-block px-2 py-1 rounded text-sm ${
                        statusColors[item.status || ""] || ""
                      }`}
                    >
                      {item.status || "—"}
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <Button size="sm" variant="outline">
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      className="text-rose-600 hover:text-rose-700"
                      onClick={() => setDeleteBudget(item)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {filteredBudgets.length === 0 && (
        <div className="text-center py-12">
          <p className="text-slate-600">No budget items found</p>
        </div>
      )}

      <AlertDialog open={!!deleteBudget} onOpenChange={() => setDeleteBudget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Budget Item</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this budget item? This action
              cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction className="bg-rose-600 hover:bg-rose-700">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
