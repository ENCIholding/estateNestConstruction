import type {
  BuildOsChangeOrder,
  BuildOsClientInvoice,
  BuildOsDailyLog,
  BuildOsDocumentRecord,
  BuildOsMasterRecord,
  BuildOsProjectParticipantAssignment,
  BuildOsTask,
  BuildOsVendorBill,
} from "./buildosWorkspace";
import { getTaskAssigneeLabel } from "./buildosTasks";

export type ProjectAuditEntry = {
  actor: string;
  actorKnown: boolean;
  changedAt: string;
  detail: string;
  id: string;
  module:
    | "change-orders"
    | "client-invoices"
    | "daily-logs"
    | "documents"
    | "participants"
    | "tasks"
    | "vendor-bills";
  title: string;
};

export type ProjectAuditSnapshot = {
  actorCoverage: number;
  entries: ProjectAuditEntry[];
  trackedEntries: number;
  trackedModules: string[];
};

function normalizeActor(actor?: string) {
  const trimmed = actor?.trim();
  if (!trimmed) {
    return {
      actor: "Actor not recorded",
      actorKnown: false,
    };
  }

  return {
    actor: trimmed,
    actorKnown: true,
  };
}

function buildParticipantDetail(
  assignment: BuildOsProjectParticipantAssignment,
  records: BuildOsMasterRecord[]
) {
  const ids = [
    assignment.sellerSideRealtorId,
    assignment.buyerSideRealtorId,
    assignment.sellerSideLawyerId,
    assignment.buyerSideLawyerId,
    ...assignment.stakeholderClientIds,
    ...assignment.buyerIds,
    ...assignment.lenderIds,
    ...assignment.investorIds,
    ...assignment.otherRecordIds,
  ].filter((value): value is string => Boolean(value));

  const labels = ids
    .map((recordId) =>
      records.find((record) => record.id === recordId)
    )
    .filter(Boolean)
    .slice(0, 4)
    .map((record) => record?.companyName || record?.personName || "Participant");

  if (!labels.length) {
    return "Participant assignments were updated, but no visible linked parties are stored yet.";
  }

  return `Visible participants: ${labels.join(", ")}${ids.length > labels.length ? "..." : ""}`;
}

function byChangedAtDescending(left: ProjectAuditEntry, right: ProjectAuditEntry) {
  return (
    new Date(right.changedAt || 0).getTime() - new Date(left.changedAt || 0).getTime()
  );
}

export function buildProjectAuditSnapshot(options: {
  assignment?: BuildOsProjectParticipantAssignment | null;
  changeOrders: BuildOsChangeOrder[];
  clientInvoices: BuildOsClientInvoice[];
  dailyLogs: BuildOsDailyLog[];
  documents: BuildOsDocumentRecord[];
  projectId: string;
  records: BuildOsMasterRecord[];
  tasks: BuildOsTask[];
  vendorBills: BuildOsVendorBill[];
}): ProjectAuditSnapshot {
  const entries: ProjectAuditEntry[] = [];

  options.changeOrders
    .filter((record) => record.projectId === options.projectId)
    .forEach((record) => {
      const actor = normalizeActor(record.updatedBy);
      entries.push({
        ...actor,
        changedAt: record.updatedAt,
        detail: `${record.status} | ${record.reason || "Reason not recorded"}`,
        id: `change-order-${record.id}`,
        module: "change-orders",
        title: `Change order | ${record.title}`,
      });
    });

  options.clientInvoices
    .filter((record) => record.projectId === options.projectId)
    .forEach((record) => {
      const actor = normalizeActor(record.updatedBy);
      entries.push({
        ...actor,
        changedAt: record.updatedAt,
        detail: `${record.status} | Invoice ${record.invoiceNumber}`,
        id: `client-invoice-${record.id}`,
        module: "client-invoices",
        title: "Client invoice",
      });
    });

  options.dailyLogs
    .filter((record) => record.projectId === options.projectId)
    .forEach((record) => {
      const actor = normalizeActor(record.createdBy);
      entries.push({
        ...actor,
        changedAt: record.updatedAt,
        detail: `${record.weather || "Weather not noted"} | ${record.comments || "Daily log updated"}`,
        id: `daily-log-${record.id}`,
        module: "daily-logs",
        title: `Daily log | ${record.date}`,
      });
    });

  options.documents
    .filter((record) => record.projectId === options.projectId)
    .forEach((record) => {
      const actor = normalizeActor(record.updatedBy || record.uploader);
      entries.push({
        ...actor,
        changedAt: record.updatedAt,
        detail: `${record.documentType}${record.versionLabel ? ` | ${record.versionLabel}` : ""}`,
        id: `document-${record.id}`,
        module: "documents",
        title: `Document | ${record.title}`,
      });
    });

  if (options.assignment && options.assignment.projectId === options.projectId) {
    const actor = normalizeActor(options.assignment.updatedBy);
    entries.push({
      ...actor,
      changedAt: options.assignment.updatedAt,
      detail: buildParticipantDetail(options.assignment, options.records),
      id: `participants-${options.assignment.projectId}`,
      module: "participants",
      title: "Deal participants",
    });
  }

  options.tasks
    .filter((record) => record.projectId === options.projectId)
    .forEach((record) => {
      const actor = normalizeActor(record.lastUpdatedBy);
      entries.push({
        ...actor,
        changedAt: record.updatedAt,
        detail: `${record.status} | Assignee ${getTaskAssigneeLabel(record, options.records)}`,
        id: `task-${record.id}`,
        module: "tasks",
        title: `Task | ${record.title}`,
      });
    });

  options.vendorBills
    .filter((record) => record.projectId === options.projectId)
    .forEach((record) => {
      const actor = normalizeActor(record.updatedBy);
      entries.push({
        ...actor,
        changedAt: record.updatedAt,
        detail: `${record.status} | Bill ${record.invoiceNumber}`,
        id: `vendor-bill-${record.id}`,
        module: "vendor-bills",
        title: "Vendor bill",
      });
    });

  const sortedEntries = entries.sort(byChangedAtDescending);
  const trackedModules = Array.from(new Set(sortedEntries.map((entry) => entry.module)));
  const trackedEntries = sortedEntries.length;
  const actorCoverage =
    trackedEntries === 0
      ? 0
      : Math.round(
          (sortedEntries.filter((entry) => entry.actorKnown).length / trackedEntries) * 100
        );

  return {
    actorCoverage,
    entries: sortedEntries,
    trackedEntries,
    trackedModules,
  };
}
