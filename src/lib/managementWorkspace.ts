import type { ManagementProject } from "./managementData";

export type ManagementVendor = {
  id: string;
  company_name?: string | null;
  trade_type?: string | null;
  contact_person?: string | null;
  phone?: string | null;
  email?: string | null;
  website?: string | null;
  wcb_account_number?: string | null;
  gst_number?: string | null;
  insurance_expiry_date?: string | null;
  notes?: string | null;
  vendor_rating?: string | null;
  work_again?: boolean | null;
  internal_notes?: string | null;
  status?: string | null;
};

type ProjectWorkspaceState = {
  deletedIds: string[];
  upserts: ManagementProject[];
};

const PROJECTS_KEY = "enci-management-workspace-projects";
const VENDORS_KEY = "enci-management-workspace-vendors";

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

export function loadProjectWorkspaceState(): ProjectWorkspaceState {
  const state = readJson<ProjectWorkspaceState>(PROJECTS_KEY, {
    deletedIds: [],
    upserts: [],
  });

  return {
    deletedIds: Array.isArray(state.deletedIds) ? state.deletedIds : [],
    upserts: Array.isArray(state.upserts) ? state.upserts : [],
  };
}

export function mergeProjectsWithWorkspace(serverProjects: ManagementProject[]) {
  const workspace = loadProjectWorkspaceState();
  const deletedIds = new Set(workspace.deletedIds);
  const upsertMap = new Map(workspace.upserts.map((project) => [project.id, project]));
  const serverIds = new Set(serverProjects.map((project) => project.id));

  const merged = serverProjects
    .filter((project) => !deletedIds.has(project.id))
    .map((project) => upsertMap.get(project.id) ?? project);

  workspace.upserts.forEach((project) => {
    if (!serverIds.has(project.id) && !deletedIds.has(project.id)) {
      merged.push(project);
    }
  });

  return {
    deletedIds,
    projects: merged,
    serverIds,
    upserts: upsertMap,
    workspace,
  };
}

export function getProjectWorkspaceBadge(
  projectId: string,
  serverIds: Set<string>,
  upserts: Map<string, ManagementProject>
) {
  if (!serverIds.has(projectId)) {
    return "Workspace Draft";
  }

  if (upserts.has(projectId)) {
    return "Workspace Override";
  }

  return "Deployment Record";
}

export function saveProjectToWorkspace(project: Partial<ManagementProject>) {
  const workspace = loadProjectWorkspaceState();
  const normalized: ManagementProject = {
    id: project.id || createId("project"),
    project_name: project.project_name?.trim() || "Untitled Project",
    civic_address: project.civic_address?.trim() || "Address not set",
    status: project.status?.trim() || "Planning",
    estimated_budget: project.estimated_budget,
    selling_price: project.selling_price,
    contracted_revenue: project.contracted_revenue,
    start_date: project.start_date || undefined,
    estimated_end_date: project.estimated_end_date || undefined,
    actual_end_date: project.actual_end_date || undefined,
    legal_land_description: project.legal_land_description?.trim() || undefined,
    warranty_start_date: project.warranty_start_date || undefined,
    zoning_code: project.zoning_code?.trim() || undefined,
    deposit_amount: project.deposit_amount,
    development_permit_pdf: project.development_permit_pdf?.trim() || undefined,
    building_permit_pdf: project.building_permit_pdf?.trim() || undefined,
    real_property_report: project.real_property_report?.trim() || undefined,
    project_owner: project.project_owner?.trim() || undefined,
    project_manager: project.project_manager?.trim() || undefined,
    primary_contact_email: project.primary_contact_email?.trim() || undefined,
    next_milestone: project.next_milestone?.trim() || undefined,
    status_note: project.status_note?.trim() || undefined,
    scope_subject: project.scope_subject?.trim() || undefined,
    scope_summary: project.scope_summary?.trim() || undefined,
    scope_note: project.scope_note?.trim() || undefined,
  };

  const nextUpserts = workspace.upserts.filter((item) => item.id !== normalized.id);
  nextUpserts.push(normalized);

  writeJson(PROJECTS_KEY, {
    deletedIds: workspace.deletedIds.filter((id) => id !== normalized.id),
    upserts: nextUpserts,
  });

  return normalized;
}

export function deleteProjectFromWorkspace(projectId: string, isServerBacked: boolean) {
  const workspace = loadProjectWorkspaceState();
  const nextUpserts = workspace.upserts.filter((item) => item.id !== projectId);
  const nextDeletedIds = isServerBacked
    ? [...new Set([...workspace.deletedIds, projectId])]
    : workspace.deletedIds.filter((id) => id !== projectId);

  writeJson(PROJECTS_KEY, {
    deletedIds: nextDeletedIds,
    upserts: nextUpserts,
  });
}

export function loadWorkspaceVendors() {
  return readJson<ManagementVendor[]>(VENDORS_KEY, []);
}

export function saveVendorToWorkspace(vendor: Partial<ManagementVendor>) {
  const vendors = loadWorkspaceVendors();
  const normalized: ManagementVendor = {
    id: vendor.id || createId("vendor"),
    company_name: vendor.company_name?.trim() || "Unnamed Vendor",
    trade_type: vendor.trade_type?.trim() || null,
    contact_person: vendor.contact_person?.trim() || null,
    phone: vendor.phone?.trim() || null,
    email: vendor.email?.trim() || null,
    website: vendor.website?.trim() || null,
    wcb_account_number: vendor.wcb_account_number?.trim() || null,
    gst_number: vendor.gst_number?.trim() || null,
    insurance_expiry_date: vendor.insurance_expiry_date || null,
    notes: vendor.notes?.trim() || null,
    vendor_rating: vendor.vendor_rating?.trim() || null,
    work_again: typeof vendor.work_again === "boolean" ? vendor.work_again : true,
    internal_notes: vendor.internal_notes?.trim() || null,
    status: vendor.status?.trim() || "Active",
  };

  writeJson(
    VENDORS_KEY,
    [...vendors.filter((item) => item.id !== normalized.id), normalized].sort((left, right) =>
      (left.company_name || "").localeCompare(right.company_name || "")
    )
  );

  return normalized;
}

export function deleteVendorFromWorkspace(vendorId: string) {
  writeJson(
    VENDORS_KEY,
    loadWorkspaceVendors().filter((vendor) => vendor.id !== vendorId)
  );
}
