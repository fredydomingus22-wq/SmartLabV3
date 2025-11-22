-- Update target_module check constraint to include all modules
ALTER TABLE public.form_templates DROP CONSTRAINT IF EXISTS form_templates_target_module_check;

ALTER TABLE public.form_templates ADD CONSTRAINT form_templates_target_module_check CHECK (target_module IN (
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
));
