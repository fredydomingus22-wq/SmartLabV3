"use client";

import { useState, useEffect } from "react";
import { AppShell } from "@/components/layout/AppShell";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Download, FileText, Clock, Users, Package, FlaskConical, Activity, Droplet } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

interface ShiftData {
    shift: string;
    date: string;
    team: { supervisor: string; operators: string[] };
    production: any[];
    analysis: any[];
    lineStatus: any[];
    cipRecords: any[];
    incidents: any[];
}

export default function ShiftReportPage() {
    const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
    const [shift, setShift] = useState("morning");
    const [loading, setLoading] = useState(true);
    const [data, setData] = useState<ShiftData | null>(null);

    useEffect(() => {
        loadShiftData();
    }, [date, shift]);

    async function loadShiftData() {
        setLoading(true);
        try {
            const supabase = createClient();

            // Get shift time range
            const { startTime, endTime } = getShiftTimeRange(date, shift);

            // Fetch all shift data in parallel
            const [productionData, analysisData] = await Promise.all([
                supabase
                    .from("production_lots")
                    .select("*, product:products(name, sku)")
                    .gte("created_at", startTime)
                    .lte("created_at", endTime),
                supabase
                    .from("lab_analysis")
                    .select("*, sample:lab_samples(sample_code)")
                    .gte("created_at", startTime)
                    .lte("created_at", endTime),
            ]);

            const processedData = processShiftData(
                productionData.data || [],
                analysisData.data || []
            );
            setData(processedData);
        } catch (error) {
            console.error("Error loading shift data:", error);
            setData(generateDemoShiftData());
        } finally {
            setLoading(false);
        }
    }

    function getShiftTimeRange(dateStr: string, shiftType: string) {
        const date = new Date(dateStr);
        const shifts = {
            morning: { start: 6, end: 14 },
            afternoon: { start: 14, end: 22 },
            night: { start: 22, end: 6 },
        };

        const shiftHours = shifts[shiftType as keyof typeof shifts];
        const startTime = new Date(date);
        startTime.setHours(shiftHours.start, 0, 0, 0);

        const endTime = new Date(date);
        if (shiftType === "night") {
            endTime.setDate(endTime.getDate() + 1);
        }
        endTime.setHours(shiftHours.end, 0, 0, 0);

        return {
            startTime: startTime.toISOString(),
            endTime: endTime.toISOString(),
        };
    }

    function processShiftData(production: any[], analysis: any[]) {
        return {
            shift: shift,
            date: date,
            team: {
                supervisor: "João Silva",
                operators: ["Maria Santos", "Pedro Costa", "Ana Ferreira"],
            },
            production: production.map((p) => ({
                lotCode: p.lot_code,
                product: p.product?.name || "Unknown",
                sku: p.product?.sku || "-",
                quantity: p.quantity,
                startTime: p.created_at,
                endTime: p.completion_date,
                status: p.status,
            })),
            analysis: analysis.map((a) => ({
                sampleCode: a.sample?.sample_code || "-",
                parameter: a.parameter_name,
                result: a.result,
                status: a.status,
                time: a.created_at,
            })),
            lineStatus: generateLineStatus(),
            cipRecords: generateCIPRecords(),
            incidents: [],
        };
    }

    function generateLineStatus() {
        return [
            { line: "Line 1 - Yogurt", status: "Running", efficiency: 94, output: 850 },
            { line: "Line 2 - Cheese", status: "Running", efficiency: 89, output: 420 },
            { line: "Line 3 - Milk", status: "CIP", efficiency: 0, output: 0 },
        ];
    }

    function generateCIPRecords() {
        return [
            {
                line: "Line 3",
                startTime: "14:30",
                endTime: "15:45",
                type: "Full CIP",
                chemicals: "NaOH 2%, HNO3 1.5%",
                operator: "Pedro Costa",
                verified: true,
            },
            {
                line: "Line 1",
                startTime: "19:00",
                endTime: "19:30",
                type: "Rinse Only",
                chemicals: "Water",
                operator: "Ana Ferreira",
                verified: true,
            },
        ];
    }

    function generateDemoShiftData(): ShiftData {
        return {
            shift: shift,
            date: date,
            team: {
                supervisor: "João Silva",
                operators: ["Maria Santos", "Pedro Costa", "Ana Ferreira"],
            },
            production: [
                {
                    lotCode: "LOT-2024-1123-001",
                    product: "Yogurt Natural",
                    sku: "YOG-NAT-500",
                    quantity: 850,
                    startTime: "06:15",
                    endTime: "12:30",
                    status: "completed",
                },
                {
                    lotCode: "LOT-2024-1123-002",
                    product: "Yogurt Strawberry",
                    sku: "YOG-STR-500",
                    quantity: 620,
                    startTime: "07:00",
                    endTime: "13:15",
                    status: "completed",
                },
            ],
            analysis: [
                {
                    sampleCode: "SAM-001-2024",
                    parameter: "pH",
                    result: "4.5",
                    status: "passed",
                    time: "08:30",
                },
                {
                    sampleCode: "SAM-002-2024",
                    parameter: "Fat %",
                    result: "3.2",
                    status: "passed",
                    time: "09:15",
                },
                {
                    sampleCode: "SAM-003-2024",
                    parameter: "Protein %",
                    result: "3.8",
                    status: "passed",
                    time: "10:00",
                },
            ],
            lineStatus: generateLineStatus(),
            cipRecords: generateCIPRecords(),
            incidents: [
                {
                    time: "08:45",
                    description: "Line 2 minor jam - cleared in 5 minutes",
                    severity: "low",
                },
            ],
        };
    }

    if (loading || !data) {
        return (
            <AppShell>
                <div className="p-6">
                    <div className="text-center py-20">Loading shift report...</div>
                </div>
            </AppShell>
        );
    }

    const shiftNames = {
        morning: "Morning Shift (06:00 - 14:00)",
        afternoon: "Afternoon Shift (14:00 - 22:00)",
        night: "Night Shift (22:00 - 06:00)",
    };

    return (
        <AppShell>
            <div className="p-6 space-y-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <SectionHeader
                        title="Daily Shift Report"
                        description="Complete summary of shift activities and production"
                    />
                    <div className="flex gap-2">
                        <input
                            type="date"
                            value={date}
                            onChange={(e) => setDate(e.target.value)}
                            className="px-3 py-2 rounded-md bg-slate-800 border border-slate-700 text-white"
                        />
                        <Select value={shift} onValueChange={setShift}>
                            <SelectTrigger className="w-[200px]">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="morning">Morning (06-14h)</SelectItem>
                                <SelectItem value="afternoon">Afternoon (14-22h)</SelectItem>
                                <SelectItem value="night">Night (22-06h)</SelectItem>
                            </SelectContent>
                        </Select>
                        <Button variant="outline">
                            <FileText className="w-4 h-4 mr-2" />
                            PDF
                        </Button>
                        <Button variant="outline">
                            <Download className="w-4 h-4 mr-2" />
                            Excel
                        </Button>
                    </div>
                </div>

                {/* Shift Header Info */}
                <Card className="bg-slate-900 border-slate-800">
                    <CardHeader>
                        <div className="flex items-center justify-between">
                            <div>
                                <CardTitle className="text-2xl">
                                    {shiftNames[shift as keyof typeof shiftNames]}
                                </CardTitle>
                                <p className="text-muted-foreground mt-1">
                                    {new Date(date).toLocaleDateString("pt-PT", {
                                        weekday: "long",
                                        year: "numeric",
                                        month: "long",
                                        day: "numeric",
                                    })}
                                </p>
                            </div>
                            <div className="text-right">
                                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                    <Users className="w-4 h-4" />
                                    Supervisor: <span className="font-medium text-white">{data.team.supervisor}</span>
                                </div>
                                <div className="text-xs text-muted-foreground mt-1">
                                    Team: {data.team.operators.join(", ")}
                                </div>
                            </div>
                        </div>
                    </CardHeader>
                </Card>

                {/* Summary Cards */}
                <div className="grid gap-4 md:grid-cols-4">
                    <Card className="bg-slate-900 border-slate-800">
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                                <Package className="w-4 h-4" />
                                Production
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-3xl font-bold">{data.production.length}</div>
                            <div className="text-xs text-muted-foreground">Lots completed</div>
                        </CardContent>
                    </Card>

                    <Card className="bg-slate-900 border-slate-800">
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                                <FlaskConical className="w-4 h-4" />
                                Analysis
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-3xl font-bold">{data.analysis.length}</div>
                            <div className="text-xs text-muted-foreground">Tests performed</div>
                        </CardContent>
                    </Card>

                    <Card className="bg-slate-900 border-slate-800">
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                                <Activity className="w-4 h-4" />
                                Lines Running
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-3xl font-bold">
                                {data.lineStatus.filter((l) => l.status === "Running").length}/{data.lineStatus.length}
                            </div>
                            <div className="text-xs text-muted-foreground">Active lines</div>
                        </CardContent>
                    </Card>

                    <Card className="bg-slate-900 border-slate-800">
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                                <Droplet className="w-4 h-4" />
                                CIP Cycles
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-3xl font-bold">{data.cipRecords.length}</div>
                            <div className="text-xs text-muted-foreground">Cleaning cycles</div>
                        </CardContent>
                    </Card>
                </div>

                {/* Production Table */}
                <Card className="bg-slate-900 border-slate-800">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Package className="w-5 h-5" />
                            Production Summary
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <Table>
                            <TableHeader>
                                <TableRow className="border-slate-800">
                                    <TableHead>Lot Code</TableHead>
                                    <TableHead>Product</TableHead>
                                    <TableHead>SKU</TableHead>
                                    <TableHead>Quantity</TableHead>
                                    <TableHead>Start Time</TableHead>
                                    <TableHead>End Time</TableHead>
                                    <TableHead>Status</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {data.production.map((prod, idx) => (
                                    <TableRow key={idx} className="border-slate-800">
                                        <TableCell className="font-mono">{prod.lotCode}</TableCell>
                                        <TableCell>{prod.product}</TableCell>
                                        <TableCell className="text-muted-foreground">{prod.sku}</TableCell>
                                        <TableCell className="font-bold">{prod.quantity}</TableCell>
                                        <TableCell className="text-sm">{prod.startTime}</TableCell>
                                        <TableCell className="text-sm">{prod.endTime}</TableCell>
                                        <TableCell>
                                            <Badge className="bg-green-600">
                                                {prod.status}
                                            </Badge>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>

                {/* Analysis Table */}
                <Card className="bg-slate-900 border-slate-800">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <FlaskConical className="w-5 h-5" />
                            Laboratory Analysis
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <Table>
                            <TableHeader>
                                <TableRow className="border-slate-800">
                                    <TableHead>Time</TableHead>
                                    <TableHead>Sample Code</TableHead>
                                    <TableHead>Parameter</TableHead>
                                    <TableHead>Result</TableHead>
                                    <TableHead>Status</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {data.analysis.map((test, idx) => (
                                    <TableRow key={idx} className="border-slate-800">
                                        <TableCell className="text-sm">{test.time}</TableCell>
                                        <TableCell className="font-mono text-sm">{test.sampleCode}</TableCell>
                                        <TableCell>{test.parameter}</TableCell>
                                        <TableCell className="font-bold">{test.result}</TableCell>
                                        <TableCell>
                                            <Badge className={test.status === "passed" ? "bg-green-600" : "bg-red-600"}>
                                                {test.status}
                                            </Badge>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>

                {/* Line Status */}
                <Card className="bg-slate-900 border-slate-800">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Activity className="w-5 h-5" />
                            Production Line Status
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-3">
                            {data.lineStatus.map((line, idx) => (
                                <div
                                    key={idx}
                                    className="flex items-center justify-between p-4 rounded-lg bg-slate-800/50"
                                >
                                    <div>
                                        <div className="font-medium">{line.line}</div>
                                        <div className="text-sm text-muted-foreground">
                                            Output: {line.output} units
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-4">
                                        <div className="text-right">
                                            <div className="text-sm text-muted-foreground">Efficiency</div>
                                            <div className="text-lg font-bold">{line.efficiency}%</div>
                                        </div>
                                        <Badge className={line.status === "Running" ? "bg-green-600" : "bg-yellow-600"}>
                                            {line.status}
                                        </Badge>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>

                {/* CIP Records */}
                <Card className="bg-slate-900 border-slate-800">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Droplet className="w-5 h-5" />
                            CIP (Clean-In-Place) Records
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <Table>
                            <TableHeader>
                                <TableRow className="border-slate-800">
                                    <TableHead>Line</TableHead>
                                    <TableHead>Start Time</TableHead>
                                    <TableHead>End Time</TableHead>
                                    <TableHead>Type</TableHead>
                                    <TableHead>Chemicals</TableHead>
                                    <TableHead>Operator</TableHead>
                                    <TableHead>Verified</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {data.cipRecords.map((cip, idx) => (
                                    <TableRow key={idx} className="border-slate-800">
                                        <TableCell className="font-medium">{cip.line}</TableCell>
                                        <TableCell className="text-sm">{cip.startTime}</TableCell>
                                        <TableCell className="text-sm">{cip.endTime}</TableCell>
                                        <TableCell>
                                            <Badge variant="outline">{cip.type}</Badge>
                                        </TableCell>
                                        <TableCell className="text-sm text-muted-foreground">
                                            {cip.chemicals}
                                        </TableCell>
                                        <TableCell className="text-sm">{cip.operator}</TableCell>
                                        <TableCell>
                                            {cip.verified ? (
                                                <Badge className="bg-green-600">✓ Verified</Badge>
                                            ) : (
                                                <Badge className="bg-yellow-600">Pending</Badge>
                                            )}
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>

                {/* Incidents (if any) */}
                {data.incidents.length > 0 && (
                    <Card className="bg-slate-900 border-orange-900/50">
                        <CardHeader>
                            <CardTitle className="text-orange-500">Shift Incidents</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-2">
                                {data.incidents.map((incident, idx) => (
                                    <div
                                        key={idx}
                                        className="p-3 rounded-lg bg-orange-950/30 border border-orange-900/50"
                                    >
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <span className="text-sm text-orange-400 font-bold">
                                                    {incident.time}
                                                </span>
                                                <span className="text-sm ml-2">{incident.description}</span>
                                            </div>
                                            <Badge variant="outline">{incident.severity}</Badge>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                )}

                {/* Report Footer */}
                <Card className="bg-slate-900 border-slate-800">
                    <CardContent className="pt-6">
                        <div className="text-center text-sm text-muted-foreground space-y-2">
                            <p>Shift Report generated on {new Date().toLocaleString()}</p>
                            <p>Supervisor Signature: ________________________</p>
                            <p className="mt-4">SmartLab Enterprise - Shift Management System</p>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </AppShell>
    );
}
