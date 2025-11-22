"use client";

import { SpcFilters } from "@/types/spc";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

type FilterOption = { label: string; value: string };

type Props = {
    filters: SpcFilters;
    onChange: (next: Partial<SpcFilters>) => void;
    parameterOptions?: FilterOption[];
    lineOptions?: FilterOption[];
    productOptions?: FilterOption[];
    onRefresh?: () => void;
};

export function SpcFiltersBar({
    filters,
    onChange,
    parameterOptions = [],
    lineOptions = [],
    productOptions = [],
    onRefresh
}: Props) {
    return (
        <Card className="bg-slate-900/80 border-slate-800">
            <div className="grid grid-cols-1 md:grid-cols-4 lg:grid-cols-4 gap-4 p-4">
                <div className="space-y-2">
                    <Label className="text-slate-200">Parameter</Label>
                    <Select
                        value={filters.parameterId}
                        onValueChange={(value) => onChange({ parameterId: value })}
                    >
                        <SelectTrigger className="bg-slate-900 border-slate-800">
                            <SelectValue placeholder="All parameters" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All</SelectItem>
                            {parameterOptions.map((p) => (
                                <SelectItem key={p.value} value={p.value}>
                                    {p.label}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>

                <div className="space-y-2">
                    <Label className="text-slate-200">Line</Label>
                    <Select value={filters.line} onValueChange={(value) => onChange({ line: value })}>
                        <SelectTrigger className="bg-slate-900 border-slate-800">
                            <SelectValue placeholder="Any line" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All</SelectItem>
                            {lineOptions.map((l) => (
                                <SelectItem key={l.value} value={l.value}>
                                    {l.label}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>

                <div className="space-y-2">
                    <Label className="text-slate-200">Product</Label>
                    <Select value={filters.productId} onValueChange={(value) => onChange({ productId: value })}>
                        <SelectTrigger className="bg-slate-900 border-slate-800">
                            <SelectValue placeholder="Any product" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All</SelectItem>
                            {productOptions.map((p) => (
                                <SelectItem key={p.value} value={p.value}>
                                    {p.label}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>

                <div className="space-y-2">
                    <Label className="text-slate-200">Window</Label>
                    <Select
                        value={filters.window}
                        onValueChange={(value) => onChange({ window: value as SpcFilters["window"] })}
                    >
                        <SelectTrigger className="bg-slate-900 border-slate-800">
                            <SelectValue placeholder="8h" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="1h">Last 1h</SelectItem>
                            <SelectItem value="8h">Last 8h</SelectItem>
                            <SelectItem value="24h">Last 24h</SelectItem>
                            <SelectItem value="7d">Last 7d</SelectItem>
                        </SelectContent>
                    </Select>
                </div>

            </div>
            <div className="flex justify-end px-4 pb-4">
                <Button variant="outline" onClick={onRefresh}>
                    Refresh
                </Button>
            </div>
        </Card>
    );
}
