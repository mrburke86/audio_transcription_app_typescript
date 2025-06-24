import { CallContext, Message, DocumentChunk, StrategicAnalysis, AnalysisPreview } from '@/types';
import { Nullable } from './storeHelpers';

// Your existing types, reorganized for Zustand
export interface IndexingProgress {
    isIndexing: boolean; // ✅ ADDED: Missing isIndexing flag
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
    isLoading: boolean; // ⚠️ RENAMED: from kbIsLoading
    error: Nullable<string>; // ⚠️ RENAMED: from kbError, used Nullable<T>
    lastIndexedAt: Nullable<Date>; // ⚠️ MODIFIED: Used Nullable<T>
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
    currentStreamId: Nullable<string>; // ⚠️ MODIFIED
    conversationSummary: string;
    conversationSuggestions: {
        powerUpContent: string;
        lastAnalysis?: StrategicAnalysis;
        analysisHistory?: AnalysisPreview[];
    };
    // Missing error states
    llmError: string | null;
    isGeneratingResponse: boolean;
    isGeneratingSuggestions: boolean;
    isSummarizing: boolean;
    // Missing abort controllers
    currentAbortController: AbortController | null;

    // Actions - these replace your LLM hook methods
    generateResponse: (userMessage: string) => Promise<void>;
    generateSuggestions: () => Promise<void>;
    summarizeConversation: (messages: Message[]) => Promise<void>;
    stopStreaming: (streamId: string) => void;
    clearConversation: (conversationId: string) => void;

    clearLLMError: () => void;
    cancelCurrentRequest: () => void;
}

// ✅ FIXED: Updated SpeechSlice to match implementation
export interface SpeechSlice {
    // State - replaces your speech recognition useState calls
    isRecording: boolean;
    speechIsProcessing: boolean;
    recognitionStatus: 'inactive' | 'active' | 'error';
    speechError: Nullable<string>; // ⚠️ MODIFIED
    audioSessions: Map<string, AudioSession>;
    currentTranscript: string;
    interimTranscripts: Message[];

    // ✅ ADDED: Internal state for managing speech APIs
    _recognition: SpeechRecognition | null;
    _mediaStream: MediaStream | null;

    // Actions - these replace your speech hook methods
    startRecording: () => Promise<void>;
    stopRecording: () => void;
    clearTranscripts: () => void;
    handleRecognitionResult: (finalTranscript: string, interimTranscript: string) => void;
    clearError: () => void;

    // ✅ ADDED: New utility methods
    _cleanup: () => void;
    getMediaStream: () => MediaStream | null;
}

export interface CallContextSlice {
    // State - replaces your interview modal state
    context: Nullable<CallContext>; // ⚠️ MODIFIED
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

export interface NotificationEntry {
    id: number;
    type: 'success' | 'error' | 'warning' | 'info';
    message: string;
    duration?: number;
}

export interface UISlice {
    // Simplified state - removed notifications array
    theme: 'light' | 'dark';
    modals: Record<string, { isOpen: boolean; props?: Record<string, unknown> }>;
    notifications: NotificationEntry[];
    isLoading: boolean;
    loadingMessage?: string;
    uiError: Nullable<string>; // ⚠️ MODIFIED

    // Simplified actions using Sonner
    setTheme: (theme: 'light' | 'dark') => void;
    addNotification: (notification: Omit<NotificationEntry, 'id'>) => void;
    removeNotification: (id?: number) => void; // Deprecated but kept for compatibility
    openModal: (modalId: string, props?: Record<string, unknown>) => void;
    closeModal: (modalId: string) => void;
    setLoading: (isLoading: boolean, message?: string) => void;
}

// Combined application state
export interface AppState extends KnowledgeSlice, LLMSlice, SpeechSlice, CallContextSlice, UISlice {}
