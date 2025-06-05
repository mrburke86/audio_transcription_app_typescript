// // src/utils/callContextAdapters.ts
// import type { CallContext } from '@/types/callContext';

// // ===== TYPE DEFINITIONS =====

// export interface ResponseConfig {
//     temperature: number;
//     maxTokens: number;
//     responseStyle?: string;
//     tone?: string;
//     includeEmotionalGuidance?: boolean;
//     includeProfessionalTips?: boolean;
//     includeExamples?: boolean;
//     includeStrategicTips?: boolean;
//     includeValueProps?: boolean;
//     prioritizeSpeed?: boolean;
//     structuredResponses?: boolean;
//     handleObjections?: boolean;
//     focusOnLogic?: boolean;
//     includeAlternatives?: boolean;
//     avoidOverthinking?: boolean;
// }

// export interface SearchConfig {
//     maxResults: number;
//     searchScope: string;
//     includeMetadata: boolean;
//     prioritizeRecent: boolean;
//     filters: string[];
// }

// export interface UIConfig {
//     autoAdvanceResponses: boolean;
//     showEmotionalGuidance: boolean;
//     compactMode: boolean;
//     highlightKeyPoints: boolean;
//     showTimerWarnings: boolean;
//     enableQuickActions: boolean;
// }

// export interface SmartDefaults {
//     knowledge_search_enabled?: boolean;
//     knowledge_search_scope?: CallContext['knowledge_search_scope'];
//     response_style?: CallContext['response_style'];
//     verbosity?: CallContext['verbosity'];
//     urgency_level?: CallContext['urgency_level'];
//     sensitivity_level?: CallContext['sensitivity_level'];
//     desired_tone?: CallContext['desired_tone'];
//     communication_approach?: CallContext['communication_approach'];
//     include_emotional_guidance?: boolean;
//     include_professional_tips?: boolean;
// }

// export interface CompleteCallConfig {
//     response: ResponseConfig;
//     search: SearchConfig;
//     ui: UIConfig;
//     smartDefaults: SmartDefaults;
// }

// // ===== CORE ADAPTER FUNCTIONS =====

// /**
//  * 🧠 Adapts LLM response configuration based on call context
//  */
// export const getResponseConfig = (callContext: CallContext): ResponseConfig => {
//     const baseConfig: ResponseConfig = {
//         temperature: 0.7,
//         maxTokens: 500,
//         includeEmotionalGuidance: callContext.include_emotional_guidance,
//         includeProfessionalTips: callContext.include_professional_tips,
//     };

//     // Call-type specific overrides
//     switch (callContext.call_type) {
//         case 'emergency-call':
//             return {
//                 ...baseConfig,
//                 temperature: 0.1,
//                 maxTokens: 150,
//                 responseStyle: 'bullet-points',
//                 prioritizeSpeed: true,
//                 includeProfessionalTips: true,
//                 includeEmotionalGuidance: false,
//             };

//         case 'dating-ask':
//             return {
//                 ...baseConfig,
//                 temperature: 0.8,
//                 maxTokens: 300,
//                 includeEmotionalGuidance: true,
//                 tone: 'warm_and_confident',
//                 avoidOverthinking: true,
//                 includeProfessionalTips: false,
//             };

//         case 'relationship-talk':
//         case 'breakup-call':
//             return {
//                 ...baseConfig,
//                 temperature: 0.6,
//                 maxTokens: 400,
//                 includeEmotionalGuidance: true,
//                 tone: 'empathetic_and_supportive',
//                 includeProfessionalTips: false,
//             };

//         case 'negotiation':
//             return {
//                 ...baseConfig,
//                 temperature: 0.3,
//                 maxTokens: 400,
//                 includeStrategicTips: true,
//                 focusOnLogic: true,
//                 includeAlternatives: true,
//                 structuredResponses: true,
//             };

//         case 'job-interview':
//             return {
//                 ...baseConfig,
//                 temperature: 0.4,
//                 maxTokens: 350,
//                 includeExamples: true,
//                 structuredResponses: true,
//                 includeProfessionalTips: true,
//             };

//         case 'sales-call':
//             return {
//                 ...baseConfig,
//                 temperature: 0.5,
//                 maxTokens: 400,
//                 includeValueProps: true,
//                 handleObjections: true,
//                 includeProfessionalTips: true,
//             };

//         case 'performance-review':
//             return {
//                 ...baseConfig,
//                 temperature: 0.4,
//                 maxTokens: 450,
//                 structuredResponses: true,
//                 includeExamples: true,
//                 includeProfessionalTips: true,
//             };

