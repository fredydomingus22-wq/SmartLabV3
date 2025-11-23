"use client"

import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { createProductionLot } from "@/lib/queries/production";
import { Product, ProductionLot } from "@/types/production";
import { Profile } from "@/lib/queries/profiles";
import { toast } from "sonner";
import { Loader2, Sparkles } from "lucide-react";

interface CreateLotDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    products: Product[];
    profiles: Profile[];
    onSuccess: () => void;
    preSelectedProductId?: string | null;
}

export function CreateLotDialog({
    open,
    onOpenChange,
    products,
    profiles,
    onSuccess,
    preSelectedProductId
}: CreateLotDialogProps) {
    const [formData, setFormData] = useState({
        code: "",
        product_id: preSelectedProductId || "",
        factory_id: "",
        production_line: "",
        shift: "",
        status: "open" as ProductionLot["status"]
    });
    const [loading, setLoading] = useState(false);
    const [autoGenerateCode, setAutoGenerateCode] = useState(false);

    // Auto-generate lot code when enabled
    const generateLotCode = () => {
        const selectedProduct = products.find(p => p.id === formData.product_id);
        if (!selectedProduct) return "";

        const date = new Date();
        const dateStr = `${date.getFullYear()}${String(date.getMonth() + 1).padStart(2, '0')}${String(date.getDate()).padStart(2, '0')}`;
        const productCode = selectedProduct.sku?.substring(0, 3).toUpperCase() || 'PRD';
        const randomSeq = Math.floor(Math.random() * 1000).toString().padStart(3, '0');

        return `LOT-${productCode}-${dateStr}-${randomSeq}`;
    };

    const handleProductChange = (productId: string) => {
        setFormData({ ...formData, product_id: productId });
        if (autoGenerateCode) {
            const code = generateLotCode();
            if (code) {
                setFormData(prev => ({ ...prev, product_id: productId, code }));
            }
        }
    };

    const handleAutoGenerate = () => {
        const code = generateLotCode();
        if (code) {
            setFormData({ ...formData, code });
            toast.info("Código gerado automaticamente");
        } else {
            toast.error("Selecione um produto primeiro");
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!formData.code || !formData.product_id) {
            toast.error("Preencha os campos obrigatórios");
            return;
        }

        setLoading(true);
        try {
            await createProductionLot({
                ...formData,
                factory_id: formData.factory_id || undefined,
                production_line: formData.production_line || undefined,
                shift: formData.shift || undefined
            });

            toast.success("Lote de produção criado com sucesso!");
            setFormData({
                code: "",
                product_id: preSelectedProductId || "",
                factory_id: "",
                production_line: "",
                shift: "",
                status: "open"
            });
            onOpenChange(false);
            onSuccess();
        } catch (error) {
            console.error("Error creating lot:", error);
            toast.error("Erro ao criar lote de produção");
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[600px]">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <Sparkles className="h-5 w-5 text-primary" />
                        Novo Lote de Produção
                    </DialogTitle>
                    <DialogDescription>
                        Crie um novo lote de produção. Os campos marcados com * são obrigatórios.
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-4 mt-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="md:col-span-2">
                            <Label htmlFor="code">Código do Lote *</Label>
                            <div className="flex gap-2 mt-1.5">
                                <Input
                                    id="code"
                                    placeholder="e.g., LOT-PRD-20241123-001"
                                    value={formData.code}
                                    onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                                    required
                                    className="flex-1"
                                />
                                <Button
                                    type="button"
                                    variant="outline"
                                    size="icon"
                                    onClick={handleAutoGenerate}
                                    title="Gerar código automaticamente"
                                >
                                    <Sparkles className="h-4 w-4" />
                                </Button>
                            </div>
                            <p className="text-xs text-muted-foreground mt-1">
                                Clique no ícone para gerar automaticamente
                            </p>
                        </div>

                        <div className="md:col-span-2">
                            <Label htmlFor="product">Produto *</Label>
                            <Select
                                value={formData.product_id}
                                onValueChange={handleProductChange}
                                required
                            >
                                <SelectTrigger id="product" className="mt-1.5">
                                    <SelectValue placeholder="Selecione o produto" />
                                </SelectTrigger>
                                <SelectContent>
                                    {products.map((product) => (
                                        <SelectItem key={product.id} value={product.id}>
                                            {product.name} ({product.sku})
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        <div>
                            <Label htmlFor="factory">Gestor de Fábrica</Label>
                            <Select
                                value={formData.factory_id}
                                onValueChange={(value) => setFormData({ ...formData, factory_id: value })}
                            >
                                <SelectTrigger id="factory" className="mt-1.5">
                                    <SelectValue placeholder="Selecione o gestor" />
                                </SelectTrigger>
                                <SelectContent>
                                    {profiles.map((profile) => (
                                        <SelectItem key={profile.id} value={profile.id}>
                                            {profile.full_name || profile.email}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        <div>
                            <Label htmlFor="shift">Turno</Label>
                            <Select
                                value={formData.shift}
                                onValueChange={(value) => setFormData({ ...formData, shift: value })}
                            >
                                <SelectTrigger id="shift" className="mt-1.5">
                                    <SelectValue placeholder="Selecione o turno" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="Morning">Manhã</SelectItem>
                                    <SelectItem value="Afternoon">Tarde</SelectItem>
                                    <SelectItem value="Night">Noite</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="md:col-span-2">
                            <Label htmlFor="line">Linha de Produção</Label>
                            <Input
                                id="line"
                                placeholder="e.g., Linha A"
                                value={formData.production_line}
                                onChange={(e) => setFormData({ ...formData, production_line: e.target.value })}
                                className="mt-1.5"
                            />
                        </div>
                    </div>

                    <div className="flex gap-2 pt-4">
                        <Button type="submit" disabled={loading} className="flex-1">
                            {loading ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Criando...
                                </>
                            ) : (
                                "Criar Lote"
                            )}
                        </Button>
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => onOpenChange(false)}
                            disabled={loading}
                        >
                            Cancelar
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
}
