import { cn } from "@/lib/utils"

interface DataCardProps extends React.HTMLAttributes<HTMLDivElement> {
    title?: string
    subtitle?: string
    action?: React.ReactNode
}

export function DataCard({ title, subtitle, action, children, className, ...props }: DataCardProps) {
    return (
        <div className={cn("rounded-lg border bg-card text-card-foreground shadow-sm", className)} {...props}>
            {(title || subtitle || action) && (
                <div className="flex flex-col space-y-1.5 p-6">
                    <div className="flex items-center justify-between">
                        <div>
                            {title && <h3 className="text-lg font-semibold leading-none tracking-tight">{title}</h3>}
                            {subtitle && <p className="text-sm text-muted-foreground">{subtitle}</p>}
                        </div>
                        {action && <div>{action}</div>}
                    </div>
                </div>
            )}
            <div className="p-6 pt-0">
                {children}
            </div>
        </div>
    )
}
