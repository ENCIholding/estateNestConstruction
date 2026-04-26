import type { ReactNode } from "react";
import type { ProjectControlSnapshot } from "@/lib/projectControl";
import ProjectSignalBadgeCluster from "@/components/projects/ProjectSignalBadgeCluster";

type ProjectDecisionSupportPanelProps = {
  caption?: string;
  compact?: boolean;
  includeActions?: boolean;
  showNextActions?: boolean;
  snapshot: ProjectControlSnapshot;
  title?: string;
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

function Metric({
  detail,
  label,
  value,
}: {
  detail: string;
  label: string;
  value: ReactNode;
}) {
  return (
    <div className="rounded-2xl border border-border/70 bg-background/70 p-3">
      <p className="text-sm font-medium text-foreground">{label}</p>
      <p className="mt-2 text-sm font-semibold text-foreground">{value}</p>
      <p className="mt-2 text-xs leading-5 text-muted-foreground">{detail}</p>
    </div>
  );
}

export default function ProjectDecisionSupportPanel({
  caption = "Project-level signals that keep money, scope, and next decisions visible without bouncing across tabs.",
  compact = false,
  includeActions = true,
  showNextActions,
  snapshot,
  title = "Decision support",
}: ProjectDecisionSupportPanelProps) {
  const renderActions = typeof showNextActions === "boolean" ? showNextActions : includeActions;

  return (
    <div className="dashboard-item p-4">
      <div className="flex flex-col gap-3 xl:flex-row xl:items-start xl:justify-between">
        <div>
          <p className="text-sm font-semibold text-foreground">{title}</p>
          <p className="mt-2 text-sm leading-6 text-muted-foreground">{caption}</p>
        </div>
        <ProjectSignalBadgeCluster snapshot={snapshot} />
      </div>

      <div className={`mt-4 grid gap-3 ${compact ? "md:grid-cols-2 xl:grid-cols-2" : "md:grid-cols-2 xl:grid-cols-4"}`}>
        <Metric
          label="Current Profit"
          value={formatCurrency(snapshot.currentProfit)}
          detail="Live margin based on current cost projection."
        />
        <Metric
          label="Profit At Risk"
          value={formatCurrency(snapshot.profitAtRisk)}
          detail="Compression already visible plus pending exposure."
        />
        <Metric
          label="Pending CO Exposure"
          value={formatCurrency(snapshot.projectSummary.pendingChangeOrderExposure)}
          detail={`${snapshot.pendingChangeOrderCount} pending item(s).`}
        />
        <Metric
          label="Cash Position"
          value={formatCurrency(snapshot.cashPosition)}
          detail={snapshot.cashPositionLabel}
        />
      </div>

      {renderActions ? (
        <div className="mt-4 rounded-2xl border border-border/70 bg-background/70 p-3">
          <p className="text-sm font-medium text-foreground">Next 3 Actions</p>
          <ul className="mt-2 space-y-1 text-sm leading-6 text-muted-foreground">
            {snapshot.nextThreeActions.length ? (
              snapshot.nextThreeActions.map((action) => <li key={action}>{action}</li>)
            ) : (
              <li>No immediate action is currently being generated.</li>
            )}
          </ul>
        </div>
      ) : null}
    </div>
  );
}
