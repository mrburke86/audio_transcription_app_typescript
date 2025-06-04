// // src\hooks\useInterviewContextForm.ts
// import { useState, useCallback } from 'react';
// import { InitialInterviewContext } from '@/types';

// const defaultContext: InitialInterviewContext = {
//     // ===== INTERVIEW SPECIFICS =====
//     // Core interview categorization
//     interviewType: 'sales',
//     targetRole: 'Mid-market Account Executive',
//     targetCompany: 'ETQ',

//     // Enhanced company and industry context
//     companySizeType: 'large-enterprise', // Updated to match new enum options
//     industryVertical: 'saas-software', // Default for QMS software
//     seniorityLevel: 'manager',

//     // Interview logistics and context
//     interviewRound: 'initial', // Default to first round
//     interviewDuration: '60min', // Standard interview duration
//     interviewFormat: 'video-call', // Most common format

//     // Strategic context
//     competitiveContext: 'direct-competitor', // Assume similar role/industry
//     urgencyLevel: 'active', // Balanced urgency level

//     // Interviewer context
//     interviewerProfiles: [
//         {
//             role: 'hiring-manager',
//             name: '',
//             background: '',
//             priorities: [],
//             communicationStyle: 'collaborative',
//         },
//     ],

//     // ===== RESPONSE GENERATION SETTINGS =====
//     // Core response parameters
//     responseConfidence: 'balanced',
//     responseStructure: 'problem-solution-impact', // Updated to match new enum
//     responseVerbosity: 'auto',

//     // Advanced response personalization
//     responsePersonality: 'collaborative', // Good default for sales roles
//     industryLanguage: 'business', // Business language for sales context
//     storyFormat: 'STAR', // Classic structured approach
//     metricsEmphasis: 'percentage-focus', // Good for sales achievements

//     // Response enhancement flags
//     includeMetrics: true,
//     contextDepth: 10,

//     // ===== SESSION FOCUS & CONTENT =====
//     // Strategic goals and emphasis
//     goals: [],
//     emphasizedExperiences: [],
//     specificChallenges: [],

//     // Candidate profile and assets
//     keyAchievements: [], // Initialize as empty list
//     coreSkills: [], // Initialize as empty list

//     // Context and background
//     industry: 'Manufacturing QMS Software', // Additional context field (free-form)
//     companyContext: ['sales_methodology', 'career_achievements'],
//     roleDescription: '',

//     // ===== INTERVIEW STRATEGY =====
//     interviewStrategy: {
//         primaryPositioning: 'growth-driver', // Good default for sales roles
//         keyDifferentiators: [], // Empty by default
//         riskMitigation: [], // Empty by default
//         questionsToAsk: [], // Empty by default
//         followUpStrategy: '24-hour', // Professional standard
//     },
// };
// export function useInterviewContextForm(initialContext?: InitialInterviewContext) {
//     const [context, setContext] = useState<InitialInterviewContext>(initialContext || defaultContext);
//     const [activeTab, setActiveTab] = useState('interview');

//     // Individual field updaters
//     const updateField = useCallback(
//         <K extends keyof InitialInterviewContext>(field: K, value: InitialInterviewContext[K]) => {
//             setContext(prev => ({ ...prev, [field]: value }));
//         },
//         []
//     );

//     // Array operations
//     const addToArray = useCallback(<K extends keyof InitialInterviewContext>(field: K, value: string) => {
//         setContext(prev => {
//             const currentArray = prev[field] as string[];
//             return {
//                 ...prev,
//                 [field]: [...currentArray, value],
//             };
//         });
//     }, []);

//     const removeFromArray = useCallback(<K extends keyof InitialInterviewContext>(field: K, index: number) => {
//         setContext(prev => {
//             const currentArray = prev[field] as string[];
//             return {
//                 ...prev,
//                 [field]: currentArray.filter((_, i) => i !== index),
//             };
//         });
//     }, []);

//     const toggleInArray = useCallback(<K extends keyof InitialInterviewContext>(field: K, value: string) => {
//         setContext(prev => {
//             const array = prev[field] as string[];
//             return {
//                 ...prev,
//                 [field]: array.includes(value) ? array.filter(item => item !== value) : [...array, value],
//             };
//         });
//     }, []);

//     // Validation
//     const isValid = context.targetRole.trim().length > 0;

//     return {
//         context,
//         activeTab,
//         setActiveTab,
//         updateField,
//         addToArray,
//         removeFromArray,
//         toggleInArray,
//         isValid,
//     };
// }
