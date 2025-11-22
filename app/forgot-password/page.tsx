"use client";

import { useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

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
                setSuccessMsg("Enviamos um link de redefinição para o seu email.");
            }
        } catch {
            setErrorMsg("Erro inesperado. Tente novamente.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center px-4 py-10">
            <div className="w-full max-w-md">
                <Card className="bg-slate-900/80 border-slate-800 shadow-2xl">
                    <CardHeader className="space-y-1 text-center">
                        <CardTitle className="text-2xl font-bold">Recuperar senha</CardTitle>
                        <CardDescription className="text-slate-400">
                            Enviaremos um link de redefinição para o seu email.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        {errorMsg && (
                            <div className="rounded-lg border border-red-500/40 bg-red-500/10 px-3 py-2 text-sm text-red-200">
                                {errorMsg}
                            </div>
                        )}
                        {successMsg && (
                            <div className="rounded-lg border border-emerald-500/40 bg-emerald-500/10 px-3 py-2 text-sm text-emerald-200">
                                {successMsg}
                            </div>
                        )}
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
                            <Button type="submit" className="w-full" disabled={loading}>
                                {loading ? "Enviando..." : "Enviar link"}
                            </Button>
                        </form>
                        <div className="text-center text-sm text-slate-400">
                            <Link href="/login" className="text-emerald-400 hover:text-emerald-300">
                                Voltar para login
                            </Link>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
