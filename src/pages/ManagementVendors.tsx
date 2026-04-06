import React, { useMemo, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Link } from "react-router-dom";
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
  Phone,
  Mail,
  AlertTriangle,
  ExternalLink,
  Eye,
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

  const queryClient = useQueryClient();

  const { data: sessionData } = useQuery({
    queryKey: ["management-session"],
    queryFn: () => fetchJson<{ user: User | null }>("/api/management/session"),
    retry: false,
  });

  const user = sessionData?.user || null;
  const userRole = user?.app_role || "Admin";
  const canEdit = userRole === "Admin";

  const {
    data: vendors = [],
    isLoading,
  } = useQuery({
    queryKey: ["vendors"],
    queryFn: () => fetchJson<Vendor[]>("/api/management/vendors"),
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

    return vendors.filter((vendor) => {
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
            Vendors & Trades
          </h1>
          <p className="text-slate-500 mt-1">{vendors.length} vendors registered</p>
        </div>

        {canEdit && (
          <Button
            onClick={() => {
              setEditingVendor(null);
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
            placeholder="Search vendors..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10"
          />
        </div>

        <Select value={tradeFilter} onValueChange={setTradeFilter}>
          <SelectTrigger className="w-full sm:w-48">
            <SelectValue placeholder="All Trades" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Trades</SelectItem>
            {TRADE_TYPES.map((type) => (
              <SelectItem key={type} value={type}>
                {type}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <Card className="border-0 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-slate-50">
                <TableHead>Company</TableHead>
                <TableHead>Trade</TableHead>
                <TableHead>Contact</TableHead>
                <TableHead>Rating</TableHead>
                <TableHead>Insurance</TableHead>
                <TableHead className="w-12"></TableHead>
              </TableRow>
            </TableHeader>

            <TableBody>
              {filteredVendors.map((vendor) => {
                const insuranceStatus = getInsuranceStatus(vendor.insurance_expiry_date);
                const whatsappPhone = normalizeWhatsAppPhone(vendor.phone);

                return (
                  <TableRow key={vendor.id}>
                    <TableCell>
                      <div>
                        <p className="font-medium text-slate-900">
                          {vendor.company_name || "—"}
                        </p>
                        {vendor.gst_number && (
                          <p className="text-xs text-slate-500">
                            GST: {vendor.gst_number}
                          </p>
                        )}
                      </div>
                    </TableCell>

                    <TableCell>
                      <Badge variant="outline">{vendor.trade_type || "—"}</Badge>
                    </TableCell>

                    <TableCell>
                      <div className="space-y-1">
                        {vendor.contact_person && (
                          <p className="text-sm">{vendor.contact_person}</p>
                        )}

                        {vendor.phone && whatsappPhone && (
                          <a
                            href={`https://wa.me/${whatsappPhone}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-sm text-slate-500 hover:text-emerald-600 flex items-center gap-1"
                          >
                            <Phone className="h-3 w-3" />
                            {vendor.phone}
                          </a>
                        )}

                        {vendor.email && (
                          <a
                            href={`mailto:${vendor.email}`}
                            className="text-sm text-slate-500 hover:text-blue-600 flex items-center gap-1"
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
                            className="text-sm text-slate-500 hover:text-blue-600 flex items-center gap-1"
                          >
                            <ExternalLink className="h-3 w-3" />
                            Website
                          </a>
                        )}
                      </div>
                    </TableCell>

                    <TableCell>
                      {vendor.vendor_rating ? (
                        <Badge
                          variant="outline"
                          className={
                            vendor.vendor_rating === "Excellent"
                              ? "bg-emerald-50 text-emerald-700"
                              : vendor.vendor_rating === "Good"
                              ? "bg-blue-50 text-blue-700"
                              : vendor.vendor_rating === "Average"
                              ? "bg-amber-50 text-amber-700"
                              : "bg-slate-100 text-slate-700"
                          }
                        >
                          {vendor.vendor_rating}
                        </Badge>
                      ) : (
                        <span className="text-sm text-slate-400">—</span>
                      )}
                    </TableCell>

                    <TableCell>
                      {vendor.insurance_expiry_date ? (
                        <Badge className={insuranceStatus?.color}>
                          {insuranceStatus?.status === "expired" && (
                            <AlertTriangle className="h-3 w-3 mr-1" />
                          )}
                          {format(new Date(vendor.insurance_expiry_date), "MMM d, yyyy")}
                        </Badge>
                      ) : (
                        <span className="text-sm text-slate-400">—</span>
                      )}
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
                            <DropdownMenuItem asChild>
                              <Link to={`/management/vendor-details?id=${vendor.id}`}>
                                <Eye className="h-4 w-4 mr-2" />
                                View Details
                              </Link>
                            </DropdownMenuItem>

                            <DropdownMenuItem
                              onClick={() => {
                                setEditingVendor(vendor);
                                setShowForm(true);
                              }}
                            >
                              <Pencil className="h-4 w-4 mr-2" />
                              Edit
                            </DropdownMenuItem>

                            <DropdownMenuItem
                              onClick={() => setDeleteVendor(vendor)}
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

      {filteredVendors.length === 0 && (
        <div className="text-center py-12">
          <p className="text-slate-500">No vendors found</p>
        </div>
      )}

      <ManagementVendorForm
        vendor={editingVendor}
        open={showForm}
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

      <AlertDialog open={!!deleteVendor} onOpenChange={() => setDeleteVendor(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Vendor</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{deleteVendor?.company_name}"? This
              action cannot be undone.
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
