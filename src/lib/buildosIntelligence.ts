import type { ManagementProject } from "./managementData";
import type {
  BuildOsChangeOrder,
  BuildOsClientInvoice,
  BuildOsDeficiency,
  BuildOsDocumentRecord,
  BuildOsMasterRecord,
  BuildOsTask,
  BuildOsVendorBill,
} from "./buildosWorkspace";
import { getTaskSummary, isTaskBlocked, isTaskOverdue } from "./buildosTasks";

export type ProjectHealthStatus = "Healthy" | "Warning" | "Critical";
export type VendorRiskStatus = "Preferred" | "Use with Caution" | "High Risk Vendor";

export type ProjectFinancialSummary = {
  originalBudget: number;
  revisedBudget: number;
  committedCosts: number;
  actualCosts: number;
  approvedChangeOrderImpact: number;
  pendingChangeOrderExposure: number;
  cashInflows: number;
  cashOutflows: number;
  unpaidClientInvoices: number;
  unpaidVendorBills: number;
  lenderDrawTracked: number;
  projectedProfitability: number | null;
  varianceRatio: number | null;
};

export type BuildOsAlert = {
  id: string;
  projectId?: string;
  severity: "critical" | "warning" | "info";
  title: string;
  detail: string;
  module:
    | "financial"
    | "change-orders"
    | "documents"
    | "daily-log"
    | "deficiencies"
    | "master-database"
    | "tasks";
};

function sum(values: number[]) {
  return values.reduce((total, value) => total + value, 0);
}

function isOverdue(dateValue?: string) {
  if (!dateValue) {
    return false;
  }

  const parsed = new Date(dateValue);
  if (Number.isNaN(parsed.getTime())) {
    return false;
  }

  return parsed < new Date();
}

function isExpiringSoon(dateValue?: string) {
  if (!dateValue) {
    return false;
  }

  const parsed = new Date(dateValue);
  if (Number.isNaN(parsed.getTime())) {
    return false;
  }

  const days = (parsed.getTime() - Date.now()) / (1000 * 60 * 60 * 24);
  return days <= 30;
}

function getLinkedChangeOrders(projectId: string, changeOrders: BuildOsChangeOrder[]) {
  return changeOrders.filter((item) => item.projectId === projectId);
}

function getLinkedInvoices(projectId: string, invoices: BuildOsClientInvoice[]) {
  return invoices.filter((item) => item.projectId === projectId);
}

function getLinkedBills(projectId: string, bills: BuildOsVendorBill[]) {
  return bills.filter((item) => item.projectId === projectId);
}

function getLinkedDeficiencies(projectId: string, deficiencies: BuildOsDeficiency[]) {
  return deficiencies.filter((item) => item.projectId === projectId);
}

function getLinkedDocuments(projectId: string, documents: BuildOsDocumentRecord[]) {
  return documents.filter((item) => item.projectId === projectId);
}

function getLinkedTasks(projectId: string, tasks: BuildOsTask[]) {
  return tasks.filter((item) => item.projectId === projectId);
}

export function getProjectFinancialSummary(
  project: ManagementProject,
  changeOrders: BuildOsChangeOrder[],
  invoices: BuildOsClientInvoice[],
  bills: BuildOsVendorBill[]
): ProjectFinancialSummary {
  const linkedChangeOrders = getLinkedChangeOrders(project.id, changeOrders);
  const linkedInvoices = getLinkedInvoices(project.id, invoices);
  const linkedBills = getLinkedBills(project.id, bills);

  const approvedChangeOrderImpact = sum(
    linkedChangeOrders
      .filter((item) => ["Approved", "Implemented"].includes(item.status))
      .map((item) => item.budgetImpact)
  );
  const pendingChangeOrderExposure = sum(
    linkedChangeOrders
      .filter((item) => ["Draft", "Pending Approval"].includes(item.status))
      .map((item) => item.budgetImpact)
  );
  const committedCosts = sum(
    linkedBills
      .filter((item) => ["Received", "Verified", "Paid", "Overdue"].includes(item.status))
      .map((item) => item.amount)
  );
  const actualCosts = sum(
    linkedBills.filter((item) => item.status === "Paid").map((item) => item.amount)
  );
  const cashInflows = sum(
    linkedInvoices
      .filter((item) => ["Paid", "Partially Paid"].includes(item.status))
      .map((item) => item.amount)
  );
  const cashOutflows = actualCosts;
  const unpaidClientInvoices = sum(
    linkedInvoices.filter((item) => item.status !== "Paid").map((item) => item.amount)
  );
  const unpaidVendorBills = sum(
    linkedBills.filter((item) => item.status !== "Paid").map((item) => item.amount)
  );
  const originalBudget = project.estimated_budget || 0;
  const revisedBudget = originalBudget + approvedChangeOrderImpact;
  const lenderDrawTracked = sum(
    linkedInvoices.filter((item) => item.drawReference).map((item) => item.amount)
  );
  const profitabilityBaseline =
    typeof project.selling_price === "number" && Number.isFinite(project.selling_price)
      ? project.selling_price
      : linkedInvoices.length
        ? sum(linkedInvoices.map((item) => item.amount))
        : null;
  const projectedProfitability =
    profitabilityBaseline !== null ? profitabilityBaseline - revisedBudget : null;
  const varianceRatio =
    revisedBudget > 0 && committedCosts > 0 ? committedCosts / revisedBudget : null;

  return {
    originalBudget,
    revisedBudget,
    committedCosts,
    actualCosts,
    approvedChangeOrderImpact,
    pendingChangeOrderExposure,
    cashInflows,
    cashOutflows,
    unpaidClientInvoices,
    unpaidVendorBills,
    lenderDrawTracked,
    projectedProfitability,
    varianceRatio,
  };
}

