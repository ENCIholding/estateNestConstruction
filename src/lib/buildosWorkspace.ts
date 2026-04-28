import type { ManagementProject } from "./managementData";

export type BuildOsEntityType =
  | "Vendor (Trade)"
  | "Supplier"
  | "Stakeholder (Client)"
  | "Buyer"
  | "Realtor"
  | "Lawyer"
  | "Consultant"
  | "Broker"
  | "Lender"
  | "Investor"
  | "Municipality"
  | "Inspector"
  | "Insurance"
  | "Accounting"
  | "Legal"
  | "Internal Team"
  | "Other";

export type BuildOsRecordStatus = "Active" | "Inactive" | "Do Not Use";
export type WorkAgainDecision = "Yes" | "Caution" | "No";
export type DealSide = "seller" | "buyer" | "n/a";

export type BuildOsMasterRecord = {
  id: string;
  type: BuildOsEntityType;
  role?: string;
  companyName?: string;
  personName: string;
  titleRole?: string;
  tradeCategory?: string;
  secondaryTradeCategory?: string;
  phone?: string;
  email?: string;
  address?: string;
  notes?: string;
  restrictedNotes?: string;
  tags: string[];
  linkedProjectIds: string[];
  status: BuildOsRecordStatus;
  documents: string[];
  lastInteraction?: string;
  insuranceExpiry?: string;
  licenseExpiry?: string;
  qualityScore?: number;
  pricingScore?: number;
  reliabilityScore?: number;
  communicationScore?: number;
  timelinessScore?: number;
  professionalismScore?: number;
  deficiencyCount?: number;
  averageResponseDays?: number;
  workAgain?: WorkAgainDecision;
  recommended?: boolean;
  dealSide?: DealSide;
  auditLog?: BuildOsRecordAuditEntry[];
  deletedAt?: string;
  deletedBy?: string;
  deletionReason?: string;
  createdAt: string;
  updatedAt: string;
};

export type ChangeOrderStatus =
  | "Draft"
  | "Pending Approval"
  | "Approved"
  | "Rejected"
  | "Implemented";

export type BuildOsChangeOrder = {
  id: string;
  projectId: string;
  title: string;
  vendorRecordId?: string;
  costCategory?: string;
  scopeSummary: string;
  reason: string;
  budgetImpact: number;
  timeImpactDays: number;
  status: ChangeOrderStatus;
  updatedBy?: string;
  internalNotes?: string;
  clientSummary?: string;
  vendorSummary?: string;
  attachmentUrl?: string;
  auditLog?: BuildOsRecordAuditEntry[];
  deletedAt?: string;
  deletedBy?: string;
  deletionReason?: string;
  createdAt: string;
  updatedAt: string;
};

export type BuildOsDailyLog = {
  id: string;
  projectId: string;
  date: string;
  weather?: string;
  crewCount?: number;
  tradesOnsite: string[];
  materialsDelivered?: string;
  inspections?: string;
  delaysBlockers?: string;
  safetyNotes?: string;
  comments?: string;
  photoUrl?: string;
  createdBy?: string;
  auditLog?: BuildOsRecordAuditEntry[];
  deletedAt?: string;
  deletedBy?: string;
  deletionReason?: string;
  createdAt: string;
  updatedAt: string;
};

export type DeficiencyStatus = "Open" | "In Progress" | "Ready for Review" | "Closed";
export type DeficiencySeverity = "Low" | "Medium" | "High" | "Critical";

export type BuildOsDeficiency = {
  id: string;
  projectId: string;
  title: string;
  description: string;
  location?: string;
  severity: DeficiencySeverity;
  assignedRecordId?: string;
  dueDate?: string;
  status: DeficiencyStatus;
  beforePhotoUrl?: string;
  completionPhotoUrl?: string;
  notes?: string;
  closeoutConfirmation?: string;
  warrantyLinked: boolean;
  auditLog?: BuildOsRecordAuditEntry[];
  deletedAt?: string;
  deletedBy?: string;
  deletionReason?: string;
  createdAt: string;
  updatedAt: string;
};

export type ClientInvoiceStatus = "Draft" | "Sent" | "Partially Paid" | "Paid" | "Overdue";
export type VendorBillStatus = "Received" | "Verified" | "Paid" | "Overdue";

export type BuildOsClientInvoice = {
  id: string;
  projectId: string;
  stakeholderRecordId?: string;
  invoiceNumber: string;
  invoiceDate: string;
  dueDate: string;
  amount: number;
  status: ClientInvoiceStatus;
  updatedBy?: string;
  notes?: string;
  drawReference?: string;
  auditLog?: BuildOsRecordAuditEntry[];
  deletedAt?: string;
  deletedBy?: string;
  deletionReason?: string;
  createdAt: string;
  updatedAt: string;
};

export type BuildOsVendorBill = {
  id: string;
  projectId: string;
  vendorRecordId?: string;
  invoiceNumber: string;
  invoiceDate: string;
  dueDate: string;
  amount: number;
  status: VendorBillStatus;
  updatedBy?: string;
  notes?: string;
  attachmentUrl?: string;
  auditLog?: BuildOsRecordAuditEntry[];
  deletedAt?: string;
  deletedBy?: string;
  deletionReason?: string;
  createdAt: string;
  updatedAt: string;
};

export type BuildOsDocumentType =
  | "Development Permit"
  | "Building Permit"
  | "Real Property Report"
  | "Insurance Certificate"
  | "Trade License"
  | "Contract"
  | "Inspection Report"
  | "Warranty Record"
  | "Change Order Backup"
  | "Lender Draw Backup"
  | "Other";

export type BuildOsDocumentRecord = {
  id: string;
  title: string;
  projectId?: string;
  linkedRecordId?: string;
  documentType: BuildOsDocumentType;
  tags: string[];
  uploader?: string;
  updatedBy?: string;
  uploadDate: string;
  versionLabel?: string;
  versionGroup?: string;
  expiryDate?: string;
  requiredForProject: boolean;
  url?: string;
  notes?: string;
  auditLog?: BuildOsRecordAuditEntry[];
  deletedAt?: string;
  deletedBy?: string;
  deletionReason?: string;
  createdAt: string;
  updatedAt: string;
};

export type BuildOsProjectParticipantAssignment = {
  projectId: string;
  sellerSideRealtorId?: string;
  buyerSideRealtorId?: string;
  sellerSideLawyerId?: string;
  buyerSideLawyerId?: string;
  stakeholderClientIds: string[];
  buyerIds: string[];
  lenderIds: string[];
  investorIds: string[];
  otherRecordIds: string[];
  updatedBy?: string;
  createdAt: string;
  updatedAt: string;
};

export type BuildOsTaskStatus =
  | "Not Started"
  | "In Progress"
  | "Blocked"
  | "Waiting Review"
  | "Completed";

export type BuildOsTaskPriority = "Low" | "Medium" | "High" | "Critical";

export type BuildOsTaskPhase =
  | "Pre-Construction"
  | "Permits"
  | "Foundation"
  | "Framing"
  | "Rough-Ins"
  | "Finishes"
  | "Closeout"
  | "Warranty"
  | "Other";

export type BuildOsTask = {
  id: string;
  projectId: string;
  title: string;
  description?: string;
  location?: string;
  phase: BuildOsTaskPhase;
  status: BuildOsTaskStatus;
  priority: BuildOsTaskPriority;
  assignedRecordId?: string;
  assignedLabel?: string;
  startDate?: string;
  dueDate?: string;
  milestone: boolean;
  predecessorIds: string[];
  inspectionDate?: string;
  percentComplete: number;
  mobileNote?: string;
  lastUpdatedBy?: string;
  auditLog?: BuildOsRecordAuditEntry[];
  deletedAt?: string;
  deletedBy?: string;
  deletionReason?: string;
  createdAt: string;
  updatedAt: string;
};

export type BuildOsRecordAuditAction =
  | "created"
  | "updated"
  | "deleted"
  | "restored"
  | "generated"
  | "reviewed"
  | "approved"
  | "exported";

export type BuildOsRecordAuditEntry = {
  action: BuildOsRecordAuditAction;
  actor: string;
  detail: string;
  id: string;
  occurredAt: string;
};

export type BuildOsWorkflowStatus =
  | "Draft"
  | "Review"
  | "Approved"
  | "Exported";

export type BuildOsVisibilityLevel =
  | "Internal"
  | "Client"
  | "Lender"
  | "Investor"
  | "Public";

export type BuildOsPresentationType =
  | "Client Meeting"
  | "Lender Package"
  | "Investor Review"
  | "Internal Deck"
  | "Permit/Diligence Review";

