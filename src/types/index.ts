// src/types/index.ts - Consolidated and cleaned types (ALL TYPES MOVED HERE) - UPDATED WITH MISSING TYPES

import OpenAI from 'openai';
import React from 'react';

// ===== CORE MESSAGE TYPES =====
export type MessageType = 'user' | 'assistant' | 'interim';

export interface Message {
    content: string;
    type: MessageType;
    timestamp: string;
}

// ===== OPENAI TYPES (Simplified) =====
export type ChatMessageParam = OpenAI.Chat.Completions.ChatCompletionMessageParam;
export type OpenAIModelName = 'gpt-4o' | 'gpt-4o-mini' | 'gpt-3.5-turbo';

export interface LLMRequestOptions {
    model?: OpenAIModelName;
    temperature?: number;
    max_tokens?: number;
    stream?: boolean;
}

export interface ILLMService {
    generateCompleteResponse(messages: ChatMessageParam[], options?: LLMRequestOptions): Promise<string>;
    generateStreamedResponseChunks?(messages: ChatMessageParam[], options?: LLMRequestOptions): AsyncIterable<string>;
}

// ===== INTERVIEW CONTEXT =====
export interface InitialInterviewContext {
    // Core Interview Details
    interviewType: 'behavioral' | 'technical' | 'case-study' | 'sales' | 'leadership' | 'mixed';
    targetRole: string;
    targetCompany: string;
    companySizeType: 'scaleup' | 'mid-market' | 'enterprise' | 'public';
    industry: string;
    seniorityLevel: 'senior-ic' | 'lead' | 'manager' | 'director' | 'vp' | 'c-level';

    // Response Settings
    responseConfidence: 'conservative' | 'balanced' | 'confident';
    responseStructure: 'story-driven' | 'data-driven' | 'hybrid';
    contextDepth: number;
    includeMetrics: boolean;

    // Content Focus
    goals: string[];
    emphasizedExperiences: string[];
    specificChallenges: string[];
    companyContext: string[];

    // Generated field
    roleDescription: string;
}

// ===== STRATEGIC INTELLIGENCE =====
export type StrategicOpportunityType =
    | 'thought_leadership'
    | 'competitive_intelligence'
    | 'data_storytelling'
    | 'hidden_connections'
    | 'future_vision'
    | 'real_world_evidence';

export interface StrategicOpportunityAnalysis {
    strategic_opportunity: StrategicOpportunityType;
    insight_potential: string;
    primary_focus_area: string;
}

export interface StrategicSuggestions {
    strategicIntelligenceContent: string;
    currentAnalysis?: StrategicOpportunityAnalysis;
    previousAnalyses: Array<{
        strategic_opportunity: StrategicOpportunityType;
        primary_focus_area: string;
        insight_summary: string;
        timestamp: number;
    }>;
}

// ===== CORE APP STATE =====
export interface ChatState {
    // Loading & Errors
    isLoading: boolean;
    error: string | null;

    // LLM Service
    llmService: ILLMService | null;

    // Conversation
    conversationHistory: Message[];
    streamedContent: string;
    isStreamingComplete: boolean;
    conversationSummary: string;
    strategicSuggestions: StrategicSuggestions;

    // Transcripts
    interimTranscriptMessages: Message[];
    currentInterimTranscript: string;

    // Context
    initialContext: InitialInterviewContext;

    // UI State
    activeTab: string;
    protectionState: {
        isAccessAllowed: boolean;
        isValidating: boolean;
        isRedirecting: boolean;
    };
}

// ===== ERROR BOUNDARY =====
export interface ErrorBoundaryProps {
    children: React.ReactNode;
    fallback?: React.ComponentType<ErrorFallbackProps>;
    onError?: (error: Error, errorInfo: React.ErrorInfo) => void;
    showDetails?: boolean;
}

export interface ErrorFallbackProps {
    error: Error;
    resetErrorBoundary: () => void;
    retry?: () => void;
}

// ===== SPEECH RECOGNITION =====
export interface CustomSpeechError {
    code: SpeechRecognitionErrorCode;
    message: string;
}

export type RecognitionStatus = 'inactive' | 'active' | 'error';

// ===== KNOWLEDGE BASE =====
export interface DocumentChunk {
    id: string;
    text: string;
    source: string;
    score?: number;
}

