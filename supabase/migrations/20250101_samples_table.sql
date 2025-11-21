-- SAMPLES
create table public.samples (
  id uuid default uuid_generate_v4() primary key,
  code text unique not null, -- e.g., SMP-2024-001
  type text not null check (type in ('raw_material', 'intermediate', 'finished_product', 'environment')),
  
  -- Link to source (Polymorphic-ish)
  raw_material_lot_id uuid references public.raw_material_lots(id),
  production_lot_id uuid references public.production_lots(id),
  
  status text default 'pending' check (status in ('pending', 'received', 'in_analysis', 'review', 'approved', 'rejected')),
  priority text default 'normal' check (priority in ('normal', 'urgent')),
  
  collected_by uuid references public.profiles(id),
  collected_at timestamp with time zone default timezone('utc'::text, now()),
  
  received_by uuid references public.profiles(id),
  received_at timestamp with time zone,
  
  notes text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Link Lab Tests to Samples
alter table public.lab_tests 
add column if not exists sample_id uuid references public.samples(id);

create index idx_samples_status on public.samples(status);
create index idx_samples_code on public.samples(code);
