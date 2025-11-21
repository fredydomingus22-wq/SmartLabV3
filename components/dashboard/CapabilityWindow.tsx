"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const lines = [
    { name: "Linha PET 2", cpk: 1.58, oos: "0.8%" },
    { name: "Linha Lata", cpk: 1.44, oos: "1.6%" },
    { name: "Siropeira A", cpk: 1.32, oos: "2.0%" },
    { name: "Envase Vidro", cpk: 1.19, oos: "3.4%" },
];

export function CapabilityWindow() {
    return (
        <Card className="bg-slate-900/50 border-slate-800">
            <CardHeader className="pb-2">
                <CardTitle className="text-lg font-bold text-white">Janela de Capabilidade</CardTitle>
                <p className="text-sm text-muted-foreground">Cpk real vs taxa de OOS</p>
            </CardHeader>
            <CardContent className="space-y-3">
                {lines.map((line) => (
                    <div key={line.name} className="space-y-1">
                        <div className="flex items-center justify-between">
                            <span className="text-sm text-white">{line.name}</span>
                            <span className="text-sm text-muted-foreground">Cpk {line.cpk}</span>
                        </div>
                        <div className="w-full bg-slate-950 rounded-full h-2 overflow-hidden">
                            <div
                                className="h-full bg-gradient-to-r from-emerald-500 to-emerald-400 rounded-full"
                                style={{ width: `${(line.cpk / 2) * 100}%` }}
                            />
                        </div>
                        <span className="text-xs text-muted-foreground">OOS {line.oos}</span>
                    </div>
                ))}
            </CardContent>
        </Card>
    );
}
