import { createClient } from "@/lib/supabase/client";

export interface Product {
    id: string;
    name: string;
    code: string;
    sku: string | null;
}

export async function getProducts(): Promise<Product[]> {
    const supabase = createClient();

    const { data, error } = await supabase
        .from("products")
        .select("id, name, code, sku")
        .order("name", { ascending: true });

    if (error) {
        console.error("Error fetching products:", error);
        throw new Error("Failed to fetch products");
    }

    return data as Product[];
}

export async function getProductById(id: string): Promise<Product | null> {
    const supabase = createClient();

    const { data, error } = await supabase
        .from("products")
        .select("id, name, code, sku")
        .eq("id", id)
        .single();

    if (error) {
        console.error("Error fetching product:", error);
        return null;
    }

    return data as Product;
}
