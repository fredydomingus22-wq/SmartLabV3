-- Add target_module to form_templates to align with FormModule options
alter table public.form_templates
    add column if not exists target_module text check (target_module in (
        'general',
        'production-lots',
        'intermediate-lots',
        'finished-lots',
        'raw-materials',
        'raw-material-lots',
        'lab-tests',
        'audits',
        'food-safety',
        'traceability',
        'suppliers',
        'trainings',
        'documents',
        'nc',
        'spc'
    )) default 'general';

-- Backfill existing rows to general when null
update public.form_templates
set target_module = 'general'
where target_module is null;