export function getProjectHealthStatus(
  project: ManagementProject,
  summary: ProjectFinancialSummary,
  deficiencies: BuildOsDeficiency[],
  alerts: BuildOsAlert[]
): ProjectHealthStatus {
  const linkedDeficiencies = getLinkedDeficiencies(project.id, deficiencies);
  const openDeficiencies = linkedDeficiencies.filter((item) => item.status !== "Closed").length;
  const criticalAlerts = alerts.filter(
    (alert) => alert.projectId === project.id && alert.severity === "critical"
  ).length;
  const warningAlerts = alerts.filter(
    (alert) => alert.projectId === project.id && alert.severity === "warning"
  ).length;

  if (
    criticalAlerts > 0 ||
    openDeficiencies >= 5 ||
    summary.unpaidVendorBills > 0 && summary.unpaidVendorBills > summary.revisedBudget * 0.25 ||
    summary.varianceRatio !== null && summary.varianceRatio >= 1
  ) {
    return "Critical";
  }

  if (
    warningAlerts > 0 ||
    openDeficiencies >= 2 ||
    summary.pendingChangeOrderExposure > 0 ||
    summary.unpaidClientInvoices > 0 ||
    summary.varianceRatio !== null && summary.varianceRatio >= 0.85 ||
    isOverdue(project.estimated_end_date)
  ) {
    return "Warning";
  }

  return "Healthy";
}

