"use client"

import { ProductWithDetails, ProductQualitySummary } from "@/types/product";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
    TrendingUp,
    TrendingDown,
    Minus,
    CheckCircle2,
    AlertCircle,
    TestTube,
    Calendar,
    Package
} from "lucide-react";

interface ProductStatsProps {
    product: ProductWithDetails;
    stats: ProductQualitySummary;
}

export function ProductStats({ product, stats }: ProductStatsProps) {
    const passRate = stats.pass_rate || 0;
    const hasTests = stats.total_tests > 0;

    const getTrendIcon = () => {
        if (passRate >= 95) return <TrendingUp className="h-4 w-4 text-green-500" />;
        if (passRate >= 80) return <Minus className="h-4 w-4 text-yellow-500" />;
        return <TrendingDown className="h-4 w-4 text-red-500" />;
    };

    const getPassRateColor = () => {
        if (passRate >= 95) return "text-green-500";
        if (passRate >= 80) return "text-yellow-500";
        return "text-red-500";
    };

    return (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {/* Specifications */}
            <Card className="bg-slate-900 border-slate-800">
                <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                        <CheckCircle2 className="h-4 w-4" />
                        Especificações
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="text-3xl font-bold">{stats.total_specs}</div>
                    {stats.critical_specs > 0 && (
                        <p className="text-xs text-red-500 mt-1">
                            {stats.critical_specs} críticas
                        </p>
                    )}
                </CardContent>
            </Card>

            {/* Total Tests */}
            <Card className="bg-slate-900 border-slate-800">
                <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                        <TestTube className="h-4 w-4" />
                        Total de Testes
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="text-3xl font-bold">{stats.total_tests}</div>
                    <p className="text-xs text-muted-foreground mt-1">
                        {stats.tests_passed} aprovados / {stats.tests_failed} reprovados
                    </p>
                </CardContent>
            </Card>

            {/* Pass Rate */}
            <Card className="bg-slate-900 border-slate-800">
                <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                        {getTrendIcon()}
                        Taxa de Aprovação
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    {hasTests ? (
                        <>
                            <div className={`text-3xl font-bold ${getPassRateColor()}`}>
                                {passRate.toFixed(1)}%
                            </div>
                            <div className="w-full h-2 bg-secondary rounded-full overflow-hidden mt-2">
                                <div
                                    className={`h-full transition-all ${passRate >= 95 ? 'bg-green-500' :
                                            passRate >= 80 ? 'bg-yellow-500' :
                                                'bg-red-500'
                                        }`}
                                    style={{ width: `${passRate}%` }}
                                />
                            </div>
                        </>
                    ) : (
                        <div className="text-sm text-muted-foreground">
                            Sem testes
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Last Test */}
            <Card className="bg-slate-900 border-slate-800">
                <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                        <Calendar className="h-4 w-4" />
                        Último Teste
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    {stats.last_test_date ? (
                        <>
                            <div className="text-lg font-bold">
                                {new Date(stats.last_test_date).toLocaleDateString()}
                            </div>
                            <p className="text-xs text-muted-foreground mt-1">
                                {new Date(stats.last_test_date).toLocaleTimeString()}
                            </p>
                        </>
                    ) : (
                        <div className="text-sm text-muted-foreground">
                            Nenhum teste
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
