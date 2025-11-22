"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
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
import {
    Tabs,
    TabsContent,
    TabsList,
    TabsTrigger,
} from "@/components/ui/tabs";
import {
    ArrowDownCircle,
    ArrowUpCircle,
    Package,
    Plus,
    TrendingUp,
} from "lucide-react";
import { toast } from "sonner";
import {
    recordEntry,
    recordWithdrawal,
    recordReturn,
    getAllRecentMovements,
    ReagentStockMovementWithDetails,
} from "@/lib/queries/reagent-movements";
import { getReagents } from "@/lib/queries/reagents";
import { ReagentWithStock } from "@/types/reagent";

export default function StockMovementsPage() {
    const [movements, setMovements] = useState<ReagentStockMovementWithDetails[]>([]);
    const [reagents, setReagents] = useState<ReagentWithStock[]>([]);
    const [loading, setLoading] = useState(true);

    const [entryDialogOpen, setEntryDialogOpen] = useState(false);
    const [withdrawalDialogOpen, setWithdrawalDialogOpen] = useState(false);
    const [returnDialogOpen, setReturnDialogOpen] = useState(false);

    const [entryForm, setEntryForm] = useState({
        reagent_id: "",
        quantity: 0,
        supplier_name: "",
        purchase_order: "",
        invoice_number: "",
        cost: 0,
        notes: "",
    });

    const [withdrawalForm, setWithdrawalForm] = useState({
        reagent_id: "",
        batch_id: "",
        quantity: 0,
        requisition_number: "",
        department: "",
        purpose: "",
        notes: "",
    });

    const [returnForm, setReturnForm] = useState({
        reagent_id: "",
        batch_id: "",
        quantity: 0,
        return_reason: "",
        notes: "",
    });

    useEffect(() => {
        loadData();
    }, []);

    async function loadData() {
        try {
            const [movementsData, reagentsData] = await Promise.all([
                getAllRecentMovements(100),
                getReagents(),
            ]);
            setMovements(movementsData);
            setReagents(reagentsData);
        } catch (error) {
            console.error("Error loading data:", error);
            toast.error("Failed to load stock movements");
        } finally {
            setLoading(false);
        }
    }

    async function handleEntry(e: React.FormEvent) {
        e.preventDefault();
        try {
            const selectedReagent = reagents.find((r) => r.id === entryForm.reagent_id);
            await recordEntry({
                ...entryForm,
                unit: selectedReagent?.unit || "L",
            });
            toast.success("Entry recorded successfully");
            setEntryDialogOpen(false);
            loadData();
            setEntryForm({
                reagent_id: "",
                quantity: 0,
                supplier_name: "",
                purchase_order: "",
                invoice_number: "",
                cost: 0,
                notes: "",
            });
        } catch (error) {
            console.error("Error recording entry:", error);
            toast.error("Failed to record entry");
        }
    }

    async function handleWithdrawal(e: React.FormEvent) {
        e.preventDefault();
        try {
            const selectedReagent = reagents.find((r) => r.id === withdrawalForm.reagent_id);
            await recordWithdrawal({
                ...withdrawalForm,
                unit: selectedReagent?.unit || "L",
                from_location: selectedReagent?.storage_location,
            });
            toast.success("Withdrawal recorded successfully");
            setWithdrawalDialogOpen(false);
            loadData();
            setWithdrawalForm({
                reagent_id: "",
                batch_id: "",
                quantity: 0,
                requisition_number: "",
                department: "",
                purpose: "",
                notes: "",
            });
        } catch (error) {
            console.error("Error recording withdrawal:", error);
            toast.error("Failed to record withdrawal");
        }
    }

    async function handleReturn(e: React.FormEvent) {
        e.preventDefault();
        try {
            const selectedReagent = reagents.find((r) => r.id === returnForm.reagent_id);
            await recordReturn({
                ...returnForm,
                unit: selectedReagent?.unit || "L",
                to_location: selectedReagent?.storage_location,
            });
            toast.success("Return recorded successfully");
            setReturnDialogOpen(false);
            loadData();
            setReturnForm({
                reagent_id: "",
                batch_id: "",
                quantity: 0,
                return_reason: "",
                notes: "",
            });
        } catch (error) {
            console.error("Error recording return:", error);
            toast.error("Failed to record return");
        }
    }

    function getMovementBadge(type: string) {
        const badges: Record<string, { color: string; icon: any; label: string }> = {
            entry: { color: "bg-green-600", icon: ArrowDownCircle, label: "Entry" },
            withdrawal: { color: "bg-red-600", icon: ArrowUpCircle, label: "Withdrawal" },
            return: { color: "bg-blue-600", icon: TrendingUp, label: "Return" },
            adjustment: { color: "bg-yellow-600", icon: Package, label: "Adjustment" },
            waste: { color: "bg-gray-600", icon: Package, label: "Waste" },
        };
        const badge = badges[type] || badges.entry;
        const Icon = badge.icon;
        return (
            <Badge className={`${badge.color} flex items-center gap-1`}>
                <Icon className="w-3 h-3" />
                {badge.label}
            </Badge>
        );
    }

    if (loading) {
        return (
            <div className="p-8">
                <div className="flex items-center justify-center h-64">
                    <div className="text-muted-foreground">Loading...</div>
                </div>
            </div>
        );
    }

    const entries = movements.filter((m) => m.movement_type === "entry");
    const withdrawals = movements.filter((m) => m.movement_type === "withdrawal");
    const returns = movements.filter((m) => m.movement_type === "return");

    return (
        <div className="p-8 space-y-6">
            {/* Header */}
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold text-white">Stock Movements</h1>
                    <p className="text-muted-foreground">
                        Track reagent entries, withdrawals, and returns
                    </p>
                </div>
                <div className="flex gap-2">
                    <Dialog open={entryDialogOpen} onOpenChange={setEntryDialogOpen}>
                        <DialogTrigger asChild>
                            <Button className="flex items-center gap-2 bg-green-600 hover:bg-green-700">
                                <ArrowDownCircle className="w-4 h-4" />
                                Register Entry
                            </Button>
                        </DialogTrigger>
                        <DialogContent>
                            <DialogHeader>
                                <DialogTitle>Register Stock Entry</DialogTitle>
                            </DialogHeader>
                            <form onSubmit={handleEntry} className="space-y-4">
                                <div className="space-y-2">
                                    <Label>Reagent *</Label>
                                    <Select
                                        value={entryForm.reagent_id}
                                        onValueChange={(value) =>
                                            setEntryForm({ ...entryForm, reagent_id: value })
                                        }
                                        required
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select reagent" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {reagents.map((r) => (
                                                <SelectItem key={r.id} value={r.id}>
                                                    {r.code} - {r.name}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div className="space-y-2">
                                    <Label>Quantity *</Label>
                                    <Input
                                        type="number"
                                        step="0.01"
                                        value={entryForm.quantity}
                                        onChange={(e) =>
                                            setEntryForm({
                                                ...entryForm,
                                                quantity: Number(e.target.value),
                                            })
                                        }
                                        required
                                    />
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label>Supplier</Label>
                                        <Input
                                            value={entryForm.supplier_name}
                                            onChange={(e) =>
                                                setEntryForm({ ...entryForm, supplier_name: e.target.value })
                                            }
                                            placeholder="Supplier name"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Purchase Order</Label>
                                        <Input
                                            value={entryForm.purchase_order}
                                            onChange={(e) =>
                                                setEntryForm({ ...entryForm, purchase_order: e.target.value })
                                            }
                                            placeholder="PO number"
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label>Invoice Number</Label>
                                        <Input
                                            value={entryForm.invoice_number}
                                            onChange={(e) =>
                                                setEntryForm({ ...entryForm, invoice_number: e.target.value })
                                            }
                                            placeholder="Invoice #"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Cost</Label>
                                        <Input
                                            type="number"
                                            step="0.01"
                                            value={entryForm.cost}
                                            onChange={(e) =>
                                                setEntryForm({ ...entryForm, cost: Number(e.target.value) })
                                            }
                                            placeholder="0.00"
                                        />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <Label>Notes</Label>
                                    <Textarea
                                        value={entryForm.notes}
                                        onChange={(e) =>
                                            setEntryForm({ ...entryForm, notes: e.target.value })
                                        }
                                        placeholder="Additional notes..."
                                        rows={3}
                                    />
                                </div>

                                <div className="flex justify-end gap-2">
                                    <Button
                                        type="button"
                                        variant="outline"
                                        onClick={() => setEntryDialogOpen(false)}
                                    >
                                        Cancel
                                    </Button>
                                    <Button type="submit">Register Entry</Button>
                                </div>
                            </form>
                        </DialogContent>
                    </Dialog>

                    <Dialog open={withdrawalDialogOpen} onOpenChange={setWithdrawalDialogOpen}>
                        <DialogTrigger asChild>
                            <Button
                                variant="destructive"
                                className="flex items-center gap-2"
                            >
                                <ArrowUpCircle className="w-4 h-4" />
                                Register Withdrawal
                            </Button>
                        </DialogTrigger>
                        <DialogContent>
                            <DialogHeader>
                                <DialogTitle>Register Stock Withdrawal</DialogTitle>
                            </DialogHeader>
                            <form onSubmit={handleWithdrawal} className="space-y-4">
                                <div className="space-y-2">
                                    <Label>Reagent *</Label>
                                    <Select
                                        value={withdrawalForm.reagent_id}
                                        onValueChange={(value) =>
                                            setWithdrawalForm({ ...withdrawalForm, reagent_id: value })
                                        }
                                        required
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select reagent" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {reagents.map((r) => (
                                                <SelectItem key={r.id} value={r.id}>
                                                    {r.code} - {r.name} ({r.stock_current} {r.unit} available)
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div className="space-y-2">
                                    <Label>Quantity *</Label>
                                    <Input
                                        type="number"
                                        step="0.01"
                                        value={withdrawalForm.quantity}
                                        onChange={(e) =>
                                            setWithdrawalForm({
                                                ...withdrawalForm,
                                                quantity: Number(e.target.value),
                                            })
                                        }
                                        required
                                    />
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label>Requisition #</Label>
                                        <Input
                                            value={withdrawalForm.requisition_number}
                                            onChange={(e) =>
                                                setWithdrawalForm({
                                                    ...withdrawalForm,
                                                    requisition_number: e.target.value,
                                                })
                                            }
                                            placeholder="REQ-001"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Department</Label>
                                        <Input
                                            value={withdrawalForm.department}
                                            onChange={(e) =>
                                                setWithdrawalForm({
                                                    ...withdrawalForm,
                                                    department: e.target.value,
                                                })
                                            }
                                            placeholder="e.g., QC Lab"
                                        />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <Label>Purpose *</Label>
                                    <Input
                                        value={withdrawalForm.purpose}
                                        onChange={(e) =>
                                            setWithdrawalForm({ ...withdrawalForm, purpose: e.target.value })
                                        }
                                        placeholder="Why is this reagent needed?"
                                        required
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label>Notes</Label>
                                    <Textarea
                                        value={withdrawalForm.notes}
                                        onChange={(e) =>
                                            setWithdrawalForm({ ...withdrawalForm, notes: e.target.value })
                                        }
                                        placeholder="Additional notes..."
                                        rows={3}
                                    />
                                </div>

                                <div className="flex justify-end gap-2">
                                    <Button
                                        type="button"
                                        variant="outline"
                                        onClick={() => setWithdrawalDialogOpen(false)}
                                    >
                                        Cancel
                                    </Button>
                                    <Button type="submit">Register Withdrawal</Button>
                                </div>
                            </form>
                        </DialogContent>
                    </Dialog>

                    <Dialog open={returnDialogOpen} onOpenChange={setReturnDialogOpen}>
                        <DialogTrigger asChild>
                            <Button variant="outline" className="flex items-center gap-2">
                                <TrendingUp className="w-4 h-4" />
                                Register Return
                            </Button>
                        </DialogTrigger>
                        <DialogContent>
                            <DialogHeader>
                                <DialogTitle>Register Stock Return</DialogTitle>
                            </DialogHeader>
                            <form onSubmit={handleReturn} className="space-y-4">
                                <div className="space-y-2">
                                    <Label>Reagent *</Label>
                                    <Select
                                        value={returnForm.reagent_id}
                                        onValueChange={(value) =>
                                            setReturnForm({ ...returnForm, reagent_id: value })
                                        }
                                        required
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select reagent" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {reagents.map((r) => (
                                                <SelectItem key={r.id} value={r.id}>
                                                    {r.code} - {r.name}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div className="space-y-2">
                                    <Label>Quantity Returned *</Label>
                                    <Input
                                        type="number"
                                        step="0.01"
                                        value={returnForm.quantity}
                                        onChange={(e) =>
                                            setReturnForm({
                                                ...returnForm,
                                                quantity: Number(e.target.value),
                                            })
                                        }
                                        required
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label>Return Reason *</Label>
                                    <Input
                                        value={returnForm.return_reason}
                                        onChange={(e) =>
                                            setReturnForm({ ...returnForm, return_reason: e.target.value })
                                        }
                                        placeholder="Why is this being returned?"
                                        required
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label>Notes</Label>
                                    <Textarea
                                        value={returnForm.notes}
                                        onChange={(e) =>
                                            setReturnForm({ ...returnForm, notes: e.target.value })
                                        }
                                        placeholder="Additional notes..."
                                        rows={3}
                                    />
                                </div>

                                <div className="flex justify-end gap-2">
                                    <Button
                                        type="button"
                                        variant="outline"
                                        onClick={() => setReturnDialogOpen(false)}
                                    >
                                        Cancel
                                    </Button>
                                    <Button type="submit">Register Return</Button>
                                </div>
                            </form>
                        </DialogContent>
                    </Dialog>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card className="bg-slate-900 border-slate-800">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-green-500 flex items-center gap-2">
                            <ArrowDownCircle className="w-4 h-4" />
                            Entries
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-white">{entries.length}</div>
                        <p className="text-sm text-muted-foreground">Total stock entries</p>
                    </CardContent>
                </Card>

                <Card className="bg-slate-900 border-slate-800">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-red-500 flex items-center gap-2">
                            <ArrowUpCircle className="w-4 h-4" />
                            Withdrawals
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-white">{withdrawals.length}</div>
                        <p className="text-sm text-muted-foreground">Total stock withdrawals</p>
                    </CardContent>
                </Card>

                <Card className="bg-slate-900 border-slate-800">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-blue-500 flex items-center gap-2">
                            <TrendingUp className="w-4 h-4" />
                            Returns
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-white">{returns.length}</div>
                        <p className="text-sm text-muted-foreground">Total stock returns</p>
                    </CardContent>
                </Card>
            </div>

            {/* Movements Table */}
            <Card className="bg-slate-900 border-slate-800">
                <CardHeader>
                    <CardTitle>Recent Movements</CardTitle>
                </CardHeader>
                <CardContent>
                    <Tabs defaultValue="all">
                        <TabsList>
                            <TabsTrigger value="all">All</TabsTrigger>
                            <TabsTrigger value="entry">Entries</TabsTrigger>
                            <TabsTrigger value="withdrawal">Withdrawals</TabsTrigger>
                            <TabsTrigger value="return">Returns</TabsTrigger>
                        </TabsList>

                        <TabsContent value="all" className="mt-4">
                            <Table>
                                <TableHeader>
                                    <TableRow className="border-slate-800">
                                        <TableHead className="text-white">Date/Time</TableHead>
                                        <TableHead className="text-white">Type</TableHead>
                                        <TableHead className="text-white">Reagent</TableHead>
                                        <TableHead className="text-white">Quantity</TableHead>
                                        <TableHead className="text-white">Purpose/Notes</TableHead>
                                        <TableHead className="text-white">Requester</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {movements.map((movement) => (
                                        <TableRow key={movement.id} className="border-slate-800">
                                            <TableCell>
                                                {new Date(movement.performed_at).toLocaleString()}
                                            </TableCell>
                                            <TableCell>{getMovementBadge(movement.movement_type)}</TableCell>
                                            <TableCell>
                                                <div>
                                                    <div className="font-medium">
                                                        {(movement as any).reagent?.name}
                                                    </div>
                                                    <div className="text-xs text-muted-foreground">
                                                        {(movement as any).reagent?.code}
                                                    </div>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                {movement.quantity.toFixed(2)} {movement.unit}
                                            </TableCell>
                                            <TableCell className="text-sm">
                                                {movement.purpose || movement.return_reason || movement.notes || "-"}
                                            </TableCell>
                                            <TableCell className="text-sm">
                                                {(movement as any).requester?.full_name || "-"}
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                            {movements.length === 0 && (
                                <div className="text-center py-8 text-muted-foreground">
                                    No movements recorded yet
                                </div>
                            )}
                        </TabsContent>

                        <TabsContent value="entry" className="mt-4">
                            <Table>
                                <TableHeader>
                                    <TableRow className="border-slate-800">
                                        <TableHead className="text-white">Date/Time</TableHead>
                                        <TableHead className="text-white">Reagent</TableHead>
                                        <TableHead className="text-white">Quantity</TableHead>
                                        <TableHead className="text-white">Supplier</TableHead>
                                        <TableHead className="text-white">PO/Invoice</TableHead>
                                        <TableHead className="text-white">Cost</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {entries.map((entry) => (
                                        <TableRow key={entry.id} className="border-slate-800">
                                            <TableCell>
                                                {new Date(entry.performed_at).toLocaleString()}
                                            </TableCell>
                                            <TableCell>{(entry as any).reagent?.name}</TableCell>
                                            <TableCell>
                                                {entry.quantity.toFixed(2)} {entry.unit}
                                            </TableCell>
                                            <TableCell>{entry.supplier_name || "-"}</TableCell>
                                            <TableCell className="text-sm">
                                                {entry.purchase_order || entry.invoice_number || "-"}
                                            </TableCell>
                                            <TableCell>{entry.cost ? `$${entry.cost}` : "-"}</TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </TabsContent>

                        <TabsContent value="withdrawal" className="mt-4">
                            <Table>
                                <TableHeader>
                                    <TableRow className="border-slate-800">
                                        <TableHead className="text-white">Date/Time</TableHead>
                                        <TableHead className="text-white">Reagent</TableHead>
                                        <TableHead className="text-white">Quantity</TableHead>
                                        <TableHead className="text-white">Department</TableHead>
                                        <TableHead className="text-white">Purpose</TableHead>
                                        <TableHead className="text-white">Requester</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {withdrawals.map((withdrawal) => (
                                        <TableRow key={withdrawal.id} className="border-slate-800">
                                            <TableCell>
                                                {new Date(withdrawal.performed_at).toLocaleString()}
                                            </TableCell>
                                            <TableCell>{(withdrawal as any).reagent?.name}</TableCell>
                                            <TableCell>
                                                {withdrawal.quantity.toFixed(2)} {withdrawal.unit}
                                            </TableCell>
                                            <TableCell>{withdrawal.department || "-"}</TableCell>
                                            <TableCell className="text-sm">{withdrawal.purpose}</TableCell>
                                            <TableCell>{(withdrawal as any).requester?.full_name || "-"}</TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </TabsContent>

                        <TabsContent value="return" className="mt-4">
                            <Table>
                                <TableHeader>
                                    <TableRow className="border-slate-800">
                                        <TableHead className="text-white">Date/Time</TableHead>
                                        <TableHead className="text-white">Reagent</TableHead>
                                        <TableHead className="text-white">Quantity</TableHead>
                                        <TableHead className="text-white">Reason</TableHead>
                                        <TableHead className="text-white">Notes</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {returns.map((ret) => (
                                        <TableRow key={ret.id} className="border-slate-800">
                                            <TableCell>
                                                {new Date(ret.performed_at).toLocaleString()}
                                            </TableCell>
                                            <TableCell>{(ret as any).reagent?.name}</TableCell>
                                            <TableCell>
                                                {ret.quantity.toFixed(2)} {ret.unit}
                                            </TableCell>
                                            <TableCell>{ret.return_reason}</TableCell>
                                            <TableCell className="text-sm">{ret.notes || "-"}</TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </TabsContent>
                    </Tabs>
                </CardContent>
            </Card>
        </div>
    );
}
