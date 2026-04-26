import type { ManagementProject } from "./managementData";
import {
  buildProjectAlerts,
  getProjectFinancialSummary,
  getProjectHealthStatus,
  getSuggestedNextActions,
  type BuildOsAlert,
  type ProjectFinancialSummary,
  type ProjectHealthStatus,
} from "./buildosIntelligence";
import {
  getProjectTaskSummary,
  isTaskOverdue,
  type BuildOsTaskSummary,
} from "./buildosTasks";
import {
  buildVendorMemorySnapshot,
  type VendorMemoryInsight,
} from "./vendorMemory";
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

export type ProjectControlTone = "green" | "yellow" | "red";
export type ProjectRiskLevel = "Low" | "Moderate" | "High";
export type ProjectScheduleLabel = "On Track" | "Needs Recovery" | "Delayed";
export type ProjectScopeStatus = "On Scope" | "Scope Pressured" | "Scope Drifted";

export type ProjectRiskSignal = {
  detail: string;
  label: "Vendor Risk" | "Delay Risk" | "Financial Risk";
  level: ProjectRiskLevel;
  tone: ProjectControlTone;
};

export type ProjectParticipantCounts = {
  buyers: number;
  investors: number;
  lawyers: number;
  lenders: number;
  realtors: number;
  stakeholders: number;
  total: number;
  vendors: number;
};

export type ProjectVendorInsight = VendorMemoryInsight;

export type PortfolioControlSnapshot = {
  cashPosition: number;
  cashPositionDetail: string;
  cashPositionLabel: "Positive" | "Tight" | "Negative";
  cashPositionTone: ProjectControlTone;
  criticalIssueCount: number;
  criticalIssueDetail: string;
  financialHealthDetail: string;
  financialHealthLabel: "Stable" | "Needs Attention" | "At Risk";
  financialHealthTone: ProjectControlTone;
  nextThreeActions: string[];
  pendingChangeOrderCount: number;
  pendingChangeOrderExposure: number;
  profitAtRisk: number;
  scheduleDetail: string;
  scheduleLabel: "On Track" | "Needs Recovery" | "Delayed";
  scheduleTone: ProjectControlTone;
  scopeDriftedCount: number;
  scopePressuredCount: number;
  warningProjectCount: number;
  criticalProjectCount: number;
};

export type ProjectControlExportSheets = Record<
  string,
  Array<Record<string, string | number>>
>;

export type ProjectControlSnapshot = {
  alerts: BuildOsAlert[];
  automationSummary: {
    immediateNextActions: string[];
    profitPressure: string[];
    scopeItems: string[];
    whatChanged: string[];
  };
  budgetChartData: Array<{
    actualCost: number;
    expectedBudget: number;
    label: string;
    revisedBudget: number;
  }>;
  cashPosition: number;
  cashPositionDetail: string;
  cashPositionLabel: "Positive" | "Tight" | "Negative";
  cashPositionTone: ProjectControlTone;
  costOverrunPressure: number;
  criticalIssueCount: number;
  currentCostProjection: number;
  currentProfit: number | null;
  delayRiskDetail: string;
  expectedProfit: number | null;
  financialHealthDetail: string;
  financialHealthTone: ProjectControlTone;
  marginImpact: number | null;
  nextThreeActions: string[];
  participantCounts: ProjectParticipantCounts;
  pendingChangeOrderAgingDays: number;
  pendingChangeOrderCount: number;
  profitAtRisk: number;
  profitBridgeData: Array<{
    base: number;
    change: number;
    label: string;
    magnitude: number;
    resulting: number;
    tone: ProjectControlTone;
  }>;
  projectHealth: ProjectHealthStatus;
  projectSummary: ProjectFinancialSummary;
  revenueBaseline: number | null;
  riskSignals: ProjectRiskSignal[];
  scheduleDetail: string;
  scheduleLabel: ProjectScheduleLabel;
  scheduleTone: ProjectControlTone;
  scopeReasons: string[];
  scopeStatus: ProjectScopeStatus;
  scopeTone: ProjectControlTone;
  topVendors: ProjectVendorInsight[];
  useWithCautionVendors: ProjectVendorInsight[];
  vendorRiskDetail: string;
  vendorsToAvoid: ProjectVendorInsight[];
};

function sum(values: number[]) {
  return values.reduce((total, value) => total + value, 0);
}

