import { InitialInterviewContext, Message, DocumentChunk } from '@/types';

// Your existing types, reorganized for Zustand
export interface IndexingProgress {
    filesProcessed: number;
    totalFiles: number;
    errors: string[];
    progress: string;
}

export interface StreamingResponse {
    content: string;
    isComplete: boolean;
    timestamp: number;
}

export interface Conversation {
    id: string;
    messages: Message[];
    summary?: string;
    createdAt: Date;
    lastUpdated: Date;
}

export interface AudioSession {
    id: string;
    audioBlob: Blob;
    transcription?: string;
    confidence?: number;
    processedAt: Date;
}

// Domain-specific state interfaces
export interface KnowledgeSlice {
    // State
    indexedDocumentsCount: number;
    knowledgeBaseName: string;
    isLoading: boolean;
    error: string | null;
    lastIndexedAt: Date | null;
    indexingProgress: IndexingProgress;
    searchResults: DocumentChunk[];

    // Actions - these replace your KnowledgeProvider methods
    initializeKnowledgeBase: () => Promise<void>;
    triggerIndexing: () => Promise<boolean>;
    searchRelevantKnowledge: (query: string, limit?: number) => Promise<DocumentChunk[]>;
    refreshIndexedDocumentsCount: () => Promise<void>;
}

export interface LLMSlice {
    // State - replaces your useLLMProviderOptimized state
    conversations: Map<string, Conversation>;
    streamingResponses: Map<string, StreamingResponse>;
    isGenerating: boolean;
    currentStreamId: string | null;
    conversationSummary: string;
    conversationSuggestions: {
        powerUpContent: string;
        lastAnalysis?: any;
        analysisHistory?: any[];
    };

    // Actions - these replace your LLM hook methods
    generateResponse: (userMessage: string) => Promise<void>;
    generateSuggestions: () => Promise<void>;
    summarizeConversation: (messages: Message[]) => Promise<void>;
    stopStreaming: (streamId: string) => void;
    clearConversation: (conversationId: string) => void;
}

export interface SpeechSlice {
    // State - replaces your speech recognition useState calls
    isRecording: boolean;
    isProcessing: boolean;
    recognitionStatus: 'inactive' | 'active' | 'error';
    error: string | null;
    audioSessions: Map<string, AudioSession>;
    currentTranscript: string;
    interimTranscripts: Message[];

    // Actions - these replace your speech hook methods
    startRecording: () => Promise<void>;
    stopRecording: () => void;
    processAudioSession: (sessionId: string) => Promise<string>;
    clearTranscripts: () => void;
    handleRecognitionResult: (finalTranscript: string, interimTranscript: string) => void;
}

export interface InterviewSlice {
    // State - replaces your interview modal state
    context: InitialInterviewContext | null;
    isModalOpen: boolean;
    currentStep: string;
    validationErrors: Record<string, string>;

    // Actions - these replace your interview context methods
    setInterviewContext: (context: InitialInterviewContext) => void;
    openInterviewModal: () => void;
    closeInterviewModal: () => void;
    updateInterviewField: <K extends keyof InitialInterviewContext>(
        field: K,
        value: InitialInterviewContext[K]
    ) => void;
    validateContext: () => boolean;
}

export interface UISlice {
    // State - centralizes all UI state management
    theme: 'light' | 'dark';
    notifications: Array<{
        id: string;
        type: 'success' | 'error' | 'warning' | 'info';
        message: string;
        duration?: number;
        timestamp: number;
    }>;
    modals: Record<string, { isOpen: boolean; props?: any }>;
    isLoading: boolean;
    loadingMessage?: string;

    // Actions - these handle all UI state changes
    setTheme: (theme: 'light' | 'dark') => void;
    addNotification: (notification: Omit<UISlice['notifications'][0], 'id' | 'timestamp'>) => void;
    removeNotification: (id: string) => void;
    openModal: (modalId: string, props?: any) => void;
    closeModal: (modalId: string) => void;
    setLoading: (isLoading: boolean, message?: string) => void;
}

// Combined application state
export interface AppState extends KnowledgeSlice, LLMSlice, SpeechSlice, InterviewSlice, UISlice {}
