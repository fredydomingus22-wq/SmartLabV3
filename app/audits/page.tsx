'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
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
import { Plus, Calendar, CheckSquare, Play } from 'lucide-react';
import { toast } from 'sonner';
import { getAudits, createAudit } from '@/lib/queries/audits';
import { Audit } from '@/types/qms';

export default function AuditsPage() {
    const [audits, setAudits] = useState<Audit[]>([]);
    const [loading, setLoading] = useState(true);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const router = useRouter();
    const [formData, setFormData] = useState({
        type: 'internal' as const,
        scheduled_date: '',
        auditor_id: 'me' // Mocked for now
    });

    useEffect(() => {
        fetchAudits();
    }, []);

    const fetchAudits = async () => {
        try {
            const data = await getAudits();
            setAudits(data);
        } catch (error) {
            console.error("Error fetching audits:", error);
            toast.error("Failed to load audits");
        } finally {
            setLoading(false);
        }
    };

    const handleCreate = async () => {
        try {
            await createAudit({
                ...formData,
                code: `AUD-${Date.now().toString().slice(-6)}`,
                status: 'scheduled',
                auditor_id: 'user-id-placeholder' // Should come from auth context
            });
            toast.success("Audit scheduled successfully");
            setIsDialogOpen(false);
            fetchAudits();
            setFormData({ type: 'internal', scheduled_date: '', auditor_id: 'me' });
        } catch (error) {
            console.error("Error creating audit:", error);
            toast.error("Failed to schedule audit");
        }
    };

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'scheduled': return <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">Scheduled</Badge>;
            case 'in_progress': return <Badge variant="secondary" className="bg-amber-50 text-amber-700 border-amber-200">In Progress</Badge>;
            case 'completed': return <Badge variant="default" className="bg-green-600">Completed</Badge>;
            default: return <Badge variant="outline">{status}</Badge>;
        }
    };

    return (
        <AppShell>
            <div className="p-6 space-y-6">
                <SectionHeader
                    title="Audits & Inspections"
                    description="Schedule and execute internal, external, and supplier audits."
                    action={
                        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                            <DialogTrigger asChild>
                                <Button>
                                    <Plus className="mr-2 h-4 w-4" />
                                    Schedule Audit
                                </Button>
                            </DialogTrigger>
                            <DialogContent>
                                <DialogHeader>
                                    <DialogTitle>Schedule New Audit</DialogTitle>
                                </DialogHeader>
                                <div className="space-y-4 py-4">
                                    <div className="space-y-2">
                                        <Label>Audit Type</Label>
                                        <Select
                                            value={formData.type}
                                            onValueChange={v => setFormData({ ...formData, type: v as any })}
                                        >
                                            <SelectTrigger>
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="internal">Internal Audit</SelectItem>
                                                <SelectItem value="external">External Audit</SelectItem>
                                                <SelectItem value="supplier">Supplier Audit</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Scheduled Date</Label>
                                        <Input
                                            type="date"
                                            value={formData.scheduled_date}
                                            onChange={e => setFormData({ ...formData, scheduled_date: e.target.value })}
                                        />
                                    </div>
                                    <Button onClick={handleCreate} className="w-full">Confirm Schedule</Button>
                                </div>
                            </DialogContent>
                        </Dialog>
                    }
                />

                <Card>
                    <CardHeader>
                        <CardTitle>Scheduled Audits</CardTitle>
                    </CardHeader>
                    <CardContent>
                        {loading ? (
                            <div>Loading...</div>
                        ) : (
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Code</TableHead>
                                        <TableHead>Type</TableHead>
                                        <TableHead>Date</TableHead>
                                        <TableHead>Status</TableHead>
                                        <TableHead>Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {audits.map((audit) => (
                                        <TableRow key={audit.id}>
                                            <TableCell className="font-medium">{audit.code}</TableCell>
                                            <TableCell className="capitalize">{audit.type}</TableCell>
                                            <TableCell>{new Date(audit.scheduled_date).toLocaleDateString()}</TableCell>
                                            <TableCell>{getStatusBadge(audit.status)}</TableCell>
                                            <TableCell>
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={() => router.push(`/audits/${audit.id}/execute`)}
                                                    disabled={audit.status === 'completed'}
                                                >
                                                    <Play className="mr-2 h-3 w-3" />
                                                    Execute
                                                </Button>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                    {audits.length === 0 && (
                                        <TableRow>
                                            <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                                                No audits scheduled.
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
