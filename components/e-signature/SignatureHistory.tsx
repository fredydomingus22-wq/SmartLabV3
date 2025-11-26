'use client';

import { useEffect, useState } from 'react';
import { ESignature, getEntitySignatures } from '@/lib/e-signature';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { FileSignature, User, Clock, MessageSquare } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

interface SignatureHistoryProps {
    entityType: string;
    entityId: string;
    className?: string;
}

export function SignatureHistory({ entityType, entityId, className }: SignatureHistoryProps) {
    const [signatures, setSignatures] = useState<ESignature[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        loadSignatures();
    }, [entityType, entityId]);

    const loadSignatures = async () => {
        setIsLoading(true);
        try {
            const sigs = await getEntitySignatures(entityType, entityId);
            setSignatures(sigs);
        } catch (error) {
            console.error('Failed to load signatures:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const getMeaningBadge = (meaning: string) => {
        const variants: Record<string, { variant: 'default' | 'secondary' | 'destructive' | 'outline', color: string }> = {
            'approved': { variant: 'default', color: 'bg-green-500' },
            'reviewed': { variant: 'secondary', color: 'bg-blue-500' },
            'witnessed': { variant: 'outline', color: 'bg-purple-500' },
            'performed': { variant: 'default', color: 'bg-orange-500' },
            'verified': { variant: 'default', color: 'bg-teal-500' }
        };

        const config = variants[meaning] || variants['reviewed'];

        return (
            <Badge variant={config.variant} className="capitalize">
                {meaning}
            </Badge>
        );
    };

    if (isLoading) {
        return (
            <Card className={className}>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <FileSignature className="h-5 w-5" />
                        Electronic Signatures
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <p className="text-sm text-muted-foreground">Loading signatures...</p>
                </CardContent>
            </Card>
        );
    }

    if (signatures.length === 0) {
        return (
            <Card className={className}>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <FileSignature className="h-5 w-5" />
                        Electronic Signatures
                    </CardTitle>
                    <CardDescription>
                        No signatures have been captured for this {entityType}
                    </CardDescription>
                </CardHeader>
            </Card>
        );
    }

    return (
        <Card className={className}>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <FileSignature className="h-5 w-5" />
                    Electronic Signatures
                </CardTitle>
                <CardDescription>
                    {signatures.length} signature{signatures.length !== 1 ? 's' : ''} recorded
                </CardDescription>
            </CardHeader>
            <CardContent>
                <div className="space-y-4">
                    {signatures.map((signature, index) => (
                        <div key={signature.id}>
                            <div className="flex items-start justify-between gap-4">
                                <div className="flex-1 space-y-2">
                                    {/* Signature Meaning */}
                                    <div className="flex items-center gap-2">
                                        {getMeaningBadge(signature.meaning)}
                                        <span className="text-sm font-medium">
                                            {signature.meaning.charAt(0).toUpperCase() + signature.meaning.slice(1)} by
                                        </span>
                                    </div>

                                    {/* User Info */}
                                    <div className="flex items-center gap-2 text-sm">
                                        <User className="h-4 w-4 text-muted-foreground" />
                                        <span className="font-medium">{signature.user_full_name}</span>
                                        <span className="text-muted-foreground">({signature.user_role})</span>
                                    </div>

                                    {/* Timestamp */}
                                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                        <Clock className="h-4 w-4" />
                                        <span>
                                            {new Date(signature.signed_at).toLocaleString()}
                                        </span>
                                        <span className="text-xs">
                                            ({formatDistanceToNow(new Date(signature.signed_at), { addSuffix: true })})
                                        </span>
                                    </div>

                                    {/* Comment */}
                                    {signature.comment && (
                                        <div className="flex items-start gap-2 text-sm">
                                            <MessageSquare className="h-4 w-4 text-muted-foreground mt-0.5" />
                                            <p className="text-muted-foreground italic">
                                                &ldquo;{signature.comment}&rdquo;
                                            </p>
                                        </div>
                                    )}

                                    {/* Signature Hash (for verification) */}
                                    <div className="rounded-md bg-muted/50 px-3 py-2">
                                        <p className="text-xs text-muted-foreground mb-1">Signature Hash:</p>
                                        <code className="text-xs font-mono break-all">
                                            {signature.signature_hash.substring(0, 32)}...
                                        </code>
                                    </div>
                                </div>
                            </div>

                            {/* Separator between signatures */}
                            {index < signatures.length - 1 && <Separator className="mt-4" />}
                        </div>
                    ))}
                </div>
            </CardContent>
        </Card>
    );
}
