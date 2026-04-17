import ManagementLayout from "@/components/management/ManagementLayout";
import Badge from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

type ManagementModuleUnavailableProps = {
  currentPageName: string;
  title: string;
};

const moduleProfiles: Record<
  string,
  {
    status: "Beta" | "Limited" | "Planned";
    summary: string;
    reason: string;
    nextSteps: string[];
  }
> = {
  tasks: {
    status: "Planned",
    summary:
      "Project tasks will come online after task ownership, due-date rules, and project-linked CRUD are backed by durable storage.",
    reason:
      "Task views should not go live until assignment, overdue logic, and audit-safe updates work consistently.",
    nextSteps: [
      "Add project-linked task records with assignee and due date validation.",
      "Surface overdue and completed states in the project dashboard.",
      "Add mobile-first quick actions for field updates.",
    ],
  },
  "gantt-chart": {
    status: "Beta",
    summary:
      "Schedule sequencing is next in line, but predecessor logic and delay awareness still need controlled rollout.",
    reason:
      "A Gantt view is only useful if milestones, dependencies, and schedule drift are trustworthy.",
    nextSteps: [
      "Back tasks with predecessor and successor relationships.",
      "Sync schedule slippage with project health signals.",
      "Keep release behind a beta feature flag until task data is stable.",
    ],
  },
  estimator: {
    status: "Planned",
    summary:
      "Estimating is reserved for a later pass once cost code structure and reusable estimate templates exist.",
    reason:
      "Loose estimate screens can create false confidence if pricing logic is not grounded in real categories and approval flow.",
    nextSteps: [
      "Define cost code structure and estimate sections.",
      "Support versioned estimate drafts and revisions.",
      "Connect approved estimates to project budget baselines.",
    ],
  },
  "client-selections": {
    status: "Planned",
    summary:
      "Client selections need product options, approval history, and document support before they should be exposed.",
    reason:
      "Selections become risky when there is no controlled record of approved choices or downstream cost impact.",
    nextSteps: [
      "Add selection categories and version history.",
      "Link approved selections to change orders where applicable.",
      "Add client-facing export support later in the rollout.",
    ],
  },
  automation: {
    status: "Beta",
    summary:
      "Automation will stay controlled and suggestion-based until alert rules and confirmation flows are stable.",
    reason:
      "ENCI BuildOS should prepare reminders and summaries, not auto-fire actions that operators cannot verify.",
    nextSteps: [
      "Expand rule-based alerts from finance, documents, and deficiencies.",
      "Generate draft reminders and report packs only.",
      "Require user confirmation before any outbound action.",
    ],
  },
  "mobile-tasks": {
    status: "Beta",
    summary:
      "Mobile tasks will return once field updates can safely write into the same task model used by desktop operations.",
    reason:
      "A field tool is only valuable if it updates the same source of truth as the office workflow.",
    nextSteps: [
      "Finish the shared task model first.",
      "Add tap-friendly quick updates and photo support.",
      "Release as a limited beta after mobile smoke testing.",
    ],
  },
};

export default function ManagementModuleUnavailable({
  currentPageName,
  title,
}: ManagementModuleUnavailableProps) {
  const profile = moduleProfiles[currentPageName] || {
    status: "Planned" as const,
    summary:
      "This module is intentionally held back until its backend, validation, and workflow path are ready for real use.",
    reason:
      "Showing a decorative shell would weaken trust more than an honest limited state.",
    nextSteps: [
      "Define the source-of-truth data model.",
      "Validate write paths and permissions.",
      "Promote the module only after stable smoke testing.",
    ],
  };

  return (
    <ManagementLayout currentPageName={currentPageName}>
      <div className="space-y-6">
        <div className="dashboard-panel overflow-hidden p-8">
          <div className="absolute inset-y-0 right-0 w-44 bg-gradient-to-l from-enc-yellow/10 via-enc-orange/10 to-transparent" />
          <div className="relative">
            <div className="flex flex-wrap items-center gap-3">
              <p className="text-xs font-semibold uppercase tracking-[0.3em] text-enc-orange">
                ENCI BuildOS Module Status
              </p>
              <Badge
                className={
                  profile.status === "Beta"
                    ? "rounded-full bg-amber-500/10 text-amber-700 dark:text-amber-300"
                    : profile.status === "Limited"
                      ? "rounded-full bg-sky-500/10 text-sky-700 dark:text-sky-300"
                      : "rounded-full bg-muted text-muted-foreground"
                }
              >
                {profile.status}
              </Badge>
            </div>
            <h1 className="mt-3 text-3xl font-bold text-foreground">{title}</h1>
            <p className="mt-4 max-w-4xl text-sm leading-6 text-muted-foreground">
              {profile.summary}
            </p>
          </div>
        </div>

        <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_340px]">
          <Card className="dashboard-panel p-2">
            <CardHeader>
              <CardTitle className="text-foreground">Why this stays limited</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm leading-6 text-muted-foreground">
              <p>{profile.reason}</p>
              <p>
                This is an intentional product discipline choice. ENCI BuildOS should never
                show decorative enterprise-looking screens that cannot support real builder
                operations.
              </p>
            </CardContent>
          </Card>

          <Card className="dashboard-panel p-2">
            <CardHeader>
              <CardTitle className="text-foreground">Readiness path</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm leading-6 text-muted-foreground">
              {profile.nextSteps.map((step) => (
                <div key={step} className="dashboard-item p-3">
                  {step}
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    </ManagementLayout>
  );
}
