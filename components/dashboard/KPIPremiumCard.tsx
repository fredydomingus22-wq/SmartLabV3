"use client";

import { Skeleton } from "@/components/ui/skeleton";

interface KPIPremiumCardProps {
    title: string;
    value: string;
    subtitle: string;
    icon: React.ReactNode;
    trend?: { value: string; positive: boolean };
    color: "emerald" | "amber" | "red" | "cyan" | "sky";
    loading?: boolean;
}

export function KPIPremiumCard({ title, value, subtitle, icon, trend, color, loading }: KPIPremiumCardProps) {
    const colorClasses = {
        emerald: "from-emerald-500/20 to-emerald-500/5 border-emerald-500/20 text-emerald-400",
        amber: "from-amber-500/20 to-amber-500/5 border-amber-500/20 text-amber-400",
        red: "from-red-500/20 to-red-500/5 border-red-500/20 text-red-400",
        cyan: "from-cyan-500/20 to-cyan-500/5 border-cyan-500/20 text-cyan-400",
        sky: "from-sky-500/20 to-sky-500/5 border-sky-500/20 text-sky-400"
    };

    const trendColorClasses = trend?.positive
        ? "text-emerald-400 bg-emerald-500/10"
        : "text-red-400 bg-red-500/10";

    return (
        <div className="relative group">
            {/* Glow Effect */}
            <div className={`absolute -inset-0.5 bg-gradient-to-r ${colorClasses[color]} rounded-2xl blur opacity-0 group-hover:opacity-100 transition-opacity duration-500`} />

            {/* Card Content */}
            <div className="relative bg-white/[0.03] backdrop-blur-xl rounded-2xl border border-white/10 p-6 hover:bg-white/[0.05] transition-all duration-300">
                <div className="flex items-start justify-between mb-4">
                    <div className={`p-3 rounded-xl bg-gradient-to-br ${colorClasses[color]} border`}>
                        {icon}
                    </div>
                    {trend && (
                        <div className={`px-2 py-1 rounded-lg text-xs font-semibold ${trendColorClasses}`}>
                            {trend.value}
                        </div>
                    )}
                </div>

                <div className="space-y-1">
                    {loading ? (
                        <>
                            <Skeleton className="h-8 w-20" />
                            <Skeleton className="h-4 w-32" />
                            <Skeleton className="h-3 w-24" />
                        </>
                    ) : (
                        <>
                            <div className="text-3xl font-bold tracking-tight text-white">
                                {value}
                            </div>
                            <div className="text-sm font-medium text-slate-300">
                                {title}
                            </div>
                            <div className="text-xs text-slate-500">
                                {subtitle}
                            </div>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}
