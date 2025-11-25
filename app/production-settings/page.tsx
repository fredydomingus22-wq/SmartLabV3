"use client"

import { AppShell } from "@/components/layout/AppShell";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { LinesManager } from "./components/LinesManager";
import { TanksManager } from "./components/TanksManager";
import { ShiftsManager } from "./components/ShiftsManager";
import { Settings, Factory, Container, Clock } from "lucide-react";

export default function ProductionSettingsPage() {
    return (
        <AppShell>
            <div className="p-6 space-y-6">
                <SectionHeader
                    title="Production Settings"
                    description="Manage production lines, mixing tanks, and work shifts configuration."
                />

                <Tabs defaultValue="lines" className="space-y-4">
                    <TabsList className="grid w-full grid-cols-3 lg:w-[400px]">
                        <TabsTrigger value="lines" className="flex items-center gap-2">
                            <Factory className="h-4 w-4" /> Lines
                        </TabsTrigger>
                        <TabsTrigger value="tanks" className="flex items-center gap-2">
                            <Container className="h-4 w-4" /> Tanks
                        </TabsTrigger>
                        <TabsTrigger value="shifts" className="flex items-center gap-2">
                            <Clock className="h-4 w-4" /> Shifts
                        </TabsTrigger>
                    </TabsList>

                    <TabsContent value="lines">
                        <Card>
                            <CardHeader>
                                <CardTitle>Production Lines</CardTitle>
                                <CardDescription>
                                    Configure production lines available in the factory.
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <LinesManager />
                            </CardContent>
                        </Card>
                    </TabsContent>

                    <TabsContent value="tanks">
                        <Card>
                            <CardHeader>
                                <CardTitle>Mixing Tanks</CardTitle>
                                <CardDescription>
                                    Manage intermediate mixing tanks and their capacities.
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <TanksManager />
                            </CardContent>
                        </Card>
                    </TabsContent>

                    <TabsContent value="shifts">
                        <Card>
                            <CardHeader>
                                <CardTitle>Work Shifts</CardTitle>
                                <CardDescription>
                                    Define work shifts and schedules for production teams.
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <ShiftsManager />
                            </CardContent>
                        </Card>
                    </TabsContent>
                </Tabs>
            </div>
        </AppShell>
    );
}
