/**
 * Reusable Loading State Components
 * Provides consistent loading UX across the application
 */

import { Skeleton } from '@/components/ui/skeleton';
import { Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

// ============================================================================
// SPINNER LOADING
// ============================================================================

interface LoadingSpinnerProps {
    size?: 'sm' | 'md' | 'lg';
    text?: string;
    className?: string;
}

export function LoadingSpinner({ size = 'md', text, className }: LoadingSpinnerProps) {
    const sizeClasses = {
        sm: 'h-4 w-4',
        md: 'h-8 w-8',
        lg: 'h-12 w-12'
    };

    return (
        <div className={cn('flex flex-col items-center justify-center gap-3 py-8', className)}>
            <Loader2 className={cn('animate-spin text-slate-400', sizeClasses[size])} />
            {text && <p className="text-sm text-slate-500">{text}</p>}
        </div>
    );
}

// ============================================================================
// TABLE SKELETON
// ============================================================================

interface TableSkeletonProps {
    rows?: number;
    columns?: number;
}

export function TableSkeleton({ rows = 5, columns = 4 }: TableSkeletonProps) {
    return (
        <div className="space-y-3">
            {/* Header */}
            <div className="grid gap-4" style={{ gridTemplateColumns: `repeat(${columns}, 1fr)` }}>
                {Array.from({ length: columns }).map((_, i) => (
                    <Skeleton key={`header-${i}`} className="h-8 w-full" />
                ))}
            </div>
            {/* Rows */}
            {Array.from({ length: rows }).map((_, rowIndex) => (
                <div
                    key={`row-${rowIndex}`}
                    className="grid gap-4"
                    style={{ gridTemplateColumns: `repeat(${columns}, 1fr)` }}
                >
                    {Array.from({ length: columns }).map((_, colIndex) => (
                        <Skeleton key={`cell-${rowIndex}-${colIndex}`} className="h-12 w-full" />
                    ))}
                </div>
            ))}
        </div>
    );
}

// ============================================================================
// FORM SKELETON
// ============================================================================

export function FormSkeleton() {
    return (
        <div className="space-y-6">
            {/* Field 1 */}
            <div className="space-y-2">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-10 w-full" />
            </div>
            {/* Field 2 */}
            <div className="space-y-2">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-10 w-full" />
            </div>
            {/* Field 3 - Grid */}
            <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                    <Skeleton className="h-4 w-20" />
                    <Skeleton className="h-10 w-full" />
                </div>
                <div className="space-y-2">
                    <Skeleton className="h-4 w-20" />
                    <Skeleton className="h-10 w-full" />
                </div>
            </div>
            {/* Textarea */}
            <div className="space-y-2">
                <Skeleton className="h-4 w-28" />
                <Skeleton className="h-24 w-full" />
            </div>
            {/* Buttons */}
            <div className="flex gap-2 justify-end">
                <Skeleton className="h-10 w-24" />
                <Skeleton className="h-10 w-24" />
            </div>
        </div>
    );
}

// ============================================================================
// CARD GRID SKELETON
// ============================================================================

interface CardGridSkeletonProps {
    count?: number;
    columns?: 2 | 3 | 4;
}

export function CardGridSkeleton({ count = 6, columns = 3 }: CardGridSkeletonProps) {
    const gridCols = {
        2: 'md:grid-cols-2',
        3: 'md:grid-cols-3',
        4: 'md:grid-cols-4'
    };

    return (
        <div className={cn('grid gap-4', gridCols[columns])}>
            {Array.from({ length: count }).map((_, i) => (
                <div key={i} className="border border-slate-800 rounded-lg p-4 space-y-3 bg-slate-900">
                    <Skeleton className="h-6 w-3/4" />
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-5/6" />
                    <div className="flex gap-2 pt-2">
                        <Skeleton className="h-8 w-20" />
                        <Skeleton className="h-8 w-20" />
                    </div>
                </div>
            ))}
        </div>
    );
}

// ============================================================================
// DASHBOARD SKELETON
// ============================================================================

export function DashboardSkeleton() {
    return (
        <div className="space-y-6">
            {/* KPI Cards */}
            <div className="grid gap-4 md:grid-cols-3">
                {[1, 2, 3].map(i => (
                    <Skeleton key={i} className="h-32" />
                ))}
            </div>
            {/* Chart */}
            <Skeleton className="h-80 w-full" />
            {/* Table */}
            <div className="space-y-3">
                <Skeleton className="h-8 w-48" />
                <TableSkeleton rows={5} columns={4} />
            </div>
        </div>
    );
}

// ============================================================================
// INLINE LOADING (for buttons)
// ============================================================================

interface InlineLoadingProps {
    text?: string;
}

export function InlineLoading({ text = 'Loading...' }: InlineLoadingProps) {
    return (
        <span className="flex items-center gap-2">
            <Loader2 className="h-4 w-4 animate-spin" />
            {text}
        </span>
    );
}

// ============================================================================
// EMPTY STATE
// ============================================================================

interface EmptyStateProps {
    icon?: React.ReactNode;
    title: string;
    description?: string;
    action?: React.ReactNode;
}

export function EmptyState({ icon, title, description, action }: EmptyStateProps) {
    return (
        <div className="flex flex-col items-center justify-center py-12 text-center">
            {icon && <div className="mb-4 text-slate-600">{icon}</div>}
            <h3 className="text-lg font-medium text-slate-200">{title}</h3>
            {description && <p className="mt-2 text-sm text-slate-500 max-w-md">{description}</p>}
            {action && <div className="mt-6">{action}</div>}
        </div>
    );
}