function daysBetween(referenceDate: Date, rawDate?: string) {
  if (!rawDate) {
    return 0;
  }

  const parsed = new Date(rawDate);
  if (Number.isNaN(parsed.getTime())) {
    return 0;
  }

  return Math.max(
    0,
    Math.ceil((referenceDate.getTime() - parsed.getTime()) / (1000 * 60 * 60 * 24))
  );
}

function getRevenueBaseline(project: ManagementProject, invoices: BuildOsClientInvoice[]) {
  if (
    typeof project.contracted_revenue === "number" &&
    Number.isFinite(project.contracted_revenue)
  ) {
    return project.contracted_revenue;
  }

  if (typeof project.selling_price === "number" && Number.isFinite(project.selling_price)) {
    return project.selling_price;
  }

  const linkedInvoices = invoices.filter((invoice) => invoice.projectId === project.id);
  return linkedInvoices.length ? sum(linkedInvoices.map((invoice) => invoice.amount)) : null;
}

function mapProjectHealthTone(health: ProjectHealthStatus): ProjectControlTone {
  if (health === "Critical") {
    return "red";
  }

  if (health === "Warning") {
    return "yellow";
  }

  return "green";
}

function mapRiskTone(level: ProjectRiskLevel): ProjectControlTone {
  if (level === "High") {
    return "red";
  }

  if (level === "Moderate") {
    return "yellow";
  }

  return "green";
}

function resolveRelevantRecords(
  records: BuildOsMasterRecord[],
  projectId: string,
  assignment?: BuildOsProjectParticipantAssignment | null
) {
  const linkedByProject = records.filter((record) => record.linkedProjectIds.includes(projectId));

  if (!assignment) {
    return linkedByProject;
  }

  const assignedIds = new Set(
    [
      assignment.sellerSideRealtorId,
      assignment.buyerSideRealtorId,
      assignment.sellerSideLawyerId,
      assignment.buyerSideLawyerId,
      ...assignment.stakeholderClientIds,
      ...assignment.buyerIds,
      ...assignment.lenderIds,
      ...assignment.investorIds,
      ...assignment.otherRecordIds,
    ].filter((value): value is string => Boolean(value))
  );

  return records.filter(
    (record) => assignedIds.has(record.id) || record.linkedProjectIds.includes(projectId)
  );
}

function buildParticipantCounts(records: BuildOsMasterRecord[]): ProjectParticipantCounts {
  return {
    buyers: records.filter((record) => record.type === "Buyer").length,
    investors: records.filter((record) => record.type === "Investor").length,
    lawyers: records.filter((record) => record.type === "Lawyer").length,
    lenders: records.filter((record) => record.type === "Lender").length,
    realtors: records.filter((record) => record.type === "Realtor").length,
    stakeholders: records.filter((record) => record.type === "Stakeholder (Client)").length,
    total: records.length,
    vendors: records.filter((record) => record.type === "Vendor (Trade)").length,
  };
}

function buildScopeAssessment({
  alerts,
  currentCostProjection,
  pendingChangeOrderExposure,
  project,
  revisedBudget,
  staleChangeOrders,
  taskSummary,
}: {
  alerts: BuildOsAlert[];
  currentCostProjection: number;
  pendingChangeOrderExposure: number;
  project: ManagementProject;
  revisedBudget: number;
  staleChangeOrders: BuildOsChangeOrder[];
  taskSummary: BuildOsTaskSummary;
}) {
  const reasons: string[] = [];
  const thresholdBase = Math.max(25000, revisedBudget * 0.08);
  const costOverrunPressure = Math.max(0, currentCostProjection - revisedBudget);
  const scheduleDelayed = alerts.some(
    (alert) => alert.projectId === project.id && alert.module === "daily-log"
  );

  if (!project.scope_subject?.trim()) {
    reasons.push("The project still needs a clear scope subject line for contract control.");
  }

  if (!project.scope_summary?.trim()) {
    reasons.push("The recorded scope summary is still incomplete.");
  }

  if (pendingChangeOrderExposure > 0) {
    reasons.push(
      `Pending change orders currently carry ${pendingChangeOrderExposure.toLocaleString("en-CA", {
        style: "currency",
        currency: "CAD",
        maximumFractionDigits: 0,
      })} of unresolved scope value.`
    );
  }

  if (staleChangeOrders.length) {
    reasons.push(
      `${staleChangeOrders.length} pending change order${staleChangeOrders.length === 1 ? "" : "s"} have been aging without approval.`
    );
  }

  if (costOverrunPressure > 0) {
    reasons.push(
      `Current cost projection is ${costOverrunPressure.toLocaleString("en-CA", {
        style: "currency",
        currency: "CAD",
        maximumFractionDigits: 0,
      })} above the revised budget.`
    );
  }

  if (scheduleDelayed || taskSummary.overdue > 0) {
    reasons.push("Schedule slippage is increasing the chance of unpriced scope drift.");
  }

  if (project.scope_note?.trim()) {
    reasons.push(project.scope_note.trim());
  }

  if (
    costOverrunPressure > 0 ||
    pendingChangeOrderExposure >= thresholdBase ||
    staleChangeOrders.length >= 2
  ) {
    return {
      reasons,
      status: "Scope Drifted" as ProjectScopeStatus,
      tone: "red" as ProjectControlTone,
    };
  }

  if (reasons.length) {
    return {
      reasons,
      status: "Scope Pressured" as ProjectScopeStatus,
      tone: "yellow" as ProjectControlTone,
    };
  }

  return {
    reasons: ["Recorded scope, cost, and approval status are currently aligned."],
    status: "On Scope" as ProjectScopeStatus,
    tone: "green" as ProjectControlTone,
  };
}

