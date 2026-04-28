import {
  fetchManagementJson,
  type DashboardStatus,
} from "./managementData";
import {
  deleteClientReport as deleteLocalClientReport,
  deleteChangeOrder as deleteLocalChangeOrder,
  deleteClientInvoice as deleteLocalClientInvoice,
  deleteDailyLog as deleteLocalDailyLog,
  deleteDeficiency as deleteLocalDeficiency,
  deleteDocument as deleteLocalDocument,
  deleteMasterDatabaseRecord as deleteLocalMasterDatabaseRecord,
  deletePresentation as deleteLocalPresentation,
  deleteTask as deleteLocalTask,
  deleteVideo as deleteLocalVideo,
  deleteVendorBill as deleteLocalVendorBill,
  getLinkedProjectRecords,
  getProjectParticipantAssignment as getLocalProjectParticipantAssignment,
  BUILDOS_DOCUMENT_TYPES,
  BUILDOS_PRESENTATION_TYPES,
  BUILDOS_VIDEO_CATEGORIES,
  BUILDOS_VISIBILITY_LEVELS,
  BUILDOS_WORKFLOW_STATUSES,
  loadBuildOsAutomationSettings as loadLocalAutomationSettings,
  loadClientReports as loadLocalClientReports,
  loadBuildOsTenantProfile as loadLocalTenantProfile,
  loadChangeOrders as loadLocalChangeOrders,
  loadClientInvoices as loadLocalClientInvoices,
  loadDailyLogs as loadLocalDailyLogs,
  loadDeficiencies as loadLocalDeficiencies,
  loadDocuments as loadLocalDocuments,
  loadMasterDatabaseRecords as loadLocalMasterDatabaseRecords,
  loadPresentations as loadLocalPresentations,
  loadTasks as loadLocalTasks,
  loadVideos as loadLocalVideos,
  loadVendorBills as loadLocalVendorBills,
  loadProjectParticipantAssignments as loadLocalParticipantAssignments,
  purgeClientReport as purgeLocalClientReport,
  purgeChangeOrder as purgeLocalChangeOrder,
  purgeClientInvoice as purgeLocalClientInvoice,
  purgeDailyLog as purgeLocalDailyLog,
  purgeDeficiency as purgeLocalDeficiency,
  purgeDocument as purgeLocalDocument,
  purgeMasterDatabaseRecord as purgeLocalMasterDatabaseRecord,
  purgePresentation as purgeLocalPresentation,
  purgeTask as purgeLocalTask,
  purgeVideo as purgeLocalVideo,
  purgeVendorBill as purgeLocalVendorBill,
  restoreClientReport as restoreLocalClientReport,
  restoreChangeOrder as restoreLocalChangeOrder,
  restoreClientInvoice as restoreLocalClientInvoice,
  restoreDailyLog as restoreLocalDailyLog,
  restoreDeficiency as restoreLocalDeficiency,
  restoreDocument as restoreLocalDocument,
  restoreMasterDatabaseRecord as restoreLocalMasterDatabaseRecord,
  restorePresentation as restoreLocalPresentation,
  restoreTask as restoreLocalTask,
  restoreVideo as restoreLocalVideo,
  restoreVendorBill as restoreLocalVendorBill,
  saveBuildOsAutomationSettings as saveLocalAutomationSettings,
  saveBuildOsTenantProfile as saveLocalTenantProfile,
  saveClientReport as saveLocalClientReport,
  saveChangeOrder as saveLocalChangeOrder,
  saveClientInvoice as saveLocalClientInvoice,
  saveDailyLog as saveLocalDailyLog,
  saveDeficiency as saveLocalDeficiency,
  saveDocument as saveLocalDocument,
  saveMasterDatabaseRecord as saveLocalMasterDatabaseRecord,
  savePresentation as saveLocalPresentation,
  saveProjectParticipantAssignment as saveLocalParticipantAssignment,
  saveTask as saveLocalTask,
  saveVideo as saveLocalVideo,
  saveVendorBill as saveLocalVendorBill,
} from "./buildosWorkspace";

export {
  BUILDOS_DOCUMENT_TYPES,
  BUILDOS_PRESENTATION_TYPES,
  BUILDOS_VIDEO_CATEGORIES,
  BUILDOS_VISIBILITY_LEVELS,
  BUILDOS_WORKFLOW_STATUSES,
  getLinkedProjectRecords,
};

