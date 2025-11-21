"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CapabilityIndices } from "@/types/spc";

interface CapabilityDashboardProps {
    capability: CapabilityIndices | null;
}

export function CapabilityDashboard({ capability }: CapabilityDashboardProps) {
    if (!capability) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle>Process Capability</CardTitle>
                </CardHeader>
                <CardContent>
                    <p className="text-muted-foreground">Specification limits not defined.</p>
                </CardContent>
            </Card>
        );
    }

    const getStatusColor = (value: number) => {
        if (value >= 1.33) return "text-green-500";
        if (value >= 1.0) return "text-yellow-500";
        return "text-red-500";
    };

    return (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Card>
                <CardContent className="pt-6 text-center">
                    <div className="text-2xl font-bold">{capability.cp.toFixed(2)}</div>
                    <p className="text-xs text-muted-foreground uppercase mt-1">Cp</p>
                </CardContent>
            </Card>
            <Card>
                <CardContent className="pt-6 text-center">
                    <div className={`text-2xl font-bold ${getStatusColor(capability.cpk)}`}>
                        {capability.cpk.toFixed(2)}
                    </div>
                    <p className="text-xs text-muted-foreground uppercase mt-1">Cpk</p>
                </CardContent>
            </Card>
            <Card>
                <CardContent className="pt-6 text-center">
                    <div className="text-2xl font-bold">{capability.pp.toFixed(2)}</div>
                    <p className="text-xs text-muted-foreground uppercase mt-1">Pp</p>
                </CardContent>
            </Card>
            <Card>
                <CardContent className="pt-6 text-center">
                    <div className={`text-2xl font-bold ${getStatusColor(capability.ppk)}`}>
                        {capability.ppk.toFixed(2)}
                    </div>
                    <p className="text-xs text-muted-foreground uppercase mt-1">Ppk</p>
                </CardContent>
            </Card>
        </div>
    );
}
