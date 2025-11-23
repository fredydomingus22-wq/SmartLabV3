"use client"

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import {
    ParameterWithUsage,
    Parameter,
    CreateParameterData,
    createParameter,
    updateParameter,
    deleteParameter,
    getProductsUsingParameter,
    DEFAULT_PARAMETER_CATEGORIES
} from "@/lib/queries/parameters";
import { Plus, Edit, Trash2, Eye, TestTube } from "lucide-react";
import { toast } from "sonner";

interface ParametersManagerProps {
    parameters: ParameterWithUsage[];
    onRefresh: () => void;
}

export function ParametersManager({ parameters, onRefresh }: ParametersManagerProps) {
    const [showForm, setShowForm] = useState(false);
    const [editingParameter, setEditingParameter] = useState<Parameter | null>(null);
    const [deletingParameter, setDeletingParameter] = useState<Parameter | null>(null);
    const [viewingUsage, setViewingUsage] = useState<Parameter | null>(null);
    const [usageProducts, setUsageProducts] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);

    const [formData, setFormData] = useState<CreateParameterData>({
        name: "",
        description: "",
        unit: "",
        category: ""
    });

    const handleCreate = () => {
        setEditingParameter(null);
        setFormData({ name: "", description: "", unit: "", category: "" });
        setShowForm(true);
    };

    const handleEdit = (parameter: Parameter) => {
        setEditingParameter(parameter);
        setFormData({
            name: parameter.name,
            description: parameter.description || "",
            unit: parameter.unit || "",
            category: parameter.category || ""
        });
        setShowForm(true);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            if (editingParameter) {
                await updateParameter(editingParameter.id, formData);
                toast.success("Parameter updated successfully!");
            } else {
                await createParameter(formData);
                toast.success("Parameter created successfully!");
            }
            setShowForm(false);
            onRefresh();
        } catch (error: any) {
            console.error("Error saving parameter:", error);
            toast.error(error.message || "Error saving parameter");
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async () => {
        if (!deletingParameter) return;

        setLoading(true);
        try {
            await deleteParameter(deletingParameter.id);
            toast.success("Parameter deleted successfully!");
            setDeletingParameter(null);
            onRefresh();
        } catch (error: any) {
            console.error("Error deleting parameter:", error);
            toast.error(error.message || "Cannot delete parameter in use");
        } finally {
            setLoading(false);
        }
    };

    const handleViewUsage = async (parameter: Parameter) => {
        setViewingUsage(parameter);
        setLoading(true);
        try {
            const products = await getProductsUsingParameter(parameter.id);
            setUsageProducts(products);
        } catch (error) {
            console.error("Error loading usage:", error);
            toast.error("Error loading usage data");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="space-y-4">
            <div className="flex justify-between items-center">
                <div>
                    <h3 className="text-lg font-semibold">Parameters ({parameters.length})</h3>
                    <p className="text-sm text-muted-foreground">
                        Reusable parameters for product specifications
                    </p>
                </div>
                <Button onClick={handleCreate}>
                    <Plus className="mr-2 h-4 w-4" />
                    New Parameter
                </Button>
            </div>

            <div className="border rounded-lg">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Name</TableHead>
                            <TableHead>Unit</TableHead>
                            <TableHead>Category</TableHead>
                            <TableHead className="text-right">Usage</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {parameters.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                                    <TestTube className="h-8 w-8 mx-auto mb-2 opacity-50" />
                                    No parameters found. Click "New Parameter" to create one.
                                </TableCell>
                            </TableRow>
                        ) : (
                            parameters.map((param) => (
                                <TableRow key={param.id}>
                                    <TableCell className="font-medium">
                                        {param.name}
                                        {param.description && (
                                            <p className="text-xs text-muted-foreground mt-1">
                                                {param.description}
                                            </p>
                                        )}
                                    </TableCell>
                                    <TableCell>
                                        {param.unit ? (
                                            <code className="text-xs bg-muted px-1 py-0.5 rounded">
                                                {param.unit}
                                            </code>
                                        ) : (
                                            <span className="text-muted-foreground">-</span>
                                        )}
                                    </TableCell>
                                    <TableCell>
                                        {param.category ? (
                                            <Badge variant="outline">{param.category}</Badge>
                                        ) : (
                                            <span className="text-muted-foreground">-</span>
                                        )}
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <Button
                                            variant="link"
                                            size="sm"
                                            onClick={() => handleViewUsage(param)}
                                            className="p-0 h-auto"
                                        >
                                            {param.usage_count} product{param.usage_count !== 1 ? 's' : ''}
                                        </Button>
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <div className="flex justify-end gap-2">
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                onClick={() => handleViewUsage(param)}
                                            >
                                                <Eye className="h-4 w-4" />
                                            </Button>
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                onClick={() => handleEdit(param)}
                                            >
                                                <Edit className="h-4 w-4" />
                                            </Button>
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                onClick={() => setDeletingParameter(param)}
                                                disabled={param.usage_count > 0}
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </div>

            {/* Create/Edit Dialog */}
            <Dialog open={showForm} onOpenChange={setShowForm}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>
                            {editingParameter ? "Edit Parameter" : "New Parameter"}
                        </DialogTitle>
                        <DialogDescription>
                            {editingParameter
                                ? "Update parameter details"
                                : "Create a new reusable parameter"}
                        </DialogDescription>
                    </DialogHeader>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <Label htmlFor="name">Name *</Label>
                            <Input
                                id="name"
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                placeholder="e.g., pH, Brix, CO2"
                                required
                            />
                        </div>

                        <div>
                            <Label htmlFor="unit">Unit</Label>
                            <Input
                                id="unit"
                                value={formData.unit}
                                onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                                placeholder="e.g., °Brix, ppm, %"
                            />
                        </div>

                        <div>
                            <Label htmlFor="category">Category</Label>
                            <Select
                                value={formData.category}
                                onValueChange={(value) => setFormData({ ...formData, category: value })}
                            >
                                <SelectTrigger id="category">
                                    <SelectValue placeholder="Select category" />
                                </SelectTrigger>
                                <SelectContent>
                                    {DEFAULT_PARAMETER_CATEGORIES.map((cat) => (
                                        <SelectItem key={cat} value={cat}>
                                            {cat}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        <div>
                            <Label htmlFor="description">Description</Label>
                            <Input
                                id="description"
                                value={formData.description}
                                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                placeholder="Optional description"
                            />
                        </div>

                        <DialogFooter>
                            <Button type="button" variant="outline" onClick={() => setShowForm(false)}>
                                Cancel
                            </Button>
                            <Button type="submit" disabled={loading}>
                                {loading ? "Saving..." : editingParameter ? "Update" : "Create"}
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>

            {/* Delete Confirmation */}
            <AlertDialog open={!!deletingParameter} onOpenChange={(open) => !open && setDeletingParameter(null)}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Delete Parameter?</AlertDialogTitle>
                        <AlertDialogDescription>
                            Are you sure you want to delete <strong>{deletingParameter?.name}</strong>?
                            This action cannot be undone.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={handleDelete}
                            className="bg-destructive hover:bg-destructive/90"
                        >
                            Delete
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>

            {/* Usage View Dialog */}
            <Dialog open={!!viewingUsage} onOpenChange={(open) => !open && setViewingUsage(null)}>
                <DialogContent className="max-w-2xl">
                    <DialogHeader>
                        <DialogTitle>Parameter Usage: {viewingUsage?.name}</DialogTitle>
                        <DialogDescription>
                            Products using this parameter
                        </DialogDescription>
                    </DialogHeader>
                    <div className="max-h-96 overflow-y-auto">
                        {usageProducts.length === 0 ? (
                            <p className="text-center py-8 text-muted-foreground">
                                Not used in any product yet
                            </p>
                        ) : (
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Product</TableHead>
                                        <TableHead>SKU</TableHead>
                                        <TableHead>Min</TableHead>
                                        <TableHead>Target</TableHead>
                                        <TableHead>Max</TableHead>
                                        <TableHead>Critical</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {usageProducts.map((product) => (
                                        <TableRow key={product.id}>
                                            <TableCell className="font-medium">{product.name}</TableCell>
                                            <TableCell className="font-mono text-xs">{product.sku}</TableCell>
                                            <TableCell>{product.spec_min ?? '-'}</TableCell>
                                            <TableCell>{product.spec_target ?? '-'}</TableCell>
                                            <TableCell>{product.spec_max ?? '-'}</TableCell>
                                            <TableCell>
                                                {product.is_critical ? (
                                                    <Badge variant="destructive" className="text-xs">Critical</Badge>
                                                ) : (
                                                    <span className="text-muted-foreground">-</span>
                                                )}
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        )}
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
}
