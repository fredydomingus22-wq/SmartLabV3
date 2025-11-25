// design-tokens.ts – central source of UI constants for SmartLabV3
// All components should import from this file via `import { tokens } from '@/components/ui/design-tokens';`

export const tokens = {
    // ==== Colors (HSL palette – dark industrial theme) ====
    colors: {
        // Primary palette – slate series (used throughout the app)
        slate950: 'hsl(215, 20%, 5%)', // background
        slate900: 'hsl(215, 20%, 10%)',
        slate800: 'hsl(215, 20%, 20%)',
        slate700: 'hsl(215, 20%, 30%)',
        slate400: 'hsl(215, 20%, 60%)', // light text / accents
        slate100: 'hsl(215, 20%, 95%)', // bright text
        // State colors
        emerald: 'hsl(150, 70%, 40%)', // success
        amber: 'hsl(45, 100%, 50%)', // warning
        red: 'hsl(0, 80%, 45%)', // error
        sky: 'hsl(200, 80%, 55%)', // info / link
    },

    // ==== Spacing (rem based) ====
    spacing: {
        xs: '0.25rem',
        sm: '0.5rem',
        md: '1rem',
        lg: '1.5rem',
        xl: '2rem',
        '2xl': '3rem',
    },

    // ==== Typography ====
    fontFamily: {
        sans: "Inter, system-ui, sans-serif",
        mono: "\"Courier New\", monospace",
    },
    fontSize: {
        xs: '0.75rem',
        sm: '0.875rem',
        base: '1rem',
        lg: '1.125rem',
        xl: '1.25rem',
        '2xl': '1.5rem',
        '3xl': '1.875rem',
        '4xl': '2.25rem',
        '5xl': '3rem',
    },

    // ==== Border radius ====
    radius: {
        sm: '0.25rem',
        md: '0.5rem',
        lg: '0.75rem',
        full: '9999px',
    },
};


// Example usage in a component (Tailwind + cn utility):
// cn('bg-[${tokens.colors.slate950}] text-[${tokens.colors.slate100}] rounded-[${tokens.radius.md}]')