//         case 'customer-support':
//         case 'technical-support':
//             return {
//                 ...baseConfig,
//                 temperature: 0.3,
//                 maxTokens: 350,
//                 structuredResponses: true,
//                 prioritizeSpeed: true,
//                 includeProfessionalTips: true,
//             };

//         case 'client-meeting':
//         case 'team-meeting':
//             return {
//                 ...baseConfig,
//                 temperature: 0.5,
//                 maxTokens: 400,
//                 structuredResponses: true,
//                 includeProfessionalTips: true,
//             };

//         case 'family-call':
//         case 'friend-checkin':
//         case 'support-call':
//             return {
//                 ...baseConfig,
//                 temperature: 0.7,
//                 maxTokens: 400,
//                 includeEmotionalGuidance: true,
//                 tone: 'warm_and_caring',
//                 includeProfessionalTips: false,
//             };

//         case 'medical-consultation':
//         case 'legal-consultation':
//         case 'financial-advice':
//             return {
//                 ...baseConfig,
//                 temperature: 0.2,
//                 maxTokens: 400,
//                 structuredResponses: true,
//                 includeProfessionalTips: true,
//                 focusOnLogic: true,
//             };

//         case 'conflict-resolution':
//         case 'dispute-resolution':
//             return {
//                 ...baseConfig,
//                 temperature: 0.4,
//                 maxTokens: 450,
//                 includeEmotionalGuidance: true,
//                 includeAlternatives: true,
//                 tone: 'diplomatic_and_calm',
//             };

//         case 'celebration-call':
//             return {
//                 ...baseConfig,
//                 temperature: 0.8,
//                 maxTokens: 300,
//                 tone: 'enthusiastic_and_positive',
//                 includeEmotionalGuidance: true,
//                 includeProfessionalTips: false,
//             };

//         default:
//             return baseConfig;
//     }
// };

