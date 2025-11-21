'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { Plus } from 'lucide-react';

export default function SamplePipelinePage() {
    const [samples, setSamples] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const supabase = createClient();

    useEffect(() => {
        fetchSamples();
    }, []);

    const fetchSamples = async () => {
        const { data } = await supabase
            .from('samples')
            .select('*')
            .order('created_at', { ascending: false });
        setSamples(data || []);
        setLoading(false);
    };

    const columns = [
        { id: 'pending', title: 'Pending', color: 'bg-slate-100' },
        { id: 'received', title: 'Received', color: 'bg-blue-50' },
        { id: 'in_analysis', title: 'In Analysis', color: 'bg-yellow-50' },
        { id: 'review', title: 'Review', color: 'bg-purple-50' },
        { id: 'approved', title: 'Approved', color: 'bg-green-50' }
    ];

    if (loading) return <div>Loading pipeline...</div>;

    return (
        <div className="p-6 h-full flex flex-col">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold text-slate-900">Sample Pipeline</h1>
                <Link href="/lab/samples/register">
                    <Button>
                        <Plus className="w-4 h-4 mr-2" />
                        Register Sample
                    </Button>
                </Link>
            </div>

            <div className="flex gap-4 overflow-x-auto pb-4 h-full">
                {columns.map(col => (
                    <div key={col.id} className={`min-w-[300px] w-[300px] rounded-lg p-4 ${col.color}`}>
                        <h3 className="font-semibold mb-4 flex justify-between">
                            {col.title}
                            <Badge variant="secondary">
                                {samples.filter(s => s.status === col.id).length}
                            </Badge>
                        </h3>

                        <div className="space-y-3">
                            {samples
                                .filter(s => s.status === col.id)
                                .map(sample => (
                                    <Link key={sample.id} href={`/lab/samples/${sample.id}/test`}>
                                        <Card className="cursor-pointer hover:shadow-md transition-shadow">
                                            <CardContent className="p-4">
                                                <div className="flex justify-between items-start mb-2">
                                                    <span className="font-mono font-bold text-sm">{sample.code}</span>
                                                    {sample.priority === 'urgent' && (
                                                        <Badge variant="destructive" className="text-xs">Urgent</Badge>
                                                    )}
                                                </div>
                                                <div className="text-sm text-slate-600 mb-2">
                                                    {sample.type.replace('_', ' ')}
                                                </div>
                                                <div className="text-xs text-slate-400">
                                                    {new Date(sample.created_at).toLocaleDateString()}
                                                </div>
                                            </CardContent>
                                        </Card>
                                    </Link>
                                ))}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
