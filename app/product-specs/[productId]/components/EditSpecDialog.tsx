/**
 * Edit Specification Dialog - Epic 4.2
 * Edit specification metadata with version control
 */

'use client';

import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, AlertTriangle } from 'lucide-react';
import { createSpecificationVersion, type Specification } from '@/lib/queries/specifications';
import { toast } from 'sonner';

interface EditSpecDialogProps {
    isOpen: boolean;
    onClose: () => void;
    specification: Specification;
    onSuccess: () => void;
}

export function EditSpecDialog({
    isOpen,
    onClose,
    specification,
    onSuccess,
}: EditSpecDialogProps) {
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        description: '',
    });

    useEffect(() => {
        if (specification) {
            setFormData({
                name: specification.name || '',
                description: specification.description || '',
            });
        }
    }, [specification, isOpen]);

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        setLoading(true);

        try {
            if (!formData.name.trim()) {
                throw new Error('Nome da especificação é obrigatório');
            }

            // Create new version
            await createSpecificationVersion(specification.id, {
                name: formData.name.trim(),
                description: formData.description.trim() || null,
            } as any);

            toast.success(`Nova versão criada (v${specification.version + 1})`);
            onSuccess();
        } catch (error: any) {
            console.error('Error updating specification:', error);
            toast.error(error.message || 'Erro ao atualizar especificação');
        } finally {
            setLoading(false);
        }
    }

    const phaseLabel = specification.phase === 'intermediate'
        ? 'Produto Intermédio'
        : 'Produto Acabado';

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                    <DialogTitle>Editar Especificação</DialogTitle>
                    <DialogDescription>
                        {phaseLabel} • Versão atual: v{specification.version}
                    </DialogDescription>
                </DialogHeader>

                <Alert className="border-amber-500/50 bg-amber-500/10">
                    <AlertTriangle className="h-4 w-4 text-amber-600" />
                    <AlertDescription className="text-xs text-amber-700">
                        <strong>Controlo de Versão:</strong> Editar esta especificação criará uma nova versão (v{specification.version + 1}).
                        A versão anterior será mantida para análises históricas.
                    </AlertDescription>
                </Alert>

                <form onSubmit={handleSubmit} className="space-y-4">
                    {/* Specification Name */}
                    <div className="space-y-2">
                        <Label htmlFor="name">
                            Nome da Especificação <span className="text-destructive">*</span>
                        </Label>
                        <Input
                            id="name"
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            placeholder="Ex: Especificação Coca-Cola Original"
                            required
                        />
                        <p className="text-xs text-muted-foreground">
                            Atual: {specification.name}
                        </p>
                    </div>

                    {/* Description */}
                    <div className="space-y-2">
                        <Label htmlFor="description">Descrição</Label>
                        <Textarea
                            id="description"
                            value={formData.description}
                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                            placeholder="Descrição opcional da especificação..."
                            rows={3}
                        />
                    </div>

                    {/* Version Info */}
                    <div className="p-3 bg-muted rounded-lg space-y-1 text-sm">
                        <p><strong>Fase:</strong> {phaseLabel}</p>
                        <p><strong>Versão Atual:</strong> v{specification.version}</p>
                        <p><strong>Nova Versão:</strong> v{specification.version + 1}</p>
                        <p className="text-xs text-muted-foreground mt-2">
                            • Parâmetros serão copiados para a nova versão<br />
                            • Análises antigas mantêm referência à v{specification.version}<br />
                            • Novas análises usarão v{specification.version + 1}
                        </p>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-2 pt-4">
                        <Button type="submit" disabled={loading} className="flex-1">
                            {loading ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    A criar versão...
                                </>
                            ) : (
                                `Criar v${specification.version + 1}`
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
