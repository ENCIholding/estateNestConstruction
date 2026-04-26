import { describe, expect, it } from "vitest";
import type { ManagementProject } from "./managementData";
import {
  buildProjectControlExportSheets,
  buildProjectControlSnapshot,
} from "./projectControl";
import type {
  BuildOsChangeOrder,
  BuildOsClientInvoice,
  BuildOsDeficiency,
  BuildOsDocumentRecord,
  BuildOsMasterRecord,
  BuildOsProjectParticipantAssignment,
  BuildOsTask,
  BuildOsVendorBill,
} from "./buildosWorkspace";

const project: ManagementProject = {
  civic_address: "109 Street NW, Edmonton",
  contracted_revenue: 1520000,
  estimated_budget: 1000000,
  estimated_end_date: "2026-03-10",
  id: "parkallen",
  project_name: "Parkallen Fourplex",
  scope_subject: "Base contract scope",
  scope_summary: "Fourplex build delivered to the approved permit set.",
  status: "Active",
};

const changeOrders: BuildOsChangeOrder[] = [
  {
    budgetImpact: 50000,
    createdAt: "2026-01-01T00:00:00.000Z",
    id: "co-1",
    projectId: "parkallen",
    reason: "Soil redesign",
    scopeSummary: "Structural redesign",
    status: "Approved",
    timeImpactDays: 8,
    title: "Structural redesign",
    updatedAt: "2026-01-08T00:00:00.000Z",
  },
  {
    budgetImpact: 40000,
    createdAt: "2026-01-15T00:00:00.000Z",
    id: "co-2",
    projectId: "parkallen",
    reason: "Owner upgrade",
    scopeSummary: "Interior revisions",
    status: "Pending Approval",
    timeImpactDays: 5,
    title: "Interior revisions",
    updatedAt: "2026-01-17T00:00:00.000Z",
  },
];

const clientInvoices: BuildOsClientInvoice[] = [
  {
    amount: 240000,
    createdAt: "2026-02-01T00:00:00.000Z",
    dueDate: "2026-02-18",
    id: "inv-1",
    invoiceDate: "2026-02-01",
    invoiceNumber: "INV-101",
    projectId: "parkallen",
    status: "Paid",
    updatedAt: "2026-02-01T00:00:00.000Z",
  },
  {
    amount: 125000,
    createdAt: "2026-02-20T00:00:00.000Z",
    drawReference: "Draw 1",
    dueDate: "2026-03-01",
    id: "inv-2",
    invoiceDate: "2026-02-20",
    invoiceNumber: "INV-102",
    projectId: "parkallen",
    status: "Overdue",
    updatedAt: "2026-02-20T00:00:00.000Z",
  },
];

const vendorBills: BuildOsVendorBill[] = [
  {
    amount: 300000,
    createdAt: "2026-02-02T00:00:00.000Z",
    dueDate: "2026-02-15",
    id: "bill-1",
    invoiceDate: "2026-02-02",
    invoiceNumber: "BILL-101",
    projectId: "parkallen",
    status: "Paid",
    updatedAt: "2026-02-02T00:00:00.000Z",
  },
  {
    amount: 480000,
    createdAt: "2026-03-01T00:00:00.000Z",
    dueDate: "2026-03-15",
    id: "bill-2",
    invoiceDate: "2026-03-01",
    invoiceNumber: "BILL-102",
    projectId: "parkallen",
    status: "Overdue",
    updatedAt: "2026-03-01T00:00:00.000Z",
  },
];

const deficiencies: BuildOsDeficiency[] = [
  {
    createdAt: "2026-02-10T00:00:00.000Z",
    description: "Sealant review needed.",
    id: "def-1",
    projectId: "parkallen",
    severity: "Critical",
    status: "Open",
    title: "Envelope leak risk",
    updatedAt: "2026-02-10T00:00:00.000Z",
    warrantyLinked: false,
  },
];

const documents: BuildOsDocumentRecord[] = [];

const tasks: BuildOsTask[] = [
  {
    createdAt: "2026-02-01T00:00:00.000Z",
    dueDate: "2026-02-20",
    id: "task-1",
    milestone: true,
    percentComplete: 50,
    phase: "Framing",
    predecessorIds: [],
    priority: "High",
    projectId: "parkallen",
    startDate: "2026-02-01",
    status: "Blocked",
    title: "Framing inspection closeout",
    updatedAt: "2026-02-21T00:00:00.000Z",
  },
];

