// src/stores/hooks/useSelectors.ts
import { logger } from '@/modules';
import { DocumentChunk, Message } from '@/types';
import { debounce } from 'lodash';
import { useEffect, useMemo, useRef, useState } from 'react';
import { useShallow } from 'zustand/react/shallow';
import { useAppStore } from '../store';

// ===== TYPE DEFINITIONS =====

interface LogData {
    [key: string]: unknown;
}

interface StateSnapshot {
    [key: string]: boolean;
}

interface StoreDebugInfo {
    stateKeys: string[];
    stateTypes: Record<string, string>;
}

// ===== ENHANCED LOGGING UTILITIES =====
const createHookLogger = (hookName: string) => {
    let callCount = 0;
    const lastCall = { time: 0, data: undefined as LogData | null | undefined };
    return {
        trace: (action: string, data?: LogData) => {
            callCount++;
            const now = Date.now();
            const timeSinceLastCall = now - lastCall.time;

            // Warn if called too frequently (less than 16ms apart)
            if (timeSinceLastCall < 16 && timeSinceLastCall > 0) {
                logger.warning(
                    `🔥 [${hookName}] Rapid fire detected! ${action} - ${timeSinceLastCall}ms since last call (Call #${callCount})`
                );
            }

            logger.debug(`[${hookName}] ${action} (Call #${callCount})`, data);
            lastCall.time = now;
            lastCall.data = data;
        },
        warn: (message: string, data?: unknown) => {
            logger.warning(`⚠️ [${hookName}] ${message}`, data);
        },
        error: (message: string, error?: unknown) => {
            logger.error(`❌ [${hookName}] ${message}`, error);
        },
    };
};

// ===== MAIN HOOKS WITH ENHANCED LOGGING =====

/**
 * 🧠 Optimized hook for knowledge base functionality
 */
export const useKnowledge = () => {
    // const hookLogger = createHookLogger('useKnowledge');

    return useAppStore(
        useShallow(state => {
            return {
                // State - directly use standardized properties
                indexedDocumentsCount: state.indexedDocumentsCount || 0,
                knowledgeBaseName: state.knowledgeBaseName || '',
                isLoading: state.isLoading || false, // ⚠️ MODIFIED: Direct use
                error: state.error || null, // ⚠️ MODIFIED: Direct use
                lastIndexedAt: state.lastIndexedAt || null,
                indexingProgress: state.indexingProgress || {
                    isIndexing: false, // ✅ ADDED: Complete default
                    filesProcessed: 0,
                    totalFiles: 0,
                    errors: [],
                    progress: '',
                },
                searchResults: state.searchResults || [],

                // Actions
                initializeKnowledgeBase: state.initializeKnowledgeBase,
                triggerIndexing: state.triggerIndexing,
                searchRelevantKnowledge: state.searchRelevantKnowledge,
                refreshIndexedDocumentsCount: state.refreshIndexedDocumentsCount,
            };
        })
    );
};

/**
 * 🤖 Optimized hook for LLM functionality
 */
export const useLLM = () => {
    const hookLogger = createHookLogger('useLLM');

    return useAppStore(
        useShallow(state => {
            hookLogger.trace('Selecting state', {
                isGenerating: state.isGenerating,
                hasConversations: state.conversations?.size > 0,
                hasErrors: !!state.llmError,
            });

            return {
                // State
                isGenerating: state.isGenerating || false,
                isGeneratingResponse: state.isGeneratingResponse || false,
                isGeneratingSuggestions: state.isGeneratingSuggestions || false,
                isSummarizing: state.isSummarizing || false,
                llmError: state.llmError || null,
                currentStreamId: state.currentStreamId || null,
                conversationSummary: state.conversationSummary || '',
                conversationSuggestions: state.conversationSuggestions || {
                    powerUpContent: '',
                    lastAnalysis: undefined,
                    analysisHistory: [],
                },
                conversations: state.conversations || new Map(),
                streamingResponses: state.streamingResponses || new Map(),
                currentAbortController: state.currentAbortController || null,

                // Actions
                generateResponse: state.generateResponse,
                generateSuggestions: state.generateSuggestions,
                summarizeConversation: state.summarizeConversation,
                stopStreaming: state.stopStreaming,
                clearConversation: state.clearConversation,
                clearLLMError: state.clearLLMError,
                cancelCurrentRequest: state.cancelCurrentRequest,
            };
        })
    );
};

/**
 * 🎤 Optimized hook for speech recognition
 */
