// src/components/global/PerformanceProfiler.tsx
'use client';

import { Profiler, ProfilerOnRenderCallback } from 'react';

interface PerformanceProfilerProps {
    children: React.ReactNode;
    id?: string;
    disabled?: boolean;
}

export const PerformanceProfiler: React.FC<PerformanceProfilerProps> = ({
    children,
    id = 'MainApp',
    disabled = false,
}) => {
    const onRenderCallback: ProfilerOnRenderCallback = (
        id,
        phase,
        actualDuration,
        baseDuration,
        startTime,
        commitTime
    ) => {
        // Only log in development and if duration is significant
        if (process.env.NODE_ENV === 'development' && actualDuration > 1) {
            // Color-coded console output for easier reading
            const color = actualDuration > 16 ? '🔴' : actualDuration > 8 ? '🟡' : '🟢';
            const phaseIcon = phase === 'mount' ? '🚀' : phase === 'nested-update' ? '🔁' : '🔄';

            console.log(`${color} ${phaseIcon} ${id} ${phase}:`, {
                actualDuration: `${actualDuration.toFixed(2)}ms`,
                baseDuration: `${baseDuration.toFixed(2)}ms`,
                efficiency: `${((baseDuration / actualDuration) * 100).toFixed(1)}%`,
                startTime: `${startTime.toFixed(2)}ms`,
                commitTime: `${commitTime.toFixed(2)}ms`,
            });

            // Log warning for slow renders
            if (actualDuration > 16) {
                console.warn(`⚠️ Slow render detected in ${id}: ${actualDuration.toFixed(2)}ms`);
            }
        }
    };

    // If disabled (e.g., in production), just return children without profiling
    if (disabled || process.env.NODE_ENV === 'production') {
        return <>{children}</>;
    }

    return (
        <Profiler id={id} onRender={onRenderCallback}>
            {children}
        </Profiler>
    );
};
