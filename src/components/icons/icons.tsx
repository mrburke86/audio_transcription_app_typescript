// src/components/icons/icons.tsx
'use client';

import { cn } from '@/lib/utils';
import * as React from 'react';

type IconProps = React.SVGProps<SVGSVGElement>;

// IconMoon can remain an internal component or be defined directly in the Icons object
function MoonIcon({ className, ...props }: IconProps) {
    // Renamed for clarity if exported under Icons.Moon
    return (
        <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 256 256"
            fill="currentColor"
            className={cn('size-4', className)} // Default size, can be overridden
            {...props}
        >
            <path d="M233.54 142.23a8 8 0 0 0-8-2 88.08 88.08 0 0 1-109.8-109.8 8 8 0 0 0-10-10 104.84 104.84 0 0 0-52.91 37A104 104 0 0 0 136 224a103.09 103.09 0 0 0 62.52-20.88 104.84 104.84 0 0 0 37-52.91 8 8 0 0 0-1.98-7.98Zm-44.64 48.11A88 88 0 0 1 65.66 67.11a89 89 0 0 1 31.4-26A106 106 0 0 0 96 56a104.11 104.11 0 0 0 104 104 106 106 0 0 0 14.92-1.06 89 89 0 0 1-26.02 31.4Z" />
        </svg>
    );
}

// IconSun can remain an internal component or be defined directly in the Icons object
function SunIcon({ className, ...props }: IconProps) {
    // Renamed for clarity
    return (
        <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 256 256"
            fill="currentColor"
            className={cn('size-4', className)} // Default size, can be overridden
            {...props}
        >
            <path d="M120 40V16a8 8 0 0 1 16 0v24a8 8 0 0 1-16 0Zm72 88a64 64 0 1 1-64-64 64.07 64.07 0 0 1 64 64Zm-16 0a48 48 0 1 0-48 48 48.05 48.05 0 0 0 48-48ZM58.34 69.66a8 8 0 0 0 11.32-11.32l-16-16a8 8 0 0 0-11.32 11.32Zm0 116.68-16 16a8 8 0 0 0 11.32 11.32l16-16a8 8 0 0 0-11.32-11.32ZM192 72a8 8 0 0 0 5.66-2.34l16-16a8 8 0 0 0-11.32-11.32l-16 16A8 8 0 0 0 192 72Zm5.66 114.34a8 8 0 0 0-11.32 11.32l16 16a8 8 0 0 0 11.32-11.32ZM48 128a8 8 0 0 0-8-8H16a8 8 0 0 0 0 16h24a8 8 0 0 0 8-8Zm80 80a8 8 0 0 0-8 8v24a8 8 0 0 0 16 0v-24a8 8 0 0 0-8-8Zm112-88h-24a8 8 0 0 0 0 16h24a8 8 0 0 0 0-16Z" />
        </svg>
    );
}

// Export all icons as properties of a single 'Icons' object
export const Icons = {
    Moon: MoonIcon,
    Sun: SunIcon,
    Library: ({ className, ...props }: IconProps) => <svg className={cn('size-4', className)} {...props}></svg>,
    LoaderCircle: ({ className, ...props }: IconProps) => (
        <svg className={cn('size-4 animate-spin', className)} {...props}></svg>
    ),
    AlertTriangle: ({ className, ...props }: IconProps) => <svg className={cn('size-4', className)} {...props}></svg>,
    CheckCircle: ({ className, ...props }: IconProps) => <svg className={cn('size-4', className)} {...props}></svg>,
};
