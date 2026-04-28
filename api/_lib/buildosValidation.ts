import type { BuildOsModuleName } from "./managementUsers.js";

type JsonRecord = Record<string, unknown>;

const MASTER_RECORD_TYPES = [
  "Vendor (Trade)",
  "Supplier",
  "Stakeholder (Client)",
  "Buyer",
  "Realtor",
  "Lawyer",
  "Consultant",
  "Broker",
  "Lender",
  "Investor",
  "Municipality",
  "Inspector",
  "Insurance",
  "Accounting",
  "Legal",
  "Internal Team",
  "Other",
] as const;

const WORK_AGAIN_DECISIONS = ["Yes", "Caution", "No"] as const;
const DEAL_SIDES = ["seller", "buyer", "n/a"] as const;
const RECORD_STATUSES = ["Active", "Inactive", "Do Not Use"] as const;
const CHANGE_ORDER_STATUSES = [
  "Draft",
  "Pending Approval",
  "Approved",
  "Rejected",
  "Implemented",
] as const;
const DEFICIENCY_STATUSES = [
  "Open",
  "In Progress",
  "Ready for Review",
  "Closed",
] as const;
const DEFICIENCY_SEVERITIES = ["Low", "Medium", "High", "Critical"] as const;
const CLIENT_INVOICE_STATUSES = [
  "Draft",
  "Sent",
  "Partially Paid",
  "Paid",
  "Overdue",
] as const;
const VENDOR_BILL_STATUSES = ["Received", "Verified", "Paid", "Overdue"] as const;
const DOCUMENT_TYPES = [
  "Development Permit",
  "Building Permit",
  "Real Property Report",
  "Insurance Certificate",
  "Trade License",
  "Contract",
  "Inspection Report",
  "Warranty Record",
  "Change Order Backup",
  "Lender Draw Backup",
  "Other",
] as const;
const TASK_PHASES = [
  "Pre-Construction",
  "Permits",
  "Foundation",
  "Framing",
  "Rough-Ins",
  "Finishes",
  "Closeout",
  "Warranty",
  "Other",
] as const;
const TASK_STATUSES = [
  "Not Started",
  "In Progress",
  "Blocked",
  "Waiting Review",
  "Completed",
] as const;
const TASK_PRIORITIES = ["Low", "Medium", "High", "Critical"] as const;
const VISIBILITY_LEVELS = [
  "Internal",
  "Client",
  "Lender",
  "Investor",
  "Public",
] as const;
const WORKFLOW_STATUSES = ["Draft", "Review", "Approved", "Exported"] as const;
const PRESENTATION_TYPES = [
  "Client Meeting",
  "Lender Package",
  "Investor Review",
  "Internal Deck",
  "Permit/Diligence Review",
] as const;
const VIDEO_CATEGORIES = [
  "Project Walkthrough",
  "Before/After",
  "Site Progress",
  "Explainer",
  "Construction Method",
  "Client Meeting",
  "Permit/Diligence",
] as const;
const REPORT_AUDIENCES = ["Client", "Lender", "Investor", "Internal"] as const;
const PLAN_TIERS = ["Internal", "Pilot", "Builder Pro", "Enterprise"] as const;
const SUBSCRIPTION_STATUSES = ["Active", "Suspended", "Trial", "Cancelled"] as const;

export class BuildOsValidationError extends Error {
  statusCode: number;

  constructor(message: string, statusCode = 400) {
    super(message);
    this.name = "BuildOsValidationError";
    this.statusCode = statusCode;
  }
}

function asRecord(value: unknown) {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    throw new BuildOsValidationError("Record payload must be an object.");
  }

  return value as JsonRecord;
}

function trimString(value: unknown) {
  return typeof value === "string" ? value.trim() : "";
}

function readString(
  record: JsonRecord,
  field: string,
  options?: { required?: boolean; max?: number }
) {
  const raw = record[field];
  const value = trimString(raw);

  if (!value) {
    if (options?.required) {
      throw new BuildOsValidationError(`${field} is required.`);
    }
    return undefined;
  }

  if (options?.max && value.length > options.max) {
    throw new BuildOsValidationError(`${field} exceeds ${options.max} characters.`);
  }

  return value;
}

