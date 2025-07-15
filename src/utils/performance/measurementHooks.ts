// src\utils\performance\measurementHooks.ts

import { useCallback, useRef } from 'react';
import { performanceMonitor } from './PerformanceMonitor';

// 1. State Management Race Condition Measurement Hook
export const useStateConsistencyTracker = (componentName: string) => {
    const stateHistory = useRef<Map<string, any>>(new Map());

    const trackStateUpdate = useCallback(
        (stateName: string, value: any) => {
            const previous = stateHistory.current.get(stateName);

            // Check for duplicate state updates
            if (previous !== undefined && JSON.stringify(previous) === JSON.stringify(value)) {
                performanceMonitor.trackDuplicateStateUpdate();
                console.warn(`🔄 Duplicate state update in ${componentName}.${stateName}`);
            }

            stateHistory.current.set(stateName, value);
        },
        [componentName]
    );

    const checkStateConsistency = useCallback((stateA: any, stateB: any, nameA: string, nameB: string) => {
        if (JSON.stringify(stateA) !== JSON.stringify(stateB)) {
            performanceMonitor.trackStateDesync();
            console.error(`❌ State desync: ${nameA} !== ${nameB}`, { stateA, stateB });
            return false;
        }
        return true;
    }, []);

    return { trackStateUpdate, checkStateConsistency };
};

// 2. Memory Leak Detection Hook
export const useMemoryLeakDetection = (componentName: string) => {
    const instanceRefs = useRef<Set<any>>(new Set());

    const registerInstance = useCallback(
        (instance: any) => {
            instanceRefs.current.add(instance);
            performanceMonitor.trackSpeechInstanceCreated();
            console.log(`🎤 Speech instance created in ${componentName} (total: ${instanceRefs.current.size})`);
        },
        [componentName]
    );

    const unregisterInstance = useCallback(
        (instance: any) => {
            instanceRefs.current.delete(instance);
            performanceMonitor.trackSpeechInstanceDestroyed();
            console.log(`🎤 Speech instance destroyed in ${componentName} (total: ${instanceRefs.current.size})`);
        },
        [componentName]
    );

    return { registerInstance, unregisterInstance, activeInstances: instanceRefs.current.size };
};

// 3. Vector Search Performance Measurement
export const useVectorSearchMetrics = () => {
    const measureSearch = useCallback(async <T>(searchFn: () => Promise<T>, useCache: boolean = false): Promise<T> => {
        const startTime = performanceMonitor.trackVectorSearchStart();

        try {
            const result = await searchFn();
            performanceMonitor.trackVectorSearchEnd(startTime, useCache);

            if (useCache) {
                console.log(`🔍 Vector search completed from cache in ${(performance.now() - startTime).toFixed(1)}ms`);
            } else {
                console.log(`🔍 Vector search completed from API in ${(performance.now() - startTime).toFixed(1)}ms`);
            }

            return result;
        } catch (error) {
            performanceMonitor.trackVectorSearchEnd(startTime, false);
            throw error;
        }
    }, []);

    return { measureSearch };
};

// 4. Component Render Optimization Measurement
export const useRenderMetrics = (componentName: string) => {
    const renderCount = useRef(0);
    const lastProps = useRef<any>(null);

    const trackRender = useCallback(
        (props: any) => {
            renderCount.current++;

            // Check if render was necessary
            const wasNecessary =
                lastProps.current === null || JSON.stringify(lastProps.current) !== JSON.stringify(props);

            performanceMonitor.trackComponentRender(wasNecessary);

            if (!wasNecessary) {
                console.warn(`🎨 Unnecessary render in ${componentName} (#${renderCount.current})`);
            }

            lastProps.current = props;
        },
        [componentName]
    );

    return { trackRender, renderCount: renderCount.current };
};

// 5. API Reliability Measurement
export const useAPIReliabilityMetrics = () => {
    const measureAPICall = useCallback(
        async <T>(
            apiCall: () => Promise<T>,
            apiName: string = 'API',
            options?: {
                timeout?: number;
                retries?: number;
                logDetails?: boolean;
            }
        ): Promise<T> => {
            const tracker = performanceMonitor.trackApiRequest();
            const startTime = performance.now();
            const { timeout = 30000, retries = 0, logDetails = true } = options || {};

            let lastError: Error | null = null;

            for (let attempt = 0; attempt <= retries; attempt++) {
                try {
                    // Add timeout wrapper
                    const timeoutPromise = new Promise<never>((_, reject) => {
                        setTimeout(() => reject(new Error(`${apiName} timeout after ${timeout}ms`)), timeout);
                    });

                    const result = await Promise.race([apiCall(), timeoutPromise]);
                    const duration = Math.round(performance.now() - startTime);

                    tracker.success();

                    if (logDetails) {
                        console.log(
                            `✅ ${apiName} call succeeded in ${duration}ms${
                                attempt > 0 ? ` (attempt ${attempt + 1})` : ''
                            }`
                        );
                    }

                    // Track performance metrics
                    performanceMonitor.trackApiLatency(apiName, duration);

                    return result;
                } catch (error) {
                    lastError = error as Error;
                    const duration = Math.round(performance.now() - startTime);

                    if (attempt < retries) {
                        const retryDelay = Math.min(1000 * Math.pow(2, attempt), 5000); // Exponential backoff
                        if (logDetails) {
                            console.warn(
                                `⚠️ ${apiName} failed (attempt ${attempt + 1}), retrying in ${retryDelay}ms:`,
                                error
                            );
                        }
                        await new Promise(resolve => setTimeout(resolve, retryDelay));
                        continue;
                    } else {
                        tracker.failure();
                        if (logDetails) {
                            console.error(
                                `❌ ${apiName} call failed after ${duration}ms${
                                    retries > 0 ? ` (${retries + 1} attempts)` : ''
                                }:`,
                                error
                            );
                        }
                        performanceMonitor.trackApiError(apiName, lastError.message);
                        throw lastError;
                    }
                }
            }

            throw lastError || new Error(`${apiName} failed unexpectedly`);
        },
        []
    );

    return { measureAPICall };
};

