import Badge from "@/components/ui/badge";
import type { ProjectControlSnapshot } from "@/lib/projectControl";

type ProjectParticipantPresenceProps = {
  compact?: boolean;
  snapshot: ProjectControlSnapshot;
  title?: string;
};

export default function ProjectParticipantPresence({
  compact = false,
  snapshot,
  title = "Visible relationship layer",
}: ProjectParticipantPresenceProps) {
  return (
    <div className="dashboard-item p-4">
      <p className="text-sm font-semibold text-foreground">{title}</p>
      <p className="mt-2 text-sm leading-6 text-muted-foreground">
        ENCI BuildOS keeps people tied to the job on purpose so stakeholder,
        lawyer, realtor, lender, investor, and vendor visibility stays in the
        operating view instead of hiding in notes.
      </p>
      <div className="mt-3 flex flex-wrap gap-2">
        {snapshot.participantHighlights.length ? (
          snapshot.participantHighlights.map((group) => (
            <Badge
              key={group.role}
              className="rounded-full bg-muted text-muted-foreground"
            >
              {group.role} {group.count}
            </Badge>
          ))
        ) : (
          <Badge className="rounded-full bg-muted text-muted-foreground">
            No linked participants yet
          </Badge>
        )}
      </div>

      {!compact && snapshot.participantHighlights.length ? (
        <div className="mt-4 grid gap-3 md:grid-cols-2">
          {snapshot.participantHighlights.map((group) => (
            <div
              key={`${group.role}-names`}
              className="rounded-2xl border border-border/70 bg-background/70 p-3"
            >
              <p className="text-sm font-medium text-foreground">{group.role}</p>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">
                {group.labels.length
                  ? group.labels.join(", ")
                  : "Linked records exist, but names are not visible yet."}
                {group.count > group.labels.length ? "..." : ""}
              </p>
            </div>
          ))}
        </div>
      ) : null}
    </div>
  );
}
