// src/hooks/usePerformanceTracking.ts
"use client";

import { useCallback } from "react";
import { performanceTracker } from "@/modules/PerformanceTracker";
import {
    usePerformance,
    ExtendedPerformanceEntry,
} from "@/contexts/PerformanceContext";
import { logger } from "@/modules/Logger";
import { loglog } from "@/modules/log-log";

interface UsePerformanceTrackingReturn {
    trackOperation: <T>(
        name: string,
        operation: () => Promise<T>,
        queryId?: string,
        category?: "transcription" | "api" | "ui" | "system",
    ) => Promise<T>;
    markMilestone: (
        message: string,
        category?: "transcription" | "api" | "ui" | "system",
    ) => void;
    startTimer: (
        name: string,
        category?: "transcription" | "api" | "ui" | "system",
    ) => void;
    endTimer: (name: string, queryId?: string) => number | null;
    logFlowSummary: (flowName: string, metrics: string[]) => void;
}

export const usePerformanceTracking = (): UsePerformanceTrackingReturn => {
    const { addEntry } = usePerformance();

    const trackOperation = useCallback(
        async <T>(
            name: string,
            operation: () => Promise<T>,
            queryId?: string,
            category: "transcription" | "api" | "ui" | "system" = "api",
        ): Promise<T> => {
            const timerName = queryId ? `${name}_${queryId}` : name;
            const startTime = performance.now();

            performanceTracker.startTimer(timerName, category);

            if (queryId) {
                logger.info(
                    `[usePerformanceTracking][${queryId}] 🚀 Starting ${name}`,
                );
                loglog.info(`Starting ${name}`, queryId);
            } else {
                logger.info(`[usePerformanceTracking] 🚀 Starting ${name}`);
            }

            try {
                const result = await operation();

                const endTime = performance.now();
                const duration = endTime - startTime;

                performanceTracker.endTimer(timerName);

                if (queryId) {
                    logger.performance(
                        `[usePerformanceTracking][${queryId}] ✅ ${name} completed in ${duration.toFixed(
                            2,
                        )}ms`,
                    );
                    loglog.performance(
                        `${name} completed in ${duration.toFixed(2)}ms`,
                        queryId,
                    );

                    // Add to performance context
                    const entry: ExtendedPerformanceEntry = {
                        name,
                        duration,
                        startTime,
                        endTime,
                        queryId,
                    };
                    addEntry(entry);
                } else {
                    logger.performance(
                        `[usePerformanceTracking] ✅ ${name} completed in ${duration.toFixed(
                            2,
                        )}ms`,
                    );
                }

                return result;
            } catch (error) {
                const endTime = performance.now();
                const duration = endTime - startTime;

                performanceTracker.endTimer(timerName);

                const errorMessage =
                    error instanceof Error ? error.message : "Unknown error";

                if (queryId) {
                    logger.error(
                        `[usePerformanceTracking][${queryId}] ❌ ${name} failed after ${duration.toFixed(
                            2,
                        )}ms: ${errorMessage}`,
                    );
                    loglog.error(
                        `${name} failed after ${duration.toFixed(
                            2,
                        )}ms: ${errorMessage}`,
                        queryId,
                    );
                } else {
                    logger.error(
                        `[usePerformanceTracking] ❌ ${name} failed after ${duration.toFixed(
                            2,
                        )}ms: ${errorMessage}`,
                    );
                }

                throw error;
            }
        },
        [addEntry],
    );

    const markMilestone = useCallback(
        (
            message: string,
            category: "transcription" | "api" | "ui" | "system" = "system",
        ) => {
            performanceTracker.logMilestone(message, category);
            logger.info(`[usePerformanceTracking] 🎯 Milestone: ${message}`);
        },
        [],
    );

    const startTimer = useCallback(
        (
            name: string,
            category: "transcription" | "api" | "ui" | "system" = "system",
        ) => {
            performanceTracker.startTimer(name, category);
            logger.debug(`[usePerformanceTracking] ⏱️ Started timer: ${name}`);
        },
        [],
    );

    const endTimer = useCallback(
        (name: string, queryId?: string): number | null => {
            const duration = performanceTracker.endTimer(name);

            if (duration !== null) {
                if (queryId) {
                    logger.debug(
                        `[usePerformanceTracking][${queryId}] ⏱️ Timer ${name}: ${duration.toFixed(
                            2,
                        )}ms`,
                    );

                    // Add to performance context
                    const entry: ExtendedPerformanceEntry = {
                        name,
                        duration,
                        startTime: performance.now() - duration,
                        endTime: performance.now(),
                        queryId,
                    };
                    addEntry(entry);
                } else {
                    logger.debug(
                        `[usePerformanceTracking] ⏱️ Timer ${name}: ${duration.toFixed(
                            2,
                        )}ms`,
                    );
                }
            }

            return duration;
        },
        [addEntry],
    );

    const logFlowSummary = useCallback(
        (flowName: string, metrics: string[]) => {
            performanceTracker.logFlowSummary(flowName, metrics);
            logger.info(
                `[usePerformanceTracking] 📊 Flow summary logged for: ${flowName}`,
            );
        },
        [],
    );

    return {
        trackOperation,
        markMilestone,
        startTimer,
        endTimer,
        logFlowSummary,
    };
};
