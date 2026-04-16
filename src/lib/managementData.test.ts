import { describe, expect, it } from "vitest";
import {
  buildBudgetRows,
  buildProjectCompliance,
  buildProjectDocuments,
  buildProjectScheduleEntries,
  buildProjectsCsv,
  buildWarrantyReminders,
  getRegistryCoverage,
  type ManagementProject,
} from "./managementData";

const projects: ManagementProject[] = [
  {
    id: "parkallen",
    project_name: "Parkallen Fourplex",
    civic_address: "109 Street NW, Edmonton",
    status: "Active",
    estimated_budget: 2300000,
    deposit_amount: 250000,
    selling_price: 2950000,
    start_date: "2026-01-15",
    estimated_end_date: "2026-10-01",
    legal_land_description: "Plan 1234 Block 5 Lot 9",
    warranty_start_date: "2026-10-15",
    zoning_code: "RF5",
    development_permit_pdf: "https://example.com/development.pdf",
    building_permit_pdf: "https://example.com/building.pdf",
    project_manager: "Kanwar Sharma",
    primary_contact_email: "hello@estatenest.capital",
    next_milestone: "Foundation complete and framing release",
  },
  {
    id: "daycare",
    project_name: "Corner Daycare Concept",
    civic_address: "80 Avenue NW, Edmonton",
    status: "Pre-Construction",
  },
];

describe("management data helpers", () => {
  it("derives honest schedule entries from recorded project dates", () => {
    const entries = buildProjectScheduleEntries(projects, new Date("2026-09-01"));

    expect(entries.some((entry) => entry.label === "Target completion")).toBe(true);
    expect(entries.some((entry) => entry.label === "Annual warranty follow-up")).toBe(true);
    expect(entries.every((entry) => entry.projectId === "parkallen")).toBe(true);
  });

  it("derives project documents and compliance scores from actual registry fields", () => {
    const documents = buildProjectDocuments(projects);
    const compliance = buildProjectCompliance(projects);

    expect(documents).toHaveLength(2);
    expect(compliance.find((item) => item.projectId === "parkallen")?.score).toBeGreaterThan(80);
    expect(compliance.find((item) => item.projectId === "daycare")?.missingCount).toBeGreaterThan(4);
  });

  it("builds budget summaries and coverage without inventing actual costs", () => {
    const budgetRows = buildBudgetRows(projects);

    expect(budgetRows.find((row) => row.projectId === "parkallen")).toEqual(
      expect.objectContaining({
        hasBaseline: true,
        grossSpread: 650000,
      })
    );
    expect(budgetRows.find((row) => row.projectId === "daycare")?.hasBaseline).toBe(false);
  });

  it("derives warranty reminders and exports registry csv", () => {
    const reminders = buildWarrantyReminders(projects, new Date("2027-08-20"));
    const csv = buildProjectsCsv(projects);

    expect(reminders.find((item) => item.projectId === "parkallen")?.status).toBe("review-soon");
    expect(reminders.find((item) => item.projectId === "daycare")?.status).toBe("missing");
    expect(csv).toContain("Project Name,Status,Address");
    expect(csv).toContain("Parkallen Fourplex");
  });

  it("calculates registry coverage percentages from real fields only", () => {
    expect(getRegistryCoverage(projects)).toEqual({
      averageCompliance: expect.any(Number),
      budgetCoverage: 50,
      datedProjectsCoverage: 50,
      documentCoverage: 50,
    });
  });
});
