'use client';

import { useState, useEffect } from 'react';
import { AppShell } from '@/components/layout/AppShell';
import { SectionHeader } from '@/components/ui/SectionHeader';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Plus, AlertTriangle, CheckCircle, Clock } from 'lucide-react';
import { toast } from 'sonner';
import { getNCs, createNC } from '@/lib/queries/qms';
import { NonConformity } from '@/types/qms';

import { useRouter } from 'next/navigation';

export default function NCPage() {
    const [ncs, setNcs] = useState<NonConformity[]>([]);
    const [loading, setLoading] = useState(true);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const router = useRouter();
    const [formData, setFormData] = useState({
        description: '',
        deviation_type: 'product',
        status: 'open' as const
    });

    useEffect(() => {
        fetchNCs();
    }, []);

    const fetchNCs = async () => {
        try {
            const data = await getNCs();
            setNcs(data);
        } catch (error) {
            console.error("Error fetching NCs:", error);
            toast.error("Failed to load Non-Conformities");
        } finally {
            setLoading(false);
        }
    };

    const handleCreate = async () => {
        try {
            await createNC({
                ...formData,
                code: `NC-${Date.now().toString().slice(-6)}`,
                status: 'open'
            });
            toast.success("Non-Conformity created successfully");
            setIsDialogOpen(false);
            fetchNCs();
            setFormData({ description: '', deviation_type: 'product', status: 'open' });
        } catch (error) {
            console.error("Error creating NC:", error);
            toast.error("Failed to create Non-Conformity");
        }
    };

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'open': return <Badge variant="destructive">Open</Badge>;
            case 'in_progress': return <Badge variant="secondary">In Progress</Badge>;
            case 'closed': return <Badge variant="default" className="bg-green-600">Closed</Badge>;
            default: return <Badge variant="outline">{status}</Badge>;
        }
    };

    return (
        <AppShell>
            <div className="p-6 space-y-6">
                <SectionHeader
                    title="Non-Conformity Management"
                    description="Track and manage quality deviations, root causes, and CAPAs."
                    action={
                        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                            <DialogTrigger asChild>
                                <Button>
                                    <Plus className="mr-2 h-4 w-4" />
                                    Report NC
                                </Button>
                            </DialogTrigger>
                            <DialogContent>
                                <DialogHeader>
                                    <DialogTitle>Report Non-Conformity</DialogTitle>
                                </DialogHeader>
                                <div className="space-y-4 py-4">
                                    <div className="space-y-2">
                                        <Label>Description</Label>
                                        <Input
                                            value={formData.description}
                                            onChange={e => setFormData({ ...formData, description: e.target.value })}
                                            placeholder="Describe the deviation..."
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Type</Label>
                                        <Select
                                            value={formData.deviation_type}
                                            onValueChange={v => setFormData({ ...formData, deviation_type: v })}
                                        >
                                            <SelectTrigger>
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="product">Product Defect</SelectItem>
                                                <SelectItem value="process">Process Deviation</SelectItem>
                                                <SelectItem value="equipment">Equipment Failure</SelectItem>
                                                <SelectItem value="audit">Audit Finding</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <Button onClick={handleCreate} className="w-full">Submit Report</Button>
                                </div>
                            </DialogContent>
                        </Dialog>
                    }
                />

                <Card>
                    <CardHeader>
                        <CardTitle>Active Non-Conformities</CardTitle>
                    </CardHeader>
                    <CardContent>
                        {loading ? (
                            <div>Loading...</div>
                        ) : (
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Code</TableHead>
                                        <TableHead>Description</TableHead>
                                        <TableHead>Type</TableHead>
                                        <TableHead>Status</TableHead>
                                        <TableHead>Created At</TableHead>
                                        <TableHead>Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {ncs.map((nc) => (
                                        <TableRow key={nc.id}>
                                            <TableCell className="font-medium">{nc.code}</TableCell>
                                            <TableCell>{nc.description}</TableCell>
                                            <TableCell className="capitalize">{nc.deviation_type}</TableCell>
                                            <TableCell>{getStatusBadge(nc.status)}</TableCell>
                                            <TableCell>{new Date(nc.created_at).toLocaleDateString()}</TableCell>
                                            <TableCell>
                                                <div className="flex gap-2">
                                                    <Button variant="ghost" size="sm">View Details</Button>
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        onClick={() => router.push(`/nc/${nc.id}/8d`)}
                                                    >
                                                        Start 8D
                                                    </Button>
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                    {ncs.length === 0 && (
                                        <TableRow>
                                            <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                                                No non-conformities found. Good job!
                                            </TableCell>
                                        </TableRow>
                                    )}
                                </TableBody>
                            </Table>
                        )}
                    </CardContent>
                </Card>
            </div>
        </AppShell>
    );
}
