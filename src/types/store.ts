import { CallContext, Message, DocumentChunk } from '@/types';

// Your existing types, reorganized for Zustand
export interface IndexingProgress {
    isIndexing?: boolean; // ✅ ADDED: Missing isIndexing flag
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

    // Actions - ✅ FIXED: Added missing initializeKnowledgeBase
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

// ✅ FIXED: Updated SpeechSlice to match implementation
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
    clearError: () => void;
}

export interface CallContextSlice {
    // State - replaces your interview modal state
    context: CallContext | null;
    isModalOpen: boolean;
    currentSetupStep: string; // Rename: Clarifies purpose
    validationErrors: Record<string, string>;

    // Actions - renamed for broader scope
    setCallContext: (context: CallContext) => void;
    openSetupModal: () => void;
    closeSetupModal: () => void;
    updateContextField: <K extends keyof CallContext>(field: K, value: CallContext[K]) => void;
    validateContext: () => boolean;

    // ✅ ADD: Enhanced workflow methods
    nextSetupStep: () => void;
    previousSetupStep: () => void;
    resetSetupFlow: () => void;
}

export interface UISlice {
    // Simplified state - removed notifications array
    theme: 'light' | 'dark';
    modals: Record<string, { isOpen: boolean; props?: any }>;
    isLoading: boolean;
    loadingMessage?: string;

    // Simplified actions using Sonner
    setTheme: (theme: 'light' | 'dark') => void;
    addNotification: (notification: {
        type: 'success' | 'error' | 'warning' | 'info';
        message: string;
        duration?: number;
    }) => void;
    removeNotification: () => void; // Deprecated but kept for compatibility
    openModal: (modalId: string, props?: any) => void;
    closeModal: (modalId: string) => void;
    setLoading: (isLoading: boolean, message?: string) => void;
}

// Combined application state
export interface AppState extends KnowledgeSlice, LLMSlice, SpeechSlice, CallContextSlice, UISlice {}
