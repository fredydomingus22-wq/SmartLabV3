import { createClient } from '@/lib/supabase/client'
import {
    FormTemplate,
    FormField,
    FormFieldGroup,
    FormSubmission,
    FormTemplateWithFields
} from '@/types/form-builder'

const supabase = createClient()

// Form Templates
export async function getFormTemplates(category?: string, targetModule?: string) {
    let query = supabase
        .from('form_templates')
        .select('*')
        .eq('active', true)
        .order('name')

    if (category) {
        query = query.eq('category', category)
    }

    if (targetModule) {
        query = query.eq('target_module', targetModule)
    }

    const { data, error } = await query
    return { data: data as FormTemplate[] | null, error }
}

export async function getFormTemplateById(id: string) {
    const { data, error } = await supabase
        .from('form_templates')
        .select(`
      *,
      fields:form_fields(*),
      groups:form_field_groups(*)
    `)
        .eq('id', id)
        .single()

    return { data: data as FormTemplateWithFields | null, error }
}

export async function createFormTemplate(template: Partial<FormTemplate>) {
    const { data, error } = await supabase
        .from('form_templates')
        .insert(template)
        .select()
        .single()

    return { data: data as FormTemplate | null, error }
}

export async function updateFormTemplate(id: string, updates: Partial<FormTemplate>) {
    const { data, error } = await supabase
        .from('form_templates')
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq('id', id)
        .select()
        .single()

    return { data: data as FormTemplate | null, error }
}

export async function deleteFormTemplate(id: string) {
    const { error } = await supabase
        .from('form_templates')
        .delete()
        .eq('id', id)

    return { error }
}

// Form Fields
export async function getFormFields(templateId: string) {
    const { data, error } = await supabase
        .from('form_fields')
        .select('*, parameter:parameters(*)')
        .eq('template_id', templateId)
        .order('order_index')

    return { data, error }
}

export async function createFormField(field: Partial<FormField>) {
    const { data, error } = await supabase
        .from('form_fields')
        .insert(field)
        .select()
        .single()

    return { data: data as FormField | null, error }
}

export async function updateFormField(id: string, updates: Partial<FormField>) {
    const { data, error } = await supabase
        .from('form_fields')
        .update(updates)
        .eq('id', id)
        .select()
        .single()

    return { data: data as FormField | null, error }
}

export async function deleteFormField(id: string) {
    const { error } = await supabase
        .from('form_fields')
        .delete()
        .eq('id', id)

    return { error }
}

// Form Field Groups
export async function getFormFieldGroups(templateId: string) {
    const { data, error } = await supabase
        .from('form_field_groups')
        .select('*')
        .eq('template_id', templateId)
        .order('order_index')

    return { data: data as FormFieldGroup[] | null, error }
}

export async function createFormFieldGroup(group: Partial<FormFieldGroup>) {
    const { data, error } = await supabase
        .from('form_field_groups')
        .insert(group)
        .select()
        .single()

    return { data: data as FormFieldGroup | null, error }
}

// Form Submissions
export async function createFormSubmission(submission: Partial<FormSubmission>) {
    const { data, error } = await supabase
        .from('form_submissions')
        .insert(submission)
        .select()
        .single()

    return { data: data as FormSubmission | null, error }
}

export async function updateFormSubmission(id: string, updates: Partial<FormSubmission>) {
    const { data, error } = await supabase
        .from('form_submissions')
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq('id', id)
        .select()
        .single()

    return { data: data as FormSubmission | null, error }
}

export async function getFormSubmissions(templateId: string, status?: string) {
    let query = supabase
        .from('form_submissions')
        .select('*')
        .eq('template_id', templateId)
        .order('submitted_at', { ascending: false })

    if (status) {
        query = query.eq('status', status)
    }

    const { data, error } = await query
    return { data: data as FormSubmission[] | null, error }
}

export async function getFormSubmissionById(id: string) {
    const { data, error } = await supabase
        .from('form_submissions')
        .select(`
      *,
      template:form_templates(*),
      submitter:profiles!form_submissions_submitted_by_fkey(*)
    `)
        .eq('id', id)
        .single()

    return { data, error }
}

export async function getFormSubmissionsByEntity(entityType: string, entityId: string) {
    const { data, error } = await supabase
        .from('form_submissions')
        .select('*')
        .eq('entity_type', entityType)
        .eq('entity_id', entityId)
        .order('submitted_at', { ascending: false })

    return { data: data as FormSubmission[] | null, error }
}
