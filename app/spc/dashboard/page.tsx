"use client"

import { useState, useEffect } from "react";
import { AppShell } from "@/components/layout/AppShell";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { ControlChart } from "@/components/spc/ControlChart";
import { CapabilityDashboard } from "@/components/spc/CapabilityDashboard";
import { calculateIMRLimits, calculateCapability } from "@/lib/spc/math";
import { checkNelsonRules } from "@/lib/spc/rules";
import { SPCDataPoint, SPCAnalysisResult } from "@/types/spc";
import { Button } from "@/components/ui/button";
import { RefreshCw } from "lucide-react";

export default function SPCDashboardPage() {
    const [data, setData] = useState<SPCAnalysisResult | null>(null);

    const generateMockData = () => {
        const points: SPCDataPoint[] = [];
        let value = 10.0;

        for (let i = 0; i < 50; i++) {
            // Simulate a process with a shift around index 30
            const shift = i > 30 ? 0.5 : 0;
            const noise = (Math.random() - 0.5) * 0.5;
            value = 10.0 + shift + noise;

            // Inject a spike
            if (i === 15) value = 11.5;

            points.push({
                id: `pt-${i}`,
                value: value,
                timestamp: new Date().toISOString(),
                label: `${i + 1}`
            });
        }

        const limits = calculateIMRLimits(points, 10.8, 9.2);
        const violations = checkNelsonRules(points, limits);
        const capability = calculateCapability(points, limits);

        setData({
            data: points,
            limits,
            violations,
            capability
        });
    };

    useEffect(() => {
        generateMockData();
    }, []);

    return (
        <AppShell>
            <div className="p-6 space-y-6">
                <div className="flex justify-between items-center">
                    <SectionHeader
                        title="SPC Engine Dashboard"
                        description="Real-time Statistical Process Control"
                    />
                    <Button onClick={generateMockData} variant="outline">
                        <RefreshCw className="mr-2 h-4 w-4" />
                        Simulate New Data
                    </Button>
                </div>

                {data && (
                    <>
                        <CapabilityDashboard capability={data.capability} />

                        <div className="grid gap-6">
                            <ControlChart
                                title="pH Level - Line 1 (I-Chart)"
                                data={data}
                            />
                        </div>

                        <div className="bg-muted/30 p-4 rounded-lg">
                            <h3 className="font-semibold mb-2">Detected Violations</h3>
                            {data.violations.length === 0 ? (
                                <p className="text-sm text-muted-foreground">No special cause variation detected.</p>
                            ) : (
                                <ul className="space-y-2">
                                    {data.violations.map((v, i) => (
                                        <li key={i} className="text-sm flex items-start gap-2">
                                            <span className="text-destructive font-bold">[{v.ruleName}]</span>
                                            <span>{v.description} at point {v.point.label} (Value: {v.point.value.toFixed(3)})</span>
                                        </li>
                                    ))}
                                </ul>
                            )}
                        </div>
                    </>
                )}
            </div>
        </AppShell>
    );
}
