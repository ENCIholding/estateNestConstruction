import React, { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
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

type ChangeOrder = {
  id: string;
  project_id?: string;
  description?: string;
  cost_impact?: number;
  client_approval_status?: string;
};

const statusColors: Record<string, string> = {
  Pending: "bg-amber-50 text-amber-700",
  Approved: "bg-emerald-50 text-emerald-700",
  Rejected: "bg-rose-50 text-rose-700",
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

export default function ManagementChangeOrders() {
  const [search, setSearch] = useState("");
  const [projectFilter, setProjectFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [deleteOrder, setDeleteOrder] = useState<ChangeOrder | null>(null);

  const { data: changeOrders = [], isLoading } = useQuery({
    queryKey: ["changeOrders"],
    queryFn: () => fetchJson("/api/management/change-orders"),
  });

  const { data: projects = [] } = useQuery({
    queryKey: ["projects"],
    queryFn: () => fetchJson("/api/management/projects"),
  });

  const projectMap = useMemo(() => {
    return projects.reduce<Record<string, Project>>((acc, project: Project) => {
      acc[project.id] = project;
      return acc;
    }, {});
  }, [projects]);

  const filteredOrders = useMemo(() => {
    const lowerSearch = search.toLowerCase().trim();

    return changeOrders.filter((order: ChangeOrder) => {
      const project = order.project_id
        ? projectMap[order.project_id]
        : undefined;

      const matchesSearch =
        lowerSearch === ""
          ? true
          : order.description?.toLowerCase().includes(lowerSearch) ||
            project?.project_name?.toLowerCase().includes(lowerSearch);

      const matchesProject =
        projectFilter === "all" || order.project_id === projectFilter;

      const matchesStatus =
        statusFilter === "all" ||
        order.client_approval_status === statusFilter;

      return matchesSearch && matchesProject && matchesStatus;
    });
  }, [changeOrders, projectMap, search, projectFilter, statusFilter]);

  const totalImpact = filteredOrders.reduce(
    (sum: number, order: ChangeOrder) => sum + (order.cost_impact || 0),
    0
  );

  if (isLoading) {
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
          <h1 className="text-3xl font-bold mb-2">Change Orders</h1>
          <p className="text-slate-600">{changeOrders.length} change orders</p>
        </div>

        <Button className="bg-slate-900 hover:bg-slate-800">
          <Plus className="mr-2 h-4 w-4" />
          New Change Order
        </Button>
      </div>

      <Card className="mb-8">
        <CardContent className="pt-6">
          <div className="flex flex-col gap-4 md:flex-row md:items-center">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
              <Input
                placeholder="Search change orders..."
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
                <option value="Approved">Approved</option>
                <option value="Rejected">Rejected</option>
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-4">
        {filteredOrders.map((order: ChangeOrder) => {
          const project = order.project_id
            ? projectMap[order.project_id]
            : undefined;

          return (
            <Card key={order.id}>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between gap-4">
                  <div className="flex-1">
                    <p className="font-semibold text-lg">
                      {order.description || "Unnamed Change Order"}
                    </p>
                    <p className="text-sm text-slate-600 mb-2">
                      {project?.project_name || "—"}
                    </p>
                    <div className="flex gap-4 text-sm mb-3">
                      <span
                        className={`font-semibold ${
                          (order.cost_impact || 0) > 0
                            ? "text-rose-600"
                            : "text-green-600"
                        }`}
                      >
                        {(order.cost_impact || 0) > 0 ? "+" : ""}$
                        {Math.abs(order.cost_impact || 0).toLocaleString()}
                      </span>
                    </div>
                    <div
                      className={`inline-block px-2 py-1 rounded text-sm ${
                        statusColors[order.client_approval_status || ""] || ""
                      }`}
                    >
                      {order.client_approval_status || "—"}
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
                      onClick={() => setDeleteOrder(order)}
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

      {filteredOrders.length === 0 && (
        <div className="text-center py-12">
          <p className="text-slate-600">No change orders found</p>
        </div>
      )}

      <AlertDialog open={!!deleteOrder} onOpenChange={() => setDeleteOrder(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Change Order</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this change order? This action
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
