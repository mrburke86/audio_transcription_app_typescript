import { Message } from './core';
import { ILLMService } from './services';

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
    currentAnalysis?: StrategicOpportunityAnalysis | undefined;
    previousAnalyses: Array<{
        strategic_opportunity: StrategicOpportunityType;
        primary_focus_area: string;
        insight_summary: string;
        timestamp: number;
    }>;
}

export interface ChatState {
    isLoading: boolean;
    error: string | null;
    llmService: ILLMService | null;
    conversationHistory: Message[];
    // ... rest of state
}
