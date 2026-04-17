import {
  fetchManagementJson,
  type DashboardStatus,
} from "./managementData";
import {
  deleteChangeOrder as deleteLocalChangeOrder,
  deleteClientInvoice as deleteLocalClientInvoice,
  deleteDailyLog as deleteLocalDailyLog,
  deleteDeficiency as deleteLocalDeficiency,
  deleteDocument as deleteLocalDocument,
  deleteMasterDatabaseRecord as deleteLocalMasterDatabaseRecord,
  deleteTask as deleteLocalTask,
  deleteVendorBill as deleteLocalVendorBill,
  getLinkedProjectRecords,
  getProjectParticipantAssignment as getLocalProjectParticipantAssignment,
  BUILDOS_DOCUMENT_TYPES,
  loadBuildOsAutomationSettings as loadLocalAutomationSettings,
  loadBuildOsTenantProfile as loadLocalTenantProfile,
  loadChangeOrders as loadLocalChangeOrders,
  loadClientInvoices as loadLocalClientInvoices,
  loadDailyLogs as loadLocalDailyLogs,
  loadDeficiencies as loadLocalDeficiencies,
  loadDocuments as loadLocalDocuments,
  loadMasterDatabaseRecords as loadLocalMasterDatabaseRecords,
  loadTasks as loadLocalTasks,
  loadVendorBills as loadLocalVendorBills,
  loadProjectParticipantAssignments as loadLocalParticipantAssignments,
  saveBuildOsAutomationSettings as saveLocalAutomationSettings,
  saveBuildOsTenantProfile as saveLocalTenantProfile,
  saveChangeOrder as saveLocalChangeOrder,
  saveClientInvoice as saveLocalClientInvoice,
  saveDailyLog as saveLocalDailyLog,
  saveDeficiency as saveLocalDeficiency,
  saveDocument as saveLocalDocument,
  saveMasterDatabaseRecord as saveLocalMasterDatabaseRecord,
  saveProjectParticipantAssignment as saveLocalParticipantAssignment,
  saveTask as saveLocalTask,
  saveVendorBill as saveLocalVendorBill,
} from "./buildosWorkspace";

export { BUILDOS_DOCUMENT_TYPES, getLinkedProjectRecords };

export type {
  BuildOsDailyLog,
  BuildOsAutomationSettings,
  BuildOsChangeOrder,
  BuildOsClientInvoice,
  BuildOsDeficiency,
  BuildOsDocumentRecord,
  BuildOsMasterRecord,
  BuildOsProjectParticipantAssignment,
  BuildOsTask,
  BuildOsTenantProfile,
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
  | "project-participants"
  | "tasks"
  | "tenant-profile"
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
  fallbackLoader: () => T[]
) {
  try {
    const data = await requestBuildOsJson<BuildOsCollectionResponse<T>>(
      `/api/management/buildos/${module}`
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
  fallbackDelete: (recordId: string) => void
) {
  try {
    const data = await requestBuildOsJson<{ storageMode: BuildOsStorageMode }>(
      `/api/management/buildos/${module}/${recordId}`,
      {
        method: "DELETE",
      }
    );
    setBuildOsStorageMode(data.storageMode);
    return;
  } catch (error) {
    if (!shouldFallback(error)) {
      throw error;
    }

    fallbackDelete(recordId);
    setBuildOsStorageMode("browser-fallback");
  }
}

export async function loadMasterDatabaseRecords() {
  return loadSharedCollection("master-database", loadLocalMasterDatabaseRecords);
}

export async function saveMasterDatabaseRecord(
  record: Parameters<typeof saveLocalMasterDatabaseRecord>[0]
) {
  return saveSharedRecord("master-database", record, saveLocalMasterDatabaseRecord);
}

export async function deleteMasterDatabaseRecord(recordId: string) {
  return deleteSharedRecord(
    "master-database",
    recordId,
    deleteLocalMasterDatabaseRecord
  );
}

export async function loadChangeOrders() {
  return loadSharedCollection("change-orders", loadLocalChangeOrders);
}

export const loadBuildOsChangeOrders = loadChangeOrders;

export async function saveChangeOrder(
  record: Parameters<typeof saveLocalChangeOrder>[0]
) {
  return saveSharedRecord("change-orders", record, saveLocalChangeOrder);
}

export async function deleteChangeOrder(recordId: string) {
  return deleteSharedRecord("change-orders", recordId, deleteLocalChangeOrder);
}

export async function loadDailyLogs() {
  return loadSharedCollection("daily-logs", loadLocalDailyLogs);
}

export const loadBuildOsDailyLogs = loadDailyLogs;

export async function saveDailyLog(record: Parameters<typeof saveLocalDailyLog>[0]) {
  return saveSharedRecord("daily-logs", record, saveLocalDailyLog);
}

export async function deleteDailyLog(recordId: string) {
  return deleteSharedRecord("daily-logs", recordId, deleteLocalDailyLog);
}

export async function loadDeficiencies() {
  return loadSharedCollection("deficiencies", loadLocalDeficiencies);
}

export const loadBuildOsDeficiencies = loadDeficiencies;

export async function saveDeficiency(
  record: Parameters<typeof saveLocalDeficiency>[0]
) {
  return saveSharedRecord("deficiencies", record, saveLocalDeficiency);
}

export async function deleteDeficiency(recordId: string) {
  return deleteSharedRecord("deficiencies", recordId, deleteLocalDeficiency);
}

export async function loadClientInvoices() {
  return loadSharedCollection("client-invoices", loadLocalClientInvoices);
}

export const loadBuildOsClientInvoices = loadClientInvoices;

export async function saveClientInvoice(
  record: Parameters<typeof saveLocalClientInvoice>[0]
) {
  return saveSharedRecord("client-invoices", record, saveLocalClientInvoice);
}

export async function deleteClientInvoice(recordId: string) {
  return deleteSharedRecord("client-invoices", recordId, deleteLocalClientInvoice);
}

export async function loadVendorBills() {
  return loadSharedCollection("vendor-bills", loadLocalVendorBills);
}

export const loadBuildOsVendorBills = loadVendorBills;

export async function saveVendorBill(
  record: Parameters<typeof saveLocalVendorBill>[0]
) {
  return saveSharedRecord("vendor-bills", record, saveLocalVendorBill);
}

export async function deleteVendorBill(recordId: string) {
  return deleteSharedRecord("vendor-bills", recordId, deleteLocalVendorBill);
}

export async function loadDocuments() {
  return loadSharedCollection("documents", loadLocalDocuments);
}

export const loadBuildOsDocuments = loadDocuments;

export async function saveDocument(record: Parameters<typeof saveLocalDocument>[0]) {
  return saveSharedRecord("documents", record, saveLocalDocument);
}

export async function deleteDocument(recordId: string) {
  return deleteSharedRecord("documents", recordId, deleteLocalDocument);
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

export async function loadTasks() {
  return loadSharedCollection("tasks", loadLocalTasks);
}

export const loadBuildOsTasks = loadTasks;

export async function saveTask(record: Parameters<typeof saveLocalTask>[0]) {
  return saveSharedRecord("tasks", record, saveLocalTask);
}

export async function deleteTask(recordId: string) {
  return deleteSharedRecord("tasks", recordId, deleteLocalTask);
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
