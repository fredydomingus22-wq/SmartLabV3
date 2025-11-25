"use client"

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Plus, Edit, Trash2, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { getCipRecords, createCipRecord, updateCipRecord, deleteCipRecord, getProductionLines, getMixingTanks, getShifts } from "@/lib/queries/production-settings";
import { CipRecord, ProductionLine, MixingTank, Shift } from "@/lib/queries/production-settings"; // types are exported there

export function RecordsManager() {
    const [records, setRecords] = useState<CipRecord[]>([]);
    const [loading, setLoading] = useState(true);
    const [showDialog, setShowDialog] = useState(false);
    const [editingRecord, setEditingRecord] = useState<CipRecord | null>(null);
    const [formData, setFormData] = useState<Partial<CipRecord>>({
        start_time: new Date().toISOString(),
        status: "pending",
    });

    const [lines, setLines] = useState<ProductionLine[]>([]);
    const [tanks, setTanks] = useState<MixingTank[]>([]);
    const [shifts, setShifts] = useState<Shift[]>([]);

    useEffect(() => {
        loadAll();
    }, []);

    const loadAll = async () => {
        setLoading(true);
        try {
            const [{ data: recs, error: err1 }, { data: lns, error: err2 }, { data: tnks, error: err3 }, { data: shfts, error: err4 }] = await Promise.all([
                getCipRecords(),
                getProductionLines(),
                getMixingTanks(),
                getShifts(),
            ]);
            if (err1) throw err1;
            if (err2) throw err2;
            if (err3) throw err3;
            if (err4) throw err4;
            setRecords(recs || []);
            setLines(lns || []);
            setTanks(tnks || []);
            setShifts(shfts || []);
        } catch (e) {
            console.error(e);
            toast.error("Failed to load CIP data");
        } finally {
            setLoading(false);
        }
    };

    const handleCreate = () => {
        setEditingRecord(null);
        setFormData({ start_time: new Date().toISOString(), status: "pending" });
        setShowDialog(true);
    };

    const handleEdit = (rec: CipRecord) => {
        setEditingRecord(rec);
        setFormData({
            ...rec,
        });
        setShowDialog(true);
    };

    const handleDelete = async (id: string) => {
        if (!confirm("Delete this CIP record?")) return;
        try {
            const { error } = await deleteCipRecord(id);
            if (error) throw error;
            toast.success("Record deleted");
            loadAll();
        } catch (e) {
            console.error(e);
            toast.error("Failed to delete");
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            if (editingRecord) {
                const { error } = await updateCipRecord(editingRecord.id, formData);
                if (error) throw error;
                toast.success("Record updated");
            } else {
                const { error } = await createCipRecord(formData);
                if (error) throw error;
                toast.success("Record created");
            }
            setShowDialog(false);
            loadAll();
        } catch (e) {
            console.error(e);
            toast.error("Failed to save record");
        }
    };

    if (loading) return <div className="flex justify-center p-8"><Loader2 className="animate-spin" /></div>;

    return (
        <div className="space-y-4">
            <div className="flex justify-between items-center">
                <h3 className="text-lg font-medium">CIP Records</h3>
                <Button onClick={handleCreate} size="sm">
                    <Plus className="mr-2 h-4 w-4" /> New Record
                </Button>
            </div>

            <div className="border rounded-lg">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Tank</TableHead>
                            <TableHead>Line</TableHead>
                            <TableHead>Shift</TableHead>
                            <TableHead>Start</TableHead>
                            <TableHead>End</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {records.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                                    No CIP records found
                                </TableCell>
                            </TableRow>
                        ) : (
                            records.map((rec) => (
                                <TableRow key={rec.id}>
                                    <TableCell>{rec.tank_id?.slice(0, 8) || "-"}</TableCell>
                                    <TableCell>{rec.line_id?.slice(0, 8) || "-"}</TableCell>
                                    <TableCell>{rec.shift_id?.slice(0, 8) || "-"}</TableCell>
                                    <TableCell>{new Date(rec.start_time).toLocaleString()}</TableCell>
                                    <TableCell>{rec.end_time ? new Date(rec.end_time).toLocaleString() : "-"}</TableCell>
                                    <TableCell>
                                        <Badge variant={rec.status === 'completed' ? 'default' : rec.status === 'in_progress' ? 'secondary' : 'outline'}>
                                            {rec.status}
                                        </Badge>
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <div className="flex justify-end gap-2">
                                            <Button variant="ghost" size="icon" onClick={() => handleEdit(rec)}>
                                                <Edit className="h-4 w-4" />
                                            </Button>
                                            <Button variant="ghost" size="icon" onClick={() => handleDelete(rec.id)}>
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

            <Dialog open={showDialog} onOpenChange={setShowDialog}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>{editingRecord ? "Edit CIP Record" : "New CIP Record"}</DialogTitle>
                    </DialogHeader>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="tank">Tank</Label>
                                <Select value={formData.tank_id || ""} onValueChange={(v) => setFormData({ ...formData, tank_id: v })}>
                                    <SelectTrigger><SelectValue placeholder="Select tank" /></SelectTrigger>
                                    <SelectContent>
                                        {tanks.map(t => (
                                            <SelectItem key={t.id} value={t.id}>{t.name}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="line">Line</Label>
                                <Select value={formData.line_id || ""} onValueChange={(v) => setFormData({ ...formData, line_id: v })}>
                                    <SelectTrigger><SelectValue placeholder="Select line" /></SelectTrigger>
                                    <SelectContent>
                                        {lines.map(l => (
                                            <SelectItem key={l.id} value={l.id}>{l.name}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="shift">Shift</Label>
                                <Select value={formData.shift_id || ""} onValueChange={(v) => setFormData({ ...formData, shift_id: v })}>
                                    <SelectTrigger><SelectValue placeholder="Select shift" /></SelectTrigger>
                                    <SelectContent>
                                        {shifts.map(s => (
                                            <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="status">Status</Label>
                                <Select value={formData.status || "pending"} onValueChange={(v) => setFormData({ ...formData, status: v as any })}>
                                    <SelectTrigger><SelectValue /></SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="pending">Pending</SelectItem>
                                        <SelectItem value="in_progress">In Progress</SelectItem>
                                        <SelectItem value="completed">Completed</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="start_time">Start Time</Label>
                                <Input id="start_time" type="datetime-local" value={formData.start_time?.slice(0, 16) || ""} onChange={e => setFormData({ ...formData, start_time: new Date(e.target.value).toISOString() })} required />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="end_time">End Time</Label>
                                <Input id="end_time" type="datetime-local" value={formData.end_time?.slice(0, 16) || ""} onChange={e => setFormData({ ...formData, end_time: e.target.value ? new Date(e.target.value).toISOString() : undefined })} />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="cleaning_type">Cleaning Type</Label>
                            <Input id="cleaning_type" value={formData.cleaning_type || ""} onChange={e => setFormData({ ...formData, cleaning_type: e.target.value })} />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="notes">Notes</Label>
                            <Input id="notes" value={formData.notes || ""} onChange={e => setFormData({ ...formData, notes: e.target.value })} />
                        </div>
                        <DialogFooter>
                            <Button type="button" variant="outline" onClick={() => setShowDialog(false)}>Cancel</Button>
                            <Button type="submit">Save</Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>
        </div>
    );
}
