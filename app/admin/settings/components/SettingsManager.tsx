"use client"

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Plus, Edit, Trash2, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { getSystemSettings, createSystemSetting, updateSystemSetting, deleteSystemSetting, SystemSetting } from "@/lib/queries/system-settings";

export function SettingsManager() {
    const [settings, setSettings] = useState<SystemSetting[]>([]);
    const [loading, setLoading] = useState(true);
    const [showDialog, setShowDialog] = useState(false);
    const [editing, setEditing] = useState<SystemSetting | null>(null);
    const [formData, setFormData] = useState<Partial<SystemSetting>>({
        key: "",
        value: "",
        description: "",
    });

    useEffect(() => {
        loadSettings();
    }, []);

    const loadSettings = async () => {
        setLoading(true);
        try {
            const { data, error } = await getSystemSettings();
            if (error) throw error;
            setSettings(data || []);
        } catch (e) {
            console.error(e);
            toast.error("Failed to load system settings");
        } finally {
            setLoading(false);
        }
    };

    const handleCreate = () => {
        setEditing(null);
        setFormData({ key: "", value: "", description: "" });
        setShowDialog(true);
    };

    const handleEdit = (s: SystemSetting) => {
        setEditing(s);
        setFormData({ key: s.key, value: JSON.stringify(s.value, null, 2), description: s.description });
        setShowDialog(true);
    };

    const handleDelete = async (id: string) => {
        if (!confirm("Delete this setting?")) return;
        try {
            const { error } = await deleteSystemSetting(id);
            if (error) throw error;
            toast.success("Setting deleted");
            loadSettings();
        } catch (e) {
            console.error(e);
            toast.error("Failed to delete setting");
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const parsedValue = (() => {
                try {
                    return JSON.parse(formData.value as string);
                } catch {
                    return formData.value;
                }
            })();
            if (editing) {
                const { error } = await updateSystemSetting(editing.id, { value: parsedValue, description: formData.description });
                if (error) throw error;
                toast.success("Setting updated");
            } else {
                const { error } = await createSystemSetting({ key: formData.key, value: parsedValue, description: formData.description });
                if (error) throw error;
                toast.success("Setting created");
            }
            setShowDialog(false);
            loadSettings();
        } catch (e) {
            console.error(e);
            toast.error("Failed to save setting");
        }
    };

    if (loading) return <div className="flex justify-center p-8"><Loader2 className="animate-spin" /></div>;

    return (
        <div className="space-y-4">
            <div className="flex justify-between items-center">
                <h3 className="text-lg font-medium">Global System Settings</h3>
                <Button onClick={handleCreate} size="sm">
                    <Plus className="mr-2 h-4 w-4" /> New Setting
                </Button>
            </div>

            <div className="border rounded-lg">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Key</TableHead>
                            <TableHead>Value</TableHead>
                            <TableHead>Description</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {settings.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={4} className="text-center py-8 text-muted-foreground">No settings found</TableCell>
                            </TableRow>
                        ) : (
                            settings.map((s) => (
                                <TableRow key={s.id}>
                                    <TableCell className="font-medium">{s.key}</TableCell>
                                    <TableCell><pre className="whitespace-pre-wrap break-all">{JSON.stringify(s.value, null, 2)}</pre></TableCell>
                                    <TableCell>{s.description}</TableCell>
                                    <TableCell className="text-right">
                                        <div className="flex justify-end gap-2">
                                            <Button variant="ghost" size="icon" onClick={() => handleEdit(s)}>
                                                <Edit className="h-4 w-4" />
                                            </Button>
                                            <Button variant="ghost" size="icon" onClick={() => handleDelete(s.id)}>
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
                        <DialogTitle>{editing ? "Edit Setting" : "New Setting"}</DialogTitle>
                    </DialogHeader>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        {!editing && (
                            <div className="space-y-2">
                                <Label htmlFor="key">Key</Label>
                                <Input id="key" value={formData.key || ""} onChange={e => setFormData({ ...formData, key: e.target.value })} required />
                            </div>
                        )}
                        <div className="space-y-2">
                            <Label htmlFor="value">Value (JSON or plain text)</Label>
                            <Input id="value" value={formData.value as string || ""} onChange={e => setFormData({ ...formData, value: e.target.value })} required />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="description">Description</Label>
                            <Input id="description" value={formData.description || ""} onChange={e => setFormData({ ...formData, description: e.target.value })} />
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