function buildScheduleAssessment({
  overdueMilestones,
  project,
  taskSummary,
}: {
  overdueMilestones: number;
  project: ManagementProject;
  taskSummary: BuildOsTaskSummary;
}) {
  const targetDatePassed =
    project.status !== "Completed" &&
    project.status !== "Warranty" &&
    project.estimated_end_date &&
    new Date(project.estimated_end_date) < new Date();

  if (targetDatePassed || overdueMilestones > 0 || taskSummary.overdue >= 3) {
    return {
      detail: targetDatePassed
        ? "Target completion has passed and the schedule needs recovery."
        : "Overdue milestone or task pressure is now materially affecting delivery.",
      label: "Delayed" as ProjectScheduleLabel,
      tone: "red" as ProjectControlTone,
    };
  }

  if (taskSummary.overdue > 0 || taskSummary.blocked > 0 || taskSummary.dueSoon >= 3) {
    return {
      detail: "The job is still recoverable, but overdue or blocked work needs attention.",
      label: "Needs Recovery" as ProjectScheduleLabel,
      tone: "yellow" as ProjectControlTone,
    };
  }

  return {
    detail: "No material schedule drift is visible from the current task and milestone data.",
    label: "On Track" as ProjectScheduleLabel,
    tone: "green" as ProjectControlTone,
  };
}

function buildProfitBridgeData(
  expectedProfit: number | null,
  approvedImpact: number,
  pendingExposure: number,
  overrunPressure: number,
  currentProfit: number | null
) {
  if (expectedProfit === null || currentProfit === null) {
    return [];
  }

  const data: ProjectControlSnapshot["profitBridgeData"] = [];

  const pushAbsoluteBar = (
    label: string,
    value: number,
    tone: ProjectControlTone
  ) => {
    data.push({
      base: value < 0 ? value : 0,
      change: value,
      label,
      magnitude: Math.abs(value),
      resulting: value,
      tone,
    });
  };

  const pushStepBar = (
    label: string,
    from: number,
    to: number,
    tone: ProjectControlTone
  ) => {
    data.push({
      base: Math.min(from, to),
      change: to - from,
      label,
      magnitude: Math.abs(from - to),
      resulting: to,
      tone,
    });
  };

  pushAbsoluteBar("Expected Profit", expectedProfit, expectedProfit >= 0 ? "green" : "red");

  let running = expectedProfit;

  if (approvedImpact > 0) {
    const next = running - approvedImpact;
    pushStepBar("Approved Scope Impact", running, next, "yellow");
    running = next;
  }

  if (pendingExposure > 0) {
    const next = running - pendingExposure;
    pushStepBar("Pending Exposure", running, next, "red");
    running = next;
  }

  if (overrunPressure > 0) {
    const next = running - overrunPressure;
    pushStepBar("Cost Overrun", running, next, "red");
    running = next;
  }

  pushAbsoluteBar("Current Profit", currentProfit, currentProfit >= 0 ? "green" : "red");

  return data;
}

