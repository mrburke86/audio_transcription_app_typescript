// src\types\initialInterviewContext.ts

export interface InitialInterviewContext {
    // Interview Specifics
    interviewType: 'behavioral' | 'technical' | 'case-study' | 'sales' | 'leadership' | 'mixed';
    targetRole: string;
    targetCompany: string;
    companySizeType: 'scaleup' | 'mid-market' | 'enterprise' | 'public';
    industry: string;
    seniorityLevel: 'senior-ic' | 'lead' | 'manager' | 'director' | 'vp' | 'c-level';

    // Response Generation Settings
    responseConfidence: 'conservative' | 'balanced' | 'confident';
    responseStructure: 'story-driven' | 'data-driven' | 'hybrid';
    contextDepth: number;
    includeMetrics: boolean;

    // Session Focus
    goals: string[];
    emphasizedExperiences: string[];
    specificChallenges: string[];
    companyContext: string[];

    // System prompt
    roleDescription: string;
}

export interface LiveInterviewModalProps {
    onSubmit: (context: InitialInterviewContext) => void;
}
