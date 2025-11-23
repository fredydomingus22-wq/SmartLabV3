"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { ProductSpec } from "@/types/product";
import { CheckCircle2, AlertCircle, MinusCircle } from "lucide-react";

interface ParameterGroupCardProps {
    title: string;
    specs: ProductSpec[];
    values: Record<string, number>;
    onChange: (parameterId: string, value: number) => void;
    readOnly?: boolean;
}

export function ParameterGroupCard({
    title,
    specs,
    values,
    onChange,
    readOnly = false
}: ParameterGroupCardProps) {
    if (specs.length === 0) return null;

    const getStatusColor = (spec: ProductSpec, value?: number) => {
        if (value === undefined || value === null) return "text-slate-500";

        const min = spec.spec_min ?? -Infinity;
        const max = spec.spec_max ?? Infinity;

        if (value >= min && value <= max) return "text-green-500";
        return "text-red-500";
    };

    const getStatusIcon = (spec: ProductSpec, value?: number) => {
        if (value === undefined || value === null) return <MinusCircle className="h-4 w-4 text-slate-500" />;

        const min = spec.spec_min ?? -Infinity;
        const max = spec.spec_max ?? Infinity;

        if (value >= min && value <= max) return <CheckCircle2 className="h-4 w-4 text-green-500" />;
        return <AlertCircle className="h-4 w-4 text-red-500" />;
    };

    return (
        <Card className="bg-slate-900 border-slate-800">
            <CardHeader className="pb-3 border-b border-slate-800">
                <CardTitle className="text-lg font-medium flex items-center justify-between">
                    {title}
                    <Badge variant="outline" className="ml-2">
                        {specs.length} Parameters
                    </Badge>
                </CardTitle>
            </CardHeader>
            <CardContent className="pt-4 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {specs.map((spec) => {
                    const value = values[spec.parameter_id];
                    const isCritical = spec.is_critical;

                    return (
                        <div key={spec.id} className="space-y-2">
                            <div className="flex items-center justify-between">
                                <Label htmlFor={spec.parameter_id} className="flex items-center gap-2">
                                    {spec.parameter?.name}
                                    {isCritical && (
                                        <Badge variant="destructive" className="h-5 text-[10px] px-1">
                                            CRITICAL
                                        </Badge>
                                    )}
                                </Label>
                                {getStatusIcon(spec, value)}
                            </div>

                            <div className="relative">
                                <Input
                                    id={spec.parameter_id}
                                    type="number"
                                    step="0.01"
                                    placeholder={spec.spec_target ? `Target: ${spec.spec_target}` : "Enter value"}
                                    value={value ?? ""}
                                    onChange={(e) => onChange(spec.parameter_id, parseFloat(e.target.value))}
                                    disabled={readOnly}
                                    className={`bg-slate-950 border-slate-800 ${getStatusColor(spec, value)} font-medium`}
                                />
                                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">
                                    {spec.parameter?.unit}
                                </span>
                            </div>

                            <div className="flex justify-between text-xs text-muted-foreground px-1">
                                <span>Min: {spec.spec_min ?? "-"}</span>
                                <span>Max: {spec.spec_max ?? "-"}</span>
                            </div>
                        </div>
                    );
                })}
            </CardContent>
        </Card>
    );
}
