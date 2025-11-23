"use client"

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Product } from "@/types/product";
import { getProductSpecs, ProductSpec } from "@/lib/queries/product-specs";
import { copySpecsFromProduct } from "@/lib/queries/product-specs";
import { Copy, AlertCircle, CheckCircle2, Package } from "lucide-react";
import { toast } from "sonner";

interface BulkOperationsProps {
    products: Product[];
    onRefresh: () => void;
}

export function BulkOperations({ products, onRefresh }: BulkOperationsProps) {
    const [sourceProductId, setSourceProductId] = useState<string>("");
    const [targetProductId, setTargetProductId] = useState<string>("");
    const [sourceSpecs, setSourceSpecs] = useState<ProductSpec[]>([]);
    const [showPreview, setShowPreview] = useState(false);
    const [loading, setLoading] = useState(false);
    const [copying, setCopying] = useState(false);

    const handleLoadPreview = async () => {
        if (!sourceProductId || !targetProductId) {
            toast.error("Please select both source and target products");
            return;
        }

        if (sourceProductId === targetProductId) {
            toast.error("Source and target products must be different");
            return;
        }

        setLoading(true);
        try {
            const specs = await getProductSpecs(sourceProductId);
            setSourceSpecs(specs);
            setShowPreview(true);
        } catch (error) {
            console.error("Error loading specs:", error);
            toast.error("Error loading specifications");
        } finally {
            setLoading(false);
        }
    };

    const handleCopySpecs = async () => {
        setCopying(true);
        try {
            await copySpecsFromProduct(sourceProductId, targetProductId);

            const sourceProduct = products.find(p => p.id === sourceProductId);
            const targetProduct = products.find(p => p.id === targetProductId);

            toast.success(
                `${sourceSpecs.length} specifications copied from ${sourceProduct?.name} to ${targetProduct?.name}!`
            );

            setShowPreview(false);
            setSourceProductId("");
            setTargetProductId("");
            setSourceSpecs([]);
            onRefresh();
        } catch (error: any) {
            console.error("Error copying specs:", error);
            toast.error(error.message || "Error copying specifications");
        } finally {
            setCopying(false);
        }
    };

    const sourceProduct = products.find(p => p.id === sourceProductId);
    const targetProduct = products.find(p => p.id === targetProductId);

    return (
        <div className="space-y-6">
            {/* Copy Specifications */}
            <Card>
                <CardHeader>
                    <div className="flex items-center gap-2">
                        <Copy className="h-5 w-5" />
                        <CardTitle>Copy Specifications</CardTitle>
                    </div>
                    <CardDescription>
                        Copy all specifications from one product to another. This will duplicate all parameter settings, limits, and test configurations.
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* Source Product */}
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Source Product</label>
                            <Select value={sourceProductId} onValueChange={setSourceProductId}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Select source product" />
                                </SelectTrigger>
                                <SelectContent>
                                    {products.map((product) => (
                                        <SelectItem key={product.id} value={product.id}>
                                            <div>
                                                <div className="font-medium">{product.name}</div>
                                                <div className="text-xs text-muted-foreground">{product.sku}</div>
                                            </div>
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        {/* Target Product */}
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Target Product</label>
                            <Select value={targetProductId} onValueChange={setTargetProductId}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Select target product" />
                                </SelectTrigger>
                                <SelectContent>
                                    {products.map((product) => (
                                        <SelectItem
                                            key={product.id}
                                            value={product.id}
                                            disabled={product.id === sourceProductId}
                                        >
                                            <div>
                                                <div className="font-medium">{product.name}</div>
                                                <div className="text-xs text-muted-foreground">{product.sku}</div>
                                            </div>
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    <Button
                        onClick={handleLoadPreview}
                        disabled={!sourceProductId || !targetProductId || loading}
                        className="w-full"
                    >
                        {loading ? "Loading..." : "Preview Copy"}
                    </Button>

                    {sourceProductId && targetProductId && (
                        <div className="mt-4 p-4 bg-muted rounded-lg">
                            <div className="flex items-start gap-2">
                                <AlertCircle className="h-5 w-5 text-blue-500 mt-0.5" />
                                <div className="text-sm">
                                    <p className="font-medium mb-1">This will copy specifications:</p>
                                    <p className="text-muted-foreground">
                                        From: <strong>{sourceProduct?.name}</strong> ({sourceProduct?.sku})
                                    </p>
                                    <p className="text-muted-foreground">
                                        To: <strong>{targetProduct?.name}</strong> ({targetProduct?.sku})
                                    </p>
                                </div>
                            </div>
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Info Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card>
                    <CardHeader>
                        <CardTitle className="text-base">How it works</CardTitle>
                    </CardHeader>
                    <CardContent className="text-sm space-y-2">
                        <div className="flex items-start gap-2">
                            <CheckCircle2 className="h-4 w-4 text-green-500 mt-0.5" />
                            <p>All specs from source will be copied to target</p>
                        </div>
                        <div className="flex items-start gap-2">
                            <CheckCircle2 className="h-4 w-4 text-green-500 mt-0.5" />
                            <p>Limits, frequencies, and critical flags included</p>
                        </div>
                        <div className="flex items-start gap-2">
                            <CheckCircle2 className="h-4 w-4 text-green-500 mt-0.5" />
                            <p>Preview before applying changes</p>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle className="text-base">Common Use Cases</CardTitle>
                    </CardHeader>
                    <CardContent className="text-sm space-y-2">
                        <div className="flex items-start gap-2">
                            <Package className="h-4 w-4 text-blue-500 mt-0.5" />
                            <p>New product variant with same specs</p>
                        </div>
                        <div className="flex items-start gap-2">
                            <Package className="h-4 w-4 text-blue-500 mt-0.5" />
                            <p>Standardizing specs across product family</p>
                        </div>
                        <div className="flex items-start gap-2">
                            <Package className="h-4 w-4 text-blue-500 mt-0.5" />
                            <p>Quick setup for similar products</p>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Preview Dialog */}
            <Dialog open={showPreview} onOpenChange={setShowPreview}>
                <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle>Preview Specifications to Copy</DialogTitle>
                        <DialogDescription>
                            Review the {sourceSpecs.length} specification(s) that will be copied from{" "}
                            <strong>{sourceProduct?.name}</strong> to <strong>{targetProduct?.name}</strong>
                        </DialogDescription>
                    </DialogHeader>

                    <div className="border rounded-lg">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Parameter</TableHead>
                                    <TableHead className="text-right">Min</TableHead>
                                    <TableHead className="text-right">Target</TableHead>
                                    <TableHead className="text-right">Max</TableHead>
                                    <TableHead>Unit</TableHead>
                                    <TableHead>Frequency</TableHead>
                                    <TableHead>Level</TableHead>
                                    <TableHead>Critical</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {sourceSpecs.map((spec) => (
                                    <TableRow key={spec.id}>
                                        <TableCell className="font-medium">
                                            {spec.parameter?.name || spec.parameter_id}
                                        </TableCell>
                                        <TableCell className="text-right">
                                            {spec.spec_min !== null ? spec.spec_min : "-"}
                                        </TableCell>
                                        <TableCell className="text-right font-medium">
                                            {spec.spec_target !== null ? spec.spec_target : "-"}
                                        </TableCell>
                                        <TableCell className="text-right">
                                            {spec.spec_max !== null ? spec.spec_max : "-"}
                                        </TableCell>
                                        <TableCell>
                                            {spec.unit ? (
                                                <code className="text-xs bg-muted px-1 py-0.5 rounded">
                                                    {spec.unit}
                                                </code>
                                            ) : (
                                                "-"
                                            )}
                                        </TableCell>
                                        <TableCell>
                                            {spec.test_frequency ? (
                                                <Badge variant="secondary" className="text-xs">
                                                    {spec.test_frequency}
                                                </Badge>
                                            ) : (
                                                "-"
                                            )}
                                        </TableCell>
                                        <TableCell>
                                            {spec.test_level ? (
                                                <Badge variant="outline" className="text-xs">
                                                    {spec.test_level}
                                                </Badge>
                                            ) : (
                                                "-"
                                            )}
                                        </TableCell>
                                        <TableCell>
                                            {spec.is_critical ? (
                                                <Badge variant="destructive" className="text-xs">
                                                    Yes
                                                </Badge>
                                            ) : (
                                                <span className="text-muted-foreground text-xs">No</span>
                                            )}
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </div>

                    <DialogFooter>
                        <Button variant="outline" onClick={() => setShowPreview(false)} disabled={copying}>
                            Cancel
                        </Button>
                        <Button onClick={handleCopySpecs} disabled={copying}>
                            {copying ? "Copying..." : `Copy ${sourceSpecs.length} Specifications`}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
