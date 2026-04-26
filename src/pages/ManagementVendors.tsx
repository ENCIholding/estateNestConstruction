import { useMemo, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
  AlertTriangle,
  Mail,
  Pencil,
  Phone,
  Plus,
  Search,
  ShieldAlert,
  Trash2,
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
import { getVendorRiskStatus } from "@/lib/buildosIntelligence";
import {
  deleteMasterDatabaseRecord,
  loadMasterDatabaseRecords,
  saveMasterDatabaseRecord,
  type BuildOsMasterRecord,
} from "@/lib/buildosShared";
import { buildVendorMemorySnapshot } from "@/lib/vendorMemory";

function getOverallRating(record: BuildOsMasterRecord) {
  const scores = [
    record.qualityScore,
    record.pricingScore,
    record.reliabilityScore,
    record.communicationScore,
    record.timelinessScore,
    record.professionalismScore,
  ].filter((value): value is number => typeof value === "number");

  if (!scores.length) {
    return "Not scored";
  }

  return `${(scores.reduce((total, value) => total + value, 0) / scores.length).toFixed(1)} / 5`;
}

function formatScore(value: number | null) {
  return value === null ? "Not scored" : `${value.toFixed(1)} / 5`;
}

export default function ManagementVendors() {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [tradeFilter, setTradeFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [showForm, setShowForm] = useState(false);
  const [editingRecord, setEditingRecord] = useState<BuildOsMasterRecord | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<BuildOsMasterRecord | null>(null);

  const { data: records = [] } = useQuery({
    queryKey: ["buildos-master-database"],
    queryFn: async () => loadMasterDatabaseRecords(),
  });

  const vendors = useMemo(
    () => records.filter((record) => record.type === "Vendor (Trade)"),
    [records]
  );
  const vendorMemory = useMemo(() => buildVendorMemorySnapshot(records), [records]);

  const filteredVendors = useMemo(() => {
    const query = search.trim().toLowerCase();
    return vendors.filter((vendor) => {
      const matchesSearch =
        !query ||
        (vendor.companyName || "").toLowerCase().includes(query) ||
        vendor.personName.toLowerCase().includes(query) ||
        (vendor.tradeCategory || "").toLowerCase().includes(query) ||
        (vendor.email || "").toLowerCase().includes(query);
      const matchesTrade = tradeFilter === "all" || vendor.tradeCategory === tradeFilter;
      const matchesStatus = statusFilter === "all" || vendor.status === statusFilter;
      return matchesSearch && matchesTrade && matchesStatus;
    });
  }, [search, statusFilter, tradeFilter, vendors]);

  const tradeOptions = Array.from(
    new Set(vendors.map((vendor) => vendor.tradeCategory).filter(Boolean))
  ) as string[];

  const handleSave = async (record: Partial<BuildOsMasterRecord>) => {
    await saveMasterDatabaseRecord({ ...record, type: "Vendor (Trade)" });
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
    <ManagementLayout currentPageName="vendors">
      <div className="space-y-6">
        <div className="dashboard-panel overflow-hidden p-8">
          <div className="absolute inset-y-0 right-0 w-44 bg-gradient-to-l from-enc-yellow/10 via-enc-orange/10 to-transparent" />
          <div className="relative flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.3em] text-enc-orange">
                Filtered Master Database View
              </p>
              <h1 className="mt-3 text-3xl font-bold text-foreground">Vendors (Trades)</h1>
              <p className="mt-4 max-w-4xl text-sm leading-6 text-muted-foreground">
                This is no longer a disconnected vendor list. Vendors (Trades) now run as a filtered operational view of Master Database so project relationships, ratings, and risk signals stay aligned.
              </p>
            </div>

            <Button
              className="rounded-full bg-gradient-to-r from-enc-red via-enc-orange to-enc-yellow text-white shadow-glow"
              onClick={() => {
                setEditingRecord(null);
                setShowForm(true);
              }}
            >
              <Plus className="mr-2 h-4 w-4" />
              Add Vendor
            </Button>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <Card className="dashboard-panel p-2">
            <CardContent className="p-5">
              <p className="text-sm font-medium text-muted-foreground">Vendor records</p>
              <p className="mt-3 text-3xl font-semibold text-foreground">{vendors.length}</p>
            </CardContent>
          </Card>
          <Card className="dashboard-panel p-2">
            <CardContent className="p-5">
              <p className="text-sm font-medium text-muted-foreground">Preferred</p>
              <p className="mt-3 text-3xl font-semibold text-foreground">
                {vendors.filter((vendor) => getVendorRiskStatus(vendor) === "Preferred").length}
              </p>
            </CardContent>
          </Card>
          <Card className="dashboard-panel p-2">
            <CardContent className="p-5">
              <p className="text-sm font-medium text-muted-foreground">Use with caution</p>
              <p className="mt-3 text-3xl font-semibold text-foreground">
                {vendors.filter((vendor) => getVendorRiskStatus(vendor) === "Use with Caution").length}
              </p>
            </CardContent>
          </Card>
          <Card className="dashboard-panel p-2">
            <CardContent className="p-5">
              <p className="text-sm font-medium text-muted-foreground">High risk vendor</p>
              <p className="mt-3 text-3xl font-semibold text-foreground">
                {vendors.filter((vendor) => getVendorRiskStatus(vendor) === "High Risk Vendor").length}
              </p>
            </CardContent>
          </Card>
        </div>

        <Card className="dashboard-panel p-2">
          <CardHeader>
            <CardTitle className="text-xl text-foreground">Vendor Memory Signals</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4 xl:grid-cols-3">
            <div className="dashboard-item p-4">
              <p className="text-sm font-semibold text-foreground">Top vendors</p>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">
                These partners are the strongest current reuse candidates based on score, history, and recommendation.
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
                  <p className="text-sm text-muted-foreground">No top-vendor pattern is visible yet.</p>
                )}
              </div>
            </div>

            <div className="dashboard-item p-4">
              <p className="text-sm font-semibold text-foreground">Use with caution</p>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">
                These vendors need closer oversight because callbacks, responsiveness, or delivery history are trending the wrong way.
              </p>
              <div className="mt-4 space-y-3">
                {vendorMemory.cautionVendors.length ? (
                  vendorMemory.cautionVendors.slice(0, 4).map((vendor) => (
                    <div key={vendor.id} className="rounded-2xl border border-border/70 bg-background/70 p-3">
                      <p className="text-sm font-medium text-foreground">{vendor.label}</p>
                      <p className="mt-1 text-xs text-muted-foreground">
                        {vendor.deficiencyCount} issue(s) | {vendor.averageResponseDays ?? "n/a"} day avg response | {vendor.riskStatus}
                      </p>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-muted-foreground">No caution vendors are currently flagged.</p>
                )}
              </div>
            </div>

            <div className="dashboard-item p-4">
              <p className="text-sm font-semibold text-foreground">Do not use / high risk</p>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">
                Keep these names visible before awarding work so bad history is not forgotten between projects.
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
                  <p className="text-sm text-muted-foreground">No high-risk vendors are currently flagged.</p>
                )}
              </div>
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
                placeholder="Search vendor, contact, trade, or email"
              />
            </div>
            <select
              value={tradeFilter}
              onChange={(event) => setTradeFilter(event.target.value)}
              className="flex h-10 rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground"
            >
              <option value="all">All trades</option>
              {tradeOptions.map((trade) => (
                <option key={trade} value={trade}>
                  {trade}
                </option>
              ))}
            </select>
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
          </CardContent>
        </Card>

        {filteredVendors.length ? (
          <div className="grid gap-4">
            {filteredVendors.map((vendor) => {
              const risk = getVendorRiskStatus(vendor);
              return (
                <Card key={vendor.id} className="dashboard-panel p-2">
                  <CardContent className="space-y-4 p-6">
                    <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                      <div className="space-y-3">
                        <div className="flex flex-wrap items-center gap-2">
                          <h2 className="text-xl font-semibold text-foreground">
                            {vendor.companyName || vendor.personName}
                          </h2>
                          <Badge className="rounded-full bg-muted text-muted-foreground">
                            {vendor.tradeCategory || "Trade not set"}
                          </Badge>
                          <Badge
                            className={
                              risk === "High Risk Vendor"
                                ? "rounded-full bg-rose-500/10 text-rose-700 dark:text-rose-300"
                                : risk === "Use with Caution"
                                  ? "rounded-full bg-amber-500/10 text-amber-700 dark:text-amber-300"
                                  : "rounded-full bg-emerald-500/10 text-emerald-700 dark:text-emerald-300"
                            }
                          >
                            {risk}
                          </Badge>
                        </div>

                        <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                          <span>{vendor.personName}</span>
                          <span>{vendor.role || "Trade partner"}</span>
                          <span>{vendor.linkedProjectIds.length} linked project(s)</span>
                        </div>

                        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
                          <div className="dashboard-item p-3">
                            <p className="text-sm font-medium text-foreground">Overall rating</p>
                            <p className="mt-2 text-sm text-muted-foreground">
                              {getOverallRating(vendor)}
                            </p>
                          </div>
                          <div className="dashboard-item p-3">
                            <p className="text-sm font-medium text-foreground">Work again</p>
                            <p className="mt-2 text-sm text-muted-foreground">
                              {vendor.workAgain || "Not set"}
                            </p>
                          </div>
                          <div className="dashboard-item p-3">
                            <p className="text-sm font-medium text-foreground">Recommended</p>
                            <p className="mt-2 text-sm text-muted-foreground">
                              {vendor.recommended ? "Yes" : "No"}
                            </p>
                          </div>
                          <div className="dashboard-item p-3">
                            <p className="text-sm font-medium text-foreground">Insurance expiry</p>
                            <p className="mt-2 text-sm text-muted-foreground">
                              {vendor.insuranceExpiry || "Not set"}
                            </p>
                          </div>
                        </div>

                        <div className="grid gap-3 text-sm text-muted-foreground md:grid-cols-3">
                          <div className="dashboard-item p-3">
                            <p className="text-sm font-medium text-foreground">Repeat issues</p>
                            <p className="mt-2">{vendor.deficiencyCount || 0} callback issue(s)</p>
                          </div>
                          <div className="dashboard-item p-3">
                            <p className="text-sm font-medium text-foreground">Average response</p>
                            <p className="mt-2">
                              {typeof vendor.averageResponseDays === "number"
                                ? `${vendor.averageResponseDays} day(s)`
                                : "Not tracked"}
                            </p>
                          </div>
                          <div className="dashboard-item p-3">
                            <p className="text-sm font-medium text-foreground">Memory signal</p>
                            <p className="mt-2">{risk}</p>
                          </div>
                        </div>

                        {vendor.notes ? (
                          <div className="dashboard-item p-3">
                            <p className="text-sm font-medium text-foreground">Notes</p>
                            <p className="mt-2 text-sm leading-6 text-muted-foreground">
                              {vendor.notes}
                            </p>
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
                        {vendor.phone ? (
                          <Button asChild variant="outline" className="rounded-full">
                            <a href={`tel:${vendor.phone}`}>
                              <Phone className="mr-2 h-4 w-4" />
                              Call
                            </a>
                          </Button>
                        ) : null}
                        <Button
                          variant="outline"
                          className="rounded-full"
                          onClick={() => {
                            setEditingRecord(vendor);
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
            <CardContent className="p-6 text-sm leading-6 text-muted-foreground">
              <div className="flex items-start gap-3">
                <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-enc-orange" />
                <div>
                  No vendors match the current filter yet. Add your trade partners here or through Master Database so vendor history, risk signals, and project links all stay aligned.
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      <MasterRecordForm
        open={showForm}
        record={editingRecord}
        forcedType="Vendor (Trade)"
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
            <AlertDialogTitle>Remove vendor</AlertDialogTitle>
            <AlertDialogDescription>
              Remove "{deleteTarget?.companyName || deleteTarget?.personName}" from Vendors (Trades) and Master Database?
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
