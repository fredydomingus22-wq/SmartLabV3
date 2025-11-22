"use client";

import { useState, useEffect } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useDashboardMetrics } from "@/lib/hooks/useDashboardData";
import { KPICard } from "./KPICard";
import { KPISkeleton } from "@/components/ui/skeleton";
import Link from "next/link";
import { createClient } from '@/lib/supabase/client';
import { getProducts } from '@/lib/queries/production';

export function WelcomeSection() {
    const { data, isLoading } = useDashboardMetrics();
    const [user, setUser] = useState<{ full_name: string; role: string } | null>(null);
    const [products, setProducts] = useState<any[]>([]);
    const [selectedProduct, setSelectedProduct] = useState('all');
    const supabase = createClient();

    useEffect(() => {
        fetchUserData();
        fetchProducts();
    }, []);

    const fetchUserData = async () => {
        try {
            const { data: { user: authUser } } = await supabase.auth.getUser();
            if (authUser) {
                const { data: profile } = await supabase
                    .from('profiles')
                    .select('full_name, role')
                    .eq('id', authUser.id)
                    .single();
                if (profile) {
                    setUser(profile);
                }
            }
        } catch (error) {
            console.error('Error fetching user:', error);
        }
    };

    const fetchProducts = async () => {
        try {
            const productsData = await getProducts();
            setProducts(productsData);
        } catch (error) {
            console.error('Error fetching products:', error);
        }
    };

    const getRoleDisplay = (role: string) => {
        const roleMap: Record<string, string> = {
            'admin': 'Administrador',
            'manager': 'Gestor',
            'supervisor': 'Supervisor',
            'technician': 'Técnico',
            'auditor': 'Auditor'
        };
        return roleMap[role] || role;
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-end">
                <div>
                    <p className="text-sm text-muted-foreground">Bem-vindo de volta,</p>
                    <h1 className="text-3xl font-bold text-white">
                        {user ? getRoleDisplay(user.role) : 'Utilizador'}!
                    </h1>
                    <p className="text-muted-foreground">
                        {user ? `Olá, ${user.full_name}` : 'Aqui está o seu Resumo da Qualidade SmartLab'}
                    </p>
                </div>
                <div className="w-[200px]">
                    <Select value={selectedProduct} onValueChange={setSelectedProduct}>
                        <SelectTrigger className="w-full bg-slate-950 border-slate-800 text-white h-9">
                            <SelectValue placeholder="Selecione SKU" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">Todos os SKUs</SelectItem>
                            {products.map((product) => (
                                <SelectItem key={product.id} value={product.id}>
                                    {product.name} ({product.code})
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
            </div>

            <div className="grid gap-4 md:grid-cols-4">
                {isLoading ? (
                    <>
                        <KPISkeleton />
                        <KPISkeleton />
                        <KPISkeleton />
                        <KPISkeleton />
                    </>
                ) : (
                    <>
                        <Link href="/finished-lots">
                            <KPICard
                                title="Lotes Liberados"
                                value={data?.releasedCount ?? 0}
                                subtitle="Últimas 24h"
                                trend={{ value: "+5%", direction: "up", label: "vs ontem" }}
                            />
                        </Link>
                        <Link href="/nc">
                            <KPICard
                                title="NCs Críticas"
                                value={data?.ncCount ?? 0}
                                subtitle="Em aberto"
                                trend={{ value: "-2", direction: "down", label: "vs semana passada" }}
                            />
                        </Link>
                        <Link href="/food-safety">
                            <KPICard
                                title="Precisão PCC"
                                value={data?.pccPrecision ?? "0%"}
                                subtitle="Últimas 72h"
                            />
                        </Link>
                        <Link href="/lab-tests">
                            <KPICard
                                title="Turnaround Médio"
                                value={data?.avgTurnaround ?? "0 min"}
                                subtitle="Tempo de análise"
                            />
                        </Link>
                    </>
                )}
            </div>
        </div>
    );
}
