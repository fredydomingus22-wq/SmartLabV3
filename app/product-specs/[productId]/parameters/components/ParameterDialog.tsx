/**
 * Parameter Dialog Component
 * Epic 4.1 - Add/Edit parameter form
 */

'use client';

import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2 } from 'lucide-react';
import { createParameter, updateParameter, type Parameter, type ParameterInput } from '@/lib/queries/specifications';
import { toast } from 'sonner';

interface ParameterDialogProps {
    isOpen: boolean;
    onClose: () => void;
    parameter: Parameter | null;
    specificationId: string;
    phase: 'intermediate' | 'finished';
    onSuccess: () => void;
}

export function ParameterDialog({
    isOpen,
    onClose,
    parameter,
    specificationId,
    phase,
    onSuccess,
}: ParameterDialogProps) {
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        unit: '',
        min_value: '',
        max_value: '',
        test_method: '',
    });

    useEffect(() => {
        if (parameter) {
            setFormData({
                name: parameter.name,
                unit: parameter.unit,
                min_value: parameter.min_value?.toString() || '',
                max_value: parameter.max_value?.toString() || '',
                test_method: parameter.test_method,
            });
        } else {
            setFormData({
                name: '',
                unit: '',
                min_value: '',
                max_value: '',
                test_method: '',
            });
        }
    }, [parameter, isOpen]);

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        setLoading(true);

        try {
            // Validation
            if (!formData.name.trim()) {
                throw new Error('Nome do parâmetro é obrigatório');
            }
            if (!formData.unit.trim()) {
                throw new Error('Unidade é obrigatória');
            }
            if (!formData.test_method.trim()) {
                throw new Error('Método de teste é obrigatório');
            }

            const minValue = formData.min_value ? parseFloat(formData.min_value) : null;
            const maxValue = formData.max_value ? parseFloat(formData.max_value) : null;

            if (minValue !== null && maxValue !== null && minValue >= maxValue) {
                throw new Error('Valor mínimo deve ser menor que o máximo');
            }

            const paramData: ParameterInput = {
                specification_id: specificationId,
                name: formData.name.trim(),
                unit: formData.unit.trim(),
                min_value: minValue,
                max_value: maxValue,
                test_method: formData.test_method.trim(),
            };

            if (parameter) {
                // Update existing
                await updateParameter(parameter.id, paramData);
                toast.success('Parâmetro atualizado');
            } else {
                // Create new
                await createParameter(paramData);
                toast.success('Parâmetro criado');
            }

            onSuccess();
        } catch (error: any) {
            console.error('Error saving parameter:', error);
            toast.error(error.message || 'Erro ao gravar parâmetro');
        } finally {
            setLoading(false);
        }
    }

    const phaseLabel = phase === 'intermediate' ? 'Produto Intermédio' : 'Produto Acabado';

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                    <DialogTitle>
                        {parameter ? 'Editar Parâmetro' : 'Adicionar Parâmetro'}
                    </DialogTitle>
                    <DialogDescription>
                        {phaseLabel} • Defina os limites e método de teste
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-4">
                    {/* Parameter Name */}
                    <div className="space-y-2">
                        <Label htmlFor="name">
                            Nome do Parâmetro <span className="text-destructive">*</span>
                        </Label>
                        <Input
                            id="name"
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            placeholder="Ex: pH, Brix, Densidade"
                            required
                        />
                    </div>

                    {/* Unit */}
                    <div className="space-y-2">
                        <Label htmlFor="unit">
                            Unidade <span className="text-destructive">*</span>
                        </Label>
                        <Input
                            id="unit"
                            value={formData.unit}
                            onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                            placeholder="Ex: pH, °Bx, g/mL"
                            required
                        />
                    </div>

                    {/* Min and Max Values */}
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="min_value">Valor Mínimo</Label>
                            <Input
                                id="min_value"
                                type="number"
                                step="any"
                                value={formData.min_value}
                                onChange={(e) => setFormData({ ...formData, min_value: e.target.value })}
                                placeholder="Ex: 2.5"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="max_value">Valor Máximo</Label>
                            <Input
                                id="max_value"
                                type="number"
                                step="any"
                                value={formData.max_value}
                                onChange={(e) => setFormData({ ...formData, max_value: e.target.value })}
                                placeholder="Ex: 3.5"
                            />
                        </div>
                    </div>

                    {/* Test Method */}
                    <div className="space-y-2">
                        <Label htmlFor="test_method">
                            Método de Teste <span className="text-destructive">*</span>
                        </Label>
                        <Input
                            id="test_method"
                            value={formData.test_method}
                            onChange={(e) => setFormData({ ...formData, test_method: e.target.value })}
                            placeholder="Ex: pH meter, Refractometer"
                            required
                        />
                    </div>

                    {/* Actions */}
                    <div className="flex gap-2 pt-4">
                        <Button type="submit" disabled={loading} className="flex-1">
                            {loading ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    A gravar...
                                </>
                            ) : parameter ? (
                                'Atualizar Parâmetro'
                            ) : (
                                'Criar Parâmetro'
                            )}
                        </Button>
                        <Button type="button" variant="outline" onClick={onClose} disabled={loading}>
                            Cancelar
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
}