function readBoolean(record: JsonRecord, field: string, fallback = false) {
  const raw = record[field];
  if (typeof raw === "boolean") {
    return raw;
  }
  if (raw === "true") {
    return true;
  }
  if (raw === "false") {
    return false;
  }
  return fallback;
}

function readStringArray(
  record: JsonRecord,
  field: string,
  options?: { maxItems?: number; itemMax?: number }
) {
  const raw = record[field];
  if (raw == null) {
    return [];
  }
  if (!Array.isArray(raw)) {
    throw new BuildOsValidationError(`${field} must be an array.`);
  }

  const values = raw
    .filter((item): item is string => typeof item === "string")
    .map((item) => item.trim())
    .filter(Boolean);

  if (options?.maxItems && values.length > options.maxItems) {
    throw new BuildOsValidationError(`${field} exceeds ${options.maxItems} items.`);
  }

  const itemMax = options?.itemMax;
  if (itemMax && values.some((item) => item.length > itemMax)) {
    throw new BuildOsValidationError(
      `${field} contains a value longer than ${itemMax} characters.`
    );
  }

  return values;
}

function readEnum<T extends readonly string[]>(
  record: JsonRecord,
  field: string,
  values: T,
  options?: { required?: boolean; fallback?: T[number] }
): T[number] | undefined {
  const value = readString(record, field, {
    required: options?.required,
    max: 120,
  });

  if (!value) {
    return options?.fallback;
  }

  if (!values.includes(value as T[number])) {
    throw new BuildOsValidationError(`${field} must be one of: ${values.join(", ")}.`);
  }

  return value as T[number];
}

function isValidIsoDate(value: string) {
  const parsed = new Date(value);
  return !Number.isNaN(parsed.getTime());
}

function readDate(
  record: JsonRecord,
  field: string,
  options?: { required?: boolean }
) {
  const value = readString(record, field, { required: options?.required, max: 40 });
  if (!value) {
    return undefined;
  }
  if (!isValidIsoDate(value)) {
    throw new BuildOsValidationError(`${field} must be a valid date.`);
  }
  return value;
}

function readNumber(
  record: JsonRecord,
  field: string,
  options?: { required?: boolean; min?: number; max?: number }
) {
  const raw = record[field];

  if (raw == null || raw === "") {
    if (options?.required) {
      throw new BuildOsValidationError(`${field} is required.`);
    }
    return undefined;
  }

  const value = typeof raw === "number" ? raw : Number(raw);
  if (!Number.isFinite(value)) {
    throw new BuildOsValidationError(`${field} must be a valid number.`);
  }
  if (typeof options?.min === "number" && value < options.min) {
    throw new BuildOsValidationError(`${field} must be at least ${options.min}.`);
  }
  if (typeof options?.max === "number" && value > options.max) {
    throw new BuildOsValidationError(`${field} must be at most ${options.max}.`);
  }
  return value;
}

function readInteger(
  record: JsonRecord,
  field: string,
  options?: { required?: boolean; min?: number; max?: number }
) {
  const value = readNumber(record, field, options);
  if (typeof value !== "number") {
    return undefined;
  }
  return Math.round(value);
}

function readEmail(record: JsonRecord, field: string) {
  const value = readString(record, field, { max: 160 });
  if (!value) {
    return undefined;
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
    throw new BuildOsValidationError(`${field} must be a valid email.`);
  }
  return value;
}

function readUrl(
  record: JsonRecord,
  field: string,
  options?: { required?: boolean }
) {
  const value = readString(record, field, {
    max: 500,
    required: options?.required,
  });
  if (!value) {
    return undefined;
  }

  try {
    const parsed = new URL(value);
    if (!["http:", "https:"].includes(parsed.protocol)) {
      throw new Error("invalid protocol");
    }
  } catch {
    throw new BuildOsValidationError(`${field} must be a valid http or https URL.`);
  }

  return value;
}

function readAuditLog(record: JsonRecord) {
  const raw = record.auditLog;
  if (!Array.isArray(raw)) {
    return [];
  }

  return raw
    .filter((entry) => entry && typeof entry === "object")
    .map((entry) => {
      const item = entry as JsonRecord;
      return {
        action:
          readEnum(item, "action", [
            "created",
            "updated",
            "deleted",
            "restored",
            "generated",
            "reviewed",
            "approved",
            "exported",
          ] as const, { required: true }) || "updated",
        actor: readString(item, "actor", { required: true, max: 120 }) || "ENCI BuildOS",
        detail: readString(item, "detail", { required: true, max: 500 }) || "Audit entry",
        id: readString(item, "id", { required: true, max: 120 }) || "",
        occurredAt:
          readDate(item, "occurredAt", { required: true }) || new Date().toISOString(),
      };
    });
}

