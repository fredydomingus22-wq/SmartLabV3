/**
 * Digital Signature Modal Component
 * 
 * Part of Epic 3.2 - Validate Analysis with Digital Signature
 * 
 * Modal for technician validation using:
 * - Technician dropdown (required)
 * - PIN/Password field
 * - Credential validation against technicians table
 * - Digital stamp creation with technician_id and timestamp
 * - Locks analysis editing after validation
 */

'use client';

import { useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Shield, Loader2 } from 'lucide-react';
import bcrypt from 'bcryptjs';
import { auditValidation } from '@/lib/utils/audit-helper';

interface Technician {
    id: string;
    name: string;
    role: string;
    active: boolean;
}

interface DigitalSignatureModalProps {
    isOpen: boolean;
    onClose: () => void;
    onValidated: (technicianId: string, technicianName: string) => void;
    analysisId: string;
    title?: string;
    description?: string;
}

export function DigitalSignatureModal({
    isOpen,
    onClose,
    onValidated,
    analysisId,
    title = 'Digital Signature Required',
    description = 'Please validate this analysis with your credentials',
}: DigitalSignatureModalProps) {
    const [technicians, setTechnicians] = useState<Technician[]>([]);
    const [selectedTechnicianId, setSelectedTechnicianId] = useState<string>('');
    const [pin, setPin] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string>('');

    // Load technicians on modal open
    useState(() => {
        if (isOpen) {
            loadTechnicians();
        }
    });

    async function loadTechnicians() {
        const supabase = createClient();
        const { data, error } = await supabase
            .from('technicians')
            .select('id, name, role, active')
            .eq('active', true)
            .order('name');

        if (error) {
            console.error('Error loading technicians:', error);
            setError('Failed to load technicians');
            return;
        }

        setTechnicians(data || []);
    }

    async function handleValidate() {
        setError('');

        // Validation
        if (!selectedTechnicianId) {
            setError('Please select a technician');
            return;
        }

        if (!pin) {
            setError('Please enter your PIN');
            return;
        }

        setIsLoading(true);

        try {
            const supabase = createClient();

            // Get technician with PIN hash
            const { data: technician, error: techError } = await supabase
                .from('technicians')
                .select('id, name, signature_pin_hash, active')
                .eq('id', selectedTechnicianId)
                .single();

            if (techError || !technician) {
                setError('Technician not found');
                setIsLoading(false);
                return;
            }

            if (!technician.active) {
                setError('This technician account is inactive');
                setIsLoading(false);
                return;
            }

            // Verify PIN against hash
            const isValidPin = await bcrypt.compare(pin, technician.signature_pin_hash);

            if (!isValidPin) {
                setError('Invalid PIN. Please try again.');
                setIsLoading(false);
                return;
            }

            // PIN is valid - Update analysis with validation
            const { error: updateError } = await supabase
                .from('lab_analysis')
                .update({
                    is_locked: true,
                    validated_by: technician.id,
                    validated_at: new Date().toISOString(),
                })
                .eq('id', analysisId);

            if (updateError) {
                console.error('Error updating analysis:', updateError);
                setError('Failed to validate analysis');
                setIsLoading(false);
                return;
            }

            // Log audit trail
            await auditValidation(
                'lab_analysis',
                analysisId,
                'validated',
                technician.id,
                {
                    technician_name: technician.name,
                    validation_method: 'digital_signature',
                }
            );

            // Success!
            onValidated(technician.id, technician.name);
            handleClose();
        } catch (err) {
            console.error('Validation error:', err);
            setError('An unexpected error occurred');
        } finally {
            setIsLoading(false);
        }
    }

    function handleClose() {
        setSelectedTechnicianId('');
        setPin('');
        setError('');
        onClose();
    }

    return (
        <Dialog open={isOpen} onOpenChange={handleClose}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <div className="flex items-center gap-2">
                        <Shield className="h-5 w-5 text-emerald-500" />
                        <DialogTitle>{title}</DialogTitle>
                    </div>
                    <DialogDescription>{description}</DialogDescription>
                </DialogHeader>

                <div className="space-y-4 py-4">
                    {/* Technician Selection */}
                    <div className="space-y-2">
                        <Label htmlFor="technician">Technician *</Label>
                        <Select
                            value={selectedTechnicianId}
                            onValueChange={setSelectedTechnicianId}
                            disabled={isLoading}
                        >
                            <SelectTrigger id="technician">
                                <SelectValue placeholder="Select technician" />
                            </SelectTrigger>
                            <SelectContent>
                                {technicians.map((tech) => (
                                    <SelectItem key={tech.id} value={tech.id}>
                                        {tech.name} {tech.role && `(${tech.role})`}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    {/* PIN Input */}
                    <div className="space-y-2">
                        <Label htmlFor="pin">PIN *</Label>
                        <Input
                            id="pin"
                            type="password"
                            placeholder="Enter your 4-6 digit PIN"
                            value={pin}
                            onChange={(e) => setPin(e.target.value)}
                            disabled={isLoading}
                            maxLength={6}
                            autoComplete="off"
                        />
                    </div>

                    {/* Error Message */}
                    {error && (
                        <Alert variant="destructive">
                            <AlertDescription>{error}</AlertDescription>
                        </Alert>
                    )}

                    {/* Info Message */}
                    <Alert>
                        <AlertDescription className="text-xs text-slate-400">
                            This digital signature confirms you have reviewed and validated the
                            analysis results. Once signed, the analysis cannot be edited.
                        </AlertDescription>
                    </Alert>
                </div>

                <DialogFooter>
                    <Button
                        variant="outline"
                        onClick={handleClose}
                        disabled={isLoading}
                    >
                        Cancel
                    </Button>
                    <Button
                        onClick={handleValidate}
                        disabled={isLoading}
                        className="bg-emerald-600 hover:bg-emerald-700"
                    >
                        {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Sign & Validate
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