// ===== NAVIGATION =====
export const AppRoutes = {
    HOME: '/',
    CAPTURE_CONTEXT: '/capture-context',
    CHAT: '/chat',
} as const;

export type AppRoute = (typeof AppRoutes)[keyof typeof AppRoutes];

// ===== UTILITY TYPES =====
export type Optional<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;

// ===== HOOK RETURN TYPES =====
export interface UseLLMReturn {
    generateResponse: (userMessage: string) => Promise<void>;
    generateSuggestions: () => Promise<void>;
    isLoading: boolean;
    error: string | null;
    streamedContent: string;
    isStreamingComplete: boolean;
    conversationSummary: string;
    strategicSuggestions: StrategicSuggestions;
}

export interface UseInterviewContextReturn {
    // Core State - guaranteed non-null
    context: InitialInterviewContext;
    isLoading: boolean;
    isContextValid: boolean;

    // Context Management
    updateContext: (context: InitialInterviewContext) => void;
    clearContext: () => void;
    refreshContext: () => void;
    resetToDefaults: () => void;

    // Navigation
    navigateToChat: () => void;
    navigateToContextCapture: () => void;

    // ✅ FORM: Direct field manipulation
    updateField: <K extends keyof InitialInterviewContext>(field: K, value: InitialInterviewContext[K]) => void;
    toggleInArray: <K extends keyof InitialInterviewContext>(field: K, value: string) => void;
}

export interface UseSpeechRecognitionReturn {
    startSpeechRecognition: () => Promise<void>;
    stopSpeechRecognition: () => void;
    startAudioVisualization: (canvas: HTMLCanvasElement) => void;
}

export interface UseRouteProtectionOptions {
    guardedRoutePath: string;
    redirectPath: string;
    showLoading?: boolean;
    customValidation?: () => boolean;
}

export interface UseRouteProtectionReturn {
    isAccessAllowed: boolean;
    isLoading: boolean;
    isRedirecting: boolean;
}

// ===== FORM PROPS =====
export interface InterviewModalProps {
    onSubmit: (context: InitialInterviewContext) => void;
}

// ===== WEB SPEECH API EXTENSIONS =====
declare global {
    interface Window {
        webkitSpeechRecognition: typeof SpeechRecognition;
    }
}

// ===== SPEECH RECOGNITION PROPS (from useSpeechRecognition) =====
export interface SpeechRecognitionProps {
    onStart: () => void;
    onEnd: () => void;
    onError: (error: SpeechRecognitionErrorEvent | CustomSpeechError) => void;
    onResult: (finalTranscript: string, interimTranscript: string) => void;
}

// ===== KNOWLEDGE PROVIDER TYPES (from KnowledgeProvider) =====
export interface IndexingStatus {
    isIndexing: boolean;
    progress: string;
    filesProcessed: number;
    totalFiles: number;
    errors: string[];
}

export interface KnowledgeContextType {
    isLoading: boolean;
    error: string | null;
    searchRelevantKnowledge: (query: string, limit?: number) => Promise<DocumentChunk[]>;
    knowledgeBaseName: string;
    indexedDocumentsCount: number;
    refreshIndexedDocumentsCount: () => Promise<void>;
    triggerIndexing: () => Promise<boolean>;
    indexingStatus: IndexingStatus;
    lastIndexedAt: Date | null;
}

// ===== INTERVIEW MODAL CONTEXT TYPES =====
export interface InterviewModalContextType {
    context: InitialInterviewContext;
    activeTab: string;
    setActiveTab: (tab: string) => void;
    updateField: <K extends keyof InitialInterviewContext>(field: K, value: InitialInterviewContext[K]) => void;
    addToArray: <K extends keyof InitialInterviewContext>(field: K, value: string) => void;
    removeFromArray: <K extends keyof InitialInterviewContext>(field: K, index: number) => void;
    toggleInArray: <K extends keyof InitialInterviewContext>(field: K, value: string) => void;
    isValid: boolean;
    handleSubmit: () => void;
}

// ===== FORM FIELD PROPS =====
export interface FormFieldProps {
    label: string;
    error?: string;
    required?: boolean;
    children: React.ReactNode;
    className?: string;
}
