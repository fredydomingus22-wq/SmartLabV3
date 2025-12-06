import { createClient } from "@/lib/supabase/client";

export interface SampleType {
    id: string;
    code: string;
    name: string;
    description: string | null;
    category: string | null;
    config: any | null;
}

export async function getSampleTypes(): Promise<SampleType[]> {
    const supabase = createClient();

    const { data, error } = await supabase
        .from("sample_types")
        .select("*")
        .order("name", { ascending: true });

    if (error) {
        console.error("Error fetching sample types:", error);
        throw new Error("Failed to fetch sample types");
    }

    return data as SampleType[];
}

export async function getSampleTypeByCode(code: string): Promise<SampleType | null> {
    const supabase = createClient();

    const { data, error } = await supabase
        .from("sample_types")
        .select("*")
        .eq("code", code)
        .single();

    if (error) {
        console.error("Error fetching sample type:", error);
        return null;
    }

    return data as SampleType;
}
