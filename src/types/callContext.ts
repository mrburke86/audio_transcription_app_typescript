// src/types/callContext.ts

export interface Participant {
    name?: string;
    relationship:
        | 'colleague'
        | 'manager'
        | 'direct-report'
        | 'client'
        | 'prospect'
        | 'customer'
        | 'partner'
        | 'friend'
        | 'family'
        | 'romantic-interest'
        | 'spouse'
        | 'stranger'
        | 'authority';
    // current_sentiment?: 'positive' | 'neutral' | 'frustrated' | 'angry' | 'sad' | 'unknown';
    // background?: string;
    // priorities?: string[];
    // power_dynamic?: 'equal' | 'you-higher' | 'them-higher' | 'neutral';
}

export interface CallObjective {
    primary_goal: string;
    success_metrics: string[];
    // potential_obstacles: string[];
    // fallback_strategies: string[];
}

export interface CallContext {
    // Core call identification
    call_type:
        | 'job-interview'
        | 'performance-review'
        | 'sales-call'
        | 'customer-support'
        | 'client-meeting'
        | 'team-meeting'
        | 'negotiation'
        | 'project-discussion'
        | 'hiring-call'
        | 'termination-call'
        | 'discipline-call'
        | 'dating-ask'
        | 'relationship-talk'
        | 'breakup-call'
        | 'family-call'
        | 'friend-checkin'
        | 'conflict-resolution'
        | 'support-call'
        | 'celebration-call'
        | 'technical-support'
        | 'medical-consultation'
        | 'legal-consultation'
        | 'financial-advice'
        | 'dispute-resolution'
        | 'emergency-call';

    call_context: 'professional' | 'personal' | 'service' | 'emergency';
    urgency_level: 'low' | 'medium' | 'high' | 'critical';
    sensitivity_level: 'public' | 'confidential' | 'personal' | 'highly-sensitive';

    // Participants and relationships
    participants?: Participant[];
    objectives?: CallObjective[];
    key_points: string[];

    // Objectives and strategy
    desired_tone: 'professional' | 'friendly' | 'empathetic' | 'assertive' | 'casual' | 'formal';
    response_style: 'structured' | 'conversational' | 'bullet-points' | 'script-like';
    verbosity: 'brief' | 'moderate' | 'detailed';

    // Response preferences
    knowledge_search_enabled: boolean;
    include_emotional_guidance: boolean;
    include_professional_tips: boolean;

    // Interview Specific
    target_organization?: string;
    target_role?: string;

    // Content focus
    // sensitive_topics?: string[];
    // questions_to_ask?: string[];

    // Strategy
    // communication_approach: 'direct' | 'diplomatic' | 'collaborative' | 'supportive' | 'persuasive' | 'professional';

    // Session metadata
    // estimated_duration?: string;
    // follow_up_required?: boolean;
    // documentation_needed?: boolean;

    // Knowledge integration
    // knowledge_search_scope?: 'all' | 'professional-only' | 'personal-only';
}

