"use client"

import { useState, useEffect } from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { getTechnicians, verifyTechnicianPin } from "@/lib/queries/technicians";
import type { Technician } from "@/types/technician";
import { ShieldCheck, Lock, UserCheck } from "lucide-react";

export interface SignatureValue {
    name: string;
    date: string;
    techId: string;
}

interface SignatureInputProps {
    fieldKey: string;
    label: string;
    required?: boolean;
    value?: SignatureValue | null;
    onChange: (value: SignatureValue | null) => void;
    disabled?: boolean;
}

export function SignatureInput({ fieldKey, label, required, value, onChange, disabled }: SignatureInputProps) {
    const [technicians, setTechnicians] = useState<Technician[]>([]);
    const [selectedTechId, setSelectedTechId] = useState<string | undefined>(undefined);
    const [pin, setPin] = useState("");
    const [verifying, setVerifying] = useState(false);
    const [signedData, setSignedData] = useState<SignatureValue | null>(value || null);
    const [error, setError] = useState("");
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        let mounted = true;
        const load = async () => {
            try {
                const { data } = await getTechnicians();
                if (mounted && data) {
                    setTechnicians(data.filter(t => t.active));
                }
            } catch (e) {
                console.error("Failed to load technicians", e);
            } finally {
                if (mounted) setIsLoading(false);
            }
        };
        load();
        return () => { mounted = false; };
    }, []);

    // Sync with external value if it changes (e.g. form reset)
    useEffect(() => {
        if (value) {
            setSignedData(value);
        } else {
            setSignedData(null);
        }
    }, [value]);

    const handleSign = async () => {
        if (!selectedTechId || !pin) {
            setError("Please select a technician and enter PIN");
            return;
        }

        setVerifying(true);
        setError("");

        try {
            const { valid } = await verifyTechnicianPin(selectedTechId, pin);

            if (valid) {
                const tech = technicians.find(t => t.id === selectedTechId);
                const signature = {
                    name: tech?.name || "Unknown",
                    date: new Date().toISOString(),
                    techId: selectedTechId
                };
                setSignedData(signature);
                onChange(signature);
                setPin(""); // Clear PIN
                setSelectedTechId(undefined); // Reset selection
            } else {
                setError("Invalid PIN");
            }
        } catch (err) {
            console.error("Verification error:", err);
            setError("Verification failed");
        } finally {
            setVerifying(false);
        }
    };

    const handleClear = () => {
        setSignedData(null);
        onChange(null);
        setSelectedTechId(undefined);
        setPin("");
        setError("");
    };

    if (signedData) {
        return (
            <div className="space-y-2">
                <Label>{label} {required && <span className="text-destructive">*</span>}</Label>
                <div className="p-4 bg-green-50 border border-green-200 rounded-lg flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-full bg-green-100 flex items-center justify-center text-green-600">
                            <ShieldCheck className="h-5 w-5" />
                        </div>
                        <div>
                            <p className="font-medium text-green-900">Signed by {signedData.name}</p>
                            <p className="text-xs text-green-700">
                                {new Date(signedData.date).toLocaleString()}
                            </p>
                        </div>
                    </div>
                    {!disabled && (
                        <Button variant="ghost" size="sm" onClick={handleClear} className="text-green-700 hover:text-green-900 hover:bg-green-100">
                            Change
                        </Button>
                    )}
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-3">
            <Label htmlFor={fieldKey}>
                {label} {required && <span className="text-destructive">*</span>}
            </Label>

            <div className="p-4 border rounded-lg bg-card space-y-4">
                <div className="space-y-2">
                    <Label htmlFor={`${fieldKey}_tech`} className="text-xs text-muted-foreground">Technician</Label>
                    {isLoading ? (
                        <div className="h-10 w-full bg-muted animate-pulse rounded-md" />
                    ) : (
                        <select
                            id={`${fieldKey}_tech`}
                            className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                            value={selectedTechId || ""}
                            onChange={(e) => setSelectedTechId(e.target.value || undefined)}
                            disabled={disabled}
                        >
                            <option value="" disabled>Select Technician</option>
                            {technicians.map((tech) => (
                                <option key={tech.id} value={tech.id}>
                                    {tech.name} ({tech.role})
                                </option>
                            ))}
                        </select>
                    )}
                </div>

                {selectedTechId && (
                    <div className="space-y-2">
                        <Label htmlFor={`${fieldKey}_pin`} className="text-xs text-muted-foreground">Signature PIN</Label>
                        <div className="flex gap-2">
                            <div className="relative flex-1">
                                <Lock className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                                <Input
                                    id={`${fieldKey}_pin`}
                                    type="password"
                                    value={pin}
                                    onChange={(e) => setPin(e.target.value)}
                                    className="pl-9"
                                    placeholder="Enter PIN"
                                    disabled={disabled || verifying}
                                />
                            </div>
                            <Button
                                type="button"
                                onClick={handleSign}
                                disabled={disabled || verifying || !pin}
                            >
                                {verifying ? "Verifying..." : "Sign"}
                            </Button>
                        </div>
                        {error && <p className="text-xs text-destructive font-medium">{error}</p>}
                    </div>
                )}
            </div>
        </div>
    );
}
