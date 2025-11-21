export function Header() {
    return (
        <header className="border-b bg-background px-6 py-3 flex items-center justify-between">
            <h1 className="font-semibold text-lg">SmartLab Enterprise</h1>
            <div className="flex items-center gap-4">
                {/* User menu placeholder */}
                <div className="h-8 w-8 rounded-full bg-muted" />
            </div>
        </header>
    )
}
