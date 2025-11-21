import { AppShell } from "@/components/layout/AppShell";

export default function DashboardPage() {
    return (
        <AppShell>
            <div className="p-6">
                <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
                <p className="text-muted-foreground">SmartLab Enterprise Overview</p>
            </div>
        </AppShell>
    )
}
