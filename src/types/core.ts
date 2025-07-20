// Core business domain types
export type MessageType = 'user' | 'assistant' | 'interim';

export interface Message {
    id: string;
    content: string;
    type: MessageType;
    timestamp: string;
}

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

    // Content Focus (required; defaults ensure non-empty)
    goals: string[]; // Min length 1 in validation
    emphasizedExperiences: string[]; // Min length 1
    specificChallenges: string[]; // Min length 1
    companyContext: string[]; // Min length 1

    // Generated field (optional)
    roleDescription?: string; // Explicit optional
}

export const AppRoutes = { HOME: '/', CAPTURE_CONTEXT: '/capture-context', CHAT: '/chat' } as const;

export type AppRoute = (typeof AppRoutes)[keyof typeof AppRoutes];
