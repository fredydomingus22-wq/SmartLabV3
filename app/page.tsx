import { AppShell } from "@/components/layout/AppShell";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";

export default function Home() {
    return (
        <AppShell>
            <div className="flex min-h-screen items-center justify-center p-6">
                <Card className="w-full max-w-md">
                    <CardHeader className="text-center">
                        <CardTitle className="text-3xl">SmartLab Enterprise</CardTitle>
                        <CardDescription>Industrial Quality Management System</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <p className="text-sm text-muted-foreground text-center">
                            Sistema integrado de gestão de qualidade, segurança alimentar e análises laboratoriais.
                        </p>
                        <Link href="/dashboard" className="block">
                            <Button className="w-full" size="lg">
                                Aceder ao Dashboard
                            </Button>
                        </Link>
                    </CardContent>
                </Card>
            </div>
        </AppShell>
    );
}
