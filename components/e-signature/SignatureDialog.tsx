'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { captureSignature, SignatureMeaning } from '@/lib/e-signature';
import { toast } from 'sonner';
import { Loader2, CheckCircle2, AlertCircle } from 'lucide-react';

interface SignatureDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    meaning: SignatureMeaning;
    entityType: string;
    entityId: string;
    onSuccess?: (signatureId: string) => void;
    title?: string;
    description?: string;
}

export function SignatureDialog({
    open,
    onOpenChange,
    meaning,
    entityType,
    entityId,
    onSuccess,
    title,
    description
}: SignatureDialogProps) {
    const [password, setPassword] = useState('');
    const [comment, setComment] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const getMeaningLabel = () => {
        const labels: Record<SignatureMeaning, string> = {
            'approved': 'Approval',
            'reviewed': 'Review',
            'witnessed': 'Witness',
            'performed': 'Performance',
            'verified': 'Verification'
        };
        return labels[meaning];
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!password) {
            toast.error('Password is required for electronic signature');
            return;
        }

        setIsSubmitting(true);

        try {
            const result = await captureSignature(
                password,
                meaning,
                entityType,
                entityId,
                comment || undefined
            );

            if (result.success && result.signatureId) {
                toast.success('Electronic signature captured successfully', {
                    description: `Your ${meaning} signature has been recorded.`,
                    icon: <CheckCircle2 className="h-5 w-5 text-green-500" />
                });

                // Clear form
                setPassword('');
                setComment('');

                // Notify parent
                if (onSuccess) {
                    onSuccess(result.signatureId);
                }

                // Close dialog
                onOpenChange(false);
            } else {
                toast.error('Signature capture failed', {
                    description: result.error || 'Unknown error occurred',
                    icon: <AlertCircle className="h-5 w-5 text-red-500" />
                });
            }
        } catch (error) {
            toast.error('Unexpected error', {
                description: 'Failed to capture signature. Please try again.',
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[500px]">
                <form onSubmit={handleSubmit}>
                    <DialogHeader>
                        <DialogTitle>
                            {title || `Electronic Signature - ${getMeaningLabel()}`}
                        </DialogTitle>
                        <DialogDescription>
                            {description || `This action requires your electronic signature to ${meaning} this ${entityType}.`}
                        </DialogDescription>
                    </DialogHeader>

                    <div className="grid gap-4 py-4">
                        {/* Electronic Signature Notice */}
                        <div className="rounded-lg border border-yellow-500/50 bg-yellow-500/10 p-4">
                            <div className="flex items-start gap-3">
                                <AlertCircle className="h-5 w-5 text-yellow-500 mt-0.5" />
                                <div className="space-y-1">
                                    <p className="text-sm font-medium text-yellow-500">
                                        Electronic Signature Required
                                    </p>
                                    <p className="text-xs text-muted-foreground">
                                        By signing electronically, you confirm that this action is equivalent
                                        to your handwritten signature and cannot be undone. Your signature
                                        will be recorded with timestamp and IP address for compliance.
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Password (for re-verification) */}
                        <div className="grid gap-2">
                            <Label htmlFor="password">
                                Password <span className="text-red-500">*</span>
                            </Label>
                            <Input
                                id="password"
                                type="password"
                                placeholder="Enter your password to sign"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                                disabled={isSubmitting}
                                className="font-mono"
                                autoFocus
                            />
                            <p className="text-xs text-muted-foreground">
                                Re-enter your password to verify your identity
                            </p>
                        </div>

                        {/* Optional Comment */}
                        <div className="grid gap-2">
                            <Label htmlFor="comment">Comment (Optional)</Label>
                            <Textarea
                                id="comment"
                                placeholder={`Add a comment about this ${meaning}...`}
                                value={comment}
                                onChange={(e) => setComment(e.target.value)}
                                disabled={isSubmitting}
                                rows={3}
                            />
                        </div>

                        {/* Signature Details */}
                        <div className="rounded-lg border bg-muted/50 p-3 space-y-2">
                            <p className="text-xs font-medium text-muted-foreground">
                                Signature Details:
                            </p>
                            <div className="space-y-1 text-xs text-muted-foreground">
                                <p>• Meaning: <span className="text-foreground font-medium">{getMeaningLabel()}</span></p>
                                <p>• Entity Type: <span className="text-foreground font-medium">{entityType}</span></p>
                                <p>• Timestamp: <span className="text-foreground font-medium">{new Date().toLocaleString()}</span></p>
                            </div>
                        </div>
                    </div>

                    <DialogFooter>
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => onOpenChange(false)}
                            disabled={isSubmitting}
                        >
                            Cancel
                        </Button>
                        <Button
                            type="submit"
                            disabled={isSubmitting || !password}
                        >
                            {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            {isSubmitting ? 'Signing...' : 'Sign Electronically'}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