function buildAutomationSummary({
  currentProfit,
  expectedProfit,
  nextActions,
  pendingChangeOrderExposure,
  profitAtRisk,
  project,
  scopeReasons,
  summary,
}: {
  currentProfit: number | null;
  expectedProfit: number | null;
  nextActions: string[];
  pendingChangeOrderExposure: number;
  profitAtRisk: number;
  project: ManagementProject;
  scopeReasons: string[];
  summary: ProjectFinancialSummary;
}) {
  const whatChanged: string[] = [];
  const profitPressure: string[] = [];
  const scopeItems: string[] = [];

  if (summary.approvedChangeOrderImpact > 0) {
    whatChanged.push(
      `Approved change orders have added ${summary.approvedChangeOrderImpact.toLocaleString("en-CA", {
        style: "currency",
        currency: "CAD",
        maximumFractionDigits: 0,
      })} to the live budget.`
    );
  }

  if (summary.actualCosts > 0) {
    whatChanged.push(
      `Actual paid costs now sit at ${summary.actualCosts.toLocaleString("en-CA", {
        style: "currency",
        currency: "CAD",
        maximumFractionDigits: 0,
      })}.`
    );
  }

  if (summary.unpaidVendorBills > 0 || summary.unpaidClientInvoices > 0) {
    whatChanged.push(
      `Open payment pressure is ${(
        summary.unpaidVendorBills + summary.unpaidClientInvoices
      ).toLocaleString("en-CA", {
        style: "currency",
        currency: "CAD",
        maximumFractionDigits: 0,
      })} across receivables and payables.`
    );
  }

  if (!whatChanged.length) {
    whatChanged.push("No material financial movement has been recorded beyond the current baseline.");
  }

  if (expectedProfit === null || currentProfit === null) {
    profitPressure.push("Revenue baseline still needs to be confirmed before profit can be trusted.");
  } else {
    profitPressure.push(
      `Expected profit is ${expectedProfit.toLocaleString("en-CA", {
        style: "currency",
        currency: "CAD",
        maximumFractionDigits: 0,
      })}; current profit is ${currentProfit.toLocaleString("en-CA", {
        style: "currency",
        currency: "CAD",
        maximumFractionDigits: 0,
      })}.`
    );
  }

  if (profitAtRisk > 0) {
    profitPressure.push(
      `Profit at risk is currently ${profitAtRisk.toLocaleString("en-CA", {
        style: "currency",
        currency: "CAD",
        maximumFractionDigits: 0,
      })}.`
    );
  }

  if (pendingChangeOrderExposure > 0) {
    profitPressure.push(
      `Unapproved revenue and scope exposure remain tied to ${pendingChangeOrderExposure.toLocaleString("en-CA", {
        style: "currency",
        currency: "CAD",
        maximumFractionDigits: 0,
      })} in pending change orders.`
    );
  }

  if (!scopeReasons.length) {
    scopeItems.push("Scope appears aligned with the recorded budget, approvals, and execution record.");
  } else {
    scopeItems.push(...scopeReasons);
  }

  if (!project.scope_subject?.trim()) {
    scopeItems.push("Add a clear scope subject so the job has a visible contract-control headline.");
  }

  return {
    immediateNextActions: nextActions.length
      ? nextActions
      : ["No immediate next action was generated from the current structured data."],
    profitPressure,
    scopeItems,
    whatChanged,
  };
}

