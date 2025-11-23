"use client"

import { useState, useEffect } from "react";
import { Product, CreateProductData } from "@/types/product";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { checkSkuExists, getProductCategories } from "@/lib/queries/products";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

interface ProductFormProps {
    product?: Product | null;
    onSubmit: (data: CreateProductData) => Promise<void>;
    onCancel: () => void;
}

export function ProductForm({ product, onSubmit, onCancel }: ProductFormProps) {
    const isEditing = !!product;

    const [formData, setFormData] = useState<CreateProductData>({
        name: product?.name || "",
        sku: product?.sku || "",
        description: product?.description || "",
        category: product?.category || "",
        product_type: product?.product_type || undefined,
        shelf_life_days: product?.shelf_life_days || undefined,
        storage_conditions: product?.storage_conditions || "",
    });

    const [categories, setCategories] = useState<string[]>([]);
    const [loading, setLoading] = useState(false);
    const [validatingSku, setValidatingSku] = useState(false);
    const [skuError, setSkuError] = useState<string>("");

    useEffect(() => {
        loadCategories();
    }, []);

    const loadCategories = async () => {
        try {
            const cats = await getProductCategories();
            setCategories(cats);
        } catch (error) {
            console.error("Error loading categories:", error);
        }
    };

    const validateSku = async (sku: string) => {
        if (!sku) {
            setSkuError("");
            return true;
        }

        setValidatingSku(true);
        try {
            const exists = await checkSkuExists(sku, product?.id);
            if (exists) {
                setSkuError("Este SKU já existe");
                return false;
            }
            setSkuError("");
            return true;
        } catch (error) {
            console.error("Error validating SKU:", error);
            return true;
        } finally {
            setValidatingSku(false);
        }
    };

    const handleSkuBlur = () => {
        validateSku(formData.sku);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        // Validate SKU
        const isSkuValid = await validateSku(formData.sku);
        if (!isSkuValid) {
            toast.error("Por favor corrija os erros antes de submeter");
            return;
        }

        setLoading(true);
        try {
            await onSubmit(formData);
        } catch (error) {
            console.error("Error submitting form:", error);
            toast.error("Erro ao guardar produto");
        } finally {
            setLoading(false);
        }
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle>{isEditing ? "Editar Produto" : "Novo Produto"}</CardTitle>
            </CardHeader>
            <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Basic Info */}
                    <div className="space-y-4">
                        <h3 className="text-sm font-medium text-muted-foreground">Informações Básicas</h3>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="name">Nome do Produto *</Label>
                                <Input
                                    id="name"
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    required
                                    placeholder="ex: Refrigerante Cola"
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="sku">SKU *</Label>
                                <div className="relative">
                                    <Input
                                        id="sku"
                                        value={formData.sku}
                                        onChange={(e) => {
                                            setFormData({ ...formData, sku: e.target.value });
                                            setSkuError("");
                                        }}
                                        onBlur={handleSkuBlur}
                                        required
                                        placeholder="ex: PROD-001"
                                        className={skuError ? "border-red-500" : ""}
                                    />
                                    {validatingSku && (
                                        <Loader2 className="absolute right-3 top-3 h-4 w-4 animate-spin text-muted-foreground" />
                                    )}
                                </div>
                                {skuError && (
                                    <p className="text-sm text-red-500">{skuError}</p>
                                )}
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="description">Descrição</Label>
                            <Textarea
                                id="description"
                                value={formData.description || ""}
                                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                placeholder="Descrição detalhada do produto..."
                                rows={3}
                            />
                        </div>
                    </div>

                    {/* Classification */}
                    <div className="space-y-4 pt-4 border-t">
                        <h3 className="text-sm font-medium text-muted-foreground">Classificação</h3>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="product_type">Tipo de Produto</Label>
                                <Select
                                    value={formData.product_type || ""}
                                    onValueChange={(value) => setFormData({
                                        ...formData,
                                        product_type: value as any
                                    })}
                                >
                                    <SelectTrigger id="product_type">
                                        <SelectValue placeholder="Selecionar tipo" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="beverage">Bebida</SelectItem>
                                        <SelectItem value="syrup">Xarope</SelectItem>
                                        <SelectItem value="concentrate">Concentrado</SelectItem>
                                        <SelectItem value="other">Outro</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="category">Categoria</Label>
                                <div className="flex gap-2">
                                    <Select
                                        value={formData.category || ""}
                                        onValueChange={(value) => setFormData({ ...formData, category: value })}
                                    >
                                        <SelectTrigger id="category" className="flex-1">
                                            <SelectValue placeholder="Selecionar ou criar" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {categories.map((cat) => (
                                                <SelectItem key={cat} value={cat}>
                                                    {cat}
                                                </SelectItem>
                                            ))}
                                            <SelectItem value="__custom__">+ Nova Categoria</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                {formData.category === "__custom__" && (
                                    <Input
                                        placeholder="Nome da categoria"
                                        onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                                    />
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Storage & Shelf Life */}
                    <div className="space-y-4 pt-4 border-t">
                        <h3 className="text-sm font-medium text-muted-foreground">Armazenamento e Validade</h3>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="shelf_life_days">Prazo de Validade (dias)</Label>
                                <Input
                                    id="shelf_life_days"
                                    type="number"
                                    min="0"
                                    value={formData.shelf_life_days || ""}
                                    onChange={(e) => setFormData({
                                        ...formData,
                                        shelf_life_days: e.target.value ? parseInt(e.target.value) : undefined
                                    })}
                                    placeholder="ex: 365"
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="storage_conditions">Condições de Armazenamento</Label>
                                <Input
                                    id="storage_conditions"
                                    value={formData.storage_conditions || ""}
                                    onChange={(e) => setFormData({ ...formData, storage_conditions: e.target.value })}
                                    placeholder="ex: Refrigerar entre 2-8°C"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-3 pt-4">
                        <Button
                            type="submit"
                            disabled={loading || validatingSku || !!skuError}
                            className="min-w-[120px]"
                        >
                            {loading ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    A Guardar...
                                </>
                            ) : (
                                isEditing ? "Atualizar" : "Criar Produto"
                            )}
                        </Button>
                        <Button
                            type="button"
                            variant="outline"
                            onClick={onCancel}
                            disabled={loading}
                        >
                            Cancelar
                        </Button>
                    </div>
                </form>
            </CardContent>
        </Card>
    );
}
