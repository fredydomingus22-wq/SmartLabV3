import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import type { FormField, FieldType } from "@/types/form-builder";
import { GripVertical, Settings, Trash2, Plus } from "lucide-react";

interface FormBuilderCanvasProps {
    fields: FormField[];
    onSelectField: (field: FormField | null) => void;
    selectedField: FormField | null;
    onDeleteField: (fieldId: string) => void;
    onAddField: (fieldType: FieldType) => void;
}

export function FormBuilderCanvas({
    fields,
    onSelectField,
    selectedField,
    onDeleteField,
    onAddField
}: FormBuilderCanvasProps) {
    if (!fields || fields.length === 0) {
        return (
            <div className="border-2 border-dashed rounded-lg p-12 text-center bg-card">
                <div className="max-w-sm mx-auto space-y-4">
                    <div className="text-muted-foreground">
                        <Plus className="h-12 w-12 mx-auto mb-4 opacity-50" />
                        <h3 className="text-lg font-semibold mb-2">No fields yet</h3>
                        <p className="text-sm">
                            Click field types from the left panel to start building your form
                        </p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-2">
            <Card className="bg-card">
                <CardHeader>
                    <CardTitle>Form Preview</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                    {fields.map((field) => (
                        <div
                            key={field.id}
                            onClick={() => onSelectField(field)}
                            className={`group relative p-4 border rounded-md cursor-pointer transition-all ${selectedField?.id === field.id
                                    ? 'border-primary bg-accent shadow-sm'
                                    : 'border-border hover:border-primary/50 hover:bg-accent/50'
                                }`}
                        >
                            <div className="flex items-start gap-3">
                                <GripVertical className="h-5 w-5 text-muted-foreground cursor-move flex-shrink-0" />
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center justify-between mb-1">
                                        <span className="font-medium truncate">{field.label}</span>
                                        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0">
                                            <Button
                                                size="sm"
                                                variant="ghost"
                                                className="h-7 w-7 p-0"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    onSelectField(field);
                                                }}
                                            >
                                                <Settings className="h-3.5 w-3.5" />
                                            </Button>
                                            <Button
                                                size="sm"
                                                variant="ghost"
                                                className="h-7 w-7 p-0 text-destructive hover:text-destructive"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    onDeleteField(field.id);
                                                }}
                                            >
                                                <Trash2 className="h-3.5 w-3.5" />
                                            </Button>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3 text-xs text-muted-foreground flex-wrap">
                                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-muted font-mono">
                                            {field.field_type}
                                        </span>
                                        <span className="text-muted-foreground/70">
                                            key: {field.field_key}
                                        </span>
                                        {field.is_required && (
                                            <span className="text-destructive font-medium">Required</span>
                                        )}
                                    </div>
                                    {field.placeholder && (
                                        <div className="mt-1 text-xs text-muted-foreground italic">
                                            "{field.placeholder}"
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))}
                </CardContent>
            </Card>
        </div>
    );
}
