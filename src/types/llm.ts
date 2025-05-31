// src\types\llm.ts

export interface StrategicAnalysis {
    strategic_opportunity:
        | 'thought_leadership'
        | 'competitive_intelligence'
        | 'data_storytelling'
        | 'hidden_connections'
        | 'future_vision'
        | 'real_world_evidence';
    insight_potential: string;
    knowledge_leverage: string;
    differentiation_angle: string;
    research_suggestions: string;
    focus_area: string; // New: More specific focus for variety
}

export interface AnalysisPreview {
    strategic_opportunity: string;
    focus_area: string;
    insight_summary: string; // Enhanced preview that serves dual purpose
    timestamp: number;
}

export interface ConversationSuggestions {
    powerUpContent: string; // The strategic intelligence markdown content
    lastAnalysis?: StrategicAnalysis; // Current analysis for debugging/context
    analysisHistory?: AnalysisPreview[]; // Previous analysis previews for variety
}

export interface LLMState {
    isLoading: boolean;
    error: string | null;
    streamedContent: string;
    isStreamingComplete: boolean;
    conversationSummary: string;
    conversationSuggestions: ConversationSuggestions;
}

export interface LLMProviderHook {
    generateResponse: (userMessage: string) => Promise<void>;
    generateSuggestions: () => Promise<void>;
    isLoading: boolean;
    error: string | null;
    streamedContent: string;
    isStreamingComplete: boolean;
    conversationSummary: string;
    conversationSuggestions: ConversationSuggestions;
}

export interface LLMState {
    isLoading: boolean;
    error: string | null;
    streamedContent: string;
    isStreamingComplete: boolean;
    conversationSummary: string;
    conversationSuggestions: ConversationSuggestions;
}

export type LLMAction =
    | { type: 'SET_LOADING'; payload: boolean }
    | { type: 'SET_ERROR'; payload: string | null }
    | { type: 'APPEND_STREAMED_CONTENT'; payload: string }
    | { type: 'RESET_STREAMED_CONTENT' }
    | { type: 'SET_STREAMING_COMPLETE'; payload: boolean }
    | { type: 'SET_CONVERSATION_SUMMARY'; payload: string }
    | {
          type: 'SET_CONVERSATION_SUGGESTIONS';
          payload: ConversationSuggestions;
      };
