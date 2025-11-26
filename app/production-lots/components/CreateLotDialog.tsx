"use client"

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";

import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import { createProductionLot } from "@/lib/queries/production";
import { Product } from "@/types/production";
import { Profile } from "@/lib/queries/profiles";
import { useToast } from "@/components/ui/use-toast";
import { Loader2, Sparkles } from "lucide-react";
import { productionLotSchema, ProductionLotFormValues } from "@/lib/validations/production";

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
    const { toast } = useToast();
    const [loading, setLoading] = useState(false);

    const form = useForm<ProductionLotFormValues>({
        resolver: zodResolver(productionLotSchema),
        defaultValues: {
            code: "",
            product_id: preSelectedProductId || "",
            factory_id: "",
            production_line: "",
            shift: "",
            status: "draft", // Draft status per Phase 2 standardization
        },
    });

    // Reset form when dialog opens or preSelectedProductId changes
    useEffect(() => {
        if (open) {
            form.reset({
                code: "",
                product_id: preSelectedProductId || "",
                factory_id: "",
                production_line: "",
                shift: "",
                status: "draft",
            });
        }
    }, [open, preSelectedProductId, form]);

    const generateLotCode = (productId: string) => {
        const selectedProduct = products.find(p => p.id === productId);
        if (!selectedProduct) return "";

        const date = new Date();
        const dateStr = `${date.getFullYear()}${String(date.getMonth() + 1).padStart(2, '0')}${String(date.getDate()).padStart(2, '0')}`;
        const productCode = selectedProduct.sku?.substring(0, 3).toUpperCase() || 'PRD';
        const randomSeq = Math.floor(Math.random() * 1000).toString().padStart(3, '0');

        return `LOT-${productCode}-${dateStr}-${randomSeq}`;
    };

    const handleAutoGenerate = () => {
        const productId = form.getValues("product_id");
        if (!productId) {
            toast({
                variant: "destructive",
                title: "Erro",
                description: "Selecione um produto primeiro.",
            });
            return;
        }

        const code = generateLotCode(productId);
        if (code) {
            form.setValue("code", code);
            toast({
                title: "Código Gerado",
                description: "Código do lote gerado automaticamente.",
            });
        }
    };

    const onSubmit = async (data: ProductionLotFormValues) => {
        setLoading(true);
        try {
            await createProductionLot({
                ...data,
                factory_id: data.factory_id || undefined,
                production_line: data.production_line || undefined,
                shift: data.shift || undefined
            });

            toast({
                title: "Sucesso",
                description: "Lote de produção criado com sucesso!",
                variant: "success",
            });

            onOpenChange(false);
            onSuccess();
        } catch (error) {
            console.error("Error creating lot:", error);
            toast({
                variant: "destructive",
                title: "Erro",
                description: "Erro ao criar lote de produção.",
            });
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

                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 mt-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="md:col-span-2">
                                <FormField
                                    control={form.control}
                                    name="code"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Código do Lote *</FormLabel>
                                            <div className="flex gap-2">
                                                <FormControl>
                                                    <Input placeholder="e.g., LOT-PRD-20241123-001" {...field} />
                                                </FormControl>
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
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>

                            <div className="md:col-span-2">
                                <FormField
                                    control={form.control}
                                    name="product_id"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Produto *</FormLabel>
                                            <Select onValueChange={field.onChange} defaultValue={field.value} value={field.value}>
                                                <FormControl>
                                                    <SelectTrigger>
                                                        <SelectValue placeholder="Selecione o produto" />
                                                    </SelectTrigger>
                                                </FormControl>
                                                <SelectContent>
                                                    {products.map((product) => (
                                                        <SelectItem key={product.id} value={product.id}>
                                                            {product.name} ({product.sku})
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>

                            <FormField
                                control={form.control}
                                name="factory_id"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Gestor de Fábrica</FormLabel>
                                        <Select onValueChange={field.onChange} defaultValue={field.value} value={field.value}>
                                            <FormControl>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Selecione o gestor" />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                {profiles.map((profile) => (
                                                    <SelectItem key={profile.id} value={profile.id}>
                                                        {profile.full_name || profile.email}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="shift"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Turno</FormLabel>
                                        <Select onValueChange={field.onChange} defaultValue={field.value} value={field.value}>
                                            <FormControl>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Selecione o turno" />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                <SelectItem value="Morning">Manhã</SelectItem>
                                                <SelectItem value="Afternoon">Tarde</SelectItem>
                                                <SelectItem value="Night">Noite</SelectItem>
                                            </SelectContent>
                                        </Select>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <div className="md:col-span-2">
                                <FormField
                                    control={form.control}
                                    name="production_line"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Linha de Produção</FormLabel>
                                            <FormControl>
                                                <Input placeholder="e.g., Linha A" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>

                            <div className="md:col-span-2">
                                <FormField
                                    control={form.control}
                                    name="status"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Estado Inicial *</FormLabel>
                                            <Select onValueChange={field.onChange} defaultValue={field.value} value={field.value}>
                                                <FormControl>
                                                    <SelectTrigger>
                                                        <SelectValue placeholder="Selecione o estado inicial" />
                                                    </SelectTrigger>
                                                </FormControl>
                                                <SelectContent>
                                                    <SelectItem value="draft">Draft</SelectItem>
                                                    <SelectItem value="on_hold">On Hold</SelectItem>
                                                    <SelectItem value="active">Active</SelectItem>
                                                    <SelectItem value="completed">Completed</SelectItem>
                                                    <SelectItem value="cancelled">Cancelled</SelectItem>
                                                </SelectContent>
                                            </Select>
                                            <p className="text-xs text-muted-foreground mt-1">
                                                Define o estado inicial do lote. Pode ser alterado posteriormente.
                                            </p>
                                            <FormMessage />
                                        </FormItem>
                                    )}
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
                </Form>
            </DialogContent>
        </Dialog>
    );
}
