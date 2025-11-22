"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useShiftNotes } from "@/lib/hooks/useDashboardData";
import { Skeleton } from "@/components/ui/skeleton";
import Link from "next/link";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

export function ShiftNotes() {
    const { data, isLoading, error } = useShiftNotes();

    if (error) {
        return (
            <Card className="bg-slate-900/50 border-slate-800">
                <CardHeader className="pb-2">
                    <CardTitle className="text-lg font-bold text-white">Notas de turno</CardTitle>
                    <p className="text-sm text-muted-foreground">Checklist digital</p>
                </CardHeader>
                <CardContent>
                    <p className="text-center text-sm text-red-500">Falha ao carregar dados.</p>
                </CardContent>
            </Card>
        );
    }

    return (
        <Card className="bg-slate-900/50 border-slate-800">
            <CardHeader className="pb-2">
                <CardTitle className="text-lg font-bold text-white">Notas de turno</CardTitle>
                <p className="text-sm text-muted-foreground">Checklist digital</p>
            </CardHeader>
            <CardContent className="space-y-4">
                {isLoading ? (
                    <>
                        <Skeleton className="h-16 w-full bg-slate-800" />
                        <Skeleton className="h-16 w-full bg-slate-800" />
                    </>
                ) : (
                    <>
                        <div className="space-y-2">
                            {(data ?? []).map((note, idx) => (
                                <Link
                                    key={idx}
                                    href="/documents"
                                    className="block bg-slate-950 border border-slate-800 rounded-lg p-3 hover:bg-slate-900 transition-colors"
                                >
                                    <p className="text-sm text-white">{note.message}</p>
                                    <p className="text-xs text-muted-foreground mt-1">
                                        {format(new Date(note.created_at), "dd/MM/yyyy HH:mm", { locale: ptBR })}
                                    </p>
                                </Link>
                            ))}
                            {(!data || data.length === 0) && (
                                <p className="text-sm text-muted-foreground text-center">Nenhuma nota recente.</p>
                            )}
                        </div>
                    </>
                )}
            </CardContent>
        </Card>
    );
}