// // Predefined options for dropdowns and selections
// export const CALL_TYPES_BY_CONTEXT = {
//     professional: [
//         {
//             value: 'job-interview',
//             label: '💼 Job Interview',
//             description: 'Behavioral, technical, or panel interviews',
//         },
//         {
//             value: 'performance-review',
//             label: '📊 Performance Review',
//             description: 'Annual reviews, check-ins, feedback sessions',
//         },
//         { value: 'sales-call', label: '💰 Sales Call', description: 'Prospecting, demos, negotiations, closing' },
//         {
//             value: 'customer-support',
//             label: '🎧 Customer Support',
//             description: 'Help desk, troubleshooting, escalations',
//         },
//         {
//             value: 'client-meeting',
//             label: '🤝 Client Meeting',
//             description: 'Project updates, requirements, presentations',
//         },
//         { value: 'team-meeting', label: '👥 Team Meeting', description: 'Standups, planning, retrospectives' },
//         { value: 'negotiation', label: '⚖️ Negotiation', description: 'Contracts, deals, terms discussions' },
//         {
//             value: 'project-discussion',
//             label: '📋 Project Discussion',
//             description: 'Planning, status updates, problem-solving',
//         },
//         { value: 'hiring-call', label: '🎯 Hiring Call', description: 'Recruiting, screening, reference checks' },
//         {
//             value: 'termination-call',
//             label: '⚠️ Termination Call',
//             description: 'Layoffs, firing, separation discussions',
//         },
//         { value: 'discipline-call', label: '📢 Discipline Call', description: 'Performance issues, policy violations' },
//     ],
//     personal: [
//         { value: 'dating-ask', label: '💕 Dating Ask', description: 'Asking someone out, romantic interest' },
//         {
//             value: 'relationship-talk',
//             label: '❤️ Relationship Talk',
//             description: 'DTR, relationship issues, commitment',
//         },
//         {
//             value: 'breakup-call',
//             label: '💔 Breakup Call',
//             description: 'Ending relationships, difficult conversations',
//         },
//         { value: 'family-call', label: '👨‍👩‍👧‍👦 Family Call', description: 'Family updates, planning, serious discussions' },
//         { value: 'friend-checkin', label: '👋 Friend Check-in', description: 'Catching up, support, social plans' },
//         {
//             value: 'conflict-resolution',
//             label: '🤝 Conflict Resolution',
//             description: 'Resolving disputes, making amends',
//         },
//         { value: 'support-call', label: '🤗 Support Call', description: 'Emotional support, crisis intervention' },
//         { value: 'celebration-call', label: '🎉 Celebration Call', description: 'Good news, achievements, milestones' },
//     ],
//     service: [
//         {
//             value: 'technical-support',
//             label: '🔧 Technical Support',
//             description: 'IT help, software issues, troubleshooting',
//         },
//         {
//             value: 'medical-consultation',
//             label: '🏥 Medical Consultation',
//             description: 'Doctor visits, health discussions',
//         },
//         {
//             value: 'legal-consultation',
//             label: '⚖️ Legal Consultation',
//             description: 'Legal advice, contracts, disputes',
//         },
//         { value: 'financial-advice', label: '💳 Financial Advice', description: 'Banking, investments, insurance' },
//         {
//             value: 'dispute-resolution',
//             label: '🤝 Dispute Resolution',
//             description: 'Customer service, complaints, refunds',
//         },
//     ],
//     emergency: [
//         {
//             value: 'emergency-call',
//             label: '🚨 Emergency Call',
//             description: 'Crisis situations requiring immediate attention',
//         },
//     ],
// } as const;

// export const TONE_OPTIONS = [
//     { value: 'professional', label: '💼 Professional', description: 'Business-appropriate, formal tone' },
//     { value: 'friendly', label: '😊 Friendly', description: 'Warm, approachable, personable' },
//     { value: 'empathetic', label: '❤️ Empathetic', description: 'Understanding, compassionate, supportive' },
//     { value: 'assertive', label: '💪 Assertive', description: 'Confident, direct, strong presence' },
//     { value: 'casual', label: '😎 Casual', description: 'Relaxed, informal, conversational' },
//     { value: 'formal', label: '🎩 Formal', description: 'Structured, traditional, respectful' },
// ] as const;

// export const COMMUNICATION_APPROACHES = [
//     { value: 'direct', label: '🎯 Direct', description: 'Straight to the point, clear, unambiguous' },
//     { value: 'diplomatic', label: '🤝 Diplomatic', description: 'Tactful, considerate, politically aware' },
//     { value: 'collaborative', label: '👥 Collaborative', description: 'Team-oriented, inclusive, partnership-focused' },
//     { value: 'supportive', label: '🤗 Supportive', description: 'Encouraging, helpful, solution-oriented' },
//     { value: 'persuasive', label: '💡 Persuasive', description: 'Influential, compelling, results-driven' },
// ] as const;

// export const URGENCY_LEVELS = [
//     { value: 'low', label: '🟢 Low', description: 'Routine, non-urgent, can wait' },
//     { value: 'medium', label: '🟡 Medium', description: 'Important but not critical' },
//     { value: 'high', label: '🟠 High', description: 'Time-sensitive, important' },
//     { value: 'critical', label: '🔴 Critical', description: 'Urgent, immediate attention required' },
// ] as const;

// export const SENSITIVITY_LEVELS = [
//     { value: 'public', label: '📢 Public', description: 'Open, shareable information' },
//     { value: 'confidential', label: '🔒 Confidential', description: 'Business sensitive, limited sharing' },
//     { value: 'personal', label: '👤 Personal', description: 'Private personal information' },
//     { value: 'highly-sensitive', label: '🔐 Highly Sensitive', description: 'Extremely private, maximum protection' },
// ] as const;

