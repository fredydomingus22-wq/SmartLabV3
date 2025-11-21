import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowUp, ArrowDown } from "lucide-react";

interface KPICardProps {
    title: string;
    value: string | number;
    subtitle: string;
    trend?: {
        value: string;
        direction: "up" | "down";
        label: string;
    };
}

export function KPICard({ title, value, subtitle, trend }: KPICardProps) {
    return (
        <Card className="bg-slate-900/50 border-slate-800">
            <CardHeader className="pb-2">
                <CardTitle className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    {title}
                </CardTitle>
            </CardHeader>
            <CardContent>
                <div className="text-3xl font-bold text-white">{value}</div>
                {trend && (
                    <div className="flex items-center gap-2 mt-2">
                        <span className={`text-sm font-medium ${trend.direction === "up" ? "text-emerald-500" : "text-red-500"}`}>
                            {trend.direction === "up" ? <ArrowUp className="inline h-3 w-3" /> : <ArrowDown className="inline h-3 w-3" />}
                            {trend.value}
                        </span>
                        <span className="text-xs text-muted-foreground">{trend.label}</span>
                    </div>
                )}
                <p className="text-xs text-muted-foreground mt-1">{subtitle}</p>
            </CardContent>
        </Card>
    );
}
