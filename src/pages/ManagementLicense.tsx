import { useEffect, useMemo, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { BookOpenText, Search, ShieldCheck } from "lucide-react";
import ManagementLayout from "@/components/management/ManagementLayout";
import Badge from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Input from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { BUILDOS_LEGAL_DISCLAIMER, buildOsDocs } from "@/lib/buildosDocs";
import { fetchManagementJson, type DashboardStatus } from "@/lib/managementData";
import {
  loadBuildOsTenantProfile,
  saveBuildOsTenantProfile,
  type BuildOsTenantProfile,
} from "@/lib/buildosShared";

type SessionPayload = {
  user?: {
    app_role?: string;
    permissions?: string[];
  };
};

export default function ManagementLicense() {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [activeDocId, setActiveDocId] = useState("terms-of-use");
  const [tenantState, setTenantState] = useState<BuildOsTenantProfile | null>(null);

  const { data: session } = useQuery({
    queryKey: ["management-session"],
    queryFn: () => fetchManagementJson<SessionPayload>("/api/management/session"),
    retry: false,
  });
  const { data: status } = useQuery({
    queryKey: ["management-status"],
    queryFn: () => fetchManagementJson<DashboardStatus>("/api/management/status"),
  });

  const { data: tenantProfile } = useQuery({
    queryKey: ["buildos-tenant-profile"],
    queryFn: async () => loadBuildOsTenantProfile(),
  });

  const role = session?.user?.app_role || "Admin";
  const canEditTenant =
    session?.user?.permissions?.includes("buildos:tenant-profile:write") ?? true;
  const visibleDocs = useMemo(
    () => buildOsDocs.filter((doc) => doc.visibility === "all" || role === "Admin"),
    [role]
  );

  const filteredDocs = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) {
      return visibleDocs;
    }

    return visibleDocs.filter(
      (doc) =>
        doc.title.toLowerCase().includes(query) ||
        doc.summary.toLowerCase().includes(query) ||
        doc.sections.some(
          (section) =>
            section.heading.toLowerCase().includes(query) ||
            section.body.some((paragraph) => paragraph.toLowerCase().includes(query))
        )
    );
  }, [search, visibleDocs]);

  const activeDoc =
    filteredDocs.find((doc) => doc.id === activeDocId) || filteredDocs[0] || visibleDocs[0];

  useEffect(() => {
    if (tenantProfile) {
      setTenantState(tenantProfile);
    }
  }, [tenantProfile]);

  const saveTenant = async () => {
    if (!tenantState) return;
    await saveBuildOsTenantProfile(tenantState);
    await queryClient.invalidateQueries({ queryKey: ["buildos-tenant-profile"] });
  };

  return (
    <ManagementLayout currentPageName="license">
      <div className="space-y-6">
        <div className="dashboard-panel overflow-hidden p-8">
          <div className="absolute inset-y-0 right-0 w-44 bg-gradient-to-l from-enc-yellow/10 via-enc-orange/10 to-transparent" />
          <div className="relative">
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-enc-orange">
              ENCI BuildOS Legal & Productization
            </p>
            <h1 className="mt-3 text-3xl font-bold text-foreground">License Center</h1>
            <p className="mt-4 max-w-4xl text-sm leading-6 text-muted-foreground">
              Internal documentation center for legal working drafts, subscription foundations, internal use policy, and tenant readiness. These pages are operational references only and must not be treated as final legal advice.
            </p>
          </div>
        </div>

        <Card className="dashboard-panel border-amber-200/80 bg-amber-50/80 p-2 dark:border-amber-900/60 dark:bg-amber-950/20">
          <CardContent className="p-5 text-sm leading-6 text-foreground">
            <div className="flex items-start gap-3">
              <ShieldCheck className="mt-0.5 h-5 w-5 text-enc-orange" />
              <div>
                <p className="font-semibold">Internal working draft disclaimer</p>
                <p className="mt-2 text-muted-foreground">{BUILDOS_LEGAL_DISCLAIMER}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="grid gap-6 xl:grid-cols-[300px_minmax(0,1fr)]">
          <Card className="dashboard-panel p-2">
            <CardHeader>
              <CardTitle className="text-xl text-foreground">Documentation navigation</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  className="pl-10"
                  placeholder="Search legal working drafts"
                />
              </div>

              <div className="space-y-2">
                {filteredDocs.map((doc) => (
                  <button
                    key={doc.id}
                    type="button"
                    onClick={() => setActiveDocId(doc.id)}
                    className={`w-full rounded-2xl border px-4 py-3 text-left transition ${
                      activeDoc?.id === doc.id
                        ? "border-enc-orange/40 bg-enc-orange/10"
                        : "border-border/70 bg-background"
                    }`}
                  >
                    <p className="text-sm font-semibold text-foreground">{doc.title}</p>
                    <p className="mt-2 text-xs leading-5 text-muted-foreground">{doc.summary}</p>
                    <div className="mt-3 flex items-center gap-2 text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
                      <span>{doc.version}</span>
                      <span>{doc.lastUpdated}</span>
                    </div>
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>

          <div className="space-y-6">
            {activeDoc ? (
              <Card className="dashboard-panel p-2">
                <CardHeader className="flex flex-row items-start justify-between gap-4">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.3em] text-enc-orange">
                      Internal documentation
                    </p>
                    <CardTitle className="mt-3 flex items-center gap-2 text-2xl text-foreground">
                      <BookOpenText className="h-5 w-5 text-enc-orange" />
                      {activeDoc.title}
                    </CardTitle>
                    <p className="mt-3 text-sm leading-6 text-muted-foreground">
                      {activeDoc.summary}
                    </p>
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    <Badge className="rounded-full bg-muted text-muted-foreground">{activeDoc.version}</Badge>
                    <Badge className="rounded-full bg-enc-orange/10 text-enc-orange">{activeDoc.lastUpdated}</Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="rounded-2xl border border-border/70 bg-background/80 p-4 text-sm leading-6 text-muted-foreground">
                    {BUILDOS_LEGAL_DISCLAIMER}
                  </div>
                  {activeDoc.sections.map((section) => (
                    <section key={section.heading} className="space-y-3">
                      <h2 className="text-lg font-semibold text-foreground">{section.heading}</h2>
                      {section.body.map((paragraph) => (
                        <p key={paragraph} className="text-sm leading-7 text-muted-foreground">
                          {paragraph}
                        </p>
                      ))}
                      <Separator />
                    </section>
                  ))}
                </CardContent>
              </Card>
            ) : null}

            {tenantState ? (
              <Card className="dashboard-panel p-2">
                <CardHeader>
                  <CardTitle className="text-2xl text-foreground">Tenant & subscription foundation</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {status ? (
                    <div className="rounded-2xl border border-border/70 bg-background/80 p-4 text-sm leading-6 text-muted-foreground">
                      Shared persistence:{" "}
                      {status.buildOsStorage.configured
                        ? `${status.buildOsStorage.provider} is configured for workspace ${status.buildOsStorage.workspaceSlug}.`
                        : "not configured yet; tenant settings still need shared storage configured before multi-user rollout."}
                    </div>
                  ) : null}
                  <Tabs value={tenantState.planTier} onValueChange={(value) => setTenantState((current) => current ? { ...current, planTier: value as BuildOsTenantProfile["planTier"] } : current)}>
                    <TabsList className="flex h-auto flex-wrap gap-2 bg-transparent p-0">
                      {["Internal", "Pilot", "Builder Pro", "Enterprise"].map((plan) => (
                        <TabsTrigger key={plan} value={plan} className="rounded-full border border-border/80 bg-background px-4 py-2 data-[state=active]:bg-foreground data-[state=active]:text-background">
                          {plan}
                        </TabsTrigger>
                      ))}
                    </TabsList>
                  </Tabs>

                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label>Organization name</Label>
                      <Input value={tenantState.organizationName} onChange={(event) => setTenantState((current) => current ? { ...current, organizationName: event.target.value } : current)} />
                    </div>
                    <div className="space-y-2">
                      <Label>Subscription status</Label>
                      <select value={tenantState.subscriptionStatus} onChange={(event) => setTenantState((current) => current ? { ...current, subscriptionStatus: event.target.value as BuildOsTenantProfile["subscriptionStatus"] } : current)} className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm">
                        <option value="Active">Active</option>
                        <option value="Suspended">Suspended</option>
                        <option value="Trial">Trial</option>
                        <option value="Cancelled">Cancelled</option>
                      </select>
                    </div>
                    <div className="space-y-2">
                      <Label>Account status</Label>
                      <select value={tenantState.accountStatus} onChange={(event) => setTenantState((current) => current ? { ...current, accountStatus: event.target.value as BuildOsTenantProfile["accountStatus"] } : current)} className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm">
                        <option value="Active">Active</option>
                        <option value="Suspended">Suspended</option>
                        <option value="Trial">Trial</option>
                        <option value="Cancelled">Cancelled</option>
                      </select>
                    </div>
                    <div className="space-y-2">
                      <Label>Active seats</Label>
                      <Input type="number" value={tenantState.activeSeats} onChange={(event) => setTenantState((current) => current ? { ...current, activeSeats: Number(event.target.value) || 0 } : current)} />
                    </div>
                    <div className="space-y-2 md:col-span-2">
                      <Label>Feature access</Label>
                      <Textarea value={tenantState.featureAccess.join(", ")} onChange={(event) => setTenantState((current) => current ? { ...current, featureAccess: event.target.value.split(",").map((item) => item.trim()).filter(Boolean) } : current)} rows={3} />
                    </div>
                    <div className="space-y-2 md:col-span-2">
                      <Label>Admin notes</Label>
                      <Textarea value={tenantState.adminNotes || ""} onChange={(event) => setTenantState((current) => current ? { ...current, adminNotes: event.target.value } : current)} rows={3} />
                    </div>
                    <div className="space-y-2 md:col-span-2">
                      <Label>Usage audit log</Label>
                      <Textarea value={tenantState.usageAuditLog || ""} onChange={(event) => setTenantState((current) => current ? { ...current, usageAuditLog: event.target.value } : current)} rows={3} />
                    </div>
                  </div>

                  <div className="flex justify-end">
                    <Button disabled={!canEditTenant} onClick={() => void saveTenant()}>
                      Save Tenant Foundation
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ) : null}
          </div>
        </div>
      </div>
    </ManagementLayout>
  );
}