// // Validation helpers
// export function validateContext(context: Partial<CallContext>): string[] {
//     const errors: string[] = [];

//     if (!context.call_type) errors.push('Call type is required');
//     if (!context.call_context) errors.push('Call context is required');
//     if (!context.key_points || context.key_points.length === 0) errors.push('At least one key point is required');
//     if (!context.objectives || context.objectives.length === 0) errors.push('At least one objective is required');

//     // Validate objectives
//     if (context.objectives) {
//         context.objectives.forEach((obj, index) => {
//             if (!obj.primary_goal || obj.primary_goal.trim() === '') {
//                 errors.push(`Objective ${index + 1} is missing a primary goal`);
//             }
//         });
//     }

//     // Emergency call specific validation
//     if (context.call_type === 'emergency-call') {
//         if (context.knowledge_search_enabled) {
//             errors.push('Knowledge search should be disabled for emergency calls');
//         }
//     }

//     return errors;
// }

// ✅ FIXED: Complete default context factory with all required properties
export function createDefaultCallContext(callType?: CallContext['call_type']): CallContext {
    const selectedCallType = callType || 'sales-call';

    const baseContext: CallContext = {
        // Core identification
        call_type: selectedCallType,
        call_context: getCallContextType(selectedCallType),

        // Urgency and sensitivity
        urgency_level: 'medium',
        sensitivity_level: 'confidential',

        // ✅ ADD: Missing required properties with sensible defaults
        desired_tone: 'professional',
        // communication_approach: 'collaborative',
        key_points: ['Initial discussion point'],
        response_style: 'structured',
        verbosity: 'moderate',
        include_emotional_guidance: false,
        include_professional_tips: true,

        // Knowledge settings
        knowledge_search_enabled: true,
        // knowledge_search_scope: 'all',

        // Optional properties with defaults
        objectives: [
            {
                primary_goal: 'Successful call completion',
                success_metrics: [],
                // potential_obstacles: [],
                // fallback_strategies: [],
            },
        ],
    };

    return baseContext;
}

// ✅ FIXED: Helper for basic context classification with safer lookup
function getCallContextType(
    callType?: CallContext['call_type']
): 'professional' | 'personal' | 'service' | 'emergency' {
    if (!callType) return 'professional';

    // ✅ Safer approach: Use a Map or complete mapping
    const contextMap: Record<string, 'professional' | 'personal' | 'service' | 'emergency'> = {
        'emergency-call': 'emergency',
        'medical-consultation': 'service',
        'legal-consultation': 'service',
        'technical-support': 'service',
        'financial-advice': 'service',
        'dispute-resolution': 'service',
        'dating-ask': 'personal',
        'relationship-talk': 'personal',
        'breakup-call': 'personal',
        'family-call': 'personal',
        'friend-checkin': 'personal',
        'conflict-resolution': 'personal',
        'support-call': 'personal',
        'celebration-call': 'personal',
        // ✅ ADD: Missing professional types
        'job-interview': 'professional',
        'performance-review': 'professional',
        'sales-call': 'professional',
        'customer-support': 'professional',
        'client-meeting': 'professional',
        'team-meeting': 'professional',
        negotiation: 'professional',
        'project-discussion': 'professional',
        'hiring-call': 'professional',
        'termination-call': 'professional',
        'discipline-call': 'professional',
    };

    // ✅ Safe lookup with fallback
    return contextMap[callType] || 'professional';
}

// ✅ ADD: Simple factory for basic contexts (for quick setup)
export function createBasicCallContext(
    callType: CallContext['call_type'] = 'sales-call',
    keyPoints: string[] = ['Basic discussion']
): CallContext {
    return {
        call_type: callType,
        call_context: getCallContextType(callType),
        urgency_level: 'medium',
        sensitivity_level: 'confidential',
        desired_tone: 'professional',
        // communication_approach: 'collaborative',
        key_points: keyPoints,
        response_style: 'structured',
        verbosity: 'moderate',
        include_emotional_guidance: false,
        include_professional_tips: true,
        knowledge_search_enabled: true,
        objectives: [
            {
                primary_goal: 'Successful communication',
                success_metrics: [],
                // potential_obstacles: [],
                // fallback_strategies: [],
            },
        ],
    };
}
