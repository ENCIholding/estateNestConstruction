import { useEffect, useMemo, useState } from "react";
import type { FormEvent } from "react";
import { useQuery } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";
import FormSaveStateNotice from "@/components/forms/FormSaveStateNotice";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import Input from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/components/ui/sonner";
import useUnsavedChangesGuard from "@/hooks/useUnsavedChangesGuard";
import { fetchManagementProjects } from "@/lib/managementData";
import {
  BUILDOS_DOCUMENT_TYPES,
  loadMasterDatabaseRecords,
  type BuildOsDocumentRecord,
} from "@/lib/buildosShared";
import {
  getVendorInsightByRecordId,
  getVendorMemoryShortlist,
} from "@/lib/vendorMemory";

type BuildOsDocumentFormProps = {
  open: boolean;
  onClose: () => void;
  onSaved: () => void;
  onSubmitRecord: (record: Partial<BuildOsDocumentRecord>) => Promise<void>;
  record?: BuildOsDocumentRecord | null;
};

type FormState = {
  title: string;
  projectId: string;
  linkedRecordId: string;
  documentType: BuildOsDocumentRecord["documentType"];
  tags: string;
  uploader: string;
  updatedBy: string;
  uploadDate: string;
  versionLabel: string;
  versionGroup: string;
  expiryDate: string;
  requiredForProject: boolean;
  url: string;
  notes: string;
};

function buildInitialState(record?: BuildOsDocumentRecord | null): FormState {
  return {
    title: record?.title || "",
    projectId: record?.projectId || "",
    linkedRecordId: record?.linkedRecordId || "",
    documentType: record?.documentType || "Other",
    tags: (record?.tags || []).join(", "),
    uploader: record?.uploader || "",
    updatedBy: record?.updatedBy || record?.uploader || "Estate Nest Team",
    uploadDate: record?.uploadDate || new Date().toISOString().slice(0, 10),
    versionLabel: record?.versionLabel || "",
    versionGroup: record?.versionGroup || "",
    expiryDate: record?.expiryDate || "",
    requiredForProject: Boolean(record?.requiredForProject),
    url: record?.url || "",
    notes: record?.notes || "",
  };
}