function readClientReportSections(record: JsonRecord) {
  const raw = record.sections;
  if (!Array.isArray(raw)) {
    return [];
  }

  return raw
    .filter((section) => section && typeof section === "object")
    .map((section) => {
      const item = section as JsonRecord;
      return {
        body: readStringArray(item, "body", { maxItems: 20, itemMax: 240 }),
        heading:
          readString(item, "heading", { required: true, max: 120 }) || "Untitled section",
        safe: readBoolean(item, "safe", true),
      };
    });
}

function withAudit(record: JsonRecord) {
  return {
    ...record,
    auditLog: readAuditLog(record),
  };
}

function validateMasterDatabase(record: JsonRecord) {
  return withAudit({
    id: readString(record, "id", { max: 120 }),
    type: readEnum(record, "type", MASTER_RECORD_TYPES, { required: true }),
    role: readString(record, "role", { max: 120 }),
    companyName: readString(record, "companyName", { max: 160 }),
    personName: readString(record, "personName", { required: true, max: 160 }),
    titleRole: readString(record, "titleRole", { max: 120 }),
    tradeCategory: readString(record, "tradeCategory", { max: 120 }),
    secondaryTradeCategory: readString(record, "secondaryTradeCategory", { max: 120 }),
    phone: readString(record, "phone", { max: 40 }),
    email: readEmail(record, "email"),
    address: readString(record, "address", { max: 240 }),
    notes: readString(record, "notes", { max: 4000 }),
    restrictedNotes: readString(record, "restrictedNotes", { max: 4000 }),
    tags: readStringArray(record, "tags", { maxItems: 20, itemMax: 40 }),
    linkedProjectIds: readStringArray(record, "linkedProjectIds", {
      maxItems: 20,
      itemMax: 120,
    }),
    status: readEnum(record, "status", RECORD_STATUSES, { fallback: "Active" }),
    documents: readStringArray(record, "documents", { maxItems: 20, itemMax: 500 }),
    lastInteraction: readDate(record, "lastInteraction"),
    insuranceExpiry: readDate(record, "insuranceExpiry"),
    licenseExpiry: readDate(record, "licenseExpiry"),
    qualityScore: readInteger(record, "qualityScore", { min: 1, max: 5 }),
    pricingScore: readInteger(record, "pricingScore", { min: 1, max: 5 }),
    reliabilityScore: readInteger(record, "reliabilityScore", { min: 1, max: 5 }),
    communicationScore: readInteger(record, "communicationScore", { min: 1, max: 5 }),
    timelinessScore: readInteger(record, "timelinessScore", { min: 1, max: 5 }),
    professionalismScore: readInteger(record, "professionalismScore", { min: 1, max: 5 }),
    deficiencyCount: readInteger(record, "deficiencyCount", { min: 0, max: 999 }),
    averageResponseDays: readNumber(record, "averageResponseDays", { min: 0, max: 365 }),
    workAgain: readEnum(record, "workAgain", WORK_AGAIN_DECISIONS, { fallback: "Yes" }),
    recommended: readBoolean(record, "recommended", true),
    dealSide: readEnum(record, "dealSide", DEAL_SIDES, { fallback: "n/a" }),
    createdAt: readDate(record, "createdAt"),
    updatedAt: readDate(record, "updatedAt"),
  });
}

function validateChangeOrder(record: JsonRecord) {
  return withAudit({
    id: readString(record, "id", { max: 120 }),
    projectId: readString(record, "projectId", { required: true, max: 120 }),
    title: readString(record, "title", { required: true, max: 180 }),
    vendorRecordId: readString(record, "vendorRecordId", { max: 120 }),
    costCategory: readString(record, "costCategory", { max: 120 }),
    scopeSummary: readString(record, "scopeSummary", { required: true, max: 4000 }),
    reason: readString(record, "reason", { required: true, max: 4000 }),
    budgetImpact: readNumber(record, "budgetImpact", { required: true, min: 0 }),
    timeImpactDays: readInteger(record, "timeImpactDays", { required: true, min: 0, max: 3650 }),
    status: readEnum(record, "status", CHANGE_ORDER_STATUSES, { fallback: "Draft" }),
    updatedBy: readString(record, "updatedBy", { max: 120 }),
    internalNotes: readString(record, "internalNotes", { max: 4000 }),
    clientSummary: readString(record, "clientSummary", { max: 4000 }),
    vendorSummary: readString(record, "vendorSummary", { max: 4000 }),
    attachmentUrl: readUrl(record, "attachmentUrl"),
    createdAt: readDate(record, "createdAt"),
    updatedAt: readDate(record, "updatedAt"),
  });
}

