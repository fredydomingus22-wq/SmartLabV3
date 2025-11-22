'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { AppShell } from '@/components/layout/AppShell';
import { SectionHeader } from '@/components/ui/SectionHeader';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { getSupplierById } from '@/lib/queries/inventory';
import { Supplier } from '@/types/inventory';
import { Building2, Star, CheckCircle, XCircle, Clock } from 'lucide-react';

export default function SupplierDetailsPage({ params }: { params: { id: string } }) {
    const [supplier, setSupplier] = useState<Supplier | null>(null);
    const [loading, setLoading] = useState(true);
    const router = useRouter();

    useEffect(() => {
        fetchSupplier();
    }, []);

    const fetchSupplier = async () => {
        try {
            const data = await getSupplierById(params.id);
            setSupplier(data);
        } catch (error) {
            console.error("Error fetching supplier:", error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) return <div>Loading...</div>;
    if (!supplier) return <div>Supplier not found</div>;

    const getQualificationBadge = (status?: string) => {
        switch (status) {
            case 'qualified': return <Badge className="bg-green-600"><CheckCircle className="w-3 h-3 mr-1" /> Qualified</Badge>;
            case 'disqualified': return <Badge variant="destructive"><XCircle className="w-3 h-3 mr-1" /> Disqualified</Badge>;
            default: return <Badge variant="secondary"><Clock className="w-3 h-3 mr-1" /> Pending</Badge>;
        }
    };

    return (
        <AppShell>
            <div className="p-6 space-y-6">
                <SectionHeader
                    title={supplier.name}
                    description={`Supplier Type: ${supplier.type}`}
                    action={
                        <Button variant="outline" onClick={() => router.back()}>Back to List</Button>
                    }
                />

                <div className="grid gap-4 md:grid-cols-3">
                    <Card>
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium text-muted-foreground">Status</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold capitalize">{supplier.status}</div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium text-muted-foreground">Qualification</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="flex items-center gap-2">
                                {getQualificationBadge(supplier.qualification_status)}
                            </div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium text-muted-foreground">Rating</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="flex items-center gap-1 text-2xl font-bold text-amber-500">
                                {supplier.rating || '-'} <Star className="w-5 h-5 fill-current" />
                            </div>
                        </CardContent>
                    </Card>
                </div>

                <Tabs defaultValue="materials">
                    <TabsList>
                        <TabsTrigger value="materials">Supplied Materials</TabsTrigger>
                        <TabsTrigger value="audits">Audit History</TabsTrigger>
                        <TabsTrigger value="documents">Documents</TabsTrigger>
                    </TabsList>
                    <TabsContent value="materials" className="mt-4">
                        <Card>
                            <CardContent className="py-8 text-center text-muted-foreground">
                                No materials linked to this supplier yet.
                            </CardContent>
                        </Card>
                    </TabsContent>
                    <TabsContent value="audits" className="mt-4">
                        <Card>
                            <CardContent className="py-8 text-center text-muted-foreground">
                                No audits recorded.
                            </CardContent>
                        </Card>
                    </TabsContent>
                    <TabsContent value="documents" className="mt-4">
                        <Card>
                            <CardContent className="py-8 text-center text-muted-foreground">
                                No documents uploaded.
                            </CardContent>
                        </Card>
                    </TabsContent>
                </Tabs>
            </div>
        </AppShell>
    );
}