export function buildProjectControlSnapshot({
  assignment,
  changeOrders,
  clientInvoices,
  deficiencies,
  documents,
  project,
  records,
  tasks,
  vendorBills,
}: {
  assignment?: BuildOsProjectParticipantAssignment | null;
  changeOrders: BuildOsChangeOrder[];
  clientInvoices: BuildOsClientInvoice[];
  deficiencies: BuildOsDeficiency[];
  documents: BuildOsDocumentRecord[];
  project: ManagementProject;
  records: BuildOsMasterRecord[];
  tasks: BuildOsTask[];
  vendorBills: BuildOsVendorBill[];
}): ProjectControlSnapshot {
  const projectSummary = getProjectFinancialSummary(
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
    documents,
    tasks
  );
  const projectHealth = getProjectHealthStatus(project, projectSummary, deficiencies, alerts);
  const nextThreeActions = getSuggestedNextActions(project, projectSummary, alerts).slice(0, 3);
  const linkedTasks = tasks.filter((task) => task.projectId === project.id);
  const linkedChangeOrders = changeOrders.filter((item) => item.projectId === project.id);
  const linkedDeficiencies = deficiencies.filter((item) => item.projectId === project.id);
  const relevantRecords = resolveRelevantRecords(records, project.id, assignment);
  const linkedVendors = relevantRecords.filter((record) => record.type === "Vendor (Trade)");
  const taskSummary = getProjectTaskSummary(project.id, tasks);
  const overdueMilestones = linkedTasks.filter(
    (task) => task.milestone && isTaskOverdue(task)
  ).length;
  const currentCostProjection = Math.max(
    projectSummary.revisedBudget,
    projectSummary.committedCosts,
    projectSummary.actualCosts
  );
  const revenueBaseline = getRevenueBaseline(project, clientInvoices);
  const expectedProfit =
    revenueBaseline !== null ? revenueBaseline - projectSummary.originalBudget : null;
  const currentProfit =
    revenueBaseline !== null ? revenueBaseline - currentCostProjection : null;
  const marginImpact =
    expectedProfit !== null && currentProfit !== null
      ? currentProfit - expectedProfit
      : null;
  const costOverrunPressure = Math.max(0, currentCostProjection - projectSummary.revisedBudget);
  const profitAtRisk =
    expectedProfit !== null && currentProfit !== null
      ? Math.max(0, expectedProfit - currentProfit) + projectSummary.pendingChangeOrderExposure
      : projectSummary.pendingChangeOrderExposure + costOverrunPressure;
  const pendingChangeOrders = linkedChangeOrders.filter((item) =>
    ["Draft", "Pending Approval"].includes(item.status)
  );
  const pendingChangeOrderAgingDays = pendingChangeOrders.length
    ? Math.max(
        ...pendingChangeOrders.map((item) =>
          daysBetween(new Date(), item.updatedAt || item.createdAt)
        )
      )
    : 0;
  const scheduleAssessment = buildScheduleAssessment({
    overdueMilestones,
    project,
    taskSummary,
  });
  const scopeAssessment = buildScopeAssessment({
    alerts,
    currentCostProjection,
    pendingChangeOrderExposure: projectSummary.pendingChangeOrderExposure,
    project,
    revisedBudget: projectSummary.revisedBudget,
    staleChangeOrders: pendingChangeOrders.filter(
      (item) => daysBetween(new Date(), item.updatedAt || item.createdAt) >= 14
    ),
    taskSummary,
  });

  const cashPosition = projectSummary.cashInflows - projectSummary.cashOutflows;
  let cashPositionTone: ProjectControlTone = "green";
  let cashPositionLabel: "Positive" | "Tight" | "Negative" = "Positive";

  if (cashPosition < 0) {
    cashPositionTone = "red";
    cashPositionLabel = "Negative";
  } else if (
    cashPosition <= projectSummary.pendingChangeOrderExposure ||
    projectSummary.unpaidVendorBills > cashPosition
  ) {
    cashPositionTone = "yellow";
    cashPositionLabel = "Tight";
  }

  const vendorMemory = buildVendorMemorySnapshot(linkedVendors);
  const vendorsToAvoid = vendorMemory.blockedVendors.slice(0, 3);
  const useWithCautionVendors = vendorMemory.cautionVendors.slice(0, 3);
  const topVendors = vendorMemory.topVendors.slice(0, 3);

  const vendorRiskLevel: ProjectRiskLevel = vendorsToAvoid.length
    ? "High"
    : useWithCautionVendors.length
      ? "Moderate"
      : "Low";
  const delayRiskLevel: ProjectRiskLevel =
    scheduleAssessment.label === "Delayed"
      ? "High"
      : scheduleAssessment.label === "Needs Recovery"
        ? "Moderate"
        : "Low";
  const financialRiskLevel: ProjectRiskLevel =
    profitAtRisk >= Math.max(25000, projectSummary.revisedBudget * 0.1) ||
    projectSummary.unpaidVendorBills > projectSummary.revisedBudget * 0.15 ||
    (projectSummary.varianceRatio !== null && projectSummary.varianceRatio >= 1)
      ? "High"
      : profitAtRisk > 0 ||
          projectSummary.unpaidClientInvoices > 0 ||
          projectSummary.unpaidVendorBills > 0 ||
          (projectSummary.varianceRatio !== null && projectSummary.varianceRatio >= 0.85)
        ? "Moderate"
        : "Low";

  const riskSignals: ProjectRiskSignal[] = [
    {
      detail: vendorsToAvoid.length
        ? `${vendorsToAvoid.length} linked vendor record(s) are marked high risk or do-not-use.`
        : useWithCautionVendors.length
          ? `${useWithCautionVendors.length} linked vendor record(s) should be used with caution.`
          : "Linked trade partners are currently clean and reusable.",
      label: "Vendor Risk",
      level: vendorRiskLevel,
      tone: mapRiskTone(vendorRiskLevel),
    },
    {
      detail: scheduleAssessment.detail,
      label: "Delay Risk",
      level: delayRiskLevel,
      tone: mapRiskTone(delayRiskLevel),
    },
    {
      detail:
        financialRiskLevel === "High"
          ? "Profit compression, unpaid obligations, or cost variance are now materially affecting the job."
          : financialRiskLevel === "Moderate"
            ? "Financial pressure is visible and should be monitored before the job drifts."
            : "Financial signals are currently stable from the structured records on hand.",
      label: "Financial Risk",
      level: financialRiskLevel,
      tone: mapRiskTone(financialRiskLevel),
    },
  ];

  return {
    alerts,
    automationSummary: buildAutomationSummary({
      currentProfit,
      expectedProfit,
      nextActions: nextThreeActions,
      pendingChangeOrderExposure: projectSummary.pendingChangeOrderExposure,
      profitAtRisk,
      project,
      scopeReasons: scopeAssessment.reasons,
      summary: projectSummary,
    }),
    budgetChartData: [
      {
        actualCost: projectSummary.actualCosts,
        expectedBudget: projectSummary.originalBudget,
        label: "Budget Control",
        revisedBudget: projectSummary.revisedBudget,
      },
    ],
    cashPosition,
    cashPositionDetail:
      cashPositionLabel === "Negative"
        ? "Paid-out costs are ahead of cash collected."
        : cashPositionLabel === "Tight"
          ? "Cash is positive, but it is being pressured by pending exposure or unpaid bills."
          : "Cash collected still sits ahead of paid-out costs on the recorded numbers.",
    cashPositionLabel,
    cashPositionTone,
    costOverrunPressure,
    criticalIssueCount:
      alerts.filter((alert) => alert.severity === "critical").length +
      linkedDeficiencies.filter(
        (item) => item.status !== "Closed" && item.severity === "Critical"
      ).length +
      vendorsToAvoid.length,
    currentCostProjection,
    currentProfit,
    delayRiskDetail: scheduleAssessment.detail,
    expectedProfit,
    financialHealthDetail:
      projectHealth === "Critical"
        ? "Margin, payments, or execution pressure now require active intervention."
        : projectHealth === "Warning"
          ? "The job is still manageable, but scope, schedule, or payment pressure is building."
          : "The current financial picture is steady based on the structured records in BuildOS.",
    financialHealthTone: mapProjectHealthTone(projectHealth),
    marginImpact,
    nextThreeActions,
    participantCounts: buildParticipantCounts(relevantRecords),
    pendingChangeOrderAgingDays,
    pendingChangeOrderCount: pendingChangeOrders.length,
    profitAtRisk,
    profitBridgeData: buildProfitBridgeData(
      expectedProfit,
      projectSummary.approvedChangeOrderImpact,
      projectSummary.pendingChangeOrderExposure,
      costOverrunPressure,
      currentProfit
    ),
    projectHealth,
    projectSummary,
    revenueBaseline,
    riskSignals,
    scheduleDetail: scheduleAssessment.detail,
    scheduleLabel: scheduleAssessment.label,
    scheduleTone: scheduleAssessment.tone,
    scopeReasons: scopeAssessment.reasons,
    scopeStatus: scopeAssessment.status,
    scopeTone: scopeAssessment.tone,
    topVendors,
    useWithCautionVendors,
    vendorRiskDetail: riskSignals.find((signal) => signal.label === "Vendor Risk")?.detail || "",
    vendorsToAvoid,
  };
}