export type BuildOsPresentationRecord = {
  id: string;
  projectId: string;
  title: string;
  preparedFor: string;
  presentationType: BuildOsPresentationType;
  visibility: BuildOsVisibilityLevel;
  status: BuildOsWorkflowStatus;
  summary?: string;
  scopeSummary?: string;
  permitStatus?: string;
  budgetSnapshot?: string;
  scheduleMilestones?: string;
  riskRegister?: string;
  nextSteps?: string;
  deckUrl?: string;
  imageUrl?: string;
  safeForExternal: boolean;
  internalReviewNotes?: string;
  createdBy?: string;
  updatedBy?: string;
  approvedBy?: string;
  approvedAt?: string;
  exportedAt?: string;
  exportedBy?: string;
  auditLog?: BuildOsRecordAuditEntry[];
  deletedAt?: string;
  deletedBy?: string;
  deletionReason?: string;
  createdAt: string;
  updatedAt: string;
};

export type BuildOsVideoCategory =
  | "Project Walkthrough"
  | "Before/After"
  | "Site Progress"
  | "Explainer"
  | "Construction Method"
  | "Client Meeting"
  | "Permit/Diligence";

export type BuildOsVideoRecord = {
  id: string;
  projectId: string;
  title: string;
  category: BuildOsVideoCategory;
  description?: string;
  sourceUrl: string;
  date: string;
  visibility: BuildOsVisibilityLevel;
  accessLevel: BuildOsVisibilityLevel;
  thumbnailUrl?: string;
  createdBy?: string;
  updatedBy?: string;
  auditLog?: BuildOsRecordAuditEntry[];
  deletedAt?: string;
  deletedBy?: string;
  deletionReason?: string;
  createdAt: string;
  updatedAt: string;
};

export type BuildOsClientReportSection = {
  body: string[];
  heading: string;
  safe: boolean;
};

export type BuildOsClientReportRecord = {
  id: string;
  projectId: string;
  title: string;
  preparedFor: string;
  reportDate: string;
  visibility: BuildOsVisibilityLevel;
  audience: "Client" | "Lender" | "Investor" | "Internal";
  status: BuildOsWorkflowStatus;
  summary?: string;
  safeContextNotes?: string;
  internalReviewNotes?: string;
  sectionOrder: string[];
  sections: BuildOsClientReportSection[];
  lastGeneratedAt?: string;
  generatedBy?: string;
  approvedAt?: string;
  approvedBy?: string;
  exportedAt?: string;
  exportedBy?: string;
  exportCount?: number;
  lastExportFormat?: "PDF";
  auditLog?: BuildOsRecordAuditEntry[];
  deletedAt?: string;
  deletedBy?: string;
  deletionReason?: string;
  createdAt: string;
  updatedAt: string;
};

export type DashboardThemeMode = "system" | "light" | "dark";
export type DashboardFontScale = "default" | "large" | "xlarge";
export type DashboardDensity = "comfortable" | "compact";

export type BuildOsPreferences = {
  themeMode: DashboardThemeMode;
  fontScale: DashboardFontScale;
  density: DashboardDensity;
  reducedMotion: boolean;
  highContrast: boolean;
};

export type BuildOsFeatureFlags = {
  masterDatabaseLive: boolean;
  vendorsLive: boolean;
  tasksLive: boolean;
  changeOrdersLive: boolean;
  dailyLogsLive: boolean;
  deficienciesLive: boolean;
  clientInvoicesLive: boolean;
  vendorBillsLive: boolean;
  licenseCenterLive: boolean;
  presentationsLive: boolean;
  videosLive: boolean;
  clientReportsLive: boolean;
  ganttBeta: boolean;
  automationBeta: boolean;
  mobileTasksBeta: boolean;
};

export type BuildOsTenantProfile = {
  organizationName: string;
  subscriptionStatus: "Active" | "Suspended" | "Trial" | "Cancelled";
  planTier: "Internal" | "Pilot" | "Builder Pro" | "Enterprise";
  trial: boolean;
  activeSeats: number;
  accountStatus: "Active" | "Suspended" | "Trial" | "Cancelled";
  adminNotes?: string;
  usageAuditLog?: string;
  featureAccess: string[];
  updatedAt: string;
};

export type BuildOsAutomationSettings = {
  overdueTasks: boolean;
  delayedMilestones: boolean;
  budgetThresholdExceeded: boolean;
  overdueClientInvoices: boolean;
  unpaidVendorBills: boolean;
  staleChangeOrders: boolean;
  unresolvedDeficiencies: boolean;
  missingRequiredDocuments: boolean;
  expiringInsuranceOrLicense: boolean;
  budgetVarianceThreshold: number;
  updatedAt: string;
};

type LegacyVendorRecord = {
  id: string;
  company_name?: string | null;
  trade_type?: string | null;
  contact_person?: string | null;
  phone?: string | null;
  email?: string | null;
  website?: string | null;
  insurance_expiry_date?: string | null;
  notes?: string | null;
  vendor_rating?: string | null;
  work_again?: boolean | null;
  internal_notes?: string | null;
  status?: string | null;
};

const MASTER_DATABASE_KEY = "enci-buildos-master-database";
const CHANGE_ORDERS_KEY = "enci-buildos-change-orders";
const DAILY_LOGS_KEY = "enci-buildos-daily-logs";
const DEFICIENCIES_KEY = "enci-buildos-deficiencies";
const CLIENT_INVOICES_KEY = "enci-buildos-client-invoices";
const VENDOR_BILLS_KEY = "enci-buildos-vendor-bills";
const DOCUMENTS_KEY = "enci-buildos-documents";
const PARTICIPANT_ASSIGNMENTS_KEY = "enci-buildos-project-participants";
const TASKS_KEY = "enci-buildos-tasks";
const PRESENTATIONS_KEY = "enci-buildos-presentations";
const VIDEOS_KEY = "enci-buildos-videos";
const CLIENT_REPORTS_KEY = "enci-buildos-client-reports";
const PREFERENCES_KEY = "enci-buildos-preferences";
const FEATURE_FLAGS_KEY = "enci-buildos-feature-flags";
const TENANT_PROFILE_KEY = "enci-buildos-tenant-profile";
const AUTOMATION_SETTINGS_KEY = "enci-buildos-automation-settings";
const LEGACY_VENDORS_KEY = "enci-management-workspace-vendors";
const MASTER_DATABASE_MIGRATION_KEY = "enci-buildos-master-database-migrated";

export const BUILDOS_ENTITY_TYPES: BuildOsEntityType[] = [
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
];

export const BUILDOS_TRADE_TYPES = [
  "Architect",
  "Engineer",
  "Excavation",
  "Foundation",
  "Framing",
  "Electrical",
  "Plumbing",
  "HVAC",
  "Insulation",
  "Drywall",
  "Painting",
  "Flooring",
  "Cabinets",
  "Countertops",
  "Finishing",
  "Roofing",
  "Siding",
  "Windows & Doors",
  "Landscaping",
  "Concrete",
  "Masonry",
  "General Labour",
  "Other",
] as const;

export const BUILDOS_DOCUMENT_TYPES: BuildOsDocumentType[] = [
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
];

export const BUILDOS_TASK_PHASES: BuildOsTaskPhase[] = [
  "Pre-Construction",
  "Permits",
  "Foundation",
  "Framing",
  "Rough-Ins",
  "Finishes",
  "Closeout",
  "Warranty",
  "Other",
];

export const BUILDOS_TASK_STATUSES: BuildOsTaskStatus[] = [
  "Not Started",
  "In Progress",
  "Blocked",
  "Waiting Review",
  "Completed",
];

export const BUILDOS_TASK_PRIORITIES: BuildOsTaskPriority[] = [
  "Low",
  "Medium",
  "High",
  "Critical",
];

export const BUILDOS_WORKFLOW_STATUSES: BuildOsWorkflowStatus[] = [
  "Draft",
  "Review",
  "Approved",
  "Exported",
];

export const BUILDOS_VISIBILITY_LEVELS: BuildOsVisibilityLevel[] = [
  "Internal",
  "Client",
  "Lender",
  "Investor",
  "Public",
];

export const BUILDOS_PRESENTATION_TYPES: BuildOsPresentationType[] = [
  "Client Meeting",
  "Lender Package",
  "Investor Review",
  "Internal Deck",
  "Permit/Diligence Review",
];

export const BUILDOS_VIDEO_CATEGORIES: BuildOsVideoCategory[] = [
  "Project Walkthrough",
  "Before/After",
  "Site Progress",
  "Explainer",
  "Construction Method",
  "Client Meeting",
  "Permit/Diligence",
];

function canUseStorage() {
  return typeof window !== "undefined" && typeof window.localStorage !== "undefined";
}

