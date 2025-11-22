-- Migration: Add missing tables and columns as per implementation plan
-- Run this migration with Supabase CLI

-- Production Lots enhancements
alter table public.production_lots
  add column if not exists factory_id uuid references public.profiles(id),
  add column if not exists production_line text,
  add column if not exists shift text,
  add column if not exists start_time timestamp with time zone,
  add column if not exists end_time timestamp with time zone,
  add column if not exists created_by uuid references public.profiles(id);

-- Intermediate Lots enhancements
alter table public.intermediate_lots
  add column if not exists tank text,
  add column if not exists brix numeric,
  add column if not exists ph numeric,
  add column if not exists acidity numeric,
  add column if not exists ingredients json,
  add column if not exists prepared_at timestamp with time zone,
  add column if not exists status text default 'pending';

-- Finished Lots enhancements
alter table public.finished_lots
  add column if not exists line text,
  add column if not exists co2 numeric,
  add column if not exists brix numeric,
  add column if not exists ph numeric,
  add column if not exists density numeric,
  add column if not exists analyzed_at timestamp with time zone,
  alter column status set default 'quarantine';

-- Parameters enhancements
alter table public.parameters
  add column if not exists method text,
  add column if not exists spec_min numeric,
  add column if not exists spec_target numeric,
  add column if not exists spec_max numeric,
  add column if not exists frequency text;

-- Suppliers enhancements
alter table public.suppliers
  add column if not exists type text,
  add column if not exists auditor_id uuid references public.profiles(id),
  add column if not exists risk_level text check (risk_level in ('low','medium','high')),
  add column if not exists audit_score numeric;

-- Food Safety tables status column
alter table public.food_safety_prp add column if not exists status text default 'active';
alter table public.food_safety_oprp add column if not exists status text default 'active';
alter table public.food_safety_pcc add column if not exists status text default 'active';

-- Equipment enhancements
alter table public.equipment add column if not exists last_calibrated timestamp with time zone;

-- Reagents enhancements
alter table public.reagents add column if not exists unit text, add column if not exists last_used timestamp with time zone;

-- NC (Non-Conformities) enhancements
create table if not exists public.nc (
  id uuid default uuid_generate_v4() primary key,
  code text unique,
  description text,
  status text default 'open',
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.nc
  add column if not exists sample_id uuid references public.samples(id),
  add column if not exists parameter_id uuid references public.parameters(id),
  add column if not exists deviation_type text,
  add column if not exists root_cause text,
  add column if not exists corrective_action text,
  add column if not exists closed_by uuid references public.profiles(id),
  add column if not exists closed_at timestamp with time zone;

-- Lab Analysis table (new)
create table if not exists public.lab_analysis (
  id uuid default uuid_generate_v4() primary key,
  sample_id uuid references public.samples(id),
  parameter_id uuid references public.parameters(id),
  result_value numeric,
  unit text,
  limit_min numeric,
  limit_max numeric,
  analyst_id uuid references public.profiles(id),
  analysis_date timestamp with time zone,
  validation_status text check (validation_status in ('approved','failed','deviation')) default 'approved',
  reviewer_id uuid references public.profiles(id),
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);
