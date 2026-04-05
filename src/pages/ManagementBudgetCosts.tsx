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
  FileText,
  TrendingUp,
  TrendingDown,
} from "lucide-react";
import BudgetItemForm from "@/components/budget/BudgetItemForm";
import { format, isPast } from "date-fns";

type User = {
  id: string;
  app_role?: string;
};

type Project = {
  id: string;
  project_name?: string;
};

type Vendor = {
  id: string;
  company_name?: string;
};

type BudgetItem = {
  id: string;
  project_id?: string;
  vendor_id?: string;
  category_name?: string;
  description?: string;
  estimated_cost?: number;
  actual_cost?: number;
  invoice_status?: "Pending" | "Paid" | "Holdback" | string;
  payment_due_date?: string;
  invoice_file?: string;
};

const statusColors: Record<string, string> = {
  Pending: "bg-amber-50 text-amber-700 border-amber-200",
  Paid: "bg-emerald-50 text-emerald-700 border-emerald-200",
  Holdback: "bg-blue-50 text-blue-700 border-blue-200",
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

  return response.json();
}

export default function ManagementBudgetCosts() {
  const [search, setSearch] = useState("");
  const [projectFilter, setProjectFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [showForm, setShowForm] = useState(false);
  const [editingItem, setEditingItem] = useState<BudgetItem | null>(null);
  const [deleteItem, setDeleteItem] = useState<BudgetItem | null>(null);

  const queryClient = useQueryClient();

  const { data: sessionData } = useQuery({
    queryKey: ["management-session"],
    queryFn: () => fetchJson<{ user: User | null }>("/api/management/session"),
    retry: false,
  });

  const user = sessionData?.user || null;
  const userRole = user?.app_role || "Admin";
  const canEdit = userRole === "Admin" || userRole === "Accountant";

  const {
    data: budgetItems = [],
    isLoading,
  } = useQuery({
    queryKey: ["budgetItems"],
    queryFn: () => fetchJson<BudgetItem[]>("/api/management/budget-items"),
  });

  const { data: projects = [] } = useQuery({
    queryKey: ["projects"],
    queryFn: () => fetchJson<Project[]>("/api/management/projects"),
  });

  const { data: vendors = [] } = useQuery({
    queryKey: ["vendors"],
    queryFn: () => fetchJson<Vendor[]>("/api/management/vendors"),
  });

  const projectMap = useMemo(() => {
    return projects.reduce<Record<string, Project>>((acc, project) => {
      acc[project.id] = project;
      return acc;
    }, {});
  }, [projects]);

  const vendorMap = useMemo(() => {
    return vendors.reduce<Record<string, Vendor>>((acc, vendor) => {
      acc[vendor.id] = vendor;
      return acc;
    }, {});
  }, [vendors]);

  const handleDelete = async () => {
    if (!deleteItem?.id) return;

    try {
      await fetchJson(`/api/management/budget-items/${deleteItem.id}`, {
        method: "DELETE",
      });

      await queryClient.invalidateQueries({ queryKey: ["budgetItems"] });
      setDeleteItem(null);
    } catch (error) {
      console.error("Failed to delete cost item:", error);
      alert(error instanceof Error ? error.message : "Failed to delete cost item.");
    }
  };

  const filteredItems = useMemo(() => {
    const lowerSearch = search.toLowerCase();

    return budgetItems.filter((item) => {
      const matchesSearch =
        item.category_name?.toLowerCase().includes(lowerSearch) ||
        item.description?.toLowerCase().includes(lowerSearch);

      const matchesProject =
        projectFilter === "all" || item.project_id === projectFilter;

      const matchesStatus =
        statusFilter === "all" || item.invoice_status === statusFilter;

      return Boolean(matchesSearch) && matchesProject && matchesStatus;
    });
  }, [budgetItems, search, projectFilter, statusFilter]);

  const totalEstimated = filteredItems.reduce(
    (sum, item) => sum + (item.estimated_cost || 0),
    0
  );

  const totalActual = filteredItems.reduce(
    (sum, item) => sum + (item.actual_cost || 0),
    0
  );

  const totalVariance = totalActual - totalEstimated;

  const pendingAmount = filteredItems
    .filter((item) => item.invoice_status === "Pending")
    .reduce((sum, item) => sum + (item.actual_cost || 0), 0);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="h-8 w-8 animate-spin text-slate-400" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold text-slate-900">
            Budget & Costs
          </h1>
          <p className="text-slate-500 mt-1">
            {budgetItems.length} cost items tracked
          </p>
        </div>

        {canEdit && (
          <div className="flex gap-2">
            <Button
              onClick={() => {
                setEditingItem(null);
                setShowForm(true);
              }}
              className="bg-slate-900 hover:bg-slate-800"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Record
            </Button>
          </div>
        )}
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-4 border-0 shadow-sm">
          <p className="text-sm text-slate-500">Total Estimated</p>
          <p className="text-2xl font-bold text-slate-900">
            ${totalEstimated.toLocaleString()}
          </p>
        </Card>

        <Card className="p-4 border-0 shadow-sm">
          <p className="text-sm text-slate-500">Total Actual</p>
          <p className="text-2xl font-bold text-slate-900">
            ${totalActual.toLocaleString()}
          </p>
        </Card>

        <Card className="p-4 border-0 shadow-sm">
          <p className="text-sm text-slate-500">Variance</p>
          <p
            className={`text-2xl font-bold flex items-center gap-1 ${
              totalVariance > 0 ? "text-rose-600" : "text-emerald-600"
            }`}
          >
            {totalVariance > 0 ? (
              <TrendingUp className="h-5 w-5" />
            ) : (
              <TrendingDown className="h-5 w-5" />
            )}
            ${Math.abs(totalVariance).toLocaleString()}
          </p>
        </Card>

        <Card className="p-4 border-0 shadow-sm">
          <p className="text-sm text-slate-500">Pending Payment</p>
          <p className="text-2xl font-bold text-amber-600">
            ${pendingAmount.toLocaleString()}
          </p>
        </Card>
      </div>

      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <Input
            placeholder="Search costs..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10"
          />
        </div>

        <Select value={projectFilter} onValueChange={setProjectFilter}>
          <SelectTrigger className="w-full sm:w-48">
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
          <SelectTrigger className="w-full sm:w-40">
            <SelectValue placeholder="All Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="Pending">Pending</SelectItem>
            <SelectItem value="Paid">Paid</SelectItem>
            <SelectItem value="Holdback">Holdback</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Card className="border-0 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-slate-50">
                <TableHead>Category</TableHead>
                <TableHead>Project</TableHead>
                <TableHead>Vendor</TableHead>
                <TableHead className="text-right">Estimated</TableHead>
                <TableHead className="text-right">Actual</TableHead>
                <TableHead className="text-right">Variance</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Due Date</TableHead>
                <TableHead className="w-12"></TableHead>
              </TableRow>
            </TableHeader>

            <TableBody>
              {filteredItems.map((item) => {
                const project = item.project_id ? projectMap[item.project_id] : undefined;
                const vendor = item.vendor_id ? vendorMap[item.vendor_id] : undefined;
                const variance = (item.actual_cost || 0) - (item.estimated_cost || 0);

                const isOverdue =
                  !!item.payment_due_date &&
                  item.invoice_status === "Pending" &&
                  isPast(new Date(item.payment_due_date));

                return (
                  <TableRow key={item.id} className={isOverdue ? "bg-rose-50/50" : ""}>
                    <TableCell>
                      <div>
                        <p className="font-medium text-slate-900">
                          {item.category_name || "—"}
                        </p>
                        {item.description && (
                          <p className="text-xs text-slate-500 truncate max-w-[200px]">
                            {item.description}
                          </p>
                        )}
                      </div>
                    </TableCell>

                    <TableCell>
                      <span className="text-sm">{project?.project_name || "—"}</span>
                    </TableCell>

                    <TableCell>
                      <span className="text-sm">{vendor?.company_name || "—"}</span>
                    </TableCell>

                    <TableCell className="text-right font-medium">
                      ${item.estimated_cost?.toLocaleString() || 0}
                    </TableCell>

                    <TableCell className="text-right font-medium">
                      ${item.actual_cost?.toLocaleString() || 0}
                    </TableCell>

                    <TableCell
                      className={`text-right font-medium ${
                        variance > 0
                          ? "text-rose-600"
                          : variance < 0
                          ? "text-emerald-600"
                          : ""
                      }`}
                    >
                      {variance !== 0 && (variance > 0 ? "+" : "")}
                      ${variance.toLocaleString()}
                    </TableCell>

                    <TableCell>
                      <Badge
                        variant="outline"
                        className={
                          statusColors[item.invoice_status || ""] ||
                          "bg-slate-100 text-slate-700 border-slate-200"
                        }
                      >
                        {item.invoice_status || "—"}
                      </Badge>
                    </TableCell>

                    <TableCell>
                      <span
                        className={`text-sm ${
                          isOverdue ? "text-rose-600 font-medium" : "text-slate-500"
                        }`}
                      >
                        {item.payment_due_date
                          ? format(new Date(item.payment_due_date), "MMM d, yyyy")
                          : "—"}
                      </span>
                    </TableCell>

                    <TableCell>
                      <div className="flex items-center gap-1">
                        {item.invoice_file && (
                          <a
                            href={item.invoice_file}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            <Button variant="ghost" size="icon" className="h-8 w-8">
                              <FileText className="h-4 w-4" />
                            </Button>
                          </a>
                        )}

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
                                  setEditingItem(item);
                                  setShowForm(true);
                                }}
                              >
                                <Pencil className="h-4 w-4 mr-2" />
                                Edit
                              </DropdownMenuItem>

                              <DropdownMenuItem
                                onClick={() => setDeleteItem(item)}
                                className="text-rose-600"
                              >
                                <Trash2 className="h-4 w-4 mr-2" />
                                Delete
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      </Card>

      {filteredItems.length === 0 && (
        <div className="text-center py-12">
          <p className="text-slate-500">No cost items found</p>
        </div>
      )}

      {showForm && (
        <BudgetItemForm
          item={editingItem}
          projects={projects}
          vendors={vendors}
          open={showForm}
          onClose={() => {
            setShowForm(false);
            setEditingItem(null);
          }}
          onSaved={() => {
            queryClient.invalidateQueries({ queryKey: ["budgetItems"] });
          }}
        />
      )}

      <AlertDialog open={!!deleteItem} onOpenChange={() => setDeleteItem(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Cost Item</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this cost item? This action cannot be undone.
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
