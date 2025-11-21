import {
    Type,
    Hash,
    CheckSquare,
    Calendar,
    Clock,
    FileText,
    Upload,
    ListOrdered,
    Link2
} from "lucide-react";
import type { FieldType } from "@/types/form-builder";

const fieldTypes = [
    { type: 'text' as FieldType, label: 'Text Input', icon: Type, description: 'Single line text' },
    { type: 'textarea' as FieldType, label: 'Text Area', icon: FileText, description: 'Multi-line text' },
    { type: 'number' as FieldType, label: 'Number', icon: Hash, description: 'Numeric input' },
    { type: 'select' as FieldType, label: 'Select Dropdown', icon: ListOrdered, description: 'Dropdown list' },
    { type: 'checkbox' as FieldType, label: 'Checkbox', icon: CheckSquare, description: 'Yes/No toggle' },
    { type: 'date' as FieldType, label: 'Date Picker', icon: Calendar, description: 'Date selection' },
    { type: 'time' as FieldType, label: 'Time Picker', icon: Clock, description: 'Time selection' },
    { type: 'file' as FieldType, label: 'File Upload', icon: Upload, description: 'File attachment' },
    { type: 'parameter_link' as FieldType, label: 'Parameter Link', icon: Link2, description: 'Link to parameter specs' },
];

interface FieldPaletteProps {
    onAddField: (fieldType: FieldType) => void;
}

export function FieldPalette({ onAddField }: FieldPaletteProps) {
    return (
        <div className="space-y-4">
            <div>
                <h3 className="font-semibold text-sm mb-2">Field Types</h3>
                <p className="text-xs text-muted-foreground mb-4">
                    Click to add fields
                </p>
            </div>

            <div className="space-y-2">
                {fieldTypes.map((field) => {
                    const Icon = field.icon;
                    return (
                        <div
                            key={field.type}
                            onClick={() => onAddField(field.type)}
                            className="group cursor-pointer p-3 border rounded-md hover:bg-accent hover:border-primary transition-colors"
                        >
                            <div className="flex items-start gap-2">
                                <Icon className="h-4 w-4 mt-0.5 text-muted-foreground group-hover:text-primary" />
                                <div className="flex-1 min-w-0">
                                    <div className="text-sm font-medium">{field.label}</div>
                                    <div className="text-xs text-muted-foreground">{field.description}</div>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
