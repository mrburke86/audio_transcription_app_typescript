// src\types\llm.ts

export interface StrategicOpportunityAnalysis {
    strategicOpportunity:
        | 'thought_leadership'
        | 'competitive_intelligence'
        | 'data_storytelling'
        | 'hidden_connections'
        | 'future_vision'
        | 'real_world_evidence';
    insightPotentialSummary: string;
    knowledgeLeverageStrategy: string;
    differentiationApproach: string;
    researchRecommendations: string;
    primaryFocusArea: string;
}

export interface AnalysisHistoryEntry {
    strategicOpportunity: string;
    primaryFocusArea: string; // RENAMED: Consistent with analysis
    insightPotentialSummary: string; // RENAMED/ALIGNED: From insight_summary - now matches analysis
    timestamp: number;
}
export interface StrategicIntelligenceSuggestions {
    strategicIntelligenceContent: string; // RENAMED: From powerUpContent - describes generated markdown intel
    currentAnalysis?: StrategicOpportunityAnalysis; // RENAMED: From lastAnalysis
    previousAnalyses?: AnalysisHistoryEntry[]; // RENAMED: From analysisHistory
}

export interface UseLLMHookReturn {
    // RENAMED: From LLMProviderHook - more React-hook descriptive
    generateResponse: (userMessage: string) => Promise<void>;
    generateSuggestions: () => Promise<void>;
    isLoading: boolean;
    error: string | null;
    streamedContent: string;
    isStreamingComplete: boolean;
    conversationSummary: string;
    strategicSuggestions: StrategicIntelligenceSuggestions; // RENAMED: From conversationSuggestions
}
export interface LLMHookState {
    // RENAMED: From LLMState
    isLoading: boolean;
    error: string | null;
    streamedContent: string;
    isStreamingComplete: boolean;
    conversationSummary: string;
    strategicSuggestions: StrategicIntelligenceSuggestions; // RENAMED
}

export type LLMAction = // Unchanged, but added comments

        | { type: 'SET_LOADING'; payload: boolean }
        | { type: 'SET_ERROR'; payload: string | null }
        | { type: 'APPEND_STREAMED_CONTENT'; payload: string }
        | { type: 'RESET_STREAMED_CONTENT' }
        | { type: 'SET_STREAMING_COMPLETE'; payload: boolean }
        | { type: 'SET_CONVERSATION_SUMMARY'; payload: string }
        | {
              type: 'SET_CONVERSATION_SUGGESTIONS';
              payload: StrategicIntelligenceSuggestions; // UPDATED: Use renamed type
          };
