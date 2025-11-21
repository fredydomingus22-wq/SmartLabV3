import { cn } from "@/lib/utils"

interface StatusBadgeProps {
    status: string
    className?: string
}

export function StatusBadge({ status, className }: StatusBadgeProps) {
    let colorClass = "bg-slate-500/10 text-slate-500 border-slate-500/20"

    const normalizedStatus = status.toLowerCase()

    if (["approved", "completed", "active", "released", "ok"].includes(normalizedStatus)) {
        colorClass = "bg-emerald-500/10 text-emerald-500 border-emerald-500/20"
    } else if (["pending", "in_progress", "review", "open"].includes(normalizedStatus)) {
        colorClass = "bg-amber-500/10 text-amber-500 border-amber-500/20"
    } else if (["rejected", "blocked", "critical", "failed", "expired"].includes(normalizedStatus)) {
        colorClass = "bg-red-500/10 text-red-500 border-red-500/20"
    } else if (["planned", "scheduled"].includes(normalizedStatus)) {
        colorClass = "bg-sky-500/10 text-sky-500 border-sky-500/20"
    }

    return (
        <span className={cn("inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2", colorClass, className)}>
            {status}
        </span>
    )
}
