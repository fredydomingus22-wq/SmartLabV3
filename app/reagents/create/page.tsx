"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";
import { createReagent } from "@/lib/queries/reagents";

export default function CreateReagentPage() {
    const router = useRouter();
    const [loading, set Loading] = useState(false);
    const [formData, setFormData] = useState({
        code: "",
        name: "",
        cas_number: "",
        formula: "",
        category: "other" as const,
        supplier_id: "",
        catalog_number: "",
        manufacturer: "",
        storage_location: "",
        storage_temp_min: 0,
        storage_temp_max: 0,
        hazard_class: "" as any,
        safety_data_sheet_url: "",
        unit: "L",
        stock_current: 0,
        stock_min: 0,
        stock_max: 0,
        cost_per_unit: 0,
        status: "active" as const,
    });

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        setLoading(true);
        try {
            // Remove empty optional fields
            const cleanData = Object.fromEntries(
                Object.entries(formData).filter(([_, v]) => v !== "" && v !== 0)
            );

            await createReagent(cleanData as any);
            toast.success("Reagent created successfully");
            router.push("/reagents");
        } catch (error) {
            console.error("Error creating reagent:", error);
            toast.error("Failed to create reagent");
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="p-8 space-y-6">
            {/* Header */}
            <div className="flex items-center gap-4">
                <Link href="/reagents">
                    <Button variant="ghost" size="icon">
                        <ArrowLeft className="w-4 h-4" />
                    </Button>
                </Link>
                <div>
                    <h1 className="text-3xl font-bold text-white">Add New Reagent</h1>
                    <p className="text-muted-foreground">
                        Register a new reagent in the laboratory inventory
                    </p>
                </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
                {/* Basic Information */}
                <Card className="bg-slate-900 border-slate-800">
                    <CardHeader>
                        <CardTitle>Basic Information</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="code">Reagent Code *</Label>
                                <Input
                                    id="code"
                                    value={formData.code}
                                    onChange={(e) =>
                                        setFormData({ ...formData, code: e.target.value })
                                    }
                                    placeholder="e.g., REG-001"
                                    required
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="name">Reagent Name *</Label>
                                <Input
                                    id="name"
                                    value={formData.name}
                                    onChange={(e) =>
                                        setFormData({ ...formData, name: e.target.value })
                                    }
                                    placeholder="e.g., Sulfuric Acid"
                                    required
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="cas_number">CAS Number</Label>
                                <Input
                                    id="cas_number"
                                    value={formData.cas_number}
                                    onChange={(e) =>
                                        setFormData({ ...formData, cas_number: e.target.value })
                                    }
                                    placeholder="e.g., 7664-93-9"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="formula">Chemical Formula</Label>
                                <Input
                                    id="formula"
                                    value={formData.formula}
                                    onChange={(e) =>
                                        setFormData({ ...formData, formula: e.target.value })
                                    }
                                    placeholder="e.g., H₂SO₄"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="category">Category *</Label>
                                <Select
                                    value={formData.category}
                                    onValueChange={(value: any) =>
                                        setFormData({ ...formData, category: value })
                                    }
                                >
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="acid">Acid</SelectItem>
                                        <SelectItem value="base">Base</SelectItem>
                                        <SelectItem value="indicator">Indicator</SelectItem>
                                        <SelectItem value="solvent">Solvent</SelectItem>
                                        <SelectItem value="buffer">Buffer</SelectItem>
                                        <SelectItem value="standard">Standard</SelectItem>
                                        <SelectItem value="other">Other</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Storage & Safety */}
                <Card className="bg-slate-900 border-slate-800">
                    <CardHeader>
                        <CardTitle>Storage & Safety</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="storage_location">Storage Location *</Label>
                                <Input
                                    id="storage_location"
                                    value={formData.storage_location}
                                    onChange={(e) =>
                                        setFormData({ ...formData, storage_location: e.target.value })
                                    }
                                    placeholder="e.g., Cabinet A, Shelf 2"
                                    required
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="hazard_class">Hazard Class</Label>
                                <Select
                                    value={formData.hazard_class}
                                    onValueChange={(value: any) =>
                                        setFormData({ ...formData, hazard_class: value })
                                    }
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select hazard class" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="flammable">Flammable</SelectItem>
                                        <SelectItem value="corrosive">Corrosive</SelectItem>
                                        <SelectItem value="toxic">Toxic</SelectItem>
                                        <SelectItem value="oxidizer">Oxidizer</SelectItem>
                                        <SelectItem value="explosive">Explosive</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="temp_min">Storage Temp Min (°C)</Label>
                                <Input
                                    id="temp_min"
                                    type="number"
                                    value={formData.storage_temp_min}
                                    onChange={(e) =>
                                        setFormData({
                                            ...formData,
                                            storage_temp_min: Number(e.target.value),
                                        })
                                    }
                                    placeholder="e.g., -20"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="temp_max">Storage Temp Max (°C)</Label>
                                <Input
                                    id="temp_max"
                                    type="number"
                                    value={formData.storage_temp_max}
                                    onChange={(e) =>
                                        setFormData({
                                            ...formData,
                                            storage_temp_max: Number(e.target.value),
                                        })
                                    }
                                    placeholder="e.g., 4"
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="sds_url">Safety Data Sheet URL</Label>
                            <Input
                                id="sds_url"
                                type="url"
                                value={formData.safety_data_sheet_url}
                                onChange={(e) =>
                                    setFormData({ ...formData, safety_data_sheet_url: e.target.value })
                                }
                                placeholder="https://..."
                            />
                        </div>
                    </CardContent>
                </Card>

                {/* Stock Control */}
                <Card className="bg-slate-900 border-slate-800">
                    <CardHeader>
                        <CardTitle>Stock Control</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="unit">Unit *</Label>
                                <Input
                                    id="unit"
                                    value={formData.unit}
                                    onChange={(e) =>
                                        setFormData({ ...formData, unit: e.target.value })
                                    }
                                    placeholder="L, mL, g, kg"
                                    required
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="stock_min">Minimum Stock *</Label>
                                <Input
                                    id="stock_min"
                                    type="number"
                                    step="0.01"
                                    value={formData.stock_min}
                                    onChange={(e) =>
                                        setFormData({
                                            ...formData,
                                            stock_min: Number(e.target.value),
                                        })
                                    }
                                    required
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="stock_max">Maximum Stock</Label>
                                <Input
                                    id="stock_max"
                                    type="number"
                                    step="0.01"
                                    value={formData.stock_max}
                                    onChange={(e) =>
                                        setFormData({
                                            ...formData,
                                            stock_max: Number(e.target.value),
                                        })
                                    }
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="cost_per_unit">Cost per Unit</Label>
                                <Input
                                    id="cost_per_unit"
                                    type="number"
                                    step="0.01"
                                    value={formData.cost_per_unit}
                                    onChange={(e) =>
                                        setFormData({
                                            ...formData,
                                            cost_per_unit: Number(e.target.value),
                                        })
                                    }
                                    placeholder="0.00"
                                />
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Actions */}
                <div className="flex justify-end gap-2">
                    <Link href="/reagents">
                        <Button type="button" variant="outline">
                            Cancel
                        </Button>
                    </Link>
                    <Button type="submit" disabled={loading}>
                        {loading ? "Creating..." : "Create Reagent"}
                    </Button>
                </div>
            </form>
        </div>
    );
}
