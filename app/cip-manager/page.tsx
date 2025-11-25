"use client"

import { useState, useEffect } from "react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { RecordsManager } from "./components/RecordsManager";
import { EquipmentManager } from "./components/EquipmentManager";
import { Settings, Wrench } from "lucide-react";

export default function CipManagerPage() {
    return (
        <div className="p-6 space-y-6">
            <SectionHeader
                title="CIP Manager"
                description="Registre e acompanhe os processos de limpeza em tanques, linhas e turnos."
            />

            <Tabs defaultValue="records" className="space-y-4">
                <TabsList className="grid w-full grid-cols-2 lg:w-[400px]">
                    <TabsTrigger value="records" className="flex items-center gap-2">
                        <Settings className="h-4 w-4" /> Registros
                    </TabsTrigger>
                    <TabsTrigger value="equipment" className="flex items-center gap-2">
                        <Wrench className="h-4 w-4" /> Equipamentos
                    </TabsTrigger>
                </TabsList>

                <TabsContent value="records">
                    <Card>
                        <CardHeader>
                            <CardTitle>Registros de CIP</CardTitle>
                            <CardDescription>
                                Crie, edite e visualize os registros de limpeza.
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <RecordsManager />
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="equipment">
                    <Card>
                        <CardHeader>
                            <CardTitle>Equipamentos de Produção</CardTitle>
                            <CardDescription>
                                Gerencie os equipamentos que podem ser usados nos passos de CIP.
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <EquipmentManager />
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    );
}
