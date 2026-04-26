import { AlertTriangle, CheckCircle2, Info, Loader2 } from "lucide-react";
import Badge from "@/components/ui/badge";

type FormSaveStateNoticeProps = {
  isDirty: boolean;
  lastSavedAt?: string | null;
  message: string;
  saving: boolean;
};

function formatSavedAt(value?: string | null) {
  if (!value) {
    return null;
  }

  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) {
    return value;
  }

  return new Intl.DateTimeFormat("en-CA", {
    hour: "numeric",
    minute: "2-digit",
    month: "short",
    day: "numeric",
  }).format(parsed);
}

export default function FormSaveStateNotice({
  isDirty,
  lastSavedAt,
  message,
  saving,
}: FormSaveStateNoticeProps) {
  const lastSavedLabel = formatSavedAt(lastSavedAt);

  return (
    <div className="flex flex-wrap items-center gap-3 rounded-2xl border border-border/70 bg-background/70 px-4 py-3 text-sm">
      <Badge
        className={
          saving
            ? "rounded-full bg-blue-500/10 text-blue-700 dark:text-blue-300"
            : isDirty
              ? "rounded-full bg-amber-500/10 text-amber-700 dark:text-amber-300"
              : "rounded-full bg-emerald-500/10 text-emerald-700 dark:text-emerald-300"
        }
      >
        {saving ? "Saving" : isDirty ? "Unsaved changes" : "Ready"}
      </Badge>
      <div className="flex items-center gap-2 text-muted-foreground">
        {saving ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : isDirty ? (
          <AlertTriangle className="h-4 w-4 text-amber-500" />
        ) : (
          <CheckCircle2 className="h-4 w-4 text-emerald-500" />
        )}
        <span>{message}</span>
      </div>
      {lastSavedLabel ? (
        <div className="flex items-center gap-2 text-muted-foreground">
          <Info className="h-4 w-4" />
          <span>Last saved {lastSavedLabel}</span>
        </div>
      ) : null}
    </div>
  );
}
