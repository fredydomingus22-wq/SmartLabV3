import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const alerts = [
    { id: "NC-4587", description: "aguardando microbiologia", type: "critical" },
];

const attentionPoints = [
    { description: "Linha Vidro com variação de CO₂" },
];

export function ShiftNotes() {
    return (
        <Card className="bg-slate-900/50 border-slate-800">
            <CardHeader className="pb-2">
                <CardTitle className="text-lg font-bold text-white">Notas de turno</CardTitle>
                <p className="text-sm text-muted-foreground">Checklist digital</p>
            </CardHeader>
            <CardContent className="space-y-4">
                <div>
                    <p className="text-sm font-medium text-white mb-2">Alertas críticos</p>
                    {alerts.map((alert) => (
                        <div key={alert.id} className="bg-slate-950 border border-slate-800 rounded-lg p-3">
                            <p className="text-sm text-white font-medium">{alert.id} {alert.description}</p>
                        </div>
                    ))}
                </div>
                <div>
                    <p className="text-sm font-medium text-white mb-2">Pontos de atenção</p>
                    {attentionPoints.map((point, idx) => (
                        <div key={idx} className="bg-slate-950 border border-slate-800 rounded-lg p-3">
                            <p className="text-sm text-white">{point.description}</p>
                        </div>
                    ))}
                </div>
                <p className="text-xs text-muted-foreground">Última atualização às 07:45 por Gestor de Qualidade.</p>
            </CardContent>
        </Card>
    );
}
