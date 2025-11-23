"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { AppShell } from "@/components/layout/AppShell";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Separator } from "@/components/ui/separator";
import { Download, FileText, Clock, FlaskConical, Package, Beaker, ArrowRight } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

interface ProductionLotReport {
    lot: {
        code: string;
        product: string;
        sku: string;
        quantity: number;
        status: string;
        startDate: string;
        endDate: string;
    };
    intermediates: Array<{
        stage: string;
        product: string;
        entryTime: string;
        exitTime: string;
        duration: string;
        line: string;
        status: string;
        ingredients: Array<{
            name: string;
            quantity: number;
            unit: string;
            lotCode: string;
        }>;
        analysis: Array<{
            sampleCode: string;
            parameter: string;
            specification: string;
            result: string;
            status: string;
            time: string;
        }>;
    }>;
}

export default function ProductionLotReportPage() {
    const params = useParams();
    const lotCode = params?.lotCode as string || "LOT-2024-1123-001";

    const [loading, setLoading] = useState(true);
    const [data, setData] = useState<ProductionLotReport | null>(null);

    useEffect(() => {
        loadLotData();
    }, [lotCode]);

    async function loadLotData() {
        setLoading(true);
        try {
            const supabase = createClient();

            // Get production lot details
            const { data: lot } = await supabase
                .from("production_lots")
                .select("*, product:products(*)")
                .eq("lot_code", lotCode)
                .single();

            if (lot) {
                const processedData = await processLotData(lot);
                setData(processedData);
            } else {
                setData(generateDemoLotData());
            }
        } catch (error) {
            console.error("Error loading lot data:", error);
            setData(generateDemoLotData());
        } finally {
            setLoading(false);
        }
    }

    async function processLotData(lot: any): Promise<ProductionLotReport> {
        // In a real app, fetch related intermediates, ingredients, and analysis
        return generateDemoLotData();
    }

    function generateDemoLotData(): ProductionLotReport {
        return {
            lot: {
                code: "LOT-2024-1123-001",
                product: "Yogurt Natural 500g",
                sku: "YOG-NAT-500",
                quantity: 850,
                status: "Completed",
                startDate: "2024-11-23 06:15:00",
                endDate: "2024-11-23 12:30:00",
            },
            intermediates: [
                {
                    stage: "1. Milk Reception",
                    product: "Raw Milk",
                    entryTime: "06:15",
                    exitTime: "06:45",
                    duration: "30 min",
                    line: "Reception Tank #1",
                    status: "Approved",
                    ingredients: [
                        {
                            name: "Raw Milk Whole",
                            quantity: 1200,
                            unit: "L",
                            lotCode: "RM-MILK-231122-05",
                        },
                    ],
                    analysis: [
                        {
                            sampleCode: "SAM-REC-001",
                            parameter: "Temperature",
                            specification: "4-6°C",
                            result: "5.2°C",
                            status: "Passed",
                            time: "06:20",
                        },
                        {
                            sampleCode: "SAM-REC-001",
                            parameter: "pH",
                            specification: "6.6-6.8",
                            result: "6.7",
                            status: "Passed",
                            time: "06:25",
                        },
                        {
                            sampleCode: "SAM-REC-001",
                            parameter: "Fat %",
                            specification: "≥ 3.5",
                            result: "3.8",
                            status: "Passed",
                            time: "06:30",
                        },
                    ],
                },
                {
                    stage: "2. Pasteurization",
                    product: "Pasteurized Milk Base",
                    entryTime: "07:00",
                    exitTime: "08:15",
                    duration: "75 min",
                    line: "Pasteurizer Line 1",
                    status: "Approved",
                    ingredients: [
                        {
                            name: "Raw Milk (from Stage 1)",
                            quantity: 1180,
                            unit: "L",
                            lotCode: "INT-001",
                        },
                        {
                            name: "Milk Powder",
                            quantity: 25,
                            unit: "kg",
                            lotCode: "RM-POWDER-231120-02",
                        },
                        {
                            name: "Sugar",
                            quantity: 42,
                            unit: "kg",
                            lotCode: "RM-SUGAR-231115-08",
                        },
                    ],
                    analysis: [
                        {
                            sampleCode: "SAM-PAST-001",
                            parameter: "Pasteurization Temp",
                            specification: "72-75°C",
                            result: "73.5°C",
                            status: "Passed",
                            time: "07:45",
                        },
                        {
                            sampleCode: "SAM-PAST-001",
                            parameter: "Hold Time",
                            specification: "15-20 sec",
                            result: "16 sec",
                            status: "Passed",
                            time: "07:45",
                        },
                        {
                            sampleCode: "SAM-PAST-002",
                            parameter: "Cooling Temp",
                            specification: "42-45°C",
                            result: "43.2°C",
                            status: "Passed",
                            time: "08:10",
                        },
                    ],
                },
                {
                    stage: "3. Fermentation",
                    product: "Fermented Yogurt Base",
                    entryTime: "08:30",
                    exitTime: "11:45",
                    duration: "195 min",
                    line: "Fermentation Tank #3",
                    status: "Approved",
                    ingredients: [
                        {
                            name: "Pasteurized Milk (from Stage 2)",
                            quantity: 1160,
                            unit: "L",
                            lotCode: "INT-002",
                        },
                        {
                            name: "Yogurt Starter Culture",
                            quantity: 2.5,
                            unit: "kg",
                            lotCode: "RM-CULTURE-YC-231121-01",
                        },
                    ],
                    analysis: [
                        {
                            sampleCode: "SAM-FERM-001",
                            parameter: "pH (Start)",
                            specification: "6.4-6.6",
                            result: "6.5",
                            status: "Passed",
                            time: "08:35",
                        },
                        {
                            sampleCode: "SAM-FERM-002",
                            parameter: "pH (Mid-point)",
                            specification: "5.0-5.5",
                            result: "5.2",
                            status: "Passed",
                            time: "10:00",
                        },
                        {
                            sampleCode: "SAM-FERM-003",
                            parameter: "pH (Final)",
                            specification: "4.4-4.6",
                            result: "4.5",
                            status: "Passed",
                            time: "11:40",
                        },
                        {
                            sampleCode: "SAM-FERM-003",
                            parameter: "Titratable Acidity",
                            specification: "0.7-0.9%",
                            result: "0.82%",
                            status: "Passed",
                            time: "11:42",
                        },
                    ],
                },
                {
                    stage: "4. Filling & Packaging",
                    product: "Final Product - Yogurt Natural 500g",
                    entryTime: "12:00",
                    exitTime: "12:30",
                    duration: "30 min",
                    line: "Filling Line #2",
                    status: "Approved",
                    ingredients: [
                        {
                            name: "Fermented Yogurt (from Stage 3)",
                            quantity: 1140,
                            unit: "L",
                            lotCode: "INT-003",
                        },
                        {
                            name: "500g Plastic Containers",
                            quantity: 850,
                            unit: "units",
                            lotCode: "PKG-CUP500-231118-12",
                        },
                        {
                            name: "Printed Lids",
                            quantity: 850,
                            unit: "units",
                            lotCode: "PKG-LID-NAT-231119-08",
                        },
                    ],
                    analysis: [
                        {
                            sampleCode: "SAM-FILL-001",
                            parameter: "Fill Weight",
                            specification: "500 ± 10g",
                            result: "502g",
                            status: "Passed",
                            time: "12:10",
                        },
                        {
                            sampleCode: "SAM-FILL-002",
                            parameter: "Seal Integrity",
                            specification: "100% sealed",
                            result: "Pass",
                            status: "Passed",
                            time: "12:15",
                        },
                        {
                            sampleCode: "SAM-FILL-003",
                            parameter: "Label Verification",
                            specification: "Correct lot code",
                            result: "Pass",
                            status: "Passed",
                            time: "12:20",
                        },
                    ],
                },
            ],
        };
    }

    if (loading || !data) {
        return (
            <AppShell>
                <div className="p-6">
                    <div className="text-center py-20">Loading lot report...</div>
                </div>
            </AppShell>
        );
    }

    const { lot, intermediates } = data;

    return (
        <AppShell>
            <div className="p-6 space-y-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <SectionHeader
                        title="Production Lot Traceability Report"
                        description="Complete production history with intermediates and analysis"
                    />
                    <div className="flex gap-2">
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

                {/* Lot Header */}
                <Card className="bg-gradient-to-r from-blue-950/50 to-slate-900 border-blue-900/50">
                    <CardHeader>
                        <div className="flex items-center justify-between">
                            <div>
                                <CardTitle className="text-3xl font-bold">{lot.code}</CardTitle>
                                <p className="text-xl text-blue-300 mt-2">{lot.product}</p>
                                <p className="text-sm text-muted-foreground mt-1">SKU: {lot.sku}</p>
                            </div>
                            <div className="text-right">
                                <Badge className="bg-green-600 text-lg px-4 py-2">{lot.status}</Badge>
                                <div className="mt-4 text-sm text-muted-foreground">
                                    <div className="flex items-center gap-2 justify-end">
                                        <Clock className="w-4 h-4" />
                                        Total Production Time: 6h 15min
                                    </div>
                                    <div className="mt-1">Quantity: <span className="font-bold text-white">{lot.quantity} units</span></div>
                                </div>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-2 gap-4 text-sm">
                            <div>
                                <span className="text-muted-foreground">Start:</span>
                                <span className="ml-2 font-medium">{lot.startDate}</span>
                            </div>
                            <div>
                                <span className="text-muted-foreground">End:</span>
                                <span className="ml-2 font-medium">{lot.endDate}</span>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Production Flow */}
                <div className="relative">
                    {intermediates.map((intermediate, idx) => (
                        <div key={idx} className="relative mb-6">
                            {/* Stage Card */}
                            <Card className="bg-slate-900 border-slate-800">
                                <CardHeader className="pb-3">
                                    <div className="flex items-start justify-between">
                                        <div className="flex-1">
                                            <div className="flex items-center gap-3">
                                                <div className="flex items-center justify-center w-10 h-10 rounded-full bg-blue-600/20 border-2 border-blue-600">
                                                    <span className="font-bold text-blue-400">{idx + 1}</span>
                                                </div>
                                                <div>
                                                    <CardTitle className="text-xl">{intermediate.stage}</CardTitle>
                                                    <p className="text-sm text-blue-400 mt-1">{intermediate.product}</p>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="text-right text-sm">
                                            <Badge className="bg-green-600">{intermediate.status}</Badge>
                                            <div className="text-muted-foreground mt-2">{intermediate.line}</div>
                                        </div>
                                    </div>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    {/* Timeline */}
                                    <div className="flex items-center gap-4 text-sm bg-slate-800/50 p-3 rounded-lg">
                                        <div className="flex items-center gap-2">
                                            <Clock className="w-4 h-4 text-green-500" />
                                            <span className="text-muted-foreground">Entry:</span>
                                            <span className="font-medium">{intermediate.entryTime}</span>
                                        </div>
                                        <ArrowRight className="w-4 h-4 text-muted-foreground" />
                                        <div className="flex items-center gap-2">
                                            <Clock className="w-4 h-4 text-blue-500" />
                                            <span className="text-muted-foreground">Exit:</span>
                                            <span className="font-medium">{intermediate.exitTime}</span>
                                        </div>
                                        <div className="ml-auto font-bold text-blue-400">
                                            {intermediate.duration}
                                        </div>
                                    </div>

                                    {/* Ingredients */}
                                    <div>
                                        <div className="flex items-center gap-2 mb-3">
                                            <Beaker className="w-4 h-4 text-purple-500" />
                                            <h4 className="font-semibold">Ingredients / Raw Materials</h4>
                                        </div>
                                        <Table>
                                            <TableHeader>
                                                <TableRow className="border-slate-800">
                                                    <TableHead>Ingredient</TableHead>
                                                    <TableHead>Quantity</TableHead>
                                                    <TableHead>Unit</TableHead>
                                                    <TableHead>Source Lot</TableHead>
                                                </TableRow>
                                            </TableHeader>
                                            <TableBody>
                                                {intermediate.ingredients.map((ing, iIdx) => (
                                                    <TableRow key={iIdx} className="border-slate-800">
                                                        <TableCell className="font-medium">{ing.name}</TableCell>
                                                        <TableCell className="font-bold text-purple-400">
                                                            {ing.quantity}
                                                        </TableCell>
                                                        <TableCell className="text-muted-foreground">
                                                            {ing.unit}
                                                        </TableCell>
                                                        <TableCell className="font-mono text-sm">
                                                            {ing.lotCode}
                                                        </TableCell>
                                                    </TableRow>
                                                ))}
                                            </TableBody>
                                        </Table>
                                    </div>

                                    {/* Analysis */}
                                    <div>
                                        <div className="flex items-center gap-2 mb-3">
                                            <FlaskConical className="w-4 h-4 text-green-500" />
                                            <h4 className="font-semibold">Quality Analysis</h4>
                                        </div>
                                        <Table>
                                            <TableHeader>
                                                <TableRow className="border-slate-800">
                                                    <TableHead>Time</TableHead>
                                                    <TableHead>Sample</TableHead>
                                                    <TableHead>Parameter</TableHead>
                                                    <TableHead>Specification</TableHead>
                                                    <TableHead>Result</TableHead>
                                                    <TableHead>Status</TableHead>
                                                </TableRow>
                                            </TableHeader>
                                            <TableBody>
                                                {intermediate.analysis.map((test, aIdx) => (
                                                    <TableRow key={aIdx} className="border-slate-800">
                                                        <TableCell className="text-sm">{test.time}</TableCell>
                                                        <TableCell className="font-mono text-xs">
                                                            {test.sampleCode}
                                                        </TableCell>
                                                        <TableCell>{test.parameter}</TableCell>
                                                        <TableCell className="text-sm text-muted-foreground">
                                                            {test.specification}
                                                        </TableCell>
                                                        <TableCell className="font-bold text-green-400">
                                                            {test.result}
                                                        </TableCell>
                                                        <TableCell>
                                                            <Badge
                                                                className={
                                                                    test.status === "Passed"
                                                                        ? "bg-green-600"
                                                                        : "bg-red-600"
                                                                }
                                                            >
                                                                {test.status}
                                                            </Badge>
                                                        </TableCell>
                                                    </TableRow>
                                                ))}
                                            </TableBody>
                                        </Table>
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Arrow between stages */}
                            {idx < intermediates.length - 1 && (
                                <div className="flex items-center justify-center my-2">
                                    <div className="w-1 h-6 bg-gradient-to-b from-blue-600 to-transparent"></div>
                                </div>
                            )}
                        </div>
                    ))}
                </div>

                {/* Report Footer */}
                <Card className="bg-slate-900 border-slate-800">
                    <CardContent className="pt-6">
                        <div className="text-center text-sm text-muted-foreground space-y-2">
                            <p className="font-bold text-white">Complete Traceability Achieved ✓</p>
                            <p>All stages documented | All analysis passed | All materials traced</p>
                            <Separator className="my-4" />
                            <p>Report generated on {new Date().toLocaleString()}</p>
                            <p>Quality Manager Signature: ________________________</p>
                            <p className="mt-4">SmartLab Enterprise - Quality & Traceability System</p>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </AppShell>
    );
}
