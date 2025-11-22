-- Migration: Add missing tables for dashboard (Shift Notes, Audits)

-- SHIFT NOTES
create table if not exists public.shift_notes (
  id uuid default uuid_generate_v4() primary key,
  message text not null,
  shift text,
  created_by uuid references public.profiles(id),
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- AUDITS
create table if not exists public.audits (
  id uuid default uuid_generate_v4() primary key,
  supplier_id uuid references public.suppliers(id),
  auditor_id uuid references public.profiles(id),
  scheduled_date date,
  performed_date date,
  status text check (status in ('planned', 'pending', 'completed', 'cancelled')) default 'planned',
  score numeric,
  report_url text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Ensure SAMPLES table exists (if not already created by other migrations)
create table if not exists public.samples (
  id uuid default uuid_generate_v4() primary key,
  code text unique not null,
  type text,
  status text default 'pending',
  collected_at timestamp with time zone,
  analyzed_at timestamp with time zone,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);