function validateDailyLog(record: JsonRecord) {
  return withAudit({
    id: readString(record, "id", { max: 120 }),
    projectId: readString(record, "projectId", { required: true, max: 120 }),
    date: readDate(record, "date", { required: true }),
    weather: readString(record, "weather", { max: 120 }),
    crewCount: readInteger(record, "crewCount", { min: 0, max: 2000 }),
    tradesOnsite: readStringArray(record, "tradesOnsite", { maxItems: 25, itemMax: 80 }),
    materialsDelivered: readString(record, "materialsDelivered", { max: 1500 }),
    inspections: readString(record, "inspections", { max: 1500 }),
    delaysBlockers: readString(record, "delaysBlockers", { max: 2000 }),
    safetyNotes: readString(record, "safetyNotes", { max: 2000 }),
    comments: readString(record, "comments", { max: 4000 }),
    photoUrl: readUrl(record, "photoUrl"),
    createdBy: readString(record, "createdBy", { max: 120 }),
    createdAt: readDate(record, "createdAt"),
    updatedAt: readDate(record, "updatedAt"),
  });
}

function validateDeficiency(record: JsonRecord) {
  return withAudit({
    id: readString(record, "id", { max: 120 }),
    projectId: readString(record, "projectId", { required: true, max: 120 }),
    title: readString(record, "title", { required: true, max: 180 }),
    description: readString(record, "description", { required: true, max: 4000 }),
    location: readString(record, "location", { max: 240 }),
    severity: readEnum(record, "severity", DEFICIENCY_SEVERITIES, { fallback: "Medium" }),
    assignedRecordId: readString(record, "assignedRecordId", { max: 120 }),
    dueDate: readDate(record, "dueDate"),
    status: readEnum(record, "status", DEFICIENCY_STATUSES, { fallback: "Open" }),
    beforePhotoUrl: readUrl(record, "beforePhotoUrl"),
    completionPhotoUrl: readUrl(record, "completionPhotoUrl"),
    notes: readString(record, "notes", { max: 4000 }),
    closeoutConfirmation: readString(record, "closeoutConfirmation", { max: 2000 }),
    warrantyLinked: readBoolean(record, "warrantyLinked"),
    createdAt: readDate(record, "createdAt"),
    updatedAt: readDate(record, "updatedAt"),
  });
}

function validateClientInvoice(record: JsonRecord) {
  return withAudit({
    id: readString(record, "id", { max: 120 }),
    projectId: readString(record, "projectId", { required: true, max: 120 }),
    stakeholderRecordId: readString(record, "stakeholderRecordId", { max: 120 }),
    invoiceNumber: readString(record, "invoiceNumber", { required: true, max: 120 }),
    invoiceDate: readDate(record, "invoiceDate", { required: true }),
    dueDate: readDate(record, "dueDate", { required: true }),
    amount: readNumber(record, "amount", { required: true, min: 0 }),
    status: readEnum(record, "status", CLIENT_INVOICE_STATUSES, { fallback: "Draft" }),
    updatedBy: readString(record, "updatedBy", { max: 120 }),
    notes: readString(record, "notes", { max: 4000 }),
    drawReference: readString(record, "drawReference", { max: 160 }),
    createdAt: readDate(record, "createdAt"),
    updatedAt: readDate(record, "updatedAt"),
  });
}

