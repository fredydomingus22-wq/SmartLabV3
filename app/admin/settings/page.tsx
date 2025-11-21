'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';

export default function AdminSettingsPage() {
    const [settings, setSettings] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    const supabase = createClient();

    useEffect(() => {
        fetchSettings();
    }, []);

    const fetchSettings = async () => {
        try {
            const { data, error } = await supabase
                .from('system_settings')
                .select('*')
                .order('key');

            if (error) throw error;
            setSettings(data || []);
        } catch (error) {
            console.error('Error fetching settings:', error);
            toast.error('Failed to load settings');
        } finally {
            setLoading(false);
        }
    };

    const handleUpdate = async (id: string, value: string) => {
        try {
            // Try to parse JSON if it looks like one
            let parsedValue = value;
            try {
                parsedValue = JSON.parse(value);
            } catch (e) {
                // Keep as string if not valid JSON
            }

            const { error } = await supabase
                .from('system_settings')
                .update({ value: parsedValue, updated_at: new Date().toISOString() })
                .eq('id', id);

            if (error) throw error;
            toast.success('Setting updated');
            fetchSettings();
        } catch (error) {
            console.error('Error updating setting:', error);
            toast.error('Failed to update setting');
        }
    };

    if (loading) return <div>Loading settings...</div>;

    return (
        <div className="p-6 space-y-6">
            <h1 className="text-3xl font-bold text-slate-900">System Configuration</h1>
            <p className="text-slate-500">Manage global system parameters.</p>

            <div className="grid gap-4">
                {settings.map((setting) => (
                    <Card key={setting.id}>
                        <CardHeader>
                            <CardTitle className="text-lg font-medium">{setting.key}</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-2">
                            <Label>Value (JSON or Text)</Label>
                            <div className="flex gap-2">
                                <Input
                                    defaultValue={typeof setting.value === 'object' ? JSON.stringify(setting.value) : setting.value}
                                    onBlur={(e) => handleUpdate(setting.id, e.target.value)}
                                />
                            </div>
                            <p className="text-sm text-slate-400">{setting.description}</p>
                        </CardContent>
                    </Card>
                ))}
            </div>
        </div>
    );
}
