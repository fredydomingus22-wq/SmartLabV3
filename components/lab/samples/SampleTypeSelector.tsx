'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Loader2, Beaker, FlaskConical, Package, Droplets } from 'lucide-react';
import { getSampleTypes, type SampleType } from '@/lib/queries/samples/getSampleTypes';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

interface SampleTypeSelectorProps {
    onSelect: (sampleType: SampleType) => void;
    selectedId?: string;
}

const ICON_MAP: Record<string, any> = {
    'finished_product': Package,
    'intermediate': FlaskConical,
    'raw_material': Droplets,
    'environmental': Beaker,
    'default': Beaker
};

export function SampleTypeSelector({ onSelect, selectedId }: SampleTypeSelectorProps) {
    const [sampleTypes, setSampleTypes] = useState<SampleType[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchSampleTypes();
    }, []);

    const fetchSampleTypes = async () => {
        try {
            const data = await getSampleTypes();
            setSampleTypes(data);
        } catch (error) {
            console.error('Error fetching sample types:', error);
            toast.error('Failed to load sample types');
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
        );
    }

    if (sampleTypes.length === 0) {
        return (
            <div className="text-center py-12 text-muted-foreground">
                <Beaker className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No sample types configured</p>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {sampleTypes.map((type) => {
                    const Icon = ICON_MAP[type.category || 'default'] || ICON_MAP.default;
                    const isSelected = selectedId === type.id;

                    return (
                        <Card
                            key={type.id}
                            className={cn(
                                "cursor-pointer transition-all hover:shadow-lg hover:border-primary/50",
                                isSelected && "border-primary shadow-lg"
                            )}
                            onClick={() => onSelect(type)}
                        >
                            <CardHeader className="pb-3">
                                <div className="flex items-start justify-between">
                                    <Icon className={cn(
                                        "h-8 w-8",
                                        isSelected ? "text-primary" : "text-muted-foreground"
                                    )} />
                                    {type.category && (
                                        <Badge variant={isSelected ? "default" : "secondary"}>
                                            {type.category}
                                        </Badge>
                                    )}
                                </div>
                            </CardHeader>
                            <CardContent>
                                <CardTitle className="text-lg mb-2">{type.name}</CardTitle>
                                {type.description && (
                                    <CardDescription className="text-sm line-clamp-2">
                                        {type.description}
                                    </CardDescription>
                                )}
                                <div className="mt-2 text-xs text-muted-foreground">
                                    Code: {type.code}
                                </div>
                            </CardContent>
                        </Card>
                    );
                })}
            </div>
        </div>
    );
}
