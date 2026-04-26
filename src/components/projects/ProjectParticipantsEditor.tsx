import { useEffect, useMemo, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import Badge from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  getProjectParticipantAssignment,
  loadMasterDatabaseRecords,
  saveProjectParticipantAssignment,
  type BuildOsMasterRecord,
  type BuildOsProjectParticipantAssignment,
} from "@/lib/buildosShared";
import { buildVendorMemorySnapshot } from "@/lib/vendorMemory";

type ProjectParticipantsEditorProps = {
  projectId: string;
};

type AssignmentState = {
  sellerSideRealtorId: string;
  buyerSideRealtorId: string;
  sellerSideLawyerId: string;
  buyerSideLawyerId: string;
  stakeholderClientIds: string[];
  buyerIds: string[];
  lenderIds: string[];
  investorIds: string[];
  otherRecordIds: string[];
};

function buildInitialState(
  assignment?: BuildOsProjectParticipantAssignment
): AssignmentState {
  return {
    sellerSideRealtorId: assignment?.sellerSideRealtorId || "",
    buyerSideRealtorId: assignment?.buyerSideRealtorId || "",
    sellerSideLawyerId: assignment?.sellerSideLawyerId || "",
    buyerSideLawyerId: assignment?.buyerSideLawyerId || "",
    stakeholderClientIds: assignment?.stakeholderClientIds || [],
    buyerIds: assignment?.buyerIds || [],
    lenderIds: assignment?.lenderIds || [],
    investorIds: assignment?.investorIds || [],
    otherRecordIds: assignment?.otherRecordIds || [],
  };
}

function buildLabel(record: BuildOsMasterRecord) {
  return `${record.companyName || record.personName}${record.personName && record.companyName ? ` / ${record.personName}` : ""}`;
}

