"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Bell, Settings, User, LogOut, ChevronDown } from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

interface ProfileInfo {
    full_name?: string | null;
    role?: string | null;
}

export function Header() {
    const supabase = useMemo(() => createClient(), []);
    const router = useRouter();
    const [profile, setProfile] = useState<ProfileInfo | null>(null);

    useEffect(() => {
        let isMounted = true;
        const loadProfile = async () => {
            const {
                data: { session },
            } = await supabase.auth.getSession();

            const userId = session?.user?.id;
            if (!userId) return;

            const { data } = await supabase
                .from("profiles")
                .select("full_name, role")
                .eq("id", userId)
                .single();

            if (isMounted) {
                setProfile(data ?? null);
            }
        };

        loadProfile();
        return () => {
            isMounted = false;
        };
    }, [supabase]);

    const handleLogout = async () => {
        try {
            await supabase.auth.signOut();
            toast.success("Logged out successfully");
            router.push("/login");
        } catch (error) {
            toast.error("Failed to logout");
        }
    };

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

                    {/* User Dropdown with Logout */}
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <button className="flex items-center gap-2 rounded-full border border-slate-800 bg-slate-800/60 px-3 py-1.5 hover:bg-slate-800 transition-colors cursor-pointer">
                                <div className="h-8 w-8 rounded-full bg-slate-700/80 flex items-center justify-center">
                                    <User className="h-4 w-4 text-slate-200" />
                                </div>
                                <div className="flex flex-col leading-tight">
                                    <span className="text-sm text-slate-100">{profile?.full_name || "Usuário"}</span>
                                    <span className="text-xs text-slate-400">{profile?.role || "—"}</span>
                                </div>
                                <ChevronDown className="h-4 w-4 text-slate-400" />
                            </button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-56">
                            <DropdownMenuLabel className="font-normal">
                                <div className="flex flex-col space-y-1">
                                    <p className="text-sm font-medium leading-none">{profile?.full_name || "Utilizador"}</p>
                                    <p className="text-xs leading-none text-muted-foreground capitalize">
                                        {profile?.role || "Member"}
                                    </p>
                                </div>
                            </DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem onClick={handleLogout} className="text-red-400 focus:text-red-400 cursor-pointer">
                                <LogOut className="mr-2 h-4 w-4" />
                                <span>Log out</span>
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            </div>
        </header>
    );
}
