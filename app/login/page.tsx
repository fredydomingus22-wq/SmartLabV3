"use client";

import { useMemo, useState, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2 } from "lucide-react";

function LoginForm() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const supabase = createClient();

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [errorMsg, setErrorMsg] = useState<string | null>(null);

    const isEmailValid = useMemo(() => /\S+@\S+\.\S+/.test(email), [email]);
    const isPasswordValid = password.trim().length >= 6;
    const isFormValid = isEmailValid && isPasswordValid;

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setErrorMsg(null);
        setLoading(true);

        if (!isFormValid) {
            setErrorMsg("Verifique email e password (mínimo 6 caracteres).");
            return;
        }

        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) {
            setErrorMsg(error.message || "Falha no login");
            setLoading(false);
            return;
        }

        // Role-based redirect
        const {
            data: { session },
        } = await supabase.auth.getSession();

        const userId = session?.user?.id;
        let role: string | null = null;
        if (userId) {
            const { data: profile } = await supabase
                .from("profiles")
                .select("role")
                .eq("id", userId)
                .single();
            role = profile?.role ?? null;
        }

        const redirectTo = searchParams.get("redirectTo");
        const roleDestinations: Record<string, string> = {
            admin: "/dashboard",
            manager: "/dashboard",
            supervisor: "/dashboard",
            technician: "/production-lots",
            auditor: "/dashboard",
        };
        const destination = redirectTo || roleDestinations[role ?? ""] || "/dashboard";

        router.push(destination);
    };

    return (
        <div className="min-h-screen bg-slate-950 text-slate-100 flex">
            {/* Painel esquerdo */}
            <div className="hidden lg:flex w-1/2 bg-gradient-to-br from-slate-900 via-slate-950 to-slate-900 items-center justify-center px-14 relative overflow-hidden">
                <div className="pointer-events-none absolute inset-0 opacity-30">
                    <div className="w-full h-full bg-[radial-gradient(circle_at_top,_#22d3ee33,_transparent_55%),radial-gradient(circle_at_bottom,_#10b98133,_transparent_60%)]" />
                </div>
                <div className="relative z-10 max-w-xl space-y-4">
                    <p className="text-xs uppercase tracking-[0.35em] text-slate-400">SmartLab Enterprise</p>
                    <h1 className="text-4xl font-bold tracking-tight">Qualidade em tempo real</h1>
                    <p className="text-slate-300">
                        Monitorização contínua, rastreabilidade completa e auditoria pronta para ISO/FSSC.
                    </p>
                </div>
            </div>

            {/* Painel direito */}
            <div className="flex w-full lg:w-1/2 items-center justify-center px-6 py-10">
                <div className="w-full max-w-md">
                    <Card className="bg-slate-900/80 border-slate-800 shadow-2xl">
                        <CardHeader className="space-y-1 text-center">
                            <CardTitle className="text-2xl font-bold">Login</CardTitle>
                            <CardDescription className="text-slate-400">Acesse o painel de qualidade</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div aria-live="polite" className="min-h-[32px]">
                                {errorMsg && (
                                    <div className="rounded-lg border border-red-500/40 bg-red-500/10 px-3 py-2 text-sm text-red-200">
                                        {errorMsg}
                                    </div>
                                )}
                            </div>
                            <form onSubmit={handleSubmit} className="space-y-5">
                                <div className="space-y-2">
                                    <Label htmlFor="email">Email</Label>
                                    <Input
                                        id="email"
                                        type="email"
                                        placeholder="nome@fabrica.com"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        required
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="password">Password</Label>
                                    <Input
                                        id="password"
                                        type="password"
                                        placeholder="••••••••"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        required
                                    />
                                </div>

                                <div className="flex items-center justify-between text-sm text-slate-300">
                                    <div className="flex items-center gap-2">
                                        <input
                                            type="checkbox"
                                            className="h-4 w-4 rounded border-slate-600 bg-slate-900 text-emerald-400 focus:ring-emerald-500"
                                        />
                                        <span>Lembrar de mim</span>
                                    </div>
                                    <Link href="/forgot-password" className="text-emerald-400 hover:text-emerald-300">
                                        Esqueceu a senha?
                                    </Link>
                                </div>

                                <Button type="submit" className="w-full" disabled={loading || !isFormValid}>
                                    {loading ? (
                                        <span className="inline-flex items-center gap-2">
                                            <Loader2 className="h-4 w-4 animate-spin" />
                                            Entrando...
                                        </span>
                                    ) : (
                                        "Entrar"
                                    )}
                                </Button>
                            </form>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}

export default function LoginPage() {
    return (
        <Suspense fallback={<div className="min-h-screen bg-slate-950 flex items-center justify-center"><Loader2 className="h-8 w-8 animate-spin" /></div>}>
            <LoginForm />
        </Suspense>
    );
}
