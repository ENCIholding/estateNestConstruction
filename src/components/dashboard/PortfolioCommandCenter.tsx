import type { ReactNode } from "react";
import Badge from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { PortfolioControlSnapshot, ProjectControlTone } from "@/lib/projectControl";
import { cn } from "@/lib/utils";

type PortfolioCommandCenterProps = {
  snapshot: PortfolioControlSnapshot;
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

function toneClasses(tone: ProjectControlTone) {
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

export default function PortfolioCommandCenter({
  snapshot,
}: PortfolioCommandCenterProps) {
  return (
    <Card className="dashboard-panel p-2">
      <CardHeader>
        <CardTitle className="text-2xl text-foreground">Portfolio Command Center</CardTitle>
        <p className="mt-2 text-sm text-muted-foreground">
          One-screen operating view of portfolio margin pressure, schedule recovery, cash, scope drift,
          critical issues, and the next decisions that matter across live jobs.
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-6">
          <DetailCard
            label="Financial Health"
            value={
              <Badge className={cn("rounded-full", toneClasses(snapshot.financialHealthTone))}>
                {snapshot.financialHealthLabel}
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
            value={formatCurrency(snapshot.pendingChangeOrderExposure)}
            detail={`${snapshot.pendingChangeOrderCount} item(s) are still waiting on pricing or approval.`}
          />
          <DetailCard
            label="Critical Issues"
            value={snapshot.criticalIssueCount}
            detail={snapshot.criticalIssueDetail}
          />
          <div className="dashboard-item p-4 md:col-span-2 xl:col-span-1">
            <p className="text-sm font-medium text-foreground">Next 3 Actions</p>
            <ul className="mt-3 space-y-2 text-sm leading-6 text-muted-foreground">
              {snapshot.nextThreeActions.length ? (
                snapshot.nextThreeActions.map((action) => <li key={action}>{action}</li>)
              ) : (
                <li>No immediate portfolio action is currently being generated.</li>
              )}
            </ul>
          </div>
        </div>

        <div className="grid gap-4 xl:grid-cols-[minmax(0,1.1fr)_minmax(320px,0.9fr)]">
          <div className="dashboard-item p-4">
            <p className="text-sm font-semibold text-foreground">Portfolio Pressure Signals</p>
            <div className="mt-3 flex flex-wrap gap-2">
              <Badge className="rounded-full bg-rose-500/10 text-rose-700 dark:text-rose-300">
                Critical Jobs {snapshot.criticalProjectCount}
              </Badge>
              <Badge className="rounded-full bg-amber-500/10 text-amber-700 dark:text-amber-300">
                Warning Jobs {snapshot.warningProjectCount}
              </Badge>
              <Badge className="rounded-full bg-rose-500/10 text-rose-700 dark:text-rose-300">
                Scope Drifted {snapshot.scopeDriftedCount}
              </Badge>
              <Badge className="rounded-full bg-amber-500/10 text-amber-700 dark:text-amber-300">
                Scope Pressured {snapshot.scopePressuredCount}
              </Badge>
            </div>
            <p className="mt-4 text-sm leading-6 text-muted-foreground">
              Profit at risk across active jobs is {formatCurrency(snapshot.profitAtRisk)}. This keeps
              margin compression visible before it quietly becomes a portfolio problem.
            </p>
          </div>

          <div className="dashboard-item p-4">
            <p className="text-sm font-semibold text-foreground">Operator Focus</p>
            <p className="mt-2 text-sm leading-6 text-muted-foreground">
              This panel is meant to replace scattered portfolio review screens with one quick read on
              money, scope pressure, recovery work, and the next owner-level decisions.
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

