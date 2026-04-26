import { useQuery } from "@tanstack/react-query";
import {
  ArrowLeft,
  CalendarClock,
  ExternalLink,
  FileText,
  History,
  MapPin,
  MessageSquare,
  TriangleAlert,
  UserRound,
} from "lucide-react";
import { Link, useSearchParams } from "react-router-dom";
import ManagementLayout from "@/components/management/ManagementLayout";
import ProjectCommandCenter from "@/components/projects/ProjectCommandCenter";
import ProjectParticipantsEditor from "@/components/projects/ProjectParticipantsEditor";
import ProjectProfitScopeControl from "@/components/projects/ProjectProfitScopeControl";
import Badge from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  buildProjectActivity,
  fetchManagementProjectById,
  getProjectControlGaps,
} from "@/lib/managementData";
import { buildProjectAuditSnapshot } from "@/lib/projectAudit";
import { buildProjectControlSnapshot } from "@/lib/projectControl";
import { getTaskAssigneeLabel } from "@/lib/buildosTasks";
import {
  getProjectParticipantAssignment,
  getLinkedProjectRecords,
  loadBuildOsDocuments,
  loadChangeOrders,
  loadClientInvoices,
  loadDeficiencies,
  loadDailyLogs,
  loadMasterDatabaseRecords,
  loadTasks,
  loadVendorBills,
} from "@/lib/buildosShared";

function formatCurrency(value?: number, fallback = "Not set") {
  if (typeof value !== "number" || !Number.isFinite(value)) {
    return fallback;
  }

  return new Intl.NumberFormat("en-CA", {
    style: "currency",
    currency: "CAD",
    maximumFractionDigits: 0,
  }).format(value);
}

