/**
 * Sample Registration Page - REFACTORED
 * 
 * Features:
 * - Conditional form fields based on sample type
 * - Proper foreign key handling (production_lot_id vs intermediate_lot_id)
 * - Improved UX with logical field ordering
 * - Proper validation and error handling
 */

'use client';

import { useState, useEffect } from 'react';
import { AppShell } from '@/components/layout/AppShell';
import { SectionHeader } from '@/components/ui/SectionHeader';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Plus, Beaker, AlertCircle, Loader2, CheckCircle, Info } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { previewSampleCode } from '@/lib/utils/sample-code-generator';
import { usePermissions } from '@/lib/hooks/usePermissions';
import { SAMPLE_STATUS } from '@/lib/constants/status';
import { createSampleSchema, type SamplePhase, type SampleType } from '@/lib/validations/samples';
import { toast } from 'sonner';
import { getRecentSamples, type SampleFilters } from '@/lib/queries/lab';
import { getActiveProductionLots } from '@/lib/queries/production';
import { SampleHistory } from './components/SampleHistory';

interface Product {
    id: string;
    name: string;
    sku: string;
    code: string;
}

interface ProductionLot {
    id: string;
    code: string;
    product_id: string;
    product?: Product;
    type?: 'production' | 'intermediate';
}

interface Tank {
    id: string;
    code: string;
    name: string;
}

interface Specification {
    id: string;
    product_id: string;
    phase: 'intermediate' | 'finished';
    parameter_count: number;
}

// Sample type categories
const SAMPLE_TYPE_CONFIG = {
    finished_product: { label: 'Produto Acabado', needsLot: true, needsTank: true },
    intermediate_product: { label: 'Produto Intermédio', needsLot: true, needsTank: true },
    raw_material: { label: 'Matéria-Prima', needsLot: false, needsTank: false },
    environmental_swab: { label: 'Swab Ambiental', needsLot: false, needsTank: false },
    equipment_swab: { label: 'Swab de Equipamento', needsLot: false, needsTank: false },
    personnel_swab: { label: 'Swab de Pessoal', needsLot: false, needsTank: false },
    water_sample: { label: 'Amostra de Água', needsLot: false, needsTank: false },
    air_sample: { label: 'Amostra de Ar', needsLot: false, needsTank: false },
    other: { label: 'Outro', needsLot: false, needsTank: false },
};

