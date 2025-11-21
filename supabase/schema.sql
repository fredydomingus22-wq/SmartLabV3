-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- USERS / ROLES (handled by Supabase Auth, but we add a profile table)
create table public.profiles (
  id uuid references auth.users on delete cascade not null primary key,
  email text,
  role text check (role in ('admin', 'manager', 'supervisor', 'technician', 'auditor')),
  full_name text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- PARAMETERS
create table public.parameters (
  id uuid default uuid_generate_v4() primary key,
  name text not null,
  unit text,
  type text check (type in ('numeric', 'text', 'boolean', 'file')),
  criticality text check (criticality in ('critical', 'major', 'minor')),
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- PRODUCTS
create table public.products (
  id uuid default uuid_generate_v4() primary key,
  name text not null,
  sku text unique not null,
  description text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- SPECIFICATIONS
create table public.specifications (
  id uuid default uuid_generate_v4() primary key,
  product_id uuid references public.products(id),
  parameter_id uuid references public.parameters(id),
  min_value numeric,
  target_value numeric,
  max_value numeric,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- PRODUCTION LOTS
create table public.production_lots (
  id uuid default uuid_generate_v4() primary key,
  code text unique not null,
  product_id uuid references public.products(id),
  status text default 'open',
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- INTERMEDIATE LOTS
create table public.intermediate_lots (
  id uuid default uuid_generate_v4() primary key,
  production_lot_id uuid references public.production_lots(id),
  code text unique not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- FINISHED LOTS
create table public.finished_lots (
  id uuid default uuid_generate_v4() primary key,
  intermediate_lot_id uuid references public.intermediate_lots(id),
  code text unique not null,
  status text default 'quarantine',
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- LAB TESTS / SAMPLES
create table public.lab_tests (
  id uuid default uuid_generate_v4() primary key,
  lot_id uuid, -- Polymorphic or specific FK depending on design, keeping simple for now
  sample_type text,
  status text default 'pending',
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- RAW MATERIALS
create table public.raw_materials (
  id uuid default uuid_generate_v4() primary key,
  name text not null,
  code text unique,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- RAW MATERIAL LOTS
create table public.raw_material_lots (
  id uuid default uuid_generate_v4() primary key,
  raw_material_id uuid references public.raw_materials(id),
  lot_code text not null,
  status text default 'pending',
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- SUPPLIERS
create table public.suppliers (
  id uuid default uuid_generate_v4() primary key,
  name text not null,
  status text default 'active',
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- NC (Non-Conformities)
create table public.nc (
  id uuid default uuid_generate_v4() primary key,
  description text not null,
  severity text check (severity in ('critical', 'major', 'minor')),
  status text default 'open',
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- AUDITS
create table public.audits (
  id uuid default uuid_generate_v4() primary key,
  type text not null,
  auditor_id uuid references public.profiles(id),
  status text default 'planned',
  scheduled_date date,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- TRAININGS
create table public.trainings (
  id uuid default uuid_generate_v4() primary key,
  title text not null,
  date date,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- FOOD SAFETY (PRP, OPRP, PCC)
create table public.food_safety_prp (
  id uuid default uuid_generate_v4() primary key,
  name text not null,
  area text,
  frequency text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

create table public.food_safety_oprp (
  id uuid default uuid_generate_v4() primary key,
  name text not null,
  hazard text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

create table public.food_safety_pcc (
  id uuid default uuid_generate_v4() primary key,
  name text not null,
  critical_limit text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- EQUIPMENT
create table public.equipment (
  id uuid default uuid_generate_v4() primary key,
  name text not null,
  calibration_due date,
  status text default 'active',
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- REAGENTS
create table public.reagents (
  id uuid default uuid_generate_v4() primary key,
  name text not null,
  expiry_date date,
  stock_level numeric,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- ============================================================================
-- FORM BUILDER SYSTEM
-- ============================================================================

-- FORM TEMPLATES
create table public.form_templates (
  id uuid default uuid_generate_v4() primary key,
  name text not null,
  description text,
  category text check (category in ('analysis', 'inspection', 'checklist', 'monitoring')),
  active boolean default true,
  created_by uuid references public.profiles(id),
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- FORM FIELD GROUPS (for repeatable sections)
create table public.form_field_groups (
  id uuid default uuid_generate_v4() primary key,
  template_id uuid references public.form_templates(id) on delete cascade,
  name text not null,
  description text,
  is_repeatable boolean default false,
  min_rows integer default 1,
  max_rows integer,
  order_index integer not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- FORM FIELDS
create table public.form_fields (
  id uuid default uuid_generate_v4() primary key,
  template_id uuid references public.form_templates(id) on delete cascade,
  group_id uuid references public.form_field_groups(id) on delete cascade,
  field_key text not null,
  label text not null,
  field_type text check (field_type in ('text', 'number', 'select', 'checkbox', 'date', 'time', 'datetime', 'file', 'textarea', 'parameter_link')) not null,
  parameter_id uuid references public.parameters(id),
  placeholder text,
  help_text text,
  is_required boolean default false,
  validation_rules jsonb default '{}'::jsonb,
  conditional_logic jsonb default '{}'::jsonb,
  options jsonb default '[]'::jsonb,
  default_value text,
  order_index integer not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  unique(template_id, field_key)
);

-- FORM SUBMISSIONS
create table public.form_submissions (
  id uuid default uuid_generate_v4() primary key,
  template_id uuid references public.form_templates(id),
  entity_type text,
  entity_id uuid,
  submitted_by uuid references public.profiles(id),
  submitted_at timestamp with time zone default timezone('utc'::text, now()) not null,
  data jsonb not null default '{}'::jsonb,
  status text check (status in ('draft', 'submitted', 'approved', 'rejected')) default 'draft',
  approved_by uuid references public.profiles(id),
  approved_at timestamp with time zone,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Create indexes for performance
create index idx_form_fields_template on public.form_fields(template_id);
create index idx_form_fields_group on public.form_fields(group_id);
create index idx_form_fields_parameter on public.form_fields(parameter_id);
create index idx_form_submissions_template on public.form_submissions(template_id);
create index idx_form_submissions_entity on public.form_submissions(entity_type, entity_id);
create index idx_form_submissions_status on public.form_submissions(status);