export function buildProjectControlExportSheets(
  project: ManagementProject,
  snapshot: ProjectControlSnapshot
): ProjectControlExportSheets {
  return {
    "Automated Notes": [
      ...snapshot.automationSummary.whatChanged.map((bullet) => ({
        Bullet: bullet,
        Section: "What Changed",
      })),
      ...snapshot.automationSummary.profitPressure.map((bullet) => ({
        Bullet: bullet,
        Section: "Profit Pressure",
      })),
      ...snapshot.automationSummary.scopeItems.map((bullet) => ({
        Bullet: bullet,
        Section: "Scope Items Requiring Decision",
      })),
      ...snapshot.automationSummary.immediateNextActions.map((bullet) => ({
        Bullet: bullet,
        Section: "Immediate Next Actions",
      })),
    ],
    "Graph Data": [
      {
        Amount: snapshot.projectSummary.originalBudget,
        Graph: "Budget vs Actual vs Revised",
        Item: "Expected Budget",
      },
      {
        Amount: snapshot.projectSummary.revisedBudget,
        Graph: "Budget vs Actual vs Revised",
        Item: "Revised Budget",
      },
      {
        Amount: snapshot.projectSummary.actualCosts,
        Graph: "Budget vs Actual vs Revised",
        Item: "Actual Cost",
      },
      ...snapshot.profitBridgeData.map((step) => ({
        Amount: step.resulting,
        Change: step.change,
        Graph: "Profit Bridge",
        Item: step.label,
      })),
    ],
    "Profit & Scope Control": [
      {
        Metric: "Project",
        Note: project.civic_address,
        Value: project.project_name,
      },
      {
        Metric: "Status",
        Note: project.scope_subject || "Scope subject not set",
        Value: project.status,
      },
      {
        Metric: "Expected Budget",
        Note: "Original baseline",
        Value: snapshot.projectSummary.originalBudget,
      },
      {
        Metric: "Current / Revised Budget",
        Note: "Approved changes included",
        Value: snapshot.projectSummary.revisedBudget,
      },
      {
        Metric: "Current Cost Projection",
        Note: "Highest of revised, committed, or actual cost",
        Value: snapshot.currentCostProjection,
      },
      {
        Metric: "Expected Profit",
        Note: "Revenue baseline less expected budget",
        Value: snapshot.expectedProfit ?? "Revenue baseline pending",
      },
      {
        Metric: "Current Profit",
        Note: "Revenue baseline less current cost projection",
        Value: snapshot.currentProfit ?? "Revenue baseline pending",
      },
      {
        Metric: "Profit At Risk",
        Note: "Margin compression plus pending exposure",
        Value: snapshot.profitAtRisk,
      },
      {
        Metric: "Margin Impact",
        Note: "Current profit minus expected profit",
        Value: snapshot.marginImpact ?? "Pending revenue baseline",
      },
      {
        Metric: "Pending Change Orders",
        Note: `${snapshot.pendingChangeOrderCount} item(s) | ${snapshot.pendingChangeOrderAgingDays} day max aging`,
        Value: snapshot.projectSummary.pendingChangeOrderExposure,
      },
      {
        Metric: "Scope Status",
        Note: snapshot.scopeReasons.join(" | "),
        Value: snapshot.scopeStatus,
      },
      {
        Metric: "Financial Health",
        Note: snapshot.financialHealthDetail,
        Value: snapshot.projectHealth,
      },
    ],
  };
}

