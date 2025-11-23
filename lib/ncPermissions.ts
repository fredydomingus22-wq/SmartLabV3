import { createClient } from "@/lib/supabase/client";

export type NcRole = "qa_supervisor" | "plant_manager" | "lab_tech" | "auditor_readonly" | "admin";

// Map existing profile roles to NCM semantic roles
const roleMap: Record<string, NcRole> = {
    admin: "admin",
    manager: "plant_manager",
    supervisor: "qa_supervisor",
    technician: "lab_tech",
    auditor: "auditor_readonly",
};

const permissions: Record<NcRole, string[]> = {
    admin: ["create", "update", "approve", "escalate", "comment", "upload", "close"],
    qa_supervisor: ["create", "update", "approve", "escalate", "comment", "upload", "close"],
    plant_manager: ["approve", "comment", "close"],
    lab_tech: ["create", "comment", "upload"],
    auditor_readonly: ["comment"],
};

export async function getNcRole(): Promise<NcRole | null> {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return null;

    const { data: profile } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", user.id)
        .single();

    if (!profile?.role) return null;
    return roleMap[profile.role] ?? null;
}

export function canPerformNcAction(role: NcRole | null, action: string): boolean {
    if (!role) return false;
    if (role === "admin") return true;
    return permissions[role]?.includes(action) ?? false;
}
