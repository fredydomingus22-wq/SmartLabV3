"use client"

import { useState, useEffect } from "react";
import { ProductSpec, CreateProductSpecData } from "@/types/product";
import { Parameter, getParameters } from "@/lib/queries/parameters-list";
import { checkSpecExists } from "@/lib/queries/product-specs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import {
    Command,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
} from "@/components/ui/command";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/components/ui/use-toast";
import { Check, ChevronsUpDown, Loader2, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";

interface SpecsFormProps {
    productId: string;
    spec?: ProductSpec | null;
    onSubmit: (data: CreateProductSpecData) => Promise<void>;
    onCancel: () => void;
}

export function SpecsForm({ productId, spec, onSubmit, onCancel }: SpecsFormProps) {
    const { toast } = useToast();
    const isEditing = !!spec;

    const [parameters, setParameters] = useState<Parameter[]>([]);
    const [loadingParams, setLoadingParams] = useState(true);
    const [loading, setLoading] = useState(false);
    const [openCombobox, setOpenCombobox] = useState(false);

    const [formData, setFormData] = useState<CreateProductSpecData>({
        product_id: productId,
        parameter_id: spec?.parameter_id || "",
        spec_min: spec?.spec_min ?? undefined,
        spec_target: spec?.spec_target ?? undefined,
        spec_max: spec?.spec_max ?? undefined,
        unit: spec?.unit || "",
        test_frequency: spec?.test_frequency,
        test_level: spec?.test_level,
        is_critical: spec?.is_critical || false,
        notes: spec?.notes || "",
    });

    const [validationError, setValidationError] = useState<string>("");

    useEffect(() => {
        loadParameters();
    }, []);

    useEffect(() => {
        validateLimits();
    }, [formData.spec_min, formData.spec_target, formData.spec_max]);

    const loadParameters = async () => {
        try {
            const params = await getParameters();
            setParameters(params);
        } catch (error) {
            console.error("Error loading parameters:", error);
            toast({
                title: "Erro",
                description: "Erro ao carregar parâmetros",
                variant: "destructive",
            });
        } finally {
            setLoadingParams(false);
        }
    };

    const validateLimits = () => {
        const { spec_min, spec_target, spec_max } = formData;

        if (spec_min !== undefined && spec_target !== undefined && spec_min >= spec_target) {
            setValidationError("Mínimo deve ser menor que o Alvo");
            return false;
        }

        if (spec_target !== undefined && spec_max !== undefined && spec_target >= spec_max) {
            setValidationError("Alvo deve ser menor que o Máximo");
            return false;
        }

        if (spec_min !== undefined && spec_max !== undefined && spec_min >= spec_max) {
            setValidationError("Mínimo deve ser menor que o Máximo");
            return false;
        }

        setValidationError("");
        return true;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!formData.parameter_id) {
            toast({
                title: "Erro de Validação",
                description: "Selecione um parâmetro",
                variant: "destructive",
            });
            return;
        }

        if (!validateLimits()) {
            toast({
                title: "Erro de Validação",
                description: "Corrija os limites de especificação",
                variant: "destructive",
            });
            return;
        }

        // Check if spec already exists (only for new specs)
        if (!isEditing) {
            const exists = await checkSpecExists(
                productId,
                formData.parameter_id,
                formData.test_level
            );
            if (exists) {
                toast({
                    title: "Erro de Validação",
                    description: "Já existe uma especificação para este parâmetro neste nível de teste",
                    variant: "destructive",
                });
                return;
            }
        }

        setLoading(true);
        try {
            await onSubmit(formData);
        } catch (error: any) {
            console.error("Error submitting spec:", error);
            toast({
                title: "Erro",
                description: error.message || "Erro ao guardar especificação",
                variant: "destructive",
            });
            // throw error; // Don't throw, we handled it
        } finally {
            setLoading(false);
        }
    };

    const selectedParameter = parameters.find(p => p.id === formData.parameter_id);

    return (
        <Card>
            <CardHeader>
                <CardTitle>
                    {isEditing ? "Editar Especificação" : "Nova Especificação"}
                </CardTitle>
            </CardHeader>
            <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Parameter Selection */}
                    <div className="space-y-2">
                        <Label>Parâmetro *</Label>
                        <Popover open={openCombobox} onOpenChange={setOpenCombobox}>
                            <PopoverTrigger asChild>
                                <Button
                                    variant="outline"
                                    role="combobox"
                                    aria-expanded={openCombobox}
                                    className="w-full justify-between"
                                    disabled={isEditing || loadingParams}
                                >
                                    {selectedParameter ? selectedParameter.name : "Selecionar parâmetro..."}
                                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-full p-0">
                                <Command>
                                    <CommandInput placeholder="Pesquisar parâmetro..." />
                                    <CommandEmpty>Nenhum parâmetro encontrado</CommandEmpty>
                                    <CommandGroup className="max-h-64 overflow-auto">
                                        {parameters.map((param) => (
                                            <CommandItem
                                                key={param.id}
                                                value={param.name}
                                                onSelect={() => {
                                                    setFormData({
                                                        ...formData,
                                                        parameter_id: param.id,
                                                        unit: param.unit || formData.unit
                                                    });
                                                    setOpenCombobox(false);
                                                }}
                                            >
                                                <Check
                                                    className={cn(
                                                        "mr-2 h-4 w-4",
                                                        formData.parameter_id === param.id ? "opacity-100" : "opacity-0"
                                                    )}
                                                />
                                                <div>
                                                    <div>{param.name}</div>
                                                    {param.description && (
                                                        <div className="text-xs text-muted-foreground">
                                                            {param.description}
                                                        </div>
                                                    )}
                                                </div>
                                            </CommandItem>
                                        ))}
                                    </CommandGroup>
                                </Command>
                            </PopoverContent>
                        </Popover>
                        {selectedParameter?.description && (
                            <p className="text-xs text-muted-foreground">
                                {selectedParameter.description}
                            </p>
                        )}
                    </div>

                    {/* Specification Limits */}
                    <div className="space-y-4 pt-4 border-t">
                        <h3 className="text-sm font-medium">Limites de Especificação</h3>

                        <div className="grid grid-cols-3 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="spec_min">Mínimo</Label>
                                <Input
                                    id="spec_min"
                                    type="number"
                                    step="any"
                                    value={formData.spec_min ?? ""}
                                    onChange={(e) => setFormData({
                                        ...formData,
                                        spec_min: e.target.value ? parseFloat(e.target.value) : undefined
                                    })}
                                    placeholder="ex: 2.5"
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="spec_target">Alvo *</Label>
                                <Input
                                    id="spec_target"
                                    type="number"
                                    step="any"
                                    value={formData.spec_target ?? ""}
                                    onChange={(e) => setFormData({
                                        ...formData,
                                        spec_target: e.target.value ? parseFloat(e.target.value) : undefined
                                    })}
                                    placeholder="ex: 3.0"
                                    className="border-primary"
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="spec_max">Máximo</Label>
                                <Input
                                    id="spec_max"
                                    type="number"
                                    step="any"
                                    value={formData.spec_max ?? ""}
                                    onChange={(e) => setFormData({
                                        ...formData,
                                        spec_max: e.target.value ? parseFloat(e.target.value) : undefined
                                    })}
                                    placeholder="ex: 3.5"
                                />
                            </div>
                        </div>

                        {validationError && (
                            <div className="flex items-center gap-2 text-sm text-red-500">
                                <AlertCircle className="h-4 w-4" />
                                {validationError}
                            </div>
                        )}

                        <div className="space-y-2">
                            <Label htmlFor="unit">Unidade</Label>
                            <Input
                                id="unit"
                                value={formData.unit || ""}
                                onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                                placeholder="ex: pH, mg/L, °C"
                            />
                        </div>
                    </div>

                    {/* Test Configuration */}
                    <div className="space-y-4 pt-4 border-t">
                        <h3 className="text-sm font-medium">Configuração de Teste</h3>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="test_level">Nível de Teste</Label>
                                <Select
                                    value={formData.test_level || ""}
                                    onValueChange={(value) => setFormData({
                                        ...formData,
                                        test_level: value as any
                                    })}
                                >
                                    <SelectTrigger id="test_level">
                                        <SelectValue placeholder="Selecionar nível" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="incoming">Entrada</SelectItem>
                                        <SelectItem value="in_process">Em Processo</SelectItem>
                                        <SelectItem value="finished">Produto Final</SelectItem>
                                        <SelectItem value="line">Linha</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="test_frequency">Frequência de Teste</Label>
                                <Select
                                    value={formData.test_frequency || ""}
                                    onValueChange={(value) => setFormData({
                                        ...formData,
                                        test_frequency: value as any
                                    })}
                                >
                                    <SelectTrigger id="test_frequency">
                                        <SelectValue placeholder="Selecionar frequência" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="per_batch">Por Lote</SelectItem>
                                        <SelectItem value="daily">Diário</SelectItem>
                                        <SelectItem value="weekly">Semanal</SelectItem>
                                        <SelectItem value="per_tank">Por Tanque</SelectItem>
                                        <SelectItem value="per_sample">Por Amostra</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        <div className="flex items-center space-x-2">
                            <Checkbox
                                id="is_critical"
                                checked={formData.is_critical}
                                onCheckedChange={(checked) => setFormData({
                                    ...formData,
                                    is_critical: checked as boolean
                                })}
                            />
                            <Label
                                htmlFor="is_critical"
                                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                            >
                                Parâmetro Crítico
                                <span className="text-xs text-muted-foreground block mt-1">
                                    Falha neste parâmetro bloqueia a liberação do produto
                                </span>
                            </Label>
                        </div>
                    </div>

                    {/* Notes */}
                    <div className="space-y-2 pt-4 border-t">
                        <Label htmlFor="notes">Notas</Label>
                        <Textarea
                            id="notes"
                            value={formData.notes || ""}
                            onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                            placeholder="Notas adicionais sobre este parâmetro..."
                            rows={3}
                        />
                    </div>

                    {/* Actions */}
                    <div className="flex gap-3 pt-4">
                        <Button
                            type="submit"
                            disabled={loading || !!validationError || !formData.parameter_id}
                            className="min-w-[120px]"
                        >
                            {loading ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    A Guardar...
                                </>
                            ) : (
                                isEditing ? "Atualizar" : "Adicionar"
                            )}
                        </Button>
                        <Button
                            type="button"
                            variant="outline"
                            onClick={onCancel}
                            disabled={loading}
                        >
                            Cancelar
                        </Button>
                    </div>
                </form>
            </CardContent>
        </Card>
    );
}
