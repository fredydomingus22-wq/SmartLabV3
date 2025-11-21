import { Sidebar } from "./Sidebar"
import { Header } from "./Header"

interface AppShellProps {
    children: React.ReactNode
}

export function AppShell({ children }: AppShellProps) {
    return (
        <div className="flex min-h-screen">
            <Sidebar />
            <div className="flex-1 flex flex-col">
                <Header />
                <main className="flex-1 bg-background">
                    {children}
                </main>
            </div>
        </div>
    )
}
