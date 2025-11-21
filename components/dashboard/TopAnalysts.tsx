import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const topAnalysts = [
    { rank: 1, name: "L. Pereira", analyses: 48 },
    { rank: 2, name: "F. Santos", analyses: 44 },
    { rank: 3, name: "C. Braga", analyses: 41 },
];

export function TopAnalysts() {
    return (
        <Card className="bg-slate-900/50 border-slate-800">
            <CardHeader className="pb-2">
                <CardTitle className="text-lg font-bold text-white">Top 3 Analistas – Mês</CardTitle>
                <p className="text-sm text-muted-foreground">Rankeados por análises registradas</p>
            </CardHeader>
            <CardContent className="space-y-4">
                {topAnalysts.map((analyst) => (
                    <div key={analyst.rank} className="flex items-center justify-between border-b border-slate-800 pb-3 last:border-0 last:pb-0">
                        <div className="flex items-center gap-3">
                            <span className="text-sm font-medium text-sky-400">#{analyst.rank}</span>
                            <span className="text-sm font-medium text-white">{analyst.name}</span>
                        </div>
                        <span className="text-sm text-muted-foreground">{analyst.analyses} análises</span>
                    </div>
                ))}
            </CardContent>
        </Card>
    );
}
