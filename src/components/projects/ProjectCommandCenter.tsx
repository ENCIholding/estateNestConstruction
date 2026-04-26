import type { ReactNode } from "react";
import Badge from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { ProjectControlSnapshot } from "@/lib/projectControl";
import { cn } from "@/lib/utils";

type ProjectCommandCenterProps = {
  snapshot: ProjectControlSnapshot;
};

function formatCurrency(value?: number | null, fallback = "Not set") {
  if (typeof value !== "number" || !Number.isFinite(value)) {
    return fallback;
  }

  return new Intl.NumberFormat("en-CA", {
    style: "currency",
    currency: "CAD",
    maximumFractionDigits: 0,
  }).format(value);
}

function toneClasses(tone: ProjectControlSnapshot["financialHealthTone"]) {
  if (tone === "red") {
    return "bg-rose-500/10 text-rose-700 dark:text-rose-300";
  }

  if (tone === "yellow") {
    return "bg-amber-500/10 text-amber-700 dark:text-amber-300";
  }

  return "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300";
}

function DetailCard({
  detail,
  label,
  value,
}: {
  detail: string;
  label: string;
  value: ReactNode;
}) {
  return (
    <div className="dashboard-item p-4">
      <p className="text-sm font-medium text-foreground">{label}</p>
      <div className="mt-2 text-base font-semibold text-foreground">{value}</div>
      <p className="mt-2 text-sm leading-6 text-muted-foreground">{detail}</p>
    </div>
  );
}

export default function ProjectCommandCenter({
  snapshot,
}: ProjectCommandCenterProps) {
  return (
    <Card className="dashboard-panel p-2">
      <CardHeader>
        <CardTitle className="text-2xl text-foreground">Project Command Center</CardTitle>
        <p className="mt-2 text-sm text-muted-foreground">
          One-screen operating view of money, schedule, scope, risk, relationship presence, and the next decisions that matter.
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-6">
          <DetailCard
            label="Financial Health"
            value={
              <Badge className={cn("rounded-full", toneClasses(snapshot.financialHealthTone))}>
                {snapshot.projectHealth}
              </Badge>
            }
            detail={snapshot.financialHealthDetail}
          />
          <DetailCard
            label="Schedule Status"
            value={
              <Badge className={cn("rounded-full", toneClasses(snapshot.scheduleTone))}>
                {snapshot.scheduleLabel}
              </Badge>
            }
            detail={snapshot.scheduleDetail}
          />
          <DetailCard
            label="Cash Position"
            value={
              <div className="flex flex-wrap items-center gap-2">
                <span>{formatCurrency(snapshot.cashPosition)}</span>
                <Badge className={cn("rounded-full", toneClasses(snapshot.cashPositionTone))}>
                  {snapshot.cashPositionLabel}
                </Badge>
              </div>
            }
            detail={snapshot.cashPositionDetail}
          />
          <DetailCard
            label="Pending Change Orders"
            value={formatCurrency(snapshot.projectSummary.pendingChangeOrderExposure)}
            detail={`${snapshot.pendingChangeOrderCount} item(s) pending | ${snapshot.pendingChangeOrderAgingDays} day max approval aging`}
          />
          <DetailCard
            label="Critical Issues"
            value={snapshot.criticalIssueCount}
            detail="Critical alerts, severe deficiencies, and do-not-use vendor warnings tied to this job."
          />
          <div className="dashboard-item p-4 md:col-span-2 xl:col-span-1">
            <p className="text-sm font-medium text-foreground">Next 3 Actions</p>
            <ul className="mt-3 space-y-2 text-sm leading-6 text-muted-foreground">
              {snapshot.nextThreeActions.length ? (
                snapshot.nextThreeActions.map((action) => <li key={action}>{action}</li>)
              ) : (
                <li>No immediate action is currently being generated.</li>
              )}
            </ul>
          </div>
        </div>

        <div className="grid gap-4 xl:grid-cols-[minmax(0,1.15fr)_minmax(320px,0.85fr)]">
          <div className="dashboard-item p-4">
            <p className="text-sm font-semibold text-foreground">Simple Risk Layer</p>
            <div className="mt-3 grid gap-3 md:grid-cols-3">
              {snapshot.riskSignals.map((risk) => (
                <div key={risk.label} className="rounded-2xl border border-border/70 bg-background/70 p-4">
                  <div className="flex items-center justify-between gap-3">
                    <p className="text-sm font-medium text-foreground">{risk.label}</p>
                    <Badge className={cn("rounded-full", toneClasses(risk.tone))}>
                      {risk.level}
                    </Badge>
                  </div>
                  <p className="mt-3 text-sm leading-6 text-muted-foreground">{risk.detail}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="dashboard-item p-4">
            <p className="text-sm font-semibold text-foreground">Deal Participant Presence</p>
            <p className="mt-2 text-sm leading-6 text-muted-foreground">
              These roles stay visible here so the project is managed as a real deal, not just a task list.
            </p>
            <div className="mt-3 flex flex-wrap gap-2">
              {[
                `Stakeholders ${snapshot.participantCounts.stakeholders}`,
                `Buyers ${snapshot.participantCounts.buyers}`,
                `Realtors ${snapshot.participantCounts.realtors}`,
                `Lawyers ${snapshot.participantCounts.lawyers}`,
                `Lenders ${snapshot.participantCounts.lenders}`,
                `Investors ${snapshot.participantCounts.investors}`,
                `Vendors ${snapshot.participantCounts.vendors}`,
              ].map((item) => (
                <Badge key={item} className="rounded-full bg-muted text-muted-foreground">
                  {item}
                </Badge>
              ))}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
