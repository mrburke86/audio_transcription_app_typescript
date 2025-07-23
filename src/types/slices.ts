// src\types\slices.ts

import { InitialInterviewContext, Message } from './core';
import { UseRouteProtectionOptions, UseRouteProtectionReturn } from './hooks';
import { ILLMService, RecognitionStatus } from './services';
import { StrategicSuggestions } from './state';

/* ------------- Chat Slice ------------- */
// Chat Slice: Manages core conversation state, including message history and related actions.
// This slice focuses on persistent chat data (e.g., user/assistant messages), separating it
export interface ChatSlice {
    conversationHistory: Message[];

    // ✅ TYPED MESSAGE CREATORS (eliminates duplication)
    addUserMessage: (content: string) => void;
    addAssistantMessage: (content: string) => void;
    addInterimMessage: (content: string) => void;
    addSystemMessage: (content: string) => void;

    // ✅ GENERIC MESSAGE CREATOR (fallback)
    addMessage: (message: Omit<Message, 'id'>) => void;

    // ✅ BATCH OPERATIONS
    addMessages: (messages: Omit<Message, 'id'>[]) => void;

    // ✅ MESSAGE MANAGEMENT
    removeMessage: (messageId: string) => void;
    updateMessage: (messageId: string, updates: Partial<Pick<Message, 'content' | 'type'>>) => void;
    clearHistory: () => void;

    // ✅ COMPUTED SELECTORS
    getUserMessages: () => Message[];
    getAssistantMessages: () => Message[];
    getLastMessage: () => Message | null;
    getMessageCount: () => number;

    // ✅ DEV UTILITIES
    __dev_logSliceState: () => void;
}

/* ----------- Context Slice ------------ */
//  Context Slice: Manages initial context for interviews, including default values and updates.
// This slice isolates context management to allow for reusable context handling across different features, such as mod
export const DEFAULT_INTERVIEW_CONTEXT: InitialInterviewContext = {
    interviewType: 'sales',
    targetRole: 'Mid-market Account Executive',
    targetCompany: 'ETQ',
    companySizeType: 'enterprise',
    industry: 'Manufacturing QMS Software',
    seniorityLevel: 'manager',
    responseConfidence: 'balanced',
    responseStructure: 'story-driven',
    contextDepth: 10,
    includeMetrics: true,
    goals: ['Demonstrate my expertise and value'],
    emphasizedExperiences: ['Sales achievements and revenue growth'],
    specificChallenges: ['Difficult client or stakeholder situations'],
    companyContext: ['sales_methodology', 'career_achievements'],
    roleDescription: '',
};

export interface ContextSlice {
    /** Selector: Returns true if context is fully valid (core fields + non-empty arrays). */
    isContextValid: () => boolean;
    initialContext: InitialInterviewContext;
    /** Action: Sets the full context; also sets contextLoading to false. */
    setInitialContext: (context: InitialInterviewContext) => void;
    /** Action: Resets to DEFAULT_INTERVIEW_CONTEXT; sets loading false. */
    resetToDefaultContext: () => void;
    /** Action: Creates a new empty context (with defaults where required). */
    createNewContext: () => InitialInterviewContext;
    /** Action: Merges partial updates into current context. */
    updateContextWithDefaults: (updates: Partial<InitialInterviewContext>) => void;
    /** State: True during context loading/hydration (e.g., from persist). */
    contextLoading: boolean;
    /** Action: Sets loading state (e.g., true on init, false post-set). */
    setContextLoading: (loading: boolean) => void;
    /** Action: Updates only the targetRole field; rejects invalid context. */
    updateTargetRole: (role: string) => void;

    /** Action: Updates only the targetCompany field; rejects invalid context. */
    updateTargetCompany: (company: string) => void;

    /** Action: Adds a goal to the goals array (deduplicated & validated). */
    addGoal: (goal: string) => void;

    /** Action: Removes a goal from the goals array (if present). */
    removeGoal: (goal: string) => void;
}

/* ----------- Knowledge Slice ---------- */
// Knowledge Slice: Manages knowledge indexing, retrieval, and related operations.
// This slice handles knowledge-related tasks, such as searching and indexing, to keep LLM operations
export interface IndexingStatus {
    isIndexing: boolean;
    progress: string;
    filesProcessed: number;
    totalFiles: number;
    errors: string[];
}

export interface DocumentChunk {
    id: string;
    text: string;
    source: string;
    score?: number;
}

export interface QdrantPayload {
    text: string;
    source: string;
    chunk_index: number;
    chunk_length: number;
    total_chunks: number;
    processed_at: string;
}

