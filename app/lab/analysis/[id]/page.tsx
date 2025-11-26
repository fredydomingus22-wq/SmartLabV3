/**
 * Analysis Execution Page - Epic 3.1, 3.2, 3.3
 * Complete analysis workflow with digital signatures and repeat analysis
 */

'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { AppShell } from '@/components/layout/AppShell';
import { SectionHeader } from '@/components/ui/SectionHeader';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import {
    Beaker, Save, Shield, AlertCircle, CheckCircle, XCircle,
    Loader2, Lock, ArrowLeft, RefreshCw, AlertTriangle,
} from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { DigitalSignatureModal } from '@/components/lab/DigitalSignatureModal';
import { usePermissions } from '@/lib/hooks/usePermissions';
import { toast } from 'sonner';

interface Sample {
    id: string;
    code: string;
    phase: 'intermediate' | 'finished';
    product_id: string;
    status: string;
    product?: { name: string; sku: string };
}

interface Parameter {
    id: string;
    name: string;
    unit: string;
    min_value: number | null;
    max_value: number | null;
    test_method: string;
}

interface AnalysisResult {
    parameter_id: string;
    result_value: string;
    status: 'approved' | 'failed' | 'deviation';
    notes: string;
}

export default function AnalysisExecutionPage() {
    const params = useParams();
    const router = useRouter();
    const sampleId = params.id as string;
    const { permissions, isLoading: permissionsLoading } = usePermissions();

    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [sample, setSample] = useState<Sample | null>(null);
    const [parameters, setParameters] = useState<Parameter[]>([]);
    const [results, setResults] = useState<Map<string, AnalysisResult>>(new Map());
    const [showSignatureModal, setShowSignatureModal] = useState(false);
    const [analysisId, setAnalysisId] = useState<string | null>(null);
    const [isLocked, setIsLocked] = useState(false);
    const [validatedBy, setValidatedBy] = useState<string | null>(null);
    const [validatedAt, setValidatedAt] = useState<string | null>(null);

    // Epic 3.3 - Repeat analysis tracking
    const [parentAnalysisId, setParentAnalysisId] = useState<string | null>(null);
    const [repeatCount, setRepeatCount] = useState(0);
    const [hasFailedResults, setHasFailedResults] = useState(false);

    useEffect(() => {
        if (sampleId) loadSampleAndParameters();
    }, [sampleId]);

    async function loadSampleAndParameters() {
        setLoading(true);
        try {
            const supabase = createClient();
            const { data: sampleData, error: sampleError } = await supabase
                .from('samples')
                .select('id, code, phase, product_id, status, products(name, sku)')
                .eq('id', sampleId)
                .single();

            if (sampleError) throw sampleError;
            setSample({ ...sampleData, product: sampleData.products as any });

            const { data: specsData, error: specsError } = await supabase
                .from('specifications')
                .select('id')
                .eq('product_id', sampleData.product_id)
                .eq('phase', sampleData.phase)
                .eq('is_active', true)
                .single();

            if (specsError) {
                toast.warning('Nenhuma especificação ativa encontrada');
                setParameters([]);
                return;
            }

            const { data: paramsData } = await supabase
                .from('parameters')
                .select('id, name, unit, min_value, max_value, test_method')
                .eq('specification_id', specsData.id)
                .order('name');

            setParameters(paramsData || []);
            const initialResults = new Map<string, AnalysisResult>();
            paramsData?.forEach(param => {
                initialResults.set(param.id, {
                    parameter_id: param.id,
                    result_value: '',
                    status: 'approved',
                    notes: '',
                });
            });
            setResults(initialResults);

            // Check existing analysis
            const { data: existingAnalysis } = await supabase
                .from('lab_analysis')
                .select('id, is_locked, validated_by, validated_at, parent_analysis_id, validation_status')
                .eq('sample_id', sampleId)
                .maybeSingle();

            if (existingAnalysis) {
                setAnalysisId(existingAnalysis.id);
                setIsLocked(existingAnalysis.is_locked || false);
                setValidatedBy(existingAnalysis.validated_by);
                setValidatedAt(existingAnalysis.validated_at);
                setParentAnalysisId(existingAnalysis.parent_analysis_id);
                setHasFailedResults(existingAnalysis.validation_status === 'failed');

                if (existingAnalysis.parent_analysis_id) {
                    const { count } = await supabase
                        .from('lab_analysis')
                        .select('*', { count: 'exact', head: true })
                        .eq('sample_id', sampleId);
                    setRepeatCount(count ? count - 1 : 0);
                }
            }
        } catch (error) {
            console.error('Error:', error);
            toast.error('Erro ao carregar dados');
        } finally {
            setLoading(false);
        }
    }

    function updateResult(parameterId: string, field: keyof AnalysisResult, value: any) {
        if (isLocked) {
            toast.error('Análise bloqueada');
            return;
        }

        const updated = new Map(results);
        const current = updated.get(parameterId)!;
        current[field] = value;

        if (field === 'result_value' && value) {
            const param = parameters.find(p => p.id === parameterId);
            if (param) {
                const numValue = parseFloat(value);
                if (!isNaN(numValue)) {
                    if (param.min_value !== null && numValue < param.min_value) {
                        current.status = 'failed';
                    } else if (param.max_value !== null && numValue > param.max_value) {
                        current.status = 'failed';
                    } else {
                        current.status = 'approved';
                    }
                }
            }
        }

        updated.set(parameterId, current);
        setResults(updated);
    }

    async function handleSaveResults() {
        if (isLocked) return toast.error('Análise bloqueada');

        const emptyResults = Array.from(results.values()).filter(r => !r.result_value);
        if (emptyResults.length > 0) {
            return toast.error(`Preencha todos os resultados (${emptyResults.length} faltando)`);
        }

        setSubmitting(true);
        try {
            const supabase = createClient();
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) throw new Error('Not authenticated');

            const analysisRecords = Array.from(results.values()).map(result => {
                const param = parameters.find(p => p.id === result.parameter_id)!;
                return {
                    sample_id: sampleId,
                    parameter_id: result.parameter_id,
                    result_value: parseFloat(result.result_value),
                    unit: param.unit,
                    limit_min: param.min_value,
                    limit_max: param.max_value,
                    analyst_id: user.id,
                    analysis_date: new Date().toISOString(),
                    validation_status: result.status,
                    notes: result.notes || null,
                    is_locked: false,
                };
            });

            const { data: savedAnalyses, error } = await supabase
                .from('lab_analysis')
                .insert(analysisRecords)
                .select();

            if (error) throw error;

            if (savedAnalyses && savedAnalyses.length > 0) {
                setAnalysisId(savedAnalyses[0].id);
            }

            await supabase.from('samples').update({ status: 'analyzed' }).eq('id', sampleId);

            toast.success('Resultados gravados!');
            setShowSignatureModal(true);
        } catch (error) {
            console.error('Error:', error);
            toast.error('Erro ao gravar resultados');
        } finally {
            setSubmitting(false);
        }
    }

    async function handleRequestRepeat() {
        if (!sampleId || !analysisId) return;

        try {
            const supabase = createClient();
            const { data: originalSample } = await supabase
                .from('samples')
                .select('*')
                .eq('id', sampleId)
                .single();

            if (!originalSample) throw new Error('Sample not found');

            const repeatCode = `${originalSample.code}-R${repeatCount + 1}`;
            const { data: newSample, error: sampleError } = await supabase
                .from('samples')
                .insert({
                    code: repeatCode,
                    product_id: originalSample.product_id,
                    tank_id: originalSample.tank_id,
                    phase: originalSample.phase,
                    collection_date: new Date().toISOString(),
                    status: 'pending_analysis',
                    observations: `Repeat analysis - Parent: ${originalSample.code}`,
                })
                .select()
                .single();

            if (sampleError) throw sampleError;

            toast.success(`Repeat analysis criada: ${repeatCode}`);
            router.push(`/lab/analysis/${newSample.id}`);
        } catch (error) {
            console.error('Error:', error);
            toast.error('Erro ao criar repeat analysis');
        }
    }

    function handleValidationComplete(technicianId: string, technicianName: string) {
        setIsLocked(true);
        setValidatedBy(technicianId);
        setValidatedAt(new Date().toISOString());
        toast.success(`Análise validada por ${technicianName}`);
        setTimeout(() => router.push('/lab/samples'), 2000);
    }

    if (permissionsLoading || loading) {
        return (
            <AppShell>
                <div className="p-6 flex justify-center items-center h-screen">
                    <div className="text-center space-y-4">
                        <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto" />
                        <p className="text-muted-foreground">A carregar análise...</p>
                    </div>
                </div>
            </AppShell>
        );
    }

    if (!permissions.canExecuteAnalysis) {
        return (
            <AppShell>
                <div className="p-6">
                    <Alert variant="destructive">
                        <AlertCircle className="h-4 w-4" />
                        <AlertDescription>Não tem permissão para executar análises.</AlertDescription>
                    </Alert>
                </div>
            </AppShell>
        );
    }

    const failedCount = Array.from(results.values()).filter(r => r.status === 'failed').length;
    const approvedCount = Array.from(results.values()).filter(r => r.status === 'approved').length;

    return (
        <AppShell>
            <div className="p-6 space-y-6">
                <div className="flex items-center justify-between">
                    <SectionHeader
                        title={`Executar Análise: ${sample?.code || ''}`}
                        description={`${sample?.product?.name} - ${sample?.phase === 'intermediate' ? 'Produto Intermédio' : 'Produto Acabado'}`}
                    />
                    <Button variant="outline" onClick={() => router.back()}>
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        Voltar
                    </Button>
                </div>

                {/* Status Cards */}
                <div className="grid gap-4 md:grid-cols-3">
                    <Card>
                        <CardContent className="pt-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-muted-foreground">Total Parâmetros</p>
                                    <p className="text-2xl font-bold">{parameters.length}</p>
                                </div>
                                <Beaker className="h-8 w-8 text-muted-foreground" />
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="border-emerald-500/50">
                        <CardContent className="pt-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-muted-foreground">Aprovados</p>
                                    <p className="text-2xl font-bold text-emerald-600">{approvedCount}</p>
                                </div>
                                <CheckCircle className="h-8 w-8 text-emerald-600" />
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="border-red-500/50">
                        <CardContent className="pt-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-muted-foreground">Reprovados</p>
                                    <p className="text-2xl font-bold text-red-600">{failedCount}</p>
                                </div>
                                <XCircle className="h-8 w-8 text-red-600" />
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Locked Alert */}
                {isLocked && (
                    <Alert className="border-emerald-500/50 bg-emerald-500/10">
                        <Lock className="h-4 w-4 text-emerald-600" />
                        <AlertDescription>
                            <strong>Análise Validada e Bloqueada</strong>
                            {validatedAt && (
                                <p className="text-xs mt-1">
                                    Validado em {new Date(validatedAt).toLocaleString('pt-PT')}
                                </p>
                            )}
                        </AlertDescription>
                    </Alert>
                )}

                {/* Epic 3.3 - Repeat Analysis Alert */}
                {parentAnalysisId && (
                    <Alert className="border-amber-500/50 bg-amber-500/10">
                        <AlertTriangle className="h-4 w-4 text-amber-600" />
                        <AlertDescription>
                            <strong>Repeat Analysis (Tentativa {repeatCount + 1})</strong>
                            <p className="text-xs mt-1">
                                Esta é uma repeat analysis. Os resultados anteriores foram reprovados.
                            </p>
                            {repeatCount >= 2 && (
                                <p className="text-xs mt-1 font-medium text-amber-700">
                                    ⚠️ ATENÇÃO: Múltiplas repetições detectadas. Verifique o processo.
                                </p>
                            )}
                        </AlertDescription>
                    </Alert>
                )}

                {/* Results Table */}
                <Card>
                    <CardHeader>
                        <CardTitle>Resultados de Análise</CardTitle>
                        <CardDescription>Insira os valores obtidos para cada parâmetro</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Parâmetro</TableHead>
                                    <TableHead>Método</TableHead>
                                    <TableHead>Limite Min</TableHead>
                                    <TableHead>Limite Max</TableHead>
                                    <TableHead>Resultado *</TableHead>
                                    <TableHead>Unidade</TableHead>
                                    <TableHead>Estado</TableHead>
                                    <TableHead>Notas</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {parameters.map((param) => {
                                    const result = results.get(param.id)!;
                                    return (
                                        <TableRow key={param.id}>
                                            <TableCell className="font-medium">{param.name}</TableCell>
                                            <TableCell className="text-xs text-muted-foreground">
                                                {param.test_method}
                                            </TableCell>
                                            <TableCell>{param.min_value ?? '-'}</TableCell>
                                            <TableCell>{param.max_value ?? '-'}</TableCell>
                                            <TableCell>
                                                <Input
                                                    type="number"
                                                    step="0.01"
                                                    value={result.result_value}
                                                    onChange={(e) => updateResult(param.id, 'result_value', e.target.value)}
                                                    disabled={isLocked}
                                                    className="w-24"
                                                />
                                            </TableCell>
                                            <TableCell>{param.unit}</TableCell>
                                            <TableCell>
                                                {result.result_value && (
                                                    <Badge
                                                        variant={
                                                            result.status === 'approved'
                                                                ? 'default'
                                                                : result.status === 'failed'
                                                                    ? 'destructive'
                                                                    : 'secondary'
                                                        }
                                                    >
                                                        {result.status === 'approved'
                                                            ? 'Aprovado'
                                                            : result.status === 'failed'
                                                                ? 'Reprovado'
                                                                : 'Desvio'}
                                                    </Badge>
                                                )}
                                            </TableCell>
                                            <TableCell>
                                                <Input
                                                    type="text"
                                                    placeholder="Notas..."
                                                    value={result.notes}
                                                    onChange={(e) => updateResult(param.id, 'notes', e.target.value)}
                                                    disabled={isLocked}
                                                    className="w-32"
                                                />
                                            </TableCell>
                                        </TableRow>
                                    );
                                })}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>

                {/* Action Buttons */}
                <div className="flex gap-4 justify-end">
                    {!isLocked && (
                        <>
                            <Button variant="outline" onClick={() => router.back()} disabled={submitting}>
                                Cancelar
                            </Button>
                            <Button onClick={handleSaveResults} disabled={submitting}>
                                {submitting ? (
                                    <>
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        A gravar...
                                    </>
                                ) : (
                                    <>
                                        <Save className="mr-2 h-4 w-4" />
                                        Gravar Resultados
                                    </>
                                )}
                            </Button>
                        </>
                    )}
                    {analysisId && !isLocked && (
                        <Button
                            onClick={() => setShowSignatureModal(true)}
                            className="bg-emerald-600 hover:bg-emerald-700"
                        >
                            <Shield className="mr-2 h-4 w-4" />
                            Validar com Assinatura Digital
                        </Button>
                    )}
                    {/* Epic 3.3 - Request Repeat Button */}
                    {isLocked && hasFailedResults && permissions.canExecuteAnalysis && (
                        <Button
                            onClick={handleRequestRepeat}
                            variant="outline"
                            className="border-amber-500 text-amber-600 hover:bg-amber-50"
                        >
                            <RefreshCw className="mr-2 h-4 w-4" />
                            Solicitar Repeat Analysis
                        </Button>
                    )}
                </div>

                {/* Digital Signature Modal */}
                {analysisId && (
                    <DigitalSignatureModal
                        isOpen={showSignatureModal}
                        onClose={() => setShowSignatureModal(false)}
                        onValidated={handleValidationComplete}
                        analysisId={analysisId}
                        title="Validar Análise"
                        description="Confirme a validação dos resultados com a sua assinatura digital"
                    />
                )}
            </div>
        </AppShell>
    );
}
