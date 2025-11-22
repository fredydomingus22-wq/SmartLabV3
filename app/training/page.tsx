'use client';

import { useState, useEffect } from 'react';
import { AppShell } from '@/components/layout/AppShell';
import { SectionHeader } from '@/components/ui/SectionHeader';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { getTrainings, createTraining, getTrainingAssignments, assignTraining } from '@/lib/queries/training';
import { getProfiles } from '@/lib/queries/profiles';
import { Training } from '@/types/training';
import { Profile } from '@/lib/queries/profiles';
import { toast } from 'sonner';
import { GraduationCap, Plus, Award, Calendar, UserPlus } from 'lucide-react';

export default function TrainingPage() {
    const [trainings, setTrainings] = useState<Training[]>([]);
    const [assignments, setAssignments] = useState<any[]>([]);
    const [users, setUsers] = useState<Profile[]>([]);
    const [loading, setLoading] = useState(true);
    const [dialogOpen, setDialogOpen] = useState(false);
    const [assignDialogOpen, setAssignDialogOpen] = useState(false);
    const [selectedTraining, setSelectedTraining] = useState<string>('');
    const [selectedUser, setSelectedUser] = useState<string>('');
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        instructor: '',
        duration_hours: '',
        date: '',
        status: 'scheduled' as Training['status']
    });

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

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await createTraining({
                ...formData,
                duration_hours: formData.duration_hours ? parseInt(formData.duration_hours) : undefined
            });
            toast.success("Training course created");
            setDialogOpen(false);
            fetchData();
            setFormData({
                title: '',
                description: '',
                instructor: '',
                duration_hours: '',
                date: '',
                status: 'scheduled'
            });
        } catch (error) {
            console.error("Error creating training:", error);
            toast.error("Failed to create training");
        }
    };

    const handleAssign = async () => {
        if (!selectedTraining || !selectedUser) {
            toast.error("Please select both training and user");
            return;
        }
        try {
            await assignTraining(selectedTraining, selectedUser);
            toast.success("Training assigned successfully");
            setAssignDialogOpen(false);
            setSelectedTraining('');
            setSelectedUser('');
            fetchData();
        } catch (error) {
            console.error("Error assigning training:", error);
            toast.error("Failed to assign training");
        }
    };

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
        <AppShell>
            <div className="p-6 space-y-6">
                <SectionHeader
                    title="Training & Competency"
                    description="Manage training courses and employee certifications"
                    action={
                        <div className="flex gap-2">
                            <Dialog open={assignDialogOpen} onOpenChange={setAssignDialogOpen}>
                                <DialogTrigger asChild>
                                    <Button variant="outline">
                                        <UserPlus className="w-4 h-4 mr-2" />
                                        Assign Training
                                    </Button>
                                </DialogTrigger>
                                <DialogContent>
                                    <DialogHeader>
                                        <DialogTitle>Assign Training to User</DialogTitle>
                                    </DialogHeader>
                                    <div className="space-y-4">
                                        <div className="space-y-2">
                                            <Label>Training Course</Label>
                                            <Select value={selectedTraining} onValueChange={setSelectedTraining}>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Select training" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {trainings.map(training => (
                                                        <SelectItem key={training.id} value={training.id}>
                                                            {training.title}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        </div>
                                        <div className="space-y-2">
                                            <Label>User</Label>
                                            <Select value={selectedUser} onValueChange={setSelectedUser}>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Select user" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {users.map(user => (
                                                        <SelectItem key={user.id} value={user.id}>
                                                            {user.full_name} - {user.role}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        </div>
                                        <div className="flex justify-end gap-2">
                                            <Button variant="outline" onClick={() => setAssignDialogOpen(false)}>
                                                Cancel
                                            </Button>
                                            <Button onClick={handleAssign}>
                                                Assign
                                            </Button>
                                        </div>
                                    </div>
                                </DialogContent>
                            </Dialog>
                            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                                <DialogTrigger asChild>
                                    <Button>
                                        <Plus className="w-4 h-4 mr-2" />
                                        Create Training
                                    </Button>
                                </DialogTrigger>
                                <DialogContent className="max-w-2xl">
                                    <DialogHeader>
                                        <DialogTitle>Create Training Course</DialogTitle>
                                    </DialogHeader>
                                    <form onSubmit={handleSubmit} className="space-y-4">
                                        <div className="space-y-2">
                                            <Label htmlFor="title">Title *</Label>
                                            <Input
                                                id="title"
                                                value={formData.title}
                                                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                                required
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="description">Description</Label>
                                            <Textarea
                                                id="description"
                                                value={formData.description}
                                                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                                rows={3}
                                            />
                                        </div>
                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="space-y-2">
                                                <Label htmlFor="instructor">Instructor</Label>
                                                <Input
                                                    id="instructor"
                                                    value={formData.instructor}
                                                    onChange={(e) => setFormData({ ...formData, instructor: e.target.value })}
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <Label htmlFor="duration">Duration (hours)</Label>
                                                <Input
                                                    id="duration"
                                                    type="number"
                                                    value={formData.duration_hours}
                                                    onChange={(e) => setFormData({ ...formData, duration_hours: e.target.value })}
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <Label htmlFor="date">Date</Label>
                                                <Input
                                                    id="date"
                                                    type="date"
                                                    value={formData.date}
                                                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <Label htmlFor="status">Status</Label>
                                                <Select
                                                    value={formData.status}
                                                    onValueChange={(value: Training['status']) =>
                                                        setFormData({ ...formData, status: value })
                                                    }
                                                >
                                                    <SelectTrigger>
                                                        <SelectValue />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        <SelectItem value="scheduled">Scheduled</SelectItem>
                                                        <SelectItem value="completed">Completed</SelectItem>
                                                        <SelectItem value="cancelled">Cancelled</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                            </div>
                                        </div>
                                        <div className="flex justify-end gap-2">
                                            <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                                                Cancel
                                            </Button>
                                            <Button type="submit">Create Training</Button>
                                        </div>
                                    </form>
                                </DialogContent>
                            </Dialog>
                        </div>
                    }
                />

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
                    </TabsContent>

                    <TabsContent value="assignments">
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
                    </TabsContent>
                </Tabs>
            </div>
        </AppShell>
    );
}
