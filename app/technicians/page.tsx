"use client"

import { useState, useEffect } from "react";
import { AppShell } from "@/components/layout/AppShell";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { getTechnicians, updateTechnician } from "@/lib/queries/technicians";
import type { Technician } from "@/types/technician";
import { Loader } from "@/components/ui/Loader";
import { Plus, User, Phone, Calendar, Edit, ShieldCheck, ShieldAlert } from "lucide-react";
import Link from "next/link";
import { StatusBadge } from "@/components/ui/StatusBadge";

export default function TechniciansPage() {
    const [technicians, setTechnicians] = useState<Technician[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        setLoading(true);
        try {
            const { data, error } = await getTechnicians();
            if (error) throw error;
            setTechnicians(data || []);
        } catch (error) {
            console.error("Error loading technicians:", error);
        } finally {
            setLoading(false);
        }
    };

    const toggleActive = async (tech: Technician) => {
        try {
            await updateTechnician(tech.id, { active: !tech.active });
            loadData();
        } catch (error) {
            console.error("Error updating technician:", error);
        }
    };

    return (
        <AppShell>
            <div className="p-6 space-y-6">
                <SectionHeader
                    title="Technician Management"
                    description="Manage qualified technicians for digital signatures"
                    action={
                        <Link href="/technicians/create">
                            <Button>
                                <Plus className="mr-2 h-4 w-4" />
                                Register Technician
                            </Button>
                        </Link>
                    }
                />

                {loading ? (
                    <div className="flex justify-center py-12">
                        <Loader />
                    </div>
                ) : technicians.length === 0 ? (
                    <Card>
                        <CardContent className="flex flex-col items-center justify-center py-12">
                            <User className="h-12 w-12 text-muted-foreground mb-4" />
                            <h3 className="text-lg font-semibold mb-2">No technicians registered</h3>
                            <p className="text-sm text-muted-foreground mb-4">
                                Register technicians to enable digital signatures on forms
                            </p>
                            <Link href="/technicians/create">
                                <Button>
                                    <Plus className="mr-2 h-4 w-4" />
                                    Register Technician
                                </Button>
                            </Link>
                        </CardContent>
                    </Card>
                ) : (
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                        {technicians.map((tech) => (
                            <Card key={tech.id} className="hover:shadow-md transition-shadow">
                                <CardContent className="p-5">
                                    <div className="flex justify-between items-start mb-4">
                                        <div className="flex items-center gap-3">
                                            <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold">
                                                {tech.name.charAt(0)}
                                            </div>
                                            <div>
                                                <h3 className="font-semibold">{tech.name}</h3>
                                                <p className="text-xs text-muted-foreground">{tech.role || 'Technician'}</p>
                                            </div>
                                        </div>
                                        <div onClick={() => toggleActive(tech)} className="cursor-pointer">
                                            <StatusBadge status={tech.active ? 'active' : 'inactive'} />
                                        </div>
                                    </div>

                                    <div className="space-y-2 text-sm text-muted-foreground mb-4">
                                        <div className="flex items-center gap-2">
                                            <Phone className="h-3.5 w-3.5" />
                                            <span>{tech.contact || 'No contact info'}</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <Calendar className="h-3.5 w-3.5" />
                                            <span>Since {tech.entry_date ? new Date(tech.entry_date).toLocaleDateString() : 'N/A'}</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            {tech.signature_pin_hash ? (
                                                <span className="flex items-center gap-1 text-green-600 text-xs bg-green-50 px-2 py-0.5 rounded-full border border-green-100">
                                                    <ShieldCheck className="h-3 w-3" />
                                                    PIN Set
                                                </span>
                                            ) : (
                                                <span className="flex items-center gap-1 text-amber-600 text-xs bg-amber-50 px-2 py-0.5 rounded-full border border-amber-100">
                                                    <ShieldAlert className="h-3 w-3" />
                                                    No PIN
                                                </span>
                                            )}
                                        </div>
                                    </div>

                                    <div className="flex gap-2">
                                        <Link href={`/technicians/${tech.id}/edit`} className="w-full">
                                            <Button variant="outline" size="sm" className="w-full">
                                                <Edit className="mr-2 h-3.5 w-3.5" />
                                                Edit Details
                                            </Button>
                                        </Link>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                )}
            </div>
        </AppShell>
    );
}
