"use client"

import { useState } from "react";
import { useRouter } from "next/navigation";
import { AppShell } from "@/components/layout/AppShell";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createTechnician } from "@/lib/queries/technicians";
import { ArrowLeft, Save } from "lucide-react";
import Link from "next/link";

export default function CreateTechnicianPage() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        name: "",
        contact: "",
        role: "Technician",
        entry_date: new Date().toISOString().split('T')[0],
        signature_pin: ""
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            // In a real app, hash the PIN here or send to server to hash.
            // For this prototype, we'll store it as is (or simple hash if needed later), 
            // but the schema expects 'signature_pin_hash'.
            // We'll just store the plain pin for now as the 'hash' for simplicity of this demo,
            // but in production this MUST be hashed.
            const pinHash = formData.signature_pin;

            const { error } = await createTechnician({
                name: formData.name,
                contact: formData.contact,
                role: formData.role,
                entry_date: formData.entry_date,
                signature_pin_hash: pinHash,
                active: true
            });

            if (error) throw error;
            router.push('/technicians');
        } catch (error) {
            console.error("Error creating technician:", error);
            alert("Failed to create technician");
        } finally {
            setLoading(false);
        }
    };

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
                    title="Register Technician"
                    description="Add a new qualified technician to the system"
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
                                    placeholder="e.g., John Doe"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="role">Role/Position</Label>
                                    <Input
                                        id="role"
                                        value={formData.role}
                                        onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                                        placeholder="e.g., Senior Technician"
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
                                    placeholder="Phone or Email"
                                />
                            </div>

                            <div className="pt-4 border-t">
                                <h4 className="font-medium mb-3">Security</h4>
                                <div className="space-y-2">
                                    <Label htmlFor="pin">Signature PIN *</Label>
                                    <Input
                                        id="pin"
                                        type="password"
                                        value={formData.signature_pin}
                                        onChange={(e) => setFormData({ ...formData, signature_pin: e.target.value })}
                                        required
                                        placeholder="Enter 4-6 digit PIN"
                                        minLength={4}
                                    />
                                    <p className="text-xs text-muted-foreground">
                                        This PIN will be used to digitally sign forms.
                                    </p>
                                </div>
                            </div>

                            <div className="pt-4 flex gap-2">
                                <Button type="submit" disabled={loading}>
                                    <Save className="mr-2 h-4 w-4" />
                                    {loading ? 'Saving...' : 'Register Technician'}
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
