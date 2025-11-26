/**
 * Edit Lot Dialog - Epic 1.2
 * Allows authorized users to edit non-closed lot details
 */

'use client';

import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Loader2 } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { toast } from 'sonner';

interface EditLotDialogProps {
    isOpen: boolean;
    onClose: () => void;
    lot: any;
    onSuccess: () => void;
}

export function EditLotDialog({ isOpen, onClose, lot, onSuccess }: EditLotDialogProps) {
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        production_line: '',
        shift: '',
        status: '',
    });

    useEffect(() => {
        if (lot) {
            setFormData({
                production_line: lot.production_line || '',
                shift: lot.shift || '',
                status: lot.status || 'draft',
            });
        }
    }, [lot]);

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        setLoading(true);

        try {
            const supabase = createClient();

            const { error } = await supabase
                .from('production_lots')
                .update({
                    production_line: formData.production_line || null,
                    shift: formData.shift || null,
                    status: formData.status,
                })
                .eq('id', lot.id);

            if (error) throw error;

            toast.success('Lote atualizado com sucesso');
            onSuccess();
            onClose();
        } catch (error) {
            console.error('Error updating lot:', error);
            toast.error('Erro ao atualizar lote');
        } finally {
            setLoading(false);
        }
    }

    if (!lot) return null;

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                    <DialogTitle>Editar Lote</DialogTitle>
                    <DialogDescription>
                        Atualize os detalhes do lote de produção
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-4">
                    {/* Read-only fields */}
                    <div className="space-y-2">
                        <Label>Código do Lote (não editável)</Label>
                        <Input value={lot.code} disabled className="bg-muted" />
                    </div>

                    <div className="space-y-2">
                        <Label>Produto (não editável)</Label>
                        <Input value={lot.product?.name || ''} disabled className="bg-muted" />
                    </div>

                    {/* Editable fields */}
                    <div className="space-y-2">
                        <Label htmlFor="production_line">Linha de Produção</Label>
                        <Input
                            id="production_line"
                            value={formData.production_line}
                            onChange={(e) => setFormData({ ...formData, production_line: e.target.value })}
                            placeholder="Ex: Linha 1"
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="shift">Turno</Label>
                        <Select
                            value={formData.shift}
                            onValueChange={(value) => setFormData({ ...formData, shift: value })}
                        >
                            <SelectTrigger id="shift">
                                <SelectValue placeholder="Selecione o turno" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="morning">Manhã</SelectItem>
                                <SelectItem value="afternoon">Tarde</SelectItem>
                                <SelectItem value="night">Noite</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="status">Estado</Label>
                        <Select
                            value={formData.status}
                            onValueChange={(value) => setFormData({ ...formData, status: value })}
                        >
                            <SelectTrigger id="status">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="draft">Draft</SelectItem>
                                <SelectItem value="on_hold">On Hold</SelectItem>
                                <SelectItem value="active">Active</SelectItem>
                                <SelectItem value="completed">Completed</SelectItem>
                                <SelectItem value="cancelled">Cancelled</SelectItem>
                                <SelectItem value="concluido">Concluído</SelectItem>
                                <SelectItem value="bloqueado">Bloqueado</SelectItem>
                            </SelectContent>
                        </Select>
                        <p className="text-xs text-muted-foreground">
                            Para encerrar o lote, use o botão "Fechar Lote"
                        </p>
                    </div>

                    <div className="flex gap-2 pt-4">
                        <Button type="submit" disabled={loading} className="flex-1">
                            {loading ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    A atualizar...
                                </>
                            ) : (
                                'Atualizar Lote'
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