export type {
  BuildOsDailyLog,
  BuildOsAutomationSettings,
  BuildOsChangeOrder,
  BuildOsClientInvoice,
  BuildOsClientReportRecord,
  BuildOsDeficiency,
  BuildOsDocumentRecord,
  BuildOsMasterRecord,
  BuildOsPresentationRecord,
  BuildOsProjectParticipantAssignment,
  BuildOsTask,
  BuildOsTenantProfile,
  BuildOsVideoRecord,
  BuildOsVendorBill,
} from "./buildosWorkspace";

export type BuildOsStorageMode = "browser-fallback" | "shared";

type BuildOsModuleName =
  | "automation-settings"
  | "change-orders"
  | "client-invoices"
  | "daily-logs"
  | "deficiencies"
  | "documents"
  | "master-database"
  | "presentations"
  | "project-participants"
  | "tasks"
  | "tenant-profile"
  | "videos"
  | "client-reports"
  | "vendor-bills";

type BuildOsCollectionResponse<T> = {
  records: T[];
  storageMode: BuildOsStorageMode;
};

type BuildOsRecordResponse<T> = {
  record: T;
  storageMode: BuildOsStorageMode;
};

type BuildOsRequestError = Error & {
  status?: number;
};

const STORAGE_MODE_KEY = "enci-buildos-storage-mode";

function setBuildOsStorageMode(mode: BuildOsStorageMode) {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.setItem(STORAGE_MODE_KEY, mode);
}

export function getLastKnownBuildOsStorageMode(): BuildOsStorageMode {
  if (typeof window === "undefined") {
    return "browser-fallback";
  }

  const stored = window.localStorage.getItem(STORAGE_MODE_KEY);
  return stored === "shared" ? "shared" : "browser-fallback";
}

function shouldFallback(error: unknown) {
  const status = (error as BuildOsRequestError | undefined)?.status;
  return !status || status === 404 || status === 503 || status >= 500;
}

async function requestBuildOsJson<T>(
  url: string,
  init?: RequestInit
): Promise<T> {
  const response = await fetch(url, {
    cache: "no-store",
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      ...(init?.headers || {}),
    },
    ...init,
  });

  if (!response.ok) {
    const errorBody = await response.json().catch(() => ({}));
    const error = new Error(
      errorBody?.message || `Request failed: ${response.status}`
    ) as BuildOsRequestError;
    error.status = response.status;
    throw error;
  }

  return response.json() as Promise<T>;
}

async function loadSharedCollection<T>(
  module: BuildOsModuleName,
  fallbackLoader: () => T[],
  options?: { includeDeleted?: boolean }
) {
  try {
    const data = await requestBuildOsJson<BuildOsCollectionResponse<T>>(
      `/api/management/buildos/${module}${options?.includeDeleted ? "?includeDeleted=1" : ""}`
    );
    setBuildOsStorageMode(data.storageMode);
    return data.records;
  } catch (error) {
    if (!shouldFallback(error)) {
      throw error;
    }

    setBuildOsStorageMode("browser-fallback");
    return fallbackLoader();
  }
}

async function saveSharedRecord<T extends Record<string, unknown>>(
  module: BuildOsModuleName,
  record: Partial<T>,
  fallbackSaver: (value: Partial<T>) => T
) {
  try {
    const data = await requestBuildOsJson<BuildOsRecordResponse<T>>(
      `/api/management/buildos/${module}`,
      {
        body: JSON.stringify({ record }),
        method: "POST",
      }
    );
    setBuildOsStorageMode(data.storageMode);
    return data.record;
  } catch (error) {
    if (!shouldFallback(error)) {
      throw error;
    }

    setBuildOsStorageMode("browser-fallback");
    return fallbackSaver(record);
  }
}

async function deleteSharedRecord(
  module: BuildOsModuleName,
  recordId: string,
  fallbackDelete: (recordId: string, options?: { actor?: string; reason?: string }) => void,
  options?: { actor?: string; reason?: string }
) {
  const resolvedReason = options?.reason || "Archived through ENCI BuildOS.";
  try {
    const data = await requestBuildOsJson<{ storageMode: BuildOsStorageMode }>(
      `/api/management/buildos/${module}/${recordId}`,
      {
        body: JSON.stringify({ reason: resolvedReason }),
        method: "DELETE",
      }
    );
    setBuildOsStorageMode(data.storageMode);
    return;
  } catch (error) {
    if (!shouldFallback(error)) {
      throw error;
    }

    fallbackDelete(recordId, {
      ...options,
      reason: resolvedReason,
    });
    setBuildOsStorageMode("browser-fallback");
  }
}

