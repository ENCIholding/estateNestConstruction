import { useEffect, useMemo, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  REVISION_AUTHORITIES,
  REVISION_DISCIPLINES,
  REVISION_SEVERITIES,
  REVISION_STATUSES,
  type RevisionAuthority,
  type RevisionComment,
  type RevisionDiscipline,
  type RevisionProjectOption,
  type RevisionSeverity,
  type RevisionStatus,
} from "@/data/revisionSeedData";

type RevisionFormState = {
  projectId: string;
  dateReceived: string;
  authority: RevisionAuthority | "";
  reviewerName: string;
  discipline: RevisionDiscipline | "";
  severity: RevisionSeverity | "";
  status: RevisionStatus | "";
  dueDate: string;
  assignedTo: string;
  sourceDocument: string;
  relatedSheet: string;
  codeReference: string;
  commentSummary: string;
  resolutionSummary: string;
  dateResolved: string;
  lessonsLearned: string;
  attachmentsPlaceholder: string;
  internalNotes: string;
};

export type RevisionFormSubmission = {
  projectId: string;
  projectName: string;
  projectAddress: string;
  dateReceived: string;
  authority: RevisionAuthority;
  reviewerName: string;
  discipline: RevisionDiscipline;
  severity: RevisionSeverity;
  status: RevisionStatus;
  dueDate?: string;
  assignedTo: string;
  sourceDocument?: string;
  relatedSheet?: string;
  codeReference?: string;
  commentSummary: string;
  resolutionSummary?: string;
  dateResolved?: string;
  lessonsLearned?: string;
  attachmentsPlaceholder?: string;
  internalNotes?: string;
};

type RevisionFormDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (payload: RevisionFormSubmission) => Promise<void> | void;
  revision?: RevisionComment | null;
  projectOptions: RevisionProjectOption[];
};

const EMPTY_FORM: RevisionFormState = {
  projectId: "",
  dateReceived: "",
  authority: "",
  reviewerName: "",
  discipline: "",
  severity: "",
  status: "",
  dueDate: "",
  assignedTo: "",
  sourceDocument: "",
  relatedSheet: "",
  codeReference: "",
  commentSummary: "",
  resolutionSummary: "",
  dateResolved: "",
  lessonsLearned: "",
  attachmentsPlaceholder: "",
  internalNotes: "",
};

function toFormState(revision?: RevisionComment | null): RevisionFormState {
  if (!revision) {
    return EMPTY_FORM;
  }

  return {
    projectId: revision.projectId || "",
    dateReceived: revision.dateReceived || "",
    authority: revision.authority || "",
    reviewerName: revision.reviewerName || "",
    discipline: revision.discipline || "",
    severity: revision.severity || "",
    status: revision.status || "",
    dueDate: revision.dueDate || "",
    assignedTo: revision.assignedTo || "",
    sourceDocument: revision.sourceDocument || "",
    relatedSheet: revision.relatedSheet || "",
    codeReference: revision.codeReference || "",
    commentSummary: revision.commentSummary || "",
    resolutionSummary: revision.resolutionSummary || "",
    dateResolved: revision.dateResolved || "",
    lessonsLearned: revision.lessonsLearned || "",
    attachmentsPlaceholder: revision.attachmentsPlaceholder || "",
    internalNotes: revision.internalNotes || "",
  };
}

function trimOrUndefined(value: string) {
  const trimmed = value.trim();
  return trimmed || undefined;
}

