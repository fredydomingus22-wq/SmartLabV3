import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function InstantAlerts() {
    return (
        <Card className="h-full bg-slate-900/50 border-slate-800">
            <CardHeader className="pb-2">
                <CardTitle className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Alertas Instantâneos
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="flex items-center justify-between border-b border-slate-800 pb-3 last:border-0 last:pb-0">
                    <div>
                        <p className="text-sm font-medium text-white">NC críticas</p>
                        <p className="text-xs text-muted-foreground">2 aguardando 8D</p>
                    </div>
                    <span className="text-xl font-bold text-emerald-500">3</span>
                </div>
                <div className="flex items-center justify-between border-b border-slate-800 pb-3 last:border-0 last:pb-0">
                    <div>
                        <p className="text-sm font-medium text-white">Auditorias</p>
                        <p className="text-xs text-muted-foreground">1 em campo</p>
                    </div>
                    <span className="text-xl font-bold text-emerald-500">4</span>
                </div>
                <div className="flex items-center justify-between border-b border-slate-800 pb-3 last:border-0 last:pb-0">
                    <div>
                        <p className="text-sm font-medium text-white">Treinamentos</p>
                        <p className="text-xs text-muted-foreground">4 vencem em 7 dias</p>
                    </div>
                    <span className="text-xl font-bold text-emerald-500">11</span>
                </div>
            </CardContent>
        </Card>
    );
}