export function buildProjectAlerts(
  project: ManagementProject,
  changeOrders: BuildOsChangeOrder[],
  invoices: BuildOsClientInvoice[],
  bills: BuildOsVendorBill[],
  deficiencies: BuildOsDeficiency[],
  documents: BuildOsDocumentRecord[] = [],
  tasks: BuildOsTask[] = [],
  varianceThreshold = 0.85
) {
  const linkedChangeOrders = getLinkedChangeOrders(project.id, changeOrders);
  const linkedInvoices = getLinkedInvoices(project.id, invoices);
  const linkedBills = getLinkedBills(project.id, bills);
  const linkedDeficiencies = getLinkedDeficiencies(project.id, deficiencies);
  const linkedDocuments = getLinkedDocuments(project.id, documents);
  const linkedTasks = getLinkedTasks(project.id, tasks);
  const summary = getProjectFinancialSummary(project, changeOrders, invoices, bills);
  const alerts: BuildOsAlert[] = [];

  if (!project.legal_land_description || !project.development_permit_pdf || !project.building_permit_pdf) {
    alerts.push({
      id: `${project.id}-docs-missing`,
      projectId: project.id,
      severity: "warning",
      title: "Project setup is incomplete",
      detail: "Legal land details and permit references should be completed before the job is used as a lender-ready record.",
      module: "documents",
    });
  }

  const expiringDocuments = linkedDocuments.filter((document) => isExpiringSoon(document.expiryDate));
  if (expiringDocuments.length) {
    alerts.push({
      id: `${project.id}-expiring-docs`,
      projectId: project.id,
      severity: "warning",
      title: "Project documents are expiring soon",
      detail: `${expiringDocuments.length} linked document(s) have expiry dates within 30 days or are already due.`,
      module: "documents",
    });
  }

  const requiredDocumentsMissingUrl = linkedDocuments.filter(
    (document) => document.requiredForProject && !document.url
  );
  if (requiredDocumentsMissingUrl.length) {
    alerts.push({
      id: `${project.id}-required-docs`,
      projectId: project.id,
      severity: "warning",
      title: "Required project documents are incomplete",
      detail: `${requiredDocumentsMissingUrl.length} required document record(s) need a live file reference or URL.`,
      module: "documents",
    });
  }

  const overdueInvoices = linkedInvoices.filter(
    (invoice) => invoice.status !== "Paid" && isOverdue(invoice.dueDate)
  );
  if (overdueInvoices.length) {
    alerts.push({
      id: `${project.id}-overdue-invoices`,
      projectId: project.id,
      severity: "warning",
      title: "Client invoices are overdue",
      detail: `${overdueInvoices.length} invoice(s) are past due and need follow-up.`,
      module: "financial",
    });
  }

  const overdueBills = linkedBills.filter(
    (bill) => bill.status !== "Paid" && isOverdue(bill.dueDate)
  );
  if (overdueBills.length) {
    alerts.push({
      id: `${project.id}-overdue-bills`,
      projectId: project.id,
      severity: "critical",
      title: "Vendor bills need attention",
      detail: `${overdueBills.length} vendor bill(s) are overdue or unpaid.`,
      module: "financial",
    });
  }

  if (summary.varianceRatio !== null && summary.varianceRatio >= varianceThreshold) {
    alerts.push({
      id: `${project.id}-variance-threshold`,
      projectId: project.id,
      severity: summary.varianceRatio >= 1 ? "critical" : "warning",
      title: "Cost variance is rising",
      detail:
        summary.varianceRatio >= 1
          ? "Committed costs are now at or above the revised budget."
          : `Committed costs have crossed ${Math.round(varianceThreshold * 100)}% of the revised budget.`,
      module: "financial",
    });
  }

  const staleChangeOrders = linkedChangeOrders.filter((item) =>
    ["Draft", "Pending Approval"].includes(item.status) && isOverdue(item.updatedAt)
  );
  if (staleChangeOrders.length) {
    alerts.push({
      id: `${project.id}-stale-cos`,
      projectId: project.id,
      severity: "warning",
      title: "Pending change orders are aging",
      detail: `${staleChangeOrders.length} change order(s) still need approval or closeout.`,
      module: "change-orders",
    });
  }

  const openDeficiencies = linkedDeficiencies.filter((item) => item.status !== "Closed");
  if (openDeficiencies.length) {
    alerts.push({
      id: `${project.id}-open-deficiencies`,
      projectId: project.id,
      severity: openDeficiencies.length >= 4 ? "critical" : "warning",
      title: "Deficiencies remain open",
      detail: `${openDeficiencies.length} deficiency item(s) are still unresolved.`,
      module: "deficiencies",
    });
  }

  const taskSummary = getTaskSummary(linkedTasks);
  if (taskSummary.overdue) {
    alerts.push({
      id: `${project.id}-overdue-tasks`,
      projectId: project.id,
      severity: taskSummary.overdue >= 3 ? "critical" : "warning",
      title: "Project tasks are overdue",
      detail: `${taskSummary.overdue} task(s) are past due and need follow-up.`,
      module: "tasks",
    });
  }

  const blockedTasks = linkedTasks.filter((task) => isTaskBlocked(task));
  if (blockedTasks.length) {
    alerts.push({
      id: `${project.id}-blocked-tasks`,
      projectId: project.id,
      severity: "warning",
      title: "Project tasks are blocked",
      detail: `${blockedTasks.length} blocked task(s) are slowing execution.`,
      module: "tasks",
    });
  }

  const overdueMilestones = linkedTasks.filter(
    (task) => task.milestone && isTaskOverdue(task)
  );
  if (overdueMilestones.length) {
    alerts.push({
      id: `${project.id}-delayed-milestones`,
      projectId: project.id,
      severity: "critical",
      title: "Milestones are slipping",
      detail: `${overdueMilestones.length} milestone task(s) are past due.`,
      module: "tasks",
    });
  }

  if (isOverdue(project.estimated_end_date) && project.status !== "Completed") {
    alerts.push({
      id: `${project.id}-schedule`,
      projectId: project.id,
      severity: "warning",
      title: "Target completion date has passed",
      detail: "Review the schedule baseline and confirm whether the current project status is still accurate.",
      module: "daily-log",
    });
  }

  return alerts;
}

export function buildPortfolioAlerts(
  projects: ManagementProject[],
  changeOrders: BuildOsChangeOrder[],
  invoices: BuildOsClientInvoice[],
  bills: BuildOsVendorBill[],
  deficiencies: BuildOsDeficiency[],
  documents: BuildOsDocumentRecord[] = [],
  tasks: BuildOsTask[] = [],
  varianceThreshold = 0.85
) {
  return projects.flatMap((project) =>
    buildProjectAlerts(
      project,
      changeOrders,
      invoices,
      bills,
      deficiencies,
      documents,
      tasks,
      varianceThreshold
    )
  );
}

