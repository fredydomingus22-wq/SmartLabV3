"use client"

import { AppShell } from "@/components/layout/AppShell";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FlaskConical } from "lucide-react";
import Link from "next/link";

export default function LabTestsPage() {
    // Mock data
    const tests = [
        { id: 'TEST-001', type: 'pH Analysis', status: 'Pending' },
        { id: 'TEST-002', type: 'Microbial Check', status: 'In Progress' },
        { id: 'TEST-003', type: 'Viscosity', status: 'Completed' },
    ];

    return (
        <AppShell>
            <div className="p-6 space-y-6">
                <SectionHeader
                    title="Lab Tests"
                    description="Manage laboratory tests and results"
                />

                <div className="grid gap-4">
                    {tests.map((test) => (
                        <Card key={test.id}>
                            <CardContent className="p-6 flex items-center justify-between">
                                <div>
                                    <h3 className="font-semibold text-lg">{test.type}</h3>
                                    <p className="text-sm text-muted-foreground">ID: {test.id} - {test.status}</p>
                                </div>
                                <Link href={`/shared/forms/lab_test/${test.id}`}>
                                    <Button variant="outline">
                                        <FlaskConical className="mr-2 h-4 w-4" />
                                        Enter Results
                                    </Button>
                                </Link>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            </div>
        </AppShell>
    );
}
