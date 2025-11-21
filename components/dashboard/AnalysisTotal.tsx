import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export function AnalysisTotal() {
    return (
        <Card className="bg-slate-900/50 border-slate-800 h-full">
            <CardHeader className="pb-2">
                <CardTitle className="text-lg font-bold text-white">Total de Análises</CardTitle>
                <p className="text-sm text-muted-foreground">Últimas 24h</p>
            </CardHeader>
            <CardContent className="space-y-6">
                <Select defaultValue="diario">
                    <SelectTrigger className="w-full bg-slate-950 border-slate-800 text-white">
                        <SelectValue placeholder="Selecione período" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="diario">Diário</SelectItem>
                        <SelectItem value="semanal">Semanal</SelectItem>
                        <SelectItem value="mensal">Mensal</SelectItem>
                    </SelectContent>
                </Select>

                <div>
                    <div className="text-5xl font-bold text-white">148</div>
                    <p className="text-sm text-muted-foreground mt-2">Ensaios sincronizados com LIMS SmartLab.</p>
                </div>
            </CardContent>
        </Card>
    );
}
