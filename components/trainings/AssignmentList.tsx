import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface AssignmentListProps {
    assignments: any[];
    loading: boolean;
}

export function AssignmentList({ assignments, loading }: AssignmentListProps) {
    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'scheduled': return <Badge className="bg-blue-600">Scheduled</Badge>;
            case 'completed': return <Badge className="bg-green-600">Completed</Badge>;
            case 'cancelled': return <Badge variant="destructive">Cancelled</Badge>;
            case 'assigned': return <Badge variant="secondary">Assigned</Badge>;
            case 'in_progress': return <Badge className="bg-amber-600">In Progress</Badge>;
            case 'failed': return <Badge variant="destructive">Failed</Badge>;
            default: return <Badge>{status}</Badge>;
        }
    };

    const formatDate = (dateString?: string) => {
        if (!dateString) return '-';
        return new Date(dateString).toLocaleDateString();
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle>Training Assignments</CardTitle>
            </CardHeader>
            <CardContent>
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>User</TableHead>
                            <TableHead>Training</TableHead>
                            <TableHead>Assigned Date</TableHead>
                            <TableHead>Completion Date</TableHead>
                            <TableHead>Status</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {loading ? (
                            <TableRow>
                                <TableCell colSpan={5} className="text-center py-8">Loading...</TableCell>
                            </TableRow>
                        ) : assignments.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                                    No assignments found
                                </TableCell>
                            </TableRow>
                        ) : (
                            assignments.map((assignment) => (
                                <TableRow key={assignment.id}>
                                    <TableCell>
                                        <div>
                                            <div className="font-medium">
                                                {assignment.user?.full_name || 'Unknown User'}
                                            </div>
                                            <div className="text-xs text-muted-foreground">
                                                {assignment.user?.email}
                                            </div>
                                        </div>
                                    </TableCell>
                                    <TableCell>{assignment.training?.title || '-'}</TableCell>
                                    <TableCell>{formatDate(assignment.assigned_date)}</TableCell>
                                    <TableCell>{formatDate(assignment.completion_date)}</TableCell>
                                    <TableCell>{getStatusBadge(assignment.status)}</TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </CardContent>
        </Card>
    );
}
