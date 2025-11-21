-- Add COA and Inspection fields to raw_material_lots
alter table public.raw_material_lots 
add column if not exists coa_url text,
add column if not exists inspection_submission_id uuid references public.form_submissions(id),
add column if not exists received_date date default CURRENT_DATE,
add column if not exists quantity numeric,
add column if not exists unit text;

-- Create a default inspection template if not exists (this would usually be done via seed, but good for migration)
-- We will handle template creation in the application logic or a separate seed script.
