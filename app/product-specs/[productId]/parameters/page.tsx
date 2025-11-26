/**
 * Product Parameters Management Page
 * Epic 4.1 - Register and manage parameters by product and phase
 * Epic 4.2 - Edit specifications with version control
 */

'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { AppShell } from '@/components/layout/AppShell';
import { SectionHeader } from '@/components/ui/SectionHeader';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Plus, Edit2, Trash2, ClipboardList, Loader2, ArrowLeft } from 'lucide-react';
import {
    getProductSpecifications,
    getSpecificationParameters,
    deleteParameter,
    type Specification,
    type Parameter,
} from '@/lib/queries/specifications';
import { getProduct } from '@/lib/queries/products';
import { usePermissions } from '@/lib/hooks/usePermissions';
import { ParameterDialog } from './components/ParameterDialog';
import { EditSpecDialog } from '../components/EditSpecDialog';
import { toast } from 'sonner';

export default function ProductParametersPage() {
    const params = useParams();
    const router = useRouter();
    const productId = params.productId as string;
    const { permissions, isLoading: permissionsLoading } = usePermissions();

    const [loading, setLoading] = useState(true);
    const [product, setProduct] = useState<any>(null);
    const [specifications, setSpecifications] = useState<Specification[]>([]);
    const [intermediateParams, setIntermediateParams] = useState<Parameter[]>([]);
    const [finishedParams, setFinishedParams] = useState<Parameter[]>([]);

    // Dialog states
    const [showDialog, setShowDialog] = useState(false);
    const [editingParameter, setEditingParameter] = useState<Parameter | null>(null);
    const [currentPhase, setCurrentPhase] = useState<'intermediate' | 'finished'>('intermediate');

    // Edit Spec Dialog state
    const [showEditSpecDialog, setShowEditSpecDialog] = useState(false);
    const [editingSpec, setEditingSpec] = useState<Specification | null>(null);

    useEffect(() => {
        loadData();
    }, [productId]);

    async function loadData() {
        setLoading(true);
        try {
            // Load product
            const productData = await getProduct(productId);
            setProduct(productData);

            // Load specifications
            const specs = await getProductSpecifications(productId);
            setSpecifications(specs);

            // Find active specs for each phase
            const intermediateSpec = specs.find(s => s.phase === 'intermediate' && s.is_active);
            const finishedSpec = specs.find(s => s.phase === 'finished' && s.is_active);

            // Load parameters for each
            if (intermediateSpec) {
                const params = await getSpecificationParameters(intermediateSpec.id);
                setIntermediateParams(params);
            }
            if (finishedSpec) {
                const params = await getSpecificationParameters(finishedSpec.id);
                setFinishedParams(params);
            }
        } catch (error) {
            console.error('Error loading data:', error);
            toast.error('Erro ao carregar parâmetros');
        } finally {
            setLoading(false);
        }
    }

    async function handleDelete(param: Parameter) {
        if (!confirm(`Eliminar parâmetro "${param.name}"?`)) return;

        try {
            await deleteParameter(param.id);
            toast.success('Parâmetro eliminado');
            loadData();
        } catch (error: any) {
            console.error('Error deleting parameter:', error);
            toast.error(error.message || 'Erro ao eliminar parâmetro');
        }
    }

    function handleAdd(phase: 'intermediate' | 'finished') {
        setCurrentPhase(phase);
        setEditingParameter(null);
        setShowDialog(true);
    }

    function handleEdit(param: Parameter, phase: 'intermediate' | 'finished') {
        setCurrentPhase(phase);
        setEditingParameter(param);
        setShowDialog(true);
    }

    if (permissionsLoading || loading) {
        return (
            <AppShell>
                <div className="p-6 flex justify-center items-center h-screen">
                    <div className="text-center space-y-4">
                        <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto" />
                        <p className="text-muted-foreground">A carregar parâmetros...</p>
                    </div>
                </div>
            </AppShell>
        );
    }

    if (!permissions.canEditSpecs) {
        return (
            <AppShell>
                <div className="p-6">
                    <div className="text-center py-16">
                        <ClipboardList className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                        <h3 className="text-lg font-semibold mb-2">Sem Permissão</h3>
                        <p className="text-muted-foreground">
                            Não tem permissão para gerir especificações.
                        </p>
                    </div>
                </div>
            </AppShell>
        );
    }

    const intermediateSpec = specifications.find(s => s.phase === 'intermediate' && s.is_active);
    const finishedSpec = specifications.find(s => s.phase === 'finished' && s.is_active);

    return (
        <AppShell>
            <div className="p-6 space-y-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <SectionHeader
                        title={`Parâmetros: ${product?.name || ''}`}
                        description={`SKU: ${product?.sku || ''} • Gerir parâmetros de teste por fase`}
                    />
                    <Button variant="outline" onClick={() => router.back()}>
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        Voltar
                    </Button>
                </div>

                {/* Phase Tabs */}
                <Tabs defaultValue="intermediate" className="space-y-4">
                    <TabsList>
                        <TabsTrigger value="intermediate">
                            Produto Intermédio ({intermediateParams.length})
                        </TabsTrigger>
                        <TabsTrigger value="finished">
                            Produto Acabado ({finishedParams.length})
                        </TabsTrigger>
                    </TabsList>

                    {/* Intermediate Phase */}
                    <TabsContent value="intermediate" className="space-y-4">
                        <Card>
                            <CardHeader>
                                <div className="flex items-center justify-between">
                                    <div>
                                        <CardTitle className="flex items-center gap-2">
                                            Parâmetros - Produto Intermédio
                                            <Badge variant="secondary">
                                                {intermediateSpec ? `v${intermediateSpec.version}` : 'Sem Spec'}
                                            </Badge>
                                        </CardTitle>
                                        <CardDescription>
                                            Parâmetros testados em amostras de produto intermédio
                                        </CardDescription>
                                    </div>
                                    <div className="flex gap-2">
                                        {intermediateSpec && (
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() => {
                                                    setEditingSpec(intermediateSpec);
                                                    setShowEditSpecDialog(true);
                                                }}
                                            >
                                                <Edit2 className="mr-2 h-4 w-4" />
                                                Editar Especificação
                                            </Button>
                                        )}
                                        <Button onClick={() => handleAdd('intermediate')} disabled={!intermediateSpec}>
                                            <Plus className="mr-2 h-4 w-4" />
                                            Adicionar Parâmetro
                                        </Button>
                                    </div>
                                </div>
                            </CardHeader>
                            <CardContent>
                                {!intermediateSpec ? (
                                    <div className="text-center py-8 text-muted-foreground">
                                        <p>Nenhuma especificação ativa para produto intermédio</p>
                                        <p className="text-sm mt-2">Crie uma especificação primeiro</p>
                                    </div>
                                ) : intermediateParams.length === 0 ? (
                                    <div className="text-center py-8 text-muted-foreground">
                                        <ClipboardList className="h-12 w-12 mx-auto mb-2 opacity-50" />
                                        <p>Nenhum parâmetro definido</p>
                                        <Button
                                            variant="link"
                                            onClick={() => handleAdd('intermediate')}
                                            className="mt-2"
                                        >
                                            Adicionar primeiro parâmetro
                                        </Button>
                                    </div>
                                ) : (
                                    <Table>
                                        <TableHeader>
                                            <TableRow>
                                                <TableHead>Parâmetro</TableHead>
                                                <TableHead>Unidade</TableHead>
                                                <TableHead>Mínimo</TableHead>
                                                <TableHead>Máximo</TableHead>
                                                <TableHead>Método</TableHead>
                                                <TableHead className="text-right">Ações</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {intermediateParams.map((param) => (
                                                <TableRow key={param.id}>
                                                    <TableCell className="font-medium">{param.name}</TableCell>
                                                    <TableCell>{param.unit}</TableCell>
                                                    <TableCell>{param.min_value ?? '-'}</TableCell>
                                                    <TableCell>{param.max_value ?? '-'}</TableCell>
                                                    <TableCell className="text-sm text-muted-foreground">
                                                        {param.test_method}
                                                    </TableCell>
                                                    <TableCell className="text-right">
                                                        <div className="flex justify-end gap-2">
                                                            <Button
                                                                size="sm"
                                                                variant="ghost"
                                                                onClick={() => handleEdit(param, 'intermediate')}
                                                            >
                                                                <Edit2 className="h-4 w-4" />
                                                            </Button>
                                                            <Button
                                                                size="sm"
                                                                variant="ghost"
                                                                onClick={() => handleDelete(param)}
                                                            >
                                                                <Trash2 className="h-4 w-4 text-destructive" />
                                                            </Button>
                                                        </div>
                                                    </TableCell>
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                )}
                            </CardContent>
                        </Card>
                    </TabsContent>

                    {/* Finished Phase */}
                    <TabsContent value="finished" className="space-y-4">
                        <Card>
                            <CardHeader>
                                <div className="flex items-center justify-between">
                                    <div>
                                        <CardTitle className="flex items-center gap-2">
                                            Parâmetros - Produto Acabado
                                            <Badge variant="secondary">
                                                {finishedSpec ? `v${finishedSpec.version}` : 'Sem Spec'}
                                            </Badge>
                                        </CardTitle>
                                        <CardDescription>
                                            Parâmetros testados em amostras de produto acabado
                                        </CardDescription>
                                    </div>
                                    <div className="flex gap-2">
                                        {finishedSpec && (
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() => {
                                                    setEditingSpec(finishedSpec);
                                                    setShowEditSpecDialog(true);
                                                }}
                                            >
                                                <Edit2 className="mr-2 h-4 w-4" />
                                                Editar Especificação
                                            </Button>
                                        )}
                                        <Button onClick={() => handleAdd('finished')} disabled={!finishedSpec}>
                                            <Plus className="mr-2 h-4 w-4" />
                                            Adicionar Parâmetro
                                        </Button>
                                    </div>
                                </div>
                            </CardHeader>
                            <CardContent>
                                {!finishedSpec ? (
                                    <div className="text-center py-8 text-muted-foreground">
                                        <p>Nenhuma especificação ativa para produto acabado</p>
                                        <p className="text-sm mt-2">Crie uma especificação primeiro</p>
                                    </div>
                                ) : finishedParams.length === 0 ? (
                                    <div className="text-center py-8 text-muted-foreground">
                                        <ClipboardList className="h-12 w-12 mx-auto mb-2 opacity-50" />
                                        <p>Nenhum parâmetro definido</p>
                                        <Button
                                            variant="link"
                                            onClick={() => handleAdd('finished')}
                                            className="mt-2"
                                        >
                                            Adicionar primeiro parâmetro
                                        </Button>
                                    </div>
                                ) : (
                                    <Table>
                                        <TableHeader>
                                            <TableRow>
                                                <TableHead>Parâmetro</TableHead>
                                                <TableHead>Unidade</TableHead>
                                                <TableHead>Mínimo</TableHead>
                                                <TableHead>Máximo</TableHead>
                                                <TableHead>Método</TableHead>
                                                <TableHead className="text-right">Ações</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {finishedParams.map((param) => (
                                                <TableRow key={param.id}>
                                                    <TableCell className="font-medium">{param.name}</TableCell>
                                                    <TableCell>{param.unit}</TableCell>
                                                    <TableCell>{param.min_value ?? '-'}</TableCell>
                                                    <TableCell>{param.max_value ?? '-'}</TableCell>
                                                    <TableCell className="text-sm text-muted-foreground">
                                                        {param.test_method}
                                                    </TableCell>
                                                    <TableCell className="text-right">
                                                        <div className="flex justify-end gap-2">
                                                            <Button
                                                                size="sm"
                                                                variant="ghost"
                                                                onClick={() => handleEdit(param, 'finished')}
                                                            >
                                                                <Edit2 className="h-4 w-4" />
                                                            </Button>
                                                            <Button
                                                                size="sm"
                                                                variant="ghost"
                                                                onClick={() => handleDelete(param)}
                                                            >
                                                                <Trash2 className="h-4 w-4 text-destructive" />
                                                            </Button>
                                                        </div>
                                                    </TableCell>
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                )}
                            </CardContent>
                        </Card>
                    </TabsContent>
                </Tabs>

                {/* Parameter Dialog */}
                {showDialog && (
                    <ParameterDialog
                        isOpen={showDialog}
                        onClose={() => {
                            setShowDialog(false);
                            setEditingParameter(null);
                        }}
                        parameter={editingParameter}
                        specificationId={
                            currentPhase === 'intermediate'
                                ? intermediateSpec?.id || ''
                                : finishedSpec?.id || ''
                        }
                        phase={currentPhase}
                        onSuccess={() => {
                            loadData();
                            setShowDialog(false);
                            setEditingParameter(null);
                        }}
                    />
                )}

                {/* Edit Specification Dialog */}
                {showEditSpecDialog && editingSpec && (
                    <EditSpecDialog
                        isOpen={showEditSpecDialog}
                        onClose={() => {
                            setShowEditSpecDialog(false);
                            setEditingSpec(null);
                        }}
                        specification={editingSpec}
                        onSuccess={() => {
                            loadData();
                            setShowEditSpecDialog(false);
                            setEditingSpec(null);
                        }}
                    />
                )}
            </div>
        </AppShell>
    );
}
