/**
 * Close Lot Dialog - Epic 1.3
 * Validates and closes production lots with comprehensive checks
 */

'use client';

import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, CheckCircle, XCircle, AlertTriangle, Lock } from 'lucide-react';
import { validateLotClosure, closeLot, LotClosureValidation } from '@/lib/queries/lot-validation';
import { toast } from 'sonner';

interface CloseLotDialogProps {
    isOpen: boolean;
    onClose: () => void;
    lot: any;
    onSuccess: () => void;
}

export function CloseLotDialog({ isOpen, onClose, lot, onSuccess }: CloseLotDialogProps) {
    const [loading, setLoading] = useState(false);
    const [validating, setValidating] = useState(false);
    const [validation, setValidation] = useState<LotClosureValidation | null>(null);
    const [closureNotes, setClosureNotes] = useState('');

    useEffect(() => {
        if (isOpen && lot) {
            runValidation();
        }
    }, [isOpen, lot]);

    async function runValidation() {
        setValidating(true);
        try {
            const result = await validateLotClosure(lot.id);
            setValidation(result);
        } catch (error) {
            console.error('Validation error:', error);
            toast.error('Erro ao validar encerramento');
        } finally {
            setValidating(false);
        }
    }

    async function handleCloseLot() {
        if (!validation?.canClose) return;

        setLoading(true);
        try {
            await closeLot(lot.id, closureNotes);
            toast.success('Lote encerrado com sucesso');
            onSuccess();
            onClose();
        } catch (error) {
            console.error('Error closing lot:', error);
            toast.error('Erro ao encerrar lote');
        } finally {
            setLoading(false);
        }
    }

    if (!lot) return null;

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[600px]">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <Lock className="h-5 w-5" />
                        Fechar Lote de Produção
                    </DialogTitle>
                    <DialogDescription>
                        Valide e encerre o lote: <strong>{lot.code}</strong>
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-4">
                    {/* Validation Checklist */}
                    {validating ? (
                        <div className="flex items-center justify-center py-8">
                            <Loader2 className="h-8 w-8 animate-spin text-primary" />
                            <p className="ml-3 text-muted-foreground">A validar...</p>
                        </div>
                    ) : validation ? (
                        <div className="space-y-3">
                            <h3 className="font-semibold text-sm">Validações de Encerramento:</h3>

                            {/* Pending Samples Check */}
                            <div className="flex items-start gap-2 p-3 rounded-lg border bg-card">
                                {validation.pendingSamples === 0 ? (
                                    <CheckCircle className="h-5 w-5 text-emerald-600 flex-shrink-0 mt-0.5" />
                                ) : (
                                    <XCircle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
                                )}
                                <div className="flex-1">
                                    <p className="text-sm font-medium">Amostras Analisadas</p>
                                    <p className="text-xs text-muted-foreground">
                                        {validation.pendingSamples === 0
                                            ? 'Todas as amostras foram analisadas'
                                            : `${validation.pendingSamples} amostra(s) pendente(s)`}
                                    </p>
                                </div>
                            </div>

                            {/* Unvalidated Analyses Check */}
                            <div className="flex items-start gap-2 p-3 rounded-lg border bg-card">
                                {validation.unvalidatedAnalyses === 0 ? (
                                    <CheckCircle className="h-5 w-5 text-emerald-600 flex-shrink-0 mt-0.5" />
                                ) : (
                                    <XCircle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
                                )}
                                <div className="flex-1">
                                    <p className="text-sm font-medium">Análises Validadas</p>
                                    <p className="text-xs text-muted-foreground">
                                        {validation.unvalidatedAnalyses === 0
                                            ? 'Todas as análises foram validadas com assinatura digital'
                                            : `${validation.unvalidatedAnalyses} análise(s) não validada(s)`}
                                    </p>
                                </div>
                            </div>

                            {/* Unresolved Failures Check */}
                            <div className="flex items-start gap-2 p-3 rounded-lg border bg-card">
                                {validation.unresolvedFailures === 0 ? (
                                    <CheckCircle className="h-5 w-5 text-emerald-600 flex-shrink-0 mt-0.5" />
                                ) : (
                                    <XCircle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
                                )}
                                <div className="flex-1">
                                    <p className="text-sm font-medium">Falhas Resolvidas</p>
                                    <p className="text-xs text-muted-foreground">
                                        {validation.unresolvedFailures === 0
                                            ? 'Todas as análises reprovadas têm repeat aprovado'
                                            : `${validation.unresolvedFailures} falha(s) sem repeat aprovado`}
                                    </p>
                                </div>
                            </div>

                            {/* Overall Status */}
                            {validation.canClose ? (
                                <Alert className="border-emerald-500/50 bg-emerald-500/10">
                                    <CheckCircle className="h-4 w-4 text-emerald-600" />
                                    <AlertDescription className="text-emerald-700">
                                        <strong>Lote pronto para encerramento</strong>
                                        <p className="text-xs mt-1">Todas as validações passaram com sucesso.</p>
                                    </AlertDescription>
                                </Alert>
                            ) : (
                                <Alert variant="destructive">
                                    <AlertTriangle className="h-4 w-4" />
                                    <AlertDescription>
                                        <strong>Não é possível encerrar o lote</strong>
                                        <ul className="text-xs mt-2 list-disc list-inside space-y-1">
                                            {validation.issues.map((issue, idx) => (
                                                <li key={idx}>{issue}</li>
                                            ))}
                                        </ul>
                                    </AlertDescription>
                                </Alert>
                            )}
                        </div>
                    ) : null}

                    {/* Closure Notes */}
                    {validation?.canClose && (
                        <div className="space-y-2">
                            <Label htmlFor="closure_notes">Notas de Encerramento (Opcional)</Label>
                            <Textarea
                                id="closure_notes"
                                value={closureNotes}
                                onChange={(e) => setClosureNotes(e.target.value)}
                                placeholder="Observações sobre o encerramento do lote..."
                                rows={3}
                            />
                        </div>
                    )}

                    {/* Warning */}
                    {validation?.canClose && (
                        <Alert className="border-amber-500/50 bg-amber-500/10">
                            <AlertTriangle className="h-4 w-4 text-amber-600" />
                            <AlertDescription className="text-amber-700">
                                <strong>Atenção!</strong> O encerramento do lote é <strong>irreversível</strong>.
                                Não será possível criar novas amostras ou editar este lote após encer ramento.
                            </AlertDescription>
                        </Alert>
                    )}

                    {/* Actions */}
                    <div className="flex gap-2 pt-4">
                        <Button
                            onClick={handleCloseLot}
                            disabled={!validation?.canClose || loading}
                            variant="default"
                            className="flex-1"
                        >
                            {loading ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    A encerrar...
                                </>
                            ) : (
                                <>
                                    <Lock className="mr-2 h-4 w-4" />
                                    Confirmar Encerramento
                                </>
                            )}
                        </Button>
                        <Button variant="outline" onClick={onClose} disabled={loading}>
                            Cancelar
                        </Button>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}
