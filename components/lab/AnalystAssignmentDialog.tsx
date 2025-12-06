"use client";

import { useEffect, useState } from "react";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Loader2, UserPlus } from "lucide-react";
import { assignAnalyst } from "@/lib/workflows/samples";
import { getTechnicians } from "@/lib/queries/samples";
import { useServerAction } from "@/lib/hooks/useServerAction";
import { toast } from "sonner";

interface AnalystAssignmentDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    sampleId: string;
    currentAnalystId?: string | null;
    onAssigned?: (analystId: string) => void;
}

export function AnalystAssignmentDialog({
    open,
    onOpenChange,
    sampleId,
    currentAnalystId,
    onAssigned,
}: AnalystAssignmentDialogProps) {
    const [technicians, setTechnicians] = useState<{ id: string; full_name?: string }[]>([]);
    const [loading, setLoading] = useState(false);
    const [selectedAnalyst, setSelectedAnalyst] = useState<string | undefined>(currentAnalystId || undefined);

    useEffect(() => {
        if (open) {
            loadTechnicians();
            setSelectedAnalyst(currentAnalystId || undefined);
        }
    }, [open, currentAnalystId]);

    async function loadTechnicians() {
        setLoading(true);
        try {
            const techs = await getTechnicians();
            setTechnicians(techs || []);
        } catch (error) {
            console.error("Error loading technicians", error);
            toast.error("Não foi possível carregar técnicos");
        } finally {
            setLoading(false);
        }
    }

    const performAssignment = async (analystId: string) => {
        await assignAnalyst(sampleId, analystId);
        return analystId;
    };

    const { execute, loading: saving } = useServerAction(performAssignment, {
        successMessage: "Técnico atribuído",
        onSuccess: (analystId) => {
            onAssigned?.(analystId);
            onOpenChange(false);
        }
    });

    async function handleAssign() {
        if (!selectedAnalyst) {
            toast.error("Selecione um técnico");
            return;
        }
        await execute(selectedAnalyst);
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-lg">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <UserPlus className="h-4 w-4" />
                        Atribuir Técnico
                    </DialogTitle>
                    <DialogDescription>
                        Selecionar técnico responsável pela execução/validação da amostra.
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-2">
                    <Select
                        value={selectedAnalyst}
                        onValueChange={(value) => setSelectedAnalyst(value)}
                        disabled={loading}
                    >
                        <SelectTrigger className="bg-slate-900 border-slate-800">
                            <SelectValue placeholder="Selecione o técnico" />
                        </SelectTrigger>
                        <SelectContent>
                            {loading ? (
                                <div className="px-3 py-2 text-sm text-muted-foreground flex items-center gap-2">
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                    A carregar técnicos...
                                </div>
                            ) : technicians.length === 0 ? (
                                <div className="px-3 py-2 text-sm text-muted-foreground">
                                    Nenhum técnico disponível
                                </div>
                            ) : (
                                technicians.map((tech) => (
                                    <SelectItem key={tech.id} value={tech.id}>
                                        {tech.full_name || "Técnico sem nome"}
                                    </SelectItem>
                                ))
                            )}
                        </SelectContent>
                    </Select>
                    {currentAnalystId && (
                        <p className="text-xs text-muted-foreground">
                            Atual: {technicians.find((t) => t.id === currentAnalystId)?.full_name || currentAnalystId}
                        </p>
                    )}
                </div>

                <DialogFooter>
                    <Button variant="outline" onClick={() => onOpenChange(false)} disabled={saving}>
                        Cancelar
                    </Button>
                    <Button onClick={handleAssign} disabled={saving || loading || !selectedAnalyst}>
                        {saving ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                A guardar...
                            </>
                        ) : (
                            "Atribuir"
                        )}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
