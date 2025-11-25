-- Migration: Create audit_log table and triggers for critical tables
-- File: supabase/migrations/2025_11_25_000001_audit_tables.sql

-- Create audit_log table
create table public.audit_log (
    id uuid default uuid_generate_v4() primary key,
    table_name text not null,
    operation text not null check (operation in ('INSERT','UPDATE','DELETE')),
    row_id uuid not null,
    old_data jsonb,
    new_data jsonb,
    performed_by uuid,
    performed_at timestamptz default now()
);

-- Enable row level security for audit_log (only admin can read)
alter table public.audit_log enable row level security;
create policy "admin can select" on public.audit_log for select using (auth.role() = 'admin');

-- Function to insert audit record
create or replace function public.record_audit()
returns trigger language plpgsql as $$
begin
    insert into public.audit_log (
        table_name, operation, row_id, old_data, new_data, performed_by
    ) values (
        TG_TABLE_NAME,
        TG_OP,
        case when TG_OP = 'INSERT' then NEW.id else OLD.id end,
        case when TG_OP = 'INSERT' then null else to_jsonb(OLD) end,
        case when TG_OP = 'DELETE' then null else to_jsonb(NEW) end,
        auth.uid()
    );
    return null;
end;
$$;

-- Attach triggers to critical tables (example tables)
-- Production lots
create trigger audit_production_lots
    after insert or update or delete on public.production_lots
    for each row execute function public.record_audit();

-- Product specs
create trigger audit_product_specs
    after insert or update or delete on public.product_specs
    for each row execute function public.record_audit();

-- Samples
create trigger audit_samples
    after insert or update or delete on public.samples
    for each row execute function public.record_audit();

-- Ensure uuid_generate_v4 extension exists
create extension if not exists "uuid-ossp";
