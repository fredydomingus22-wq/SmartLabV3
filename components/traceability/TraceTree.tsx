"use client"

import { Badge } from "@/components/ui/badge";

interface TreeNode {
    title: string;
    items: string[];
}

interface TraceTreeProps {
    nodes: TreeNode[];
}

export function TraceTree({ nodes }: TraceTreeProps) {
    return (
        <div className="bg-card border rounded-xl p-6">
            <h3 className="text-base font-bold mb-1">Árvore completa</h3>
            <p className="text-sm text-muted-foreground mb-6">
                RM → Lote Pai → PI → PF → NC → PCC
            </p>

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                {nodes.map((node, index) => (
                    <div key={index} className="space-y-2">
                        <div className="text-xs font-semibold text-muted-foreground uppercase">
                            {node.title}
                        </div>
                        <div className="space-y-1.5">
                            {node.items.map((item, i) => (
                                <div key={i} className="text-sm font-medium">
                                    {item}
                                </div>
                            ))}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
