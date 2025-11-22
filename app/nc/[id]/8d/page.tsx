import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';
import { createEightDReport, updateEightDReport, getEightDReports } from '@/lib/queries/qms';
import { EightDReport } from '@/types/qms';
import { createClient } from '@/lib/supabase/client';

export default function EightDEditorPage({ params }: { params: { id: string } }) {
    const [report, setReport] = useState<Partial<EightDReport>>({});
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState("d1");
    const router = useRouter();
    const supabase = createClient();

    useEffect(() => {
        fetchReport();
    }, []);

    const fetchReport = async () => {
        try {
            // Check if report exists for this NC
            const { data, error } = await supabase
                .from('eight_d_reports')
                .select('*')
                .eq('nc_id', params.id)
                .single();

            if (data) {
                setReport(data);
            } else {
                // Initialize new
                setReport({
                    nc_id: params.id,
                    d1_team: [],
                    status: 'open'
                });
            }
        } catch (error) {
            console.error("Error fetching 8D:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async () => {
        try {
            if (report.id) {
                await updateEightDReport(report.id, report);
            } else {
                const newReport = await createEightDReport(report as any);
                setReport(newReport);
            }
            toast.success("8D Report saved successfully");
        } catch (error) {
            console.error("Error saving 8D:", error);
            toast.error("Failed to save report");
        }
    };

    const updateField = (field: keyof EightDReport, value: any) => {
        setReport(prev => ({ ...prev, [field]: value }));
    };

    if (loading) return <div>Loading...</div>;

    return (
        <AppShell>
            <div className="p-6 space-y-6 max-w-5xl mx-auto">
                <SectionHeader
                    title="8D Problem Solving"
                    description={`Corrective Action Report for NC #${params.id}`} // Ideally fetch NC code
                    action={
                        <div className="flex gap-2">
                            <Button variant="outline" onClick={() => router.back()}>Cancel</Button>
                            <Button onClick={handleSave}>Save Progress</Button>
                        </div>
                    }
                />

                <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                    <TabsList className="grid w-full grid-cols-8">
                        <TabsTrigger value="d1">D1 Team</TabsTrigger>
                        <TabsTrigger value="d2">D2 Problem</TabsTrigger>
                        <TabsTrigger value="d3">D3 Contain</TabsTrigger>
                        <TabsTrigger value="d4">D4 Root</TabsTrigger>
                        <TabsTrigger value="d5">D5 Action</TabsTrigger>
                        <TabsTrigger value="d6">D6 Verify</TabsTrigger>
                        <TabsTrigger value="d7">D7 Prevent</TabsTrigger>
                        <TabsTrigger value="d8">D8 Congrats</TabsTrigger>
                    </TabsList>

                    <div className="mt-6">
                        <TabsContent value="d1">
                            <Card>
                                <CardHeader><CardTitle>D1: Establish the Team</CardTitle></CardHeader>
                                <CardContent>
                                    <Label>Team Members (Comma separated)</Label>
                                    <Input
                                        value={report.d1_team?.join(', ') || ''}
                                        onChange={e => updateField('d1_team', e.target.value.split(',').map(s => s.trim()))}
                                        placeholder="John Doe, Jane Smith..."
                                    />
                                </CardContent>
                            </Card>
                        </TabsContent>

                        <TabsContent value="d2">
                            <Card>
                                <CardHeader><CardTitle>D2: Describe the Problem</CardTitle></CardHeader>
                                <CardContent>
                                    <Label>Problem Description (5W2H)</Label>
                                    <Textarea
                                        className="h-32"
                                        value={report.d2_problem || ''}
                                        onChange={e => updateField('d2_problem', e.target.value)}
                                    />
                                </CardContent>
                            </Card>
                        </TabsContent>

                        <TabsContent value="d3">
                            <Card>
                                <CardHeader><CardTitle>D3: Interim Containment Actions</CardTitle></CardHeader>
                                <CardContent>
                                    <Label>Immediate Actions Taken</Label>
                                    <Textarea
                                        className="h-32"
                                        value={report.d3_containment || ''}
                                        onChange={e => updateField('d3_containment', e.target.value)}
                                    />
                                </CardContent>
                            </Card>
                        </TabsContent>

                        <TabsContent value="d4">
                            <Card>
                                <CardHeader><CardTitle>D4: Root Cause Analysis</CardTitle></CardHeader>
                                <CardContent>
                                    <Label>Root Cause (Fishbone / 5 Whys)</Label>
                                    <Textarea
                                        className="h-32"
                                        value={report.d4_root_cause || ''}
                                        onChange={e => updateField('d4_root_cause', e.target.value)}
                                    />
                                </CardContent>
                            </Card>
                        </TabsContent>

                        <TabsContent value="d5">
                            <Card>
                                <CardHeader><CardTitle>D5: Choose Corrective Actions</CardTitle></CardHeader>
                                <CardContent>
                                    <Label>Planned Corrective Actions</Label>
                                    <Textarea
                                        className="h-32"
                                        value={report.d5_corrective_action || ''}
                                        onChange={e => updateField('d5_corrective_action', e.target.value)}
                                    />
                                </CardContent>
                            </Card>
                        </TabsContent>

                        <TabsContent value="d6">
                            <Card>
                                <CardHeader><CardTitle>D6: Implement & Validate</CardTitle></CardHeader>
                                <CardContent>
                                    <Label>Validation Results</Label>
                                    <Textarea
                                        className="h-32"
                                        value={report.d6_validation || ''}
                                        onChange={e => updateField('d6_validation', e.target.value)}
                                    />
                                </CardContent>
                            </Card>
                        </TabsContent>

                        <TabsContent value="d7">
                            <Card>
                                <CardHeader><CardTitle>D7: Prevent Recurrence</CardTitle></CardHeader>
                                <CardContent>
                                    <Label>System Updates / SOP Changes</Label>
                                    <Textarea
                                        className="h-32"
                                        value={report.d7_prevention || ''}
                                        onChange={e => updateField('d7_prevention', e.target.value)}
                                    />
                                </CardContent>
                            </Card>
                        </TabsContent>

                        <TabsContent value="d8">
                            <Card>
                                <CardHeader><CardTitle>D8: Recognize the Team</CardTitle></CardHeader>
                                <CardContent>
                                    <Label>Team Recognition / Closure</Label>
                                    <Textarea
                                        className="h-32"
                                        value={report.d8_recognition || ''}
                                        onChange={e => updateField('d8_recognition', e.target.value)}
                                    />
                                    <div className="mt-4">
                                        <Button
                                            variant="default"
                                            className="bg-green-600 hover:bg-green-700"
                                            onClick={() => {
                                                updateField('status', 'closed');
                                                handleSave();
                                            }}
                                        >
                                            <CheckCircle className="mr-2 h-4 w-4" />
                                            Close 8D Report
                                        </Button>
                                    </div>
                                </CardContent>
                            </Card>
                        </TabsContent>
                    </div>
                </Tabs>
            </div>
        </AppShell>
    );
}
