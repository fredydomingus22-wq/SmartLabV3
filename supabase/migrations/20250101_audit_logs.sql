-- AUDIT LOGS
create table public.audit_logs (
  id uuid default uuid_generate_v4() primary key,
  action text not null,
  entity_type text not null,
  entity_id uuid,
  details jsonb,
  performed_by uuid references public.profiles(id),
  performed_at timestamp with time zone default timezone('utc'::text, now()) not null,
  ip_address text
);

create index idx_audit_logs_entity on public.audit_logs(entity_type, entity_id);
create index idx_audit_logs_user on public.audit_logs(performed_by);
