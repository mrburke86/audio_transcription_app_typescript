// src/stores/chatStore.ts - WORKING VERSION
'use client';
import { diagnosticLogger } from '@/lib/DiagnosticLogger';
import { ChatSlice, ContextSlice, KnowledgeSlice, LLMSlice, SpeechSlice, UISlice } from '@/types';
import { create } from 'zustand';
import { createJSONStorage, devtools, persist } from 'zustand/middleware';
import { circuitBreakerMiddleware } from './middleware/circuitBreakerMiddleware';
import { loggerMiddleware } from './middleware/loggerMiddleware';
import { createChatSlice } from './slices/chatSlice';
import { createContextSlice } from './slices/contextSlice';
import { createKnowledgeSlice } from './slices/knowledgeSlice';
import { createLLMSlice } from './slices/llmSlice';
import { createSpeechSlice } from './slices/speechSlice';
import { createUISlice } from './slices/uiSlice';

// ✅ CONSOLIDATED BOUND STORE TYPE
type ConsolidatedBoundStore = ChatSlice & UISlice & ContextSlice & LLMSlice & SpeechSlice & KnowledgeSlice;

// 🔍 DIAGNOSTIC MIDDLEWARE - Wraps the store to track all state changes
const diagnosticMiddleware = (f: any) => (set: any, get: any, store: any) => {
    const tracker = diagnosticLogger.trackComponent('ZustandStore');

    // Wrap the set function to track all state changes
    const diagnosticSet = (partial: any, replace?: boolean) => {
        const prevState = get();

        // Execute the actual state change
        const result = set(partial, replace);

        const newState = get();

        // 🔍 ANALYZE STATE CHANGES
        if (typeof partial === 'function') {
            tracker.stateChange('function_update', 'function', 'function_result', 'setState function');
        } else if (typeof partial === 'object' && partial !== null) {
            Object.keys(partial).forEach(key => {
                const oldValue = prevState[key];
                const newValue = newState[key];

                if (oldValue !== newValue) {
                    tracker.stateChange(key, oldValue, newValue, 'direct setState');

                    // 🚨 SPECIAL TRACKING for problematic patterns
                    if (key === 'streamedContent' && typeof newValue === 'string' && newValue.length > 0) {
                        diagnosticLogger.log(
                            'trace',
                            'state',
                            'ZustandStore',
                            `📝 Streaming content updated: ${newValue.length} chars`
                        );
                    }

                    if (key === 'recognitionStatus') {
                        diagnosticLogger.log(
                            'info',
                            'state',
                            'ZustandStore',
                            `🎤 Recognition status: ${oldValue} → ${newValue}`
                        );
                    }

                    if (key === 'conversationHistory' && Array.isArray(newValue)) {
                        diagnosticLogger.log(
                            'info',
                            'state',
                            'ZustandStore',
                            `💬 Conversation updated: ${newValue.length} messages`
                        );
                    }
                }
            });
        }

        return result;
    };

    return f(diagnosticSet, get, store);
};

// 🎯 TEMPORARY BYPASS - Manual hydration with error handling
const persistConfig = {
    name: 'interview_context',
    storage: createJSONStorage(() => sessionStorage),

    // ✅ SIMPLE PARTIALIZE - Only persist essential data
    partialize: (state: ConsolidatedBoundStore) => {
        try {
            return {
                initialContext: state?.initialContext || null,
                conversationHistory: state?.conversationHistory || [],
            };
        } catch (error) {
            console.error('Partialize error:', error);
            return {
                initialContext: null,
                conversationHistory: [],
            };
        }
    },

    // ✅ TEMPORARY: Skip automatic hydration to avoid the error
    skipHydration: true,

    // 🔍 SIMPLE HYDRATION TRACKING
    onRehydrateStorage: () => {
        diagnosticLogger.log('info', 'init', 'ZustandStore', '🏁 Manual hydration will be triggered');

        return (state: ConsolidatedBoundStore | undefined, error?: unknown) => {
            if (error) {
                diagnosticLogger.log('error', 'init', 'ZustandStore', '❌ Manual rehydration failed', {
                    error: error instanceof Error ? error.message : String(error),
                });
            } else if (state) {
                diagnosticLogger.log('info', 'init', 'ZustandStore', '✅ Manual rehydration successful');
            }
        };
    },
};