export default function SamplesRegistrationPage() {
    const { permissions, isLoading: permissionsLoading } = usePermissions();
    const [lots, setLots] = useState<ProductionLot[]>([]);
    const [tanks, setTanks] = useState<Tank[]>([]);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);

    // Form state
    const [sampleType, setSampleType] = useState<SampleType>('finished_product');
    const [phase, setPhase] = useState<SamplePhase>('finished');
    const [selectedLotId, setSelectedLotId] = useState('');
    const [selectedTankId, setSelectedTankId] = useState('');
    const [swabLocation, setSwabLocation] = useState('');
    const [observations, setObservations] = useState('');

    // Derived state
    const [sampleCodePreview, setSampleCodePreview] = useState('');
    const [specsInfo, setSpecsInfo] = useState<Specification | null>(null);
    const [specsLoading, setSpecsLoading] = useState(false);

    // History state
    const [recentSamples, setRecentSamples] = useState<any[]>([]);
    const [historyLoading, setHistoryLoading] = useState(false);
    const [filters, setFilters] = useState<SampleFilters>({ limit: 10 });

    const selectedLot = lots.find(lot => lot.id === selectedLotId);
    const sampleTypeConfig = SAMPLE_TYPE_CONFIG[sampleType as keyof typeof SAMPLE_TYPE_CONFIG];
    const needsProduct = sampleTypeConfig?.needsLot;

    // Auto-set phase based on sample type
    useEffect(() => {
        if (sampleType === 'intermediate_product') {
            setPhase('intermediate');
        } else if (sampleType === 'finished_product') {
            setPhase('finished');
        }
    }, [sampleType]);

    useEffect(() => {
        loadData();
        loadRecentSamples();
    }, []);

    useEffect(() => {
        loadRecentSamples();
    }, [filters]);

    // Auto-load specs when lot and phase are selected
    useEffect(() => {
        if (selectedLot && phase && needsProduct) {
            loadSpecifications();
        } else {
            setSpecsInfo(null);
        }
    }, [selectedLot, phase, needsProduct]);

    // Generate sample code preview
    useEffect(() => {
        if (needsProduct && selectedLot && selectedTankId) {
            generateCodePreview();
        } else {
            setSampleCodePreview('');
        }
    }, [selectedLot, selectedTankId, needsProduct]);

    async function loadData() {
        setLoading(true);
        try {
            const supabase = createClient();

            const [
                productionLotsData,
                { data: intermediateLotsData, error: intermediateLotsError },
                { data: tanksData, error: tanksError }
            ] = await Promise.all([
                getActiveProductionLots(),
                supabase
                    .from('intermediate_lots')
                    .select(`
                        id, 
                        code, 
                        production_lot:production_lots(
                            product_id, 
                            products(id, name, sku, code)
                        )
                    `)
                    .eq('status', 'active')
                    .order('created_at', { ascending: false }),
                supabase
                    .from('tanks')
                    .select('id, code, name')
                    .eq('active', true)
                    .order('code')
            ]);

            if (intermediateLotsError) throw intermediateLotsError;
            if (tanksError) throw tanksError;

            const formattedProductionLots = productionLotsData?.map(lot => ({
                id: lot.id,
                code: lot.code,
                product_id: lot.product_id,
                product: lot.product as any,
                type: 'production' as const
            })) || [];

            const formattedIntermediateLots = intermediateLotsData?.map(lot => ({
                id: lot.id,
                code: lot.code,
                product_id: (lot.production_lot as any)?.product_id,
                product: (lot.production_lot as any)?.products as any,
                type: 'intermediate' as const
            })) || [];

            setLots([...formattedProductionLots, ...formattedIntermediateLots]);

            if (tanksData) {
                setTanks(tanksData);
            }
        } catch (error) {
            console.error('Error loading data:', error);
            toast.error('Erro ao carregar dados');
        } finally {
            setLoading(false);
        }
    }

    async function loadRecentSamples() {
        setHistoryLoading(true);
        try {
            const data = await getRecentSamples(filters);
            setRecentSamples(data || []);
        } catch (error) {
            console.error('Error loading history:', error);
        } finally {
            setHistoryLoading(false);
        }
    }

    async function loadSpecifications() {
        if (!selectedLot) return;

        setSpecsLoading(true);
        try {
            const supabase = createClient();

            const { data, error } = await supabase
                .from('specifications')
                .select('id, product_id, phase, parameters:parameters(count)')
                .eq('product_id', selectedLot.product_id)
                .eq('phase', phase)
                .eq('is_active', true)
                .single();

            if (error) {
                console.error('Specs error:', error);
                setSpecsInfo(null);
                return;
            }

            if (data) {
                setSpecsInfo({
                    ...data,
                    parameter_count: (data.parameters as any)?.length || 0
                });
            }
        } catch (error) {
            console.error('Error loading specs:', error);
        } finally {
            setSpecsLoading(false);
        }
    }

    async function generateCodePreview() {
        if (!selectedLot?.product || !selectedLot.code || !selectedTankId) return;

        const productCode = selectedLot.product.code || selectedLot.product.sku?.substring(0, 3) || 'PRD';
        const tank = tanks.find((t: Tank) => t.id === selectedTankId);
        const tankCode = tank?.code || 'TK';

        const preview = previewSampleCode(
            productCode,
            selectedLot.code,
            tankCode
        );

        setSampleCodePreview(preview);
    }

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        setSubmitting(true);

        try {
            const supabase = createClient();
            const collectedAt = new Date().toISOString();

            let codeData: { code: string; sequence: number };

            if (needsProduct) {
                const { data, error: codeError } = await supabase
                    .rpc('generate_sample_code', {
                        p_product_id: selectedLot?.product_id,
                        p_tank_id: selectedTankId,
                        p_lot_code: selectedLot?.code,
                    });

                if (codeError) throw codeError;
                codeData = { code: data as string, sequence: 1 };
            } else {
                const timestamp = Date.now().toString().slice(-6);
                codeData = {
                    code: `${sampleType.substring(0, 3).toUpperCase()}-${timestamp}`,
                    sequence: 0,
                };
            }

            const payload = {
                code: codeData.code,
                sample_type: sampleType,
                phase: needsProduct ? phase : undefined,
                product_id: needsProduct ? selectedLot?.product_id : undefined,
                production_lot_id: needsProduct && phase === 'finished' ? selectedLotId : undefined,
                intermediate_lot_id: needsProduct && phase === 'intermediate' ? selectedLotId : undefined,
                tank_id: needsProduct ? selectedTankId : undefined,
                collected_at: collectedAt,
                status: SAMPLE_STATUS.PENDING,
                observations: needsProduct ? observations : swabLocation,
                sequence_number: needsProduct ? codeData.sequence : undefined,
            };

            const validation = createSampleSchema.safeParse(payload);
            if (!validation.success) {
                const firstError = validation.error.errors[0];
                toast.error(firstError.message || 'Invalid sample data');
                return;
            }

            const { error: sampleError } = await supabase
                .from('samples')
                .insert(validation.data)
                .select()
                .single();

            if (sampleError) throw sampleError;

            toast.success(`Amostra registada: ${codeData.code}`);

            setSelectedLotId('');
            setSelectedTankId('');
            setSwabLocation('');
            setObservations('');
            setSampleCodePreview('');

            loadData();
            loadRecentSamples();
        } catch (error) {
            console.error('Error creating sample:', error);
            toast.error('Erro ao registar amostra');
        } finally {
            setSubmitting(false);
        }
    }


    if (permissionsLoading || loading) {
        return (
            <AppShell>
                <div className="p-6 flex justify-center items-center h-screen">
                    <div className="text-center space-y-4">
                        <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto" />
                        <p className="text-muted-foreground">A carregar...</p>
                    </div>
                </div>
            </AppShell>
        );
    }

    if (!permissions.canRegisterSample) {
        return (
            <AppShell>
                <div className="p-6">
                    <Alert variant="destructive">
                        <AlertCircle className="h-4 w-4" />
                        <AlertDescription>
                            Não tem permissão para registar amostras.
                        </AlertDescription>
                    </Alert>
                </div>
            </AppShell>
        );
    }

    // Get available lots based on phase
    const availableLots = lots.filter(lot =>
        phase === 'intermediate' ? lot.type === 'intermediate' : lot.type === 'production'
    );

    return (
        <AppShell>
            <div className="p-6 space-y-6">
                <SectionHeader
                    title="Registro de Amostras"
                    description="Registar novas amostras de produtos, swabs e análises ambientais"
                />

                <div className="grid gap-6 lg:grid-cols-3">
                    {/* Form */}
                    <Card className="lg:col-span-2">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Beaker className="h-5 w-5" />
                                Nova Amostra
                            </CardTitle>
                            <CardDescription>
                                Preencha os dados para registar uma nova amostra
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <form onSubmit={handleSubmit} className="space-y-4">
                                {/* STEP 1: Sample Type (Always first) */}
                                <div className="space-y-2">
                                    <Label htmlFor="sampleType">Tipo de Amostra *</Label>
                                    <Select
                                        value={sampleType}
                                        onValueChange={(value) => setSampleType(value as SampleType)}
                                    >
                                        <SelectTrigger id="sampleType">
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {Object.entries(SAMPLE_TYPE_CONFIG).map(([value, config]) => (
                                                <SelectItem key={value} value={value}>
                                                    {config.label}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>

                                {/* Info about what this type needs */}
                                {sampleTypeConfig && (
                                    <Alert>
                                        <Info className="h-4 w-4" />
                                        <AlertDescription className="text-xs">
                                            {sampleTypeConfig.needsLot
                                                ? 'Requer seleção de lote de produção e tanque'
                                                : 'Não requer lote de produção'}
                                        </AlertDescription>
                                    </Alert>
                                )}

                                {/* CONDITIONAL FIELDS FOR PRODUCTS */}
                                {needsProduct && (
                                    <>
                                        {/* Phase Selection */}
                                        <div className="space-y-2">
                                            <Label htmlFor="phase">Fase do Produto *</Label>
                                            <Select
                                                value={phase}
                                                onValueChange={(value) => setPhase(value as 'intermediate' | 'finished')}
                                                disabled={sampleType === 'intermediate_product' || sampleType === 'finished_product'}
                                            >
                                                <SelectTrigger id="phase">
                                                    <SelectValue />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="intermediate">Produto Intermédio</SelectItem>
                                                    <SelectItem value="finished">Produto Acabado</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>

                                        {/* Lot Selection */}
                                        <div className="space-y-2">
                                            <Label htmlFor="lot">Lote de Produção *</Label>
                                            <Select value={selectedLotId} onValueChange={setSelectedLotId}>
                                                <SelectTrigger id="lot">
                                                    <SelectValue placeholder="Selecione o lote" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {availableLots.length === 0 ? (
                                                        <div className="p-2 text-sm text-muted-foreground text-center">
                                                            Nenhum lote disponível para esta fase
                                                        </div>
                                                    ) : (
                                                        availableLots.map((lot) => (
                                                            <SelectItem key={lot.id} value={lot.id}>
                                                                {lot.code} - {lot.product?.name}
                                                            </SelectItem>
                                                        ))
                                                    )}
                                                </SelectContent>
                                            </Select>
                                        </div>

                                        {/* Tank Selection */}
                                        <div className="space-y-2">
                                            <Label htmlFor="tank">Tanque *</Label>
                                            <Select value={selectedTankId} onValueChange={setSelectedTankId}>
                                                <SelectTrigger id="tank">
                                                    <SelectValue placeholder="Selecione o tanque" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {tanks.length === 0 ? (
                                                        <div className="p-2 text-sm text-muted-foreground text-center">
                                                            Nenhum tanque ativo disponível
                                                        </div>
                                                    ) : (
                                                        tanks.map((tank) => (
                                                            <SelectItem key={tank.id} value={tank.id}>
                                                                {tank.code} - {tank.name}
                                                            </SelectItem>
                                                        ))
                                                    )}
                                                </SelectContent>
                                            </Select>
                                        </div>

                                        {/* Sample Code Preview */}
                                        {sampleCodePreview && (
                                            <Alert>
                                                <CheckCircle className="h-4 w-4" />
                                                <AlertDescription>
                                                    <strong>Código da Amostra:</strong> {sampleCodePreview}
                                                </AlertDescription>
                                            </Alert>
                                        )}

                                        {/* Observations */}
                                        <div className="space-y-2">
                                            <Label htmlFor="observations">Observações</Label>
                                            <Textarea
                                                id="observations"
                                                placeholder="Observações adicionais..."
                                                value={observations}
                                                onChange={(e) => setObservations(e.target.value)}
                                                rows={3}
                                            />
                                        </div>
                                    </>
                                )}

                                {/* CONDITIONAL FIELDS FOR SWABS/ENVIRONMENTAL */}
                                {!needsProduct && (
                                    <div className="space-y-2">
                                        <Label htmlFor="location">
                                            Local / Identificação *
                                        </Label>
                                        <Input
                                            id="location"
                                            placeholder={
                                                sampleType.includes('swab')
                                                    ? "Ex: Linha 3, Ponto de Amostragem A"
                                                    : "Ex: Torneira Principal, Lab Microbiologia"
                                            }
                                            value={swabLocation}
                                            onChange={(e) => setSwabLocation(e.target.value)}
                                        />
                                        <p className="text-xs text-muted-foreground">
                                            Descreva o local ou identificação da amostra
                                        </p>
                                    </div>
                                )}

                                <Button type="submit" className="w-full" disabled={submitting || loading}>
                                    {submitting ? (
                                        <>
                                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                            A registar...
                                        </>
                                    ) : (
                                        <>
                                            <Plus className="mr-2 h-4 w-4" />
                                            Registar Amostra
                                        </>
                                    )}
                                </Button>
                            </form>
                        </CardContent>
                    </Card>

                    {/* Specs Info Sidebar - Only show for products */}
                    <div className="space-y-4">
                        {needsProduct && (
                            <Card>
                                <CardHeader>
                                    <CardTitle className="text-base">Especificações</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    {specsLoading ? (
                                        <div className="flex items-center justify-center py-8">
                                            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                                        </div>
                                    ) : specsInfo ? (
                                        <div className="space-y-3">
                                            <div className="flex items-center justify-between text-sm">
                                                <span className="text-muted-foreground">Fase:</span>
                                                <span className="font-medium">
                                                    {specsInfo.phase === 'intermediate' ? 'Intermédio' : 'Acabado'}
                                                </span>
                                            </div>
                                            <div className="flex items-center justify-between text-sm">
                                                <span className="text-muted-foreground">Parâmetros:</span>
                                                <span className="font-bold text-emerald-600">
                                                    {specsInfo.parameter_count}
                                                </span>
                                            </div>
                                            <Alert className="bg-emerald-500/10 border-emerald-500/50">
                                                <CheckCircle className="h-4 w-4 text-emerald-600" />
                                                <AlertDescription className="text-xs">
                                                    Especificações carregadas automaticamente
                                                </AlertDescription>
                                            </Alert>
                                        </div>
                                    ) : (
                                        <p className="text-sm text-muted-foreground text-center py-4">
                                            Selecione um lote e fase para ver as especificações
                                        </p>
                                    )}
                                </CardContent>
                            </Card>
                        )}

                        {/* Sample Code Info Card */}
                        {needsProduct && (
                            <Card>
                                <CardHeader>
                                    <CardTitle className="text-base">Código da Amostra</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-2 text-xs text-muted-foreground">
                                        <p><strong>Formato:</strong></p>
                                        <code className="block bg-slate-900 p-2 rounded text-emerald-400">
                                            [ProductCode][4digitsLot]-[Tank]-[Seq]
                                        </code>
                                        <p className="pt-2"><strong>Exemplo:</strong></p>
                                        <p>COK1234-TK01-003</p>
                                        <p className="text-[10px]">
                                            • COK = Código do produto<br />
                                            • 1234 = Últimos 4 dígitos do lote<br />
                                            • TK01 = Tanque<br />
                                            • 003 = Sequência do dia
                                        </p>
                                    </div>
                                </CardContent>
                            </Card>
                        )}
                    </div>
                </div>

                {/* Sample History */}
                <SampleHistory
                    samples={recentSamples}
                    loading={historyLoading}
                    onFilterChange={(newFilters) => setFilters(prev => ({ ...prev, ...newFilters }))}
                    onRefresh={loadRecentSamples}
                />
            </div>
        </AppShell>
    );
}