// /**
//  * 🔍 Gets knowledge base filters by call context
//  */
// export const getKnowledgeFilter = (callContext: CallContext): string[] => {
//     const baseFilters: Record<CallContext['call_type'], string[]> = {
//         'job-interview': [
//             'resume',
//             'cv',
//             'experience',
//             'skills',
//             'achievements',
//             'company-research',
//             'industry-knowledge',
//             'technical-skills',
//             'behavioral-examples',
//             'questions-to-ask',
//             'interview-prep',
//         ],
//         'performance-review': [
//             'achievements',
//             'goals',
//             'feedback',
//             'development-plans',
//             'metrics',
//             'projects',
//             'career-growth',
//             'self-assessment',
//         ],
//         'sales-call': [
//             'product-info',
//             'features',
//             'benefits',
//             'pricing',
//             'customer-data',
//             'prospect-research',
//             'competitive-analysis',
//             'case-studies',
//             'testimonials',
//             'objection-handling',
//             'closing-techniques',
//         ],
//         'customer-support': [
//             'troubleshooting',
//             'product-documentation',
//             'common-issues',
//             'escalation-procedures',
//             'customer-history',
//             'solutions',
//         ],
//         'client-meeting': [
//             'project-status',
//             'deliverables',
//             'timelines',
//             'requirements',
//             'client-feedback',
//             'next-steps',
//             'stakeholder-info',
//             'project-scope',
//         ],
//         'team-meeting': [
//             'agenda',
//             'action-items',
//             'project-updates',
//             'team-goals',
//             'blockers',
//             'resources',
//             'deadlines',
//             'collaboration',
//         ],
//         negotiation: [
//             'terms',
//             'alternatives',
//             'market-data',
//             'precedents',
//             'leverage-points',
//             'walk-away-options',
//             'win-win-solutions',
//             'concessions',
//         ],
//         'project-discussion': [
//             'project-scope',
//             'requirements',
//             'technical-specs',
//             'timeline',
//             'resources',
//             'risks',
//             'dependencies',
//             'deliverables',
//         ],
//         'hiring-call': [
//             'candidate-profile',
//             'job-requirements',
//             'interview-questions',
//             'assessment-criteria',
//             'company-culture',
//             'compensation',
//         ],
//         'termination-call': [
//             'policies',
//             'procedures',
//             'documentation',
//             'legal-requirements',
//             'transition-plan',
//             'benefits',
//             'final-details',
//         ],
//         'discipline-call': [
//             'performance-issues',
//             'policy-violations',
//             'improvement-plan',
//             'consequences',
//             'documentation',
//             'next-steps',
//         ],
//         'dating-ask': [
//             'conversation-starters',
//             'confidence-tips',
//             'date-ideas',
//             'rejection-handling',
//             'personal-interests',
//             'compatibility',
//         ],
//         'relationship-talk': [
//             'communication-skills',
//             'relationship-goals',
//             'conflict-resolution',
//             'emotional-intelligence',
//             'boundaries',
//             'intimacy',
//         ],
//         'breakup-call': [
//             'breakup-scripts',
//             'emotional-support',
//             'closure-techniques',
//             'self-care',
//             'moving-on',
//             'dignity-preservation',
//         ],
//         'family-call': [
//             'family-dynamics',
//             'shared-memories',
//             'communication-styles',
//             'conflict-resolution',
//             'family-history',
//             'traditions',
//         ],
//         'friend-checkin': [
//             'friendship-maintenance',
//             'social-updates',
//             'support-techniques',
//             'shared-interests',
//             'social-planning',
//             'emotional-support',
//         ],
//         'conflict-resolution': [
//             'mediation-techniques',
//             'communication-strategies',
//             'compromise-options',
//             'relationship-repair',
//             'de-escalation',
//             'common-ground',
//         ],
//         'support-call': [
//             'emotional-support',
//             'crisis-intervention',
//             'coping-strategies',
//             'resources',
//             'professional-help',
//             'safety-planning',
//         ],
//         'celebration-call': [
//             'celebration-ideas',
//             'congratulations',
//             'milestone-recognition',
//             'positive-reinforcement',
//             'future-goals',
//             'gratitude',
//         ],
//         'technical-support': [
//             'technical-documentation',
//             'troubleshooting-guides',
//             'system-specs',
//             'error-codes',
//             'software-updates',
//             'hardware-compatibility',
//         ],
//         'medical-consultation': [
//             'medical-history',
//             'symptoms',
//             'treatments',
//             'medications',
//             'allergies',
//             'family-history',
//             'test-results',
//             'preventive-care',
//         ],
//         'legal-consultation': [
//             'legal-precedents',
//             'case-law',
//             'contracts',
//             'procedures',
//             'rights',
//             'obligations',
//             'documentation',
//             'compliance',
//         ],
//         'financial-advice': [
//             'financial-goals',
//             'budgeting',
//             'investments',
//             'insurance',
//             'tax-planning',
//             'retirement',
//             'debt-management',
//             'credit',
//         ],
//         'dispute-resolution': [
//             'dispute-history',
//             'settlement-options',
//             'legal-rights',
//             'mediation-techniques',
//             'documentation',
//             'resolution-strategies',
//         ],
//         'emergency-call': [
//             'emergency-procedures',
//             'immediate-actions',
//             'safety-protocols',
//             'contact-information',
//             'crisis-response',
//         ],
//     };

//     // Get filters for this call type
//     const typeFilters = baseFilters[callContext.call_type] || [];

//     // Apply urgency-based filtering
//     if (callContext.urgency_level === 'critical') {
//         return typeFilters.slice(0, 3); // Only most relevant for critical calls
//     }

//     if (callContext.urgency_level === 'high') {
//         return typeFilters.slice(0, 5); // Focused set for high urgency
//     }

//     // Apply sensitivity-based filtering
//     if (callContext.sensitivity_level === 'highly-sensitive') {
//         return typeFilters.filter(
//             filter =>
//                 !['personal-info', 'confidential', 'private', 'history'].some(sensitive => filter.includes(sensitive))
//         );
//     }

//     return typeFilters;
// };

// /**
//  * 🎛️ Gets search parameters based on call context
//  */
// export const getSearchConfig = (callContext: CallContext): SearchConfig => {
//     // Get knowledge filters
//     const filters = getKnowledgeFilter(callContext);

//     return {
//         maxResults: callContext.urgency_level === 'critical' ? 2 : callContext.urgency_level === 'high' ? 3 : 5,
//         searchScope: callContext.knowledge_search_scope || 'all',
//         includeMetadata: callContext.sensitivity_level !== 'highly-sensitive',
//         prioritizeRecent: ['emergency-call', 'technical-support', 'customer-support', 'medical-consultation'].includes(
//             callContext.call_type
//         ),
//         filters,
//     };
// };

