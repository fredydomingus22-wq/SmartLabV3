'use client';

import { useState, useEffect } from 'react';
import { AppShell } from '@/components/layout/AppShell';
import { SectionHeader } from '@/components/ui/SectionHeader';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { getProfiles, updateProfile, Profile } from '@/lib/queries/profiles';
import { toast } from 'sonner';
import { UserPlus, Shield, Mail } from 'lucide-react';

export default function UserManagementPage() {
    const [users, setUsers] = useState<Profile[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchUsers();
    }, []);

    const fetchUsers = async () => {
        try {
            const data = await getProfiles();
            setUsers(data);
        } catch (error) {
            console.error("Error fetching users:", error);
            toast.error("Failed to load users");
        } finally {
            setLoading(false);
        }
    };

    const handleRoleChange = async (userId: string, newRole: Profile['role']) => {
        try {
            await updateProfile(userId, { role: newRole });
            setUsers(users.map(u => u.id === userId ? { ...u, role: newRole } : u));
            toast.success("User role updated");
        } catch (error) {
            console.error("Error updating role:", error);
            toast.error("Failed to update role");
        }
    };

    const getRoleBadge = (role: string) => {
        switch (role) {
            case 'admin': return <Badge className="bg-red-600">Admin</Badge>;
            case 'manager': return <Badge className="bg-blue-600">Manager</Badge>;
            case 'supervisor': return <Badge className="bg-purple-600">Supervisor</Badge>;
            case 'technician': return <Badge className="bg-green-600">Technician</Badge>;
            case 'auditor': return <Badge className="bg-amber-600">Auditor</Badge>;
            default: return <Badge variant="secondary">{role}</Badge>;
        }
    };

    return (
        <AppShell>
            <div className="p-6 space-y-6">
                <SectionHeader
                    title="User Management"
                    description="Manage system users and access roles"
                    action={
                        <Button onClick={() => toast.info("Invite functionality coming soon")}>
                            <UserPlus className="w-4 h-4 mr-2" />
                            Invite User
                        </Button>
                    }
                />

                <Card>
                    <CardHeader>
                        <CardTitle>System Users</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Name</TableHead>
                                    <TableHead>Email</TableHead>
                                    <TableHead>Current Role</TableHead>
                                    <TableHead>Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {loading ? (
                                    <TableRow>
                                        <TableCell colSpan={4} className="text-center py-8">Loading users...</TableCell>
                                    </TableRow>
                                ) : users.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={4} className="text-center py-8">No users found</TableCell>
                                    </TableRow>
                                ) : (
                                    users.map((user) => (
                                        <TableRow key={user.id}>
                                            <TableCell className="font-medium">
                                                <div className="flex items-center gap-2">
                                                    <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center">
                                                        {user.full_name.charAt(0)}
                                                    </div>
                                                    {user.full_name}
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex items-center gap-2 text-muted-foreground">
                                                    <Mail className="w-3 h-3" />
                                                    {user.email}
                                                </div>
                                            </TableCell>
                                            <TableCell>{getRoleBadge(user.role)}</TableCell>
                                            <TableCell>
                                                <Select
                                                    defaultValue={user.role}
                                                    onValueChange={(value) => handleRoleChange(user.id, value as Profile['role'])}
                                                >
                                                    <SelectTrigger className="w-[140px]">
                                                        <SelectValue />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        <SelectItem value="admin">Admin</SelectItem>
                                                        <SelectItem value="manager">Manager</SelectItem>
                                                        <SelectItem value="supervisor">Supervisor</SelectItem>
                                                        <SelectItem value="technician">Technician</SelectItem>
                                                        <SelectItem value="auditor">Auditor</SelectItem>
                                                    </SelectContent>
                                                </Select>
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
