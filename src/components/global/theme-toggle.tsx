// src/components/layout/theme-toggle.tsx (UPDATED)
'use client';

import { Icons } from '@/components/icons/icons';
import { Button } from '@/components/ui/button';
import { useTheme } from 'next-themes';
import * as React from 'react';

interface ThemeToggleProps {
    className?: string;
    fixed?: boolean; // ✅ NEW: Control whether to use fixed positioning
}

export function ThemeToggle({ className = '', fixed = true }: ThemeToggleProps) {
    const { theme, setTheme } = useTheme();
    const [mounted, setMounted] = React.useState(false);

    React.useEffect(() => setMounted(true), []);

    if (!mounted) return null;

    // ✅ Conditional wrapper based on fixed prop
    const buttonElement = (
        <Button
            variant="ghost"
            size="icon"
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} theme`}
            className={className}
        >
            {theme === 'dark' ? (
                <Icons.Sun className="text-yellow-500 size-6 transition-all" />
            ) : (
                <Icons.Moon className="text-gray-700 size-6 transition-all" />
            )}
        </Button>
    );

    // ✅ Return with or without fixed positioning wrapper
    if (fixed) {
        return <div className="fixed top-3 right-3 z-50">{buttonElement}</div>;
    }

    return buttonElement;
}
