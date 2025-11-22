"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { AppShell } from "@/components/layout/AppShell";
import { Loader } from "@/components/ui/Loader";
import { cn } from "@/lib/utils";

interface SettingRow {
    id: string;
    key: string;
    value: any;
    description?: string | null;
}

export default function AdminSettingsPage() {
    const [settings, setSettings] = useState<SettingRow[]>([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [updatingId, setUpdatingId] = useState<string | null>(null);

    const supabase = createClient();

    useEffect(() => {
        fetchSettings();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const fetchSettings = async () => {
        try {
            const { data, error } = await supabase
                .from("system_settings")
                .select("*")
                .order("key");

            if (error) throw error;
            setSettings((data as SettingRow[]) || []);
        } catch (error) {
            console.error("Error fetching settings:", error);
            toast.error("Falha ao carregar as configurações");
        } finally {
            setLoading(false);
        }
    };

    const handleUpdate = async (id: string, rawValue: string) => {
        setSaving(true);
        setUpdatingId(id);
        try {
            let parsedValue: any = rawValue;
            try {
                parsedValue = JSON.parse(rawValue);
            } catch {
                // Keep as string if not JSON
            }

            const { error } = await supabase
                .from("system_settings")
                .update({ value: parsedValue, updated_at: new Date().toISOString() })
                .eq("id", id);

            if (error) throw error;
            toast.success("Configuração atualizada");
            fetchSettings();
        } catch (error) {
            console.error("Error updating setting:", error);
            toast.error("Não foi possível atualizar");
        } finally {
            setSaving(false);
            setUpdatingId(null);
        }
    };

    return (
        <AppShell>
            <div className="p-6 space-y-4">
                <div className="flex flex-col gap-1">
                    <h1 className="text-2xl font-bold text-slate-100">Configurações do Sistema</h1>
                    <p className="text-sm text-slate-400">Parâmetros globais e comportamento do SmartLab.</p>
                </div>

                {loading ? (
                    <Card className="bg-slate-900/70 border-slate-800">
                        <CardContent className="py-8">
                            <Loader />
                        </CardContent>
                    </Card>
                ) : (
                    <div className="grid gap-4">
                        {settings.map((setting) => {
                            const valueAsString =
                                typeof setting.value === "object" ? JSON.stringify(setting.value) : setting.value ?? "";
                            const isUpdating = updatingId === setting.id;
                            return (
                                <Card key={setting.id} className="bg-slate-900/70 border-slate-800">
                                    <CardHeader className="pb-3">
                                        <CardTitle className="text-lg font-semibold text-slate-100">{setting.key}</CardTitle>
                                        {setting.description ? (
                                            <CardDescription className="text-slate-400">{setting.description}</CardDescription>
                                        ) : null}
                                    </CardHeader>
                                    <CardContent className="space-y-2">
                                        <Label className="text-slate-300">Valor (texto ou JSON)</Label>
                                        <Input
                                            defaultValue={valueAsString}
                                            onBlur={(e) => handleUpdate(setting.id, e.target.value)}
                                            disabled={saving && isUpdating}
                                            className={cn("bg-slate-950/60 border-slate-800 text-slate-100")}
                                        />
                                        {isUpdating ? (
                                            <p className="text-xs text-emerald-400">Salvando...</p>
                                        ) : (
                                            <p className="text-xs text-slate-500">Saia do campo para salvar.</p>
                                        )}
                                    </CardContent>
                                </Card>
                            );
                        })}
                    </div>
                )}
            </div>
        </AppShell>
    );
}