export default function RevisionFormDialog({
  open,
  onOpenChange,
  onSave,
  revision,
  projectOptions,
}: RevisionFormDialogProps) {
  const [form, setForm] = useState<RevisionFormState>(toFormState(revision));
  const [error, setError] = useState<string>("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!open) {
      return;
    }

    setForm(toFormState(revision));
    setError("");
    setSaving(false);
  }, [open, revision]);

  const selectedProject = useMemo(
    () => projectOptions.find((project) => project.id === form.projectId) || null,
    [form.projectId, projectOptions]
  );

  const updateField = <K extends keyof RevisionFormState>(
    key: K,
    value: RevisionFormState[K]
  ) => {
    setForm((current) => ({ ...current, [key]: value }));
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");

    if (!form.projectId) {
      setError("Project is required.");
      return;
    }

    if (!form.dateReceived) {
      setError("Date received is required.");
      return;
    }

    if (!form.authority) {
      setError("Authority / Department is required.");
      return;
    }

    if (!form.reviewerName.trim()) {
      setError("Reviewer name is required.");
      return;
    }

    if (!form.commentSummary.trim()) {
      setError("Comment summary is required.");
      return;
    }

    if (!form.severity) {
      setError("Severity is required.");
      return;
    }

    if (!form.status) {
      setError("Status is required.");
      return;
    }

    if (!form.assignedTo.trim()) {
      setError("Assigned to is required.");
      return;
    }

    if (!selectedProject) {
      setError("Select a valid project.");
      return;
    }

    try {
      setSaving(true);

      await onSave({
        projectId: selectedProject.id,
        projectName: selectedProject.name,
        projectAddress: selectedProject.address,
        dateReceived: form.dateReceived,
        authority: form.authority,
        reviewerName: form.reviewerName.trim(),
        discipline: form.discipline || "Other",
        severity: form.severity,
        status: form.status,
        dueDate: form.dueDate || undefined,
        assignedTo: form.assignedTo.trim(),
        sourceDocument: trimOrUndefined(form.sourceDocument),
        relatedSheet: trimOrUndefined(form.relatedSheet),
        codeReference: trimOrUndefined(form.codeReference),
        commentSummary: form.commentSummary.trim(),
        resolutionSummary: trimOrUndefined(form.resolutionSummary),
        dateResolved: form.dateResolved || undefined,
        lessonsLearned: trimOrUndefined(form.lessonsLearned),
        attachmentsPlaceholder: trimOrUndefined(form.attachmentsPlaceholder),
        internalNotes: trimOrUndefined(form.internalNotes),
      });

      onOpenChange(false);
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : "Could not save revision.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(nextOpen) => !saving && onOpenChange(nextOpen)}>
      <DialogContent className="max-h-[90vh] max-w-4xl overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{revision ? "Edit Revision" : "Add Revision"}</DialogTitle>
          <DialogDescription>
            Capture reviewer comments, ownership, due dates, and response strategy for permit and funding workflows.
          </DialogDescription>
        </DialogHeader>

        <form className="space-y-5" onSubmit={handleSubmit}>
          {error ? (
            <div className="rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700">
              {error}
            </div>
          ) : null}

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label>Project *</Label>
              <Select
                value={form.projectId || undefined}
                onValueChange={(value) => updateField("projectId", value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select project" />
                </SelectTrigger>
                <SelectContent>
                  {projectOptions.map((project) => (
                    <SelectItem key={project.id} value={project.id}>
                      {project.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">
                {selectedProject ? selectedProject.address : "Project address is filled from selected project."}
              </p>
            </div>

            <div className="space-y-2">
              <Label>Date Received *</Label>
              <Input
                type="date"
                value={form.dateReceived}
                onChange={(event) => updateField("dateReceived", event.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label>Authority / Department *</Label>
              <Select
                value={form.authority || undefined}
                onValueChange={(value) => updateField("authority", value as RevisionAuthority)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select authority" />
                </SelectTrigger>
                <SelectContent>
                  {REVISION_AUTHORITIES.map((authority) => (
                    <SelectItem key={authority} value={authority}>
                      {authority}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Reviewer Name *</Label>
              <Input
                value={form.reviewerName}
                placeholder="Reviewer name"
                onChange={(event) => updateField("reviewerName", event.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label>Discipline</Label>
              <Select
                value={form.discipline || undefined}
                onValueChange={(value) => updateField("discipline", value as RevisionDiscipline)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select discipline" />
                </SelectTrigger>
                <SelectContent>
                  {REVISION_DISCIPLINES.map((discipline) => (
                    <SelectItem key={discipline} value={discipline}>
                      {discipline}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Severity *</Label>
              <Select
                value={form.severity || undefined}
                onValueChange={(value) => updateField("severity", value as RevisionSeverity)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select severity" />
                </SelectTrigger>
                <SelectContent>
                  {REVISION_SEVERITIES.map((severity) => (
                    <SelectItem key={severity} value={severity}>
                      {severity}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Status *</Label>
              <Select
                value={form.status || undefined}
                onValueChange={(value) => updateField("status", value as RevisionStatus)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  {REVISION_STATUSES.map((status) => (
                    <SelectItem key={status} value={status}>
                      {status}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Assigned To *</Label>
              <Input
                value={form.assignedTo}
                placeholder="Assignee"
                onChange={(event) => updateField("assignedTo", event.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label>Due Date</Label>
              <Input
                type="date"
                value={form.dueDate}
                onChange={(event) => updateField("dueDate", event.target.value)}
              />
            </div>

            <div className="space-y-2 md:col-span-2">
              <Label>Comment Summary *</Label>
              <Textarea
                rows={3}
                value={form.commentSummary}
                placeholder="Reviewer comment summary"
                onChange={(event) => updateField("commentSummary", event.target.value)}
              />
            </div>

            <div className="space-y-2 md:col-span-2">
              <Label>Resolution Summary</Label>
              <Textarea
                rows={3}
                value={form.resolutionSummary}
                placeholder="Response/resolution summary"
                onChange={(event) => updateField("resolutionSummary", event.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label>Date Resolved</Label>
              <Input
                type="date"
                value={form.dateResolved}
                onChange={(event) => updateField("dateResolved", event.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label>Code Reference</Label>
              <Input
                value={form.codeReference}
                placeholder="Code citation"
                onChange={(event) => updateField("codeReference", event.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label>Related Sheet</Label>
              <Input
                value={form.relatedSheet}
                placeholder="A4.01"
                onChange={(event) => updateField("relatedSheet", event.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label>Source Document</Label>
              <Input
                value={form.sourceDocument}
                placeholder="Review letter, RFI, consultant memo"
                onChange={(event) => updateField("sourceDocument", event.target.value)}
              />
            </div>

            <div className="space-y-2 md:col-span-2">
              <Label>Lessons Learned</Label>
              <Textarea
                rows={2}
                value={form.lessonsLearned}
                placeholder="What should be prevented next time"
                onChange={(event) => updateField("lessonsLearned", event.target.value)}
              />
            </div>

            <div className="space-y-2 md:col-span-2">
              <Label>Attachments Placeholder</Label>
              <Input
                value={form.attachmentsPlaceholder}
                placeholder="Placeholder for future upload integration"
                onChange={(event) => updateField("attachmentsPlaceholder", event.target.value)}
              />
            </div>

            <div className="space-y-2 md:col-span-2">
              <Label>Internal Notes</Label>
              <Textarea
                rows={3}
                value={form.internalNotes}
                placeholder="Internal coordination notes"
                onChange={(event) => updateField("internalNotes", event.target.value)}
              />
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={saving}>
              {saving ? "Saving..." : revision ? "Save Changes" : "Add Revision"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
