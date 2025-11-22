import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { Button } from "@/components/ui/button";
import { Bell, Settings, User } from "lucide-react";

interface ProfileInfo {
    full_name?: string | null;
    role?: string | null;
}

export async function Header() {
    const supabase = createClient();

    const {
        data: { session },
    } = await supabase.auth.getSession();

    let profile: ProfileInfo | null = null;
    if (session?.user?.id) {
        const { data } = await supabase
            .from("profiles")
            .select("full_name, role")
            .eq("id", session.user.id)
            .single();
        profile = data;
    }

    const greetingTarget = profile?.full_name?.trim() || profile?.role || "Utilizador";

    return (
        <header className="sticky top-0 z-30 border-b border-slate-800 bg-slate-900/80 px-6 py-3 backdrop-blur supports-[backdrop-filter]:backdrop-blur">
            <div className="flex items-center justify-between gap-4">
                <div className="flex flex-col">
                    <span className="text-xs uppercase tracking-[0.2em] text-slate-400">SmartLab Enterprise</span>
                    <span className="text-lg font-semibold text-slate-100">Olá, {greetingTarget}</span>
                </div>
                <div className="flex items-center gap-2">
                    <Button variant="ghost" size="icon" aria-label="Notificações">
                        <Bell className="h-5 w-5 text-slate-200" />
                    </Button>
                    <Button asChild variant="ghost" size="icon" aria-label="Configurações do sistema">
                        <Link href="/admin/settings">
                            <Settings className="h-5 w-5 text-slate-200" />
                        </Link>
                    </Button>
                    <div className="flex items-center gap-2 rounded-full border border-slate-800 bg-slate-800/60 px-3 py-1.5">
                        <div className="h-8 w-8 rounded-full bg-slate-700/80 flex items-center justify-center">
                            <User className="h-4 w-4 text-slate-200" />
                        </div>
                        <div className="flex flex-col leading-tight">
                            <span className="text-sm text-slate-100">{profile?.full_name || "Usuário"}</span>
                            <span className="text-xs text-slate-400">{profile?.role || "—"}</span>
                        </div>
                    </div>
                </div>
            </div>
        </header>
    );
}