function readJson<T>(key: string, fallback: T): T {
  if (!canUseStorage()) {
    return fallback;
  }

  try {
    const raw = window.localStorage.getItem(key);
    if (!raw) {
      return fallback;
    }

    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

function writeJson<T>(key: string, value: T) {
  if (!canUseStorage()) {
    return;
  }

  window.localStorage.setItem(key, JSON.stringify(value));
}

function createId(prefix: string) {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return `${prefix}-${crypto.randomUUID()}`;
  }

  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

function nowIso() {
  return new Date().toISOString();
}

function cleanString(value?: string | null) {
  const normalized = value?.trim();
  return normalized || undefined;
}

function cleanStringArray(value?: string[] | null) {
  return (value || []).map((item) => item.trim()).filter(Boolean);
}

function normalizeScore(value?: number | null) {
  if (typeof value !== "number" || !Number.isFinite(value)) {
    return undefined;
  }

  return Math.min(5, Math.max(1, Math.round(value)));
}

function sortByUpdatedAt<T extends { updatedAt?: string; createdAt?: string }>(items: T[]) {
  return [...items].sort((left, right) => {
    const leftValue = new Date(left.updatedAt || left.createdAt || 0).getTime();
    const rightValue = new Date(right.updatedAt || right.createdAt || 0).getTime();
    return rightValue - leftValue;
  });
}

function mapLegacyRatingToScore(value?: string | null) {
  switch ((value || "").toLowerCase()) {
    case "excellent":
      return 5;
    case "good":
      return 4;
    case "average":
      return 3;
    case "poor":
      return 2;
    default:
      return undefined;
  }
}

function normalizeLegacyVendorRecord(record: LegacyVendorRecord): BuildOsMasterRecord {
  const timestamp = nowIso();
  const mappedScore = mapLegacyRatingToScore(record.vendor_rating);

  return {
    id: record.id || createId("master"),
    type: "Vendor (Trade)",
    role: "Trade Partner",
    companyName: cleanString(record.company_name),
    personName: cleanString(record.contact_person) || cleanString(record.company_name) || "Unnamed Vendor",
    titleRole: undefined,
    tradeCategory: cleanString(record.trade_type),
    secondaryTradeCategory: undefined,
    phone: cleanString(record.phone),
    email: cleanString(record.email),
    address: undefined,
    notes: cleanString(record.notes),
    restrictedNotes: cleanString(record.internal_notes),
    tags: [],
    linkedProjectIds: [],
    status:
      record.status === "Inactive" || record.status === "Do Not Use"
        ? (record.status as BuildOsRecordStatus)
        : "Active",
    documents: cleanString(record.website) ? [record.website!.trim()] : [],
    lastInteraction: undefined,
    insuranceExpiry: cleanString(record.insurance_expiry_date),
    licenseExpiry: undefined,
    qualityScore: mappedScore,
    pricingScore: mappedScore,
    reliabilityScore: mappedScore,
    communicationScore: mappedScore,
    timelinessScore: mappedScore,
    professionalismScore: mappedScore,
    deficiencyCount: 0,
    averageResponseDays: undefined,
    workAgain: record.work_again === false ? "No" : "Yes",
    recommended: record.work_again !== false,
    dealSide: "n/a",
    createdAt: timestamp,
    updatedAt: timestamp,
  };
}

function ensureMasterDatabaseMigration() {
  if (!canUseStorage()) {
    return;
  }

  const migrated = window.localStorage.getItem(MASTER_DATABASE_MIGRATION_KEY);
  if (migrated === "true") {
    return;
  }

  const existing = readJson<BuildOsMasterRecord[]>(MASTER_DATABASE_KEY, []);
  const legacyVendors = readJson<LegacyVendorRecord[]>(LEGACY_VENDORS_KEY, []);

  if (!existing.length && legacyVendors.length) {
    writeJson(
      MASTER_DATABASE_KEY,
      legacyVendors.map(normalizeLegacyVendorRecord)
    );
  }

  window.localStorage.setItem(MASTER_DATABASE_MIGRATION_KEY, "true");
}

export function loadMasterDatabaseRecords(options?: { includeDeleted?: boolean }) {
  ensureMasterDatabaseMigration();
  return sortByUpdatedAt(
    loadLifecycleCollection<BuildOsMasterRecord>(MASTER_DATABASE_KEY, options).map((record) => ({
      ...record,
      personName: cleanString(record.personName) || cleanString(record.companyName) || "Unnamed Record",
      tags: cleanStringArray(record.tags),
      linkedProjectIds: cleanStringArray(record.linkedProjectIds),
      documents: cleanStringArray(record.documents),
      status: record.status || "Active",
      createdAt: record.createdAt || nowIso(),
      updatedAt: record.updatedAt || record.createdAt || nowIso(),
    }))
  );
}

export function saveMasterDatabaseRecord(record: Partial<BuildOsMasterRecord>) {
  const current = loadMasterDatabaseRecords({ includeDeleted: true });
  const timestamp = nowIso();
  const existing = current.find((item) => item.id === record.id);

  const normalized: BuildOsMasterRecord = {
    id: record.id || createId("master"),
    type: record.type || "Other",
    role: cleanString(record.role),
    companyName: cleanString(record.companyName),
    personName:
      cleanString(record.personName) ||
      cleanString(record.companyName) ||
      existing?.personName ||
      "Unnamed Record",
    titleRole: cleanString(record.titleRole),
    tradeCategory: cleanString(record.tradeCategory),
    secondaryTradeCategory: cleanString(record.secondaryTradeCategory),
    phone: cleanString(record.phone),
    email: cleanString(record.email),
    address: cleanString(record.address),
    notes: cleanString(record.notes),
    restrictedNotes: cleanString(record.restrictedNotes),
    tags: cleanStringArray(record.tags),
    linkedProjectIds: cleanStringArray(record.linkedProjectIds),
    status: record.status || "Active",
    documents: cleanStringArray(record.documents),
    lastInteraction: cleanString(record.lastInteraction),
    insuranceExpiry: cleanString(record.insuranceExpiry),
    licenseExpiry: cleanString(record.licenseExpiry),
    qualityScore: normalizeScore(record.qualityScore),
    pricingScore: normalizeScore(record.pricingScore),
    reliabilityScore: normalizeScore(record.reliabilityScore),
    communicationScore: normalizeScore(record.communicationScore),
    timelinessScore: normalizeScore(record.timelinessScore),
    professionalismScore: normalizeScore(record.professionalismScore),
    deficiencyCount:
      typeof record.deficiencyCount === "number" && Number.isFinite(record.deficiencyCount)
        ? Math.max(0, Math.round(record.deficiencyCount))
        : undefined,
    averageResponseDays:
      typeof record.averageResponseDays === "number" &&
      Number.isFinite(record.averageResponseDays)
        ? Math.max(0, record.averageResponseDays)
        : undefined,
    workAgain: record.workAgain || "Yes",
    recommended: record.recommended ?? true,
    dealSide: record.dealSide || "n/a",
    createdAt: existing?.createdAt || timestamp,
    updatedAt: timestamp,
  };

  return saveLifecycleCollection(MASTER_DATABASE_KEY, normalized, {
    actor: "ENCI BuildOS",
  });
}

export function deleteMasterDatabaseRecord(
  recordId: string,
  options?: { actor?: string; reason?: string }
) {
  return softDeleteLifecycleCollection(MASTER_DATABASE_KEY, recordId, options);
}

export function restoreMasterDatabaseRecord(
  recordId: string,
  options?: { actor?: string; reason?: string }
) {
  return restoreLifecycleCollection(MASTER_DATABASE_KEY, recordId, options);
}

export function purgeMasterDatabaseRecord(recordId: string) {
  return purgeLifecycleCollection(MASTER_DATABASE_KEY, recordId);
}

function loadCollection<T>(key: string) {
  return readJson<T[]>(key, []);
}

type BuildOsLifecycleRecord = {
  auditLog?: BuildOsRecordAuditEntry[];
  createdAt?: string;
  createdBy?: string;
  deletedAt?: string;
  deletedBy?: string;
  deletionReason?: string;
  exportCount?: number;
  exportedAt?: string;
  exportedBy?: string;
  id: string;
  updatedAt?: string;
  updatedBy?: string;
};

type BuildOsLifecycleSaveOptions = {
  action?: BuildOsRecordAuditAction;
  actor?: string;
  detail?: string;
};

function resolveLifecycleActor(record: Record<string, unknown>, fallback = "ENCI BuildOS") {
  const candidates = [
    record.updatedBy,
    record.createdBy,
    record.lastUpdatedBy,
    record.generatedBy,
    record.approvedBy,
    record.exportedBy,
    record.uploader,
  ];

  const match = candidates.find(
    (value) => typeof value === "string" && value.trim().length > 0
  );

  return typeof match === "string" ? match.trim() : fallback;
}

export function buildBuildOsAuditEntry(
  action: BuildOsRecordAuditAction,
  actor: string,
  detail: string
): BuildOsRecordAuditEntry {
  return {
    action,
    actor,
    detail,
    id: createId("audit"),
    occurredAt: nowIso(),
  };
}

export function appendBuildOsAuditEntry<T extends { auditLog?: BuildOsRecordAuditEntry[] }>(
  record: T,
  action: BuildOsRecordAuditAction,
  actor: string,
  detail: string
) {
  return {
    ...record,
    auditLog: [...(record.auditLog || []), buildBuildOsAuditEntry(action, actor, detail)],
  };
}

function normalizeLifecycleCollectionItem<T extends BuildOsLifecycleRecord>(record: T) {
  return {
    ...record,
    auditLog: Array.isArray(record.auditLog) ? record.auditLog : [],
  };
}

function loadLifecycleCollection<T extends BuildOsLifecycleRecord>(
  key: string,
  options?: { includeDeleted?: boolean }
) {
  const records = loadCollection<T>(key).map(normalizeLifecycleCollectionItem);
  return options?.includeDeleted
    ? records
    : records.filter((record) => !record.deletedAt);
}

function saveLifecycleCollection<T extends BuildOsLifecycleRecord>(
  key: string,
  record: T,
  options?: BuildOsLifecycleSaveOptions
) {
  const current = loadCollection<T>(key);
  const existing = current.find((item) => item.id === record.id);
  const action = options?.action || (existing ? "updated" : "created");
  const actor =
    options?.actor ||
    resolveLifecycleActor(record as unknown as Record<string, unknown>);
  const detail =
    options?.detail ||
    (action === "created"
      ? "Record created in ENCI BuildOS."
      : "Record updated in ENCI BuildOS.");
  const normalized = appendBuildOsAuditEntry(
    normalizeLifecycleCollectionItem({
      ...existing,
      ...record,
    } as T),
    action,
    actor,
    detail
  );

  writeJson(
    key,
    sortByUpdatedAt([...current.filter((item) => item.id !== normalized.id), normalized])
  );

  return normalized;
}

function softDeleteLifecycleCollection(
  key: string,
  recordId: string,
  options?: { actor?: string; reason?: string }
) {
  const current = loadCollection<BuildOsLifecycleRecord>(key);
  const existing = current.find((item) => item.id === recordId);

  if (!existing) {
    return null;
  }

  const actor = options?.actor?.trim() || "ENCI BuildOS";
  const reason = options?.reason?.trim() || "No reason recorded.";
  const normalized = appendBuildOsAuditEntry(
    {
      ...normalizeLifecycleCollectionItem(existing),
      deletedAt: nowIso(),
      deletedBy: actor,
      deletionReason: reason,
      updatedAt: nowIso(),
    },
    "deleted",
    actor,
    `Record archived. Reason: ${reason}`
  );

  writeJson(
    key,
    sortByUpdatedAt([...current.filter((item) => item.id !== recordId), normalized])
  );

  return normalized;
}

function restoreLifecycleCollection(
  key: string,
  recordId: string,
  options?: { actor?: string; reason?: string }
) {
  const current = loadCollection<BuildOsLifecycleRecord>(key);
  const existing = current.find((item) => item.id === recordId);

  if (!existing) {
    return null;
  }

  const actor = options?.actor?.trim() || "ENCI BuildOS";
  const detail =
    options?.reason?.trim() || "Record restored for further internal review.";
  const baseRecord = { ...existing };
  delete baseRecord.deletedAt;
  delete baseRecord.deletedBy;
  delete baseRecord.deletionReason;
  const normalized = appendBuildOsAuditEntry(
    {
      ...normalizeLifecycleCollectionItem(baseRecord),
      updatedAt: nowIso(),
    },
    "restored",
    actor,
    detail
  );

  writeJson(
    key,
    sortByUpdatedAt([...current.filter((item) => item.id !== recordId), normalized])
  );

  return normalized;
}

function purgeLifecycleCollection(key: string, recordId: string) {
  const current = loadCollection<BuildOsLifecycleRecord>(key);
  const existing = current.find((item) => item.id === recordId);

  if (!existing) {
    return false;
  }

  writeJson(
    key,
    current.filter((record) => record.id !== recordId)
  );

  return true;
}

export function loadChangeOrders(options?: { includeDeleted?: boolean }) {
  return sortByUpdatedAt(
    loadLifecycleCollection<BuildOsChangeOrder>(CHANGE_ORDERS_KEY, options).map((record) => ({
      ...record,
      projectId: cleanString(record.projectId) || "",
      title: cleanString(record.title) || "Untitled Change Order",
      vendorRecordId: cleanString(record.vendorRecordId),
      costCategory: cleanString(record.costCategory),
      scopeSummary: cleanString(record.scopeSummary) || "Scope summary not provided.",
      reason: cleanString(record.reason) || "Reason not provided.",
      budgetImpact:
        typeof record.budgetImpact === "number" && Number.isFinite(record.budgetImpact)
          ? record.budgetImpact
          : 0,
      timeImpactDays:
        typeof record.timeImpactDays === "number" && Number.isFinite(record.timeImpactDays)
          ? Math.round(record.timeImpactDays)
          : 0,
      status: record.status || "Draft",
      updatedBy: cleanString(record.updatedBy),
      internalNotes: cleanString(record.internalNotes),
      clientSummary: cleanString(record.clientSummary),
      vendorSummary: cleanString(record.vendorSummary),
      attachmentUrl: cleanString(record.attachmentUrl),
      createdAt: record.createdAt || nowIso(),
      updatedAt: record.updatedAt || record.createdAt || nowIso(),
    }))
  );
}

export const loadBuildOsChangeOrders = loadChangeOrders;

export function saveChangeOrder(record: Partial<BuildOsChangeOrder>) {
  const current = loadChangeOrders({ includeDeleted: true });
  const existing = current.find((item) => item.id === record.id);
  const timestamp = nowIso();
  const normalized: BuildOsChangeOrder = {
    id: record.id || createId("co"),
    projectId: record.projectId || "",
    title: cleanString(record.title) || "Untitled Change Order",
    vendorRecordId: cleanString(record.vendorRecordId),
    costCategory: cleanString(record.costCategory),
    scopeSummary: cleanString(record.scopeSummary) || "Scope summary not provided.",
    reason: cleanString(record.reason) || "Reason not provided.",
    budgetImpact:
      typeof record.budgetImpact === "number" && Number.isFinite(record.budgetImpact)
        ? record.budgetImpact
        : 0,
    timeImpactDays:
      typeof record.timeImpactDays === "number" && Number.isFinite(record.timeImpactDays)
        ? Math.round(record.timeImpactDays)
        : 0,
    status: record.status || "Draft",
    updatedBy: cleanString(record.updatedBy),
    internalNotes: cleanString(record.internalNotes),
    clientSummary: cleanString(record.clientSummary),
    vendorSummary: cleanString(record.vendorSummary),
    attachmentUrl: cleanString(record.attachmentUrl),
    createdAt: existing?.createdAt || timestamp,
    updatedAt: timestamp,
  };

  return saveLifecycleCollection(CHANGE_ORDERS_KEY, normalized, {
    actor: normalized.updatedBy || "ENCI BuildOS",
  });
}

export function deleteChangeOrder(
  recordId: string,
  options?: { actor?: string; reason?: string }
) {
  return softDeleteLifecycleCollection(CHANGE_ORDERS_KEY, recordId, options);
}

export function restoreChangeOrder(
  recordId: string,
  options?: { actor?: string; reason?: string }
) {
  return restoreLifecycleCollection(CHANGE_ORDERS_KEY, recordId, options);
}

export function purgeChangeOrder(recordId: string) {
  return purgeLifecycleCollection(CHANGE_ORDERS_KEY, recordId);
}

export function loadDailyLogs(options?: { includeDeleted?: boolean }) {
  return sortByUpdatedAt(
    loadLifecycleCollection<BuildOsDailyLog>(DAILY_LOGS_KEY, options).map((record) => ({
      ...record,
      projectId: cleanString(record.projectId) || "",
      date: cleanString(record.date) || new Date().toISOString().slice(0, 10),
      weather: cleanString(record.weather),
      crewCount:
        typeof record.crewCount === "number" && Number.isFinite(record.crewCount)
          ? Math.max(0, Math.round(record.crewCount))
          : undefined,
      tradesOnsite: cleanStringArray(record.tradesOnsite),
      materialsDelivered: cleanString(record.materialsDelivered),
      inspections: cleanString(record.inspections),
      delaysBlockers: cleanString(record.delaysBlockers),
      safetyNotes: cleanString(record.safetyNotes),
      comments: cleanString(record.comments),
      photoUrl: cleanString(record.photoUrl),
      createdBy: cleanString(record.createdBy),
      createdAt: record.createdAt || nowIso(),
      updatedAt: record.updatedAt || record.createdAt || nowIso(),
    }))
  );
}

export const loadBuildOsDailyLogs = loadDailyLogs;

export function saveDailyLog(record: Partial<BuildOsDailyLog>) {
  const current = loadDailyLogs({ includeDeleted: true });
  const existing = current.find((item) => item.id === record.id);
  const timestamp = nowIso();
  const normalized: BuildOsDailyLog = {
    id: record.id || createId("daily"),
    projectId: record.projectId || "",
    date: cleanString(record.date) || new Date().toISOString().slice(0, 10),
    weather: cleanString(record.weather),
    crewCount:
      typeof record.crewCount === "number" && Number.isFinite(record.crewCount)
        ? Math.max(0, Math.round(record.crewCount))
        : undefined,
    tradesOnsite: cleanStringArray(record.tradesOnsite),
    materialsDelivered: cleanString(record.materialsDelivered),
    inspections: cleanString(record.inspections),
    delaysBlockers: cleanString(record.delaysBlockers),
    safetyNotes: cleanString(record.safetyNotes),
    comments: cleanString(record.comments),
    photoUrl: cleanString(record.photoUrl),
    createdBy: cleanString(record.createdBy),
    createdAt: existing?.createdAt || timestamp,
    updatedAt: timestamp,
  };

  return saveLifecycleCollection(DAILY_LOGS_KEY, normalized, {
    actor: normalized.createdBy || "ENCI BuildOS",
  });
}

export function deleteDailyLog(
  recordId: string,
  options?: { actor?: string; reason?: string }
) {
  return softDeleteLifecycleCollection(DAILY_LOGS_KEY, recordId, options);
}

export function restoreDailyLog(
  recordId: string,
  options?: { actor?: string; reason?: string }
) {
  return restoreLifecycleCollection(DAILY_LOGS_KEY, recordId, options);
}

export function purgeDailyLog(recordId: string) {
  return purgeLifecycleCollection(DAILY_LOGS_KEY, recordId);
}

export function loadDeficiencies(options?: { includeDeleted?: boolean }) {
  return sortByUpdatedAt(
    loadLifecycleCollection<BuildOsDeficiency>(DEFICIENCIES_KEY, options).map((record) => ({
      ...record,
      projectId: cleanString(record.projectId) || "",
      title: cleanString(record.title) || "Untitled Deficiency",
      description: cleanString(record.description) || "No description provided.",
      location: cleanString(record.location),
      severity: record.severity || "Medium",
      assignedRecordId: cleanString(record.assignedRecordId),
      dueDate: cleanString(record.dueDate),
      status: record.status || "Open",
      beforePhotoUrl: cleanString(record.beforePhotoUrl),
      completionPhotoUrl: cleanString(record.completionPhotoUrl),
      notes: cleanString(record.notes),
      closeoutConfirmation: cleanString(record.closeoutConfirmation),
      warrantyLinked: Boolean(record.warrantyLinked),
      createdAt: record.createdAt || nowIso(),
      updatedAt: record.updatedAt || record.createdAt || nowIso(),
    }))
  );
}

export const loadBuildOsDeficiencies = loadDeficiencies;

export function saveDeficiency(record: Partial<BuildOsDeficiency>) {
  const current = loadDeficiencies({ includeDeleted: true });
  const existing = current.find((item) => item.id === record.id);
  const timestamp = nowIso();
  const normalized: BuildOsDeficiency = {
    id: record.id || createId("def"),
    projectId: record.projectId || "",
    title: cleanString(record.title) || "Untitled Deficiency",
    description: cleanString(record.description) || "No description provided.",
    location: cleanString(record.location),
    severity: record.severity || "Medium",
    assignedRecordId: cleanString(record.assignedRecordId),
    dueDate: cleanString(record.dueDate),
    status: record.status || "Open",
    beforePhotoUrl: cleanString(record.beforePhotoUrl),
    completionPhotoUrl: cleanString(record.completionPhotoUrl),
    notes: cleanString(record.notes),
    closeoutConfirmation: cleanString(record.closeoutConfirmation),
    warrantyLinked: Boolean(record.warrantyLinked),
    createdAt: existing?.createdAt || timestamp,
    updatedAt: timestamp,
  };

  return saveLifecycleCollection(DEFICIENCIES_KEY, normalized, {
    actor: "ENCI BuildOS",
  });
}

export function deleteDeficiency(
  recordId: string,
  options?: { actor?: string; reason?: string }
) {
  return softDeleteLifecycleCollection(DEFICIENCIES_KEY, recordId, options);
}

export function restoreDeficiency(
  recordId: string,
  options?: { actor?: string; reason?: string }
) {
  return restoreLifecycleCollection(DEFICIENCIES_KEY, recordId, options);
}

export function purgeDeficiency(recordId: string) {
  return purgeLifecycleCollection(DEFICIENCIES_KEY, recordId);
}

export function loadClientInvoices(options?: { includeDeleted?: boolean }) {
  return sortByUpdatedAt(
    loadLifecycleCollection<BuildOsClientInvoice>(CLIENT_INVOICES_KEY, options).map((record) => ({
      ...record,
      projectId: cleanString(record.projectId) || "",
      stakeholderRecordId: cleanString(record.stakeholderRecordId),
      invoiceNumber: cleanString(record.invoiceNumber) || `INV-${Date.now()}`,
      invoiceDate: cleanString(record.invoiceDate) || new Date().toISOString().slice(0, 10),
      dueDate: cleanString(record.dueDate) || new Date().toISOString().slice(0, 10),
      amount:
        typeof record.amount === "number" && Number.isFinite(record.amount)
          ? record.amount
          : 0,
      status: record.status || "Draft",
      updatedBy: cleanString(record.updatedBy),
      notes: cleanString(record.notes),
      drawReference: cleanString(record.drawReference),
      createdAt: record.createdAt || nowIso(),
      updatedAt: record.updatedAt || record.createdAt || nowIso(),
    }))
  );
}

export const loadBuildOsClientInvoices = loadClientInvoices;

export function saveClientInvoice(record: Partial<BuildOsClientInvoice>) {
  const current = loadClientInvoices({ includeDeleted: true });
  const existing = current.find((item) => item.id === record.id);
  const timestamp = nowIso();
  const normalized: BuildOsClientInvoice = {
    id: record.id || createId("invoice"),
    projectId: record.projectId || "",
    stakeholderRecordId: cleanString(record.stakeholderRecordId),
    invoiceNumber: cleanString(record.invoiceNumber) || `INV-${Date.now()}`,
    invoiceDate: cleanString(record.invoiceDate) || new Date().toISOString().slice(0, 10),
    dueDate: cleanString(record.dueDate) || new Date().toISOString().slice(0, 10),
    amount:
      typeof record.amount === "number" && Number.isFinite(record.amount) ? record.amount : 0,
    status: record.status || "Draft",
    updatedBy: cleanString(record.updatedBy),
    notes: cleanString(record.notes),
    drawReference: cleanString(record.drawReference),
    createdAt: existing?.createdAt || timestamp,
    updatedAt: timestamp,
  };

  return saveLifecycleCollection(CLIENT_INVOICES_KEY, normalized, {
    actor: normalized.updatedBy || "ENCI BuildOS",
  });
}

export function deleteClientInvoice(
  recordId: string,
  options?: { actor?: string; reason?: string }
) {
  return softDeleteLifecycleCollection(CLIENT_INVOICES_KEY, recordId, options);
}

export function restoreClientInvoice(
  recordId: string,
  options?: { actor?: string; reason?: string }
) {
  return restoreLifecycleCollection(CLIENT_INVOICES_KEY, recordId, options);
}

export function purgeClientInvoice(recordId: string) {
  return purgeLifecycleCollection(CLIENT_INVOICES_KEY, recordId);
}

export function loadVendorBills(options?: { includeDeleted?: boolean }) {
  return sortByUpdatedAt(
    loadLifecycleCollection<BuildOsVendorBill>(VENDOR_BILLS_KEY, options).map((record) => ({
      ...record,
      projectId: cleanString(record.projectId) || "",
      vendorRecordId: cleanString(record.vendorRecordId),
      invoiceNumber: cleanString(record.invoiceNumber) || `BILL-${Date.now()}`,
      invoiceDate: cleanString(record.invoiceDate) || new Date().toISOString().slice(0, 10),
      dueDate: cleanString(record.dueDate) || new Date().toISOString().slice(0, 10),
      amount:
        typeof record.amount === "number" && Number.isFinite(record.amount)
          ? record.amount
          : 0,
      status: record.status || "Received",
      updatedBy: cleanString(record.updatedBy),
      notes: cleanString(record.notes),
      attachmentUrl: cleanString(record.attachmentUrl),
      createdAt: record.createdAt || nowIso(),
      updatedAt: record.updatedAt || record.createdAt || nowIso(),
    }))
  );
}

export const loadBuildOsVendorBills = loadVendorBills;

export function loadDocuments(options?: { includeDeleted?: boolean }) {
  return sortByUpdatedAt(
    loadLifecycleCollection<BuildOsDocumentRecord>(DOCUMENTS_KEY, options).map((record) => ({
      ...record,
      title: cleanString(record.title) || "Untitled Document",
      projectId: cleanString(record.projectId),
      linkedRecordId: cleanString(record.linkedRecordId),
      documentType: record.documentType || "Other",
      tags: cleanStringArray(record.tags),
      uploader: cleanString(record.uploader),
      updatedBy: cleanString(record.updatedBy),
      uploadDate: cleanString(record.uploadDate) || new Date().toISOString().slice(0, 10),
      versionLabel: cleanString(record.versionLabel),
      versionGroup: cleanString(record.versionGroup),
      expiryDate: cleanString(record.expiryDate),
      requiredForProject: Boolean(record.requiredForProject),
      url: cleanString(record.url),
      notes: cleanString(record.notes),
      createdAt: record.createdAt || nowIso(),
      updatedAt: record.updatedAt || record.createdAt || nowIso(),
    }))
  );
}

export const loadBuildOsDocuments = loadDocuments;

export function saveDocument(record: Partial<BuildOsDocumentRecord>) {
  const current = loadDocuments({ includeDeleted: true });
  const existing = current.find((item) => item.id === record.id);
  const timestamp = nowIso();
  const normalized: BuildOsDocumentRecord = {
    id: record.id || createId("doc"),
    title: cleanString(record.title) || "Untitled Document",
    projectId: cleanString(record.projectId),
    linkedRecordId: cleanString(record.linkedRecordId),
    documentType: record.documentType || "Other",
    tags: cleanStringArray(record.tags),
    uploader: cleanString(record.uploader),
    updatedBy: cleanString(record.updatedBy),
    uploadDate: cleanString(record.uploadDate) || new Date().toISOString().slice(0, 10),
    versionLabel: cleanString(record.versionLabel),
    versionGroup: cleanString(record.versionGroup),
    expiryDate: cleanString(record.expiryDate),
    requiredForProject: Boolean(record.requiredForProject),
    url: cleanString(record.url),
    notes: cleanString(record.notes),
    createdAt: existing?.createdAt || timestamp,
    updatedAt: timestamp,
  };

  return saveLifecycleCollection(DOCUMENTS_KEY, normalized, {
    actor: normalized.updatedBy || normalized.uploader || "ENCI BuildOS",
  });
}

export function deleteDocument(
  recordId: string,
  options?: { actor?: string; reason?: string }
) {
  return softDeleteLifecycleCollection(DOCUMENTS_KEY, recordId, options);
}

export function restoreDocument(
  recordId: string,
  options?: { actor?: string; reason?: string }
) {
  return restoreLifecycleCollection(DOCUMENTS_KEY, recordId, options);
}

export function purgeDocument(recordId: string) {
  return purgeLifecycleCollection(DOCUMENTS_KEY, recordId);
}

export function loadProjectParticipantAssignments() {
  return loadCollection<BuildOsProjectParticipantAssignment>(PARTICIPANT_ASSIGNMENTS_KEY).map(
    (record) => ({
      ...record,
      stakeholderClientIds: cleanStringArray(record.stakeholderClientIds),
      buyerIds: cleanStringArray(record.buyerIds),
      lenderIds: cleanStringArray(record.lenderIds),
      investorIds: cleanStringArray(record.investorIds),
      otherRecordIds: cleanStringArray(record.otherRecordIds),
      updatedBy: cleanString(record.updatedBy),
      createdAt: record.createdAt || nowIso(),
      updatedAt: record.updatedAt || record.createdAt || nowIso(),
    })
  );
}

export const loadBuildOsProjectParticipantAssignments = loadProjectParticipantAssignments;

export function getProjectParticipantAssignment(projectId: string) {
  return loadProjectParticipantAssignments().find((record) => record.projectId === projectId);
}

export function saveProjectParticipantAssignment(
  record: Partial<BuildOsProjectParticipantAssignment> & { projectId: string }
) {
  const current = loadProjectParticipantAssignments();
  const existing = current.find((item) => item.projectId === record.projectId);
  const timestamp = nowIso();
  const normalized: BuildOsProjectParticipantAssignment = {
    projectId: record.projectId,
    sellerSideRealtorId: cleanString(record.sellerSideRealtorId),
    buyerSideRealtorId: cleanString(record.buyerSideRealtorId),
    sellerSideLawyerId: cleanString(record.sellerSideLawyerId),
    buyerSideLawyerId: cleanString(record.buyerSideLawyerId),
    stakeholderClientIds: cleanStringArray(record.stakeholderClientIds),
    buyerIds: cleanStringArray(record.buyerIds),
    lenderIds: cleanStringArray(record.lenderIds),
    investorIds: cleanStringArray(record.investorIds),
    otherRecordIds: cleanStringArray(record.otherRecordIds),
    updatedBy: cleanString(record.updatedBy),
    createdAt: existing?.createdAt || timestamp,
    updatedAt: timestamp,
  };

  writeJson(
    PARTICIPANT_ASSIGNMENTS_KEY,
    sortByUpdatedAt([
      ...current.filter((item) => item.projectId !== normalized.projectId),
      normalized,
    ])
  );

  return normalized;
}

export function loadTasks(options?: { includeDeleted?: boolean }) {
  return sortByUpdatedAt(
    loadLifecycleCollection<BuildOsTask>(TASKS_KEY, options).map((record) => ({
      ...record,
      title: cleanString(record.title) || "Untitled Task",
      description: cleanString(record.description),
      location: cleanString(record.location),
      phase: record.phase || "Other",
      status: record.status || "Not Started",
      priority: record.priority || "Medium",
      assignedRecordId: cleanString(record.assignedRecordId),
      assignedLabel: cleanString(record.assignedLabel),
      startDate: cleanString(record.startDate),
      dueDate: cleanString(record.dueDate),
      milestone: Boolean(record.milestone),
      predecessorIds: cleanStringArray(record.predecessorIds),
      inspectionDate: cleanString(record.inspectionDate),
      percentComplete:
        typeof record.percentComplete === "number" && Number.isFinite(record.percentComplete)
          ? Math.min(100, Math.max(0, Math.round(record.percentComplete)))
          : 0,
      mobileNote: cleanString(record.mobileNote),
      lastUpdatedBy: cleanString(record.lastUpdatedBy),
      createdAt: record.createdAt || nowIso(),
      updatedAt: record.updatedAt || record.createdAt || nowIso(),
    }))
  );
}

export const loadBuildOsTasks = loadTasks;

function addDays(baseDate: string, days: number) {
  const parsed = new Date(baseDate);
  if (Number.isNaN(parsed.getTime())) {
    return undefined;
  }

  parsed.setDate(parsed.getDate() + days);
  return parsed.toISOString().slice(0, 10);
}

export function saveTask(record: Partial<BuildOsTask>) {
  const current = loadTasks({ includeDeleted: true });
  const existing = current.find((item) => item.id === record.id);
  const timestamp = nowIso();
  const normalizedStartDate =
    cleanString(record.startDate) ||
    cleanString(existing?.startDate) ||
    new Date().toISOString().slice(0, 10);
  const normalizedDueDate =
    cleanString(record.dueDate) ||
    cleanString(existing?.dueDate) ||
    addDays(normalizedStartDate, record.milestone ? 0 : 3);

  const normalized: BuildOsTask = {
    id: record.id || createId("task"),
    projectId: cleanString(record.projectId) || "",
    title: cleanString(record.title) || "Untitled Task",
    description: cleanString(record.description),
    location: cleanString(record.location),
    phase: record.phase || existing?.phase || "Other",
    status: record.status || existing?.status || "Not Started",
    priority: record.priority || existing?.priority || "Medium",
    assignedRecordId: cleanString(record.assignedRecordId),
    assignedLabel: cleanString(record.assignedLabel),
    startDate: normalizedStartDate,
    dueDate: normalizedDueDate,
    milestone: Boolean(record.milestone),
    predecessorIds: cleanStringArray(record.predecessorIds),
    inspectionDate: cleanString(record.inspectionDate),
    percentComplete:
      typeof record.percentComplete === "number" && Number.isFinite(record.percentComplete)
        ? Math.min(100, Math.max(0, Math.round(record.percentComplete)))
        : existing?.percentComplete || 0,
    mobileNote: cleanString(record.mobileNote),
    lastUpdatedBy: cleanString(record.lastUpdatedBy),
    createdAt: existing?.createdAt || timestamp,
    updatedAt: timestamp,
  };

  return saveLifecycleCollection(TASKS_KEY, normalized, {
    actor: normalized.lastUpdatedBy || "ENCI BuildOS",
  });
}

export function deleteTask(
  recordId: string,
  options?: { actor?: string; reason?: string }
) {
  return softDeleteLifecycleCollection(TASKS_KEY, recordId, options);
}

export function restoreTask(
  recordId: string,
  options?: { actor?: string; reason?: string }
) {
  return restoreLifecycleCollection(TASKS_KEY, recordId, options);
}

export function purgeTask(recordId: string) {
  return purgeLifecycleCollection(TASKS_KEY, recordId);
}

export function saveVendorBill(record: Partial<BuildOsVendorBill>) {
  const current = loadVendorBills({ includeDeleted: true });
  const existing = current.find((item) => item.id === record.id);
  const timestamp = nowIso();
  const normalized: BuildOsVendorBill = {
    id: record.id || createId("bill"),
    projectId: record.projectId || "",
    vendorRecordId: cleanString(record.vendorRecordId),
    invoiceNumber: cleanString(record.invoiceNumber) || `BILL-${Date.now()}`,
    invoiceDate: cleanString(record.invoiceDate) || new Date().toISOString().slice(0, 10),
    dueDate: cleanString(record.dueDate) || new Date().toISOString().slice(0, 10),
    amount:
      typeof record.amount === "number" && Number.isFinite(record.amount) ? record.amount : 0,
    status: record.status || "Received",
    updatedBy: cleanString(record.updatedBy),
    notes: cleanString(record.notes),
    attachmentUrl: cleanString(record.attachmentUrl),
    createdAt: existing?.createdAt || timestamp,
    updatedAt: timestamp,
  };

  return saveLifecycleCollection(VENDOR_BILLS_KEY, normalized, {
    actor: normalized.updatedBy || "ENCI BuildOS",
  });
}

export function deleteVendorBill(
  recordId: string,
  options?: { actor?: string; reason?: string }
) {
  return softDeleteLifecycleCollection(VENDOR_BILLS_KEY, recordId, options);
}

export function restoreVendorBill(
  recordId: string,
  options?: { actor?: string; reason?: string }
) {
  return restoreLifecycleCollection(VENDOR_BILLS_KEY, recordId, options);
}

export function purgeVendorBill(recordId: string) {
  return purgeLifecycleCollection(VENDOR_BILLS_KEY, recordId);
}

export function loadPresentations(options?: { includeDeleted?: boolean }) {
  return sortByUpdatedAt(
    loadLifecycleCollection<BuildOsPresentationRecord>(PRESENTATIONS_KEY, options).map(
      (record) => ({
        ...record,
        preparedFor: cleanString(record.preparedFor) || "Internal review",
        presentationType: record.presentationType || "Internal Deck",
        visibility: record.visibility || "Internal",
        status: record.status || "Draft",
        summary: cleanString(record.summary),
        scopeSummary: cleanString(record.scopeSummary),
        permitStatus: cleanString(record.permitStatus),
        budgetSnapshot: cleanString(record.budgetSnapshot),
        scheduleMilestones: cleanString(record.scheduleMilestones),
        riskRegister: cleanString(record.riskRegister),
        nextSteps: cleanString(record.nextSteps),
        deckUrl: cleanString(record.deckUrl),
        imageUrl: cleanString(record.imageUrl),
        safeForExternal: Boolean(record.safeForExternal),
        internalReviewNotes: cleanString(record.internalReviewNotes),
        createdAt: record.createdAt || nowIso(),
        updatedAt: record.updatedAt || record.createdAt || nowIso(),
      })
    )
  );
}

export function savePresentation(record: Partial<BuildOsPresentationRecord>) {
  const current = loadPresentations({ includeDeleted: true });
  const existing = current.find((item) => item.id === record.id);
  const timestamp = nowIso();
  const normalized: BuildOsPresentationRecord = {
    id: record.id || createId("presentation"),
    projectId: cleanString(record.projectId) || "",
    title: cleanString(record.title) || "Untitled presentation",
    preparedFor: cleanString(record.preparedFor) || "Internal review",
    presentationType: record.presentationType || existing?.presentationType || "Internal Deck",
    visibility: record.visibility || existing?.visibility || "Internal",
    status: record.status || existing?.status || "Draft",
    summary: cleanString(record.summary),
    scopeSummary: cleanString(record.scopeSummary),
    permitStatus: cleanString(record.permitStatus),
    budgetSnapshot: cleanString(record.budgetSnapshot),
    scheduleMilestones: cleanString(record.scheduleMilestones),
    riskRegister: cleanString(record.riskRegister),
    nextSteps: cleanString(record.nextSteps),
    deckUrl: cleanString(record.deckUrl),
    imageUrl: cleanString(record.imageUrl),
    safeForExternal: record.safeForExternal ?? existing?.safeForExternal ?? false,
    internalReviewNotes: cleanString(record.internalReviewNotes),
    createdBy: cleanString(record.createdBy) || existing?.createdBy,
    updatedBy: cleanString(record.updatedBy) || cleanString(record.createdBy) || existing?.updatedBy,
    approvedBy: cleanString(record.approvedBy) || existing?.approvedBy,
    approvedAt: cleanString(record.approvedAt) || existing?.approvedAt,
    exportedAt: cleanString(record.exportedAt) || existing?.exportedAt,
    exportedBy: cleanString(record.exportedBy) || existing?.exportedBy,
    auditLog: Array.isArray(record.auditLog) ? record.auditLog : existing?.auditLog || [],
    deletedAt: existing?.deletedAt,
    deletedBy: existing?.deletedBy,
    deletionReason: existing?.deletionReason,
    createdAt: existing?.createdAt || timestamp,
    updatedAt: timestamp,
  };

  return saveLifecycleCollection(PRESENTATIONS_KEY, normalized, {
    actor: normalized.updatedBy || normalized.createdBy || "ENCI BuildOS",
  });
}

export function deletePresentation(
  recordId: string,
  options?: { actor?: string; reason?: string }
) {
  return softDeleteLifecycleCollection(PRESENTATIONS_KEY, recordId, options);
}

export function restorePresentation(
  recordId: string,
  options?: { actor?: string; reason?: string }
) {
  return restoreLifecycleCollection(PRESENTATIONS_KEY, recordId, options);
}

export function purgePresentation(recordId: string) {
  return purgeLifecycleCollection(PRESENTATIONS_KEY, recordId);
}

export function loadVideos(options?: { includeDeleted?: boolean }) {
  return sortByUpdatedAt(
    loadLifecycleCollection<BuildOsVideoRecord>(VIDEOS_KEY, options).map((record) => ({
      ...record,
      category: record.category || "Project Walkthrough",
      description: cleanString(record.description),
      sourceUrl: cleanString(record.sourceUrl) || "",
      date: cleanString(record.date) || new Date().toISOString().slice(0, 10),
      visibility: record.visibility || "Internal",
      accessLevel: record.accessLevel || record.visibility || "Internal",
      thumbnailUrl: cleanString(record.thumbnailUrl),
      createdAt: record.createdAt || nowIso(),
      updatedAt: record.updatedAt || record.createdAt || nowIso(),
    }))
  );
}

export function saveVideo(record: Partial<BuildOsVideoRecord>) {
  const current = loadVideos({ includeDeleted: true });
  const existing = current.find((item) => item.id === record.id);
  const timestamp = nowIso();
  const normalized: BuildOsVideoRecord = {
    id: record.id || createId("video"),
    projectId: cleanString(record.projectId) || "",
    title: cleanString(record.title) || "Untitled video",
    category: record.category || existing?.category || "Project Walkthrough",
    description: cleanString(record.description),
    sourceUrl: cleanString(record.sourceUrl) || "",
    date: cleanString(record.date) || new Date().toISOString().slice(0, 10),
    visibility: record.visibility || existing?.visibility || "Internal",
    accessLevel: record.accessLevel || record.visibility || existing?.accessLevel || "Internal",
    thumbnailUrl: cleanString(record.thumbnailUrl),
    createdBy: cleanString(record.createdBy) || existing?.createdBy,
    updatedBy: cleanString(record.updatedBy) || cleanString(record.createdBy) || existing?.updatedBy,
    auditLog: Array.isArray(record.auditLog) ? record.auditLog : existing?.auditLog || [],
    deletedAt: existing?.deletedAt,
    deletedBy: existing?.deletedBy,
    deletionReason: existing?.deletionReason,
    createdAt: existing?.createdAt || timestamp,
    updatedAt: timestamp,
  };

  return saveLifecycleCollection(VIDEOS_KEY, normalized, {
    actor: normalized.updatedBy || normalized.createdBy || "ENCI BuildOS",
  });
}

export function deleteVideo(
  recordId: string,
  options?: { actor?: string; reason?: string }
) {
  return softDeleteLifecycleCollection(VIDEOS_KEY, recordId, options);
}

export function restoreVideo(
  recordId: string,
  options?: { actor?: string; reason?: string }
) {
  return restoreLifecycleCollection(VIDEOS_KEY, recordId, options);
}

export function purgeVideo(recordId: string) {
  return purgeLifecycleCollection(VIDEOS_KEY, recordId);
}

export function loadClientReports(options?: { includeDeleted?: boolean }) {
  return sortByUpdatedAt(
    loadLifecycleCollection<BuildOsClientReportRecord>(CLIENT_REPORTS_KEY, options).map(
      (record) => ({
        ...record,
        preparedFor: cleanString(record.preparedFor) || "Internal review",
        reportDate: cleanString(record.reportDate) || new Date().toISOString().slice(0, 10),
        visibility: record.visibility || "Internal",
        audience: record.audience || "Internal",
        status: record.status || "Draft",
        summary: cleanString(record.summary),
        safeContextNotes: cleanString(record.safeContextNotes),
        internalReviewNotes: cleanString(record.internalReviewNotes),
        sectionOrder: cleanStringArray(record.sectionOrder),
        sections: Array.isArray(record.sections)
          ? record.sections
              .filter((section) => section && typeof section === "object")
              .map((section) => ({
                body: Array.isArray(section.body)
                  ? section.body
                      .filter((entry): entry is string => typeof entry === "string")
                      .map((entry) => entry.trim())
                      .filter(Boolean)
                  : [],
                heading:
                  typeof section.heading === "string" && section.heading.trim()
                    ? section.heading.trim()
                    : "Untitled section",
                safe: Boolean(section.safe),
              }))
          : [],
        exportCount:
          typeof record.exportCount === "number" && Number.isFinite(record.exportCount)
            ? Math.max(0, Math.round(record.exportCount))
            : 0,
        lastExportFormat: record.lastExportFormat || undefined,
        createdAt: record.createdAt || nowIso(),
        updatedAt: record.updatedAt || record.createdAt || nowIso(),
      })
    )
  );
}

export function saveClientReport(record: Partial<BuildOsClientReportRecord>) {
  const current = loadClientReports({ includeDeleted: true });
  const existing = current.find((item) => item.id === record.id);
  const timestamp = nowIso();
  const normalized: BuildOsClientReportRecord = {
    id: record.id || createId("report"),
    projectId: cleanString(record.projectId) || "",
    title: cleanString(record.title) || "Untitled client report",
    preparedFor: cleanString(record.preparedFor) || "Internal review",
    reportDate: cleanString(record.reportDate) || new Date().toISOString().slice(0, 10),
    visibility: record.visibility || existing?.visibility || "Internal",
    audience: record.audience || existing?.audience || "Internal",
    status: record.status || existing?.status || "Draft",
    summary: cleanString(record.summary),
    safeContextNotes: cleanString(record.safeContextNotes),
    internalReviewNotes: cleanString(record.internalReviewNotes),
    sectionOrder: cleanStringArray(record.sectionOrder),
    sections: Array.isArray(record.sections) ? record.sections : existing?.sections || [],
    lastGeneratedAt: cleanString(record.lastGeneratedAt) || existing?.lastGeneratedAt,
    generatedBy: cleanString(record.generatedBy) || existing?.generatedBy,
    approvedAt: cleanString(record.approvedAt) || existing?.approvedAt,
    approvedBy: cleanString(record.approvedBy) || existing?.approvedBy,
    exportedAt: cleanString(record.exportedAt) || existing?.exportedAt,
    exportedBy: cleanString(record.exportedBy) || existing?.exportedBy,
    exportCount:
      typeof record.exportCount === "number" && Number.isFinite(record.exportCount)
        ? Math.max(0, Math.round(record.exportCount))
        : existing?.exportCount || 0,
    lastExportFormat: record.lastExportFormat || existing?.lastExportFormat,
    auditLog: Array.isArray(record.auditLog) ? record.auditLog : existing?.auditLog || [],
    deletedAt: existing?.deletedAt,
    deletedBy: existing?.deletedBy,
    deletionReason: existing?.deletionReason,
    createdAt: existing?.createdAt || timestamp,
    updatedAt: timestamp,
  };

  return saveLifecycleCollection(CLIENT_REPORTS_KEY, normalized, {
    actor:
      normalized.generatedBy ||
      normalized.approvedBy ||
      normalized.exportedBy ||
      "ENCI BuildOS",
  });
}

export function deleteClientReport(
  recordId: string,
  options?: { actor?: string; reason?: string }
) {
  return softDeleteLifecycleCollection(CLIENT_REPORTS_KEY, recordId, options);
}

export function restoreClientReport(
  recordId: string,
  options?: { actor?: string; reason?: string }
) {
  return restoreLifecycleCollection(CLIENT_REPORTS_KEY, recordId, options);
}

export function purgeClientReport(recordId: string) {
  return purgeLifecycleCollection(CLIENT_REPORTS_KEY, recordId);
}

export function loadBuildOsPreferences(): BuildOsPreferences {
  return {
    themeMode: "system",
    fontScale: "default",
    density: "comfortable",
    reducedMotion: false,
    highContrast: false,
    ...readJson<Partial<BuildOsPreferences>>(PREFERENCES_KEY, {}),
  };
}

export function saveBuildOsPreferences(preferences: BuildOsPreferences) {
  writeJson(PREFERENCES_KEY, preferences);
  return preferences;
}

export function loadBuildOsFeatureFlags(): BuildOsFeatureFlags {
  return {
    masterDatabaseLive: true,
    vendorsLive: true,
    tasksLive: true,
    changeOrdersLive: true,
    dailyLogsLive: true,
    deficienciesLive: true,
    clientInvoicesLive: true,
    vendorBillsLive: true,
    licenseCenterLive: true,
    presentationsLive: true,
    videosLive: true,
    clientReportsLive: true,
    ganttBeta: true,
    automationBeta: true,
    mobileTasksBeta: true,
    ...readJson<Partial<BuildOsFeatureFlags>>(FEATURE_FLAGS_KEY, {}),
  };
}

export function saveBuildOsFeatureFlags(flags: BuildOsFeatureFlags) {
  writeJson(FEATURE_FLAGS_KEY, flags);
  return flags;
}

export function loadBuildOsTenantProfile(): BuildOsTenantProfile {
  return {
    organizationName: "Estate Nest Capital Inc.",
    subscriptionStatus: "Active",
    planTier: "Internal",
    trial: false,
    activeSeats: 5,
    accountStatus: "Active",
    adminNotes: "Internal operating environment for ENCI BuildOS.",
    usageAuditLog: "Manual audit tracking only in this phase.",
    featureAccess: [
      "Project Registry",
      "Project Tasks",
      "Gantt Chart",
      "Budget & Costs",
      "Documents",
      "Compliance",
      "Reports",
      "Analytics",
      "Warranty Reminder",
      "Master Database",
      "Change Orders",
      "Daily Log",
      "Deficiency Punch List",
      "Client Invoices",
      "Vendor Bills",
      "Automation Center",
      "Mobile Tasks",
      "License Center",
      "Presentations",
      "Video Library",
      "Client Reports",
    ],
    updatedAt: nowIso(),
    ...readJson<Partial<BuildOsTenantProfile>>(TENANT_PROFILE_KEY, {}),
  };
}

export function saveBuildOsTenantProfile(profile: BuildOsTenantProfile) {
  const normalized = {
    ...profile,
    updatedAt: nowIso(),
  };
  writeJson(TENANT_PROFILE_KEY, normalized);
  return normalized;
}

export function loadBuildOsAutomationSettings(): BuildOsAutomationSettings {
  return {
    overdueTasks: true,
    delayedMilestones: true,
    budgetThresholdExceeded: true,
    overdueClientInvoices: true,
    unpaidVendorBills: true,
    staleChangeOrders: true,
    unresolvedDeficiencies: true,
    missingRequiredDocuments: true,
    expiringInsuranceOrLicense: true,
    budgetVarianceThreshold: 85,
    updatedAt: nowIso(),
    ...readJson<Partial<BuildOsAutomationSettings>>(AUTOMATION_SETTINGS_KEY, {}),
  };
}

export function saveBuildOsAutomationSettings(settings: BuildOsAutomationSettings) {
  const normalized = {
    ...settings,
    budgetVarianceThreshold: Math.min(100, Math.max(50, Math.round(settings.budgetVarianceThreshold))),
    updatedAt: nowIso(),
  };
  writeJson(AUTOMATION_SETTINGS_KEY, normalized);
  return normalized;
}

export function getLinkedProjectRecords(
  records: BuildOsMasterRecord[],
  projectId: string
) {
  return records.filter((record) => record.linkedProjectIds.includes(projectId));
}

export function buildProjectLabelMap(projects: ManagementProject[]) {
  return new Map(projects.map((project) => [project.id, project.project_name]));
}
