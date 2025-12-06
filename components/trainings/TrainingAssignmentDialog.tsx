import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { UserPlus } from 'lucide-react';
import { Training } from '@/types/training';
import { Profile } from '@/lib/queries/profiles';
import { assignTraining } from '@/lib/queries/training';
import { toast } from 'sonner';

interface TrainingAssignmentDialogProps {
    trainings: Training[];
    users: Profile[];
    onSuccess: () => void;
}

export function TrainingAssignmentDialog({ trainings, users, onSuccess }: TrainingAssignmentDialogProps) {
    const [open, setOpen] = useState(false);
    const [selectedTraining, setSelectedTraining] = useState<string>('');
    const [selectedUser, setSelectedUser] = useState<string>('');

    const handleAssign = async () => {
        if (!selectedTraining || !selectedUser) {
            toast.error("Please select both training and user");
            return;
        }
        try {
            await assignTraining(selectedTraining, selectedUser);
            toast.success("Training assigned successfully");
            setOpen(false);
            setSelectedTraining('');
            setSelectedUser('');
            onSuccess();
        } catch (error) {
            console.error("Error assigning training:", error);
            toast.error("Failed to assign training");
        }
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
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
                        <Button variant="outline" onClick={() => setOpen(false)}>
                            Cancel
                        </Button>
                        <Button onClick={handleAssign}>
                            Assign
                        </Button>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}
