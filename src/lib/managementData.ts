export type ManagementProject = {
  id: string;
  project_name: string;
  civic_address: string;
  status: string;
  estimated_budget?: number;
  selling_price?: number;
  start_date?: string;
  estimated_end_date?: string;
  actual_end_date?: string;
  legal_land_description?: string;
  warranty_start_date?: string;
  zoning_code?: string;
  deposit_amount?: number;
  development_permit_pdf?: string;
  building_permit_pdf?: string;
  real_property_report?: string;
  project_owner?: string;
  project_manager?: string;
  primary_contact_email?: string;
  next_milestone?: string;
  status_note?: string;
};

export type ProjectRegistrySource = "environment" | "temporary" | "unconfigured";

export type DashboardStatus = {
  authConfigured: boolean;
  emailConfigured: boolean;
  projectRegistry: {
    editable: boolean;
    projectCount: number;
    source: ProjectRegistrySource;
  };
};

export type ProjectScheduleEntry = {
  category: "start" | "target" | "actual" | "warranty" | "review";
  date: string;
  detail: string;
  id: string;
  isOverdue: boolean;
  isUpcoming: boolean;
  label: string;
  projectId: string;
  projectName: string;
  status: string;
};

export type ProjectUndatedMilestone = {
  detail: string;
  projectId: string;
  projectName: string;
  status: string;
};

export type ProjectDocumentRecord = {
  href: string;
  id: string;
  kind: "Development Permit" | "Building Permit" | "Real Property Report";
  projectId: string;
  projectName: string;
};

export type ProjectComplianceCheck = {
  detail: string;
  label: string;
  ready: boolean;
};

export type ProjectComplianceSummary = {
  checks: ProjectComplianceCheck[];
  missingCount: number;
  projectId: string;
  projectName: string;
  readyCount: number;
  score: number;
};

export type ProjectBudgetRow = {
  budgetCoverageRatio: number | null;
  depositAmount?: number;
  estimatedBudget?: number;
  grossSpread?: number;
  hasBaseline: boolean;
  projectId: string;
  projectName: string;
  sellingPrice?: number;
  status: string;
};

export type ProjectWarrantyReminder = {
  anniversaryDate: string | null;
  daysUntilReview: number | null;
  projectId: string;
  projectName: string;
  recordedStartDate: string | null;
  status: "missing" | "review-due" | "review-soon" | "tracked";
};

export async function fetchManagementJson<T>(url: string): Promise<T> {
  const response = await fetch(url, {
    cache: "no-store",
    credentials: "include",
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error?.message || `Request failed: ${response.status}`);
  }

  return response.json();
}

function parseDateValue(value?: string | null): Date | null {
  if (!value) {
    return null;
  }

  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
}

function toIsoDate(value: Date): string {
  return value.toISOString();
}

function addYears(value: Date, years: number): Date {
  const next = new Date(value);
  next.setFullYear(next.getFullYear() + years);
  return next;
}

function isCompletionLike(status?: string) {
  return ["completed", "warranty"].includes((status || "").toLowerCase());
}

function getProjectDocumentCount(project: ManagementProject) {
  return [
    project.development_permit_pdf,
    project.building_permit_pdf,
    project.real_property_report,
  ].filter(Boolean).length;
}

export function formatCurrency(value?: number, fallback = "Not set") {
  if (typeof value !== "number" || !Number.isFinite(value)) {
    return fallback;
  }

  return new Intl.NumberFormat("en-CA", {
    style: "currency",
    currency: "CAD",
    maximumFractionDigits: 0,
  }).format(value);
}

