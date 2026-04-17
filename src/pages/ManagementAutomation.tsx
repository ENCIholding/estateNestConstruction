import { useEffect, useMemo, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { BotMessageSquare, FileText, RefreshCw, ShieldAlert } from "lucide-react";
import { Link } from "react-router-dom";
import ManagementLayout from "@/components/management/ManagementLayout";
import Badge from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  buildOperationalAlerts,
  getPortfolioFinancialOverview,
} from "@/lib/buildosIntelligence";
import { fetchManagementProjects } from "@/lib/managementData";
import {
  loadBuildOsAutomationSettings,
  loadBuildOsDocuments,
  loadChangeOrders,
  loadClientInvoices,
  loadDeficiencies,
  loadMasterDatabaseRecords,
  loadTasks,
  loadVendorBills,
  saveBuildOsAutomationSettings,
  type BuildOsAutomationSettings,
} from "@/lib/buildosShared";

type RuleKey = keyof Omit<
  BuildOsAutomationSettings,
  "budgetVarianceThreshold" | "updatedAt"
>;

const ruleLabels: { key: RuleKey; title: string; detail: string }[] = [
  {
    key: "overdueTasks",
    title: "Overdue tasks",
    detail: "Flag work items that have passed their due date and are not complete.",
  },
  {
    key: "delayedMilestones",
    title: "Delayed milestones",
    detail: "Escalate milestone tasks that are schedule-driving and already past due.",
  },
  {
    key: "budgetThresholdExceeded",
    title: "Budget threshold exceeded",
    detail: "Watch for projects where cost commitments are closing in on or exceeding the revised budget.",
  },
  {
    key: "overdueClientInvoices",
    title: "Overdue client invoices",
    detail: "Surface inflow pressure when receivables are past due.",
  },
  {
    key: "unpaidVendorBills",
    title: "Unpaid vendor bills",
    detail: "Escalate vendor payment pressure and possible relationship risk.",
  },
  {
    key: "staleChangeOrders",
    title: "Stale change orders",
    detail: "Keep pending cost/scope decisions from aging quietly.",
  },
  {
    key: "unresolvedDeficiencies",
    title: "Unresolved deficiencies",
    detail: "Highlight quality issues that still need assignment or closeout.",
  },
  {
    key: "missingRequiredDocuments",
    title: "Missing required documents",
    detail: "Warn when required project documents are missing links or file references.",
  },
  {
    key: "expiringInsuranceOrLicense",
    title: "Expiring insurance or licenses",
    detail: "Track relationship records whose insurance or license dates need renewal.",
  },
];

function alertEnabled(
  title: string,
  module: string,
  settings: BuildOsAutomationSettings
) {
  if (module === "tasks" && title.toLowerCase().includes("milestone")) {
    return settings.delayedMilestones;
  }
  if (module === "tasks") {
    return settings.overdueTasks;
  }
  if (module === "financial" && title.toLowerCase().includes("invoice")) {
    return settings.overdueClientInvoices;
  }
  if (module === "financial" && title.toLowerCase().includes("vendor")) {
    return settings.unpaidVendorBills;
  }
  if (module === "financial") {
    return settings.budgetThresholdExceeded;
  }
  if (module === "change-orders") {
    return settings.staleChangeOrders;
  }
  if (module === "deficiencies") {
    return settings.unresolvedDeficiencies;
  }
  if (module === "documents") {
    return settings.missingRequiredDocuments;
  }
  if (module === "master-database") {
    return settings.expiringInsuranceOrLicense;
  }
  return true;
}

