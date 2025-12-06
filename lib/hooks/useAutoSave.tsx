/**
 * Auto-save hook for long forms
 * Automatically saves form data to localStorage with debouncing
 */

'use client';

import { useEffect, useState, useCallback, useRef } from 'react';
import { toast } from 'sonner';

interface UseAutoSaveOptions<T> {
    key: string;
    data: T;
    enabled?: boolean;
    debounceMs?: number;
    onSave?: (data: T) => void;
    onRestore?: (data: T) => void;
}

interface AutoSaveState {
    lastSaved: Date | null;
    isDirty: boolean;
}

export function useAutoSave<T>({
    key,
    data,
    enabled = true,
    debounceMs = 2000,
    onSave,
    onRestore
}: UseAutoSaveOptions<T>) {
    const [state, setState] = useState<AutoSaveState>({
        lastSaved: null,
        isDirty: false
    });

    const timeoutRef = useRef<NodeJS.Timeout>();
    const storageKey = `autosave_${key}`;

    // Restore saved data on mount
    useEffect(() => {
        if (!enabled) return;

        try {
            const saved = localStorage.getItem(storageKey);
            if (saved) {
                const parsed = JSON.parse(saved);
                onRestore?.(parsed.data);
                setState({
                    lastSaved: new Date(parsed.timestamp),
                    isDirty: false
                });
            }
        } catch (error) {
            console.error('Failed to restore auto-saved data:', error);
        }
    }, [storageKey, enabled]); // Only run on mount

    // Auto-save with debouncing
    useEffect(() => {
        if (!enabled) return;

        // Clear existing timeout
        if (timeoutRef.current) {
            clearTimeout(timeoutRef.current);
        }

        // Set dirty flag
        setState(prev => ({ ...prev, isDirty: true }));

        // Debounce save
        timeoutRef.current = setTimeout(() => {
            try {
                const saveData = {
                    data,
                    timestamp: new Date().toISOString()
                };
                localStorage.setItem(storageKey, JSON.stringify(saveData));

                setState({
                    lastSaved: new Date(),
                    isDirty: false
                });

                onSave?.(data);
            } catch (error) {
                console.error('Failed to auto-save data:', error);
                toast.error('Failed to auto-save draft');
            }
        }, debounceMs);

        return () => {
            if (timeoutRef.current) {
                clearTimeout(timeoutRef.current);
            }
        };
    }, [data, enabled, debounceMs, storageKey]);

    // Clear saved data
    const clearSaved = useCallback(() => {
        try {
            localStorage.removeItem(storageKey);
            setState({ lastSaved: null, isDirty: false });
            toast.success('Draft cleared');
        } catch (error) {
            console.error('Failed to clear saved data:', error);
        }
    }, [storageKey]);

    return {
        ...state,
        clearSaved
    };
}

/**
 * Auto-save indicator component
 */
interface AutoSaveIndicatorProps {
    lastSaved: Date | null;
    isDirty: boolean;
}

export function AutoSaveIndicator({ lastSaved, isDirty }: AutoSaveIndicatorProps) {
    const getTimeSince = (date: Date) => {
        const seconds = Math.floor((Date.now() - date.getTime()) / 1000);
        if (seconds < 60) return 'just now';
        if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
        return `${Math.floor(seconds / 3600)}h ago`;
    };

    if (isDirty) {
        return (
            <span className= "text-xs text-amber-400 flex items-center gap-1" >
            <span className="inline-block h-2 w-2 rounded-full bg-amber-400 animate-pulse" />
                Saving...
        </span>
        );
    }

    if (lastSaved) {
        return (
            <span className= "text-xs text-emerald-400 flex items-center gap-1" >
            <span className="inline-block h-2 w-2 rounded-full bg-emerald-400" />
                Saved { getTimeSince(lastSaved) }
        </span>
        );
    }

    return null;
}
