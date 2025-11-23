-- Migration: Non-Conformity Management core tables
-- Includes: non_conformities, nc_root_causes, nc_actions, nc_attachments, nc_audit_logs

-- Non-Conformities master
create table if not exists public.non_conformities (
  id uuid primary key default gen_random_uuid(),
  code text unique,
  title text not null,
  description text,
  status text not null check (status in ('open', 'in_progress', 'escalated', 'resolved', 'closed', 'cancelled')) default 'open',
  severity text check (severity in ('low', 'medium', 'high', 'critical')) default 'medium',
  category text,
  deviation_type text,
  detection_source text,
  product_id uuid references public.products(id),
  production_lot_id uuid references public.production_lots(id),
  intermediate_lot_id uuid references public.intermediate_lots(id),
  finished_lot_id uuid references public.finished_lots(id),
  line text,
  shift text,
  opened_by uuid references public.profiles(id),
  owner_id uuid references public.profiles(id),
  qa_supervisor_id uuid references public.profiles(id),
  due_date timestamp with time zone,
  containment_actions text,
  impact text,
  closed_at timestamp with time zone,
  closed_by uuid references public.profiles(id),
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Root causes linked to NC
create table if not exists public.nc_root_causes (
  id uuid primary key default gen_random_uuid(),
  nc_id uuid not null references public.non_conformities(id) on delete cascade,
  method text check (method in ('5_whys', 'ishikawa', 'pareto', 'other')) default '5_whys',
  description text not null,
  contributing_factor text,
  created_by uuid references public.profiles(id),
  verified_by uuid references public.profiles(id),
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- CAPA / actions
create table if not exists public.nc_actions (
  id uuid primary key default gen_random_uuid(),
  nc_id uuid not null references public.non_conformities(id) on delete cascade,
  action_type text check (action_type in ('corrective', 'preventive', 'containment', 'capa')) default 'corrective',
  title text not null,
  description text,
  owner_id uuid references public.profiles(id),
  due_date timestamp with time zone,
  completed_at timestamp with time zone,
  status text check (status in ('open', 'in_progress', 'done', 'overdue', 'cancelled')) default 'open',
  evidence_url text,
  created_by uuid references public.profiles(id),
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Attachments/evidence
create table if not exists public.nc_attachments (
  id uuid primary key default gen_random_uuid(),
  nc_id uuid not null references public.non_conformities(id) on delete cascade,
  file_url text not null,
  file_name text,
  file_type text,
  uploaded_by uuid references public.profiles(id),
  uploaded_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Audit trail scoped to NC
create table if not exists public.nc_audit_logs (
  id uuid primary key default gen_random_uuid(),
  nc_id uuid references public.non_conformities(id) on delete cascade,
  action text not null,
  details jsonb default '{}'::jsonb,
  performed_by uuid references public.profiles(id),
  performed_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Indexes for faster queries
create index if not exists idx_nc_status on public.non_conformities(status);
create index if not exists idx_nc_severity on public.non_conformities(severity);
create index if not exists idx_nc_due_date on public.non_conformities(due_date);
create index if not exists idx_nc_actions_status on public.nc_actions(status, due_date);
create index if not exists idx_nc_actions_owner on public.nc_actions(owner_id);
create index if not exists idx_nc_root_causes_nc on public.nc_root_causes(nc_id);
create index if not exists idx_nc_audit_nc on public.nc_audit_logs(nc_id);

-- Triggers to maintain updated_at
create or replace function public.set_timestamp_updated_at()
returns trigger as $$
begin
  new.updated_at = timezone('utc'::text, now());
  return new;
end;
$$ language plpgsql;

drop trigger if exists trg_non_conformities_updated_at on public.non_conformities;
create trigger trg_non_conformities_updated_at
before update on public.non_conformities
for each row execute function public.set_timestamp_updated_at();

drop trigger if exists trg_nc_root_causes_updated_at on public.nc_root_causes;
create trigger trg_nc_root_causes_updated_at
before update on public.nc_root_causes
for each row execute function public.set_timestamp_updated_at();

drop trigger if exists trg_nc_actions_updated_at on public.nc_actions;
create trigger trg_nc_actions_updated_at
before update on public.nc_actions
for each row execute function public.set_timestamp_updated_at();

-- RLS setup: allow authenticated reads; restrict writes to privileged roles
alter table public.non_conformities enable row level security;
alter table public.nc_root_causes enable row level security;
alter table public.nc_actions enable row level security;
alter table public.nc_attachments enable row level security;
alter table public.nc_audit_logs enable row level security;

create or replace view public.v_nc_privileged_users as
select id from public.profiles where role in ('admin', 'manager', 'supervisor');

do $$
begin
  if not exists (select 1 from pg_policies where tablename = 'non_conformities' and policyname = 'nc_read_all') then
    create policy "nc_read_all" on public.non_conformities for select to authenticated using (true);
  end if;
  if not exists (select 1 from pg_policies where tablename = 'non_conformities' and policyname = 'nc_write_privileged') then
    create policy "nc_write_privileged" on public.non_conformities for all to authenticated using (exists (select 1 from public.v_nc_privileged_users p where p.id = auth.uid())) with check (exists (select 1 from public.v_nc_privileged_users p where p.id = auth.uid()));
  end if;

  if not exists (select 1 from pg_policies where tablename = 'nc_root_causes' and policyname = 'nc_root_read_all') then
    create policy "nc_root_read_all" on public.nc_root_causes for select to authenticated using (true);
  end if;
  if not exists (select 1 from pg_policies where tablename = 'nc_root_causes' and policyname = 'nc_root_write_privileged') then
    create policy "nc_root_write_privileged" on public.nc_root_causes for all to authenticated using (exists (select 1 from public.v_nc_privileged_users p where p.id = auth.uid())) with check (exists (select 1 from public.v_nc_privileged_users p where p.id = auth.uid()));
  end if;

  if not exists (select 1 from pg_policies where tablename = 'nc_actions' and policyname = 'nc_actions_read_all') then
    create policy "nc_actions_read_all" on public.nc_actions for select to authenticated using (true);
  end if;
  if not exists (select 1 from pg_policies where tablename = 'nc_actions' and policyname = 'nc_actions_write_privileged') then
    create policy "nc_actions_write_privileged" on public.nc_actions for all to authenticated using (exists (select 1 from public.v_nc_privileged_users p where p.id = auth.uid())) with check (exists (select 1 from public.v_nc_privileged_users p where p.id = auth.uid()));
  end if;

  if not exists (select 1 from pg_policies where tablename = 'nc_attachments' and policyname = 'nc_attachments_read_all') then
    create policy "nc_attachments_read_all" on public.nc_attachments for select to authenticated using (true);
  end if;
  if not exists (select 1 from pg_policies where tablename = 'nc_attachments' and policyname = 'nc_attachments_write_privileged') then
    create policy "nc_attachments_write_privileged" on public.nc_attachments for all to authenticated using (exists (select 1 from public.v_nc_privileged_users p where p.id = auth.uid())) with check (exists (select 1 from public.v_nc_privileged_users p where p.id = auth.uid()));
  end if;

  if not exists (select 1 from pg_policies where tablename = 'nc_audit_logs' and policyname = 'nc_audit_read_all') then
    create policy "nc_audit_read_all" on public.nc_audit_logs for select to authenticated using (true);
  end if;
  if not exists (select 1 from pg_policies where tablename = 'nc_audit_logs' and policyname = 'nc_audit_write_privileged') then
    create policy "nc_audit_write_privileged" on public.nc_audit_logs for all to authenticated using (exists (select 1 from public.v_nc_privileged_users p where p.id = auth.uid())) with check (exists (select 1 from public.v_nc_privileged_users p where p.id = auth.uid()));
  end if;
end $$;