export const useSpeech = () => {
    const hookLogger = createHookLogger('useSpeech');

    return useAppStore(
        useShallow(state => {
            hookLogger.trace('Selecting state', {
                isRecording: state.isRecording,
                recognitionStatus: state.recognitionStatus,
            });

            return {
                // State
                isRecording: state.isRecording || false,
                isProcessing: state.speechIsProcessing || false,
                recognitionStatus: state.recognitionStatus || 'inactive', // ⚠️ CHANGED: 'idle' -> 'inactive' to match our slice
                error: state.speechError || null,
                audioSessions: state.audioSessions || new Map(), // ⚠️ CHANGED: [] -> new Map() to match actual type
                currentTranscript: state.currentTranscript || '',
                interimTranscripts: state.interimTranscripts || [],

                // Actions
                startRecording: state.startRecording,
                stopRecording: state.stopRecording,
                // processAudioSession: state.processAudioSession,
                clearTranscripts: state.clearTranscripts,
                handleRecognitionResult: state.handleRecognitionResult,
                clearError: state.clearError,

                // ✅ ADDED: New method for getting media stream
                getMediaStream: state.getMediaStream,
            };
        })
    );
};

/**
 * 📞 Optimized hook for call context (renamed from useInterview)
 */
export const useCallContext = () => {
    const hookLogger = createHookLogger('useCallContext');

    return useAppStore(
        useShallow(state => {
            hookLogger.trace('Selecting state', {
                hasContext: !!state.context,
                currentStep: state.currentSetupStep,
                validationErrors: Object.keys(state.validationErrors || {}).length,
            });

            return {
                // State
                context: state.context || null,

                // ✅ REMOVED: Local modal state - now computed from global modals
                // isModalOpen: state.isModalOpen || false,

                currentSetupStep: state.currentSetupStep || 'basic',
                validationErrors: state.validationErrors || {},

                // Actions
                setCallContext: state.setCallContext,
                openSetupModal: state.openSetupModal,
                closeSetupModal: state.closeSetupModal,
                updateContextField: state.updateContextField,
                validateContext: state.validateContext,
                nextSetupStep: state.nextSetupStep,
                previousSetupStep: state.previousSetupStep,
                resetSetupFlow: state.resetSetupFlow,
            };
        })
    );
};

// ✅ ADDED: Convenience hook to check if setup modal is open
export const useSetupModalState = () => {
    const { globalModals } = useUI();
    return globalModals['call-setup-modal']?.isOpen ?? false;
};

// ✅ ADDED: Hook to check various loading states with clear boundaries
export const useLoadingStates = () => {
    const hookLogger = createHookLogger('useLoadingStates');

    return useAppStore(
        useShallow(state => {
            const loadingStates = {
                // Global loading overlay
                globalLoading: state.globalLoading?.isActive || false,
                globalLoadingMessage: state.globalLoading?.message,
                globalLoadingSource: state.globalLoading?.source,

                // Domain-specific loading states
                knowledgeLoading: state.isLoading || false, // Knowledge operations
                llmGenerating: state.isGenerating || false, // Any LLM operation
                llmGeneratingResponse: state.isGeneratingResponse || false, // Specific response
                llmGeneratingSuggestions: state.isGeneratingSuggestions || false, // Specific suggestions
                llmSummarizing: state.isSummarizing || false, // Specific summarization
                speechProcessing: state.speechIsProcessing || false, // Speech operations

                // Convenience flags
                anyDomainLoading: state.isAnyDomainLoading(),
                anyLLMOperation:
                    state.isGenerating ||
                    state.isGeneratingResponse ||
                    state.isGeneratingSuggestions ||
                    state.isSummarizing,
            };

            hookLogger.trace('Loading states computed', {
                globalActive: loadingStates.globalLoading,
                domainsActive: loadingStates.anyDomainLoading,
                llmActive: loadingStates.anyLLMOperation,
            });

            return loadingStates;
        })
    );
};

// ✅ ADDED: Hook to check error states across slices
export const useErrorStates = () => {
    const hookLogger = createHookLogger('useErrorStates');

    return useAppStore(
        useShallow(state => {
            const errorStates = {
                // Global errors
                globalError: state.globalError || null,

                // Domain-specific errors
                knowledgeError: state.error || null, // Knowledge operations
                llmError: state.llmError || null, // LLM operations
                speechError: state.speechError || null, // Speech operations

                // Convenience flags
                hasAnyError: !!(state.globalError || state.error || state.llmError || state.speechError),
                errorCount: [state.globalError, state.error, state.llmError, state.speechError].filter(Boolean).length,
            };

            hookLogger.trace('Error states computed', {
                hasErrors: errorStates.hasAnyError,
                errorCount: errorStates.errorCount,
            });

            return errorStates;
        })
    );
};

