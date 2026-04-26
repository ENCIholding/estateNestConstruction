import Badge from "@/components/ui/badge";
import type { ProjectControlSnapshot, ProjectControlTone } from "@/lib/projectControl";
import { cn } from "@/lib/utils";

type ProjectSignalBadgeClusterProps = {
  className?: string;
  snapshot: ProjectControlSnapshot;
};

function toneClasses(tone: ProjectControlTone) {
  if (tone === "red") {
    return "bg-rose-500/10 text-rose-700 dark:text-rose-300";
  }

  if (tone === "yellow") {
    return "bg-amber-500/10 text-amber-700 dark:text-amber-300";
  }

  return "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300";
}

export default function ProjectSignalBadgeCluster({
  className,
  snapshot,
}: ProjectSignalBadgeClusterProps) {
  return (
    <div className={cn("flex flex-wrap gap-2", className)}>
      <Badge className={cn("rounded-full", toneClasses(snapshot.financialHealthTone))}>
        {snapshot.projectHealth}
      </Badge>
      <Badge className={cn("rounded-full", toneClasses(snapshot.scopeTone))}>
        {snapshot.scopeStatus}
      </Badge>
      {snapshot.riskSignals.map((risk) => (
        <Badge
          key={risk.label}
          className={cn("rounded-full", toneClasses(risk.tone))}
        >
          {risk.label}: {risk.level}
        </Badge>
      ))}
    </div>
  );
}
