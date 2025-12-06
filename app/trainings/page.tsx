'use client';

import { useState, useEffect } from 'react';
import { AppShell } from '@/components/layout/AppShell';
import { SectionHeader } from '@/components/ui/SectionHeader';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { TrainingCreateDialog } from '@/components/trainings/TrainingCreateDialog';
import { TrainingAssignmentDialog } from '@/components/trainings/TrainingAssignmentDialog';
import { TrainingList } from '@/components/trainings/TrainingList';
import { AssignmentList } from '@/components/trainings/AssignmentList';
import { TrainingStats } from '@/components/trainings/TrainingStats';
import { getTrainings, getTrainingAssignments } from '@/lib/queries/training';
import { getProfiles } from '@/lib/queries/profiles';
import { Training } from '@/types/training';
import { Profile } from '@/lib/queries/profiles';
import { toast } from 'sonner';
import { GraduationCap, Award } from 'lucide-react';

export default function TrainingsPage() {
    const [trainings, setTrainings] = useState<Training[]>([]);
    const [assignments, setAssignments] = useState<any[]>([]);
    const [users, setUsers] = useState<Profile[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const [trainingsData, assignmentsData, usersData] = await Promise.all([
                getTrainings(),
                getTrainingAssignments(),
                getProfiles()
            ]);
            setTrainings(trainingsData);
            setAssignments(assignmentsData);
            setUsers(usersData);
        } catch (error) {
            console.error("Error fetching data:", error);
            toast.error("Failed to load training data");
        } finally {
            setLoading(false);
        }
    };

    return (
        <AppShell>
            <div className="p-6 space-y-6">
                <SectionHeader
                    title="Training & Competency"
                    description="Manage training courses and employee certifications"
                    action={
                        <div className="flex gap-2">
                            <TrainingAssignmentDialog
                                trainings={trainings}
                                users={users}
                                onSuccess={fetchData}
                            />
                            <TrainingCreateDialog onSuccess={fetchData} />
                        </div>
                    }
                />

                <TrainingStats trainings={trainings} assignments={assignments} />

                <Tabs defaultValue="courses" className="space-y-4">
                    <TabsList>
                        <TabsTrigger value="courses">
                            <GraduationCap className="w-4 h-4 mr-2" />
                            Courses
                        </TabsTrigger>
                        <TabsTrigger value="assignments">
                            <Award className="w-4 h-4 mr-2" />
                            Assignments
                        </TabsTrigger>
                    </TabsList>

                    <TabsContent value="courses">
                        <TrainingList trainings={trainings} loading={loading} />
                    </TabsContent>

                    <TabsContent value="assignments">
                        <AssignmentList assignments={assignments} loading={loading} />
                    </TabsContent>
                </Tabs>
            </div>
        </AppShell>
    );
}
