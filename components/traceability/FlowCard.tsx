"use client"

import Link from "next/link";
import { ExternalLink } from "lucide-react";

interface FlowStage {
    id: string;
    code: string;
    name: string;
    description: string;
    color: string;
    icon: string;
    href: string;
}

interface FlowCardProps {
    stage: FlowStage;
    isActive?: boolean;
}

export function FlowCard({ stage, isActive = false }: FlowCardProps) {
    const colors: Record<string, { bg: string; dot: string; hover: string }> = {
        green: { bg: "bg-green-50 dark:bg-green-950/20", dot: "bg-green-500", hover: "hover:border-green-300 dark:hover:border-green-700" },
        blue: { bg: "bg-blue-50 dark:bg-blue-950/20", dot: "bg-blue-500", hover: "hover:border-blue-300 dark:hover:border-blue-700" },
        amber: { bg: "bg-amber-50 dark:bg-amber-950/20", dot: "bg-amber-500", hover: "hover:border-amber-300 dark:hover:border-amber-700" },
        purple: { bg: "bg-purple-50 dark:bg-purple-950/20", dot: "bg-purple-500", hover: "hover:border-purple-300 dark:hover:border-purple-700" },
        red: { bg: "bg-red-50 dark:bg-red-950/20", dot: "bg-red-500", hover: "hover:border-red-300 dark:hover:border-red-700" },
        slate: { bg: "bg-slate-50 dark:bg-slate-950/20", dot: "bg-slate-500", hover: "hover:border-slate-300 dark:hover:border-slate-700" }
    };

    const config = colors[stage.color] || colors.slate;

    return (
        <Link href={stage.href}>
            <div className={`${config.bg} border rounded-xl p-4 min-w-[160px] transition-all hover:shadow-md cursor-pointer group ${config.hover} ${isActive ? 'ring-2 ring-primary' : ''}`}>
                <div className="flex items-center gap-2 mb-2.5">
                    <div className={`w-2 h-2 rounded-full ${config.dot}`}></div>
                    <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">{stage.code}</span>
                    <ExternalLink className="h-3 w-3 ml-auto opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground" />
                </div>
                <h3 className="font-semibold text-sm mb-1">{stage.name}</h3>
                <p className="text-xs text-muted-foreground leading-relaxed">{stage.description}</p>
            </div>
        </Link>
    );
}
