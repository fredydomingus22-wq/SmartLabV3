"use client";

import { useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, Mail, Check, ArrowLeft } from "lucide-react";

export default function ForgotPasswordPage() {
    const supabase = createClient();
    const [email, setEmail] = useState("");
    const [loading, setLoading] = useState(false);
    const [errorMsg, setErrorMsg] = useState<string | null>(null);
    const [successMsg, setSuccessMsg] = useState<string | null>(null);

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setErrorMsg(null);
        setSuccessMsg(null);
        setLoading(true);

        try {
            const redirectTo =
                typeof window !== "undefined"
                    ? `${window.location.origin}/auth/callback?next=/reset-password`
                    : undefined;

            const { error } = await supabase.auth.resetPasswordForEmail(email, {
                redirectTo,
            });

            if (error) {
                setErrorMsg(error.message || "Não foi possível enviar o link.");
            } else {
                setSuccessMsg("Enviámos um link de recuperação para o seu email.");
            }
        } catch {
            setErrorMsg("Erro inesperado. Tente novamente.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-white flex items-center justify-center p-4 relative overflow-hidden">
            {/* Animated Background */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-1/4 -left-48 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl animate-pulse" />
                <div className="absolute bottom-1/4 -right-48 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl animate-pulse delay-1000" />
            </div>

            {/* Grid Pattern */}
            <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:72px_72px] [mask-image:radial-gradient(ellipse_at_center,black_20%,transparent_80%)]" />

            <div className="relative z-10 w-full max-w-md">
                {/* Back Button */}
                <Link
                    href="/login"
                    className="inline-flex items-center gap-2 text-sm text-slate-400 hover:text-white mb-6 transition-colors duration-200"
                >
                    <ArrowLeft className="h-4 w-4" />
                    Voltar para login
                </Link>

                {/* Glass Card */}
                <div className="relative group">
                    <div className="absolute -inset-1 bg-gradient-to-r from-emerald-500/20 to-cyan-500/20 rounded-3xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                    <div className="relative bg-white/[0.08] backdrop-blur-2xl rounded-3xl border border-white/10 shadow-2xl overflow-hidden">
                        {/* Header */}
                        <div className="p-8 pb-6 space-y-3 text-center border-b border-white/5">
                            <div className="w-14 h-14 mx-auto rounded-2xl bg-cyan-500/20 flex items-center justify-center">
                                <Mail className="h-7 w-7 text-cyan-400" />
                            </div>
                            <h2 className="text-2xl font-bold tracking-tight">Recuperar Password</h2>
                            <p className="text-sm text-slate-400">
                                Enviaremos um link de recuperação para o seu email
                            </p>
                        </div>

                        {/* Form */}
                        <form onSubmit={handleSubmit} className="p-8 space-y-6">
                            {/* Error Message */}
                            {errorMsg && (
                                <div className="p-4 rounded-2xl bg-red-500/10 border border-red-500/20 backdrop-blur-sm animate-in fade-in slide-in-from-top-2 duration-300">
                                    <p className="text-sm text-red-300 text-center">{errorMsg}</p>
                                </div>
                            )}

                            {/* Success Message */}
                            {successMsg && (
                                <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 backdrop-blur-sm animate-in fade-in slide-in-from-top-2 duration-300">
                                    <div className="flex items-start gap-3">
                                        <div className="flex-shrink-0">
                                            <div className="w-6 h-6 rounded-full bg-emerald-500/20 flex items-center justify-center">
                                                <Check className="h-4 w-4 text-emerald-400" />
                                            </div>
                                        </div>
                                        <div className="flex-1">
                                            <p className="text-sm text-emerald-300 font-medium">{successMsg}</p>
                                            <p className="text-xs text-emerald-400/80 mt-1">
                                                Verifique a sua caixa de entrada e spam
                                            </p>
                                        </div>
                                    </div>
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
                                    disabled={!!successMsg}
                                    className="h-12 bg-white/5 border-white/10 focus:border-cyan-500/50 focus:ring-2 focus:ring-cyan-500/20 rounded-xl text-white placeholder:text-slate-500 transition-all duration-200 disabled:opacity-50"
                                />
                            </div>

                            {/* Submit Button */}
                            <Button
                                type="submit"
                                disabled={loading || !!successMsg}
                                className="w-full h-12 rounded-xl bg-gradient-to-r from-cyan-500 to-emerald-500 hover:from-cyan-600 hover:to-emerald-600 text-white font-semibold shadow-lg shadow-cyan-500/25 hover:shadow-cyan-500/40 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none"
                            >
                                {loading ? (
                                    <div className="flex items-center gap-2">
                                        <Loader2 className="h-4 w-4 animate-spin" />
                                        <span>A enviar...</span>
                                    </div>
                                ) : successMsg ? (
                                    <div className="flex items-center gap-2">
                                        <Check className="h-4 w-4" />
                                        <span>Email Enviado</span>
                                    </div>
                                ) : (
                                    "Enviar Link de Recuperação"
                                )}
                            </Button>
                        </form>
                    </div>
                </div>

                {/* Footer */}
                <p className="mt-6 text-center text-sm text-slate-500">
                    SmartLab Enterprise © 2025
                </p>
            </div>
        </div>
    );
}
