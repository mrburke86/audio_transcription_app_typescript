// src/hooks/useRenderDiagnostics.ts - OPTIMIZED VERSION
import { logger } from '@/lib/Logger';
import { useEffect, useRef } from 'react';

interface PerformanceMemory {
    usedJSHeapSize: number;
    totalJSHeapSize: number;
    jsHeapSizeLimit: number;
}

declare global {
    interface Performance {
        memory?: PerformanceMemory;
    }
}

interface DiagnosticsOptions {
    logProps?: boolean;
    logDuration?: boolean;
    logDeps?: { name: string; deps: any[] }[];
    logMemory?: boolean;
    logStack?: boolean;
    thresholdRenders?: number;
    thresholdDuration?: number;
}

export const useRenderDiagnostics = (componentName: string, options: DiagnosticsOptions = {}, props?: any) => {
    if (process.env.NODE_ENV !== 'development') return;

    const renderCount = useRef(0);
    const prevProps = useRef(props);
    const prevDeps = useRef(options.logDeps?.map(effect => ({ ...effect })) || []);
    const prevMemory = useRef(performance.memory?.usedJSHeapSize || 0);
    const startTime = useRef(performance.now());
    const lastSignificantLog = useRef(0);

    renderCount.current++;
    startTime.current = performance.now();

    // 🎯 SMART LOGGING - Only log significant events
    const shouldLogThisRender =
        renderCount.current === 1 || // First render
        renderCount.current % 20 === 0 || // Every 20th render
        (options.thresholdRenders && renderCount.current > options.thresholdRenders);

    if (shouldLogThisRender) {
        logger.debug(`🧮 ${componentName} render #${renderCount.current}`);
    }

    // 🔄 PROP CHANGES - Only log meaningful changes
    if (options.logProps && props && prevProps.current && shouldLogThisRender) {
        const significantChanges = Object.keys(props).reduce(
            (acc, key) => {
                const oldVal = prevProps.current[key];
                const newVal = props[key];

                // Only log if values are different and non-trivial
                if (
                    oldVal !== newVal &&
                    ((typeof newVal !== 'function' && typeof newVal !== 'object') ||
                        JSON.stringify(oldVal) !== JSON.stringify(newVal))
                ) {
                    acc[key] = { prev: oldVal, new: newVal };
                }
                return acc;
            },
            {} as Record<string, { prev: any; new: any }>
        );

        if (Object.keys(significantChanges).length > 0) {
            logger.debug(`🔄 ${componentName} significant prop changes:`, significantChanges);
        }
    }

    // 🔗 DEPENDENCY CHANGES - Focused logging
    if (options.logDeps && shouldLogThisRender) {
        const changedDeps = options.logDeps.filter((effect, i) => {
            const prev = prevDeps.current[i];
            return prev && !effect.deps.every((dep, j) => dep === prev.deps[j]);
        });

        if (changedDeps.length > 0) {
            changedDeps.forEach(effect => {
                logger.debug(`🔗 ${componentName} ${effect.name} dependencies changed`);
            });
        }
    }

    // 🧠 MEMORY - Only on significant changes
    if (options.logMemory && performance.memory) {
        const current = performance.memory.usedJSHeapSize;
        const delta = current - prevMemory.current;

        // Only log memory changes > 1MB
        if (Math.abs(delta) > 1024 * 1024) {
            const direction = delta > 0 ? '+' : '';
            logger.performance(`🧠 ${componentName} memory ${direction}${(delta / 1024 / 1024).toFixed(2)}MB`);
        }
    }

    // 📚 STACK TRACE - Only for problematic renders
    if (options.logStack && renderCount.current > (options.thresholdRenders || 50)) {
        const stack = new Error().stack?.split('\n').slice(3, 8).join('\n') || '';
        logger.debug(`📚 ${componentName} render stack (${renderCount.current} renders):\n${stack}`);
    }

    useEffect(() => {
        const duration = performance.now() - startTime.current;

        // 🎯 DURATION LOGGING - Smart thresholds
        if (options.logDuration) {
            const isSlowRender = duration > (options.thresholdDuration || 10);
            const shouldLogDuration =
                renderCount.current === 1 || // First render
                isSlowRender || // Slow renders
                renderCount.current % 50 === 0; // Periodic samples

            if (shouldLogDuration) {
                const logLevel = isSlowRender ? 'warning' : 'performance';
                const message = `⏱️ ${componentName} render: ${duration.toFixed(2)}ms`;

                if (isSlowRender) {
                    logger.warning(`🐌 ${message} (slow render detected)`);
                } else {
                    logger.performance(message);
                }
            }
        }

        // 🚨 THRESHOLD WARNINGS - Consolidated alerts
        const now = performance.now();
        const timeSinceLastAlert = now - lastSignificantLog.current;

        if (options.thresholdRenders && renderCount.current > options.thresholdRenders && timeSinceLastAlert > 5000) {
            // Throttle alerts to every 5 seconds

            logger.warning(
                `🚨 ${componentName} high render count: ${renderCount.current} renders 
                (threshold: ${options.thresholdRenders})`
            );
            lastSignificantLog.current = now;
        }

        // 📝 UPDATE REFS
        prevProps.current = props;
        if (options.logDeps) {
            prevDeps.current = options.logDeps.map(effect => ({ ...effect }));
        }
        if (options.logMemory && performance.memory) {
            prevMemory.current = performance.memory.usedJSHeapSize;
        }
    });
};