const records: BuildOsMasterRecord[] = [
  {
    companyName: "Northside Framing",
    communicationScore: 5,
    createdAt: "2026-01-01T00:00:00.000Z",
    deficiencyCount: 0,
    documents: [],
    id: "vendor-1",
    linkedProjectIds: ["parkallen"],
    personName: "Northside Framing",
    pricingScore: 4,
    professionalismScore: 5,
    qualityScore: 5,
    recommended: true,
    reliabilityScore: 5,
    status: "Active",
    tags: [],
    timelinessScore: 5,
    type: "Vendor (Trade)",
    updatedAt: "2026-01-01T00:00:00.000Z",
    workAgain: "Yes",
  },
  {
    companyName: "Metro Roofing",
    communicationScore: 2,
    createdAt: "2026-01-01T00:00:00.000Z",
    deficiencyCount: 4,
    documents: [],
    id: "vendor-2",
    linkedProjectIds: ["parkallen"],
    personName: "Metro Roofing",
    pricingScore: 2,
    professionalismScore: 2,
    qualityScore: 2,
    recommended: false,
    reliabilityScore: 2,
    status: "Do Not Use",
    tags: [],
    timelinessScore: 2,
    type: "Vendor (Trade)",
    updatedAt: "2026-01-01T00:00:00.000Z",
    workAgain: "No",
  },
  {
    createdAt: "2026-01-01T00:00:00.000Z",
    documents: [],
    id: "client-1",
    linkedProjectIds: ["parkallen"],
    personName: "Parkallen Stakeholder",
    status: "Active",
    tags: [],
    type: "Stakeholder (Client)",
    updatedAt: "2026-01-01T00:00:00.000Z",
  },
  {
    createdAt: "2026-01-01T00:00:00.000Z",
    documents: [],
    id: "lawyer-1",
    linkedProjectIds: ["parkallen"],
    personName: "Law Office West",
    status: "Active",
    tags: [],
    type: "Lawyer",
    updatedAt: "2026-01-01T00:00:00.000Z",
  },
];

const assignment: BuildOsProjectParticipantAssignment = {
  buyerIds: [],
  buyerSideLawyerId: undefined,
  buyerSideRealtorId: undefined,
  createdAt: "2026-01-01T00:00:00.000Z",
  investorIds: [],
  lenderIds: [],
  otherRecordIds: [],
  projectId: "parkallen",
  sellerSideLawyerId: "lawyer-1",
  sellerSideRealtorId: undefined,
  stakeholderClientIds: ["client-1"],
  updatedAt: "2026-01-01T00:00:00.000Z",
};

describe("project control helpers", () => {
  it("builds a profit and scope snapshot from live project records", () => {
    const snapshot = buildProjectControlSnapshot({
      assignment,
      changeOrders,
      clientInvoices,
      deficiencies,
      documents,
      project,
      records,
      tasks,
      vendorBills,
    });

    expect(snapshot.projectSummary.revisedBudget).toBe(1050000);
    expect(snapshot.expectedProfit).toBe(520000);
    expect(snapshot.currentProfit).toBe(470000);
    expect(snapshot.profitAtRisk).toBe(90000);
    expect(snapshot.scopeStatus).toBe("Scope Pressured");
    expect(snapshot.riskSignals.find((risk) => risk.label === "Vendor Risk")?.level).toBe("High");
    expect(snapshot.participantCounts.stakeholders).toBe(1);
    expect(snapshot.participantCounts.lawyers).toBe(1);
  });

  it("creates export sheets that can back Excel/PDF project control outputs", () => {
    const snapshot = buildProjectControlSnapshot({
      assignment,
      changeOrders,
      clientInvoices,
      deficiencies,
      documents,
      project,
      records,
      tasks,
      vendorBills,
    });

    const sheets = buildProjectControlExportSheets(project, snapshot);

    expect(Object.keys(sheets)).toEqual(
      expect.arrayContaining(["Profit & Scope Control", "Graph Data", "Automated Notes"])
    );
    expect(
      sheets["Profit & Scope Control"].some((row) => row.Metric === "Profit At Risk")
    ).toBe(true);
    expect(
      sheets["Automated Notes"].some((row) => row.Section === "Immediate Next Actions")
    ).toBe(true);
  });
});