export default function ProjectParticipantsEditor({
  projectId,
}: ProjectParticipantsEditorProps) {
  const queryClient = useQueryClient();
  const [state, setState] = useState<AssignmentState>(buildInitialState());
  const [saving, setSaving] = useState(false);
  const [savedMessage, setSavedMessage] = useState("");

  const { data: records = [] } = useQuery({
    queryKey: ["buildos-master-database"],
    queryFn: async () => loadMasterDatabaseRecords(),
  });

  const { data: assignment } = useQuery({
    queryKey: ["buildos-project-participants", projectId],
    queryFn: async () => (await getProjectParticipantAssignment(projectId)) || null,
  });

  useEffect(() => {
    setState(buildInitialState(assignment || undefined));
    setSavedMessage("");
  }, [assignment]);

  const filtered = useMemo(
    () => ({
      realtors: records.filter((record) => record.type === "Realtor"),
      lawyers: records.filter((record) => record.type === "Lawyer"),
      stakeholders: records.filter((record) => record.type === "Stakeholder (Client)"),
      buyers: records.filter((record) => record.type === "Buyer"),
      lenders: records.filter((record) => record.type === "Lender"),
      investors: records.filter((record) => record.type === "Investor"),
      other: records.filter((record) =>
        ["Consultant", "Broker", "Municipality", "Inspector", "Internal Team", "Other"].includes(
          record.type
        )
      ),
    }),
    [records]
  );
  const vendorMemory = useMemo(() => buildVendorMemorySnapshot(records), [records]);

  const toggleId = (field: keyof Pick<
    AssignmentState,
    "stakeholderClientIds" | "buyerIds" | "lenderIds" | "investorIds" | "otherRecordIds"
  >, recordId: string, checked: boolean) => {
    setState((current) => ({
      ...current,
      [field]: checked
        ? [...current[field], recordId]
        : current[field].filter((item) => item !== recordId),
    }));
  };

  const handleSave = async () => {
    setSaving(true);
    setSavedMessage("");

    await saveProjectParticipantAssignment({
      projectId,
      ...state,
      updatedBy: "Estate Nest Team",
    });

    await queryClient.invalidateQueries({
      predicate: (query) =>
        Array.isArray(query.queryKey) &&
        typeof query.queryKey[0] === "string" &&
        query.queryKey[0].startsWith("buildos-project-participants"),
    });

    setSaving(false);
    setSavedMessage("Participant assignments saved.");
  };

  const selectClass =
    "w-full rounded-md border border-input bg-background px-3 py-2 text-sm";
  const groupedSections: Array<{
    label: string;
    field: keyof Pick<
      AssignmentState,
      "stakeholderClientIds" | "buyerIds" | "lenderIds" | "investorIds" | "otherRecordIds"
    >;
    list: BuildOsMasterRecord[];
  }> = [
    { label: "Stakeholders / Clients", field: "stakeholderClientIds", list: filtered.stakeholders },
    { label: "Buyers", field: "buyerIds", list: filtered.buyers },
    { label: "Lenders", field: "lenderIds", list: filtered.lenders },
    { label: "Investors", field: "investorIds", list: filtered.investors },
    { label: "Other participants", field: "otherRecordIds", list: filtered.other },
  ];

  return (
    <div className="space-y-4">
      <div className="grid gap-4 md:grid-cols-2">
        <div className="dashboard-item p-4">
          <p className="text-sm font-medium text-foreground">Seller-side Realtor</p>
          <select
            value={state.sellerSideRealtorId}
            onChange={(event) =>
              setState((current) => ({
                ...current,
                sellerSideRealtorId: event.target.value,
              }))
            }
            className={`mt-3 ${selectClass}`}
          >
            <option value="">Not assigned</option>
            {filtered.realtors.map((record) => (
              <option key={record.id} value={record.id}>
                {buildLabel(record)}
              </option>
            ))}
          </select>
        </div>
        <div className="dashboard-item p-4">
          <p className="text-sm font-medium text-foreground">Buyer-side Realtor</p>
          <select
            value={state.buyerSideRealtorId}
            onChange={(event) =>
              setState((current) => ({
                ...current,
                buyerSideRealtorId: event.target.value,
              }))
            }
            className={`mt-3 ${selectClass}`}
          >
            <option value="">Not assigned</option>
            {filtered.realtors.map((record) => (
              <option key={record.id} value={record.id}>
                {buildLabel(record)}
              </option>
            ))}
          </select>
        </div>
        <div className="dashboard-item p-4">
          <p className="text-sm font-medium text-foreground">Seller-side Lawyer</p>
          <select
            value={state.sellerSideLawyerId}
            onChange={(event) =>
              setState((current) => ({
                ...current,
                sellerSideLawyerId: event.target.value,
              }))
            }
            className={`mt-3 ${selectClass}`}
          >
            <option value="">Not assigned</option>
            {filtered.lawyers.map((record) => (
              <option key={record.id} value={record.id}>
                {buildLabel(record)}
              </option>
            ))}
          </select>
        </div>
        <div className="dashboard-item p-4">
          <p className="text-sm font-medium text-foreground">Buyer-side Lawyer</p>
          <select
            value={state.buyerSideLawyerId}
            onChange={(event) =>
              setState((current) => ({
                ...current,
                buyerSideLawyerId: event.target.value,
              }))
            }
            className={`mt-3 ${selectClass}`}
          >
            <option value="">Not assigned</option>
            {filtered.lawyers.map((record) => (
              <option key={record.id} value={record.id}>
                {buildLabel(record)}
              </option>
            ))}
          </select>
        </div>
      </div>

      {groupedSections.map(({ label, field, list }) => (
        <div key={label} className="dashboard-item p-4">
          <p className="text-sm font-medium text-foreground">{label}</p>
          <div className="mt-3 grid gap-2 md:grid-cols-2">
            {list.length ? (
              list.map((record) => {
                const checked = state[field].includes(record.id);
                return (
                  <label
                    key={record.id}
                    className="flex items-center gap-3 rounded-xl border border-border/70 px-3 py-2 text-sm text-foreground"
                  >
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={(event) =>
                        toggleId(field, record.id, event.target.checked)
                      }
                    />
                    <span>{buildLabel(record)}</span>
                  </label>
                );
              })
            ) : (
              <p className="text-sm text-muted-foreground">
                No matching Master Database records yet.
              </p>
            )}
          </div>
        </div>
      ))}

      <div className="dashboard-item p-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-sm font-medium text-foreground">Vendor Memory Reference</p>
            <p className="mt-2 text-sm leading-6 text-muted-foreground">
              Keep trusted trades and do-not-use vendors visible while structuring the project team so relationship decisions stay tied to real memory, not guesswork.
            </p>
          </div>
          <Badge className="rounded-full bg-muted text-muted-foreground">
            Master Database driven
          </Badge>
        </div>
        <div className="mt-4 grid gap-4 lg:grid-cols-3">
          <div className="rounded-2xl border border-border/70 bg-background/70 p-4">
            <p className="text-sm font-semibold text-foreground">Top Vendors</p>
            <div className="mt-3 space-y-2">
              {vendorMemory.topVendors.length ? (
                vendorMemory.topVendors.slice(0, 3).map((vendor) => (
                  <div key={vendor.id} className="rounded-xl border border-border/70 px-3 py-2">
                    <p className="text-sm font-medium text-foreground">{vendor.label}</p>
                    <p className="mt-1 text-xs text-muted-foreground">
                      {vendor.tradeCategory} | {vendor.linkedProjectCount} linked project(s)
                    </p>
                  </div>
                ))
              ) : (
                <p className="text-sm text-muted-foreground">No preferred vendors are surfaced yet.</p>
              )}
            </div>
          </div>

          <div className="rounded-2xl border border-border/70 bg-background/70 p-4">
            <p className="text-sm font-semibold text-foreground">Use With Caution</p>
            <div className="mt-3 space-y-2">
              {vendorMemory.cautionVendors.length ? (
                vendorMemory.cautionVendors.slice(0, 3).map((vendor) => (
                  <div key={vendor.id} className="rounded-xl border border-border/70 px-3 py-2">
                    <p className="text-sm font-medium text-foreground">{vendor.label}</p>
                    <p className="mt-1 text-xs text-muted-foreground">
                      {vendor.deficiencyCount} issue(s) | {vendor.riskStatus}
                    </p>
                  </div>
                ))
              ) : (
                <p className="text-sm text-muted-foreground">No caution vendors are currently flagged.</p>
              )}
            </div>
          </div>

          <div className="rounded-2xl border border-rose-200/70 bg-rose-50/70 p-4 dark:border-rose-900/50 dark:bg-rose-950/20">
            <p className="text-sm font-semibold text-foreground">Do Not Use / High Risk</p>
            <div className="mt-3 space-y-2">
              {vendorMemory.blockedVendors.length ? (
                vendorMemory.blockedVendors.slice(0, 3).map((vendor) => (
                  <div key={vendor.id} className="rounded-xl border border-rose-200/70 px-3 py-2 dark:border-rose-900/50">
                    <p className="text-sm font-medium text-foreground">{vendor.label}</p>
                    <p className="mt-1 text-xs text-muted-foreground">
                      {vendor.workAgain} | {vendor.riskStatus}
                    </p>
                  </div>
                ))
              ) : (
                <p className="text-sm text-muted-foreground">No blocked vendors are currently flagged.</p>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-muted-foreground">{savedMessage || "Selections save into ENCI BuildOS project assignments for this device."}</p>
        <Button
          onClick={() => void handleSave()}
          disabled={saving}
          className="rounded-full"
        >
          {saving ? "Saving..." : "Save Participant Assignments"}
        </Button>
      </div>
    </div>
  );
}