async function restoreSharedRecord(
  module: BuildOsModuleName,
  recordId: string,
  fallbackRestore: (recordId: string, options?: { actor?: string; reason?: string }) => void,
  options?: { actor?: string; reason?: string }
) {
  try {
    const data = await requestBuildOsJson<{ storageMode: BuildOsStorageMode }>(
      `/api/management/buildos/${module}/${recordId}`,
      {
        body: JSON.stringify({ action: "restore" }),
        method: "POST",
      }
    );
    setBuildOsStorageMode(data.storageMode);
    return;
  } catch (error) {
    if (!shouldFallback(error)) {
      throw error;
    }

    fallbackRestore(recordId, options);
    setBuildOsStorageMode("browser-fallback");
  }
}

async function purgeSharedRecord(
  module: BuildOsModuleName,
  recordId: string,
  fallbackPurge: (recordId: string) => void
) {
  try {
    const data = await requestBuildOsJson<{ storageMode: BuildOsStorageMode }>(
      `/api/management/buildos/${module}/${recordId}`,
      {
        body: JSON.stringify({ action: "purge" }),
        method: "POST",
      }
    );
    setBuildOsStorageMode(data.storageMode);
    return;
  } catch (error) {
    if (!shouldFallback(error)) {
      throw error;
    }

    fallbackPurge(recordId);
    setBuildOsStorageMode("browser-fallback");
  }
}

export async function loadMasterDatabaseRecords(options?: { includeDeleted?: boolean }) {
  return loadSharedCollection(
    "master-database",
    () => loadLocalMasterDatabaseRecords(options),
    options
  );
}

export async function saveMasterDatabaseRecord(
  record: Parameters<typeof saveLocalMasterDatabaseRecord>[0]
) {
  return saveSharedRecord("master-database", record, saveLocalMasterDatabaseRecord);
}

export async function deleteMasterDatabaseRecord(
  recordId: string,
  options?: { actor?: string; reason?: string }
) {
  return deleteSharedRecord(
    "master-database",
    recordId,
    deleteLocalMasterDatabaseRecord,
    options
  );
}

export async function restoreMasterDatabaseRecord(
  recordId: string,
  options?: { actor?: string; reason?: string }
) {
  return restoreSharedRecord(
    "master-database",
    recordId,
    restoreLocalMasterDatabaseRecord,
    options
  );
}

export async function purgeMasterDatabaseRecord(recordId: string) {
  return purgeSharedRecord("master-database", recordId, purgeLocalMasterDatabaseRecord);
}

export async function loadChangeOrders(options?: { includeDeleted?: boolean }) {
  return loadSharedCollection("change-orders", () => loadLocalChangeOrders(options), options);
}

export const loadBuildOsChangeOrders = loadChangeOrders;

export async function saveChangeOrder(
  record: Parameters<typeof saveLocalChangeOrder>[0]
) {
  return saveSharedRecord("change-orders", record, saveLocalChangeOrder);
}

export async function deleteChangeOrder(
  recordId: string,
  options?: { actor?: string; reason?: string }
) {
  return deleteSharedRecord("change-orders", recordId, deleteLocalChangeOrder, options);
}

export async function restoreChangeOrder(
  recordId: string,
  options?: { actor?: string; reason?: string }
) {
  return restoreSharedRecord("change-orders", recordId, restoreLocalChangeOrder, options);
}

export async function purgeChangeOrder(recordId: string) {
  return purgeSharedRecord("change-orders", recordId, purgeLocalChangeOrder);
}

export async function loadDailyLogs(options?: { includeDeleted?: boolean }) {
  return loadSharedCollection("daily-logs", () => loadLocalDailyLogs(options), options);
}

export const loadBuildOsDailyLogs = loadDailyLogs;

export async function saveDailyLog(record: Parameters<typeof saveLocalDailyLog>[0]) {
  return saveSharedRecord("daily-logs", record, saveLocalDailyLog);
}

export async function deleteDailyLog(
  recordId: string,
  options?: { actor?: string; reason?: string }
) {
  return deleteSharedRecord("daily-logs", recordId, deleteLocalDailyLog, options);
}

export async function restoreDailyLog(
  recordId: string,
  options?: { actor?: string; reason?: string }
) {
  return restoreSharedRecord("daily-logs", recordId, restoreLocalDailyLog, options);
}

export async function purgeDailyLog(recordId: string) {
  return purgeSharedRecord("daily-logs", recordId, purgeLocalDailyLog);
}

export async function loadDeficiencies(options?: { includeDeleted?: boolean }) {
  return loadSharedCollection("deficiencies", () => loadLocalDeficiencies(options), options);
}

