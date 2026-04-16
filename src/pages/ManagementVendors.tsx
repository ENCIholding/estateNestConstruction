import { useMemo, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
  AlertTriangle,
  ExternalLink,
  Mail,
  Pencil,
  Phone,
  Plus,
  Search,
  ShieldCheck,
  Trash2,
} from "lucide-react";
import ManagementLayout from "@/components/management/ManagementLayout";
import ManagementVendorForm from "@/components/vendors/ManagementVendorForm";
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
import Badge from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Input from "@/components/ui/input";
import {
  deleteVendorFromWorkspace,
  loadWorkspaceVendors,
  saveVendorToWorkspace,
  type ManagementVendor,
} from "@/lib/managementWorkspace";

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
] as const;

function normalizeWhatsAppPhone(phone?: string | null) {
  if (!phone) {
    return "";
  }

  const digits = phone.replace(/\D/g, "");
  if (!digits) {
    return "";
  }

  return digits.startsWith("1") ? digits : `1${digits}`;
}

function formatDate(value?: string | null) {
  if (!value) {
    return "Not recorded";
  }

  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) {
    return "Invalid date";
  }

  return new Intl.DateTimeFormat("en-CA", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(parsed);
}

function getStatusClass(status?: string | null) {
  switch ((status || "").toLowerCase()) {
    case "preferred":
      return "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300";
    case "watchlist":
      return "bg-amber-500/10 text-amber-700 dark:text-amber-300";
    case "inactive":
      return "bg-slate-500/10 text-slate-700 dark:text-slate-300";
    default:
      return "bg-blue-500/10 text-blue-700 dark:text-blue-300";
  }
}

