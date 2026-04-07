import React, { useMemo, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Link } from "react-router-dom";
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
  Phone,
  Mail,
  AlertTriangle,
  ExternalLink,
} from "lucide-react";
import ManagementVendorForm, {
  type ManagementVendor as Vendor,
} from "@/components/vendors/ManagementVendorForm";
import { format, isPast, addDays } from "date-fns";

type User = {
  id: string;
  app_role?: string;
};

const TRADE_TYPES = [
  "Architect",
  "Engineer",
  "Excavation",
  "Foundation",
  "Framing",
  "Electrical",
  "Plumbing",
  "HVAC",
  "Insulation",
  "Drywall",
  "Painting",
  "Flooring",
  "Cabinets",
  "Countertops",
  "Finishing",
  "Roofing",
  "Siding",
  "Windows & Doors",
  "Landscaping",
  "Concrete",
  "Masonry",
  "General Labour",
  "Other",
];

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

function normalizeWhatsAppPhone(phone?: string) {
  if (!phone) return "";
  const digits = phone.replace(/\D/g, "");
  if (!digits) return "";
  return digits.startsWith("1") ? digits : `1${digits}`;
}

export default function ManagementVendors() {
  const [search, setSearch] = useState("");
  const [tradeFilter, setTradeFilter] = useState("all");
  const [showForm, setShowForm] = useState(false);
  const [editingVendor, setEditingVendor] = useState<Vendor | null>(null);
  const [deleteVendor, setDeleteVendor] = useState<Vendor | null>(null);
  const [expandedVendor, setExpandedVendor] = useState<string | null>(null); // State for expanding vendor details

  const queryClient = useQueryClient();

  const { data: sessionData } = useQuery({
    queryKey: ["management-session"],
    queryFn: () => fetchJson("/api/management/session"),
    retry: false,
  });

  const user = sessionData?.user || null;
  const userRole = user?.app_role || "Admin";
  const canEdit = userRole === "Admin";

  const { data: vendors = [], isLoading } = useQuery({
    queryKey: ["vendors"],
    queryFn: () => fetchJson("/api/management/vendors"),
  });

  const handleDelete = async () => {
    if (!deleteVendor?.id) return;

    try {
      await fetchJson(`/api/management/vendors/${deleteVendor.id}`, {
        method: "DELETE",
      });

      await queryClient.invalidateQueries({ queryKey: ["vendors"] });
      setDeleteVendor(null);
    } catch (error) {
      console.error("Failed to delete vendor:", error);
      alert(error instanceof Error ? error.message : "Failed to delete vendor.");
    }
  };

  const filteredVendors = useMemo(() => {
    const lowerSearch = search.toLowerCase().trim();

    return vendors.filter((vendor: Vendor) => {
      const matchesSearch =
        lowerSearch === ""
          ? true
          : vendor.company_name?.toLowerCase().includes(lowerSearch) ||
            vendor.contact_person?.toLowerCase().includes(lowerSearch) ||
            vendor.trade_type?.toLowerCase().includes(lowerSearch);

      const matchesTrade =
        tradeFilter === "all" || vendor.trade_type === tradeFilter;

      return Boolean(matchesSearch) && matchesTrade;
    });
  }, [vendors, search, tradeFilter]);

  const getInsuranceStatus = (expiryDate?: string) => {
    if (!expiryDate) return null;

    const expiry = new Date(expiryDate);

    if (isPast(expiry)) {
      return {
        status: "expired",
        color: "bg-rose-50 text-rose-700",
      };
    }

    if (isPast(addDays(expiry, -30))) {
      return {
        status: "expiring",
        color: "bg-amber-50 text-amber-700",
      };
    }

    return {
      status: "valid",
      color: "bg-emerald-50 text-emerald-700",
    };
  };

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
          <h1 className="text-3xl font-bold mb-2">Vendors & Trades</h1>
          <p className="text-slate-600">{vendors.length} vendors registered</p>
        </div>

        {canEdit && (
          <Button
            onClick={() => {
              setEditingVendor(null);
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
            placeholder="Search vendors..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10"
          />
        </div>

        <div className="flex gap-2">
          <span className="text-sm font-medium text-slate-600 py-2">
            Trade:
          </span>
          <select
            value={tradeFilter}
            onChange={(e) => setTradeFilter(e.target.value)}
            className="px-3 py-2 border border-slate-300 rounded-md text-sm"
          >
            <option value="all">All Trades</option>
            {TRADE_TYPES.map((type) => (
              <option key={type} value={type}>
                {type}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid gap-4">
        {filteredVendors.map((vendor: Vendor) => {
          const insuranceStatus = getInsuranceStatus(
            vendor.insurance_expiry_date
          );
          const whatsappPhone = normalizeWhatsAppPhone(vendor.phone);
          const isExpanded = expandedVendor === vendor.id;

          return (
            <Card key={vendor.id}>
              <CardContent className="pt-6">
                <div className="flex items-start justify-between gap-4">
                  <div
                    className="flex-1 cursor-pointer"
                    onClick={() =>
                      setExpandedVendor(isExpanded ? null : vendor.id)
                    }
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="font-semibold text-lg">
                        {vendor.company_name || "—"}
                      </h3>
                      {vendor.gst_number && (
                        <span className="text-xs text-slate-600">
                          GST: {vendor.gst_number}
                        </span>
                      )}
                    </div>

                    <p className="text-sm text-slate-600 mb-3">
                      {vendor.trade_type || "—"}
                    </p>

                    {isExpanded && (
                      <div className="space-y-2 mb-4">
                        {vendor.contact_person && (
                          <p className="text-sm">{vendor.contact_person}</p>
                        )}

                        {vendor.phone && whatsappPhone && (
                          <a
                            href={`https://wa.me/${whatsappPhone}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-sm text-blue-600 hover:underline flex items-center gap-1"
                          >
                            <Phone className="h-3 w-3" />
                            {vendor.phone}
                          </a>
                        )}

                        {vendor.email && (
                          <a
                            href={`mailto:${vendor.email}`}
                            className="text-sm text-blue-600 hover:underline flex items-center gap-1"
                          >
                            <Mail className="h-3 w-3" />
                            {vendor.email}
                          </a>
                        )}

                        {vendor.website && (
                          <a
                            href={vendor.website}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-sm text-blue-600 hover:underline flex items-center gap-1"
                          >
                            <ExternalLink className="h-3 w-3" />
                            Website
                          </a>
                        )}
                      </div>
                    )}

                    {vendor.vendor_rating && (
                      <span className="inline-block px-2 py-1 bg-blue-50 text-blue-700 rounded text-sm mb-3">
                        Rating: {vendor.vendor_rating}
                      </span>
                    )}

                    {vendor.insurance_expiry_date && (
                      <span
                        className={`inline-block px-2 py-1 rounded text-sm ml-2 ${
                          insuranceStatus?.color || ""
                        }`}
                      >
                        {insuranceStatus?.status === "expired" && (
                          <AlertTriangle className="inline mr-1 h-3 w-3" />
                        )}
                        Insurance:{" "}
                        {format(
                          new Date(vendor.insurance_expiry_date),
                          "MMM d, yyyy"
                        )}
                      </span>
                    )}
                  </div>

                  {canEdit && (
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          setEditingVendor(vendor);
                          setShowForm(true);
                        }}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        className="text-rose-600 hover:text-rose-700"
                        onClick={() => setDeleteVendor(vendor)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {filteredVendors.length === 0 && (
        <div className="text-center py-12">
          <p className="text-slate-600">No vendors found</p>
        </div>
      )}

      <ManagementVendorForm
        open={showForm}
        vendor={editingVendor}
        onClose={() => {
          setShowForm(false);
          setEditingVendor(null);
        }}
        onSaved={() => {
          queryClient.invalidateQueries({ queryKey: ["vendors"] });
          setShowForm(false);
          setEditingVendor(null);
        }}
      />

      <AlertDialog
        open={!!deleteVendor}
        onOpenChange={() => setDeleteVendor(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Vendor</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{deleteVendor?.company_name}"?
              This action cannot be undone.
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
