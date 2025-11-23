"use client"

import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ProductParameterSpec } from "@/lib/queries/parameters";
import { CheckCircle, AlertCircle, Minus } from "lucide-react";

interface ParameterAnalysisFormProps {
    specs: ProductParameterSpec[];
    values: Record<string, number>;
    onChange: (parameterId: string, value: number) => void;
    readOnly?: boolean;
}

export function ParameterAnalysisForm({ specs, values, onChange, readOnly = false }: ParameterAnalysisFormProps) {

    const getStatus = (spec: ProductParameterSpec, value: number | undefined) => {
        if (value === undefined || isNaN(value)) return 'empty';

        if (spec.spec_min !== null && value < spec.spec_min) return 'oos';
        if (spec.spec_max !== null && value > spec.spec_max) return 'oos';

        return 'in_spec';
    };

    return (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {specs.map((spec) => {
                const value = values[spec.parameter_id];
                const status = getStatus(spec, value);

                return (
                    <Card key={spec.id} className={`border ${status === 'oos' ? 'border-red-500/50 bg-red-500/5' :
                            status === 'in_spec' ? 'border-green-500/50 bg-green-500/5' :
                                'border-slate-800'
                        }`}>
                        <CardContent className="p-4 space-y-3">
                            <div className="flex justify-between items-start">
                                <Label className="text-base font-medium">
                                    {spec.parameter?.name || 'Parâmetro'}
                                </Label>
                                {status === 'oos' && <AlertCircle className="h-4 w-4 text-red-500" />}
                                {status === 'in_spec' && <CheckCircle className="h-4 w-4 text-green-500" />}
                            </div>

                            <div className="flex items-center gap-2">
                                <Input
                                    type="number"
                                    step="0.01"
                                    placeholder="Valor"
                                    value={value ?? ''}
                                    onChange={(e) => onChange(spec.parameter_id, parseFloat(e.target.value))}
                                    disabled={readOnly}
                                    className={`text-lg font-semibold ${status === 'oos' ? 'text-red-500 border-red-500/30' :
                                            status === 'in_spec' ? 'text-green-500 border-green-500/30' : ''
                                        }`}
                                />
                                <span className="text-sm text-muted-foreground font-medium w-12">
                                    {spec.unit}
                                </span>
                            </div>

                            <div className="flex justify-between text-xs text-muted-foreground bg-slate-900/50 p-2 rounded">
                                <div className="flex flex-col items-center">
                                    <span className="text-[10px] uppercase opacity-70">Min</span>
                                    <span className={spec.spec_min !== null ? "font-mono" : "text-slate-600"}>
                                        {spec.spec_min ?? '-'}
                                    </span>
                                </div>
                                <div className="flex flex-col items-center">
                                    <span className="text-[10px] uppercase opacity-70">Alvo</span>
                                    <span className="font-mono text-blue-400">
                                        {spec.spec_target ?? '-'}
                                    </span>
                                </div>
                                <div className="flex flex-col items-center">
                                    <span className="text-[10px] uppercase opacity-70">Max</span>
                                    <span className={spec.spec_max !== null ? "font-mono" : "text-slate-600"}>
                                        {spec.spec_max ?? '-'}
                                    </span>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                );
            })}
        </div>
    );
}
