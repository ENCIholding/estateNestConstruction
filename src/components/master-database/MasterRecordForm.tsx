import { useEffect, useMemo, useState } from "react";
import type { FormEvent } from "react";
import { useQuery } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";
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
import { fetchManagementProjects } from "@/lib/managementData";
import {
  BUILDOS_ENTITY_TYPES,
  BUILDOS_TRADE_TYPES,
  type BuildOsEntityType,
  type BuildOsMasterRecord,
} from "@/lib/buildosWorkspace";

type MasterRecordFormProps = {
  open: boolean;
  onClose: () => void;
  onSaved: () => void;
  onSubmitRecord: (record: Partial<BuildOsMasterRecord>) => Promise<void>;
  record?: BuildOsMasterRecord | null;
  forcedType?: BuildOsEntityType;
};

type MasterRecordFormState = {
  type: BuildOsEntityType;
  companyName: string;
  personName: string;
  role: string;
  titleRole: string;
  tradeCategory: string;
  secondaryTradeCategory: string;
  phone: string;
  email: string;
  address: string;
  notes: string;
  restrictedNotes: string;
  tags: string;
  status: BuildOsMasterRecord["status"];
  insuranceExpiry: string;
  licenseExpiry: string;
  linkedProjectIds: string[];
  qualityScore: string;
  pricingScore: string;
  reliabilityScore: string;
  communicationScore: string;
  timelinessScore: string;
  professionalismScore: string;
  workAgain: BuildOsMasterRecord["workAgain"];
  recommended: boolean;
  dealSide: BuildOsMasterRecord["dealSide"];
};

function buildInitialState(
  record?: BuildOsMasterRecord | null,
  forcedType?: BuildOsEntityType
): MasterRecordFormState {
  return {
    type: forcedType || record?.type || "Other",
    companyName: record?.companyName || "",
    personName: record?.personName || "",
    role: record?.role || "",
    titleRole: record?.titleRole || "",
    tradeCategory: record?.tradeCategory || "",
    secondaryTradeCategory: record?.secondaryTradeCategory || "",
    phone: record?.phone || "",
    email: record?.email || "",
    address: record?.address || "",
    notes: record?.notes || "",
    restrictedNotes: record?.restrictedNotes || "",
    tags: (record?.tags || []).join(", "),
    status: record?.status || "Active",
    insuranceExpiry: record?.insuranceExpiry || "",
    licenseExpiry: record?.licenseExpiry || "",
    linkedProjectIds: record?.linkedProjectIds || [],
    qualityScore: record?.qualityScore ? String(record.qualityScore) : "",
    pricingScore: record?.pricingScore ? String(record.pricingScore) : "",
    reliabilityScore: record?.reliabilityScore ? String(record.reliabilityScore) : "",
    communicationScore: record?.communicationScore ? String(record.communicationScore) : "",
    timelinessScore: record?.timelinessScore ? String(record.timelinessScore) : "",
    professionalismScore: record?.professionalismScore ? String(record.professionalismScore) : "",
    workAgain: record?.workAgain || "Yes",
    recommended: record?.recommended ?? true,
    dealSide: record?.dealSide || "n/a",
  };
}

function parseOptionalNumber(value: string) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : undefined;
}

