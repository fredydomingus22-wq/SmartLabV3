import { Sidebar } from "./Sidebar";
import { Header } from "./Header";

interface AppShellProps {
    children: React.ReactNode;
}

export function AppShell({ children }: AppShellProps) {
    return (
        <div className="min-h-screen bg-slate-950">
            <Sidebar />
            <div className="ml-64 flex flex-col min-h-screen">
                <Header />
                <main className="flex-1 bg-slate-950">{children}</main>
            </div>
        </div>
    );
}
