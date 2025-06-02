// src/components/layout/theme-toggle.tsx
'use client';

import * as React from 'react';
import { useTheme } from 'next-themes';
import { Button } from '@/components/ui/button';
import { Icons } from '@/components/icons/icons'; // Cleaner import

export function ThemeToggle() {
    const { theme, setTheme } = useTheme();
    const [mounted, setMounted] = React.useState(false);

    React.useEffect(() => setMounted(true), []);

    if (!mounted) return null;

    return (
        <div className="fixed top-3 right-3 z-50 ">
            <Button
                variant="ghost"
                size="icon"
                onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} theme`}
            >
                {theme === 'dark' ? (
                    <Icons.Sun className="text-yellow-500 size-6 transition-all" />
                ) : (
                    // <Sun className="h-5 w-5 transition-all" />
                    <Icons.Moon className="text-gray-700 size-6 transition-all" />

                    // <Moon className="h-5 w-5 transition-all" />
                )}
            </Button>
        </div>
    );
}