export interface KnowledgeSlice {
    knowledgeLoading: boolean;
    knowledgeError: string | null;
    indexedDocumentsCount: number;
    lastIndexedAt: Date | null;
    indexingStatus: IndexingStatus;
    knowledgeBaseName: string;
    initializeKnowledgeBase: () => Promise<void>;
    refreshIndexedDocumentsCount: () => Promise<void>;
    triggerIndexing: () => Promise<boolean>;
    searchRelevantKnowledge: (query: string, limit?: number) => Promise<DocumentChunk[]>;
}

/* ------------- LLM Slice -------------- */
// LLM Slice: Handles all interactions with the Language Model service, including initialization, response generation, streaming, and suggestions.
// This slice encapsulates AI-related operations and state (e.g., loading, errors, streamed
export interface LLMSlice {
    llmService: ILLMService | null;
    streamedContent: string;
    isStreamingComplete: boolean;
    conversationSummary: string;
    strategicSuggestions: StrategicSuggestions;
    llmLoading: boolean;
    llmError: string | null;
    initializeLLMService: (apiKey: string) => void;
    generateResponse: (text: string, knowledgeContext?: string) => Promise<void>;
    generateSuggestions: (knowledgeContext?: string) => Promise<void>;
    summarizeConversation: () => Promise<void>;
    appendStreamedContent: (content: string) => void;
    resetStreamedContent: () => void;
    setStreamingComplete: (isComplete: boolean) => void;
    setLlmLoading: (isLoading: boolean) => void;
    setLlmError: (error: string | null) => void;
}

/* ------------ Speech Slice ------------ */
// Speech Slice: Manages speech recognition and transcript state, including interim/final transcripts and clearing actions.
// This slice groups audio/transcription logic to isolate it from chat history or LLM, supporting independent updates during recognition without affecting broader conversation state.
export interface SpeechSlice {
    // ✅ TRANSCRIPT STATE (existing)
    interimTranscriptMessages: Message[];
    currentInterimTranscript: string;

    // ✅ RECOGNITION STATE (moved from useSpeechManager)
    recognitionStatus: RecognitionStatus;
    speechErrorMessage: string | null;

    // ✅ VISUALIZATION STATE (moved from useAudioVisualization)
    isVisualizationActive: boolean;

    // ✅ CONSOLIDATED ACTIONS
    // Transcript actions
    addInterimTranscriptMessage: (messageWithoutId: Omit<Message, 'id'>) => void;
    updateCurrentInterimTranscript: (transcript: string) => void;
    clearInterimTranscripts: () => void;
    clearAllTranscripts: () => void;

    // Recognition actions
    setRecognitionStatus: (status: RecognitionStatus) => void;
    setSpeechError: (error: string | null) => void;

    // Visualization actions
    setVisualizationActive: (active: boolean) => void;

    // ✅ HIGH-LEVEL COMBINED ACTIONS
    startSpeechSession: () => void;
    stopSpeechSession: () => void;
    resetSpeechState: () => void;

    // ✅ COMPUTED STATE
    isRecording: () => boolean;
    hasTranscriptions: () => boolean;
    getAllTranscriptionText: () => string;
}

export const SPEECH_ERROR_MESSAGES = {
    network: 'Network error. Please check your internet connection.',
    'not-allowed': 'Microphone access denied. Please allow microphone access in your browser settings.',
    'service-not-allowed': 'Speech recognition service not allowed. Please check your browser settings.',
    'no-speech': '',
    'audio-capture': 'Audio capture failed. Please check your microphone.',
    aborted: 'Speech recognition was aborted.',
    'language-not-supported': 'Language not supported. Please try a different language.',
    'bad-grammar': 'Grammar configuration issue. Please contact support.',
} as const;

/* -------------- UI Slice -------------- */
// UI Slice: Manages UI state, including active tabs and protection states.
// This slice isolates UI concerns to prevent re-renders in data-heavy parts of the app,
export interface UISlice {
    activeTab: string;
    protectionState: {
        isAccessAllowed: boolean;
        isValidating: boolean;
        isRedirecting: boolean;
    };
    routeOptions: UseRouteProtectionOptions | undefined;
    getProtectionStatus: () => UseRouteProtectionReturn;
    setActiveTab: (tab: string) => void;
    setProtectionState: (update: Partial<UISlice['protectionState']>) => void;
    setRouteOptions: (options: UseRouteProtectionOptions) => void;
    navigateToChat: () => void;
    navigateToContextCapture: () => void;
}
