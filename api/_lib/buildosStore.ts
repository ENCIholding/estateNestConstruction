import { createClient } from "@supabase/supabase-js";
import type { BuildOsModuleName, ManagementSessionUser } from "./managementUsers.js";

type SharedStorageMode = "browser-fallback" | "shared";
type BuildOsAuditAction = "delete" | "upsert" | "restore" | "purge";

type StoredBuildOsRecord = {
  payload: Record<string, unknown>;
  record_id: string;
};

const BUILDOS_RECORDS_TABLE = "buildos_records";
const BUILDOS_AUDIT_TABLE = "buildos_audit_log";

export class BuildOsStorageError extends Error {
  statusCode: number;

  constructor(message: string, statusCode = 500) {
    super(message);
    this.name = "BuildOsStorageError";
    this.statusCode = statusCode;
  }
}

function getSupabaseUrl() {
  return (
    process.env.SUPABASE_URL ||
    process.env.VITE_SUPABASE_URL ||
    process.env.NEXT_PUBLIC_SUPABASE_URL ||
    ""
  );
}

function getWorkspaceSlug() {
  return process.env.BUILDOS_WORKSPACE_SLUG?.trim() || "estate-nest-capital";
}

function getSupabaseAdmin() {
  const url = getSupabaseUrl();
  const serviceRoleKey =
    process.env.SUPABASE_SERVICE_ROLE_KEY ||
    process.env.SUPABASE_SECRET_API_KEY ||
    process.env.SUPABASE_SECRET_KEY;

  if (!url || !serviceRoleKey) {
    return null;
  }

  return createClient(url, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}

export function getBuildOsStorageMode(): SharedStorageMode {
  return getSupabaseAdmin() ? "shared" : "browser-fallback";
}

export function getBuildOsStorageStatus() {
  const mode = getBuildOsStorageMode();

  return {
    configured: mode === "shared",
    mode,
    provider: mode === "shared" ? "Supabase" : "Browser fallback only",
    workspaceSlug: getWorkspaceSlug(),
  };
}

async function auditRecordMutation(options: {
  action: BuildOsAuditAction;
  actor: ManagementSessionUser;
  module: BuildOsModuleName;
  payload?: Record<string, unknown>;
  recordId: string;
}) {
  const supabase = getSupabaseAdmin();
  if (!supabase) {
    return;
  }

  await supabase.from(BUILDOS_AUDIT_TABLE).insert({
    action: options.action,
    actor_role: options.actor.role,
    actor_username: options.actor.username,
    module: options.module,
    payload: options.payload ?? null,
    record_id: options.recordId,
    workspace_slug: getWorkspaceSlug(),
  });
}

function readExistingAuditLog(payload: Record<string, unknown>) {
  const raw = payload.auditLog;
  return Array.isArray(raw) ? raw : [];
}

function appendPayloadAuditEntry(options: {
  action:
    | "created"
    | "updated"
    | "deleted"
    | "restored"
    | "generated"
    | "reviewed"
    | "approved"
    | "exported";
  actor: string;
  detail: string;
  payload: Record<string, unknown>;
}) {
  return {
    ...options.payload,
    auditLog: [
      ...readExistingAuditLog(options.payload),
      {
        action: options.action,
        actor: options.actor,
        detail: options.detail,
        id: `${options.action}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
        occurredAt: new Date().toISOString(),
      },
    ],
  };
}

function isDeletedPayload(payload: Record<string, unknown>) {
  return typeof payload.deletedAt === "string" && payload.deletedAt.trim().length > 0;
}

async function readStoredRecord(
  module: BuildOsModuleName,
  recordId: string
): Promise<StoredBuildOsRecord | null> {
  const supabase = getSupabaseAdmin();

  if (!supabase) {
    throw new BuildOsStorageError(
      "Shared BuildOS storage is not configured. Add SUPABASE_SERVICE_ROLE_KEY to enable durable shared persistence.",
      503
    );
  }

  const { data, error } = await supabase
    .from(BUILDOS_RECORDS_TABLE)
    .select("record_id,payload")
    .eq("workspace_slug", getWorkspaceSlug())
    .eq("module", module)
    .eq("record_id", recordId)
    .maybeSingle();

  if (error) {
    throw new BuildOsStorageError(error.message);
  }

  return (data as StoredBuildOsRecord | null) || null;
}

export async function listBuildOsRecords<T>(
  module: BuildOsModuleName,
  options?: { includeDeleted?: boolean }
): Promise<T[]> {
  const supabase = getSupabaseAdmin();

  if (!supabase) {
    throw new BuildOsStorageError(
      "Shared BuildOS storage is not configured. Add SUPABASE_SERVICE_ROLE_KEY to enable durable shared persistence.",
      503
    );
  }

  const { data, error } = await supabase
    .from(BUILDOS_RECORDS_TABLE)
    .select("record_id,payload")
    .eq("workspace_slug", getWorkspaceSlug())
    .eq("module", module)
    .order("updated_at", { ascending: false });

  if (error) {
    throw new BuildOsStorageError(error.message);
  }

  return ((data || []) as StoredBuildOsRecord[])
    .map((record) => record.payload as unknown as Record<string, unknown>)
    .filter((payload) => options?.includeDeleted || !isDeletedPayload(payload))
    .map((payload) => payload as unknown as T);
}

export async function getBuildOsRecord<T>(
  module: BuildOsModuleName,
  recordId: string,
  options?: { includeDeleted?: boolean }
): Promise<T | null> {
  const data = await readStoredRecord(module, recordId);
  if (!data) {
    return null;
  }

  if (!options?.includeDeleted && isDeletedPayload(data.payload)) {
    return null;
  }

  return data.payload as T;
}

export async function upsertBuildOsRecord<T extends Record<string, unknown>>(options: {
  actor: ManagementSessionUser;
  module: BuildOsModuleName;
  payload: T;
  recordId: string;
}): Promise<T> {
  const supabase = getSupabaseAdmin();

  if (!supabase) {
    throw new BuildOsStorageError(
      "Shared BuildOS storage is not configured. Add SUPABASE_SERVICE_ROLE_KEY to enable durable shared persistence.",
      503
    );
  }

  const existingRecord = await readStoredRecord(options.module, options.recordId);
  const existingPayload = existingRecord?.payload || {};
  const now = new Date().toISOString();
  const createdAt =
    typeof options.payload.createdAt === "string" && options.payload.createdAt
      ? options.payload.createdAt
      : typeof existingPayload.createdAt === "string" && existingPayload.createdAt
        ? existingPayload.createdAt
        : now;
  const mergedAuditLog = Array.isArray(options.payload.auditLog)
    ? options.payload.auditLog
    : readExistingAuditLog(existingPayload);
  const normalizedPayload = {
    ...existingPayload,
    ...options.payload,
    auditLog: mergedAuditLog,
    createdAt,
    updatedAt: now,
  };
  const payloadWithAudit = appendPayloadAuditEntry({
    action: existingRecord ? "updated" : "created",
    actor: options.actor.username,
    detail: existingRecord
      ? "Record updated through the management workspace."
      : "Record created through the management workspace.",
    payload: normalizedPayload,
  });

  const { data, error } = await supabase
    .from(BUILDOS_RECORDS_TABLE)
    .upsert(
      {
        created_at: createdAt,
        created_by: options.actor.username,
        module: options.module,
        payload: payloadWithAudit,
        record_id: options.recordId,
        updated_at: now,
        updated_by: options.actor.username,
        workspace_slug: getWorkspaceSlug(),
      },
      {
        onConflict: "workspace_slug,module,record_id",
      }
    )
    .select("payload")
    .single();

  if (error) {
    throw new BuildOsStorageError(error.message);
  }

  await auditRecordMutation({
    action: "upsert",
    actor: options.actor,
    module: options.module,
    payload: payloadWithAudit,
    recordId: options.recordId,
  });

  return data.payload as T;
}

export async function deleteBuildOsRecord(options: {
  actor: ManagementSessionUser;
  module: BuildOsModuleName;
  recordId: string;
  reason: string;
}) {
  const supabase = getSupabaseAdmin();

  if (!supabase) {
    throw new BuildOsStorageError(
      "Shared BuildOS storage is not configured. Add SUPABASE_SERVICE_ROLE_KEY to enable durable shared persistence.",
      503
    );
  }

  const existingRecord = await readStoredRecord(options.module, options.recordId);

  if (!existingRecord) {
    throw new BuildOsStorageError("Record not found.", 404);
  }

  const now = new Date().toISOString();
  const payload = appendPayloadAuditEntry({
    action: "deleted",
    actor: options.actor.username,
    detail: `Record archived. Reason: ${options.reason}`,
    payload: {
      ...existingRecord.payload,
      deletedAt: now,
      deletedBy: options.actor.username,
      deletionReason: options.reason,
      updatedAt: now,
    },
  });

  const { error } = await supabase
    .from(BUILDOS_RECORDS_TABLE)
    .upsert(
      {
        created_at:
          typeof existingRecord.payload.createdAt === "string"
            ? existingRecord.payload.createdAt
            : now,
        created_by:
          typeof existingRecord.payload.createdBy === "string"
            ? existingRecord.payload.createdBy
            : options.actor.username,
        module: options.module,
        payload,
        record_id: options.recordId,
        updated_at: now,
        updated_by: options.actor.username,
        workspace_slug: getWorkspaceSlug(),
      },
      {
        onConflict: "workspace_slug,module,record_id",
      }
    );

  if (error) {
    throw new BuildOsStorageError(error.message);
  }

  await auditRecordMutation({
    action: "delete",
    actor: options.actor,
    module: options.module,
    payload,
    recordId: options.recordId,
  });
}

export async function restoreBuildOsRecord(options: {
  actor: ManagementSessionUser;
  module: BuildOsModuleName;
  recordId: string;
}) {
  const supabase = getSupabaseAdmin();

  if (!supabase) {
    throw new BuildOsStorageError(
      "Shared BuildOS storage is not configured. Add SUPABASE_SERVICE_ROLE_KEY to enable durable shared persistence.",
      503
    );
  }

  const existingRecord = await readStoredRecord(options.module, options.recordId);

  if (!existingRecord) {
    throw new BuildOsStorageError("Record not found.", 404);
  }

  const now = new Date().toISOString();
  const basePayload = { ...existingRecord.payload };
  delete basePayload.deletedAt;
  delete basePayload.deletedBy;
  delete basePayload.deletionReason;
  const payload = appendPayloadAuditEntry({
    action: "restored",
    actor: options.actor.username,
    detail: "Record restored for internal review and reuse.",
    payload: {
      ...basePayload,
      updatedAt: now,
    },
  });

  const { error } = await supabase
    .from(BUILDOS_RECORDS_TABLE)
    .upsert(
      {
        created_at:
          typeof existingRecord.payload.createdAt === "string"
            ? existingRecord.payload.createdAt
            : now,
        created_by:
          typeof existingRecord.payload.createdBy === "string"
            ? existingRecord.payload.createdBy
            : options.actor.username,
        module: options.module,
        payload,
        record_id: options.recordId,
        updated_at: now,
        updated_by: options.actor.username,
        workspace_slug: getWorkspaceSlug(),
      },
      {
        onConflict: "workspace_slug,module,record_id",
      }
    );

  if (error) {
    throw new BuildOsStorageError(error.message);
  }

  await auditRecordMutation({
    action: "restore",
    actor: options.actor,
    module: options.module,
    payload,
    recordId: options.recordId,
  });
}

export async function purgeBuildOsRecord(options: {
  actor: ManagementSessionUser;
  module: BuildOsModuleName;
  recordId: string;
}) {
  const supabase = getSupabaseAdmin();

  if (!supabase) {
    throw new BuildOsStorageError(
      "Shared BuildOS storage is not configured. Add SUPABASE_SERVICE_ROLE_KEY to enable durable shared persistence.",
      503
    );
  }

  const existingRecord = await readStoredRecord(options.module, options.recordId);

  if (!existingRecord) {
    throw new BuildOsStorageError("Record not found.", 404);
  }

  const { error } = await supabase
    .from(BUILDOS_RECORDS_TABLE)
    .delete()
    .eq("workspace_slug", getWorkspaceSlug())
    .eq("module", options.module)
    .eq("record_id", options.recordId);

  if (error) {
    throw new BuildOsStorageError(error.message);
  }

  await auditRecordMutation({
    action: "purge",
    actor: options.actor,
    module: options.module,
    payload: existingRecord.payload,
    recordId: options.recordId,
  });
}
