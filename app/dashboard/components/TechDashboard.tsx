"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, ClipboardList, FlaskConical } from "lucide-react";
import { tokens } from "@/components/ui/design-tokens";

export function TechDashboard() {
    return (
        <div className="space-y-6">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {/* Quick Actions */}
                <Card className="bg-slate-900 border-slate-800">
                    <CardHeader>
                        <CardTitle className="text-lg font-medium text-slate-100">Ações Rápidas</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2">
                        <Button className="w-full justify-start" variant="outline">
                            <Plus className="mr-2 h-4 w-4" /> Novo Lote
                        </Button>
                        <Button className="w-full justify-start" variant="outline">
                            <FlaskConical className="mr-2 h-4 w-4" /> Registrar Amostra
                        </Button>
                    </CardContent>
                </Card>

                {/* My Active Tasks */}
                <Card className="bg-slate-900 border-slate-800 col-span-2">
                    <CardHeader>
                        <CardTitle className="text-lg font-medium text-slate-100">Minhas Tarefas Ativas</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            <div className="flex items-center justify-between p-3 rounded-lg bg-slate-800/50 border border-slate-700">
                                <div className="flex items-center gap-3">
                                    <ClipboardList className={`h-5 w-5 text-[${tokens.colors.amber}]`} />
                                    <div>
                                        <p className="text-sm font-medium text-slate-200">Análise de pH - Lote #12345</p>
                                        <p className="text-xs text-slate-400">Pendente há 15 min</p>
                                    </div>
                                </div>
                                <Button size="sm" variant="ghost">Iniciar</Button>
                            </div>
                            <div className="flex items-center justify-between p-3 rounded-lg bg-slate-800/50 border border-slate-700">
                                <div className="flex items-center gap-3">
                                    <FlaskConical className={`h-5 w-5 text-[${tokens.colors.sky}]`} />
                                    <div>
                                        <p className="text-sm font-medium text-slate-200">Coleta de Amostra - Tanque A</p>
                                        <p className="text-xs text-slate-400">Agendado para 14:00</p>
                                    </div>
                                </div>
                                <Button size="sm" variant="ghost">Iniciar</Button>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
