// src/stores/chatStore.ts - UPDATED ROOT STORE
// Updated to use consolidated slices and new interfaces
// Maintains same public API but eliminates internal duplication

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

export const useBoundStore = create<ConsolidatedBoundStore>()(
    devtools(
        persist(
            circuitBreakerMiddleware(
                loggerMiddleware((...a) => ({
                    ...createChatSlice(...a),
                    ...createContextSlice(...a),
                    ...createKnowledgeSlice(...a),
                    ...createLLMSlice(...a),
                    ...createSpeechSlice(...a),
                    ...createUISlice(...a),
                }))
            ),
            {
                name: 'interview_context',
                storage: createJSONStorage(() => sessionStorage),
                partialize: state => ({
                    // ✅ PERSIST ONLY ESSENTIAL DATA
                    initialContext: state.initialContext,
                    conversationHistory: state.conversationHistory,
                }),
            }
        ),
        {
            name: 'interview-edge-ai-store', // DevTools name
        }
    )
);

// ✅ EXPORT CONSOLIDATED TYPE
export type StoreState = ConsolidatedBoundStore;

// ✅ TYPED SELECTORS (optional convenience exports)
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