function validateVendorBill(record: JsonRecord) {
  return withAudit({
    id: readString(record, "id", { max: 120 }),
    projectId: readString(record, "projectId", { required: true, max: 120 }),
    vendorRecordId: readString(record, "vendorRecordId", { max: 120 }),
    invoiceNumber: readString(record, "invoiceNumber", { required: true, max: 120 }),
    invoiceDate: readDate(record, "invoiceDate", { required: true }),
    dueDate: readDate(record, "dueDate", { required: true }),
    amount: readNumber(record, "amount", { required: true, min: 0 }),
    status: readEnum(record, "status", VENDOR_BILL_STATUSES, { fallback: "Received" }),
    updatedBy: readString(record, "updatedBy", { max: 120 }),
    notes: readString(record, "notes", { max: 4000 }),
    attachmentUrl: readUrl(record, "attachmentUrl"),
    createdAt: readDate(record, "createdAt"),
    updatedAt: readDate(record, "updatedAt"),
  });
}

function validateDocument(record: JsonRecord) {
  return withAudit({
    id: readString(record, "id", { max: 120 }),
    title: readString(record, "title", { required: true, max: 180 }),
    projectId: readString(record, "projectId", { max: 120 }),
    linkedRecordId: readString(record, "linkedRecordId", { max: 120 }),
    documentType: readEnum(record, "documentType", DOCUMENT_TYPES, { fallback: "Other" }),
    tags: readStringArray(record, "tags", { maxItems: 20, itemMax: 40 }),
    uploader: readString(record, "uploader", { max: 120 }),
    updatedBy: readString(record, "updatedBy", { max: 120 }),
    uploadDate: readDate(record, "uploadDate", { required: true }),
    versionLabel: readString(record, "versionLabel", { max: 80 }),
    versionGroup: readString(record, "versionGroup", { max: 80 }),
    expiryDate: readDate(record, "expiryDate"),
    requiredForProject: readBoolean(record, "requiredForProject"),
    url: readUrl(record, "url"),
    notes: readString(record, "notes", { max: 4000 }),
    createdAt: readDate(record, "createdAt"),
    updatedAt: readDate(record, "updatedAt"),
  });
}

function validateProjectParticipants(record: JsonRecord) {
  return withAudit({
    projectId: readString(record, "projectId", { required: true, max: 120 }),
    sellerSideRealtorId: readString(record, "sellerSideRealtorId", { max: 120 }),
    buyerSideRealtorId: readString(record, "buyerSideRealtorId", { max: 120 }),
    sellerSideLawyerId: readString(record, "sellerSideLawyerId", { max: 120 }),
    buyerSideLawyerId: readString(record, "buyerSideLawyerId", { max: 120 }),
    stakeholderClientIds: readStringArray(record, "stakeholderClientIds", {
      maxItems: 20,
      itemMax: 120,
    }),
    buyerIds: readStringArray(record, "buyerIds", { maxItems: 20, itemMax: 120 }),
    lenderIds: readStringArray(record, "lenderIds", { maxItems: 20, itemMax: 120 }),
    investorIds: readStringArray(record, "investorIds", { maxItems: 20, itemMax: 120 }),
    otherRecordIds: readStringArray(record, "otherRecordIds", { maxItems: 20, itemMax: 120 }),
    updatedBy: readString(record, "updatedBy", { max: 120 }),
    createdAt: readDate(record, "createdAt"),
    updatedAt: readDate(record, "updatedAt"),
  });
}

function validateTask(record: JsonRecord) {
  return withAudit({
    id: readString(record, "id", { max: 120 }),
    projectId: readString(record, "projectId", { required: true, max: 120 }),
    title: readString(record, "title", { required: true, max: 180 }),
    description: readString(record, "description", { max: 4000 }),
    location: readString(record, "location", { max: 240 }),
    phase: readEnum(record, "phase", TASK_PHASES, { fallback: "Other" }),
    status: readEnum(record, "status", TASK_STATUSES, { fallback: "Not Started" }),
    priority: readEnum(record, "priority", TASK_PRIORITIES, { fallback: "Medium" }),
    assignedRecordId: readString(record, "assignedRecordId", { max: 120 }),
    assignedLabel: readString(record, "assignedLabel", { max: 160 }),
    startDate: readDate(record, "startDate"),
    dueDate: readDate(record, "dueDate"),
    milestone: readBoolean(record, "milestone"),
    predecessorIds: readStringArray(record, "predecessorIds", { maxItems: 20, itemMax: 120 }),
    inspectionDate: readDate(record, "inspectionDate"),
    percentComplete: readInteger(record, "percentComplete", { min: 0, max: 100 }) ?? 0,
    mobileNote: readString(record, "mobileNote", { max: 2000 }),
    lastUpdatedBy: readString(record, "lastUpdatedBy", { max: 120 }),
    createdAt: readDate(record, "createdAt"),
    updatedAt: readDate(record, "updatedAt"),
  });
}