// /**
//  * 🎨 Gets UI behavior based on call context
//  */
// export const getUIConfig = (callContext: CallContext): UIConfig => {
//     return {
//         autoAdvanceResponses: callContext.urgency_level === 'critical',
//         showEmotionalGuidance: callContext.include_emotional_guidance,
//         compactMode: callContext.response_style === 'bullet-points' || callContext.urgency_level === 'critical',
//         highlightKeyPoints: ['high', 'critical'].includes(callContext.urgency_level),
//         showTimerWarnings: ['emergency-call', 'negotiation'].includes(callContext.call_type),
//         enableQuickActions: callContext.urgency_level === 'critical',
//     };
// };

// /**
//  * 🔧 Gets smart defaults that override basic CallContext defaults
//  */
// export const getSmartDefaults = (callContext: CallContext): SmartDefaults => {
//     const baseDefaults: SmartDefaults = {};

//     switch (callContext.call_type) {
//         case 'emergency-call':
//             return {
//                 ...baseDefaults,
//                 knowledge_search_enabled: false,
//                 response_style: 'bullet-points',
//                 verbosity: 'brief',
//                 urgency_level: 'critical',
//                 sensitivity_level: 'highly-sensitive',
//                 include_emotional_guidance: false,
//                 include_professional_tips: true,
//             };

//         case 'dating-ask':
//         case 'relationship-talk':
//             return {
//                 ...baseDefaults,
//                 include_emotional_guidance: true,
//                 include_professional_tips: false,
//                 desired_tone: 'empathetic',
//                 communication_approach: 'supportive',
//                 sensitivity_level: 'personal',
//                 knowledge_search_scope: 'personal-only',
//             };

//         case 'family-call':
//         case 'friend-checkin':
//         case 'support-call':
//             return {
//                 ...baseDefaults,
//                 include_emotional_guidance: true,
//                 include_professional_tips: false,
//                 desired_tone: 'friendly',
//                 communication_approach: 'supportive',
//                 sensitivity_level: 'personal',
//             };

//         case 'negotiation':
//         case 'sales-call':
//             return {
//                 ...baseDefaults,
//                 include_professional_tips: true,
//                 communication_approach: 'persuasive',
//                 response_style: 'structured',
//             };

//         case 'medical-consultation':
//         case 'legal-consultation':
//             return {
//                 ...baseDefaults,
//                 sensitivity_level: 'highly-sensitive',
//                 response_style: 'structured',
//                 verbosity: 'detailed',
//                 include_professional_tips: true,
//             };

//         case 'job-interview':
//         case 'performance-review':
//             return {
//                 ...baseDefaults,
//                 include_professional_tips: true,
//                 response_style: 'structured',
//                 communication_approach: 'professional',
//             };

//         default:
//             return baseDefaults;
//     }
// };

// /**
//  * 🎯 Gets complete configuration for a call context
//  */
// export const getCompleteCallConfig = (callContext: CallContext): CompleteCallConfig => {
//     return {
//         response: getResponseConfig(callContext),
//         search: getSearchConfig(callContext),
//         ui: getUIConfig(callContext),
//         smartDefaults: getSmartDefaults(callContext),
//     };
// };

// // ===== VALIDATION HELPERS =====

// /**
//  * ✅ Validates that adapter configurations are consistent
//  */
// export const validateAdapterConsistency = (callContext: CallContext): string[] => {
//     const errors: string[] = [];
//     const config = getCompleteCallConfig(callContext);

//     // Check for conflicting settings
//     if (config.smartDefaults.knowledge_search_enabled === false && config.search.maxResults > 0) {
//         errors.push('Knowledge search is disabled but search config expects results');
//     }

//     if (config.response.prioritizeSpeed && config.response.maxTokens > 200) {
//         errors.push('Speed priority conflicts with high token limit');
//     }

//     if (config.ui.compactMode && config.response.includeExamples) {
//         errors.push('Compact mode conflicts with detailed examples');
//     }

//     return errors;
// };

// /**
//  * 📊 Gets performance metrics for adapter configuration
//  */
// export const getConfigMetrics = (callContext: CallContext) => {
//     const config = getCompleteCallConfig(callContext);

//     return {
//         estimatedResponseTime: config.response.prioritizeSpeed ? 'fast' : 'normal',
//         knowledgeSearchDepth: config.search.maxResults,
//         responseComplexity: config.response.maxTokens > 400 ? 'high' : 'low',
//         uiInteractivity: config.ui.enableQuickActions ? 'high' : 'normal',
//     };
// };