// 2. STANDALONE Version (for class methods and non-React contexts)
export const measureAPICall = async <T>(
    apiCall: () => Promise<T>,
    apiName: string = 'API',
    options?: {
        timeout?: number;
        retries?: number;
        logDetails?: boolean;
    }
): Promise<T> => {
    const tracker = performanceMonitor.trackApiRequest();
    const startTime = performance.now();
    const { timeout = 30000, retries = 0, logDetails = true } = options || {};

    let lastError: Error | null = null;

    for (let attempt = 0; attempt <= retries; attempt++) {
        try {
            // Add timeout wrapper
            const timeoutPromise = new Promise<never>((_, reject) => {
                setTimeout(() => reject(new Error(`${apiName} timeout after ${timeout}ms`)), timeout);
            });

            const result = await Promise.race([apiCall(), timeoutPromise]);
            const duration = Math.round(performance.now() - startTime);

            tracker.success();

            if (logDetails) {
                console.log(
                    `✅ ${apiName} call succeeded in ${duration}ms${attempt > 0 ? ` (attempt ${attempt + 1})` : ''}`
                );
            }

            // Track performance metrics
            performanceMonitor.trackApiLatency(apiName, duration);

            return result;
        } catch (error) {
            lastError = error as Error;
            const duration = Math.round(performance.now() - startTime);

            if (attempt < retries) {
                const retryDelay = Math.min(1000 * Math.pow(2, attempt), 5000); // Exponential backoff
                if (logDetails) {
                    console.warn(`⚠️ ${apiName} failed (attempt ${attempt + 1}), retrying in ${retryDelay}ms:`, error);
                }
                await new Promise(resolve => setTimeout(resolve, retryDelay));
                continue;
            } else {
                tracker.failure();
                if (logDetails) {
                    console.error(
                        `❌ ${apiName} call failed after ${duration}ms${
                            retries > 0 ? ` (${retries + 1} attempts)` : ''
                        }:`,
                        error
                    );
                }
                performanceMonitor.trackApiError(apiName, lastError.message);
                throw lastError;
            }
        }
    }

    throw lastError || new Error(`${apiName} failed unexpectedly`);
};

// 6. Simple Performance Dashboard Hook
export const usePerformanceDashboard = () => {
    const exportMetrics = useCallback(() => {
        const metrics = performanceMonitor.exportMetrics();

        // Also download as JSON file
        const dataStr = JSON.stringify(metrics, null, 2);
        const dataBlob = new Blob([dataStr], { type: 'application/json' });
        const url = URL.createObjectURL(dataBlob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `performance-metrics-${Date.now()}.json`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);

        console.log('📊 Performance metrics exported');
        return metrics;
    }, []);

    const resetMetrics = useCallback(() => {
        performanceMonitor.reset();
        console.log('🔄 Performance metrics reset');
    }, []);

    return { exportMetrics, resetMetrics };
};

// 7. Conversation Memory Tracking Hook
export const useConversationMemoryMetrics = (componentName: string = 'Conversation') => {
    const conversationData = useRef<Map<string, any>>(new Map());
    const messageCount = useRef(0);

    const trackConversationGrowth = useCallback(
        (messageId: string, messageData: any) => {
            messageCount.current++;
            conversationData.current.set(messageId, {
                timestamp: Date.now(),
                size: JSON.stringify(messageData).length,
                ...messageData,
            });

            // Monitor memory usage
            const totalSize = Array.from(conversationData.current.values()).reduce(
                (sum, msg) => sum + (msg.size || 0),
                0
            );

            // Warn if conversation is getting large
            if (totalSize > 1024 * 1024) {
                // 1MB
                console.warn(
                    `💾 Large conversation memory in ${componentName}: ${(totalSize / 1024 / 1024).toFixed(2)}MB`
                );
                performanceMonitor.trackMemoryWarning();
            }

            // Track message count milestones
            if (messageCount.current % 50 === 0) {
                console.log(`💬 Conversation milestone in ${componentName}: ${messageCount.current} messages`);
            }
        },
        [componentName]
    );

    const getConversationStats = useCallback(() => {
        const messages = Array.from(conversationData.current.values());
        const totalSize = messages.reduce((sum, msg) => sum + (msg.size || 0), 0);

        return {
            messageCount: messageCount.current,
            totalSizeBytes: totalSize,
            totalSizeMB: (totalSize / 1024 / 1024).toFixed(2),
            oldestMessage: messages.length > 0 ? Math.min(...messages.map(m => m.timestamp)) : null,
            newestMessage: messages.length > 0 ? Math.max(...messages.map(m => m.timestamp)) : null,
        };
    }, []);

    const clearOldMessages = useCallback(
        (maxMessages: number = 100) => {
            if (conversationData.current.size > maxMessages) {
                const sorted = Array.from(conversationData.current.entries()).sort(
                    ([, a], [, b]) => a.timestamp - b.timestamp
                );

                const toRemove = sorted.slice(0, sorted.length - maxMessages);
                toRemove.forEach(([id]) => conversationData.current.delete(id));

                console.log(
                    `🧹 Cleaned old messages in ${componentName}: removed ${toRemove.length}, kept ${maxMessages}`
                );
            }
        },
        [componentName]
    );

    return {
        trackConversationGrowth,
        getConversationStats,
        clearOldMessages,
        currentMessageCount: messageCount.current,
    };
};
