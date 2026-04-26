import { useMemo, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
  Building2,
  Download,
  type LucideIcon,
  Pencil,
  Plus,
  Search,
  ShieldAlert,
  Trash2,
  Users2,
} from "lucide-react";
import ManagementLayout from "@/components/management/ManagementLayout";
import MasterRecordForm from "@/components/master-database/MasterRecordForm";
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
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { fetchManagementJson } from "@/lib/managementData";
import {
  deleteMasterDatabaseRecord,
  loadMasterDatabaseRecords,
  saveMasterDatabaseRecord,
  type BuildOsMasterRecord,
} from "@/lib/buildosShared";
import { buildVendorMemorySnapshot } from "@/lib/vendorMemory";

type SessionPayload = {
  user?: {
    app_role?: string;
    permissions?: string[];
  };
};

function downloadCsv(filename: string, content: string) {
  const blob = new Blob([content], { type: "text/csv;charset=utf-8" });
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.click();
  window.URL.revokeObjectURL(url);
}

function buildMasterDatabaseCsv(records: BuildOsMasterRecord[]) {
  const headers = [
    "Type",
    "Company",
    "Person",
    "Role",
    "Email",
    "Phone",
    "Status",
    "Linked Projects",
    "Tags",
    "Work Again",
  ];

  const rows = records.map((record) => [
    record.type,
    record.companyName || "",
    record.personName || "",
    record.role || "",
    record.email || "",
    record.phone || "",
    record.status,
    record.linkedProjectIds.join(" | "),
    record.tags.join(" | "),
    record.workAgain || "",
  ]);

  const escapeCell = (value: string) =>
    /[",\n]/.test(value) ? `"${value.replace(/"/g, '""')}"` : value;

  return [headers, ...rows]
    .map((row) => row.map((cell) => escapeCell(String(cell || ""))).join(","))
    .join("\n");
}

function getViewMatch(view: string, record: BuildOsMasterRecord) {
  if (view === "all") return true;
  if (view === "vendors") return record.type === "Vendor (Trade)";
  if (view === "clients") return record.type === "Stakeholder (Client)" || record.type === "Buyer";
  if (view === "realtors") return record.type === "Realtor";
  if (view === "lawyers") return record.type === "Lawyer";
  return record.type === view;
}

function formatScore(value: number | null) {
  return value === null ? "Not scored" : `${value.toFixed(1)} / 5`;
}

export default function ManagementMasterDatabase() {
  const queryClient = useQueryClient();
  const [view, setView] = useState("all");
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [showForm, setShowForm] = useState(false);
  const [editingRecord, setEditingRecord] = useState<BuildOsMasterRecord | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<BuildOsMasterRecord | null>(null);

  const { data: session } = useQuery({
    queryKey: ["management-session"],
    queryFn: () => fetchManagementJson<SessionPayload>("/api/management/session"),
    retry: false,
  });

  const { data: records = [] } = useQuery({
    queryKey: ["buildos-master-database"],
    queryFn: async () => loadMasterDatabaseRecords(),
  });

  const canSeeRestrictedNotes =
    session?.user?.permissions?.includes("buildos:restricted-notes:read") ||
    (session?.user?.app_role || "Admin") === "Admin";

  const filteredRecords = useMemo(() => {
    const query = search.trim().toLowerCase();

    return records.filter((record) => {
      const matchesView = getViewMatch(view, record);
      const matchesStatus = statusFilter === "all" || record.status === statusFilter;
      const matchesSearch =
        !query ||
        record.type.toLowerCase().includes(query) ||
        (record.companyName || "").toLowerCase().includes(query) ||
        (record.personName || "").toLowerCase().includes(query) ||
        (record.role || "").toLowerCase().includes(query) ||
        (record.email || "").toLowerCase().includes(query) ||
        (record.tradeCategory || "").toLowerCase().includes(query) ||
        record.tags.some((tag) => tag.toLowerCase().includes(query));

      return matchesView && matchesStatus && matchesSearch;
    });
  }, [records, search, statusFilter, view]);

  const counts = useMemo(
    () => ({
      total: records.length,
      vendors: records.filter((record) => record.type === "Vendor (Trade)").length,
      clients: records.filter((record) =>
        ["Stakeholder (Client)", "Buyer"].includes(record.type)
      ).length,
      realtors: records.filter((record) => record.type === "Realtor").length,
      lawyers: records.filter((record) => record.type === "Lawyer").length,
    }),
    [records]
  );
  const vendorMemory = useMemo(() => buildVendorMemorySnapshot(records), [records]);

  const summaryCards: Array<{ label: string; count: number; icon: LucideIcon }> = [
    { label: "Total Records", count: counts.total, icon: Users2 },
    { label: "Vendors (Trades)", count: counts.vendors, icon: Building2 },
    { label: "Stakeholders", count: counts.clients, icon: Users2 },
    { label: "Realtors", count: counts.realtors, icon: Users2 },
    { label: "Lawyers", count: counts.lawyers, icon: ShieldAlert },
  ];

  const handleSave = async (record: Partial<BuildOsMasterRecord>) => {
    await saveMasterDatabaseRecord(record);
    await queryClient.invalidateQueries({
      predicate: (query) =>
        Array.isArray(query.queryKey) &&
        typeof query.queryKey[0] === "string" &&
        (query.queryKey[0].startsWith("buildos") || query.queryKey[0].startsWith("management")),
    });
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    await deleteMasterDatabaseRecord(deleteTarget.id);
    setDeleteTarget(null);
    await queryClient.invalidateQueries({
      predicate: (query) =>
        Array.isArray(query.queryKey) &&
        typeof query.queryKey[0] === "string" &&
        (query.queryKey[0].startsWith("buildos") || query.queryKey[0].startsWith("management")),
    });
  };

  return (
    <ManagementLayout currentPageName="master-database">
      <div className="space-y-6">
        <div className="dashboard-panel overflow-hidden p-8">
          <div className="absolute inset-y-0 right-0 w-44 bg-gradient-to-l from-enc-yellow/10 via-enc-orange/10 to-transparent" />
          <div className="relative flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.3em] text-enc-orange">
                ENCI BuildOS Core Brain
              </p>
              <h1 className="mt-3 text-3xl font-bold text-foreground">Master Database</h1>
              <p className="mt-4 max-w-4xl text-sm leading-6 text-muted-foreground">
                This is the single source of truth for vendors, stakeholders, realtors, lawyers, lenders, consultants, and internal relationships. Operational views like Vendors (Trades) should filter from here instead of maintaining disconnected records.
              </p>
            </div>

            <div className="flex flex-wrap gap-2">
              <Button
                variant="outline"
                className="rounded-full"
                onClick={() =>
                  downloadCsv(
                    "enci-buildos-master-database.csv",
                    buildMasterDatabaseCsv(filteredRecords)
                  )
                }
              >
                <Download className="mr-2 h-4 w-4" />
                Export CSV
              </Button>
              <Button
                className="rounded-full bg-gradient-to-r from-enc-red via-enc-orange to-enc-yellow text-white shadow-glow"
                onClick={() => {
                  setEditingRecord(null);
                  setShowForm(true);
                }}
              >
                <Plus className="mr-2 h-4 w-4" />
                Add Record
              </Button>
            </div>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
          {summaryCards.map(({ label, count, icon: Icon }) => (
            <Card key={label} className="dashboard-panel p-2">
              <CardContent className="p-5">
                <p className="text-sm font-medium text-muted-foreground">{label}</p>
                <div className="mt-3 flex items-center gap-3">
                  <div className="dashboard-icon h-11 w-11">
                    <Icon className="h-5 w-5 text-white" />
                  </div>
                  <p className="text-3xl font-semibold text-foreground">{count}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <Card className="dashboard-panel p-2">
          <CardHeader>
            <CardTitle className="text-xl text-foreground">Vendor Memory</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4 xl:grid-cols-3">
            <div className="dashboard-item p-4">
              <p className="text-sm font-semibold text-foreground">Top vendors</p>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">
                These are the vendors the system currently trusts most based on score, reuse, and project history.
              </p>
              <div className="mt-4 space-y-3">
                {vendorMemory.topVendors.length ? (
                  vendorMemory.topVendors.slice(0, 3).map((vendor) => (
                    <div key={vendor.id} className="rounded-2xl border border-border/70 bg-background/70 p-3">
                      <p className="text-sm font-medium text-foreground">{vendor.label}</p>
                      <p className="mt-1 text-xs text-muted-foreground">
                        {vendor.tradeCategory} | {formatScore(vendor.averageScore)} | {vendor.linkedProjectCount} linked project(s)
                      </p>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-muted-foreground">No preferred vendors are scored strongly enough yet.</p>
                )}
              </div>
            </div>

            <div className="dashboard-item p-4">
              <p className="text-sm font-semibold text-foreground">Repeat issues / caution</p>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">
                Keep these trade partners visible so repeat callbacks and slow response patterns do not disappear into notes.
              </p>
              <div className="mt-4 space-y-3">
                {vendorMemory.repeatIssueVendors.length || vendorMemory.cautionVendors.length ? (
                  [...vendorMemory.repeatIssueVendors, ...vendorMemory.cautionVendors]
                    .slice(0, 4)
                    .map((vendor) => (
                      <div key={vendor.id} className="rounded-2xl border border-border/70 bg-background/70 p-3">
                        <p className="text-sm font-medium text-foreground">{vendor.label}</p>
                        <p className="mt-1 text-xs text-muted-foreground">
                          {vendor.deficiencyCount} callback issue(s) | {vendor.averageResponseDays ?? "n/a"} day avg response | {vendor.riskStatus}
                        </p>
                      </div>
                    ))
                ) : (
                  <p className="text-sm text-muted-foreground">No repeat-issue vendor pattern is visible yet.</p>
                )}
              </div>
            </div>

            <div className="dashboard-item p-4">
              <p className="text-sm font-semibold text-foreground">Do not use / high risk</p>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">
                These records stay obvious here so the system remembers risk before the next award decision is made.
              </p>
              <div className="mt-4 space-y-3">
                {vendorMemory.blockedVendors.length ? (
                  vendorMemory.blockedVendors.slice(0, 4).map((vendor) => (
                    <div key={vendor.id} className="rounded-2xl border border-rose-200/70 bg-rose-50/70 p-3 dark:border-rose-900/50 dark:bg-rose-950/20">
                      <p className="text-sm font-medium text-foreground">{vendor.label}</p>
                      <p className="mt-1 text-xs text-muted-foreground">
                        {vendor.workAgain} | {vendor.riskStatus} | {vendor.deficiencyCount} issue(s)
                      </p>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-muted-foreground">No vendor is currently marked do-not-use or high risk.</p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="dashboard-panel p-2">
          <CardHeader>
            <CardTitle className="text-xl text-foreground">Filter records</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Tabs value={view} onValueChange={setView}>
              <TabsList className="flex h-auto flex-wrap justify-start gap-2 bg-transparent p-0">
                {[
                  ["all", "All"],
                  ["vendors", "Vendors (Trades)"],
                  ["clients", "Stakeholders (Clients)"],
                  ["realtors", "Realtors"],
                  ["lawyers", "Lawyers"],
                ].map(([value, label]) => (
                  <TabsTrigger
                    key={value}
                    value={value}
                    className="rounded-full border border-border/80 bg-background px-4 py-2 text-sm data-[state=active]:bg-foreground data-[state=active]:text-background"
                  >
                    {label}
                  </TabsTrigger>
                ))}
              </TabsList>
            </Tabs>

            <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_220px]">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  className="pl-10"
                  placeholder="Search by type, person, company, role, trade, email, or tag"
                />
              </div>
              <select
                value={statusFilter}
                onChange={(event) => setStatusFilter(event.target.value)}
                className="flex h-10 rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground"
              >
                <option value="all">All statuses</option>
                <option value="Active">Active</option>
                <option value="Inactive">Inactive</option>
                <option value="Do Not Use">Do Not Use</option>
              </select>
            </div>
          </CardContent>
        </Card>

        {filteredRecords.length ? (
          <div className="grid gap-4">
            {filteredRecords.map((record) => (
              <Card key={record.id} className="dashboard-panel p-2">
                <CardContent className="space-y-4 p-6">
                  <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                    <div className="space-y-3">
                      <div className="flex flex-wrap items-center gap-2">
                        <h2 className="text-xl font-semibold text-foreground">
                          {record.companyName || record.personName}
                        </h2>
                        <Badge className="rounded-full bg-muted text-muted-foreground">
                          {record.type}
                        </Badge>
                        <Badge
                          className={
                            record.status === "Do Not Use"
                              ? "rounded-full bg-rose-500/10 text-rose-700 dark:text-rose-300"
                              : record.status === "Inactive"
                                ? "rounded-full bg-amber-500/10 text-amber-700 dark:text-amber-300"
                                : "rounded-full bg-emerald-500/10 text-emerald-700 dark:text-emerald-300"
                          }
                        >
                          {record.status}
                        </Badge>
                      </div>

                      <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                        <span>{record.personName}</span>
                        <span>{record.role || "Role not set"}</span>
                        <span>{record.email || "Email not set"}</span>
                        <span>{record.phone || "Phone not set"}</span>
                      </div>

                      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
                        <div className="dashboard-item p-3">
                          <p className="text-sm font-medium text-foreground">Trade / discipline</p>
                          <p className="mt-2 text-sm text-muted-foreground">
                            {record.tradeCategory || "Not set"}
                          </p>
                        </div>
                        <div className="dashboard-item p-3">
                          <p className="text-sm font-medium text-foreground">Linked projects</p>
                          <p className="mt-2 text-sm text-muted-foreground">
                            {record.linkedProjectIds.length}
                          </p>
                        </div>
                        <div className="dashboard-item p-3">
                          <p className="text-sm font-medium text-foreground">Insurance expiry</p>
                          <p className="mt-2 text-sm text-muted-foreground">
                            {record.insuranceExpiry || "Not set"}
                          </p>
                        </div>
                        <div className="dashboard-item p-3">
                          <p className="text-sm font-medium text-foreground">Work again</p>
                          <p className="mt-2 text-sm text-muted-foreground">
                            {record.workAgain || "Not set"}
                          </p>
                        </div>
                      </div>

                      {record.type === "Vendor (Trade)" ? (
                        <div className="grid gap-3 text-sm text-muted-foreground md:grid-cols-3">
                          <div className="dashboard-item p-3">
                            <p className="text-sm font-medium text-foreground">Memory score</p>
                            <p className="mt-2">
                              {formatScore(
                                vendorMemory.vendors.find((vendor) => vendor.id === record.id)?.averageScore ?? null
                              )}
                            </p>
                          </div>
                          <div className="dashboard-item p-3">
                            <p className="text-sm font-medium text-foreground">Repeat issue count</p>
                            <p className="mt-2">
                              {vendorMemory.vendors.find((vendor) => vendor.id === record.id)?.deficiencyCount || 0}
                            </p>
                          </div>
                          <div className="dashboard-item p-3">
                            <p className="text-sm font-medium text-foreground">Memory signal</p>
                            <p className="mt-2">
                              {vendorMemory.vendors.find((vendor) => vendor.id === record.id)?.riskStatus || "Preferred"}
                            </p>
                          </div>
                        </div>
                      ) : null}

                      {record.tags.length ? (
                        <div className="flex flex-wrap gap-2">
                          {record.tags.map((tag) => (
                            <Badge key={`${record.id}-${tag}`} className="rounded-full bg-enc-orange/10 text-enc-orange">
                              {tag}
                            </Badge>
                          ))}
                        </div>
                      ) : null}

                      {record.notes ? (
                        <div className="dashboard-item p-3">
                          <p className="text-sm font-medium text-foreground">General notes</p>
                          <p className="mt-2 text-sm leading-6 text-muted-foreground">
                            {record.notes}
                          </p>
                        </div>
                      ) : null}

                      {canSeeRestrictedNotes && record.restrictedNotes ? (
                        <div className="dashboard-item border-amber-200/70 bg-amber-50/50 p-3 dark:border-amber-900/50 dark:bg-amber-950/20">
                          <p className="text-sm font-medium text-foreground">Restricted internal notes</p>
                          <p className="mt-2 text-sm leading-6 text-muted-foreground">
                            {record.restrictedNotes}
                          </p>
                        </div>
                      ) : null}
                    </div>

                    <div className="flex flex-wrap gap-2">
                      <Button
                        variant="outline"
                        className="rounded-full"
                        onClick={() => {
                          setEditingRecord(record);
                          setShowForm(true);
                        }}
                      >
                        <Pencil className="mr-2 h-4 w-4" />
                        Edit
                      </Button>
                      <Button
                        variant="outline"
                        className="rounded-full text-rose-600 hover:text-rose-700"
                        onClick={() => setDeleteTarget(record)}
                      >
                        <Trash2 className="mr-2 h-4 w-4" />
                        Remove
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Card className="dashboard-panel p-2">
            <CardContent className="p-6 text-sm leading-6 text-muted-foreground">
              No records match the current filter. Use Add Record to build the shared operating database for vendors, stakeholders, lawyers, realtors, and related participants.
            </CardContent>
          </Card>
        )}
      </div>

      <MasterRecordForm
        open={showForm}
        record={editingRecord}
        onClose={() => {
          setShowForm(false);
          setEditingRecord(null);
        }}
        onSaved={() => {
          setShowForm(false);
          setEditingRecord(null);
        }}
        onSubmitRecord={handleSave}
      />

      <AlertDialog open={Boolean(deleteTarget)} onOpenChange={() => setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remove record</AlertDialogTitle>
            <AlertDialogDescription>
              Remove "{deleteTarget?.companyName || deleteTarget?.personName}" from the Master Database?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction className="bg-rose-600 hover:bg-rose-700" onClick={() => void handleDelete()}>
              Remove
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </ManagementLayout>
  );
}
