import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { FormField } from "@/types/form-builder";
import { X, Save } from "lucide-react";
import { useState, useEffect } from "react";

interface FieldConfigPanelProps {
    field: FormField | null;
    onClose: () => void;
    onUpdate: (field: Partial<FormField>) => void;
}

export function FieldConfigPanel({ field, onClose, onUpdate }: FieldConfigPanelProps) {
    const [config, setConfig] = useState<Partial<FormField>>({});

    useEffect(() => {
        if (field) {
            setConfig(field);
        }
    }, [field]);

    if (!field) {
        return (
            <div className="flex items-center justify-center h-full text-center p-6">
                <div className="text-muted-foreground space-y-2">
                    <Settings className="h-12 w-12 mx-auto opacity-20" />
                    <p className="text-sm">Select a field to configure its properties</p>
                </div>
            </div>
        );
    }

    const handleSave = () => {
        if (!config.field_key || !config.label) {
            alert('Field Key and Label are required');
            return;
        }
        onUpdate(config);
    };

    return (
        <div className="space-y-4">
            {/* Header */}
            <div className="flex items-center justify-between pb-3 border-b">
                <h3 className="font-semibold">Field Settings</h3>
                <Button
                    size="sm"
                    variant="ghost"
                    onClick={onClose}
                    className="h-8 w-8 p-0"
                >
                    <X className="h-4 w-4" />
                </Button>
            </div>

            {/* Configuration Form */}
            <div className="space-y-4">
                {/* Field Key */}
                <div className="space-y-2">
                    <Label htmlFor="field_key">
                        Field Key <span className="text-destructive">*</span>
                    </Label>
                    <Input
                        id="field_key"
                        value={config.field_key || ''}
                        onChange={(e) => setConfig({ ...config, field_key: e.target.value.toLowerCase().replace(/\s/g, '_') })}
                        placeholder="e.g., ph_value"
                    />
                    <p className="text-xs text-muted-foreground">
                        Unique identifier (no spaces, lowercase)
                    </p>
                </div>

                {/* Label */}
                <div className="space-y-2">
                    <Label htmlFor="label">
                        Label <span className="text-destructive">*</span>
                    </Label>
                    <Input
                        id="label"
                        value={config.label || ''}
                        onChange={(e) => setConfig({ ...config, label: e.target.value })}
                        placeholder="e.g., pH Value"
                    />
                </div>

                {/* Field Type */}
                <div className="space-y-2">
                    <Label htmlFor="field_type">Field Type</Label>
                    <Select
                        value={config.field_type}
                        onValueChange={(value) => setConfig({ ...config, field_type: value as any })}
                    >
                        <SelectTrigger>
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="text">Text Input</SelectItem>
                            <SelectItem value="textarea">Text Area</SelectItem>
                            <SelectItem value="number">Number</SelectItem>
                            <SelectItem value="select">Select Dropdown</SelectItem>
                            <SelectItem value="checkbox">Checkbox</SelectItem>
                            <SelectItem value="date">Date</SelectItem>
                            <SelectItem value="time">Time</SelectItem>
                            <SelectItem value="file">File Upload</SelectItem>
                            <SelectItem value="parameter_link">Parameter Link</SelectItem>
                        </SelectContent>
                    </Select>
                </div>

                {/* Placeholder */}
                <div className="space-y-2">
                    <Label htmlFor="placeholder">Placeholder</Label>
                    <Input
                        id="placeholder"
                        value={config.placeholder || ''}
                        onChange={(e) => setConfig({ ...config, placeholder: e.target.value })}
                        placeholder="Enter placeholder text..."
                    />
                </div>

                {/* Help Text */}
                <div className="space-y-2">
                    <Label htmlFor="help_text">Help Text</Label>
                    <Textarea
                        id="help_text"
                        value={config.help_text || ''}
                        onChange={(e) => setConfig({ ...config, help_text: e.target.value })}
                        placeholder="Additional instructions..."
                        rows={2}
                    />
                </div>

                {/* Required Toggle */}
                <Card className="p-3">
                    <div className="flex items-center justify-between">
                        <div>
                            <Label htmlFor="is_required" className="font-medium cursor-pointer">
                                Required Field
                            </Label>
                            <p className="text-xs text-muted-foreground mt-0.5">
                                User must fill this field
                            </p>
                        </div>
                        <input
                            type="checkbox"
                            id="is_required"
                            checked={config.is_required}
                            onChange={(e) => setConfig({ ...config, is_required: e.target.checked })}
                            className="h-4 w-4 cursor-pointer"
                        />
                    </div>
                </Card>

                {/* Order Index */}
                <div className="space-y-2">
                    <Label htmlFor="order_index">Display Order</Label>
                    <Input
                        id="order_index"
                        type="number"
                        value={config.order_index || 0}
                        onChange={(e) => setConfig({ ...config, order_index: parseInt(e.target.value) || 0 })}
                    />
                    <p className="text-xs text-muted-foreground">
                        Lower numbers appear first
                    </p>
                </div>

                {/* Save Button */}
                <Button onClick={handleSave} className="w-full">
                    <Save className="mr-2 h-4 w-4" />
                    Save Changes
                </Button>
            </div>
        </div>
    );
}

// Add import for Settings icon
import { Settings } from "lucide-react";
