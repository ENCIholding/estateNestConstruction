import React, { useMemo, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
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
  MoreHorizontal,
  Loader2,
  Pencil,
  Trash2,
  TrendingUp,
  TrendingDown,
  Minus,
} from "lucide-react";
import ManagementChangeOrderForm from "@/components/changeorders/ManagementChangeOrderForm";

type User = {
  id: string;
  app_role?: string;
};

type Project = {
  id: string;
  project_name?: string;
};

type ChangeOrder = {
  id: string;
  project_id?: string;
  description?: string;
  cost_impact?: number;
  client_approval_status?: "Pending" | "Approved" | "Rejected" | string;
  approved_date?: string;
  requested_by?: string;
  notes?: string;
  created_at?: string;
};

async function fetchJson<T>(url: string, options: RequestInit = {}): Promise<T> {
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

  if (response.status === 204) {
    return {} as T;
  }

  return response.json();
}

const statusColors: Record<string, string> = {
  Pending: "bg-amber-50 text-amber-700",
  Approved: "bg-emerald-50 text-emerald-700",
  Rejected: "bg-rose-50 text-rose-700",
};

export default function ManagementChangeOrders() {
  const [search, setSearch] = useState("");
  const [projectFilter, setProjectFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [showForm, setShowForm] = useState(false);
  const [editingOrder, setEditingOrder] = useState<ChangeOrder | null>(null);
  const [deleteOrder, setDeleteOrder] = useState<ChangeOrder | null>(null);

  const queryClient = useQueryClient();

  const { data: sessionData } = useQuery({
    queryKey: ["management-session"],
    queryFn: () => fetchJson<{ user: User | null }>("/api/management/session"),
    retry: false,
  });

  const user = sessionData?.user || null;
  const userRole = user?.app_role || "Admin";
  const canEdit = userRole === "Admin" || userRole === "Project Manager";

  const {
    data: changeOrders = [],
    isLoading,
  } = useQuery({
    queryKey: ["changeOrders"],
    queryFn: () => fetchJson<ChangeOrder[]>("/api/management/change-orders"),
  });

  const { data: projects = [] } = useQuery({
    queryKey: ["projects"],
    queryFn: () => fetchJson<Project[]>("/api/management/projects"),
  });

  const projectMap = useMemo(() => {
    return projects.reduce<Record<string, Project>>((acc, project) => {
      acc[project.id] = project;
      return acc;
    }, {});
  }, [projects]);

  const handleDelete = async () => {
    if (!deleteOrder?.id) return;

    try {
      await fetchJson(`/api/management/change-orders/${deleteOrder.id}`, {
        method: "DELETE",
      });

      await queryClient.invalidateQueries({ queryKey: ["changeOrders"] });
      setDeleteOrder(null);
    } catch (error) {
      console.error("Failed to delete change order:", error);
      alert(
        error instanceof Error
          ? error.message
          : "Failed to delete change order."
      );
    }
  };

  const filteredOrders = useMemo(() => {
    const lowerSearch = search.toLowerCase().trim();

    return changeOrders.filter((order) => {
      const projectName = order.project_id
        ? projectMap[order.project_id]?.project_name || ""
        : "";

      const matchesSearch =
        lowerSearch === ""
          ? true
          : order.description?.toLowerCase().includes(lowerSearch) ||
            projectName.toLowerCase().includes(lowerSearch) ||
            order.requested_by?.toLowerCase().includes(lowerSearch) ||
            order.notes?.toLowerCase().includes(lowerSearch);

      const matchesProject =
        projectFilter === "all" || order.project_id === projectFilter;

      const matchesStatus =
        statusFilter === "all" ||
        order.client_approval_status === statusFilter;

      return Boolean(matchesSearch) && matchesProject && matchesStatus;
    });
  }, [changeOrders, projectMap, projectFilter, search, statusFilter]);

  const totalImpact = filteredOrders.reduce(
    (sum, order) => sum + (order.cost_impact || 0),
    0
  );

  const approvedImpact = filteredOrders
    .filter((o) => o.client_approval_status === "Approved")
    .reduce((sum, order) => sum + (order.cost_impact || 0), 0);

  const pendingCount = filteredOrders.filter(
    (o) => o.client_approval_status === "Pending"
  ).length;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="h-8 w-8 animate-spin text-slate-400" />
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold text-slate-900">
            Change Orders
          </h1>
          <p className="text-slate-500 mt-1">
            {changeOrders.length} change orders recorded
          </p>
        </div>

        {canEdit && (
          <Button
            onClick={() => {
              setEditingOrder(null);
              setShowForm(true);
            }}
            className="bg-slate-900 hover:bg-slate-800"
          >
            <Plus className="h-4 w-4 mr-2" />
            New Change Order
          </Button>
        )}
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-4 border-0 shadow-sm">
          <p className="text-sm text-slate-500">Total Orders</p>
          <p className="text-2xl font-bold text-slate-900">
            {filteredOrders.length}
          </p>
        </Card>

        <Card className="p-4 border-0 shadow-sm">
          <p className="text-sm text-slate-500">Pending Approval</p>
          <p className="text-2xl font-bold text-amber-600">{pendingCount}</p>
        </Card>

        <Card className="p-4 border-0 shadow-sm">
          <p className="text-sm text-slate-500">Total Impact</p>
          <p
            className={`text-2xl font-bold flex items-center gap-1 ${
              totalImpact > 0
                ? "text-rose-600"
                : totalImpact < 0
                ? "text-emerald-600"
                : "text-slate-900"
            }`}
          >
            {totalImpact > 0 ? (
              <TrendingUp className="h-5 w-5" />
            ) : totalImpact < 0 ? (
              <TrendingDown className="h-5 w-5" />
            ) : (
              <Minus className="h-5 w-5" />
            )}
            {totalImpact > 0 && "+"}${totalImpact.toLocaleString()}
          </p>
        </Card>

        <Card className="p-4 border-0 shadow-sm">
          <p className="text-sm text-slate-500">Approved Impact</p>
          <p
            className={`text-2xl font-bold ${
              approvedImpact > 0
                ? "text-rose-600"
                : approvedImpact < 0
                ? "text-emerald-600"
                : "text-slate-900"
            }`}
          >
            {approvedImpact > 0 && "+"}${approvedImpact.toLocaleString()}
          </p>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Input
          placeholder="Search change orders..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />

        <Select value={projectFilter} onValueChange={setProjectFilter}>
          <SelectTrigger>
            <SelectValue placeholder="All Projects" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Projects</SelectItem>
            {projects.map((project) => (
              <SelectItem key={project.id} value={project.id}>
                {project.project_name || "Unnamed Project"}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger>
            <SelectValue placeholder="All Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="Pending">Pending</SelectItem>
            <SelectItem value="Approved">Approved</SelectItem>
            <SelectItem value="Rejected">Rejected</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Card className="border-0 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-slate-50">
                <TableHead>Description</TableHead>
                <TableHead>Project</TableHead>
                <TableHead className="text-right">Cost Impact</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Requested By</TableHead>
                <TableHead>Approved Date</TableHead>
                <TableHead className="w-12"></TableHead>
              </TableRow>
            </TableHeader>

            <TableBody>
              {filteredOrders.map((order) => {
                const projectName = order.project_id
                  ? projectMap[order.project_id]?.project_name
                  : undefined;

                return (
                  <TableRow key={order.id}>
                    <TableCell>
                      <div>
                        <p className="font-medium text-slate-900">
                          {order.description || "—"}
                        </p>
                        {order.notes ? (
                          <p className="text-xs text-slate-500 mt-1">
                            {order.notes}
                          </p>
                        ) : null}
                      </div>
                    </TableCell>

                    <TableCell className="text-slate-600">
                      {projectName || "—"}
                    </TableCell>

                    <TableCell
                      className={`text-right font-semibold ${
                        (order.cost_impact || 0) > 0
                          ? "text-rose-600"
                          : (order.cost_impact || 0) < 0
                          ? "text-emerald-600"
                          : "text-slate-500"
                      }`}
                    >
                      {(order.cost_impact || 0) > 0 && "+"}$
                      {(order.cost_impact || 0).toLocaleString()}
                    </TableCell>

                    <TableCell>
                      <Badge
                        className={
                          statusColors[order.client_approval_status || ""] ||
                          "bg-slate-100 text-slate-700"
                        }
                      >
                        {order.client_approval_status || "—"}
                      </Badge>
                    </TableCell>

                    <TableCell className="text-slate-600">
                      {order.requested_by || "—"}
                    </TableCell>

                    <TableCell className="text-slate-600">
                      {order.approved_date || "—"}
                    </TableCell>

                    <TableCell>
                      {canEdit && (
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>

                          <DropdownMenuContent align="end">
                            <DropdownMenuItem
                              onClick={() => {
                                setEditingOrder(order);
                                setShowForm(true);
                              }}
                            >
                              <Pencil className="h-4 w-4 mr-2" />
                              Edit
                            </DropdownMenuItem>

                            <DropdownMenuItem
                              onClick={() => setDeleteOrder(order)}
                              className="text-rose-600"
                            >
                              <Trash2 className="h-4 w-4 mr-2" />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      )}
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      </Card>

      {filteredOrders.length === 0 && (
        <div className="text-center py-12 text-slate-500">
          No change orders found
        </div>
      )}

      <ManagementChangeOrderForm
        changeOrder={editingOrder}
        projects={projects}
        open={showForm}
        onClose={() => {
          setShowForm(false);
          setEditingOrder(null);
        }}
        onSaved={() => {
          queryClient.invalidateQueries({ queryKey: ["changeOrders"] });
          setShowForm(false);
          setEditingOrder(null);
        }}
      />

      <AlertDialog open={!!deleteOrder} onOpenChange={() => setDeleteOrder(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Change Order</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this change order? This action cannot
              be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>

          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-rose-600 hover:bg-rose-700"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
