import { describe, expect, it } from "vitest";
import {
  buildOperationalAlerts,
  buildProjectAlerts,
  getProjectFinancialSummary,
  getProjectHealthStatus,
  getVendorRiskStatus,
} from "./buildosIntelligence";
import type { ManagementProject } from "./managementData";
import type {
  BuildOsChangeOrder,
  BuildOsClientInvoice,
  BuildOsDeficiency,
  BuildOsMasterRecord,
  BuildOsTask,
  BuildOsVendorBill,
} from "./buildosWorkspace";

const project: ManagementProject = {
  id: "parkallen",
  project_name: "Parkallen Fourplex",
  civic_address: "109 Street NW, Edmonton",
  status: "Active",
  estimated_budget: 1000000,
  selling_price: 1450000,
  estimated_end_date: "2026-03-01",
};

const changeOrders: BuildOsChangeOrder[] = [
  {
    id: "co-1",
    projectId: "parkallen",
    title: "Structural redesign",
    scopeSummary: "Beam revisions",
    reason: "Site condition",
    budgetImpact: 50000,
    timeImpactDays: 10,
    status: "Approved",
    createdAt: "2026-01-01T00:00:00.000Z",
    updatedAt: "2026-01-10T00:00:00.000Z",
  },
  {
    id: "co-2",
    projectId: "parkallen",
    title: "Interior upgrade",
    scopeSummary: "Finish change",
    reason: "Buyer request",
    budgetImpact: 25000,
    timeImpactDays: 5,
    status: "Pending Approval",
    createdAt: "2026-01-15T00:00:00.000Z",
    updatedAt: "2026-01-16T00:00:00.000Z",
  },
];

const clientInvoices: BuildOsClientInvoice[] = [
  {
    id: "inv-1",
    projectId: "parkallen",
    invoiceNumber: "INV-100",
    invoiceDate: "2026-02-01",
    dueDate: "2026-02-15",
    amount: 120000,
    status: "Paid",
    createdAt: "2026-02-01T00:00:00.000Z",
    updatedAt: "2026-02-01T00:00:00.000Z",
  },
  {
    id: "inv-2",
    projectId: "parkallen",
    invoiceNumber: "INV-101",
    invoiceDate: "2026-02-20",
    dueDate: "2026-03-05",
    amount: 90000,
    status: "Overdue",
    drawReference: "Draw 1",
    createdAt: "2026-02-20T00:00:00.000Z",
    updatedAt: "2026-02-20T00:00:00.000Z",
  },
];

const vendorBills: BuildOsVendorBill[] = [
  {
    id: "bill-1",
    projectId: "parkallen",
    invoiceNumber: "BILL-100",
    invoiceDate: "2026-02-10",
    dueDate: "2026-02-25",
    amount: 150000,
    status: "Paid",
    createdAt: "2026-02-10T00:00:00.000Z",
    updatedAt: "2026-02-10T00:00:00.000Z",
  },
  {
    id: "bill-2",
    projectId: "parkallen",
    invoiceNumber: "BILL-101",
    invoiceDate: "2026-03-01",
    dueDate: "2026-03-15",
    amount: 180000,
    status: "Overdue",
    createdAt: "2026-03-01T00:00:00.000Z",
    updatedAt: "2026-03-01T00:00:00.000Z",
  },
];

const deficiencies: BuildOsDeficiency[] = [
  {
    id: "def-1",
    projectId: "parkallen",
    title: "Window flashing",
    description: "Needs correction",
    severity: "High",
    status: "Open",
    warrantyLinked: false,
    createdAt: "2026-02-12T00:00:00.000Z",
    updatedAt: "2026-02-12T00:00:00.000Z",
  },
  {
    id: "def-2",
    projectId: "parkallen",
    title: "Paint touch-up",
    description: "Touch-up required",
    severity: "Medium",
    status: "In Progress",
    warrantyLinked: true,
    createdAt: "2026-02-14T00:00:00.000Z",
    updatedAt: "2026-02-14T00:00:00.000Z",
  },
];

const tasks: BuildOsTask[] = [
  {
    id: "task-1",
    projectId: "parkallen",
    title: "Permit revision",
    phase: "Permits",
    status: "Blocked",
    priority: "High",
    milestone: true,
    predecessorIds: [],
    percentComplete: 20,
    startDate: "2026-02-20",
    dueDate: "2026-02-28",
    createdAt: "2026-02-20T00:00:00.000Z",
    updatedAt: "2026-02-22T00:00:00.000Z",
  },
];

describe("buildos intelligence helpers", () => {
  it("derives practical project financial totals from live records", () => {
    const summary = getProjectFinancialSummary(
      project,
      changeOrders,
      clientInvoices,
      vendorBills
    );

    expect(summary).toEqual(
      expect.objectContaining({
        originalBudget: 1000000,
        revisedBudget: 1050000,
        approvedChangeOrderImpact: 50000,
        pendingChangeOrderExposure: 25000,
        committedCosts: 330000,
        actualCosts: 150000,
        cashInflows: 120000,
        unpaidClientInvoices: 90000,
        unpaidVendorBills: 180000,
      })
    );
  });

  it("marks projects as warning or critical based on explainable signals", () => {
    const summary = getProjectFinancialSummary(
      project,
      changeOrders,
      clientInvoices,
      vendorBills
    );
    const alerts = buildProjectAlerts(
      project,
      changeOrders,
      clientInvoices,
      vendorBills,
      deficiencies,
      [],
      tasks
    );

    expect(alerts.some((alert) => alert.module === "financial")).toBe(true);
    expect(alerts.some((alert) => alert.module === "tasks")).toBe(true);
    expect(getProjectHealthStatus(project, summary, deficiencies, alerts)).toBe("Critical");
  });

  it("flags risky vendors from score and deficiency patterns", () => {
    const vendor: BuildOsMasterRecord = {
      id: "vendor-1",
      type: "Vendor (Trade)",
      personName: "Northside Framing",
      status: "Active",
      tags: [],
      linkedProjectIds: [],
      documents: [],
      createdAt: "2026-01-01T00:00:00.000Z",
      updatedAt: "2026-01-01T00:00:00.000Z",
      qualityScore: 2,
      pricingScore: 3,
      reliabilityScore: 2,
      communicationScore: 3,
      timelinessScore: 2,
      professionalismScore: 3,
      deficiencyCount: 5,
      workAgain: "Caution",
    };

    expect(getVendorRiskStatus(vendor)).toBe("High Risk Vendor");
  });

  it("combines project alerts with global vendor/compliance warnings", () => {
    const vendor: BuildOsMasterRecord = {
      id: "vendor-expiring",
      type: "Vendor (Trade)",
      personName: "Citywide Electrical",
      status: "Active",
      tags: [],
      linkedProjectIds: ["parkallen"],
      documents: [],
      insuranceExpiry: "2026-04-20",
      createdAt: "2026-01-01T00:00:00.000Z",
      updatedAt: "2026-01-01T00:00:00.000Z",
      qualityScore: 2,
      pricingScore: 2,
      reliabilityScore: 2,
      communicationScore: 2,
      timelinessScore: 2,
      professionalismScore: 2,
      deficiencyCount: 4,
      workAgain: "No",
    };

    const alerts = buildOperationalAlerts(
      [project],
      changeOrders,
      clientInvoices,
      vendorBills,
      deficiencies,
      [],
      tasks,
      [vendor]
    );

    expect(alerts.some((alert) => alert.title.includes("Insurance or licenses"))).toBe(true);
    expect(alerts.some((alert) => alert.title.includes("High-risk vendors"))).toBe(true);
  });
});
