// src/stores/hooks/useSelectors.ts
import { useAppStore } from '../store';
import { useShallow } from 'zustand/react/shallow';
import { useEffect, useMemo, useRef } from 'react';
import { logger } from '@/modules';
// import { getCompleteCallConfig } from '@/utils/callContextAdapters';

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
    const lastCall = { time: 0, data: null as any };

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
    const hookLogger = createHookLogger('useKnowledge');

    return useAppStore(
        useShallow(state => {
            hookLogger.trace('Selecting state', {
                hasData: !!state.indexedDocumentsCount,
                isLoading: state.isLoading,
            });

            return {
                // State
                indexedDocumentsCount: state.indexedDocumentsCount || 0,
                knowledgeBaseName: state.knowledgeBaseName || '',
                isLoading: state.isLoading || false,
                error: state.error || null,
                lastIndexedAt: state.lastIndexedAt || null,
                indexingProgress: state.indexingProgress || {
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
            });

            return {
                // State
                isGenerating: state.isGenerating || false,
                currentStreamId: state.currentStreamId || null,
                conversationSummary: state.conversationSummary || '',
                conversationSuggestions: state.conversationSuggestions || {
                    powerUpContent: '',
                    lastAnalysis: undefined,
                    analysisHistory: [],
                },
                conversations: state.conversations || new Map(),
                streamingResponses: state.streamingResponses || new Map(),

                // Actions
                generateResponse: state.generateResponse,
                generateSuggestions: state.generateSuggestions,
                summarizeConversation: state.summarizeConversation,
                stopStreaming: state.stopStreaming,
                clearConversation: state.clearConversation,
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
                isProcessing: state.isProcessing || false,
                recognitionStatus: state.recognitionStatus || 'idle',
                error: state.error || null,
                audioSessions: state.audioSessions || [],
                currentTranscript: state.currentTranscript || '',
                interimTranscripts: state.interimTranscripts || [],

                // Actions
                startRecording: state.startRecording,
                stopRecording: state.stopRecording,
                processAudioSession: state.processAudioSession,
                clearTranscripts: state.clearTranscripts,
                handleRecognitionResult: state.handleRecognitionResult,
                clearError: state.clearError,
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
                isModalOpen: state.isModalOpen,
            });

            return {
                // State
                context: state.context || null,
                isModalOpen: state.isModalOpen || false,
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

/**
 * 🎨 Optimized hook for UI state
 */
export const useUI = () => {
    const hookLogger = createHookLogger('useUI');

    return useAppStore(
        useShallow(state => {
            hookLogger.trace('Selecting state');

            return {
                // State
                isLoading: state.isLoading || false,
                error: state.error || null,
                theme: state.theme || 'dark',
                modals: state.modals || {},
                loadingMessage: state.loadingMessage,

                // Actions
                setTheme: state.setTheme,
                addNotification: state.addNotification,
                removeNotification: state.removeNotification,
                openModal: state.openModal,
                closeModal: state.closeModal,
                setLoading: state.setLoading,
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

/**
 * 💬 Get conversation messages by ID - FIXED with proper memoization
 */
export const useConversationMessages = (conversationId: string = 'main') => {
    const hookLogger = createHookLogger(`useConversationMessages[${conversationId}]`);
    const renderCountRef = useRef(0);

    // Track render count
    useEffect(() => {
        renderCountRef.current++;
        if (renderCountRef.current > 50) {
            hookLogger.error(`Excessive renders detected! Count: ${renderCountRef.current}`);
        }
    }, [hookLogger]);

    // Use proper memoization to prevent infinite loops
    const messages = useAppStore(
        useShallow(state => {
            const conversation = state.conversations?.get(conversationId);
            const msgs = conversation?.messages || [];

            hookLogger.trace('Selecting messages', {
                conversationId,
                messageCount: msgs.length,
                renderCount: renderCountRef.current,
            });

            return msgs;
        })
    );

    // Memoize the result to prevent unnecessary re-renders
    return useMemo(() => messages, [messages]);
};

/**
 * 🔔 Get notification count
 */
export const useNotificationCount = () => {
    const hookLogger = createHookLogger('useNotificationCount');

    return useAppStore(state => {
        const count = state.notifications?.length || 0;
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
                stateTypes[key] = typeof (state as any)[key];
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

// // ===== UTILITY HOOKS =====

// /**
//  * 🔧 Helper hook for safely accessing nested store properties
//  */
// const useSafeSelector = <T>(selector: (state: any) => T, fallback: T, debugName: string): T => {
//     return useAppStore(state => {
//         try {
//             const result = selector(state);
//             logger.debug(debugName, 'Selector succeeded', { resultType: typeof result });
//             return result;
//         } catch (error) {
//             logger.error(debugName, 'Selector failed, using fallback', error);
//             return fallback;
//         }
//     });
// };

// ===== EXPORTS =====

export {
    // Legacy exports for backward compatibility
    useCallContext as useInterview,
};

export type { StateSnapshot, StoreDebugInfo, LogData };