export function formatDate(value?: string | null, fallback = "Not set") {
  const parsed = parseDateValue(value);

  if (!parsed) {
    return fallback;
  }

  return new Intl.DateTimeFormat("en-CA", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(parsed);
}

export function buildProjectScheduleEntries(
  projects: ManagementProject[],
  referenceDate = new Date()
) {
  const entries: ProjectScheduleEntry[] = [];
  const upcomingThreshold = new Date(referenceDate);
  upcomingThreshold.setDate(upcomingThreshold.getDate() + 30);

  projects.forEach((project) => {
    const pushEntry = (
      label: string,
      category: ProjectScheduleEntry["category"],
      rawDate: string | undefined,
      detail: string
    ) => {
      const parsed = parseDateValue(rawDate);

      if (!parsed) {
        return;
      }

      entries.push({
        category,
        date: toIsoDate(parsed),
        detail,
        id: `${project.id}-${category}-${label}`,
        isOverdue:
          category === "target" &&
          parsed < referenceDate &&
          !isCompletionLike(project.status),
        isUpcoming: parsed >= referenceDate && parsed <= upcomingThreshold,
        label,
        projectId: project.id,
        projectName: project.project_name,
        status: project.status,
      });
    };

    pushEntry(
      "Recorded start",
      "start",
      project.start_date,
      "Project start date captured in the live registry."
    );
    pushEntry(
      "Target completion",
      "target",
      project.estimated_end_date,
      "Target completion date taken from the current project record."
    );
    pushEntry(
      "Actual completion",
      "actual",
      project.actual_end_date,
      "Actual completion date captured in the live registry."
    );
    pushEntry(
      "Recorded warranty start",
      "warranty",
      project.warranty_start_date,
      "Warranty-related follow-up begins from the recorded warranty start date."
    );

    const annualReview = parseDateValue(project.warranty_start_date);
    if (annualReview) {
      const anniversaryDate = addYears(annualReview, 1);
      entries.push({
        category: "review",
        date: toIsoDate(anniversaryDate),
        detail:
          "Annual follow-up reminder derived from the recorded warranty start date. Confirm actual warranty terms separately.",
        id: `${project.id}-review-annual`,
        isOverdue: anniversaryDate < referenceDate,
        isUpcoming:
          anniversaryDate >= referenceDate && anniversaryDate <= upcomingThreshold,
        label: "Annual warranty follow-up",
        projectId: project.id,
        projectName: project.project_name,
        status: project.status,
      });
    }
  });

  return entries.sort(
    (left, right) =>
      parseDateValue(left.date)!.getTime() - parseDateValue(right.date)!.getTime()
  );
}

export function buildUndatedMilestones(projects: ManagementProject[]) {
  return projects
    .filter((project) => Boolean(project.next_milestone))
    .map<ProjectUndatedMilestone>((project) => ({
      detail: project.next_milestone || "",
      projectId: project.id,
      projectName: project.project_name,
      status: project.status,
    }));
}

export function buildProjectDocuments(projects: ManagementProject[]) {
  const documents: ProjectDocumentRecord[] = [];

  projects.forEach((project) => {
    const addDocument = (
      kind: ProjectDocumentRecord["kind"],
      href: string | undefined,
      suffix: string
    ) => {
      if (!href) {
        return;
      }

      documents.push({
        href,
        id: `${project.id}-${suffix}`,
        kind,
        projectId: project.id,
        projectName: project.project_name,
      });
    };

    addDocument("Development Permit", project.development_permit_pdf, "development");
    addDocument("Building Permit", project.building_permit_pdf, "building");
    addDocument("Real Property Report", project.real_property_report, "rpr");
  });

  return documents;
}

export function buildProjectCompliance(projects: ManagementProject[]) {
  return projects.map<ProjectComplianceSummary>((project) => {
    const checks: ProjectComplianceCheck[] = [
      {
        detail: project.legal_land_description
          ? "Legal land details are recorded."
          : "Legal land details still need to be entered.",
        label: "Legal land record",
        ready: Boolean(project.legal_land_description),
      },
      {
        detail: project.development_permit_pdf
          ? "Development permit reference is linked."
          : "Development permit reference is missing.",
        label: "Development permit link",
        ready: Boolean(project.development_permit_pdf),
      },
      {
        detail: project.building_permit_pdf
          ? "Building permit reference is linked."
          : "Building permit reference is missing.",
        label: "Building permit link",
        ready: Boolean(project.building_permit_pdf),
      },
      {
        detail: project.real_property_report
          ? "Real property report is linked."
          : "Real property report is missing.",
        label: "Real property report",
        ready: Boolean(project.real_property_report),
      },
      {
        detail: project.zoning_code
          ? "Zoning code is recorded."
          : "Zoning code is not recorded.",
        label: "Zoning reference",
        ready: Boolean(project.zoning_code),
      },
      {
        detail: project.warranty_start_date
          ? "Warranty start date is recorded for follow-up."
          : "Warranty start date is not yet recorded.",
        label: "Warranty follow-up record",
        ready: Boolean(project.warranty_start_date),
      },
    ];

    const readyCount = checks.filter((check) => check.ready).length;
    const totalCount = checks.length;

    return {
      checks,
      missingCount: totalCount - readyCount,
      projectId: project.id,
      projectName: project.project_name,
      readyCount,
      score: Math.round((readyCount / totalCount) * 100),
    };
  });
}

export function buildBudgetRows(projects: ManagementProject[]) {
  return projects.map<ProjectBudgetRow>((project) => {
    const hasBaseline =
      typeof project.estimated_budget === "number" &&
      Number.isFinite(project.estimated_budget);
    const budgetCoverageRatio =
      hasBaseline && typeof project.deposit_amount === "number"
        ? project.deposit_amount / project.estimated_budget!
        : null;
    const grossSpread =
      hasBaseline && typeof project.selling_price === "number"
        ? project.selling_price - project.estimated_budget!
        : undefined;

    return {
      budgetCoverageRatio,
      depositAmount: project.deposit_amount,
      estimatedBudget: project.estimated_budget,
      grossSpread,
      hasBaseline,
      projectId: project.id,
      projectName: project.project_name,
      sellingPrice: project.selling_price,
      status: project.status,
    };
  });
}

export function buildBudgetSummary(rows: ProjectBudgetRow[]) {
  return rows.reduce(
    (summary, row) => ({
      missingBaselines: summary.missingBaselines + (row.hasBaseline ? 0 : 1),
      totalBudget:
        summary.totalBudget + (typeof row.estimatedBudget === "number" ? row.estimatedBudget : 0),
      totalDeposits:
        summary.totalDeposits + (typeof row.depositAmount === "number" ? row.depositAmount : 0),
      totalSelling:
        summary.totalSelling + (typeof row.sellingPrice === "number" ? row.sellingPrice : 0),
    }),
    {
      missingBaselines: 0,
      totalBudget: 0,
      totalDeposits: 0,
      totalSelling: 0,
    }
  );
}

export function buildWarrantyReminders(
  projects: ManagementProject[],
  referenceDate = new Date()
) {
  return projects
    .map<ProjectWarrantyReminder>((project) => {
      const recordedStart = parseDateValue(project.warranty_start_date);

      if (!recordedStart) {
        return {
          anniversaryDate: null,
          daysUntilReview: null,
          projectId: project.id,
          projectName: project.project_name,
          recordedStartDate: null,
          status: "missing",
        };
      }

      const annualReviewDate = addYears(recordedStart, 1);
      const msPerDay = 1000 * 60 * 60 * 24;
      const daysUntilReview = Math.ceil(
        (annualReviewDate.getTime() - referenceDate.getTime()) / msPerDay
      );

      return {
        anniversaryDate: toIsoDate(annualReviewDate),
        daysUntilReview,
        projectId: project.id,
        projectName: project.project_name,
        recordedStartDate: toIsoDate(recordedStart),
        status:
          daysUntilReview < 0
            ? "review-due"
            : daysUntilReview <= 60
              ? "review-soon"
              : "tracked",
      };
    })
    .sort((left, right) => {
      if (!left.anniversaryDate) {
        return 1;
      }

      if (!right.anniversaryDate) {
        return -1;
      }

      return (
        parseDateValue(left.anniversaryDate)!.getTime() -
        parseDateValue(right.anniversaryDate)!.getTime()
      );
    });
}

export function buildProjectActivity(project: ManagementProject) {
  return buildProjectScheduleEntries([project]).filter(
    (entry) => entry.projectId === project.id
  );
}

export function buildProjectsCsv(projects: ManagementProject[]) {
  const headers = [
    "Project Name",
    "Status",
    "Address",
    "Budget Baseline",
    "Deposit Recorded",
    "Selling Price",
    "Project Manager",
    "Primary Contact",
    "Development Permit Linked",
    "Building Permit Linked",
    "Real Property Report Linked",
  ];

  const rows = projects.map((project) => [
    project.project_name,
    project.status,
    project.civic_address,
    project.estimated_budget ?? "",
    project.deposit_amount ?? "",
    project.selling_price ?? "",
    project.project_manager || project.project_owner || "",
    project.primary_contact_email || "",
    project.development_permit_pdf ? "Yes" : "No",
    project.building_permit_pdf ? "Yes" : "No",
    project.real_property_report ? "Yes" : "No",
  ]);

  const escapeCell = (value: string | number) => {
    const normalized = String(value ?? "");
    return /[",\n]/.test(normalized)
      ? `"${normalized.replace(/"/g, '""')}"`
      : normalized;
  };

  return [headers, ...rows].map((row) => row.map(escapeCell).join(",")).join("\n");
}

export function getRegistryCoverage(projects: ManagementProject[]) {
  const compliance = buildProjectCompliance(projects);
  const budgetRows = buildBudgetRows(projects);
  const documents = buildProjectDocuments(projects);
  const projectsWithDocuments = new Set(documents.map((item) => item.projectId));
  const projectsWithDates = projects.filter(
    (project) => Boolean(project.start_date && project.estimated_end_date)
  ).length;

  return {
    averageCompliance:
      compliance.length > 0
        ? Math.round(
            compliance.reduce((sum, item) => sum + item.score, 0) / compliance.length
          )
        : 0,
    budgetCoverage:
      budgetRows.length > 0
        ? Math.round(
            (budgetRows.filter((row) => row.hasBaseline).length / budgetRows.length) * 100
          )
        : 0,
    documentCoverage:
      projects.length > 0
        ? Math.round((projectsWithDocuments.size / projects.length) * 100)
        : 0,
    datedProjectsCoverage:
      projects.length > 0 ? Math.round((projectsWithDates / projects.length) * 100) : 0,
  };
}

export function getProjectControlGaps(project: ManagementProject) {
  return [
    !project.legal_land_description ? "Legal land description is missing." : null,
    !project.estimated_budget ? "Budget baseline is missing." : null,
    !project.project_manager && !project.project_owner
      ? "Project owner or manager is not assigned."
      : null,
    !project.primary_contact_email ? "Primary contact email is not set." : null,
    !getProjectDocumentCount(project) ? "No permit or diligence links are attached." : null,
    !project.start_date || !project.estimated_end_date
      ? "Core schedule checkpoints are incomplete."
      : null,
  ].filter((item): item is string => Boolean(item));
}
