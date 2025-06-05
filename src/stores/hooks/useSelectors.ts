/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
// src/stores/hooks/useSelectors.ts
import { useAppStore } from '../store';
import { useShallow } from 'zustand/react/shallow';
import { useMemo } from 'react';
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

// ===== DEBUGGING UTILITIES =====

// const logger = {
//     debug: (hook: string, action: string, data?: LogData) => {
//         console.log(`🔍 [${hook}] ${action}`, data ? JSON.stringify(data, null, 2) : '');
//     },
//     warn: (hook: string, message: string, data?: unknown) => {
//         console.warn(`⚠️ [${hook}] ${message}`, data);
//     },
//     error: (hook: string, message: string, error?: unknown) => {
//         console.error(`❌ [${hook}] ${message}`, error);
//     },
// };

// ===== MAIN HOOKS =====

/**
 * 🧠 Optimized hook for knowledge base functionality
 */
const useKnowledge = () => {
    logger.debug('useKnowledge', 'Selecting knowledge state');

    return useAppStore(
        useShallow(state => {
            const snapshot: StateSnapshot = {
                hasIndexedDocumentsCount: 'indexedDocumentsCount' in state,
                hasKnowledgeBaseName: 'knowledgeBaseName' in state,
                hasSearchResults: 'searchResults' in state,
                hasError: 'error' in state,
            };

            logger.debug('useKnowledge', 'State snapshot', snapshot);

            return {
                // State
                indexedDocumentsCount: state.indexedDocumentsCount || 0,
                knowledgeBaseName: state.knowledgeBaseName || '',
                isLoading: state.isLoading || false,
                error: state.error || null,
                lastIndexedAt: state.lastIndexedAt || null,
                indexingProgress: state.indexingProgress || 0,
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
const useLLM = () => {
    logger.debug('useLLM', 'Selecting LLM state');

    return useAppStore(
        useShallow(state => {
            const snapshot: StateSnapshot = {
                hasIsGenerating: 'isGenerating' in state,
                hasConversations: 'conversations' in state,
                hasStreamingResponses: 'streamingResponses' in state,
            };

            logger.debug('useLLM', 'State snapshot', snapshot);

            return {
                // State
                isGenerating: state.isGenerating || false,
                currentStreamId: state.currentStreamId || null,
                conversationSummary: state.conversationSummary || '',
                conversationSuggestions: state.conversationSuggestions || [],
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
const useSpeech = () => {
    logger.debug('useSpeech', 'Selecting speech state');

    return useAppStore(
        useShallow(state => {
            const snapshot: StateSnapshot = {
                hasIsRecording: 'isRecording' in state,
                hasIsProcessing: 'isProcessing' in state,
                hasAudioSessions: 'audioSessions' in state,
            };

            logger.debug('useSpeech', 'State snapshot', snapshot);

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
const useCallContext = () => {
    logger.debug('useCallContext', 'Selecting call context state');

    return useAppStore(
        useShallow(state => {
            const snapshot: StateSnapshot = {
                hasContext: 'context' in state,
                hasIsModalOpen: 'isModalOpen' in state,
                hasCurrentSetupStep: 'currentSetupStep' in state,
            };

            logger.debug('useCallContext', 'State snapshot', snapshot);

            return {
                // State
                context: state.context || null,
                isModalOpen: state.isModalOpen || false,
                currentSetupStep: state.currentSetupStep || 1,
                validationErrors: state.validationErrors || [],

                // Actions
                setCallContext: state.setCallContext,
                openSetupModal: state.openSetupModal,
                closeSetupModal: state.closeSetupModal,
                updateContextField: state.updateContextField,
                validateContext: state.validateContext,
            };
        })
    );
};

/**
 * 🎨 Optimized hook for UI state (type-safe property checking)
 */
const useUI = () => {
    logger.debug('useUI', 'Selecting UI state');

    return useAppStore(
        useShallow(state => {
            logger.debug('useUI', 'Selecting basic UI state');

            return {
                // Only include confirmed properties that exist
                isLoading: state.isLoading || false,
                error: state.error || null,

                // Add actions if they exist (without complex type checking)
                ...(state.setTheme && { setTheme: state.setTheme }),
                ...(state.addNotification && { addNotification: state.addNotification }),
                ...(state.removeNotification && { removeNotification: state.removeNotification }),
            };
        })
    );
};

// ===== SPECIALIZED SELECTORS =====

/**
 * 📡 Get streaming response by ID
 */
const useStreamingResponse = (streamId: string) => {
    logger.debug('useStreamingResponse', `Selecting stream: ${streamId}`);

    return useAppStore(state => {
        const response = state.streamingResponses?.get(streamId);
        logger.debug('useStreamingResponse', `Found stream ${streamId}`, { found: !!response });
        return response;
    });
};

/**
 * 💬 Get conversation messages by ID
 */
const useConversationMessages = (conversationId: string = 'main') => {
    logger.debug('useConversationMessages', `Selecting conversation: ${conversationId}`);

    return useAppStore(state => {
        const messages = state.conversations?.get(conversationId)?.messages || [];
        logger.debug('useConversationMessages', `Found ${messages.length} messages for ${conversationId}`);
        return messages;
    });
};

/**
 * 🔔 Get notification count (safe fallback)
 */
const useNotificationCount = () => {
    logger.debug('useNotificationCount', 'Selecting notification count');

    return useAppStore(state => {
        // Simple fallback - just return 0 for now since notifications don't exist
        logger.debug('useNotificationCount', 'Returning default count: 0');
        return 0;
    });
};

// ===== COMPUTED SELECTORS =====

/**
 * 🔍 Search results with highlighted text (memoized)
 */
const useSearchResultsWithHighlight = (searchTerm: string) => {
    const searchResults = useAppStore(state => state.searchResults || []);

    return useMemo(() => {
        logger.debug('useSearchResultsWithHighlight', `Highlighting search term: "${searchTerm}"`);

        if (!searchTerm) {
            logger.debug('useSearchResultsWithHighlight', 'No search term, returning original results');
            return searchResults;
        }

        const highlighted = searchResults.map(result => ({
            ...result,
            highlightedText:
                result.text?.replace(new RegExp(searchTerm, 'gi'), match => `<mark>${match}</mark>`) || result.text,
        }));

        logger.debug('useSearchResultsWithHighlight', `Highlighted ${highlighted.length} results`);
        return highlighted;
    }, [searchResults, searchTerm]);
};

// ===== DEBUGGING HOOKS =====

/**
 * 🐛 Debug hook to inspect entire store state
 */
const useStoreDebug = (): StoreDebugInfo => {
    return useAppStore(state => {
        // Simple approach - just get basic info without complex type conversion
        const stateKeys = Object.keys(state);
        const stateTypes: Record<string, string> = {};

        // Safe iteration without type assertions
        stateKeys.forEach(key => {
            try {
                stateTypes[key] = typeof (state as any)[key];
            } catch {
                stateTypes[key] = 'unknown';
            }
        });

        console.group('🔍 Store Debug');
        console.log('Available state keys:', stateKeys);
        console.log('State types:', stateTypes);
        console.groupEnd();

        return {
            stateKeys,
            stateTypes,
        };
    });
};

// ===== UTILITY HOOKS =====

/**
 * 🔧 Helper hook for safely accessing nested store properties
 */
const useSafeSelector = <T>(selector: (state: any) => T, fallback: T, debugName: string): T => {
    return useAppStore(state => {
        try {
            const result = selector(state);
            logger.debug(debugName, 'Selector succeeded', { resultType: typeof result });
            return result;
        } catch (error) {
            logger.error(debugName, 'Selector failed, using fallback', error);
            return fallback;
        }
    });
};

// ===== EXPORTS =====

export {
    // Main hooks
    useKnowledge,
    useLLM,
    useSpeech,
    useCallContext,
    useUI,

    // Specialized selectors
    useStreamingResponse,
    useConversationMessages,
    useNotificationCount,

    // Computed selectors
    useSearchResultsWithHighlight,

    // Debugging
    useStoreDebug,
    useSafeSelector,

    // Legacy exports (for backward compatibility)
    useCallContext as useInterview, // Alias for backward compatibility
};

// ===== TYPE EXPORTS =====

export type { StateSnapshot, StoreDebugInfo, LogData };
