import { createClient } from "@supabase/supabase-js";
import type { BuildOsModuleName, ManagementSessionUser } from "./managementUsers.js";

type SharedStorageMode = "browser-fallback" | "shared";

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
  action: "delete" | "upsert";
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

export async function listBuildOsRecords<T>(
  module: BuildOsModuleName
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

  return ((data || []) as StoredBuildOsRecord[]).map(
    (record) => record.payload as unknown as T
  );
}

export async function getBuildOsRecord<T>(
  module: BuildOsModuleName,
  recordId: string
): Promise<T | null> {
  const supabase = getSupabaseAdmin();

  if (!supabase) {
    throw new BuildOsStorageError(
      "Shared BuildOS storage is not configured. Add SUPABASE_SERVICE_ROLE_KEY to enable durable shared persistence.",
      503
    );
  }

  const { data, error } = await supabase
    .from(BUILDOS_RECORDS_TABLE)
    .select("payload")
    .eq("workspace_slug", getWorkspaceSlug())
    .eq("module", module)
    .eq("record_id", recordId)
    .maybeSingle();

  if (error) {
    throw new BuildOsStorageError(error.message);
  }

  return (data?.payload as T | undefined) || null;
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

  const now = new Date().toISOString();
  const createdAt =
    typeof options.payload.createdAt === "string" && options.payload.createdAt
      ? options.payload.createdAt
      : now;
  const normalizedPayload = {
    ...options.payload,
    createdAt,
    updatedAt: now,
  };

  const { data, error } = await supabase
    .from(BUILDOS_RECORDS_TABLE)
    .upsert(
      {
        created_at: createdAt,
        created_by: options.actor.username,
        module: options.module,
        payload: normalizedPayload,
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
    payload: normalizedPayload,
    recordId: options.recordId,
  });

  return data.payload as T;
}

export async function deleteBuildOsRecord(options: {
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
    action: "delete",
    actor: options.actor,
    module: options.module,
    recordId: options.recordId,
  });
}
