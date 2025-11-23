import { createClient } from "@/lib/supabase/client";

export interface Parameter {
    id: string;
    name: string;
    description?: string | null;
    unit?: string;
    category?: string;
    created_at: string;
}

const supabase = createClient();

export async function getParameters(): Promise<Parameter[]> {
    const { data, error } = await supabase
        .from('parameters')
        .select('*')
        .order('name');

    if (error) throw error;
    return data as Parameter[];
}

export async function getParameterById(id: string): Promise<Parameter | null> {
    const { data, error } = await supabase
        .from('parameters')
        .select('*')
        .eq('id', id)
        .single();

    if (error) throw error;
    return data as Parameter;
}
