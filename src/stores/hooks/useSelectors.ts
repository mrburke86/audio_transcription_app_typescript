import { useAppStore } from '../store';
import { useShallow } from 'zustand/react/shallow';
import { useMemo } from 'react';

// Optimized hook to replace KnowledgeProvider
const useKnowledge = () => {
    return useAppStore(
        useShallow(state => ({
            // State
            indexedDocumentsCount: state.indexedDocumentsCount,
            knowledgeBaseName: state.knowledgeBaseName,
            isLoading: state.isLoading,
            error: state.error,
            lastIndexedAt: state.lastIndexedAt,
            indexingProgress: state.indexingProgress,
            searchResults: state.searchResults,

            // Actions
            triggerIndexing: state.triggerIndexing,
            searchRelevantKnowledge: state.searchRelevantKnowledge,
            refreshIndexedDocumentsCount: state.refreshIndexedDocumentsCount,
        }))
    );
};

// Optimized hook to replace useLLMProviderOptimized
const useLLM = () => {
    return useAppStore(
        useShallow(state => ({
            // State
            isGenerating: state.isGenerating,
            currentStreamId: state.currentStreamId,
            conversationSummary: state.conversationSummary,
            conversationSuggestions: state.conversationSuggestions,

            // Actions
            generateResponse: state.generateResponse,
            generateSuggestions: state.generateSuggestions,
            stopStreaming: state.stopStreaming,
            clearConversation: state.clearConversation,
        }))
    );
};

// Optimized hook for speech recognition
const useSpeech = () => {
    return useAppStore(
        useShallow(state => ({
            // State
            isRecording: state.isRecording,
            isProcessing: state.isProcessing,
            recognitionStatus: state.recognitionStatus,
            error: state.error,
            currentTranscript: state.currentTranscript,
            interimTranscripts: state.interimTranscripts,

            // Actions
            startRecording: state.startRecording,
            stopRecording: state.stopRecording,
            processAudioSession: state.processAudioSession,
            clearTranscripts: state.clearTranscripts,
            handleRecognitionResult: state.handleRecognitionResult,
            clearError: state.clearError,
        }))
    );
};

// Optimized hook for interview context
const useInterview = () => {
    return useAppStore(
        useShallow(state => ({
            // State
            context: state.context,
            isModalOpen: state.isModalOpen,
            currentStep: state.currentStep,
            validationErrors: state.validationErrors,

            // Actions
            setInterviewContext: state.setInterviewContext,
            openInterviewModal: state.openInterviewModal,
            closeInterviewModal: state.closeInterviewModal,
            updateInterviewField: state.updateInterviewField,
            validateContext: state.validateContext,
        }))
    );
};

// Optimized hook for UI state
const useUI = () => {
    return useAppStore(
        useShallow(state => ({
            // State
            theme: state.theme,
            notifications: state.notifications,
            modals: state.modals,
            isLoading: state.isLoading,
            loadingMessage: state.loadingMessage,

            // Actions
            setTheme: state.setTheme,
            addNotification: state.addNotification,
            removeNotification: state.removeNotification,
            openModal: state.openModal,
            closeModal: state.closeModal,
            setLoading: state.setLoading,
        }))
    );
};

// Selective hooks for specific data
const useStreamingResponse = (streamId: string) => {
    return useAppStore(state => state.streamingResponses.get(streamId));
};

const useConversationMessages = (conversationId: string = 'main') => {
    return useAppStore(state => state.conversations.get(conversationId)?.messages || []);
};
const useNotificationCount = () => {
    return useAppStore(state => state.notifications.length);
};

// Computed selectors with memoization
const useSearchResultsWithHighlight = (searchTerm: string) => {
    const searchResults = useAppStore(state => state.searchResults);

    return useMemo(() => {
        if (!searchTerm) return searchResults;

        return searchResults.map(result => ({
            ...result,
            highlightedText: result.text.replace(new RegExp(searchTerm, 'gi'), match => `<mark>${match}</mark>`),
        }));
    }, [searchResults, searchTerm]);
};

// Export all hooks for clean imports
export {
    useKnowledge,
    useLLM,
    useSpeech,
    useInterview,
    useUI,
    useStreamingResponse,
    useConversationMessages,
    useNotificationCount,
    useSearchResultsWithHighlight,
};
