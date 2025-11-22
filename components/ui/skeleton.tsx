import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { cn } from "@/lib/utils";

function Skeleton({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
    return <div className={cn("animate-pulse rounded-md bg-slate-800", className)} {...props} />;
}

interface ChartSkeletonProps {
    height?: string;
    showLegend?: boolean;
}

export function ChartSkeleton({ height = "h-[250px]", showLegend = false }: ChartSkeletonProps) {
    return (
        <Card className="bg-slate-900/50 border-slate-800 animate-pulse">
            <CardHeader className="pb-2">
                <div className="h-5 w-48 bg-slate-800 rounded mb-2" />
                <div className="h-4 w-32 bg-slate-800 rounded" />
            </CardHeader>
            <CardContent>
                {showLegend && (
                    <div className="flex items-center justify-center gap-6 mb-4">
                        <div className="h-3 w-20 bg-slate-800 rounded" />
                        <div className="h-3 w-20 bg-slate-800 rounded" />
                        <div className="h-3 w-20 bg-slate-800 rounded" />
                    </div>
                )}
                <div className={`${height} w-full bg-slate-800 rounded-lg flex items-center justify-center`}>
                    <div className="flex flex-col items-center gap-2">
                        <div className="w-8 h-8 border-4 border-slate-700 border-t-emerald-500 rounded-full animate-spin" />
                        <p className="text-xs text-muted-foreground">Carregando dados...</p>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}

export function KPISkeleton() {
    return (
        <Card className="bg-slate-900/50 border-slate-800 animate-pulse">
            <CardHeader className="pb-2">
                <div className="h-3 w-32 bg-slate-800 rounded" />
            </CardHeader>
            <CardContent>
                <div className="h-8 w-24 bg-slate-800 rounded mb-2" />
                <div className="h-3 w-40 bg-slate-800 rounded" />
            </CardContent>
        </Card>
    );
}

export { Skeleton };
