// src/stores/middlewares/notificationMiddleware.ts
import { StateCreator } from 'zustand';
import { AppState } from '@/types/store';
import { logger } from '@/modules';

/**
 * Notification Middleware - Handles cross-slice notifications in a decoupled way
 *
 * ✅ FEATURES:
 * - Automatic error notifications for slice operations
 * - Success notifications for major operations
 * - Loading state integration
 * - Prevents direct cross-slice dependencies
 */

// ✅ ADDED: Notification event types
export interface NotificationEvent {
    type: 'success' | 'error' | 'warning' | 'info';
    message: string;
    duration?: number;
    source: string; // Which slice/operation triggered this
    category?: 'operation' | 'error' | 'status' | 'user-action';
}

// ✅ ADDED: Internal notification queue to prevent infinite loops
let notificationQueue: NotificationEvent[] = [];
let isProcessingQueue = false;

/**
 * Process queued notifications asynchronously to prevent state update conflicts
 */
const processNotificationQueue = async () => {
    if (isProcessingQueue || notificationQueue.length === 0) return;

    isProcessingQueue = true;

    while (notificationQueue.length > 0) {
        const event = notificationQueue.shift();
        if (event) {
            // Use setTimeout to ensure this runs after current state updates
            setTimeout(() => {
                try {
                    // Get fresh state reference
                    const store = (globalThis as any).__appStore?.getState?.();
                    if (store?.addNotification) {
                        store.addNotification({
                            type: event.type,
                            message: event.message,
                            duration: event.duration,
                        });

                        logger.debug(
                            `[NotificationMiddleware] Processed notification from ${event.source}: ${event.message}`
                        );
                    }
                } catch (error) {
                    logger.error('[NotificationMiddleware] Error processing notification:', error);
                }
            }, 0);
        }
    }

    isProcessingQueue = false;
};

/**
 * Queue a notification to be processed asynchronously
 */
export const queueNotification = (event: NotificationEvent) => {
    notificationQueue.push(event);
    processNotificationQueue();
};

/**
 * Notification middleware that intercepts state changes and generates appropriate notifications
 */
export const notificationMiddleware =
    <T extends AppState>(config: StateCreator<T>): StateCreator<T> =>
    (set, get, api) => {
        const wrappedSet: typeof set = (partial, replace) => {
            const prevState = get();

            // Call original set
            const result =
                replace === true
                    ? set(partial as T | ((state: T) => T), true)
                    : set(partial as T | Partial<T> | ((state: T) => T | Partial<T>), replace as false | undefined);

            const newState = get();

            // ✅ ADDED: Auto-generate notifications based on state changes
            try {
                // Knowledge slice notifications
                if (prevState.isLoading !== newState.isLoading) {
                    if (!newState.isLoading && prevState.error !== newState.error) {
                        if (newState.error) {
                            queueNotification({
                                type: 'error',
                                message: `Knowledge operation failed: ${newState.error}`,
                                source: 'KnowledgeSlice',
                                category: 'error',
                                duration: 8000,
                            });
                        } else if (newState.indexedDocumentsCount > prevState.indexedDocumentsCount) {
                            queueNotification({
                                type: 'success',
                                message: `Knowledge base updated: ${newState.indexedDocumentsCount} documents indexed`,
                                source: 'KnowledgeSlice',
                                category: 'operation',
                                duration: 5000,
                            });
                        }
                    }
                }

                // LLM slice notifications
                if (prevState.llmError !== newState.llmError && newState.llmError) {
                    queueNotification({
                        type: 'error',
                        message: `AI operation failed: ${newState.llmError}`,
                        source: 'LLMSlice',
                        category: 'error',
                        duration: 8000,
                    });
                }

                if (prevState.isGenerating && !newState.isGenerating && !newState.llmError) {
                    if (
                        newState.conversationSuggestions.powerUpContent !==
                        prevState.conversationSuggestions.powerUpContent
                    ) {
                        queueNotification({
                            type: 'success',
                            message: 'Strategic intelligence generated successfully',
                            source: 'LLMSlice',
                            category: 'operation',
                            duration: 3000,
                        });
                    }
                }

                // Speech slice notifications
                if (prevState.speechError !== newState.speechError && newState.speechError) {
                    queueNotification({
                        type: 'error',
                        message: `Speech recognition error: ${newState.speechError}`,
                        source: 'SpeechSlice',
                        category: 'error',
                        duration: 5000,
                    });
                }

                if (prevState.recognitionStatus !== newState.recognitionStatus) {
                    if (newState.recognitionStatus === 'active') {
                        queueNotification({
                            type: 'info',
                            message: 'Speech recognition started',
                            source: 'SpeechSlice',
                            category: 'status',
                            duration: 2000,
                        });
                    } else if (newState.recognitionStatus === 'inactive' && prevState.recognitionStatus === 'active') {
                        queueNotification({
                            type: 'info',
                            message: 'Speech recognition stopped',
                            source: 'SpeechSlice',
                            category: 'status',
                            duration: 2000,
                        });
                    }
                }

                // Global loading notifications
                if (prevState.globalLoading?.isActive !== newState.globalLoading?.isActive) {
                    if (newState.globalLoading?.isActive && newState.globalLoading?.message) {
                        logger.info(
                            `[NotificationMiddleware] Global loading started: ${newState.globalLoading.message}`
                        );
                    } else if (!newState.globalLoading?.isActive && prevState.globalLoading?.isActive) {
                        logger.info(`[NotificationMiddleware] Global loading stopped`);
                    }
                }
            } catch (error) {
                logger.error('[NotificationMiddleware] Error in notification generation:', error);
            }

            return result;
        };

        return config(wrappedSet, get, api);
    };

/**
 * ✅ ADDED: Helper functions for slices to trigger notifications without direct dependencies
 */
export const NotificationHelpers = {
    /**
     * Trigger a success notification
     */
    success: (message: string, source: string, duration = 5000) => {
        queueNotification({
            type: 'success',
            message,
            source,
            category: 'operation',
            duration,
        });
    },

    /**
     * Trigger an error notification
     */
    error: (message: string, source: string, duration = 8000) => {
        queueNotification({
            type: 'error',
            message,
            source,
            category: 'error',
            duration,
        });
    },

    /**
     * Trigger a warning notification
     */
    warning: (message: string, source: string, duration = 6000) => {
        queueNotification({
            type: 'warning',
            message,
            source,
            category: 'operation',
            duration,
        });
    },

    /**
     * Trigger an info notification
     */
    info: (message: string, source: string, duration = 4000) => {
        queueNotification({
            type: 'info',
            message,
            source,
            category: 'status',
            duration,
        });
    },
};
