// src\types\store.ts
import { CallContext, Message, DocumentChunk, StrategicAnalysis, AnalysisPreview } from '@/types';
import { Nullable } from './storeHelpers';
import type { UseBoundStore, StoreApi } from 'zustand';

/**
 * UI State Boundaries:
 *
 * GLOBAL UI STATE (UI Slice):
 * - App theme
 * - Global notifications (toasts)
 * - App-level modals (error dialogs, app settings, etc.)
 * - Global loading overlay (for app-level operations)
 * - Global UI errors
 *
 * SLICE-SPECIFIC STATE:
 * - Domain-specific loading states that other components need
 * - Domain-specific errors and success states
 * - Domain-specific modal states (if tightly coupled to domain)
 *
 * COMPONENT-LOCAL STATE:
 * - Temporary UI state (form inputs, local toggles)
 * - Component-specific loading (that doesn't need to be shared)
 * - Transient visual states
 */

declare global {
    interface Window {
        // __appStore?: typeof useAppStore;
        SpeechRecognition?: typeof SpeechRecognition;
        webkitSpeechRecognition?: typeof SpeechRecognition;
    }

    interface GlobalThis {
        __appStore?: UseBoundStore<StoreApi<AppState>>;
    }

    interface GlobalWindow extends Window {
        __appStore?: UseBoundStore<StoreApi<AppState>>;
    }
}

export interface NotificationEntry {
    id: number;
    type: 'success' | 'error' | 'warning' | 'info';
    message: string;
    duration?: number;
}

// ✅ ADDED: Structured global loading state
export interface GlobalLoadingState {
    isActive: boolean;
    message?: string;
    source?: string; // Which feature/slice triggered the loading
}

// ✅ ADDED: Global modal management (app-level only)
export interface GlobalModalState {
    isOpen: boolean;
    props?: Record<string, unknown>;
}

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

// ✅ CLARIFIED: Domain-specific loading states remain in their slices
export interface KnowledgeSlice {
    // ===== KNOWLEDGE STATE =====
    indexedDocumentsCount: number;
    knowledgeBaseName: string;

    // ✅ CLARIFIED: Knowledge-specific loading (other components need this)
    isLoading: boolean; // Domain-specific loading that UI needs to show
    error: Nullable<string>; // Domain-specific errors

    lastIndexedAt: Nullable<Date>;
    indexingProgress: IndexingProgress;
    searchResults: DocumentChunk[];

    // ===== KNOWLEDGE ACTIONS =====
    initializeKnowledgeBase: () => Promise<void>;
    triggerIndexing: () => Promise<boolean>;
    searchRelevantKnowledge: (query: string, limit?: number) => Promise<DocumentChunk[]>;
    refreshIndexedDocumentsCount: () => Promise<void>;
}

export interface LLMSlice {
    // ===== LLM STATE =====
    conversations: Map<string, Conversation>;
    streamingResponses: Map<string, StreamingResponse>;

    // ✅ CLARIFIED: LLM-specific loading states (other components need these)
    isGenerating: boolean; // General LLM operation indicator
    isGeneratingResponse: boolean; // Specific response generation
    isGeneratingSuggestions: boolean; // Specific suggestion generation
    isSummarizing: boolean; // Specific summarization

    currentStreamId: Nullable<string>;
    conversationSummary: string;
    conversationSuggestions: {
        powerUpContent: string;
        lastAnalysis?: StrategicAnalysis;
        analysisHistory?: AnalysisPreview[];
    };

    // ✅ CLARIFIED: LLM-specific errors
    llmError: string | null; // Domain-specific errors
    currentAbortController: AbortController | null;

    // ===== LLM ACTIONS =====
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
    // ===== SPEECH STATE =====
    isRecording: boolean;

    // ✅ CLARIFIED: Speech-specific processing (other components need this)
    speechIsProcessing: boolean; // Domain-specific loading

    recognitionStatus: 'inactive' | 'active' | 'error';
    speechError: Nullable<string>; // Domain-specific errors
    audioSessions: Map<string, AudioSession>;
    currentTranscript: string;
    interimTranscripts: Message[];

    // Internal state for managing speech APIs
    _recognition: SpeechRecognition | null;
    _mediaStream: MediaStream | null;

    // ===== SPEECH ACTIONS =====
    startRecording: () => Promise<void>;
    stopRecording: () => void;
    clearTranscripts: () => void;
    handleRecognitionResult: (finalTranscript: string, interimTranscript: string) => void;
    clearError: () => void;
    _cleanup: () => void;
    getMediaStream: () => MediaStream | null;
}
export interface CallContextSlice {
    // ===== CALL CONTEXT STATE =====
    context: Nullable<CallContext>;

    // ✅ REMOVED: isModalOpen - use global modal system instead
    // ❌ isModalOpen: boolean;

    currentSetupStep: string;
    validationErrors: Record<string, string>;

    // ===== CALL CONTEXT ACTIONS =====
    setCallContext: (context: CallContext) => void;

    // ✅ MODIFIED: Use global modal system
    openSetupModal: () => void; // Will call openGlobalModal
    closeSetupModal: () => void; // Will call closeGlobalModal

    updateContextField: <K extends keyof CallContext>(field: K, value: CallContext[K]) => void;
    validateContext: () => boolean;
    nextSetupStep: () => void;
    previousSetupStep: () => void;
    resetSetupFlow: () => void;
}

export interface UISlice {
    // ===== GLOBAL UI STATE =====

    // ✅ CLARIFIED: App theme
    theme: 'light' | 'dark';

    // ✅ RENAMED: App-level modals only (not domain-specific modals)
    globalModals: Record<string, GlobalModalState>; // ⚠️ RENAMED: from 'modals'

    // ✅ CLARIFIED: App-level notifications
    notifications: NotificationEntry[];

    // ✅ STRUCTURED: Global loading overlay for app-level operations
    globalLoading: GlobalLoadingState; // ⚠️ MODIFIED: from 'isLoading' and 'loadingMessage'

    // ✅ RENAMED: Global UI errors (not domain-specific)
    globalError: Nullable<string>; // ⚠️ RENAMED: from 'uiError'

    // ===== GLOBAL UI ACTIONS =====

    // Theme management
    setTheme: (theme: 'light' | 'dark') => void;

    // Notification management
    addNotification: (notification: Omit<NotificationEntry, 'id'>) => void;
    removeNotification: (id?: number) => void;

    // Global modal management (app-level only)
    openGlobalModal: (modalId: string, props?: Record<string, unknown>) => void; // ⚠️ RENAMED: from 'openModal'
    closeGlobalModal: (modalId: string) => void; // ⚠️ RENAMED: from 'closeModal'

    // Global loading management (app-level only)
    setGlobalLoading: (isActive: boolean, message?: string, source?: string) => void; // ⚠️ RENAMED: from 'setLoading'

    // Error management
    clearGlobalError: () => void; // ⚠️ RENAMED: from 'clearUIError'

    // Utility methods
    closeAllGlobalModals: () => void; // ⚠️ RENAMED: from 'closeAllModals'
    resetGlobalUIState: () => void; // ⚠️ RENAMED: from 'resetUIState'

    // ✅ ADDED: Helper to check if any domain is loading
    isAnyDomainLoading: () => boolean;
}

// Combined application state
export interface AppState extends KnowledgeSlice, LLMSlice, SpeechSlice, CallContextSlice, UISlice {}