// ✅ ADDED: Hook for notification management with better integration
export const useNotifications = () => {
    const hookLogger = createHookLogger('useNotifications');
    const { notifications, addNotification, removeNotification } = useUI();

    // Enhanced notification methods
    const enhancedMethods = useMemo(
        () => ({
            // Quick notification methods
            success: (message: string, duration = 5000) => {
                hookLogger.trace('Adding success notification', { message });
                addNotification({ type: 'success', message, duration });
            },

            error: (message: string, duration = 8000) => {
                hookLogger.trace('Adding error notification', { message });
                addNotification({ type: 'error', message, duration });
            },

            warning: (message: string, duration = 6000) => {
                hookLogger.trace('Adding warning notification', { message });
                addNotification({ type: 'warning', message, duration });
            },

            info: (message: string, duration = 4000) => {
                hookLogger.trace('Adding info notification', { message });
                addNotification({ type: 'info', message, duration });
            },

            // Clear all notifications
            clearAll: () => {
                hookLogger.trace('Clearing all notifications');
                removeNotification();
            },

            // Remove specific notification
            remove: (id: number) => {
                hookLogger.trace('Removing notification', { id });
                removeNotification(id);
            },
        }),
        [addNotification, removeNotification, hookLogger]
    );

    return {
        notifications,
        count: notifications.length,
        ...enhancedMethods,
    };
};

/**
 * 🎨 Optimized hook for UI state
 */
export const useUI = () => {
    const hookLogger = createHookLogger('useUI');

    return useAppStore(
        useShallow(state => {
            hookLogger.trace('Selecting state', {
                theme: state.theme,
                hasGlobalModals: Object.keys(state.globalModals || {}).length > 0,
                globalLoadingActive: state.globalLoading?.isActive,
                hasNotifications: (state.notifications || []).length > 0,
            });

            return {
                // ===== UPDATED STATE SELECTORS =====

                // Theme
                theme: state.theme || 'dark',

                // ✅ UPDATED: Global modals (renamed from 'modals')
                globalModals: state.globalModals || {},

                // ✅ UPDATED: Global loading (structured)
                globalLoading: state.globalLoading || { isActive: false, message: undefined, source: undefined },

                // ✅ UPDATED: Global error (renamed from 'error')
                globalError: state.globalError || null,

                // Notifications
                notifications: state.notifications || [],

                // ===== UPDATED ACTION SELECTORS =====

                // Theme actions
                setTheme: state.setTheme,

                // Notification actions
                addNotification: state.addNotification,
                removeNotification: state.removeNotification,

                // ✅ UPDATED: Global modal actions (renamed)
                openGlobalModal: state.openGlobalModal,
                closeGlobalModal: state.closeGlobalModal,
                closeAllGlobalModals: state.closeAllGlobalModals,

                // ✅ UPDATED: Global loading actions (renamed)
                setGlobalLoading: state.setGlobalLoading,

                // Error actions
                clearGlobalError: state.clearGlobalError,

                // Utility actions
                resetGlobalUIState: state.resetGlobalUIState,

                // ✅ UPDATED: Helper methods
                isAnyDomainLoading: state.isAnyDomainLoading,
            };
        })
    );
};

// ===== SPECIALIZED SELECTORS WITH PROPER MEMOIZATION =====

/**
 * 📡 Get streaming response by ID with proper memoization
 */
export const useStreamingResponse = (streamId: string) => {
    const hookLogger = createHookLogger(`useStreamingResponse[${streamId}]`);

    return useAppStore(state => {
        const response = state.streamingResponses?.get(streamId);
        hookLogger.trace('Selected response', { found: !!response, streamId });
        return response;
    });
};

export const useDebouncedKnowledgeSearch = (searchTerm: string, delay: number = 500) => {
    const searchFunction = useAppStore(state => state.searchRelevantKnowledge);
    const [results, setResults] = useState<DocumentChunk[]>([]);
    const [isSearching, setIsSearching] = useState(false);

    const debouncedSearch = useMemo(
        () =>
            debounce(async (term: string) => {
                if (!term.trim()) {
                    setResults([]);
                    return;
                }

                setIsSearching(true);
                try {
                    const searchResults = await searchFunction(term, 5);
                    setResults(searchResults);
                } catch (error) {
                    console.error('Search error:', error);
                    setResults([]);
                } finally {
                    setIsSearching(false);
                }
            }, delay),
        [searchFunction, delay]
    );

    useEffect(() => {
        debouncedSearch(searchTerm);
        return () => {
            debouncedSearch.cancel();
        };
    }, [searchTerm, debouncedSearch]);

    return { results, isSearching };
};

