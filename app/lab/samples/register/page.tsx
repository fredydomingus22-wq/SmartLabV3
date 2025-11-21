'use client';

import { useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';

export default function RegisterSamplePage() {
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        code: '',
        type: 'raw_material',
        priority: 'normal',
        notes: ''
    });

    const supabase = createClient();
    const router = useRouter();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            // Auto-generate code if empty (simplified)
            const code = formData.code || `SMP-${Date.now().toString().slice(-6)}`;

            const { error } = await supabase
                .from('samples')
                .insert({
                    code,
                    type: formData.type,
                    priority: formData.priority,
                    notes: formData.notes,
                    status: 'pending'
                });

            if (error) throw error;

            toast.success('Sample registered successfully');
            router.push('/lab/samples');
        } catch (error) {
            toast.error('Failed to register sample');
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="p-6 max-w-2xl mx-auto">
            <Card>
                <CardHeader>
                    <CardTitle>Register New Sample</CardTitle>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label>Sample Code (Auto-generated if empty)</Label>
                                <Input
                                    placeholder="SMP-..."
                                    value={formData.code}
                                    onChange={e => setFormData({ ...formData, code: e.target.value })}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label>Priority</Label>
                                <Select
                                    value={formData.priority}
                                    onValueChange={v => setFormData({ ...formData, priority: v })}
                                >
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="normal">Normal</SelectItem>
                                        <SelectItem value="urgent">Urgent</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label>Sample Type</Label>
                            <Select
                                value={formData.type}
                                onValueChange={v => setFormData({ ...formData, type: v })}
                            >
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="raw_material">Raw Material</SelectItem>
                                    <SelectItem value="intermediate">Intermediate Product</SelectItem>
                                    <SelectItem value="finished_product">Finished Product</SelectItem>
                                    <SelectItem value="environment">Environmental Swab</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-2">
                            <Label>Notes</Label>
                            <Input
                                value={formData.notes}
                                onChange={e => setFormData({ ...formData, notes: e.target.value })}
                            />
                        </div>

                        <Button type="submit" className="w-full" disabled={loading}>
                            {loading ? 'Registering...' : 'Register Sample'}
                        </Button>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
}
