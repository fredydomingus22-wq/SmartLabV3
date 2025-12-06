/**
 * Keyboard shortcuts hook
 * Provides consistent keyboard shortcuts across the application
 */

'use client';

import { useEffect, useCallback } from 'react';

export type KeyCombo = string; // e.g., 'ctrl+s', 'ctrl+k', 'esc'

interface UseKeyboardShortcutsOptions {
    shortcuts: Record<KeyCombo, () => void>;
    enabled?: boolean;
}

/**
 * Parse key combination string into modifiers and key
 */
function parseKeyCombo(combo: string): {
    ctrl: boolean;
    shift: boolean;
    alt: boolean;
    meta: boolean;
    key: string;
} {
    const parts = combo.toLowerCase().split('+');
    const key = parts[parts.length - 1];

    return {
        ctrl: parts.includes('ctrl'),
        shift: parts.includes('shift'),
        alt: parts.includes('alt'),
        meta: parts.includes('meta') || parts.includes('cmd'),
        key
    };
}

/**
 * Check if keyboard event matches key combination
 */
function matchesCombo(event: KeyboardEvent, combo: string): boolean {
    const parsed = parseKeyCombo(combo);

    return (
        event.key.toLowerCase() === parsed.key &&
        event.ctrlKey === parsed.ctrl &&
        event.shiftKey === parsed.shift &&
        event.altKey === parsed.alt &&
        event.metaKey === parsed.meta
    );
}

/**
 * Hook to register keyboard shortcuts
 */
export function useKeyboardShortcuts({ shortcuts, enabled = true }: UseKeyboardShortcutsOptions) {
    const handleKeyDown = useCallback((event: KeyboardEvent) => {
        if (!enabled) return;

        // Don't trigger shortcuts when user is typing in input fields
        const target = event.target as HTMLElement;
        if (
            target.tagName === 'INPUT' ||
            target.tagName === 'TEXTAREA' ||
            target.isContentEditable
        ) {
            // Exception: allow Escape and Ctrl+S in input fields
            if (event.key !== 'Escape' && !matchesCombo(event, 'ctrl+s')) {
                return;
            }
        }

        // Check each registered shortcut
        for (const [combo, handler] of Object.entries(shortcuts)) {
            if (matchesCombo(event, combo)) {
                event.preventDefault();
                handler();
                break;
            }
        }
    }, [shortcuts, enabled]);

    useEffect(() => {
        if (!enabled) return;

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [handleKeyDown, enabled]);
}

/**
 * Global keyboard shortcuts
 */
export const GLOBAL_SHORTCUTS = {
    SAVE: 'ctrl+s',
    SEARCH: 'ctrl+k',
    CLOSE: 'esc',
    NEW: 'ctrl+n',
    REFRESH: 'ctrl+r',
    HELP: '?',
} as const;

/**
 * Display keyboard shortcut hint
 */
interface KeyboardShortcutHintProps {
    combo: string;
    className?: string;
}

export function KeyboardShortcutHint({ combo, className = '' }: KeyboardShortcutHintProps) {
    const keys = combo.split('+').map(k => {
        const keyMap: Record<string, string> = {
            ctrl: '⌃',
            shift: '⇧',
            alt: '⌥',
            meta: '⌘',
            cmd: '⌘',
            enter: '↵',
            esc: '⎋',
            backspace: '⌫',
            delete: '⌦',
        };
        return keyMap[k.toLowerCase()] || k.toUpperCase();
    });

    return (
        <span className= {`inline-flex items-center gap-1 text-xs ${className}`
}>
{
    keys.map((key, i) => (
        <kbd
                    key= { i }
                    className = "px-2 py-1 bg-slate-800 border border-slate-700 rounded text-slate-300 font-mono"
        >
        { key }
        </kbd>
    ))
}
    </span>
    );
}
