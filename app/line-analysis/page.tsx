"use client"

import { useState, useEffect } from "react";
import { AppShell } from "@/components/layout/AppShell";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { getLineSamples } from "@/lib/queries/production";
import { LineSample } from "@/types/production";
import { Plus, TestTube, Clock, Factory, AlertCircle, CheckCircle, Search } from "lucide-react";
import { StatusBadge } from "@/components/ui/StatusBadge";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";

export default function LineAnalysisPage() {
    const [samples, setSamples] = useState<LineSample[]>([]);
    const [filteredSamples, setFilteredSamples] = useState<LineSample[]>([]);
    const [statusFilter, setStatusFilter] = useState<string>("all");
    const [searchQuery, setSearchQuery] = useState("");
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadData();
    }, []);

    useEffect(() => {
        filterData();
    }, [samples, statusFilter, searchQuery]);

    const loadData = async () => {
        try {
            const data = await getLineSamples();
            setSamples(data);
            setLoading(false);
        } catch (error) {
            console.error("Error loading samples:", error);
            setLoading(false);
        }
    };

    const filterData = () => {
        let result = samples;

        if (statusFilter !== "all") {
            result = result.filter(sample => sample.status === statusFilter);
        }

        if (searchQuery) {
            const query = searchQuery.toLowerCase();
            result = result.filter(sample =>
                sample.tank?.tank_code.toLowerCase().includes(query) ||
                sample.product?.name.toLowerCase().includes(query) ||
                sample.collected_by.toLowerCase().includes(query)
            );
        }

        setFilteredSamples(result);
    };

    return (
        <AppShell>
            <div className="p-6 space-y-6">
                <SectionHeader
                    title="Análises de Linha"
                    description="Monitorização de qualidade e amostras de linha"
                    action={
                        <Link href="/tanks">
                            <Button variant="outline">
                                <Plus className="mr-2 h-4 w-4" />
                                Nova Análise (via Tanque)
                            </Button>
                        </Link>
                    }
                />

                <div className="flex flex-col md:flex-row gap-4 items-center justify-between bg-card p-4 rounded-lg border">
                    <div className="relative w-full md:w-96">
                        <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input
                            placeholder="Pesquisar por tanque, produto ou técnico..."
                            className="pl-8"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                    <div className="flex items-center gap-2 w-full md:w-auto">
                        <Select value={statusFilter} onValueChange={setStatusFilter}>
                            <SelectTrigger className="w-[180px]">
                                <SelectValue placeholder="Filtrar por estado" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">Todos os Estados</SelectItem>
                                <SelectItem value="pending">Pendente</SelectItem>
                                <SelectItem value="approved">Aprovado</SelectItem>
                                <SelectItem value="oos">Fora de Especificação</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </div>

                {loading ? (
                    <div className="text-center py-12">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
                        <p className="mt-4 text-muted-foreground">A carregar análises...</p>
                    </div>
                ) : (
                    <div className="grid gap-4">
                        {filteredSamples.length === 0 ? (
                            <div className="text-center py-12 text-muted-foreground bg-card rounded-lg border border-dashed">
                                <TestTube className="h-12 w-12 mx-auto mb-4 opacity-50" />
                                <p>Nenhuma análise encontrada com os filtros atuais.</p>
                            </div>
                        ) : (
                            filteredSamples.map((sample) => (
                                <div key={sample.id} className="bg-card p-4 rounded-lg border hover:border-primary transition-colors flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
                                    <div className="flex items-start gap-4">
                                        <div className={`p-3 rounded-full ${sample.status === 'oos' ? 'bg-red-500/10 text-red-500' :
                                            sample.status === 'approved' ? 'bg-green-500/10 text-green-500' :
                                                'bg-blue-500/10 text-blue-500'
                                            }`}>
                                            <TestTube className="h-6 w-6" />
                                        </div>
                                        <div>
                                            <div className="flex items-center gap-2 mb-1">
                                                <h3 className="font-semibold text-lg">{sample.product?.name}</h3>
                                                <StatusBadge status={sample.status} />
                                            </div>
                                            <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-muted-foreground">
                                                <div className="flex items-center gap-1">
                                                    <Factory className="h-3 w-3" />
                                                    <span>Tanque: {sample.tank?.tank_code}</span>
                                                </div>
                                                <div className="flex items-center gap-1">
                                                    <Clock className="h-3 w-3" />
                                                    <span>{new Date(sample.sample_time).toLocaleString()}</span>
                                                </div>
                                                <div className="flex items-center gap-1">
                                                    <span>Por: {sample.collected_by}</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-4 w-full md:w-auto pl-14 md:pl-0">
                                        {sample.status === 'oos' && (
                                            <Badge variant="destructive" className="flex items-center gap-1">
                                                <AlertCircle className="h-3 w-3" />
                                                Fora de Spec
                                            </Badge>
                                        )}
                                        <Link href={`/line-analysis/${sample.id}`}>
                                            <Button variant="outline" size="sm">
                                                Ver Detalhes
                                            </Button>
                                        </Link>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                )}
            </div>
        </AppShell>
    );
}
