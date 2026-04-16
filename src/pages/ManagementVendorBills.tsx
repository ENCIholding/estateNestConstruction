import React, { useMemo, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
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
  FileText,
} from "lucide-react";
import ManagementVendorBillForm from "@/components/invoices/ManagementVendorBillForm";
import { format } from "date-fns";

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

  const { data: sessionData } = useQuery<{ user?: { app_role?: string } } | null>({
    queryKey: ["management-session"],
    queryFn: () => fetchJson<{ user?: { app_role?: string } }>("/api/management/session"),
    retry: false,
  });

  const user = sessionData?.user || null;
  const userRole = user?.app_role || "Admin";
  const canEdit = userRole === "Admin" || userRole === "Accountant";

  const { data: bills = [], isLoading } = useQuery<VendorBill[]>({
    queryKey: ["vendorBills"],
    queryFn: () => fetchJson("/api/management/vendor-bills"),
  });

  const { data: vendors = [] } = useQuery<Vendor[]>({
    queryKey: ["vendors"],
    queryFn: () => fetchJson("/api/management/vendors"),
  });

  const { data: projects = [] } = useQuery<Project[]>({
    queryKey: ["projects"],
    queryFn: () => fetchJson("/api/management/projects"),
  });

  const vendorMap = useMemo(() => {
    return vendors.reduce<Record<string, Vendor>>((acc, vendor: Vendor) => {
      acc[vendor.id] = vendor;
      return acc;
    }, {});
  }, [vendors]);

  const projectMap = useMemo(() => {
    return projects.reduce<Record<string, Project>>((acc, project: Project) => {
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

    return bills.filter((bill: VendorBill) => {
      const vendor = bill.vendor_id ? vendorMap[bill.vendor_id] : undefined;
      const project = bill.project_id ? projectMap[bill.project_id] : undefined;

      const matchesSearch =
        lowerSearch === ""
          ? true
          : !!vendor?.company_name?.toLowerCase().includes(lowerSearch) ||
            !!project?.project_name?.toLowerCase().includes(lowerSearch);

      const matchesVendor =
        vendorFilter === "all" || bill.vendor_id === vendorFilter;

      const matchesStatus =
        statusFilter === "all" || bill.status === statusFilter;

      return matchesSearch && matchesVendor && matchesStatus;
    });
  }, [bills, vendorMap, projectMap, search, vendorFilter, statusFilter]);

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
          <h1 className="text-3xl font-bold mb-2">Vendor Bills</h1>
          <p className="text-slate-600">{bills.length} bills received</p>
        </div>

        {canEdit && (
          <Button
            onClick={() => {
              setEditingBill(null);
              setShowForm(true);
            }}
            className="bg-slate-900 hover:bg-slate-800"
          >
            <Plus className="mr-2 h-4 w-4" />
            Add Record
          </Button>
        )}
      </div>

      <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-center">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
          <Input
            placeholder="Search bills..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10"
          />
        </div>

        <div className="flex gap-2">
          <span className="text-sm font-medium text-slate-600 py-2">
            Vendor:
          </span>
          <select
            value={vendorFilter}
            onChange={(e) => setVendorFilter(e.target.value)}
            className="px-3 py-2 border border-slate-300 rounded-md text-sm"
          >
            <option value="all">All Vendors</option>
            {vendors.map((vendor: Vendor) => (
              <option key={vendor.id} value={vendor.id}>
                {vendor.company_name || "Unnamed Vendor"}
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
            <option value="Received">Received</option>
            <option value="Verified">Verified</option>
            <option value="Paid">Paid</option>
          </select>
        </div>
      </div>

      <div className="grid gap-4">
        {filteredBills.map((bill: VendorBill) => {
          const vendor = bill.vendor_id ? vendorMap[bill.vendor_id] : undefined;
          const project = bill.project_id
            ? projectMap[bill.project_id]
            : undefined;

          return (
            <Card key={bill.id}>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between gap-4">
                  <div className="flex-1">
                    <p className="font-semibold">
                      {vendor?.company_name || "—"}
                    </p>
                    <p className="text-sm text-slate-600 mb-2">
                      {project?.project_name || "—"}
                    </p>
                    <div className="flex gap-4 text-sm mb-3">
                      <span>
                        ${bill.invoice_amount?.toLocaleString() || 0}
                      </span>
                      {bill.due_date && (
                        <span>
                          Due: {format(new Date(bill.due_date), "MMM d, yyyy")}
                        </span>
                      )}
                      <span>Year: {bill.invoice_year || "—"}</span>
                    </div>
                    <div
                      className={`inline-block px-2 py-1 rounded text-sm ${
                        statusColors[bill.status || ""] || ""
                      }`}
                    >
                      {bill.status || "—"}
                    </div>
                  </div>

                  <div className="flex gap-2">
                    {bill.invoice_file && (
                      <a
                        href={bill.invoice_file}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:text-blue-800"
                      >
                        <FileText className="h-5 w-5" />
                      </a>
                    )}

                    {canEdit && (
                      <>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            setEditingBill(bill);
                            setShowForm(true);
                          }}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          className="text-rose-600 hover:text-rose-700"
                          onClick={() => setDeleteBill(bill)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {filteredBills.length === 0 && (
        <div className="text-center py-12">
          <p className="text-slate-600">No bills found</p>
        </div>
      )}

      <ManagementVendorBillForm
        open={showForm}
        bill={editingBill}
        vendors={vendors}
        projects={projects}
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
              Are you sure you want to delete this bill? This action cannot be
              undone.
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