export const loadBuildOsDeficiencies = loadDeficiencies;

export async function saveDeficiency(
  record: Parameters<typeof saveLocalDeficiency>[0]
) {
  return saveSharedRecord("deficiencies", record, saveLocalDeficiency);
}

export async function deleteDeficiency(
  recordId: string,
  options?: { actor?: string; reason?: string }
) {
  return deleteSharedRecord("deficiencies", recordId, deleteLocalDeficiency, options);
}

export async function restoreDeficiency(
  recordId: string,
  options?: { actor?: string; reason?: string }
) {
  return restoreSharedRecord("deficiencies", recordId, restoreLocalDeficiency, options);
}

export async function purgeDeficiency(recordId: string) {
  return purgeSharedRecord("deficiencies", recordId, purgeLocalDeficiency);
}

export async function loadClientInvoices(options?: { includeDeleted?: boolean }) {
  return loadSharedCollection(
    "client-invoices",
    () => loadLocalClientInvoices(options),
    options
  );
}

export const loadBuildOsClientInvoices = loadClientInvoices;

export async function saveClientInvoice(
  record: Parameters<typeof saveLocalClientInvoice>[0]
) {
  return saveSharedRecord("client-invoices", record, saveLocalClientInvoice);
}

export async function deleteClientInvoice(
  recordId: string,
  options?: { actor?: string; reason?: string }
) {
  return deleteSharedRecord(
    "client-invoices",
    recordId,
    deleteLocalClientInvoice,
    options
  );
}

export async function restoreClientInvoice(
  recordId: string,
  options?: { actor?: string; reason?: string }
) {
  return restoreSharedRecord(
    "client-invoices",
    recordId,
    restoreLocalClientInvoice,
    options
  );
}

export async function purgeClientInvoice(recordId: string) {
  return purgeSharedRecord("client-invoices", recordId, purgeLocalClientInvoice);
}

export async function loadVendorBills(options?: { includeDeleted?: boolean }) {
  return loadSharedCollection("vendor-bills", () => loadLocalVendorBills(options), options);
}

export const loadBuildOsVendorBills = loadVendorBills;

export async function saveVendorBill(
  record: Parameters<typeof saveLocalVendorBill>[0]
) {
  return saveSharedRecord("vendor-bills", record, saveLocalVendorBill);
}

export async function deleteVendorBill(
  recordId: string,
  options?: { actor?: string; reason?: string }
) {
  return deleteSharedRecord("vendor-bills", recordId, deleteLocalVendorBill, options);
}

export async function restoreVendorBill(
  recordId: string,
  options?: { actor?: string; reason?: string }
) {
  return restoreSharedRecord("vendor-bills", recordId, restoreLocalVendorBill, options);
}

export async function purgeVendorBill(recordId: string) {
  return purgeSharedRecord("vendor-bills", recordId, purgeLocalVendorBill);
}

export async function loadDocuments(options?: { includeDeleted?: boolean }) {
  return loadSharedCollection("documents", () => loadLocalDocuments(options), options);
}

export const loadBuildOsDocuments = loadDocuments;

export async function saveDocument(record: Parameters<typeof saveLocalDocument>[0]) {
  return saveSharedRecord("documents", record, saveLocalDocument);
}

export async function deleteDocument(
  recordId: string,
  options?: { actor?: string; reason?: string }
) {
  return deleteSharedRecord("documents", recordId, deleteLocalDocument, options);
}

export async function restoreDocument(
  recordId: string,
  options?: { actor?: string; reason?: string }
) {
  return restoreSharedRecord("documents", recordId, restoreLocalDocument, options);
}

export async function purgeDocument(recordId: string) {
  return purgeSharedRecord("documents", recordId, purgeLocalDocument);
}

export async function loadPresentations(options?: { includeDeleted?: boolean }) {
  return loadSharedCollection(
    "presentations",
    () => loadLocalPresentations(options),
    options
  );
}

export async function savePresentation(
  record: Parameters<typeof saveLocalPresentation>[0]
) {
  return saveSharedRecord("presentations", record, saveLocalPresentation);
}

export async function deletePresentation(
  recordId: string,
  options?: { actor?: string; reason?: string }
) {
  return deleteSharedRecord("presentations", recordId, deleteLocalPresentation, options);
}

export async function restorePresentation(
  recordId: string,
  options?: { actor?: string; reason?: string }
) {
  return restoreSharedRecord(
    "presentations",
    recordId,
    restoreLocalPresentation,
    options
  );
}

