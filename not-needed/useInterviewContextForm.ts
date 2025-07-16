// // src/hooks/useInterviewContextForm.ts
// // FIXED: Migrate local to store (use initialContext from chatStore, actions like updateContextField); descriptive names (e.g., updateContextField, addToContextArray).
// 'use client';
// import { useChatStore } from '@/stores/chatStore'; // NEW
// import { InitialInterviewContext } from '@/types';
// import { useCallback } from 'react';

// const defaultContext: InitialInterviewContext = {
//     interviewType: 'sales',
//     targetRole: 'Mid-market Account Executive',
//     targetCompany: 'ETQ',
//     companySizeType: 'enterprise',
//     industry: 'Manufacturing QMS Software',
//     seniorityLevel: 'manager',
//     responseConfidence: 'balanced',
//     responseStructure: 'story-driven',
//     contextDepth: 10,
//     includeMetrics: true,
//     goals: [],
//     emphasizedExperiences: [],
//     specificChallenges: [],
//     companyContext: ['sales_methodology', 'career_achievements'],
//     roleDescription: '',
// };

// export function useInterviewContextForm(initialContext?: InitialInterviewContext) {
//     const context = useChatStore(state => state.initialContext || defaultContext);
//     const activeTab = useChatStore(state => state.activeTab);
//     const setActiveTab = useChatStore(state => state.setActiveTab);

//     const updateContextField = useCallback(
//         <K extends keyof InitialInterviewContext>(field: K, value: InitialInterviewContext[K]) => {
//             useChatStore.getState().setInitialContext({ ...context, [field]: value });
//         },
//         [context]
//     );

//     const addToContextArray = useCallback(
//         <K extends keyof InitialInterviewContext>(field: K, value: string) => {
//             const currentArray = context[field] as string[];
//             useChatStore.getState().setInitialContext({ ...context, [field]: [...currentArray, value] });
//         },
//         [context]
//     );

//     const removeFromContextArray = useCallback(
//         <K extends keyof InitialInterviewContext>(field: K, index: number) => {
//             const currentArray = context[field] as string[];
//             useChatStore
//                 .getState()
//                 .setInitialContext({ ...context, [field]: currentArray.filter((_, i) => i !== index) });
//         },
//         [context]
//     );

//     const toggleInContextArray = useCallback(
//         <K extends keyof InitialInterviewContext>(field: K, value: string) => {
//             const array = context[field] as string[];
//             useChatStore.getState().setInitialContext({
//                 ...context,
//                 [field]: array.includes(value) ? array.filter(item => item !== value) : [...array, value],
//             });
//         },
//         [context]
//     );

//     const isValid = context.targetRole.trim().length > 0;

//     return {
//         context,
//         activeTab,
//         setActiveTab,
//         updateContextField,
//         addToContextArray,
//         removeFromContextArray,
//         toggleInContextArray,
//         isValid,
//     };
// }