function validateTenantProfile(record: JsonRecord) {
  return withAudit({
    organizationName: readString(record, "organizationName", { required: true, max: 160 }),
    subscriptionStatus: readEnum(record, "subscriptionStatus", SUBSCRIPTION_STATUSES, {
      fallback: "Active",
    }),
    planTier: readEnum(record, "planTier", PLAN_TIERS, { fallback: "Internal" }),
    trial: readBoolean(record, "trial"),
    activeSeats: readInteger(record, "activeSeats", { required: true, min: 1, max: 5000 }) ?? 1,
    accountStatus: readEnum(record, "accountStatus", SUBSCRIPTION_STATUSES, {
      fallback: "Active",
    }),
    adminNotes: readString(record, "adminNotes", { max: 4000 }),
    usageAuditLog: readString(record, "usageAuditLog", { max: 4000 }),
    featureAccess: readStringArray(record, "featureAccess", { maxItems: 100, itemMax: 120 }),
    updatedAt: readDate(record, "updatedAt"),
  });
}

function validateAutomationSettings(record: JsonRecord) {
  return withAudit({
    overdueTasks: readBoolean(record, "overdueTasks", true),
    delayedMilestones: readBoolean(record, "delayedMilestones", true),
    budgetThresholdExceeded: readBoolean(record, "budgetThresholdExceeded", true),
    overdueClientInvoices: readBoolean(record, "overdueClientInvoices", true),
    unpaidVendorBills: readBoolean(record, "unpaidVendorBills", true),
    staleChangeOrders: readBoolean(record, "staleChangeOrders", true),
    unresolvedDeficiencies: readBoolean(record, "unresolvedDeficiencies", true),
    missingRequiredDocuments: readBoolean(record, "missingRequiredDocuments", true),
    expiringInsuranceOrLicense: readBoolean(record, "expiringInsuranceOrLicense", true),
    budgetVarianceThreshold:
      readInteger(record, "budgetVarianceThreshold", { min: 50, max: 100 }) ?? 85,
    updatedAt: readDate(record, "updatedAt"),
  });
}

function validatePresentation(record: JsonRecord) {
  return withAudit({
    id: readString(record, "id", { max: 120 }),
    projectId: readString(record, "projectId", { required: true, max: 120 }),
    title: readString(record, "title", { required: true, max: 180 }),
    preparedFor: readString(record, "preparedFor", { required: true, max: 180 }),
    presentationType: readEnum(record, "presentationType", PRESENTATION_TYPES, {
      fallback: "Internal Deck",
    }),
    visibility: readEnum(record, "visibility", VISIBILITY_LEVELS, {
      fallback: "Internal",
    }),
    status: readEnum(record, "status", WORKFLOW_STATUSES, { fallback: "Draft" }),
    summary: readString(record, "summary", { max: 4000 }),
    scopeSummary: readString(record, "scopeSummary", { max: 4000 }),
    permitStatus: readString(record, "permitStatus", { max: 2000 }),
    budgetSnapshot: readString(record, "budgetSnapshot", { max: 2000 }),
    scheduleMilestones: readString(record, "scheduleMilestones", { max: 4000 }),
    riskRegister: readString(record, "riskRegister", { max: 4000 }),
    nextSteps: readString(record, "nextSteps", { max: 4000 }),
    deckUrl: readUrl(record, "deckUrl"),
    imageUrl: readUrl(record, "imageUrl"),
    safeForExternal: readBoolean(record, "safeForExternal"),
    internalReviewNotes: readString(record, "internalReviewNotes", { max: 4000 }),
    createdBy: readString(record, "createdBy", { max: 120 }),
    updatedBy: readString(record, "updatedBy", { max: 120 }),
    approvedBy: readString(record, "approvedBy", { max: 120 }),
    approvedAt: readDate(record, "approvedAt"),
    exportedAt: readDate(record, "exportedAt"),
    exportedBy: readString(record, "exportedBy", { max: 120 }),
    createdAt: readDate(record, "createdAt"),
    updatedAt: readDate(record, "updatedAt"),
  });
}