export async function purgePresentation(recordId: string) {
  return purgeSharedRecord("presentations", recordId, purgeLocalPresentation);
}

export async function loadVideos(options?: { includeDeleted?: boolean }) {
  return loadSharedCollection("videos", () => loadLocalVideos(options), options);
}

export async function saveVideo(record: Parameters<typeof saveLocalVideo>[0]) {
  return saveSharedRecord("videos", record, saveLocalVideo);
}

export async function deleteVideo(
  recordId: string,
  options?: { actor?: string; reason?: string }
) {
  return deleteSharedRecord("videos", recordId, deleteLocalVideo, options);
}

export async function restoreVideo(
  recordId: string,
  options?: { actor?: string; reason?: string }
) {
  return restoreSharedRecord("videos", recordId, restoreLocalVideo, options);
}

export async function purgeVideo(recordId: string) {
  return purgeSharedRecord("videos", recordId, purgeLocalVideo);
}

export async function loadClientReports(options?: { includeDeleted?: boolean }) {
  return loadSharedCollection(
    "client-reports",
    () => loadLocalClientReports(options),
    options
  );
}

export async function saveClientReport(
  record: Parameters<typeof saveLocalClientReport>[0]
) {
  return saveSharedRecord("client-reports", record, saveLocalClientReport);
}

export async function deleteClientReport(
  recordId: string,
  options?: { actor?: string; reason?: string }
) {
  return deleteSharedRecord(
    "client-reports",
    recordId,
    deleteLocalClientReport,
    options
  );
}

export async function restoreClientReport(
  recordId: string,
  options?: { actor?: string; reason?: string }
) {
  return restoreSharedRecord(
    "client-reports",
    recordId,
    restoreLocalClientReport,
    options
  );
}

export async function purgeClientReport(recordId: string) {
  return purgeSharedRecord("client-reports", recordId, purgeLocalClientReport);
}

export async function loadProjectParticipantAssignments() {
  return loadSharedCollection(
    "project-participants",
    loadLocalParticipantAssignments
  );
}

export const loadBuildOsProjectParticipantAssignments =
  loadProjectParticipantAssignments;

export async function getProjectParticipantAssignment(projectId: string) {
  const assignments = await loadProjectParticipantAssignments();
  return (
    assignments.find((record) => record.projectId === projectId) ||
    getLocalProjectParticipantAssignment(projectId) ||
    null
  );
}

export async function saveProjectParticipantAssignment(
  record: Parameters<typeof saveLocalParticipantAssignment>[0]
) {
  return saveSharedRecord(
    "project-participants",
    record,
    saveLocalParticipantAssignment
  );
}

export async function loadTasks(options?: { includeDeleted?: boolean }) {
  return loadSharedCollection("tasks", () => loadLocalTasks(options), options);
}

export const loadBuildOsTasks = loadTasks;

export async function saveTask(record: Parameters<typeof saveLocalTask>[0]) {
  return saveSharedRecord("tasks", record, saveLocalTask);
}

export async function deleteTask(
  recordId: string,
  options?: { actor?: string; reason?: string }
) {
  return deleteSharedRecord("tasks", recordId, deleteLocalTask, options);
}

export async function restoreTask(
  recordId: string,
  options?: { actor?: string; reason?: string }
) {
  return restoreSharedRecord("tasks", recordId, restoreLocalTask, options);
}

export async function purgeTask(recordId: string) {
  return purgeSharedRecord("tasks", recordId, purgeLocalTask);
}

export async function loadBuildOsTenantProfile() {
  const records = await loadSharedCollection("tenant-profile", () => [
    loadLocalTenantProfile(),
  ]);
  return records[0] || loadLocalTenantProfile();
}

export async function saveBuildOsTenantProfile(
  record: Parameters<typeof saveLocalTenantProfile>[0]
) {
  return saveSharedRecord("tenant-profile", record, saveLocalTenantProfile);
}

export async function loadBuildOsAutomationSettings() {
  const records = await loadSharedCollection("automation-settings", () => [
    loadLocalAutomationSettings(),
  ]);
  return records[0] || loadLocalAutomationSettings();
}

export async function saveBuildOsAutomationSettings(
  record: Parameters<typeof saveLocalAutomationSettings>[0]
) {
  return saveSharedRecord(
    "automation-settings",
    record,
    saveLocalAutomationSettings
  );
}

export async function fetchBuildOsStorageStatus() {
  const status = await fetchManagementJson<DashboardStatus>("/api/management/status");
  return status.buildOsStorage;
}
