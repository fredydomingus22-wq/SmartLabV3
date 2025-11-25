"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, Check, Lock } from "lucide-react";

export default function ResetPasswordPage() {
    const router = useRouter();
    const supabase = createClient();

    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);

    const passwordValid = password.length >= 6;
    const passwordsMatch = password === confirmPassword && password.length > 0;
    const isFormValid = passwordValid && passwordsMatch;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setLoading(true);

        if (!isFormValid) {
            setError("As passwords devem ter no mínimo 6 caracteres e coincidir");
            setLoading(false);
            return;
        }

        const { error } = await supabase.auth.updateUser({
            password: password,
        });

        if (error) {
            setError(error.message || "Erro ao atualizar password");
            setLoading(false);
        } else {
            setSuccess(true);
            setTimeout(() => {
                router.push("/login");
            }, 2000);
        }
    };

    if (success) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-white flex items-center justify-center p-4">
                <div className="text-center space-y-4">
                    <div className="w-16 h-16 mx-auto rounded-full bg-emerald-500/20 flex items-center justify-center">
                        <Check className="h-8 w-8 text-emerald-400" />
                    </div>
                    <h2 className="text-2xl font-bold">Password Atualizada!</h2>
                    <p className="text-slate-400">A redirecionar para o login...</p>
                </div>
            </div>
        );
    }

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
                {/* Glass Card */}
                <div className="relative group">
                    <div className="absolute -inset-1 bg-gradient-to-r from-emerald-500/20 to-cyan-500/20 rounded-3xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                    <div className="relative bg-white/[0.08] backdrop-blur-2xl rounded-3xl border border-white/10 shadow-2xl overflow-hidden">
                        {/* Header */}
                        <div className="p-8 pb-6 space-y-3 text-center border-b border-white/5">
                            <div className="w-14 h-14 mx-auto rounded-2xl bg-emerald-500/20 flex items-center justify-center">
                                <Lock className="h-7 w-7 text-emerald-400" />
                            </div>
                            <h2 className="text-2xl font-bold tracking-tight">Nova Password</h2>
                            <p className="text-sm text-slate-400">Digite e confirme a sua nova password</p>
                        </div>

                        {/* Form */}
                        <form onSubmit={handleSubmit} className="p-8 space-y-6">
                            {/* Error Message */}
                            {error && (
                                <div className="p-4 rounded-2xl bg-red-500/10 border border-red-500/20 backdrop-blur-sm animate-in fade-in slide-in-from-top-2 duration-300">
                                    <p className="text-sm text-red-300 text-center">{error}</p>
                                </div>
                            )}

                            {/* Password Field */}
                            <div className="space-y-2">
                                <Label htmlFor="password" className="text-sm font-medium text-slate-300">
                                    Nova Password
                                </Label>
                                <Input
                                    id="password"
                                    type="password"
                                    placeholder="••••••••"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required
                                    className="h-12 bg-white/5 border-white/10 focus:border-emerald-500/50 focus:ring-2 focus:ring-emerald-500/20 rounded-xl text-white placeholder:text-slate-500 transition-all duration-200"
                                />
                                {password && (
                                    <p className={`text-xs ${passwordValid ? 'text-emerald-400' : 'text-red-400'}`}>
                                        {passwordValid ? '✓ Pelo menos 6 caracteres' : '✗ Mínimo 6 caracteres'}
                                    </p>
                                )}
                            </div>

                            {/* Confirm Password Field */}
                            <div className="space-y-2">
                                <Label htmlFor="confirmPassword" className="text-sm font-medium text-slate-300">
                                    Confirmar Password
                                </Label>
                                <Input
                                    id="confirmPassword"
                                    type="password"
                                    placeholder="••••••••"
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    required
                                    className="h-12 bg-white/5 border-white/10 focus:border-emerald-500/50 focus:ring-2 focus:ring-emerald-500/20 rounded-xl text-white placeholder:text-slate-500 transition-all duration-200"
                                />
                                {confirmPassword && (
                                    <p className={`text-xs ${passwordsMatch ? 'text-emerald-400' : 'text-red-400'}`}>
                                        {passwordsMatch ? '✓ As passwords coincidem' : '✗ As passwords não coincidem'}
                                    </p>
                                )}
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
                                        <span>A atualizar...</span>
                                    </div>
                                ) : (
                                    "Atualizar Password"
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
