"use client";

import { useMemo, useState, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, Sparkles, Shield, TrendingUp } from "lucide-react";

function LoginForm() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const supabase = createClient();

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [errorMsg, setErrorMsg] = useState<string | null>(null);
    const [rememberMe, setRememberMe] = useState(false);

    const isEmailValid = useMemo(() => /\S+@\S+\.\S+/.test(email), [email]);
    const isPasswordValid = password.trim().length >= 6;
    const isFormValid = isEmailValid && isPasswordValid;

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setErrorMsg(null);
        setLoading(true);

        if (!isFormValid) {
            setErrorMsg("Verifique o email e a password (mínimo 6 caracteres)");
            setLoading(false);
            return;
        }

        try {
            const { error } = await supabase.auth.signInWithPassword({
                email,
                password,
            });

            if (error) {
                // Better error messages based on error type
                if (error.message.toLowerCase().includes('fetch') ||
                    error.message.toLowerCase().includes('network')) {
                    setErrorMsg("❌ Erro de conexão. Verifique sua internet ou se o servidor está ativo.");
                } else if (error.message.toLowerCase().includes('invalid') ||
                    error.message.toLowerCase().includes('credentials')) {
                    setErrorMsg("❌ Email ou password incorretos. Verifique e tente novamente.");
                } else if (error.message.toLowerCase().includes('email not confirmed')) {
                    setErrorMsg("❌ Email não confirmado. Verifique sua caixa de entrada.");
                } else {
                    setErrorMsg(`❌ ${error.message}`);
                }
                setLoading(false);
                return;
            }

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
        } catch (err) {
            console.error("Login error:", err);
            setErrorMsg("❌ Erro inesperado ao fazer login. Tente novamente ou contacte o suporte.");
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-white flex items-center justify-center p-4 relative overflow-hidden">
            {/* Animated Background Elements */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-1/4 -left-48 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl animate-pulse" />
                <div className="absolute bottom-1/4 -right-48 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl animate-pulse delay-1000" />
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-to-r from-emerald-500/5 to-cyan-500/5 rounded-full blur-3xl" />
            </div>

            {/* Grid Pattern Overlay */}
            <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:72px_72px] [mask-image:radial-gradient(ellipse_at_center,black_20%,transparent_80%)]" />

            <div className="relative z-10 w-full max-w-[1200px] mx-auto grid lg:grid-cols-2 gap-12 items-center">
                {/* Left Side - Branding */}
                <div className="hidden lg:flex flex-col space-y-8 px-8">
                    <div className="space-y-6">
                        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 backdrop-blur-xl border border-white/10">
                            <Sparkles className="h-4 w-4 text-emerald-400" />
                            <span className="text-sm font-medium tracking-wide">SmartLab Enterprise</span>
                        </div>

                        <h1 className="text-5xl lg:text-6xl font-bold tracking-tight leading-[1.1]">
                            Qualidade em
                            <br />
                            <span className="bg-gradient-to-r from-emerald-400 via-cyan-400 to-emerald-400 bg-clip-text text-transparent animate-gradient">
                                tempo real
                            </span>
                        </h1>

                        <p className="text-lg text-slate-400 leading-relaxed max-w-md">
                            Monitorização contínua, rastreabilidade completa e conformidade ISO/FSSC prontas para auditoria.
                        </p>
                    </div>

                    {/* Feature Pills */}
                    <div className="flex flex-col gap-3">
                        <div className="flex items-center gap-3 p-3 rounded-2xl bg-white/5 backdrop-blur-sm border border-white/10 hover:bg-white/10 transition-all duration-300">
                            <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-emerald-500/20">
                                <Shield className="h-5 w-5 text-emerald-400" />
                            </div>
                            <div>
                                <div className="font-semibold text-sm">Segurança Alimentar</div>
                                <div className="text-xs text-slate-400">HACCP & ISO 22000</div>
                            </div>
                        </div>

                        <div className="flex items-center gap-3 p-3 rounded-2xl bg-white/5 backdrop-blur-sm border border-white/10 hover:bg-white/10 transition-all duration-300">
                            <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-cyan-500/20">
                                <TrendingUp className="h-5 w-5 text-cyan-400" />
                            </div>
                            <div>
                                <div className="font-semibold text-sm">Análise Preditiva</div>
                                <div className="text-xs text-slate-400">SPC & Machine Learning</div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right Side - Login Form */}
                <div className="w-full max-w-md mx-auto lg:mx-0">
                    {/* Glass Card */}
                    <div className="relative group">
                        {/* Glow Effect */}
                        <div className="absolute -inset-1 bg-gradient-to-r from-emerald-500/20 to-cyan-500/20 rounded-3xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                        {/* Main Card */}
                        <div className="relative bg-white/[0.08] backdrop-blur-2xl rounded-3xl border border-white/10 shadow-2xl overflow-hidden">
                            {/* Header */}
                            <div className="p-8 pb-6 space-y-2 text-center border-b border-white/5">
                                <h2 className="text-2xl font-bold tracking-tight">Bem-vindo</h2>
                                <p className="text-sm text-slate-400">Acesse o painel de qualidade</p>
                            </div>

                            {/* Form */}
                            <form onSubmit={handleSubmit} className="p-8 space-y-6">
                                {/* Error Message */}
                                {errorMsg && (
                                    <div className="p-4 rounded-2xl bg-red-500/10 border border-red-500/20 backdrop-blur-sm animate-in fade-in slide-in-from-top-2 duration-300">
                                        <p className="text-sm text-red-300 text-center">{errorMsg}</p>
                                    </div>
                                )}

                                {/* Email Field */}
                                <div className="space-y-2">
                                    <Label htmlFor="email" className="text-sm font-medium text-slate-300">
                                        Email
                                    </Label>
                                    <Input
                                        id="email"
                                        type="email"
                                        placeholder="nome@empresa.com"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        required
                                        className="h-12 bg-white/5 border-white/10 focus:border-emerald-500/50 focus:ring-2 focus:ring-emerald-500/20 rounded-xl text-white placeholder:text-slate-500 transition-all duration-200"
                                    />
                                </div>

                                {/* Password Field */}
                                <div className="space-y-2">
                                    <div className="flex items-center justify-between">
                                        <Label htmlFor="password" className="text-sm font-medium text-slate-300">
                                            Password
                                        </Label>
                                        <Link
                                            href="/forgot-password"
                                            className="text-xs text-emerald-400 hover:text-emerald-300 transition-colors duration-200"
                                        >
                                            Esqueceu?
                                        </Link>
                                    </div>
                                    <Input
                                        id="password"
                                        type="password"
                                        placeholder="••••••••"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        required
                                        className="h-12 bg-white/5 border-white/10 focus:border-emerald-500/50 focus:ring-2 focus:ring-emerald-500/20 rounded-xl text-white placeholder:text-slate-500 transition-all duration-200"
                                    />
                                </div>

                                {/* Remember Me */}
                                <div className="flex items-center gap-2">
                                    <input
                                        type="checkbox"
                                        id="remember"
                                        checked={rememberMe}
                                        onChange={(e) => setRememberMe(e.target.checked)}
                                        className="w-4 h-4 rounded border-white/20 bg-white/5 text-emerald-500 focus:ring-emerald-500/20 transition-colors duration-200 cursor-pointer"
                                    />
                                    <Label htmlFor="remember" className="text-sm text-slate-400 cursor-pointer select-none">
                                        Lembrar de mim
                                    </Label>
                                </div>

                                {/* Submit Button */}
                                <Button
                                    type="submit"
                                    disabled={loading || !isFormValid}
                                    className="w-full h-12 rounded-xl bg-gradient-to-r from-emerald-500 to-cyan-500 hover:from-emerald-600 hover:to-cyan-600 text-white font-semibold shadow-lg shadow-emerald-500/25 hover:shadow-emerald-500/40 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none"
                                >
                                    {loading ? (
                                        <div className="flex items-center gap-2">
                                            <Loader2 className="h-4 w-4 animate-spin" />
                                            <span>A entrar...</span>
                                        </div>
                                    ) : (
                                        "Entrar"
                                    )}
                                </Button>
                            </form>
                        </div>
                    </div>

                    {/* Footer Text - Mobile Only */}
                    <p className="lg:hidden mt-6 text-center text-sm text-slate-500">
                        SmartLab Enterprise © 2025
                    </p>
                </div>
            </div>

            {/* Add custom gradient animation */}
            <style jsx>{`
                @keyframes gradient {
                    0%, 100% { background-position: 0% 50%; }
                    50% { background-position: 100% 50%; }
                }
                .animate-gradient {
                    background-size: 200% auto;
                    animation: gradient 3s ease infinite;
                }
            `}</style>
        </div>
    );
}

export default function LoginPage() {
    return (
        <Suspense fallback={
            <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 flex items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-emerald-400" />
            </div>
        }>
            <LoginForm />
        </Suspense>
    );
}
