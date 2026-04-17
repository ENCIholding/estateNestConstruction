-- ENCI BuildOS shared persistence foundation
-- Internal working draft only. Review with database/security owners before production rollout.

create extension if not exists pgcrypto;

create table if not exists public.buildos_records (
  id uuid primary key default gen_random_uuid(),
  workspace_slug text not null,
  module text not null,
  record_id text not null,
  payload jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  created_by text,
  updated_by text,
  constraint buildos_records_workspace_module_record_key unique (workspace_slug, module, record_id)
);

create index if not exists buildos_records_workspace_module_idx
  on public.buildos_records (workspace_slug, module, updated_at desc);

create table if not exists public.buildos_audit_log (
  id uuid primary key default gen_random_uuid(),
  workspace_slug text not null,
  module text not null,
  record_id text not null,
  action text not null check (action in ('upsert', 'delete')),
  actor_username text,
  actor_role text,
  payload jsonb,
  created_at timestamptz not null default timezone('utc', now())
);

create index if not exists buildos_audit_log_workspace_module_idx
  on public.buildos_audit_log (workspace_slug, module, created_at desc);

alter table public.buildos_records enable row level security;
alter table public.buildos_audit_log enable row level security;

drop policy if exists "Service role manages buildos_records" on public.buildos_records;
create policy "Service role manages buildos_records"
  on public.buildos_records
  for all
  using (auth.role() = 'service_role')
  with check (auth.role() = 'service_role');

drop policy if exists "Service role manages buildos_audit_log" on public.buildos_audit_log;
create policy "Service role manages buildos_audit_log"
  on public.buildos_audit_log
  for all
  using (auth.role() = 'service_role')
  with check (auth.role() = 'service_role');

comment on table public.buildos_records is
  'Shared ENCI BuildOS record store keyed by workspace, module, and record id. Payload is module-specific JSON.';

comment on table public.buildos_audit_log is
  'Append-only ENCI BuildOS audit trail for create/update/delete actions captured by the management API.';
