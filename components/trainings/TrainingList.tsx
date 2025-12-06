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
import { Calendar } from 'lucide-react';
import { Training } from '@/types/training';

interface TrainingListProps {
    trainings: Training[];
    loading: boolean;
}

export function TrainingList({ trainings, loading }: TrainingListProps) {
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
                <CardTitle>Training Courses</CardTitle>
            </CardHeader>
            <CardContent>
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Title</TableHead>
                            <TableHead>Instructor</TableHead>
                            <TableHead>Duration</TableHead>
                            <TableHead>Date</TableHead>
                            <TableHead>Status</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {loading ? (
                            <TableRow>
                                <TableCell colSpan={5} className="text-center py-8">Loading...</TableCell>
                            </TableRow>
                        ) : trainings.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                                    No training courses found
                                </TableCell>
                            </TableRow>
                        ) : (
                            trainings.map((training) => (
                                <TableRow key={training.id}>
                                    <TableCell>
                                        <div>
                                            <div className="font-medium">{training.title}</div>
                                            {training.description && (
                                                <div className="text-xs text-muted-foreground line-clamp-1">
                                                    {training.description}
                                                </div>
                                            )}
                                        </div>
                                    </TableCell>
                                    <TableCell>{training.instructor || '-'}</TableCell>
                                    <TableCell>
                                        {training.duration_hours ? `${training.duration_hours}h` : '-'}
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex items-center gap-2 text-sm">
                                            <Calendar className="w-3 h-3 text-muted-foreground" />
                                            {formatDate(training.date)}
                                        </div>
                                    </TableCell>
                                    <TableCell>{getStatusBadge(training.status)}</TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </CardContent>
        </Card>
    );
}