function formatDate(value?: string) {
  if (!value) {
    return "Not set";
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

function getStatusClass(status?: string) {
  const normalized = status?.toLowerCase();

  if (normalized === "active") {
    return "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300";
  }

  if (normalized === "pre-construction") {
    return "bg-amber-500/10 text-amber-700 dark:text-amber-300";
  }

  if (normalized === "completed" || normalized === "warranty") {
    return "bg-slate-500/10 text-slate-700 dark:text-slate-300";
  }

  return "bg-muted text-muted-foreground";
}

export default function ManagementProjectDetails() {
  const [searchParams] = useSearchParams();
  const projectId = searchParams.get("id");

  const {
    data: project,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["management-project", projectId],
    queryFn: () => fetchManagementProjectById(projectId || ""),
    enabled: Boolean(projectId),
  });
  const { data: contacts = [] } = useQuery({
    queryKey: ["buildos-master-database"],
    queryFn: async () => loadMasterDatabaseRecords(),
  });
  const { data: changeOrders = [] } = useQuery({
    queryKey: ["buildos-change-orders"],
    queryFn: async () => loadChangeOrders(),
  });
  const { data: dailyLogs = [] } = useQuery({
    queryKey: ["buildos-daily-logs"],
    queryFn: async () => loadDailyLogs(),
  });
  const { data: deficiencies = [] } = useQuery({
    queryKey: ["buildos-deficiencies"],
    queryFn: async () => loadDeficiencies(),
  });
  const { data: clientInvoices = [] } = useQuery({
    queryKey: ["buildos-client-invoices"],
    queryFn: async () => loadClientInvoices(),
  });
  const { data: vendorBills = [] } = useQuery({
    queryKey: ["buildos-vendor-bills"],
    queryFn: async () => loadVendorBills(),
  });
  const { data: documents = [] } = useQuery({
    queryKey: ["buildos-documents"],
    queryFn: async () => loadBuildOsDocuments(),
  });
  const { data: tasks = [] } = useQuery({
    queryKey: ["buildos-tasks"],
    queryFn: async () => loadTasks(),
  });
  const { data: participantAssignment } = useQuery({
    queryKey: ["buildos-project-participants", projectId],
    queryFn: async () =>
      projectId ? (await getProjectParticipantAssignment(projectId)) || null : null,
    enabled: Boolean(projectId),
  });

  const diligenceLinks = [
    {
      href: project?.development_permit_pdf,
      label: "Development permit",
    },
    {
      href: project?.building_permit_pdf,
      label: "Building permit",
    },
    {
      href: project?.real_property_report,
      label: "Real property report",
    },
  ].filter((item) => item.href);

  const controlGaps = project ? getProjectControlGaps(project) : [];
  const activityTimeline = project ? buildProjectActivity(project) : [];
  const linkedContacts = project ? getLinkedProjectRecords(contacts, project.id) : [];
  const controlSnapshot = project
    ? buildProjectControlSnapshot({
        assignment: participantAssignment,
        changeOrders,
        clientInvoices,
        deficiencies,
        documents,
        project,
        records: contacts,
        tasks,
        vendorBills,
      })
    : null;
  const projectAlerts = controlSnapshot?.alerts || [];
  const linkedChangeOrders = project ? changeOrders.filter((item) => item.projectId === project.id) : [];
  const linkedDailyLogs = project ? dailyLogs.filter((item) => item.projectId === project.id) : [];
  const linkedDeficiencies = project ? deficiencies.filter((item) => item.projectId === project.id) : [];
  const linkedInvoices = project ? clientInvoices.filter((item) => item.projectId === project.id) : [];
  const linkedBills = project ? vendorBills.filter((item) => item.projectId === project.id) : [];
  const linkedDocuments = project ? documents.filter((item) => item.projectId === project.id) : [];
  const linkedTasks = project ? tasks.filter((item) => item.projectId === project.id) : [];
  const auditSnapshot = project
    ? buildProjectAuditSnapshot({
        assignment: participantAssignment,
        changeOrders,
        clientInvoices,
        dailyLogs,
        documents,
        projectId: project.id,
        records: contacts,
        tasks,
        vendorBills,
      })
    : null;
  const participantIds = participantAssignment
    ? [
        participantAssignment.sellerSideRealtorId,
        participantAssignment.buyerSideRealtorId,
        participantAssignment.sellerSideLawyerId,
        participantAssignment.buyerSideLawyerId,
        ...participantAssignment.stakeholderClientIds,
        ...participantAssignment.buyerIds,
        ...participantAssignment.lenderIds,
        ...participantAssignment.investorIds,
        ...participantAssignment.otherRecordIds,
      ].filter((item): item is string => Boolean(item))
    : [];
  const explicitParticipants = linkedContacts.filter((contact) => participantIds.includes(contact.id));

  return (
    <ManagementLayout currentPageName="projects">
      <div className="space-y-6">
        <div className="flex items-center justify-between gap-4">
          <div>
            <Button
              asChild
              variant="ghost"
              className="mb-3 rounded-full px-0 text-muted-foreground hover:bg-transparent"
            >
              <Link to="/management/projects">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to projects
              </Link>
            </Button>

            <h1 className="text-3xl font-bold text-foreground">
              {isLoading ? "Loading project..." : project?.project_name || "Project details"}
            </h1>
          </div>
        </div>

        {isLoading ? (
          <Card className="dashboard-panel p-2">
            <CardContent className="p-6 text-sm text-muted-foreground">
              Loading project record...
            </CardContent>
          </Card>
        ) : error || !project ? (
          <Card className="dashboard-panel p-2">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-foreground">
                <TriangleAlert className="h-5 w-5 text-rose-500" />
                Project record unavailable
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm leading-6 text-muted-foreground">
              <p>The requested project could not be loaded from the management API.</p>
              <p>Return to the project registry and verify the project ID and source data.</p>
            </CardContent>
          </Card>
        ) : (
          <>
            <Card className="dashboard-panel p-2">
              <CardContent className="space-y-4 p-6">
                <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <h2 className="text-2xl font-semibold text-foreground">{project.project_name}</h2>
                      <Badge className={`rounded-full ${getStatusClass(project.status)}`}>
                        {project.status}
                      </Badge>
                      {controlSnapshot ? (
                        <Badge
                          className={
                            controlSnapshot.projectHealth === "Critical"
                              ? "rounded-full bg-rose-500/10 text-rose-700 dark:text-rose-300"
                              : controlSnapshot.projectHealth === "Warning"
                                ? "rounded-full bg-amber-500/10 text-amber-700 dark:text-amber-300"
                                : "rounded-full bg-emerald-500/10 text-emerald-700 dark:text-emerald-300"
                          }
                        >
                          {controlSnapshot.projectHealth}
                        </Badge>
                      ) : null}
                    </div>
                    <p className="mt-3 flex items-center gap-2 text-sm text-muted-foreground">
                      <MapPin className="h-4 w-4 text-enc-orange" />
                      {project.civic_address}
                    </p>
                    <p className="mt-3 max-w-3xl text-sm leading-6 text-muted-foreground">
                      {project.scope_subject
                        ? `${project.scope_subject}${project.scope_summary ? ` — ${project.scope_summary}` : ""}`
                        : "Add a scope subject and summary so this job has a clear contract-control headline."}
                    </p>
                  </div>
                  <div className="rounded-2xl border border-border/80 bg-background/80 px-4 py-3 text-sm text-muted-foreground">
                    Last noted milestone: {project.next_milestone || "Not set"}
                  </div>
                </div>

                <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                  <div className="dashboard-item p-4">
                    <p className="text-sm font-medium text-foreground">Budget baseline</p>
                    <p className="mt-2 text-sm text-muted-foreground">
                      {formatCurrency(project.estimated_budget)}
                    </p>
                  </div>
                  <div className="dashboard-item p-4">
                    <p className="text-sm font-medium text-foreground">Contracted revenue</p>
                    <p className="mt-2 text-sm text-muted-foreground">
                      {formatCurrency(project.contracted_revenue || project.selling_price)}
                    </p>
                  </div>
                  <div className="dashboard-item p-4">
                    <p className="text-sm font-medium text-foreground">Target completion</p>
                    <p className="mt-2 text-sm text-muted-foreground">
                      {formatDate(project.estimated_end_date)}
                    </p>
                  </div>
                  <div className="dashboard-item p-4">
                    <p className="text-sm font-medium text-foreground">Warranty start</p>
                    <p className="mt-2 text-sm text-muted-foreground">
                      {formatDate(project.warranty_start_date)}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {controlSnapshot ? <ProjectCommandCenter snapshot={controlSnapshot} /> : null}

            <div className="grid gap-6 xl:grid-cols-[minmax(0,1.2fr)_minmax(340px,0.92fr)]">
              {controlSnapshot ? (
                <ProjectProfitScopeControl project={project} snapshot={controlSnapshot} />
              ) : null}

              <div className="space-y-6">
                <Card className="dashboard-panel p-2">
                  <CardHeader>
                    <CardTitle className="text-xl text-foreground">
                      Stakeholders & deal participants
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {controlSnapshot ? (
                      <div className="dashboard-item p-4">
                        <p className="text-sm font-semibold text-foreground">Visible participant layer</p>
                        <div className="mt-3 flex flex-wrap gap-2">
                          {[
                            `Stakeholders ${controlSnapshot.participantCounts.stakeholders}`,
                            `Buyers ${controlSnapshot.participantCounts.buyers}`,
                            `Realtors ${controlSnapshot.participantCounts.realtors}`,
                            `Lawyers ${controlSnapshot.participantCounts.lawyers}`,
                            `Lenders ${controlSnapshot.participantCounts.lenders}`,
                            `Investors ${controlSnapshot.participantCounts.investors}`,
                          ].map((item) => (
                            <Badge key={item} className="rounded-full bg-muted text-muted-foreground">
                              {item}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    ) : null}

                    <div className="dashboard-item p-4 text-sm leading-6 text-muted-foreground">
                      Assign seller-side and buyer-side parties directly from Master Database so this project stays structured for operations, reporting, and future external product use.
                    </div>
                    <ProjectParticipantsEditor projectId={project.id} />

                    {(explicitParticipants.length || linkedContacts.length) ? (
                      (explicitParticipants.length ? explicitParticipants : linkedContacts).map((contact) => (
                        <div key={contact.id} className="dashboard-item p-4">
                          <div className="flex flex-wrap items-center gap-2">
                            <p className="text-sm font-semibold text-foreground">
                              {contact.companyName || contact.personName}
                            </p>
                            <Badge className="rounded-full bg-muted text-muted-foreground">
                              {contact.type}
                            </Badge>
                            {contact.dealSide && contact.dealSide !== "n/a" ? (
                              <Badge className="rounded-full bg-enc-orange/10 text-enc-orange">
                                {contact.dealSide} side
                              </Badge>
                            ) : null}
                          </div>
                          <p className="mt-2 text-sm text-muted-foreground">
                            {contact.role || contact.titleRole || "Relationship role not set"}
                          </p>
                        </div>
                      ))
                    ) : (
                      <div className="dashboard-item p-4 text-sm leading-6 text-muted-foreground">
                        No deal participants are linked yet. Use Master Database to link stakeholders, buyers, realtors, lawyers, lenders, or vendors to this project.
                      </div>
                    )}
                  </CardContent>
                </Card>

                <Card className="dashboard-panel p-2">
                  <CardHeader>
                    <CardTitle className="text-xl text-foreground">Vendor memory</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {controlSnapshot && controlSnapshot.topVendors.length ? (
                      <div className="dashboard-item p-4">
                        <p className="text-sm font-semibold text-foreground">Top vendors</p>
                        <div className="mt-3 space-y-3">
                          {controlSnapshot.topVendors.map((vendor) => (
                            <div key={vendor.id} className="rounded-2xl border border-border/70 bg-background/70 p-3">
                              <div className="flex flex-wrap items-center gap-2">
                                <p className="text-sm font-medium text-foreground">{vendor.label}</p>
                                <Badge className="rounded-full bg-emerald-500/10 text-emerald-700 dark:text-emerald-300">
                                  {vendor.averageScore ? `${vendor.averageScore.toFixed(1)}/5` : "No score"}
                                </Badge>
                              </div>
                              <p className="mt-2 text-sm text-muted-foreground">
                                {vendor.deficiencyCount} recorded issue{vendor.deficiencyCount === 1 ? "" : "s"} | Work again: {vendor.workAgain}
                              </p>
                            </div>
                          ))}
                        </div>
                      </div>
                    ) : null}

                    {controlSnapshot && controlSnapshot.useWithCautionVendors.length ? (
                      <div className="dashboard-item p-4">
                        <p className="text-sm font-semibold text-foreground">Use with caution</p>
                        <div className="mt-3 flex flex-wrap gap-2">
                          {controlSnapshot.useWithCautionVendors.map((vendor) => (
                            <Badge key={vendor.id} className="rounded-full bg-amber-500/10 text-amber-700 dark:text-amber-300">
                              {vendor.label}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    ) : null}

                    {controlSnapshot && controlSnapshot.vendorsToAvoid.length ? (
                      <div className="dashboard-item p-4">
                        <p className="text-sm font-semibold text-foreground">Do not use / high risk</p>
                        <div className="mt-3 flex flex-wrap gap-2">
                          {controlSnapshot.vendorsToAvoid.map((vendor) => (
                            <Badge key={vendor.id} className="rounded-full bg-rose-500/10 text-rose-700 dark:text-rose-300">
                              {vendor.label}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    ) : null}

                    {controlSnapshot &&
                    !controlSnapshot.topVendors.length &&
                    !controlSnapshot.useWithCautionVendors.length &&
                    !controlSnapshot.vendorsToAvoid.length ? (
                      <div className="dashboard-item p-4 text-sm leading-6 text-muted-foreground">
                        Link vendor records from Master Database to turn this project into a memory-based operating view instead of a one-job list.
                      </div>
                    ) : null}
                  </CardContent>
                </Card>
              </div>
            </div>

            <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_minmax(320px,0.9fr)]">
              <Card className="dashboard-panel p-2">
                <CardHeader>
                  <CardTitle className="text-xl text-foreground">Execution tasks</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {linkedTasks.length ? (
                    linkedTasks.slice(0, 6).map((task) => (
                      <div key={task.id} className="dashboard-item p-4">
                        <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                          <div>
                            <div className="flex flex-wrap items-center gap-2">
                              <p className="text-sm font-semibold text-foreground">{task.title}</p>
                              <Badge className="rounded-full bg-muted text-muted-foreground">
                                {task.status}
                              </Badge>
                              {task.milestone ? (
                                <Badge className="rounded-full bg-enc-orange/10 text-enc-orange">
                                  Milestone
                                </Badge>
                              ) : null}
                            </div>
                            <p className="mt-2 text-sm text-muted-foreground">
                              {task.phase} · Assignee: {getTaskAssigneeLabel(task, contacts)}
                            </p>
                            <p className="mt-2 text-sm text-muted-foreground">
                              {task.startDate || "Start TBD"} to {task.dueDate || "Due TBD"}
                            </p>
                          </div>
                          <div className="rounded-2xl border border-border/70 bg-background/80 px-4 py-3 text-sm text-muted-foreground">
                            {task.percentComplete}% complete
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="dashboard-item p-4 text-sm leading-6 text-muted-foreground">
                      No tasks are linked to this project yet. Use Project Tasks to start execution control.
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card className="dashboard-panel p-2">
                <CardHeader>
                  <CardTitle className="text-xl text-foreground">Documents & diligence</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {linkedDocuments.length ? (
                    linkedDocuments.map((item) => (
                      <div key={item.id} className="dashboard-item p-4">
                        <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                          <div>
                            <p className="text-sm font-semibold text-foreground">{item.title}</p>
                            <p className="mt-2 text-sm text-muted-foreground">
                              {item.documentType}
                              {item.versionLabel ? ` · ${item.versionLabel}` : ""}
                              {item.expiryDate ? ` · Expires ${formatDate(item.expiryDate)}` : ""}
                            </p>
                          </div>
                          {item.url ? (
                            <a
                              href={item.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-2 text-sm text-muted-foreground"
                            >
                              Preview
                              <ExternalLink className="h-4 w-4" />
                            </a>
                          ) : null}
                        </div>
                      </div>
                    ))
                  ) : null}

                  {diligenceLinks.length ? (
                    diligenceLinks.map((item) => (
                      <a
                        key={item.label}
                        href={item.href}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="dashboard-item flex items-center justify-between gap-4 p-4"
                      >
                        <div className="flex items-center gap-3">
                          <FileText className="h-4 w-4 text-enc-orange" />
                          <span className="text-sm font-medium text-foreground">{item.label}</span>
                        </div>
                        <ExternalLink className="h-4 w-4 text-muted-foreground" />
                      </a>
                    ))
                  ) : !linkedDocuments.length ? (
                    <div className="dashboard-item p-4 text-sm leading-6 text-muted-foreground">
                      No permit or diligence links are attached to this project yet. Keep lender/client-facing references offline until these records are linked.
                    </div>
                  ) : null}
                </CardContent>
              </Card>
            </div>

            <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_minmax(320px,0.9fr)]">
              <Card className="dashboard-panel p-2">
                <CardHeader>
                  <CardTitle className="text-xl text-foreground">Live module summary</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {[
                    `${linkedChangeOrders.length} linked change order(s)`,
                    `${linkedTasks.length} linked task(s)`,
                    `${linkedDailyLogs.length} daily log entr${linkedDailyLogs.length === 1 ? "y" : "ies"}`,
                    `${linkedDeficiencies.filter((item) => item.status !== "Closed").length} open deficiency item(s)`,
                    `${linkedInvoices.length} client invoice(s)`,
                    `${linkedBills.length} vendor bill(s)`,
                    ...controlGaps,
                  ].map((item) => (
                    <div key={item} className="dashboard-item p-4 text-sm leading-6 text-muted-foreground">
                      {item}
                    </div>
                  ))}
                </CardContent>
              </Card>

              <Card className="dashboard-panel p-2">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-xl text-foreground">
                    <History className="h-5 w-5 text-enc-orange" />
                    Activity timeline
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {activityTimeline.length ? (
                    activityTimeline.map((entry) => (
                      <div key={entry.id} className="dashboard-item p-4">
                        <div className="flex flex-col gap-2 lg:flex-row lg:items-start lg:justify-between">
                          <div>
                            <p className="text-sm font-semibold text-foreground">{entry.label}</p>
                            <p className="mt-2 text-sm leading-6 text-muted-foreground">
                              {entry.detail}
                            </p>
                          </div>
                          <div className="rounded-2xl border border-border/70 bg-background/80 px-4 py-3 text-sm text-muted-foreground">
                            {formatDate(entry.date)}
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="dashboard-item p-4 text-sm leading-6 text-muted-foreground">
                      No dated activity history has been recorded for this project yet.
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {auditSnapshot ? (
              <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_320px]">
                <Card className="dashboard-panel p-2">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-xl text-foreground">
                      <History className="h-5 w-5 text-enc-orange" />
                      Record change visibility
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {auditSnapshot.entries.length ? (
                      auditSnapshot.entries.slice(0, 8).map((entry) => (
                        <div key={entry.id} className="dashboard-item p-4">
                          <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                            <div>
                              <div className="flex flex-wrap items-center gap-2">
                                <p className="text-sm font-semibold text-foreground">{entry.title}</p>
                                <Badge className="rounded-full bg-muted text-muted-foreground">
                                  {entry.module}
                                </Badge>
                                <Badge
                                  className={
                                    entry.actorKnown
                                      ? "rounded-full bg-emerald-500/10 text-emerald-700 dark:text-emerald-300"
                                      : "rounded-full bg-amber-500/10 text-amber-700 dark:text-amber-300"
                                  }
                                >
                                  {entry.actorKnown ? entry.actor : "Actor not recorded"}
                                </Badge>
                              </div>
                              <p className="mt-2 text-sm leading-6 text-muted-foreground">
                                {entry.detail}
                              </p>
                            </div>
                            <div className="rounded-2xl border border-border/70 bg-background/80 px-4 py-3 text-sm text-muted-foreground">
                              {formatDate(entry.changedAt)}
                            </div>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="dashboard-item p-4 text-sm leading-6 text-muted-foreground">
                        No linked BuildOS records are available yet to build an audit-style project change feed.
                      </div>
                    )}
                  </CardContent>
                </Card>

                <Card className="dashboard-panel p-2">
                  <CardHeader>
                    <CardTitle className="text-xl text-foreground">Audit posture</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3 text-sm text-muted-foreground">
                    <div className="dashboard-item p-4">
                      <p className="font-medium text-foreground">Actor coverage</p>
                      <p className="mt-2 leading-6">
                        {auditSnapshot.actorCoverage}% of the tracked project changes currently identify who made the update.
                      </p>
                    </div>
                    <div className="dashboard-item p-4">
                      <p className="font-medium text-foreground">Tracked modules</p>
                      <p className="mt-2 leading-6">
                        {auditSnapshot.trackedModules.length
                          ? auditSnapshot.trackedModules.join(", ")
                          : "No modules linked yet"}
                      </p>
                    </div>
                    <div className="dashboard-item p-4">
                      <p className="font-medium text-foreground">Next hardening target</p>
                      <p className="mt-2 leading-6">
                        BuildOS now shows who changed what at a practical record level. Richer field-level diffs and server-side immutable audit inspection remain future upgrades, not fake promises.
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </div>
            ) : null}

            <Card className="dashboard-panel p-2">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-xl text-foreground">
                  <MessageSquare className="h-5 w-5 text-enc-orange" />
                  Communication record
                </CardTitle>
              </CardHeader>
              <CardContent className="grid gap-4 xl:grid-cols-[minmax(0,0.95fr)_minmax(0,1.05fr)]">
                <div className="space-y-3">
                  <div className="dashboard-item p-4">
                    <p className="flex items-center gap-2 text-sm font-medium text-foreground">
                      <UserRound className="h-4 w-4 text-enc-orange" />
                      Project owner / manager
                    </p>
                    <p className="mt-2 text-sm text-muted-foreground">
                      {project.project_manager || project.project_owner || "Not assigned"}
                    </p>
                    <p className="mt-2 text-sm text-muted-foreground">
                      Primary contact: {project.primary_contact_email || "No project contact email has been recorded."}
                    </p>
                  </div>
                  <div className="dashboard-item p-4">
                    <p className="flex items-center gap-2 text-sm font-medium text-foreground">
                      <CalendarClock className="h-4 w-4 text-enc-orange" />
                      Next milestone
                    </p>
                    <p className="mt-2 text-sm text-muted-foreground">
                      {project.next_milestone || "No upcoming milestone is recorded yet."}
                    </p>
                    <p className="mt-2 text-sm text-muted-foreground">
                      Zoning code: {project.zoning_code || "Not set"}
                    </p>
                  </div>
                </div>

                <div className="space-y-3 text-sm leading-6 text-muted-foreground">
                  <div className="dashboard-item p-4">
                    Project emails can now be sent from the dashboard, but messages are not yet archived back into a project activity log.
                  </div>
                  <div className="dashboard-item p-4">
                    Until message archiving is implemented, treat the primary contact field and the dashboard email composer as communication aids rather than a complete CRM trail.
                  </div>
                  {projectAlerts.length ? (
                    <div className="dashboard-item p-4">
                      <p className="text-sm font-medium text-foreground">Active alerts</p>
                      <div className="mt-3 space-y-2">
                        {projectAlerts.map((alert) => (
                          <div key={alert.id} className="text-sm leading-6 text-muted-foreground">
                            {alert.title}: {alert.detail}
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : null}
                </div>
              </CardContent>
            </Card>
          </>
        )}
      </div>
    </ManagementLayout>
  );
}
