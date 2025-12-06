'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Loader2 } from 'lucide-react';
import { getProfiles, type Profile } from '@/lib/queries/profiles';
import { getProducts, type Product } from '@/lib/queries/samples/getProducts';
import { toast } from 'sonner';

interface CollectionDetailsCardProps {
    collectionPoint: string;
    collectedBy: string;
    collectedAt: string;
    notes: string;
    productId: string;
    assignedTo: string;
    onCollectionPointChange: (value: string) => void;
    onCollectedByChange: (value: string) => void;
    onCollectedAtChange: (value: string) => void;
    onNotesChange: (value: string) => void;
    onProductIdChange: (value: string) => void;
    onAssignedToChange: (value: string) => void;
}

export function CollectionDetailsCard({
    collectionPoint,
    collectedBy,
    collectedAt,
    notes,
    productId,
    assignedTo,
    onCollectionPointChange,
    onCollectedByChange,
    onCollectedAtChange,
    onNotesChange,
    onProductIdChange,
    onAssignedToChange
}: CollectionDetailsCardProps) {
    const [users, setUsers] = useState<Profile[]>([]);
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const [usersData, productsData] = await Promise.all([
                getProfiles(),
                getProducts()
            ]);
            setUsers(usersData);
            setProducts(productsData);
        } catch (error) {
            console.error('Error fetching data:', error);
            toast.error('Failed to load form data');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle>Collection Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                        <Label htmlFor="collection-point">Collection Point *</Label>
                        <Input
                            id="collection-point"
                            value={collectionPoint}
                            onChange={(e) => onCollectionPointChange(e.target.value)}
                            placeholder="e.g., Tank 5, Line 2, Warehouse A"
                            required
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="collected-by">Collected By *</Label>
                        {loading ? (
                            <div className="flex items-center justify-center h-10">
                                <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                            </div>
                        ) : (
                            <Select value={collectedBy} onValueChange={onCollectedByChange}>
                                <SelectTrigger id="collected-by">
                                    <SelectValue placeholder="Select technician..." />
                                </SelectTrigger>
                                <SelectContent>
                                    {users.map((user) => (
                                        <SelectItem key={user.id} value={user.id}>
                                            {user.full_name || user.email}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        )}
                    </div>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                        <Label htmlFor="product">Product (Optional)</Label>
                        {loading ? (
                            <div className="flex items-center justify-center h-10">
                                <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                            </div>
                        ) : (
                            <Select value={productId} onValueChange={onProductIdChange}>
                                <SelectTrigger id="product">
                                    <SelectValue placeholder="Select product..." />
                                </SelectTrigger>
                                <SelectContent>
                                    {products.map((product) => (
                                        <SelectItem key={product.id} value={product.id}>
                                            {product.name} ({product.code})
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        )}
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="assigned-to">Assigned Analyst (Optional)</Label>
                        {loading ? (
                            <div className="flex items-center justify-center h-10">
                                <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                            </div>
                        ) : (
                            <Select value={assignedTo} onValueChange={onAssignedToChange}>
                                <SelectTrigger id="assigned-to">
                                    <SelectValue placeholder="Select analyst..." />
                                </SelectTrigger>
                                <SelectContent>
                                    {users.map((user) => (
                                        <SelectItem key={user.id} value={user.id}>
                                            {user.full_name || user.email}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        )}
                    </div>
                </div>

                <div className="space-y-2">
                    <Label htmlFor="collected-at">Collection Date & Time *</Label>
                    <Input
                        id="collected-at"
                        type="datetime-local"
                        value={collectedAt}
                        onChange={(e) => onCollectedAtChange(e.target.value)}
                        required
                    />
                </div>

                <div className="space-y-2">
                    <Label htmlFor="notes">Notes (Optional)</Label>
                    <Textarea
                        id="notes"
                        value={notes}
                        onChange={(e) => onNotesChange(e.target.value)}
                        placeholder="Additional observations or special conditions..."
                        rows={3}
                    />
                </div>
            </CardContent>
        </Card>
    );
}
