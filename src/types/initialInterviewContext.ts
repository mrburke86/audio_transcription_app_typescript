// src/types/initialInterviewContext.ts

export interface InterviewerProfile {
    role: 'hiring-manager' | 'peer' | 'senior-executive' | 'hr' | 'technical-lead' | 'panel-member';
    priorities: string[];
}

export interface InterviewStrategy {
    primaryPositioning: 'problem-solver' | 'growth-driver' | 'efficiency-expert' | 'transformation-leader';
    keyDifferentiators: string[];
    riskMitigation: string[];
    questionsToAsk: string[];
}

export interface Achievement {
    description: string;
    metric?: string;
    context?: string;
}

export interface InitialInterviewContext {
    // ===== 🎯 CORE INTERVIEW CONTEXT (6 ESSENTIAL) =====
    interviewType: 'behavioral' | 'technical' | 'case-study' | 'sales' | 'leadership' | 'mixed';
    targetRole: string;
    targetCompany: string;
    companySizeType: 'startup' | 'scaleup' | 'mid-market' | 'large-enterprise' | 'mega-corp' | 'public-company';
    seniorityLevel: 'senior-ic' | 'lead' | 'manager' | 'director' | 'vp' | 'c-level';
    roleDescription: string;

    // ===== 📋 PREPARATION FOCUS (5 ESSENTIAL) =====
    goals: string[];
    emphasizedExperiences: string[];
    specificChallenges: string[];
    keyAchievements?: Achievement[];
    responseStructure:
        | 'STAR-method'
        | 'problem-solution-impact'
        | 'context-action-result'
        | 'situation-challenge-solution'
        | 'data-story-insight'
        | 'flexible-adaptive';

    // ===== 🏢 CONTEXT & POSITIONING (8 VALUABLE) =====
    industryVertical:
        | 'technology-software'
        | 'financial-services'
        | 'healthcare-biotech'
        | 'manufacturing-industrial'
        | 'consulting-services'
        | 'retail-consumer'
        | 'energy-utilities'
        | 'government-education'
        | 'other';
    interviewRound: 'initial' | 'second' | 'final' | 'panel' | 'technical-deep-dive' | 'presentation';
    interviewDuration: '30min' | '45min' | '60min' | '90min' | 'half-day' | 'full-day';
    competitiveContext: 'direct-competitor' | 'adjacent-industry' | 'career-pivot' | 'internal-transfer' | 'first-role';
    interviewerProfiles: InterviewerProfile[];
    companyContext: string[];
    yearsOfExperience?: number;
    interviewStrategy: InterviewStrategy;

    // ===== ⚙️ RESPONSE CUSTOMIZATION (9 VALUABLE) =====
    responseConfidence: 'conservative' | 'balanced' | 'confident';
    responseVerbosity: 'concise' | 'detailed' | 'auto';
    industryLanguage: 'technical' | 'business' | 'balanced';
    includeMetrics: boolean;
    contextDepth: 'low' | 'medium' | 'high';
    expertiseDomains?: string[];
    coreSkills: string[];
}

export interface LiveInterviewModalProps {
    onSubmit: (context: InitialInterviewContext) => void;
}
