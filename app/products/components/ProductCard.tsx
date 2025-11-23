"use client"

import { Product, ProductQualitySummary } from "@/types/product";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Package, MoreVertical, Eye, Edit, Power, Trash2, CheckCircle2, AlertCircle, TrendingUp, TestTube } from "lucide-react";
import Link from "next/link";

interface ProductCardProps {
    product: Product;
    stats?: ProductQualitySummary | null;
    onEdit?: (product: Product) => void;
    onToggleActive?: (product: Product) => void;
    onDelete?: (product: Product) => void;
}

const PRODUCT_TYPE_COLORS = {
    beverage: "bg-blue-500/10 text-blue-500 border-blue-500/20",
    syrup: "bg-amber-500/10 text-amber-500 border-amber-500/20",
    concentrate: "bg-purple-500/10 text-purple-500 border-purple-500/20",
    other: "bg-gray-500/10 text-gray-500 border-gray-500/20"
};

const PRODUCT_TYPE_LABELS = {
    beverage: "Bebida",
    syrup: "Xarope",
    concentrate: "Concentrado",
    other: "Outro"
};

export function ProductCard({ product, stats, onEdit, onToggleActive, onDelete }: ProductCardProps) {
    const passRate = stats?.pass_rate || 0;
    const hasTests = (stats?.total_tests || 0) > 0;

    return (
        <Card className="relative overflow-hidden hover:border-primary/50 transition-all duration-200 group">
            {/* Inactive overlay */}
            {!product.active && (
                <div className="absolute inset-0 bg-black/60 z-10 flex items-center justify-center">
                    <Badge variant="destructive" className="text-sm">Inativo</Badge>
                </div>
            )}

            <div className="p-5 space-y-4">
                {/* Header */}
                <div className="flex items-start justify-between gap-3">
                    <div className="flex items-start gap-3 flex-1 min-w-0">
                        <div className="p-2 bg-primary/10 rounded-lg shrink-0">
                            <Package className="h-5 w-5 text-primary" />
                        </div>
                        <div className="flex-1 min-w-0">
                            <h3 className="font-semibold text-lg truncate group-hover:text-primary transition-colors">
                                {product.name}
                            </h3>
                            <p className="text-sm text-muted-foreground">SKU: {product.sku}</p>
                        </div>
                    </div>

                    {/* Actions Menu */}
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="shrink-0">
                                <MoreVertical className="h-4 w-4" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                            <Link href={`/products/${product.id}`}>
                                <DropdownMenuItem>
                                    <Eye className="mr-2 h-4 w-4" />
                                    Ver Detalhes
                                </DropdownMenuItem>
                            </Link>
                            {onEdit && (
                                <DropdownMenuItem onClick={() => onEdit(product)}>
                                    <Edit className="mr-2 h-4 w-4" />
                                    Editar
                                </DropdownMenuItem>
                            )}
                            {onToggleActive && (
                                <>
                                    <DropdownMenuSeparator />
                                    <DropdownMenuItem onClick={() => onToggleActive(product)}>
                                        <Power className="mr-2 h-4 w-4" />
                                        {product.active ? 'Desativar' : 'Ativar'}
                                    </DropdownMenuItem>
                                </>
                            )}
                            {onDelete && (
                                <>
                                    <DropdownMenuSeparator />
                                    <DropdownMenuItem
                                        onClick={() => onDelete(product)}
                                        className="text-destructive focus:text-destructive"
                                    >
                                        <Trash2 className="mr-2 h-4 w-4" />
                                        Eliminar
                                    </DropdownMenuItem>
                                </>
                            )}
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>

                {/* Type and Category */}
                <div className="flex flex-wrap gap-2">
                    {product.product_type && (
                        <Badge
                            variant="outline"
                            className={PRODUCT_TYPE_COLORS[product.product_type]}
                        >
                            {PRODUCT_TYPE_LABELS[product.product_type]}
                        </Badge>
                    )}
                    {product.category && (
                        <Badge variant="outline" className="capitalize">
                            {product.category}
                        </Badge>
                    )}
                </div>

                {/* Description */}
                {product.description && (
                    <p className="text-sm text-muted-foreground line-clamp-2">
                        {product.description}
                    </p>
                )}

                {/* Stats Grid */}
                {stats && (
                    <div className="grid grid-cols-2 gap-3 pt-3 border-t border-border/50">
                        {/* Specs Count */}
                        <div className="space-y-1">
                            <div className="text-xs text-muted-foreground flex items-center gap-1">
                                <CheckCircle2 className="h-3 w-3" />
                                Especificações
                            </div>
                            <div className="text-lg font-bold">
                                {stats.total_specs}
                                {stats.critical_specs > 0 && (
                                    <span className="text-xs text-red-500 ml-1">
                                        ({stats.critical_specs} críticas)
                                    </span>
                                )}
                            </div>
                        </div>

                        {/* Tests Count */}
                        <div className="space-y-1">
                            <div className="text-xs text-muted-foreground flex items-center gap-1">
                                <TestTube className="h-3 w-3" />
                                Testes
                            </div>
                            <div className="text-lg font-bold">{stats.total_tests}</div>
                        </div>

                        {/* Pass Rate */}
                        {hasTests && (
                            <div className="col-span-2 space-y-1">
                                <div className="text-xs text-muted-foreground flex items-center gap-1">
                                    <TrendingUp className="h-3 w-3" />
                                    Taxa de Aprovação
                                </div>
                                <div className="flex items-center gap-2">
                                    <div className="flex-1 h-2 bg-secondary rounded-full overflow-hidden">
                                        <div
                                            className={`h-full transition-all ${passRate >= 95 ? 'bg-green-500' :
                                                    passRate >= 80 ? 'bg-yellow-500' :
                                                        'bg-red-500'
                                                }`}
                                            style={{ width: `${passRate}%` }}
                                        />
                                    </div>
                                    <span className={`text-sm font-bold ${passRate >= 95 ? 'text-green-500' :
                                            passRate >= 80 ? 'text-yellow-500' :
                                                'text-red-500'
                                        }`}>
                                        {passRate.toFixed(1)}%
                                    </span>
                                </div>
                                <div className="text-xs text-muted-foreground">
                                    {stats.tests_passed} aprovados / {stats.tests_failed} reprovados
                                </div>
                            </div>
                        )}

                        {/* No tests message */}
                        {!hasTests && stats.total_specs > 0 && (
                            <div className="col-span-2 text-center py-2">
                                <AlertCircle className="h-4 w-4 mx-auto mb-1 text-muted-foreground" />
                                <p className="text-xs text-muted-foreground">
                                    Sem testes registados
                                </p>
                            </div>
                        )}
                    </div>
                )}

                {/* Footer */}
                <div className="flex items-center justify-between pt-3 border-t border-border/50">
                    <span className="text-xs text-muted-foreground">
                        Criado {new Date(product.created_at).toLocaleDateString()}
                    </span>
                    <Link href={`/products/${product.id}`}>
                        <Button size="sm" variant="ghost">
                            Ver Detalhes
                            <Eye className="ml-2 h-3 w-3" />
                        </Button>
                    </Link>
                </div>
            </div>
        </Card>
    );
}