export default function ManagementVendors() {
  const queryClient = useQueryClient();
  const [workspaceRevision, setWorkspaceRevision] = useState(0);
  const [search, setSearch] = useState("");
  const [tradeFilter, setTradeFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [showForm, setShowForm] = useState(false);
  const [editingVendor, setEditingVendor] = useState<ManagementVendor | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<ManagementVendor | null>(null);

  const { data: vendors = [] } = useQuery({
    queryKey: ["management-vendors", workspaceRevision],
    queryFn: async () => loadWorkspaceVendors(),
  });

  const filteredVendors = useMemo(() => {
    const query = search.trim().toLowerCase();

    return vendors.filter((vendor) => {
      const matchesSearch =
        !query ||
        (vendor.company_name || "").toLowerCase().includes(query) ||
        (vendor.contact_person || "").toLowerCase().includes(query) ||
        (vendor.trade_type || "").toLowerCase().includes(query) ||
        (vendor.email || "").toLowerCase().includes(query);
      const matchesTrade =
        tradeFilter === "all" || vendor.trade_type === tradeFilter;
      const matchesStatus =
        statusFilter === "all" ||
        (vendor.status || "Active").toLowerCase() === statusFilter;

      return matchesSearch && matchesTrade && matchesStatus;
    });
  }, [search, statusFilter, tradeFilter, vendors]);

  const handleSave = async (vendor: ManagementVendor) => {
    saveVendorToWorkspace(vendor);
    setWorkspaceRevision((value) => value + 1);
    await queryClient.invalidateQueries({
      predicate: (query) =>
        Array.isArray(query.queryKey) &&
        typeof query.queryKey[0] === "string" &&
        query.queryKey[0].startsWith("management"),
    });
  };

  const handleDelete = async () => {
    if (!deleteTarget?.id) {
      return;
    }

    deleteVendorFromWorkspace(deleteTarget.id);
    setDeleteTarget(null);
    setWorkspaceRevision((value) => value + 1);
    await queryClient.invalidateQueries({
      predicate: (query) =>
        Array.isArray(query.queryKey) &&
        typeof query.queryKey[0] === "string" &&
        query.queryKey[0].startsWith("management"),
    });
  };

  return (
    <ManagementLayout currentPageName="vendors">
      <div className="space-y-6">
        <div className="dashboard-panel overflow-hidden p-8">
          <div className="absolute inset-y-0 right-0 w-44 bg-gradient-to-l from-enc-yellow/10 via-enc-orange/10 to-transparent" />
          <div className="relative flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.3em] text-enc-orange">
                Vendor Registry
              </p>
              <h1 className="mt-3 text-3xl font-bold text-foreground">Vendors</h1>
              <p className="mt-4 max-w-3xl text-sm leading-6 text-muted-foreground">
                Vendor records are now editable in your browser workspace on this device. This gives the team a working registry today without pretending a durable vendor backend already exists.
              </p>
            </div>

            <Button
              className="rounded-full bg-gradient-to-r from-enc-red via-enc-orange to-enc-yellow text-white shadow-glow"
              onClick={() => {
                setEditingVendor(null);
                setShowForm(true);
              }}
            >
              <Plus className="mr-2 h-4 w-4" />
              Add Record
            </Button>
          </div>
        </div>

        <Card className="dashboard-panel p-2">
          <CardHeader>
            <CardTitle className="text-xl text-foreground">Registry status</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm leading-6 text-muted-foreground">
            <p>
              Vendor records are stored in this browser workspace for now. They are operational for your current team device, but they are not yet shared across all devices until a server-backed vendor registry is added.
            </p>
            <div className="flex flex-wrap gap-2">
              <Badge className="rounded-full bg-enc-orange/10 text-enc-orange">
                Workspace Drafts
              </Badge>
              <Badge className="rounded-full bg-muted text-muted-foreground">
                Durable backend pending
              </Badge>
            </div>
          </CardContent>
        </Card>

        <Card className="dashboard-panel p-2">
          <CardHeader>
            <CardTitle className="text-xl text-foreground">Filter registry</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_220px_220px]">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                className="pl-10"
                placeholder="Search by vendor, contact, trade, or email"
              />
            </div>
            <select
              value={tradeFilter}
              onChange={(event) => setTradeFilter(event.target.value)}
              className="flex h-10 rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground"
            >
              <option value="all">All trades</option>
              {TRADE_TYPES.map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </select>
            <select
              value={statusFilter}
              onChange={(event) => setStatusFilter(event.target.value)}
              className="flex h-10 rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground"
            >
              <option value="all">All statuses</option>
              <option value="active">Active</option>
              <option value="preferred">Preferred</option>
              <option value="watchlist">Watchlist</option>
              <option value="inactive">Inactive</option>
            </select>
          </CardContent>
        </Card>

        {filteredVendors.length ? (
          <div className="grid gap-4">
            {filteredVendors.map((vendor) => {
              const whatsappPhone = normalizeWhatsAppPhone(vendor.phone);

              return (
                <Card key={vendor.id} className="dashboard-panel p-2">
                  <CardContent className="space-y-4 p-6">
                    <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                      <div className="space-y-3">
                        <div className="flex flex-wrap items-center gap-2">
                          <h2 className="text-xl font-semibold text-foreground">
                            {vendor.company_name || "Unnamed Vendor"}
                          </h2>
                          <Badge className={`rounded-full ${getStatusClass(vendor.status)}`}>
                            {vendor.status || "Active"}
                          </Badge>
                          <Badge className="rounded-full bg-enc-orange/10 text-enc-orange">
                            Workspace Draft
                          </Badge>
                        </div>

                        <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                          <span>{vendor.trade_type || "Trade not set"}</span>
                          <span>
                            Contact: {vendor.contact_person || "Not assigned"}
                          </span>
                          <span>
                            Insurance expiry: {formatDate(vendor.insurance_expiry_date)}
                          </span>
                        </div>

                        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
                          <div className="dashboard-item p-3">
                            <p className="text-sm font-medium text-foreground">Phone</p>
                            <p className="mt-2 text-sm text-muted-foreground">
                              {vendor.phone || "Not set"}
                            </p>
                          </div>
                          <div className="dashboard-item p-3">
                            <p className="text-sm font-medium text-foreground">Email</p>
                            <p className="mt-2 text-sm text-muted-foreground">
                              {vendor.email || "Not set"}
                            </p>
                          </div>
                          <div className="dashboard-item p-3">
                            <p className="text-sm font-medium text-foreground">Rating</p>
                            <p className="mt-2 text-sm text-muted-foreground">
                              {vendor.vendor_rating || "Not set"}
                            </p>
                          </div>
                          <div className="dashboard-item p-3">
                            <p className="text-sm font-medium text-foreground">Work again</p>
                            <p className="mt-2 text-sm text-muted-foreground">
                              {vendor.work_again === false ? "No" : "Yes"}
                            </p>
                          </div>
                        </div>

                        {vendor.notes || vendor.internal_notes ? (
                          <div className="grid gap-3 md:grid-cols-2">
                            <div className="dashboard-item p-3">
                              <p className="text-sm font-medium text-foreground">Notes</p>
                              <p className="mt-2 text-sm leading-6 text-muted-foreground">
                                {vendor.notes || "No notes added"}
                              </p>
                            </div>
                            <div className="dashboard-item p-3">
                              <p className="text-sm font-medium text-foreground">
                                Internal notes
                              </p>
                              <p className="mt-2 text-sm leading-6 text-muted-foreground">
                                {vendor.internal_notes || "No internal notes added"}
                              </p>
                            </div>
                          </div>
                        ) : null}
                      </div>

                      <div className="flex flex-wrap gap-2">
                        {vendor.email ? (
                          <Button asChild variant="outline" className="rounded-full">
                            <a href={`mailto:${vendor.email}`}>
                              <Mail className="mr-2 h-4 w-4" />
                              Email
                            </a>
                          </Button>
                        ) : null}
                        {whatsappPhone ? (
                          <Button asChild variant="outline" className="rounded-full">
                            <a
                              href={`https://wa.me/${whatsappPhone}`}
                              rel="noopener noreferrer"
                              target="_blank"
                            >
                              <Phone className="mr-2 h-4 w-4" />
                              WhatsApp
                            </a>
                          </Button>
                        ) : null}
                        {vendor.website ? (
                          <Button asChild variant="outline" className="rounded-full">
                            <a href={vendor.website} rel="noopener noreferrer" target="_blank">
                              <ExternalLink className="mr-2 h-4 w-4" />
                              Website
                            </a>
                          </Button>
                        ) : null}
                        <Button
                          variant="outline"
                          className="rounded-full"
                          onClick={() => {
                            setEditingVendor(vendor);
                            setShowForm(true);
                          }}
                        >
                          <Pencil className="mr-2 h-4 w-4" />
                          Edit
                        </Button>
                        <Button
                          variant="outline"
                          className="rounded-full text-rose-600 hover:text-rose-700"
                          onClick={() => setDeleteTarget(vendor)}
                        >
                          <Trash2 className="mr-2 h-4 w-4" />
                          Remove
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        ) : (
          <Card className="dashboard-panel p-2">
            <CardContent className="space-y-4 p-6">
              <div className="flex items-start gap-3">
                <AlertTriangle className="mt-0.5 h-5 w-5 text-enc-orange" />
                <div>
                  <p className="text-base font-semibold text-foreground">
                    No vendor records match the current view
                  </p>
                  <p className="mt-2 max-w-3xl text-sm leading-6 text-muted-foreground">
                    Add your first vendor record to start tracking trade partners, contacts, and status. This module is now usable even though the larger accounting workflows remain offline.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        <Card className="dashboard-panel p-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-xl text-foreground">
              <ShieldCheck className="h-5 w-5 text-enc-orange" />
              What still stays offline
            </CardTitle>
          </CardHeader>
          <CardContent className="text-sm leading-6 text-muted-foreground">
            Vendor bills, certificate uploads, approval workflows, and cross-device shared vendor history still need a durable backend before they should be treated as production recordkeeping.
          </CardContent>
        </Card>
      </div>

      <ManagementVendorForm
        open={showForm}
        vendor={editingVendor}
        onClose={() => {
          setShowForm(false);
          setEditingVendor(null);
        }}
        onSaved={() => {
          setShowForm(false);
          setEditingVendor(null);
        }}
        onSubmitRecord={handleSave}
      />

      <AlertDialog open={Boolean(deleteTarget)} onOpenChange={() => setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remove vendor record</AlertDialogTitle>
            <AlertDialogDescription>
              Remove "{deleteTarget?.company_name || "this vendor"}" from the current browser workspace registry?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-rose-600 hover:bg-rose-700"
              onClick={() => void handleDelete()}
            >
              Remove
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </ManagementLayout>
  );
}