export default function BuildOsDocumentForm({
  open,
  onClose,
  onSaved,
  onSubmitRecord,
  record,
}: BuildOsDocumentFormProps) {
  const [form, setForm] = useState<FormState>(buildInitialState(record));
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [initialFingerprint, setInitialFingerprint] = useState(
    JSON.stringify(buildInitialState(record))
  );
  const [lastSavedAt, setLastSavedAt] = useState<string | null>(null);

  const { data: projects = [] } = useQuery({
    queryKey: ["management-projects"],
    queryFn: fetchManagementProjects,
  });

  const { data: masterRecords = [] } = useQuery({
    queryKey: ["buildos-master-database"],
    queryFn: async () => loadMasterDatabaseRecords(),
  });

  const entityOptions = useMemo(
    () =>
      masterRecords.map((record) => ({
        id: record.id,
        label: `${record.companyName || record.personName} (${record.type})`,
      })),
    [masterRecords]
  );
  const selectedVendorInsight = useMemo(
    () => getVendorInsightByRecordId(masterRecords, form.linkedRecordId),
    [form.linkedRecordId, masterRecords]
  );
  const vendorShortlist = useMemo(
    () => getVendorMemoryShortlist(masterRecords, form.projectId || undefined),
    [form.projectId, masterRecords]
  );
  const isDirty = useMemo(
    () => JSON.stringify(form) !== initialFingerprint,
    [form, initialFingerprint]
  );
  const handleAttemptClose = useUnsavedChangesGuard({
    discardMessage:
      "Discard the unsaved document changes? This form does not autosave until you click Save.",
    isDirty,
    onConfirmClose: onClose,
    open,
    saving,
  });

  useEffect(() => {
    if (open) {
      const initialState = buildInitialState(record);
      setForm(initialState);
      setInitialFingerprint(JSON.stringify(initialState));
      setSaving(false);
      setError("");
      setLastSavedAt(null);
    }
  }, [open, record]);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");

    if (!form.title.trim()) {
      setError("Document title is required.");
      return;
    }

    if (!form.projectId && !form.linkedRecordId) {
      setError("Link the document to a project or an entity.");
      return;
    }

    try {
      setSaving(true);
      await onSubmitRecord({
        id: record?.id,
        title: form.title,
        projectId: form.projectId || undefined,
        linkedRecordId: form.linkedRecordId || undefined,
        documentType: form.documentType,
        tags: form.tags
          .split(",")
          .map((item) => item.trim())
          .filter(Boolean),
        uploader: form.uploader || undefined,
        updatedBy: form.updatedBy || form.uploader || undefined,
        uploadDate: form.uploadDate,
        versionLabel: form.versionLabel || undefined,
        versionGroup: form.versionGroup || undefined,
        expiryDate: form.expiryDate || undefined,
        requiredForProject: form.requiredForProject,
        url: form.url || undefined,
        notes: form.notes || undefined,
      });
      setInitialFingerprint(JSON.stringify(form));
      setLastSavedAt(new Date().toISOString());
      toast.success(
        record
          ? "Document changes were saved to ENCI BuildOS."
          : "Document was added to ENCI BuildOS."
      );
      onSaved();
      onClose();
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : "Failed to save document.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(nextOpen) => !nextOpen && handleAttemptClose()}>
      <DialogContent className="max-h-[90vh] max-w-4xl overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{record ? "Edit Document" : "Add Document"}</DialogTitle>
          <DialogDescription>
            Link the document to the right project or relationship so ENCI BuildOS
            can surface it in reports, compliance, and project drilldowns.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          <FormSaveStateNotice
            isDirty={isDirty}
            lastSavedAt={lastSavedAt}
            message="This form does not autosave. Click Save to persist the document in ENCI BuildOS."
            saving={saving}
          />

          {error ? (
            <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
              {error}
            </div>
          ) : null}

          <section className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label>Document title *</Label>
              <Input
                value={form.title}
                onChange={(event) =>
                  setForm((current) => ({ ...current, title: event.target.value }))
                }
              />
            </div>
            <div className="space-y-2">
              <Label>Document type</Label>
              <select
                value={form.documentType}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    documentType: event.target.value as BuildOsDocumentRecord["documentType"],
                  }))
                }
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              >
                {BUILDOS_DOCUMENT_TYPES.map((type) => (
                  <option key={type} value={type}>
                    {type}
                  </option>
                ))}
              </select>
            </div>
            <div className="space-y-2">
              <Label>Linked project</Label>
              <select
                value={form.projectId}
                onChange={(event) =>
                  setForm((current) => ({ ...current, projectId: event.target.value }))
                }
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              >
                <option value="">No project selected</option>
                {projects.map((project) => (
                  <option key={project.id} value={project.id}>
                    {project.project_name}
                  </option>
                ))}
              </select>
            </div>
            <div className="space-y-2">
              <Label>Linked entity</Label>
              <select
                value={form.linkedRecordId}
                onChange={(event) =>
                  setForm((current) => ({ ...current, linkedRecordId: event.target.value }))
                }
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              >
                <option value="">No entity selected</option>
                {entityOptions.map((option) => (
                  <option key={option.id} value={option.id}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
          </section>

          <section className="grid gap-4 md:grid-cols-3">
            <div className="space-y-2">
              <Label>Uploader</Label>
              <Input
                value={form.uploader}
                onChange={(event) =>
                  setForm((current) => ({ ...current, uploader: event.target.value }))
                }
              />
            </div>
            <div className="space-y-2">
              <Label>Updated by</Label>
              <Input
                value={form.updatedBy}
                onChange={(event) =>
                  setForm((current) => ({ ...current, updatedBy: event.target.value }))
                }
              />
            </div>
            <div className="space-y-2">
              <Label>Upload date</Label>
              <Input
                type="date"
                value={form.uploadDate}
                onChange={(event) =>
                  setForm((current) => ({ ...current, uploadDate: event.target.value }))
                }
              />
            </div>
            <div className="space-y-2">
              <Label>Expiry date</Label>
              <Input
                type="date"
                value={form.expiryDate}
                onChange={(event) =>
                  setForm((current) => ({ ...current, expiryDate: event.target.value }))
                }
              />
            </div>
            <div className="space-y-2">
              <Label>Version label</Label>
              <Input
                value={form.versionLabel}
                onChange={(event) =>
                  setForm((current) => ({ ...current, versionLabel: event.target.value }))
                }
                placeholder="v1.0"
              />
            </div>
            <div className="space-y-2">
              <Label>Version group</Label>
              <Input
                value={form.versionGroup}
                onChange={(event) =>
                  setForm((current) => ({ ...current, versionGroup: event.target.value }))
                }
                placeholder="parkallen-permit"
              />
            </div>
            <div className="space-y-2">
              <Label>Tags</Label>
              <Input
                value={form.tags}
                onChange={(event) =>
                  setForm((current) => ({ ...current, tags: event.target.value }))
                }
                placeholder="permit, lender, compliance"
              />
            </div>
          </section>

          {selectedVendorInsight || vendorShortlist.topVendors.length || vendorShortlist.cautionVendors.length || vendorShortlist.blockedVendors.length ? (
            <section className="rounded-3xl border border-border/70 bg-background/70 p-5">
              <div className="space-y-2">
                <p className="text-sm font-semibold text-foreground">Vendor memory in this workflow</p>
                <p className="text-sm leading-6 text-muted-foreground">
                  Keep vendor-linked files tied to the right trade so the document trail supports real relationship memory, not just storage.
                </p>
              </div>

              {selectedVendorInsight ? (
                <div className="mt-4 rounded-2xl border border-border/70 bg-background/80 p-4">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="text-sm font-semibold text-foreground">{selectedVendorInsight.label}</p>
                    <span className="rounded-full bg-muted px-3 py-1 text-xs text-muted-foreground">
                      {selectedVendorInsight.riskStatus}
                    </span>
                    <span className="rounded-full bg-muted px-3 py-1 text-xs text-muted-foreground">
                      {selectedVendorInsight.tradeCategory}
                    </span>
                  </div>
                  <p className="mt-3 text-sm text-muted-foreground">
                    {selectedVendorInsight.averageScore
                      ? `${selectedVendorInsight.averageScore.toFixed(1)}/5 average score`
                      : "No score recorded yet"}{" "}
                    | {selectedVendorInsight.deficiencyCount} repeat issue{selectedVendorInsight.deficiencyCount === 1 ? "" : "s"} | Work again: {selectedVendorInsight.workAgain}
                  </p>
                </div>
              ) : null}

              <div className="mt-4 grid gap-3 md:grid-cols-3">
                <div className="rounded-2xl border border-border/70 bg-background/80 p-4">
                  <p className="text-sm font-medium text-foreground">Top vendors</p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {vendorShortlist.topVendors.length ? vendorShortlist.topVendors.map((vendor) => (
                      <span key={vendor.id} className="rounded-full bg-emerald-500/10 px-3 py-1 text-xs text-emerald-700 dark:text-emerald-300">
                        {vendor.label}
                      </span>
                    )) : <span className="text-xs text-muted-foreground">No preferred vendors linked yet.</span>}
                  </div>
                </div>
                <div className="rounded-2xl border border-border/70 bg-background/80 p-4">
                  <p className="text-sm font-medium text-foreground">Use with caution</p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {vendorShortlist.cautionVendors.length ? vendorShortlist.cautionVendors.map((vendor) => (
                      <span key={vendor.id} className="rounded-full bg-amber-500/10 px-3 py-1 text-xs text-amber-700 dark:text-amber-300">
                        {vendor.label}
                      </span>
                    )) : <span className="text-xs text-muted-foreground">No caution vendors in view.</span>}
                  </div>
                </div>
                <div className="rounded-2xl border border-border/70 bg-background/80 p-4">
                  <p className="text-sm font-medium text-foreground">Do not use</p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {vendorShortlist.blockedVendors.length ? vendorShortlist.blockedVendors.map((vendor) => (
                      <span key={vendor.id} className="rounded-full bg-rose-500/10 px-3 py-1 text-xs text-rose-700 dark:text-rose-300">
                        {vendor.label}
                      </span>
                    )) : <span className="text-xs text-muted-foreground">No blocked vendors in this shortlist.</span>}
                  </div>
                </div>
              </div>
            </section>
          ) : null}

          <section className="space-y-4">
            <div className="space-y-2">
              <Label>Document URL / storage reference</Label>
              <Input
                value={form.url}
                onChange={(event) =>
                  setForm((current) => ({ ...current, url: event.target.value }))
                }
                placeholder="https://..."
              />
            </div>
            <label className="flex items-center gap-3 text-sm text-foreground">
              <input
                type="checkbox"
                checked={form.requiredForProject}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    requiredForProject: event.target.checked,
                  }))
                }
              />
              Mark as required for project readiness
            </label>
            <div className="space-y-2">
              <Label>Notes</Label>
              <Textarea
                rows={4}
                value={form.notes}
                onChange={(event) =>
                  setForm((current) => ({ ...current, notes: event.target.value }))
                }
              />
            </div>
          </section>

          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={handleAttemptClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={saving}>
              {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
              {record ? "Update Document" : "Save Document"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