export default function MasterRecordForm({
  open,
  onClose,
  onSaved,
  onSubmitRecord,
  record,
  forcedType,
}: MasterRecordFormProps) {
  const [form, setForm] = useState<MasterRecordFormState>(buildInitialState(record, forcedType));
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const isEdit = useMemo(() => Boolean(record?.id), [record?.id]);

  const { data: projects = [] } = useQuery({
    queryKey: ["management-projects"],
    queryFn: fetchManagementProjects,
  });

  useEffect(() => {
    if (open) {
      setForm(buildInitialState(record, forcedType));
      setSaving(false);
      setError("");
    }
  }, [forcedType, open, record]);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");

    if (!form.personName.trim() && !form.companyName.trim()) {
      setError("Add at least a person name or company name.");
      return;
    }

    try {
      setSaving(true);
      await onSubmitRecord({
        id: record?.id,
        type: forcedType || form.type,
        companyName: form.companyName,
        personName: form.personName,
        role: form.role,
        titleRole: form.titleRole,
        tradeCategory: form.tradeCategory,
        secondaryTradeCategory: form.secondaryTradeCategory,
        phone: form.phone,
        email: form.email,
        address: form.address,
        notes: form.notes,
        restrictedNotes: form.restrictedNotes,
        tags: form.tags
          .split(",")
          .map((item) => item.trim())
          .filter(Boolean),
        status: form.status,
        insuranceExpiry: form.insuranceExpiry || undefined,
        licenseExpiry: form.licenseExpiry || undefined,
        linkedProjectIds: form.linkedProjectIds,
        qualityScore: parseOptionalNumber(form.qualityScore),
        pricingScore: parseOptionalNumber(form.pricingScore),
        reliabilityScore: parseOptionalNumber(form.reliabilityScore),
        communicationScore: parseOptionalNumber(form.communicationScore),
        timelinessScore: parseOptionalNumber(form.timelinessScore),
        professionalismScore: parseOptionalNumber(form.professionalismScore),
        workAgain: form.workAgain,
        recommended: form.recommended,
        dealSide: form.dealSide,
      });
      onSaved();
      onClose();
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : "Failed to save record.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(nextOpen) => !nextOpen && onClose()}>
      <DialogContent className="max-h-[90vh] max-w-4xl overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {isEdit ? "Edit Master Record" : "Add Master Record"}
          </DialogTitle>
          <DialogDescription>
            ENCI BuildOS uses Master Database as the single source of truth for vendors, stakeholders, lawyers, realtors, and related relationships.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {error ? (
            <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
              {error}
            </div>
          ) : null}

          <section className="space-y-4">
            <h3 className="text-base font-semibold text-foreground">Core identity</h3>
            <div className="grid gap-4 md:grid-cols-3">
              <div className="space-y-2">
                <Label>Entity type</Label>
                <select
                  value={forcedType || form.type}
                  disabled={Boolean(forcedType)}
                  onChange={(event) =>
                    setForm((current) => ({
                      ...current,
                      type: event.target.value as BuildOsEntityType,
                    }))
                  }
                  className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                >
                  {BUILDOS_ENTITY_TYPES.map((type) => (
                    <option key={type} value={type}>
                      {type}
                    </option>
                  ))}
                </select>
              </div>
              <div className="space-y-2">
                <Label>Company name</Label>
                <Input
                  value={form.companyName}
                  onChange={(event) =>
                    setForm((current) => ({ ...current, companyName: event.target.value }))
                  }
                />
              </div>
              <div className="space-y-2">
                <Label>Person name</Label>
                <Input
                  value={form.personName}
                  onChange={(event) =>
                    setForm((current) => ({ ...current, personName: event.target.value }))
                  }
                />
              </div>
              <div className="space-y-2">
                <Label>Role</Label>
                <Input
                  value={form.role}
                  onChange={(event) =>
                    setForm((current) => ({ ...current, role: event.target.value }))
                  }
                />
              </div>
              <div className="space-y-2">
                <Label>Title / role</Label>
                <Input
                  value={form.titleRole}
                  onChange={(event) =>
                    setForm((current) => ({ ...current, titleRole: event.target.value }))
                  }
                />
              </div>
              <div className="space-y-2">
                <Label>Status</Label>
                <select
                  value={form.status}
                  onChange={(event) =>
                    setForm((current) => ({
                      ...current,
                      status: event.target.value as BuildOsMasterRecord["status"],
                    }))
                  }
                  className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                >
                  <option value="Active">Active</option>
                  <option value="Inactive">Inactive</option>
                  <option value="Do Not Use">Do Not Use</option>
                </select>
              </div>
            </div>
          </section>

          <section className="space-y-4">
            <h3 className="text-base font-semibold text-foreground">Relationship & contact details</h3>
            <div className="grid gap-4 md:grid-cols-3">
              <div className="space-y-2">
                <Label>Phone</Label>
                <Input
                  value={form.phone}
                  onChange={(event) =>
                    setForm((current) => ({ ...current, phone: event.target.value }))
                  }
                />
              </div>
              <div className="space-y-2">
                <Label>Email</Label>
                <Input
                  type="email"
                  value={form.email}
                  onChange={(event) =>
                    setForm((current) => ({ ...current, email: event.target.value }))
                  }
                />
              </div>
              <div className="space-y-2">
                <Label>Deal side</Label>
                <select
                  value={form.dealSide}
                  onChange={(event) =>
                    setForm((current) => ({
                      ...current,
                      dealSide: event.target.value as BuildOsMasterRecord["dealSide"],
                    }))
                  }
                  className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                >
                  <option value="n/a">Not applicable</option>
                  <option value="seller">Seller side</option>
                  <option value="buyer">Buyer side</option>
                </select>
              </div>
              <div className="space-y-2 md:col-span-2">
                <Label>Address</Label>
                <Input
                  value={form.address}
                  onChange={(event) =>
                    setForm((current) => ({ ...current, address: event.target.value }))
                  }
                />
              </div>
              <div className="space-y-2">
                <Label>Tags</Label>
                <Input
                  value={form.tags}
                  onChange={(event) =>
                    setForm((current) => ({ ...current, tags: event.target.value }))
                  }
                  placeholder="preferred, lender, permit-ready"
                />
              </div>
            </div>
          </section>

          <section className="space-y-4">
            <h3 className="text-base font-semibold text-foreground">Trade & compliance</h3>
            <div className="grid gap-4 md:grid-cols-3">
              <div className="space-y-2">
                <Label>Primary trade</Label>
                <select
                  value={form.tradeCategory}
                  onChange={(event) =>
                    setForm((current) => ({ ...current, tradeCategory: event.target.value }))
                  }
                  className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                >
                  <option value="">Select trade</option>
                  {BUILDOS_TRADE_TYPES.map((type) => (
                    <option key={type} value={type}>
                      {type}
                    </option>
                  ))}
                </select>
              </div>
              <div className="space-y-2">
                <Label>Secondary trade</Label>
                <select
                  value={form.secondaryTradeCategory}
                  onChange={(event) =>
                    setForm((current) => ({
                      ...current,
                      secondaryTradeCategory: event.target.value,
                    }))
                  }
                  className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                >
                  <option value="">Select trade</option>
                  {BUILDOS_TRADE_TYPES.map((type) => (
                    <option key={type} value={type}>
                      {type}
                    </option>
                  ))}
                </select>
              </div>
              <div className="space-y-2">
                <Label>Work again</Label>
                <select
                  value={form.workAgain}
                  onChange={(event) =>
                    setForm((current) => ({
                      ...current,
                      workAgain: event.target.value as BuildOsMasterRecord["workAgain"],
                    }))
                  }
                  className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                >
                  <option value="Yes">Yes</option>
                  <option value="Caution">Caution</option>
                  <option value="No">No</option>
                </select>
              </div>
              <div className="space-y-2">
                <Label>Insurance expiry</Label>
                <Input
                  type="date"
                  value={form.insuranceExpiry}
                  onChange={(event) =>
                    setForm((current) => ({
                      ...current,
                      insuranceExpiry: event.target.value,
                    }))
                  }
                />
              </div>
              <div className="space-y-2">
                <Label>License expiry</Label>
                <Input
                  type="date"
                  value={form.licenseExpiry}
                  onChange={(event) =>
                    setForm((current) => ({
                      ...current,
                      licenseExpiry: event.target.value,
                    }))
                  }
                />
              </div>
              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={form.recommended}
                    onChange={(event) =>
                      setForm((current) => ({
                        ...current,
                        recommended: event.target.checked,
                      }))
                    }
                  />
                  Recommended
                </Label>
              </div>
            </div>
          </section>

          <section className="space-y-4">
            <h3 className="text-base font-semibold text-foreground">Performance scoring</h3>
            <div className="grid gap-4 md:grid-cols-3">
              {[
                ["qualityScore", "Quality"],
                ["pricingScore", "Pricing"],
                ["reliabilityScore", "Reliability"],
                ["communicationScore", "Communication"],
                ["timelinessScore", "Timeliness"],
                ["professionalismScore", "Professionalism"],
              ].map(([field, label]) => (
                <div key={field} className="space-y-2">
                  <Label>{label}</Label>
                  <select
                    value={form[field as keyof MasterRecordFormState] as string}
                    onChange={(event) =>
                      setForm((current) => ({
                        ...current,
                        [field]: event.target.value,
                      }))
                    }
                    className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  >
                    <option value="">Not scored</option>
                    {[1, 2, 3, 4, 5].map((score) => (
                      <option key={score} value={score}>
                        {score}
                      </option>
                    ))}
                  </select>
                </div>
              ))}
            </div>
          </section>

          <section className="space-y-4">
            <h3 className="text-base font-semibold text-foreground">Linked projects & notes</h3>
            <div className="space-y-3 rounded-2xl border border-border/70 bg-background/70 p-4">
              <p className="text-sm text-muted-foreground">
                Link this record to the jobs it touches so project drilldowns can show the right participants.
              </p>
              <div className="grid gap-2 md:grid-cols-2">
                {projects.map((project) => {
                  const checked = form.linkedProjectIds.includes(project.id);
                  return (
                    <label
                      key={project.id}
                      className="flex items-center gap-3 rounded-xl border border-border/70 px-3 py-2 text-sm text-foreground"
                    >
                      <input
                        type="checkbox"
                        checked={checked}
                        onChange={(event) =>
                          setForm((current) => ({
                            ...current,
                            linkedProjectIds: event.target.checked
                              ? [...current.linkedProjectIds, project.id]
                              : current.linkedProjectIds.filter((id) => id !== project.id),
                          }))
                        }
                      />
                      <span>{project.project_name}</span>
                    </label>
                  );
                })}
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label>General notes</Label>
                <Textarea
                  rows={4}
                  value={form.notes}
                  onChange={(event) =>
                    setForm((current) => ({ ...current, notes: event.target.value }))
                  }
                />
              </div>
              <div className="space-y-2">
                <Label>Restricted internal notes</Label>
                <Textarea
                  rows={4}
                  value={form.restrictedNotes}
                  onChange={(event) =>
                    setForm((current) => ({
                      ...current,
                      restrictedNotes: event.target.value,
                    }))
                  }
                />
              </div>
            </div>
          </section>

          <div className="flex flex-wrap justify-end gap-2">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={saving}>
              {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
              {isEdit ? "Update Record" : "Save Record"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

