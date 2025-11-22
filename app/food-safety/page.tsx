import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";
import { ShieldCheck, AlertTriangle, Activity } from "lucide-react";

export default function FoodSafetyPage() {
    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold text-white">Segurança Alimentar</h1>
                <p className="text-muted-foreground">Gestão de PCC, PPRO e PPR</p>
            </div>

            <div className="grid gap-6 md:grid-cols-3">
                <Link href="/food-safety/pcc">
                    <Card className="bg-slate-900/50 border-slate-800 hover:bg-slate-800/50 transition-colors cursor-pointer h-full">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2 text-white">
                                <AlertTriangle className="text-red-500" />
                                PCC
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-sm text-muted-foreground">Pontos Críticos de Controle. Monitoramento contínuo e limites críticos.</p>
                        </CardContent>
                    </Card>
                </Link>

                <Link href="/food-safety/oprp">
                    <Card className="bg-slate-900/50 border-slate-800 hover:bg-slate-800/50 transition-colors cursor-pointer h-full">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2 text-white">
                                <Activity className="text-yellow-500" />
                                PPRO (OPRP)
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-sm text-muted-foreground">Programas de Pré-requisitos Operacionais.</p>
                        </CardContent>
                    </Card>
                </Link>

                <Link href="/food-safety/prp">
                    <Card className="bg-slate-900/50 border-slate-800 hover:bg-slate-800/50 transition-colors cursor-pointer h-full">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2 text-white">
                                <ShieldCheck className="text-emerald-500" />
                                PPR
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-sm text-muted-foreground">Programas de Pré-requisitos básicos e higiene.</p>
                        </CardContent>
                    </Card>
                </Link>
            </div>
        </div>
    );
}
