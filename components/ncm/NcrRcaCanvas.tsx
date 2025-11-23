'use client';

import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";

interface NcrRcaCanvasProps {
    presetCauses?: { why: string; factor?: string }[];
    onSave?: (payload: { whys: { why: string; factor?: string }[]; fishbone: Record<string, string> }) => void;
}

export function NcrRcaCanvas({ presetCauses = [], onSave }: NcrRcaCanvasProps) {
    const defaultWhys = presetCauses.length ? presetCauses : [{ why: "" }, { why: "" }, { why: "" }, { why: "" }, { why: "" }];
    const [whys, setWhys] = useState<{ why: string; factor?: string }[]>(defaultWhys);
    const [fishbone, setFishbone] = useState<Record<string, string>>({
        methods: "",
        materials: "",
        manpower: "",
        machines: "",
        environment: "",
        measurements: "",
    });

    const updateWhy = (index: number, value: string) => {
        setWhys((prev) => prev.map((item, idx) => (idx === index ? { ...item, why: value } : item)));
    };

    const reset = () => {
        setWhys(defaultWhys);
        setFishbone({
            methods: "",
            materials: "",
            manpower: "",
            machines: "",
            environment: "",
            measurements: "",
        });
    };

    const save = () => {
        onSave?.({ whys, fishbone });
    };

    return (
        <Card className="border-slate-800 bg-slate-950/70">
            <CardContent className="space-y-4 pt-4">
                <div>
                    <div className="text-xs uppercase text-slate-500 mb-2">5 Whys</div>
                    <div className="space-y-2">
                        {whys.map((entry, idx) => (
                            <div key={idx} className="flex items-start gap-2">
                                <div className="text-xs text-slate-500 w-10">Why {idx + 1}</div>
                                <Input
                                    value={entry.why}
                                    onChange={(e) => updateWhy(idx, e.target.value)}
                                    placeholder="Describe the cause..."
                                    className="bg-slate-900/70 border-slate-800 text-slate-100"
                                />
                            </div>
                        ))}
                    </div>
                </div>

                <Separator className="bg-slate-800" />

                <div className="space-y-3">
                    <div className="text-xs uppercase text-slate-500">Ishikawa (Fishbone)</div>
                    <div className="grid grid-cols-2 gap-3">
                        {Object.entries(fishbone).map(([key, value]) => (
                            <div key={key} className="space-y-1">
                                <div className="text-xs text-slate-400 capitalize">{key}</div>
                                <Textarea
                                    value={value}
                                    onChange={(e) => setFishbone((prev) => ({ ...prev, [key]: e.target.value }))}
                                    placeholder={`Notes for ${key}`}
                                    className="bg-slate-900/70 border-slate-800 text-slate-100"
                                    rows={2}
                                />
                            </div>
                        ))}
                    </div>
                </div>

                <div className="flex justify-end gap-2">
                    <Button variant="outline" className="border-slate-700 text-slate-200" onClick={reset}>
                        Reset
                    </Button>
                    <Button className="bg-emerald-600 hover:bg-emerald-500" onClick={save}>
                        Save RCA Draft
                    </Button>
                </div>
            </CardContent>
        </Card>
    );
}
