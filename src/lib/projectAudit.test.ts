import { describe, expect, it } from "vitest";
import { buildProjectAuditSnapshot } from "./projectAudit";
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

const records: BuildOsMasterRecord[] = [
  {
    createdAt: "2026-01-01T00:00:00.000Z",
    documents: [],
    id: "vendor-1",
    linkedProjectIds: ["parkallen"],
    personName: "Northside Framing",
    status: "Active",
    tags: [],
    type: "Vendor (Trade)",
    updatedAt: "2026-01-01T00:00:00.000Z",
  },
  {
    createdAt: "2026-01-01T00:00:00.000Z",
    documents: [],
    id: "stakeholder-1",
    linkedProjectIds: ["parkallen"],
    personName: "Parkallen Stakeholder",
    status: "Active",
    tags: [],
    type: "Stakeholder (Client)",
    updatedAt: "2026-01-01T00:00:00.000Z",
  },
];

const changeOrders: BuildOsChangeOrder[] = [
  {
    budgetImpact: 45000,
    createdAt: "2026-02-01T00:00:00.000Z",
    id: "co-1",
    projectId: "parkallen",
    reason: "Owner upgrade",
    scopeSummary: "Kitchen revision",
    status: "Pending Approval",
    timeImpactDays: 4,
    title: "Kitchen revision",
    updatedAt: "2026-02-03T00:00:00.000Z",
    updatedBy: "Kanwar",
    vendorRecordId: "vendor-1",
  },
];

const clientInvoices: BuildOsClientInvoice[] = [
  {
    amount: 125000,
    createdAt: "2026-02-10T00:00:00.000Z",
    dueDate: "2026-02-25",
    id: "inv-1",
    invoiceDate: "2026-02-10",
    invoiceNumber: "INV-101",
    projectId: "parkallen",
    status: "Sent",
    updatedAt: "2026-02-12T00:00:00.000Z",
    updatedBy: "Admin",
  },
];

const dailyLogs: BuildOsDailyLog[] = [
  {
    comments: "Wall layout finalized.",
    createdAt: "2026-02-11T00:00:00.000Z",
    createdBy: "Field Lead",
    date: "2026-02-11",
    id: "daily-1",
    projectId: "parkallen",
    tradesOnsite: ["Framing"],
    updatedAt: "2026-02-11T00:00:00.000Z",
    weather: "Cold",
  },
];

const documents: BuildOsDocumentRecord[] = [
  {
    createdAt: "2026-02-14T00:00:00.000Z",
    documentType: "Contract",
    id: "doc-1",
    linkedRecordId: "vendor-1",
    notes: "Signed revision backup",
    projectId: "parkallen",
    requiredForProject: false,
    tags: ["vendor"],
    title: "Framing revision backup",
    updatedAt: "2026-02-15T00:00:00.000Z",
    updatedBy: "Admin",
    uploadDate: "2026-02-14",
    uploader: "Admin",
  },
];

const tasks: BuildOsTask[] = [
  {
    assignedRecordId: "vendor-1",
    createdAt: "2026-02-09T00:00:00.000Z",
    dueDate: "2026-02-20",
    id: "task-1",
    lastUpdatedBy: "PM",
    milestone: false,
    percentComplete: 75,
    phase: "Framing",
    predecessorIds: [],
    priority: "High",
    projectId: "parkallen",
    startDate: "2026-02-09",
    status: "In Progress",
    title: "Frame main floor",
    updatedAt: "2026-02-16T00:00:00.000Z",
  },
];

const vendorBills: BuildOsVendorBill[] = [
  {
    amount: 67000,
    createdAt: "2026-02-08T00:00:00.000Z",
    dueDate: "2026-02-18",
    id: "bill-1",
    invoiceDate: "2026-02-08",
    invoiceNumber: "BILL-101",
    projectId: "parkallen",
    status: "Received",
    updatedAt: "2026-02-13T00:00:00.000Z",
    updatedBy: "Accounting",
    vendorRecordId: "vendor-1",
  },
];

const assignment: BuildOsProjectParticipantAssignment = {
  buyerIds: [],
  buyerSideLawyerId: undefined,
  buyerSideRealtorId: undefined,
  createdAt: "2026-02-01T00:00:00.000Z",
  investorIds: [],
  lenderIds: [],
  otherRecordIds: [],
  projectId: "parkallen",
  sellerSideLawyerId: undefined,
  sellerSideRealtorId: undefined,
  stakeholderClientIds: ["stakeholder-1"],
  updatedAt: "2026-02-17T00:00:00.000Z",
  updatedBy: "Kanwar",
};

describe("buildProjectAuditSnapshot", () => {
  it("sorts project-linked updates and tracks actor coverage", () => {
    const snapshot = buildProjectAuditSnapshot({
      assignment,
      changeOrders,
      clientInvoices,
      dailyLogs,
      documents,
      projectId: "parkallen",
      records,
      tasks,
      vendorBills,
    });

    expect(snapshot.trackedEntries).toBe(7);
    expect(snapshot.trackedModules).toContain("participants");
    expect(snapshot.entries[0]?.module).toBe("participants");
    expect(snapshot.entries[1]?.module).toBe("tasks");
    expect(snapshot.actorCoverage).toBe(100);
  });

  it("marks actor coverage down when records lack named actors", () => {
    const snapshot = buildProjectAuditSnapshot({
      assignment: {
        ...assignment,
        updatedBy: undefined,
      },
      changeOrders: changeOrders.map((record) => ({ ...record, updatedBy: undefined })),
      clientInvoices,
      dailyLogs,
      documents,
      projectId: "parkallen",
      records,
      tasks: tasks.map((task) => ({ ...task, lastUpdatedBy: undefined })),
      vendorBills,
    });

    expect(snapshot.actorCoverage).toBeLessThan(100);
    expect(snapshot.entries.some((entry) => entry.actorKnown === false)).toBe(true);
  });
});
