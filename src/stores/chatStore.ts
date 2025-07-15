// src/stores/chatStore.ts
// FIXED: Decentralized—moved logic to utils; generateResponse calls util; no mocks/handlers in store. Clean.
import { InitialInterviewContext, LLMHookState, Message, StrategicIntelligenceSuggestions } from '@/types';
import { generateLLMResponse } from '@/utils/llmUtils';
import { create } from 'zustand';

interface ChatStoreState extends LLMHookState {
    conversationHistory: Message[];
    interimTranscriptMessages: Message[];
    currentInterimTranscript: string;
    initialContext: InitialInterviewContext | null;
    activeTab: string;
    protectionState: { isAccessAllowed: boolean; isValidating: boolean; isRedirecting: boolean };
    setLoading: (isLoading: boolean) => void;
    setError: (error: string | null) => void;
    appendStreamedContent: (content: string) => void;
    resetStreamedContent: () => void;
    setStreamingComplete: (isComplete: boolean) => void;
    setConversationSummary: (summary: string) => void;
    setStrategicSuggestions: (suggestions: StrategicIntelligenceSuggestions) => void;
    addMessage: (message: Message) => void;
    clearHistory: () => void;
    addInterimTranscriptMessage: (message: Message) => void;
    updateCurrentInterimTranscript: (transcript: string) => void;
    clearInterimTranscripts: () => void;
    clearAllTranscripts: () => void;
    setInitialContext: (context: InitialInterviewContext | null) => void;
    setActiveTab: (tab: string) => void;
    setProtectionState: (update: Partial<ChatStoreState['protectionState']>) => void;
    generateResponse: (text: string) => Promise<void>;
}

export const useChatStore = create<ChatStoreState>()((set, get) => ({
    isLoading: false,
    error: null,
    streamedContent: '',
    isStreamingComplete: false,
    conversationSummary: '',
    strategicSuggestions: {
        strategicIntelligenceContent: '',
        currentAnalysis: undefined,
        previousAnalyses: [],
    },
    conversationHistory: [],
    interimTranscriptMessages: [],
    currentInterimTranscript: '',
    initialContext: null,
    activeTab: 'interview',
    protectionState: { isAccessAllowed: false, isValidating: false, isRedirecting: false },

    setLoading: isLoading => set({ isLoading }),
    setError: error => set({ error }),
    appendStreamedContent: content => set(state => ({ streamedContent: state.streamedContent + content })),
    resetStreamedContent: () => set({ streamedContent: '', isStreamingComplete: false }),
    setStreamingComplete: isComplete => set({ isStreamingComplete: isComplete }),
    setConversationSummary: summary => set({ conversationSummary: summary }),
    setStrategicSuggestions: suggestions => set({ strategicSuggestions: suggestions }),
    addMessage: message => set(state => ({ conversationHistory: [...state.conversationHistory, message] })),
    clearHistory: () => set({ conversationHistory: [] }),
    addInterimTranscriptMessage: message =>
        set(state => ({ interimTranscriptMessages: [...state.interimTranscriptMessages, message] })),
    updateCurrentInterimTranscript: transcript => set({ currentInterimTranscript: transcript }),
    clearInterimTranscripts: () => set({ interimTranscriptMessages: [], currentInterimTranscript: '' }),
    clearAllTranscripts: () =>
        set({ interimTranscriptMessages: [], currentInterimTranscript: '', conversationHistory: [] }),
    setInitialContext: context => set({ initialContext: context }),
    setActiveTab: tab => set({ activeTab: tab }),
    setProtectionState: update => set(state => ({ protectionState: { ...state.protectionState, ...update } })),
    generateResponse: async (text: string) => {
        set({ isLoading: true });
        try {
            const response = await generateLLMResponse(
                llmService, // Global service
                text,
                get().initialContext || defaultInitialContext,
                get().initialContext?.goals || [],
                get().conversationSummary,
                buildKnowledgeContext,
                DetailedPromptLogging,
                handleError
            );
            set({ streamedContent: response });
        } catch (err) {
            set({ error: (err as Error).message });
        } finally {
            set({ isLoading: false });
        }
    },
}));