function validateVideo(record: JsonRecord) {
  return withAudit({
    id: readString(record, "id", { max: 120 }),
    projectId: readString(record, "projectId", { required: true, max: 120 }),
    title: readString(record, "title", { required: true, max: 180 }),
    category: readEnum(record, "category", VIDEO_CATEGORIES, {
      fallback: "Project Walkthrough",
    }),
    description: readString(record, "description", { max: 4000 }),
    sourceUrl: readUrl(record, "sourceUrl", { required: true }),
    date: readDate(record, "date", { required: true }),
    visibility: readEnum(record, "visibility", VISIBILITY_LEVELS, {
      fallback: "Internal",
    }),
    accessLevel: readEnum(record, "accessLevel", VISIBILITY_LEVELS, {
      fallback: "Internal",
    }),
    thumbnailUrl: readUrl(record, "thumbnailUrl"),
    createdBy: readString(record, "createdBy", { max: 120 }),
    updatedBy: readString(record, "updatedBy", { max: 120 }),
    createdAt: readDate(record, "createdAt"),
    updatedAt: readDate(record, "updatedAt"),
  });
}

function validateClientReport(record: JsonRecord) {
  return withAudit({
    id: readString(record, "id", { max: 120 }),
    projectId: readString(record, "projectId", { required: true, max: 120 }),
    title: readString(record, "title", { required: true, max: 180 }),
    preparedFor: readString(record, "preparedFor", { required: true, max: 180 }),
    reportDate: readDate(record, "reportDate", { required: true }),
    visibility: readEnum(record, "visibility", VISIBILITY_LEVELS, {
      fallback: "Internal",
    }),
    audience: readEnum(record, "audience", REPORT_AUDIENCES, { fallback: "Internal" }),
    status: readEnum(record, "status", WORKFLOW_STATUSES, { fallback: "Draft" }),
    summary: readString(record, "summary", { max: 4000 }),
    safeContextNotes: readString(record, "safeContextNotes", { max: 4000 }),
    internalReviewNotes: readString(record, "internalReviewNotes", { max: 4000 }),
    sectionOrder: readStringArray(record, "sectionOrder", { maxItems: 20, itemMax: 120 }),
    sections: readClientReportSections(record),
    lastGeneratedAt: readDate(record, "lastGeneratedAt"),
    generatedBy: readString(record, "generatedBy", { max: 120 }),
    approvedAt: readDate(record, "approvedAt"),
    approvedBy: readString(record, "approvedBy", { max: 120 }),
    exportedAt: readDate(record, "exportedAt"),
    exportedBy: readString(record, "exportedBy", { max: 120 }),
    exportCount: readInteger(record, "exportCount", { min: 0, max: 999 }),
    lastExportFormat: readEnum(record, "lastExportFormat", ["PDF"] as const),
    createdAt: readDate(record, "createdAt"),
    updatedAt: readDate(record, "updatedAt"),
  });
}

export function validateBuildOsRecordInput(
  module: BuildOsModuleName,
  input: unknown
) {
  const record = asRecord(input);

  switch (module) {
    case "master-database":
      return validateMasterDatabase(record);
    case "change-orders":
      return validateChangeOrder(record);
    case "daily-logs":
      return validateDailyLog(record);
    case "deficiencies":
      return validateDeficiency(record);
    case "client-invoices":
      return validateClientInvoice(record);
    case "vendor-bills":
      return validateVendorBill(record);
    case "documents":
      return validateDocument(record);
    case "project-participants":
      return validateProjectParticipants(record);
    case "tasks":
      return validateTask(record);
    case "tenant-profile":
      return validateTenantProfile(record);
    case "automation-settings":
      return validateAutomationSettings(record);
    case "presentations":
      return validatePresentation(record);
    case "videos":
      return validateVideo(record);
    case "client-reports":
      return validateClientReport(record);
    default:
      return record;
  }
}

export function validateDeletionReason(input: unknown) {
  const raw =
    typeof input === "string"
      ? input
      : input && typeof input === "object" && !Array.isArray(input)
        ? trimString((input as JsonRecord).reason)
        : "";

  const reason = raw.trim();

  if (!reason) {
    throw new BuildOsValidationError("A deletion reason is required.");
  }

  if (reason.length > 240) {
    throw new BuildOsValidationError("Deletion reason exceeds 240 characters.");
  }

  return reason;
}