export default function ManagementAutomation() {
  const queryClient = useQueryClient();
  const [severityFilter, setSeverityFilter] = useState("all");
  const [settingsState, setSettingsState] = useState<BuildOsAutomationSettings | null>(null);

  const { data: projects = [] } = useQuery({
    queryKey: ["management-projects"],
    queryFn: fetchManagementProjects,
  });
  const { data: changeOrders = [] } = useQuery({
    queryKey: ["buildos-change-orders"],
    queryFn: async () => loadChangeOrders(),
  });
  const { data: clientInvoices = [] } = useQuery({
    queryKey: ["buildos-client-invoices"],
    queryFn: async () => loadClientInvoices(),
  });
  const { data: vendorBills = [] } = useQuery({
    queryKey: ["buildos-vendor-bills"],
    queryFn: async () => loadVendorBills(),
  });
  const { data: deficiencies = [] } = useQuery({
    queryKey: ["buildos-deficiencies"],
    queryFn: async () => loadDeficiencies(),
  });
  const { data: documents = [] } = useQuery({
    queryKey: ["buildos-documents"],
    queryFn: async () => loadBuildOsDocuments(),
  });
  const { data: tasks = [] } = useQuery({
    queryKey: ["buildos-tasks"],
    queryFn: async () => loadTasks(),
  });
  const { data: records = [] } = useQuery({
    queryKey: ["buildos-master-database"],
    queryFn: async () => loadMasterDatabaseRecords(),
  });
  const { data: automationSettings } = useQuery({
    queryKey: ["buildos-automation-settings"],
    queryFn: async () => loadBuildOsAutomationSettings(),
  });

  useEffect(() => {
    if (automationSettings) {
      setSettingsState(automationSettings);
    }
  }, [automationSettings]);
  const effectiveSettings: BuildOsAutomationSettings =
    settingsState || {
      overdueTasks: true,
      delayedMilestones: true,
      budgetThresholdExceeded: true,
      overdueClientInvoices: true,
      unpaidVendorBills: true,
      staleChangeOrders: true,
      unresolvedDeficiencies: true,
      missingRequiredDocuments: true,
      expiringInsuranceOrLicense: true,
      budgetVarianceThreshold: 85,
      updatedAt: new Date().toISOString(),
    };

  const alerts = useMemo(
    () =>
      buildOperationalAlerts(
        projects,
        changeOrders,
        clientInvoices,
        vendorBills,
        deficiencies,
        documents,
        tasks,
        records,
        effectiveSettings.budgetVarianceThreshold / 100
      ).filter((alert) => alertEnabled(alert.title, alert.module, effectiveSettings)),
    [
      changeOrders,
      clientInvoices,
      deficiencies,
      documents,
      effectiveSettings,
      projects,
      records,
      tasks,
      vendorBills,
    ]
  );

  const filteredAlerts = useMemo(
    () => alerts.filter((alert) => severityFilter === "all" || alert.severity === severityFilter),
    [alerts, severityFilter]
  );

  const financials = useMemo(
    () => getPortfolioFinancialOverview(projects, changeOrders, clientInvoices, vendorBills),
    [changeOrders, clientInvoices, projects, vendorBills]
  );

  if (!settingsState) {
    return (
      <ManagementLayout currentPageName="automation">
        <div className="dashboard-panel p-8">
          <p className="text-sm text-muted-foreground">
            Loading automation settings...
          </p>
        </div>
      </ManagementLayout>
    );
  }

  return (
    <ManagementLayout currentPageName="automation">
      <div className="space-y-6">
        <div className="dashboard-panel overflow-hidden p-8">
          <div className="absolute inset-y-0 right-0 w-44 bg-gradient-to-l from-enc-yellow/10 via-enc-orange/10 to-transparent" />
          <div className="relative">
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-enc-orange">
              Controlled Automation
            </p>
            <h1 className="mt-3 text-3xl font-bold text-foreground">Automation Center</h1>
            <p className="mt-4 max-w-4xl text-sm leading-6 text-muted-foreground">
              ENCI BuildOS uses automation for warnings, reminders, and draft preparation only. It does not auto-send, auto-approve, or auto-execute anything irreversible.
            </p>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <Card className="dashboard-panel p-2">
            <CardContent className="p-5">
              <p className="text-sm font-medium text-muted-foreground">Active alerts</p>
              <p className="mt-3 text-3xl font-semibold text-foreground">{alerts.length}</p>
            </CardContent>
          </Card>
          <Card className="dashboard-panel p-2">
            <CardContent className="p-5">
              <p className="text-sm font-medium text-muted-foreground">Critical alerts</p>
              <p className="mt-3 text-3xl font-semibold text-foreground">
                {alerts.filter((alert) => alert.severity === "critical").length}
              </p>
            </CardContent>
          </Card>
          <Card className="dashboard-panel p-2">
            <CardContent className="p-5">
              <p className="text-sm font-medium text-muted-foreground">Open receivable pressure</p>
              <p className="mt-3 text-3xl font-semibold text-foreground">
                {new Intl.NumberFormat("en-CA", {
                  style: "currency",
                  currency: "CAD",
                  maximumFractionDigits: 0,
                }).format(financials.unpaidClientInvoices)}
              </p>
            </CardContent>
          </Card>
          <Card className="dashboard-panel p-2">
            <CardContent className="p-5">
              <p className="text-sm font-medium text-muted-foreground">Open payable pressure</p>
              <p className="mt-3 text-3xl font-semibold text-foreground">
                {new Intl.NumberFormat("en-CA", {
                  style: "currency",
                  currency: "CAD",
                  maximumFractionDigits: 0,
                }).format(financials.unpaidVendorBills)}
              </p>
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-6 xl:grid-cols-[minmax(0,1.15fr)_minmax(340px,0.85fr)]">
          <Card className="dashboard-panel p-2">
            <CardHeader className="flex flex-row items-start justify-between gap-4">
              <div>
                <CardTitle className="flex items-center gap-2 text-xl text-foreground">
                  <ShieldAlert className="h-5 w-5 text-enc-orange" />
                  Alert center
                </CardTitle>
                <p className="mt-2 text-sm text-muted-foreground">
                  Filter the active warnings and route them into the correct workflow instead of letting them hide in email.
                </p>
              </div>
              <select
                value={severityFilter}
                onChange={(event) => setSeverityFilter(event.target.value)}
                className="flex h-10 rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground"
              >
                <option value="all">All severities</option>
                <option value="critical">Critical</option>
                <option value="warning">Warning</option>
                <option value="info">Info</option>
              </select>
            </CardHeader>
            <CardContent className="space-y-3">
              {filteredAlerts.length ? (
                filteredAlerts.map((alert) => (
                  <div key={alert.id} className="dashboard-item p-4">
                    <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                      <div>
                        <p className="text-sm font-semibold text-foreground">{alert.title}</p>
                        <p className="mt-2 text-sm leading-6 text-muted-foreground">{alert.detail}</p>
                        <p className="mt-2 text-xs uppercase tracking-[0.2em] text-muted-foreground">
                          {alert.module}
                        </p>
                      </div>
                      <Badge
                        className={
                          alert.severity === "critical"
                            ? "rounded-full bg-rose-500/10 text-rose-700 dark:text-rose-300"
                            : alert.severity === "warning"
                              ? "rounded-full bg-amber-500/10 text-amber-700 dark:text-amber-300"
                              : "rounded-full bg-blue-500/10 text-blue-700 dark:text-blue-300"
                        }
                      >
                        {alert.severity}
                      </Badge>
                    </div>
                  </div>
                ))
              ) : (
                <div className="dashboard-item p-6 text-sm leading-6 text-muted-foreground">
                  No alerts are active under the current filter.
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="dashboard-panel p-2">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-xl text-foreground">
                <BotMessageSquare className="h-5 w-5 text-enc-orange" />
                Rule toggles
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {ruleLabels.map((rule) => (
                <div key={rule.key} className="dashboard-item p-4">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="text-sm font-semibold text-foreground">{rule.title}</p>
                      <p className="mt-2 text-sm leading-6 text-muted-foreground">{rule.detail}</p>
                    </div>
                    <label className="inline-flex items-center gap-3 text-sm text-foreground">
                      <input
                        type="checkbox"
                        checked={settingsState[rule.key]}
                        onChange={async (event) => {
                          const next = {
                            ...settingsState,
                            [rule.key]: event.target.checked,
                          };
                          setSettingsState(next);
                          await saveBuildOsAutomationSettings(next);
                          await queryClient.invalidateQueries({ queryKey: ["buildos-automation-settings"] });
                        }}
                      />
                      Active
                    </label>
                  </div>
                </div>
              ))}
              <div className="dashboard-item p-4">
                <p className="text-sm font-semibold text-foreground">Budget warning threshold</p>
                <input
                  type="range"
                  min={50}
                  max={100}
                  step={5}
                  value={settingsState.budgetVarianceThreshold}
                  onChange={async (event) => {
                    const next = {
                      ...settingsState,
                      budgetVarianceThreshold: Number(event.target.value),
                    };
                    setSettingsState(next);
                    await saveBuildOsAutomationSettings(next);
                    await queryClient.invalidateQueries({ queryKey: ["buildos-automation-settings"] });
                  }}
                  className="mt-4 w-full"
                />
                <p className="mt-2 text-sm text-muted-foreground">
                  Current threshold: {settingsState.budgetVarianceThreshold}% of revised budget
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        <Card className="dashboard-panel p-2">
          <CardHeader>
            <CardTitle className="text-xl text-foreground">Draft support only</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4 md:grid-cols-2">
            <div className="dashboard-item p-4">
              <p className="text-sm font-semibold text-foreground">Prepare a report draft</p>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">
                Route into Reports when you want exportable lender, financial, or health summaries.
              </p>
              <Button asChild variant="outline" className="mt-4 rounded-full">
                <Link to="/management/reports">
                  <FileText className="mr-2 h-4 w-4" />
                  Open Reports
                </Link>
              </Button>
            </div>
            <div className="dashboard-item p-4">
              <p className="text-sm font-semibold text-foreground">Refresh alert review</p>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">
                Alerts regenerate from structured records. Nothing is auto-sent or auto-cleared.
              </p>
              <Button
                variant="outline"
                className="mt-4 rounded-full"
                onClick={async () => {
                  await queryClient.invalidateQueries({
                    predicate: (query) =>
                      Array.isArray(query.queryKey) &&
                      typeof query.queryKey[0] === "string" &&
                      (query.queryKey[0].startsWith("buildos") || query.queryKey[0].startsWith("management")),
                  });
                }}
              >
                <RefreshCw className="mr-2 h-4 w-4" />
                Refresh Signals
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </ManagementLayout>
  );
}
