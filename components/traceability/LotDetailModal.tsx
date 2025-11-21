"use client"

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Calendar, MapPin, User, ExternalLink, Package, Beaker, Factory } from "lucide-react";
import Link from "next/link";

interface LotDetail {
    id: string;
    code: string;
    type: "production" | "intermediate" | "finished";
    status: string;
    product?: string;
    created_at: string;
    location?: string;
    operator?: string;
    genealogy?: {
        parent?: string;
        children?: string[];
    };
}

interface LotDetailModalProps {
    lot: LotDetail | null;
    isOpen: boolean;
    onClose: () => void;
}

export function LotDetailModal({ lot, isOpen, onClose }: LotDetailModalProps) {
    if (!lot) return null;

    const typeConfig = {
        production: { icon: Factory, label: "Lote de Produção", color: "blue", href: "/production-lots" },
        intermediate: { icon: Beaker, label: "Lote Intermediário", color: "amber", href: "/intermediate-lots" },
        finished: { icon: Package, label: "Produto Final", color: "purple", href: "/finished-lots" }
    };

    const config = typeConfig[lot.type];
    const Icon = config.icon;

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <div className="flex items-center gap-3 mb-2">
                        <div className={`p-3 rounded-xl bg-${config.color}-500/10`}>
                            <Icon className={`h-6 w-6 text-${config.color}-500`} />
                        </div>
                        <div>
                            <DialogTitle className="text-2xl font-bold">{lot.code}</DialogTitle>
                            <p className="text-sm text-muted-foreground">{config.label}</p>
                        </div>
                    </div>
                </DialogHeader>

                <div className="space-y-6 py-4">
                    {/* Status */}
                    <div>
                        <h4 className="text-sm font-semibold mb-2">Status</h4>
                        <Badge variant="outline" className="text-sm">
                            {lot.status}
                        </Badge>
                    </div>

                    <Separator />

                    {/* Product Info */}
                    {lot.product && (
                        <>
                            <div>
                                <h4 className="text-sm font-semibold mb-2">Produto</h4>
                                <p className="text-sm">{lot.product}</p>
                            </div>
                            <Separator />
                        </>
                    )}

                    {/* Metadata */}
                    <div className="grid grid-cols-2 gap-4">
                        <div className="flex items-start gap-2">
                            <Calendar className="h-4 w-4 text-muted-foreground mt-0.5" />
                            <div>
                                <p className="text-xs text-muted-foreground">Criado em</p>
                                <p className="text-sm font-medium">{new Date(lot.created_at).toLocaleString()}</p>
                            </div>
                        </div>

                        {lot.location && (
                            <div className="flex items-start gap-2">
                                <MapPin className="h-4 w-4 text-muted-foreground mt-0.5" />
                                <div>
                                    <p className="text-xs text-muted-foreground">Localização</p>
                                    <p className="text-sm font-medium">{lot.location}</p>
                                </div>
                            </div>
                        )}

                        {lot.operator && (
                            <div className="flex items-start gap-2">
                                <User className="h-4 w-4 text-muted-foreground mt-0.5" />
                                <div>
                                    <p className="text-xs text-muted-foreground">Operador</p>
                                    <p className="text-sm font-medium">{lot.operator}</p>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Genealogy */}
                    {lot.genealogy && (
                        <>
                            <Separator />
                            <div>
                                <h4 className="text-sm font-semibold mb-3">Rastreabilidade</h4>
                                <div className="space-y-2">
                                    {lot.genealogy.parent && (
                                        <div className="flex items-center gap-2 text-sm">
                                            <span className="text-muted-foreground">Origem:</span>
                                            <Link href={`#`} className="text-primary hover:underline font-medium">
                                                {lot.genealogy.parent}
                                            </Link>
                                        </div>
                                    )}
                                    {lot.genealogy.children && lot.genealogy.children.length > 0 && (
                                        <div>
                                            <p className="text-sm text-muted-foreground mb-1">Derivados:</p>
                                            <div className="flex flex-wrap gap-2">
                                                {lot.genealogy.children.map((child, i) => (
                                                    <Link key={i} href={`#`}>
                                                        <Badge variant="secondary" className="hover:bg-secondary/80 cursor-pointer">
                                                            {child}
                                                        </Badge>
                                                    </Link>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </>
                    )}

                    {/* Actions */}
                    <div className="flex gap-2 pt-4">
                        <Link href={`${config.href}`} className="flex-1">
                            <Button className="w-full gap-2">
                                <ExternalLink className="h-4 w-4" />
                                Ver na lista completa
                            </Button>
                        </Link>
                        <Link href={`/shared/forms/${lot.type}_lot/${lot.id}`}>
                            <Button variant="outline">
                                Ver formulários
                            </Button>
                        </Link>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}
