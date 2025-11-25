"use client"

import * as React from "react";
import { cn } from "@/lib/utils";

export interface SwitchProps extends React.ComponentPropsWithoutRef<'input'> {
    /**
     * The id of the switch. Required for accessibility.
     */
    id: string;
    /**
     * Checked state of the switch.
     */
    checked: boolean;
    /**
     * Callback when the checked state changes.
     */
    onCheckedChange?: (checked: boolean) => void;
}

/**
 * A simple, premium switch component.
 * Uses a hidden checkbox with a styled label to create a toggle.
 */
export const Switch = React.forwardRef<HTMLInputElement, SwitchProps>(
    ({ className, id, checked, onCheckedChange, ...props }, ref) => {
        const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
            onCheckedChange?.(e.target.checked);
        };
        return (
            <div className={cn("flex items-center", className)}>
                <input
                    id={id}
                    type="checkbox"
                    role="switch"
                    checked={checked}
                    onChange={handleChange}
                    className="sr-only"
                    ref={ref}
                    {...props}
                />
                <label
                    htmlFor={id}
                    className={cn(
                        "relative inline-flex h-5 w-9 cursor-pointer rounded-full transition-colors",
                        checked ? "bg-emerald-500" : "bg-slate-400"
                    )}
                >
                    <span
                        className={cn(
                            "inline-block h-4 w-4 transform rounded-full bg-white transition",
                            checked ? "translate-x-4" : "translate-x-0"
                        )}
                    />
                </label>
            </div>
        );
    }
);

Switch.displayName = "Switch";