export function getSuggestedNextActions(
  project: ManagementProject,
  summary: ProjectFinancialSummary,
  alerts: BuildOsAlert[]
) {
  const suggestions: string[] = [];

  if (alerts.some((alert) => alert.projectId === project.id && alert.module === "financial")) {
    suggestions.push("Follow up on overdue invoices or unpaid vendor bills.");
  }

  if (summary.pendingChangeOrderExposure > 0) {
    suggestions.push("Review and decide the pending change orders so revised budget exposure is clear.");
  }

  if (alerts.some((alert) => alert.projectId === project.id && alert.module === "tasks")) {
    suggestions.push("Clear overdue or blocked tasks before the schedule drifts further.");
  }

  if (!project.development_permit_pdf || !project.building_permit_pdf) {
    suggestions.push("Upload or link the missing permit references.");
  }

  if (!project.project_manager && !project.project_owner) {
    suggestions.push("Assign a project owner or manager for accountability.");
  }

  if (isOverdue(project.estimated_end_date) && project.status !== "Completed") {
    suggestions.push("Update the target completion plan or revise the current project status.");
  }

  return suggestions.slice(0, 4);
}

export function buildOperationalAlerts(
  projects: ManagementProject[],
  changeOrders: BuildOsChangeOrder[],
  invoices: BuildOsClientInvoice[],
  bills: BuildOsVendorBill[],
  deficiencies: BuildOsDeficiency[],
  documents: BuildOsDocumentRecord[] = [],
  tasks: BuildOsTask[] = [],
  records: BuildOsMasterRecord[] = [],
  varianceThreshold = 0.85
) {
  const alerts = buildPortfolioAlerts(
    projects,
    changeOrders,
    invoices,
    bills,
    deficiencies,
    documents,
    tasks,
    varianceThreshold
  );

  const expiringCredentials = records.filter(
    (record) =>
      record.status === "Active" &&
      (isExpiringSoon(record.insuranceExpiry) || isExpiringSoon(record.licenseExpiry))
  );

  if (expiringCredentials.length) {
    alerts.push({
      id: "master-record-expiry",
      severity: "warning",
      title: "Insurance or licenses are expiring soon",
      detail: `${expiringCredentials.length} Master Database record(s) need credential renewal review.`,
      module: "master-database",
    });
  }

  const highRiskVendors = records.filter(
    (record) =>
      record.type === "Vendor (Trade)" && getVendorRiskStatus(record) === "High Risk Vendor"
  );

  if (highRiskVendors.length) {
    alerts.push({
      id: "high-risk-vendors",
      severity: "warning",
      title: "High-risk vendors need review",
      detail: `${highRiskVendors.length} vendor record(s) are flagged as high risk.`,
      module: "master-database",
    });
  }

  return alerts;
}

function getAverageVendorScore(record: BuildOsMasterRecord) {
  const scores = [
    record.qualityScore,
    record.pricingScore,
    record.reliabilityScore,
    record.communicationScore,
    record.timelinessScore,
    record.professionalismScore,
  ].filter((value): value is number => typeof value === "number");

  if (!scores.length) {
    return null;
  }

  return scores.reduce((total, value) => total + value, 0) / scores.length;
}

export function getVendorRiskStatus(record: BuildOsMasterRecord): VendorRiskStatus {
  const averageScore = getAverageVendorScore(record);

  if (
    record.status === "Do Not Use" ||
    record.workAgain === "No" ||
    (typeof record.deficiencyCount === "number" && record.deficiencyCount >= 4) ||
    (averageScore !== null && averageScore < 3)
  ) {
    return "High Risk Vendor";
  }

  if (
    record.workAgain === "Caution" ||
    (typeof record.deficiencyCount === "number" && record.deficiencyCount >= 2) ||
    (averageScore !== null && averageScore < 4)
  ) {
    return "Use with Caution";
  }

  return "Preferred";
}

export function getPortfolioFinancialOverview(
  projects: ManagementProject[],
  changeOrders: BuildOsChangeOrder[],
  invoices: BuildOsClientInvoice[],
  bills: BuildOsVendorBill[]
) {
  const summaries = projects.map((project) =>
    getProjectFinancialSummary(project, changeOrders, invoices, bills)
  );

  return {
    originalBudget: sum(summaries.map((item) => item.originalBudget)),
    revisedBudget: sum(summaries.map((item) => item.revisedBudget)),
    committedCosts: sum(summaries.map((item) => item.committedCosts)),
    actualCosts: sum(summaries.map((item) => item.actualCosts)),
    approvedChangeOrderImpact: sum(summaries.map((item) => item.approvedChangeOrderImpact)),
    pendingChangeOrderExposure: sum(summaries.map((item) => item.pendingChangeOrderExposure)),
    cashInflows: sum(summaries.map((item) => item.cashInflows)),
    cashOutflows: sum(summaries.map((item) => item.cashOutflows)),
    unpaidClientInvoices: sum(summaries.map((item) => item.unpaidClientInvoices)),
    unpaidVendorBills: sum(summaries.map((item) => item.unpaidVendorBills)),
    lenderDrawTracked: sum(summaries.map((item) => item.lenderDrawTracked)),
  };
}