// 🏗️ CREATE STORE with enhanced tracking
export const useBoundStore = create<ConsolidatedBoundStore>()(
    devtools(
        persist(
            circuitBreakerMiddleware(
                loggerMiddleware(
                    diagnosticMiddleware((set: any, get: any, store: any) => {
                        diagnosticLogger.log('info', 'init', 'ZustandStore', '🏗️ Creating store slices');

                        const slices = {
                            chat: createChatSlice(set, get, store),
                            context: createContextSlice(set, get, store),
                            knowledge: createKnowledgeSlice(set, get, store),
                            llm: createLLMSlice(set, get, store),
                            speech: createSpeechSlice(set, get, store),
                            ui: createUISlice(set, get, store),
                        };

                        diagnosticLogger.log('info', 'init', 'ZustandStore', '✅ All slices created successfully', {
                            sliceNames: Object.keys(slices),
                        });

                        return {
                            ...slices.chat,
                            ...slices.context,
                            ...slices.knowledge,
                            ...slices.llm,
                            ...slices.speech,
                            ...slices.ui,
                        };
                    })
                )
            ),
            persistConfig
        ),
        {
            name: 'interview-edge-ai-store',
            // 🔍 DEVTOOLS TRACKING
            trace: true, // Enable action tracing in devtools
        }
    )
);

// ✅ EXPORT CONSOLIDATED TYPE
export type StoreState = ConsolidatedBoundStore;

// ✅ SIMPLE TYPED SELECTORS (without problematic hook tracking)
export const useChat = () =>
    useBoundStore(state => ({
        conversationHistory: state.conversationHistory,
        addUserMessage: state.addUserMessage,
        addAssistantMessage: state.addAssistantMessage,
        clearHistory: state.clearHistory,
        getUserMessages: state.getUserMessages,
        getAssistantMessages: state.getAssistantMessages,
        getLastMessage: state.getLastMessage,
        getMessageCount: state.getMessageCount,
    }));

export const useSpeech = () =>
    useBoundStore(state => ({
        recognitionStatus: state.recognitionStatus,
        speechErrorMessage: state.speechErrorMessage,
        isVisualizationActive: state.isVisualizationActive,
        interimTranscriptMessages: state.interimTranscriptMessages,
        currentInterimTranscript: state.currentInterimTranscript,
        isRecording: state.isRecording,
        hasTranscriptions: state.hasTranscriptions,
        getAllTranscriptionText: state.getAllTranscriptionText,
        setRecognitionStatus: state.setRecognitionStatus,
        setSpeechError: state.setSpeechError,
        setVisualizationActive: state.setVisualizationActive,
        clearInterimTranscripts: state.clearInterimTranscripts,
        startSpeechSession: state.startSpeechSession,
        stopSpeechSession: state.stopSpeechSession,
        resetSpeechState: state.resetSpeechState,
    }));

export const useContextSlice = () =>
    useBoundStore(state => ({
        initialContext: state.initialContext,
        contextLoading: state.contextLoading,
        isContextValid: state.isContextValid,
        setInitialContext: state.setInitialContext,
        resetToDefaultContext: state.resetToDefaultContext,
        updateContextWithDefaults: state.updateContextWithDefaults,
        updateTargetRole: state.updateTargetRole,
        updateTargetCompany: state.updateTargetCompany,
        addGoal: state.addGoal,
        removeGoal: state.removeGoal,
    }));

export const useLLM = () =>
    useBoundStore(state => ({
        llmService: state.llmService,
        streamedContent: state.streamedContent,
        isStreamingComplete: state.isStreamingComplete,
        llmLoading: state.llmLoading,
        llmError: state.llmError,
        initializeLLMService: state.initializeLLMService,
        generateResponse: state.generateResponse,
        resetStreamedContent: state.resetStreamedContent,
    }));

export const useUI = () =>
    useBoundStore(state => ({
        activeTab: state.activeTab,
        protectionState: state.protectionState,
        navigateToChat: state.navigateToChat,
        navigateToContextCapture: state.navigateToContextCapture,
        setActiveTab: state.setActiveTab,
        getProtectionStatus: state.getProtectionStatus,
    }));

// 🔍 GLOBAL STORE DIAGNOSTICS
if (typeof window !== 'undefined') {
    (window as any).storeDebug = {
        getState: () => useBoundStore.getState(),
        subscribe: (callback: (state: any) => void) => useBoundStore.subscribe(callback),

        // Get diagnostic report focused on store
        getStoreReport: () => {
            const state = useBoundStore.getState();
            return {
                contextValid: state.isContextValid ? state.isContextValid() : false,
                messagesCount: state.conversationHistory?.length || 0,
                hasLLMService: !!state.llmService,
                recognitionStatus: state.recognitionStatus,
                streamedContentLength: state.streamedContent?.length || 0,
                knowledgeStatus: {
                    loading: state.knowledgeLoading,
                    error: state.knowledgeError,
                    count: state.indexedDocumentsCount,
                },
            };
        },

        // Force state change for testing
        triggerTestUpdate: () => {
            const tracker = diagnosticLogger.trackComponent('TestTrigger');
            tracker.userAction('Manual test update');
            useBoundStore.setState({
                streamedContent: `Test update at ${new Date().toISOString()}`,
            });
        },
    };

    console.log('🐛 Debug: Access store debug via window.storeDebug');
}
