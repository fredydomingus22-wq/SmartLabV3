"use client";

import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export function FloatingActionButton() {
    return (
        <div className="fixed bottom-8 right-8 z-50">
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button
                        size="icon"
                        className="h-14 w-14 rounded-full bg-emerald-500 hover:bg-emerald-600 shadow-lg shadow-emerald-500/20 transition-all duration-300 hover:scale-110"
                    >
                        <Plus className="h-6 w-6 text-white" />
                        <span className="sr-only">Nova Ação</span>
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56 bg-slate-900 border-slate-800 text-slate-200">
                    <DropdownMenuItem className="cursor-pointer hover:bg-slate-800 focus:bg-slate-800">
                        <span>Novo Lote de Produção</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem className="cursor-pointer hover:bg-slate-800 focus:bg-slate-800">
                        <span>Registrar Amostra</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem className="cursor-pointer hover:bg-slate-800 focus:bg-slate-800">
                        <span>Abrir Não-Conformidade</span>
                    </DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>
        </div>
    );
}