export function buildPortfolioControlSnapshot(
  entries: Array<{ project: ManagementProject; snapshot: ProjectControlSnapshot }>
): PortfolioControlSnapshot {
  const projects = entries.map((entry) => entry.project);
  const snapshots = entries.map((entry) => entry.snapshot);
  const criticalProjectCount = snapshots.filter(
    (snapshot) => snapshot.projectHealth === "Critical"
  ).length;
  const warningProjectCount = snapshots.filter(
    (snapshot) => snapshot.projectHealth === "Warning"
  ).length;
  const delayedProjects = snapshots.filter(
    (snapshot) => snapshot.scheduleLabel === "Delayed"
  ).length;
  const recoveryProjects = snapshots.filter(
    (snapshot) => snapshot.scheduleLabel === "Needs Recovery"
  ).length;
  const scopeDriftedCount = snapshots.filter(
    (snapshot) => snapshot.scopeStatus === "Scope Drifted"
  ).length;
  const scopePressuredCount = snapshots.filter(
    (snapshot) => snapshot.scopeStatus === "Scope Pressured"
  ).length;
  const cashPosition = sum(snapshots.map((snapshot) => snapshot.cashPosition));
  const unpaidVendorBills = sum(
    snapshots.map((snapshot) => snapshot.projectSummary.unpaidVendorBills)
  );
  const pendingChangeOrderExposure = sum(
    snapshots.map((snapshot) => snapshot.projectSummary.pendingChangeOrderExposure)
  );
  const pendingChangeOrderCount = sum(
    snapshots.map((snapshot) => snapshot.pendingChangeOrderCount)
  );
  const criticalIssueCount = sum(
    snapshots.map((snapshot) => snapshot.criticalIssueCount)
  );
  const profitAtRisk = sum(snapshots.map((snapshot) => snapshot.profitAtRisk));

  const financialHealthTone: ProjectControlTone = criticalProjectCount
    ? "red"
    : warningProjectCount || profitAtRisk > 0
      ? "yellow"
      : "green";
  const financialHealthLabel: PortfolioControlSnapshot["financialHealthLabel"] =
    financialHealthTone === "red"
      ? "At Risk"
      : financialHealthTone === "yellow"
        ? "Needs Attention"
        : "Stable";

  const scheduleTone: ProjectControlTone = delayedProjects
    ? "red"
    : recoveryProjects
      ? "yellow"
      : "green";
  const scheduleLabel: PortfolioControlSnapshot["scheduleLabel"] =
    scheduleTone === "red"
      ? "Delayed"
      : scheduleTone === "yellow"
        ? "Needs Recovery"
        : "On Track";

  let cashPositionTone: ProjectControlTone = "green";
  let cashPositionLabel: PortfolioControlSnapshot["cashPositionLabel"] = "Positive";

  if (cashPosition < 0) {
    cashPositionTone = "red";
    cashPositionLabel = "Negative";
  } else if (cashPosition <= pendingChangeOrderExposure || unpaidVendorBills > cashPosition) {
    cashPositionTone = "yellow";
    cashPositionLabel = "Tight";
  }

  const nextThreeActions = entries
    .sort((left, right) => {
      const leftScore =
        (left.snapshot.projectHealth === "Critical" ? 3 : left.snapshot.projectHealth === "Warning" ? 2 : 1) +
        (left.snapshot.scopeStatus === "Scope Drifted" ? 2 : left.snapshot.scopeStatus === "Scope Pressured" ? 1 : 0);
      const rightScore =
        (right.snapshot.projectHealth === "Critical" ? 3 : right.snapshot.projectHealth === "Warning" ? 2 : 1) +
        (right.snapshot.scopeStatus === "Scope Drifted" ? 2 : right.snapshot.scopeStatus === "Scope Pressured" ? 1 : 0);
      return rightScore - leftScore;
    })
    .flatMap(({ project, snapshot }) =>
      snapshot.nextThreeActions.map((action) => `${project.project_name}: ${action}`)
    )
    .slice(0, 3);

  return {
    cashPosition,
    cashPositionDetail:
      cashPositionLabel === "Negative"
        ? "Portfolio cash outflows are ahead of recorded inflows."
        : cashPositionLabel === "Tight"
          ? "Cash remains positive, but unpaid bills or pending scope exposure are tightening the portfolio."
          : "Recorded inflows are still ahead of paid-out costs across active jobs.",
    cashPositionLabel,
    cashPositionTone,
    criticalIssueCount,
    criticalIssueDetail: `${criticalIssueCount} high-priority issue(s) are currently visible across ${projects.length} project${projects.length === 1 ? "" : "s"}.`,
    criticalProjectCount,
    financialHealthDetail:
      financialHealthTone === "red"
        ? `${criticalProjectCount} project(s) are critical and ${scopeDriftedCount} project(s) are already drifting from scope.`
        : financialHealthTone === "yellow"
          ? `${warningProjectCount} project(s) need attention and ${profitAtRisk.toLocaleString("en-CA", {
              style: "currency",
              currency: "CAD",
              maximumFractionDigits: 0,
            })} of profit is currently at risk.`
          : "Portfolio margins, approvals, and payment position are currently steady from the structured data on hand.",
    financialHealthLabel,
    financialHealthTone,
    nextThreeActions: nextThreeActions.length
      ? nextThreeActions
      : ["No portfolio-wide next actions are being generated from the current structured data."],
    pendingChangeOrderCount,
    pendingChangeOrderExposure,
    profitAtRisk,
    scheduleDetail:
      scheduleTone === "red"
        ? `${delayedProjects} project(s) are delayed and need direct recovery.`
        : scheduleTone === "yellow"
          ? `${recoveryProjects} project(s) are pressuring the schedule and need follow-up.`
          : "Portfolio schedule pressure is currently controlled across active jobs.",
    scheduleLabel,
    scheduleTone,
    scopeDriftedCount,
    scopePressuredCount,
    warningProjectCount,
  };
}
