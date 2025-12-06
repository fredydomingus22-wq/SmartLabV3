import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Training } from '@/types/training';

interface TrainingStatsProps {
    trainings: Training[];
    assignments: any[];
}

export function TrainingStats({ trainings, assignments }: TrainingStatsProps) {
    return (
        <div className="grid gap-4 md:grid-cols-3">
            <Card>
                <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-muted-foreground">Total Courses</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">{trainings.length}</div>
                </CardContent>
            </Card>
            <Card>
                <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-muted-foreground">Active Assignments</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">
                        {assignments.filter(a => a.status === 'assigned' || a.status === 'in_progress').length}
                    </div>
                </CardContent>
            </Card>
            <Card>
                <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-muted-foreground">Completed</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold text-green-600">
                        {assignments.filter(a => a.status === 'completed').length}
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
