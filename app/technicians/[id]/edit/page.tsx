"use client"

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { AppShell } from "@/components/layout/AppShell";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { getTechnicianById, updateTechnician } from "@/lib/queries/technicians";
import { ArrowLeft, Save, ShieldAlert } from "lucide-react";
import Link from "next/link";
import { Loader } from "@/components/ui/Loader";

export default function EditTechnicianPage() {
    const router = useRouter();
    const params = useParams();
    const id = params.id as string;

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [formData, setFormData] = useState({
        name: "",
        contact: "",
        role: "",
        entry_date: "",
        new_pin: ""
    });

    useEffect(() => {
        loadTechnician();
    }, [id]);

    const loadTechnician = async () => {
        try {
            const { data, error } = await getTechnicianById(id);
            if (error) throw error;
            if (data) {
                setFormData({
                    name: data.name,
                    contact: data.contact || "",
                    role: data.role || "",
                    entry_date: data.entry_date || "",
                    new_pin: ""
                });
            }
        } catch (error) {
            console.error("Error loading technician:", error);
            alert("Failed to load technician");
            router.push('/technicians');
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);

        try {
            const updates: any = {
                name: formData.name,
                contact: formData.contact,
                role: formData.role,
                entry_date: formData.entry_date,
            };

            if (formData.new_pin) {
                updates.signature_pin_hash = formData.new_pin;
            }

            const { error } = await updateTechnician(id, updates);

            if (error) throw error;
            router.push('/technicians');
        } catch (error) {
            console.error("Error updating technician:", error);
            alert("Failed to update technician");
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <AppShell>
                <div className="flex justify-center py-12">
                    <Loader />
                </div>
            </AppShell>
        );
    }

    return (
        <AppShell>
            <div className="p-6 space-y-6">
                <div className="flex items-center gap-4">
                    <Link href="/technicians">
                        <Button variant="ghost" size="sm">
                            <ArrowLeft className="mr-2 h-4 w-4" />
                            Back
                        </Button>
                    </Link>
                </div>

                <SectionHeader
                    title="Edit Technician"
                    description={`Update details for ${formData.name}`}
                />

                <form onSubmit={handleSubmit} className="max-w-2xl">
                    <Card>
                        <CardHeader>
                            <CardTitle>Technician Details</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="name">Full Name *</Label>
                                <Input
                                    id="name"
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    required
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="role">Role/Position</Label>
                                    <Input
                                        id="role"
                                        value={formData.role}
                                        onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="entry_date">Entry Date</Label>
                                    <Input
                                        id="entry_date"
                                        type="date"
                                        value={formData.entry_date}
                                        onChange={(e) => setFormData({ ...formData, entry_date: e.target.value })}
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="contact">Contact Information</Label>
                                <Input
                                    id="contact"
                                    value={formData.contact}
                                    onChange={(e) => setFormData({ ...formData, contact: e.target.value })}
                                />
                            </div>

                            <div className="pt-4 border-t">
                                <div className="flex items-center gap-2 mb-3">
                                    <ShieldAlert className="h-4 w-4 text-amber-500" />
                                    <h4 className="font-medium">Reset PIN</h4>
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="new_pin">New Signature PIN</Label>
                                    <Input
                                        id="new_pin"
                                        type="password"
                                        value={formData.new_pin}
                                        onChange={(e) => setFormData({ ...formData, new_pin: e.target.value })}
                                        placeholder="Leave blank to keep current PIN"
                                        minLength={4}
                                    />
                                    <p className="text-xs text-muted-foreground">
                                        Only enter a value if you want to change the technician's PIN.
                                    </p>
                                </div>
                            </div>

                            <div className="pt-4 flex gap-2">
                                <Button type="submit" disabled={saving}>
                                    <Save className="mr-2 h-4 w-4" />
                                    {saving ? 'Saving...' : 'Save Changes'}
                                </Button>
                                <Link href="/technicians">
                                    <Button variant="outline" type="button">Cancel</Button>
                                </Link>
                            </div>
                        </CardContent>
                    </Card>
                </form>
            </div>
        </AppShell>
    );
}
