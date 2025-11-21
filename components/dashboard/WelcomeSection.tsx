import { Card, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export function WelcomeSection() {
    return (
        <div className="space-y-6">
            <div>
                <p className="text-sm text-muted-foreground">Bem-vindo de volta,</p>
                <h1 className="text-3xl font-bold text-white">Analista!</h1>
                <p className="text-muted-foreground">Aqui está o seu Resumo da Qualidade SmartLab</p>
            </div>

            <div className="grid gap-4 md:grid-cols-3">
                <Card className="bg-slate-900/50 border-slate-800">
                    <CardContent className="p-4">
                        <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Parâmetro</p>
                        <p className="text-2xl font-bold text-white mt-1">Brix</p>
                        <p className="text-xs text-muted-foreground">Todos os SKUs</p>
                    </CardContent>
                </Card>
                <Card className="bg-slate-900/50 border-slate-800">
                    <CardContent className="p-4">
                        <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider leading-tight">Processos<br />Monitorados</p>
                        <p className="text-2xl font-bold text-white mt-1">16</p>
                        <p className="text-xs text-muted-foreground">Últimas 8 leituras</p>
                    </CardContent>
                </Card>
                <Card className="bg-slate-900/50 border-slate-800">
                    <CardContent className="p-4">
                        <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2">Filtro SKU</p>
                        <Select defaultValue="all">
                            <SelectTrigger className="w-full bg-slate-950 border-slate-800 text-white h-9">
                                <SelectValue placeholder="Selecione SKU" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">Todos os SKUs</SelectItem>
                                <SelectItem value="sku1">SKU 1</SelectItem>
                                <SelectItem value="sku2">SKU 2</SelectItem>
                            </SelectContent>
                        </Select>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
