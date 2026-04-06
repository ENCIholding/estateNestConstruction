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
} from "lucide-react";
import ManagementVendorBillForm from "@/components/invoices/ManagementVendorBillForm";
import { format } from "date-fns";

type User = {
  id: string;
  app_role?: string;
};

type Vendor = {
  id: string;
  company_name?: string;
};

type Project = {
  id: string;
  project_name?: string;
};

type VendorBill = {
  id: string;
  vendor_id?: string;
  project_id?: string;
  invoice_amount?: number;
  due_date?: string;
  invoice_year?: string | number;
  status?: "Received" | "Verified" | "Paid" | string;
  invoice_file?: string;
};

const statusColors: Record<string, string> = {
  Received: "bg-amber-50 text-amber-700",
  Verified: "bg-blue-50 text-blue-700",
  Paid: "bg-emerald-50 text-emerald-700",
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

export default function ManagementVendorBills() {
  const [search, setSearch] = useState("");
  const [vendorFilter, setVendorFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [showForm, setShowForm] = useState(false);
  const [editingBill, setEditingBill] = useState<VendorBill | null>(null);
  const [deleteBill, setDeleteBill] = useState<VendorBill | null>(null);

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
    data: bills = [],
    isLoading,
  } = useQuery({
    queryKey: ["vendorBills"],
    queryFn: () => fetchJson<VendorBill[]>("/api/management/vendor-bills"),
  });

  const { data: vendors = [] } = useQuery({
    queryKey: ["vendors"],
    queryFn: () => fetchJson<Vendor[]>("/api/management/vendors"),
  });

  const { data: projects = [] } = useQuery({
    queryKey: ["projects"],
    queryFn: () => fetchJson<Project[]>("/api/management/projects"),
  });

  const vendorMap = useMemo(() => {
    return vendors.reduce<Record<string, Vendor>>((acc, vendor) => {
      acc[vendor.id] = vendor;
      return acc;
    }, {});
  }, [vendors]);

  const projectMap = useMemo(() => {
    return projects.reduce<Record<string, Project>>((acc, project) => {
      acc[project.id] = project;
      return acc;
    }, {});
  }, [projects]);

  const handleDelete = async () => {
    if (!deleteBill?.id) return;

    try {
      await fetchJson(`/api/management/vendor-bills/${deleteBill.id}`, {
        method: "DELETE",
      });

      await queryClient.invalidateQueries({ queryKey: ["vendorBills"] });
      setDeleteBill(null);
    } catch (error) {
      console.error("Failed to delete bill:", error);
      alert(error instanceof Error ? error.message : "Failed to delete bill.");
    }
  };

  const filteredBills = useMemo(() => {
    const lowerSearch = search.toLowerCase().trim();

    return bills.filter((bill) => {
      const vendor = bill.vendor_id ? vendorMap[bill.vendor_id] : undefined;
      const project = bill.project_id ? projectMap[bill.project_id] : undefined;

      const matchesSearch =
        lowerSearch === ""
          ? true
          : !!vendor?.company_name?.toLowerCase().includes(lowerSearch) ||
            !!project?.project_name?.toLowerCase().includes(lowerSearch);

      const matchesVendor = vendorFilter === "all" || bill.vendor_id === vendorFilter;
      const matchesStatus = statusFilter === "all" || bill.status === statusFilter;

      return matchesSearch && matchesVendor && matchesStatus;
    });
  }, [bills, vendorMap, projectMap, search, vendorFilter, statusFilter]);

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
            Vendor Bills
          </h1>
          <p className="text-slate-500 mt-1">{bills.length} bills received</p>
        </div>

        {canEdit && (
          <Button
            onClick={() => {
              setEditingBill(null);
              setShowForm(true);
            }}
            className="bg-slate-900 hover:bg-slate-800"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Record
          </Button>
        )}
      </div>

      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <Input
            placeholder="Search bills..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10"
          />
        </div>

        <Select value={vendorFilter} onValueChange={setVendorFilter}>
          <SelectTrigger className="w-full sm:w-48">
            <SelectValue placeholder="All Vendors" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Vendors</SelectItem>
            {vendors.map((vendor) => (
              <SelectItem key={vendor.id} value={vendor.id}>
                {vendor.company_name || "Unnamed Vendor"}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-full sm:w-36">
            <SelectValue placeholder="All Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="Received">Received</SelectItem>
            <SelectItem value="Verified">Verified</SelectItem>
            <SelectItem value="Paid">Paid</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Card className="border-0 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-slate-50">
                <TableHead>Vendor</TableHead>
                <TableHead>Project</TableHead>
                <TableHead className="text-right">Amount</TableHead>
                <TableHead>Due Date</TableHead>
                <TableHead>Year</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="w-12"></TableHead>
              </TableRow>
            </TableHeader>

            <TableBody>
              {filteredBills.map((bill) => {
                const vendor = bill.vendor_id ? vendorMap[bill.vendor_id] : undefined;
                const project = bill.project_id ? projectMap[bill.project_id] : undefined;

                return (
                  <TableRow key={bill.id}>
                    <TableCell>{vendor?.company_name || "—"}</TableCell>
                    <TableCell>{project?.project_name || "—"}</TableCell>
                    <TableCell className="text-right font-semibold">
                      ${bill.invoice_amount?.toLocaleString() || 0}
                    </TableCell>
                    <TableCell>
                      {bill.due_date
                        ? format(new Date(bill.due_date), "MMM d, yyyy")
                        : "—"}
                    </TableCell>
                    <TableCell>{bill.invoice_year || "—"}</TableCell>
                    <TableCell>
                      <Badge
                        className={
                          statusColors[bill.status || ""] ||
                          "bg-slate-100 text-slate-700"
                        }
                      >
                        {bill.status || "—"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        {bill.invoice_file && (
                          <a
                            href={bill.invoice_file}
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
                                  setEditingBill(bill);
                                  setShowForm(true);
                                }}
                              >
                                <Pencil className="h-4 w-4 mr-2" />
                                Edit
                              </DropdownMenuItem>

                              <DropdownMenuItem
                                onClick={() => setDeleteBill(bill)}
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

      {filteredBills.length === 0 && (
        <div className="text-center py-12 text-slate-500">No bills found</div>
      )}

      <ManagementVendorBillForm
        bill={editingBill}
        vendors={vendors}
        projects={projects}
        open={showForm}
        onClose={() => {
          setShowForm(false);
          setEditingBill(null);
        }}
        onSaved={() => {
          queryClient.invalidateQueries({ queryKey: ["vendorBills"] });
          setShowForm(false);
          setEditingBill(null);
        }}
      />

      <AlertDialog open={!!deleteBill} onOpenChange={() => setDeleteBill(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Bill</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this bill? This action cannot be undone.
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
