-- Add ON DELETE CASCADE to form_submissions.template_id
ALTER TABLE public.form_submissions
DROP CONSTRAINT form_submissions_template_id_fkey,
ADD CONSTRAINT form_submissions_template_id_fkey
  FOREIGN KEY (template_id)
  REFERENCES public.form_templates(id)
  ON DELETE CASCADE;
