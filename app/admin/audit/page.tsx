'use client';

import { useState, useEffect } from 'react';
import { AppShell } from '@/components/layout/AppShell';
import { SectionHeader } from '@/components/ui/SectionHeader';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { getAuditLogs } from '@/lib/queries/audit';
import { AuditLog } from '@/types/audit';
import { toast } from 'sonner';
import { Shield, Activity, Calendar } from 'lucide-react';

export default function AuditLogPage() {
    const [logs, setLogs] = useState<AuditLog[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchLogs();
    }, []);

    const fetchLogs = async () => {
        try {
            const data = await getAuditLogs(100);
            setLogs(data);
        } catch (error) {
            console.error("Error fetching audit logs:", error);
            toast.error("Failed to load audit logs");
        } finally {
            setLoading(false);
        }
    };

    const getActionBadge = (action: string) => {
        if (action.includes('create') || action.includes('CREATE')) {
            return <Badge className="bg-green-600">Create</Badge>;
        } else if (action.includes('update') || action.includes('UPDATE')) {
            return <Badge className="bg-blue-600">Update</Badge>;
        } else if (action.includes('delete') || action.includes('DELETE')) {
            return <Badge className="bg-red-600">Delete</Badge>;
        } else {
            return <Badge variant="secondary">{action}</Badge>;
        }
    };

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    return (
        <AppShell>
            <div className="p-6 space-y-6">
                <SectionHeader
                    title="Audit Logs"
                    description="System activity and security events"
                />

                <div className="grid gap-4 md:grid-cols-3">
                    <Card>
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium text-muted-foreground">Total Events</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{logs.length}</div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium text-muted-foreground">Last 24 Hours</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">
                                {logs.filter(log => {
                                    const logDate = new Date(log.performed_at);
                                    const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
                                    return logDate > oneDayAgo;
                                }).length}
                            </div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium text-muted-foreground">Unique Users</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">
                                {new Set(logs.map(log => log.performed_by)).size}
                            </div>
                        </CardContent>
                    </Card>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle>Activity Log</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Timestamp</TableHead>
                                    <TableHead>User</TableHead>
                                    <TableHead>Action</TableHead>
                                    <TableHead>Entity Type</TableHead>
                                    <TableHead>Entity ID</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {loading ? (
                                    <TableRow>
                                        <TableCell colSpan={5} className="text-center py-8">
                                            <Activity className="w-6 h-6 animate-spin mx-auto mb-2 text-muted-foreground" />
                                            Loading logs...
                                        </TableCell>
                                    </TableRow>
                                ) : logs.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                                            No audit logs found
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    logs.map((log) => (
                                        <TableRow key={log.id}>
                                            <TableCell>
                                                <div className="flex items-center gap-2 text-sm">
                                                    <Calendar className="w-3 h-3 text-muted-foreground" />
                                                    {formatDate(log.performed_at)}
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <div className="font-medium">
                                                    {log.performed_by || 'System'}
                                                </div>
                                            </TableCell>
                                            <TableCell>{getActionBadge(log.operation)}</TableCell>
                                            <TableCell>
                                                <Badge variant="outline">{log.table_name}</Badge>
                                            </TableCell>
                                            <TableCell className="font-mono text-xs text-muted-foreground">
                                                {log.row_id ? log.row_id.substring(0, 8) + '...' : '-'}
                                            </TableCell>
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>
            </div>
        </AppShell>
    );
}