/**
 * 💬 Get conversation messages by ID - FIXED with proper memoization
 */
export const useConversationMessages = (conversationId: string = 'main') => {
    const hookLogger = createHookLogger(`useConversationMessages[${conversationId}]`);

    // Use a ref to track the last messages to prevent unnecessary re-renders
    const lastMessagesRef = useRef<Message[]>([]);
    const lastConversationIdRef = useRef<string>(conversationId);

    return useAppStore(
        useShallow(state => {
            const conversation = state.conversations?.get(conversationId);
            const currentMessages = conversation?.messages || [];

            // Only update if messages actually changed or conversation ID changed
            if (
                conversationId !== lastConversationIdRef.current ||
                currentMessages.length !== lastMessagesRef.current.length ||
                currentMessages.some(
                    (msg, index) =>
                        msg.content !== lastMessagesRef.current[index]?.content ||
                        msg.timestamp !== lastMessagesRef.current[index]?.timestamp
                )
            ) {
                lastMessagesRef.current = currentMessages;
                lastConversationIdRef.current = conversationId;

                hookLogger.trace('Messages updated', {
                    conversationId,
                    messageCount: currentMessages.length,
                });
            }

            return lastMessagesRef.current;
        })
    );
};

/**
 * 🔔 Get notification count
 */
export const useNotificationCount = () => {
    const hookLogger = createHookLogger('useNotificationCount');

    return useAppStore(state => {
        const count = state.notifications?.length;
        hookLogger.trace('Selected count', { count });
        return count;
    });
};

// ===== COMPUTED SELECTORS =====

/**
 * 🔍 Search results with highlighted text (properly memoized)
 */
export const useSearchResultsWithHighlight = (searchTerm: string) => {
    const hookLogger = createHookLogger('useSearchResultsWithHighlight');
    const searchResults = useAppStore(state => state.searchResults || []);

    return useMemo(() => {
        hookLogger.trace('Computing highlights', {
            searchTerm,
            resultCount: searchResults.length,
        });

        if (!searchTerm) {
            return searchResults;
        }

        const highlighted = searchResults.map(result => ({
            ...result,
            highlightedText:
                result.text?.replace(new RegExp(searchTerm, 'gi'), match => `<mark>${match}</mark>`) || result.text,
        }));

        return highlighted;
    }, [searchResults, searchTerm, hookLogger]);
};

// ===== DEBUGGING HOOKS =====

/**
 * 🐛 Debug hook to inspect entire store state
 */
export const useStoreDebug = (): StoreDebugInfo => {
    const hookLogger = createHookLogger('useStoreDebug');

    return useAppStore(state => {
        const stateKeys = Object.keys(state);
        const stateTypes: Record<string, string> = {};

        stateKeys.forEach(key => {
            try {
                stateTypes[key] = typeof (state as unknown as Record<string, unknown>)[key];
            } catch {
                stateTypes[key] = 'unknown';
            }
        });

        hookLogger.trace('Store inspection', {
            keyCount: stateKeys.length,
            types: Object.keys(stateTypes).filter(k => stateTypes[k] === 'function').length + ' functions',
        });

        return {
            stateKeys,
            stateTypes,
        };
    });
};

/**
 * 🔧 Helper hook for performance monitoring
 */
export const usePerformanceMonitor = (componentName: string) => {
    const renderCount = useRef(0);
    const lastRenderTime = useRef(Date.now());

    useEffect(() => {
        renderCount.current++;
        const now = Date.now();
        const timeSinceLastRender = now - lastRenderTime.current;

        if (renderCount.current > 10 && timeSinceLastRender < 100) {
            logger.error(
                `🚨 [${componentName}] Rapid re-renders detected! ${renderCount.current} renders, last gap: ${timeSinceLastRender}ms`
            );
        }

        lastRenderTime.current = now;

        // Log every 10 renders
        if (renderCount.current % 10 === 0) {
            logger.info(`📊 [${componentName}] Render count: ${renderCount.current}`);
        }
    });

    return {
        renderCount: renderCount.current,
        logRender: (reason: string) => {
            logger.debug(`🔄 [${componentName}] Re-render triggered: ${reason}`);
        },
    };
};

// ===== EXPORTS =====

// export {
//     // Legacy exports for backward compatibility
//     useCallContext as useInterview,
// };

export type { LogData, StateSnapshot, StoreDebugInfo };
