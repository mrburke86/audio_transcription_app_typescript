// // src/hooks/llm-hooks/useStrategicSuggestionsGenerator.ts
// // FIXED: Internalize props with selectors; add parse guard; clean deps; descriptive names (e.g., parsedAnalysis, generatedContent).
// 'use client';

// import { useChatStore } from '@/stores/chatStore';
// import {
//     AnalysisHistoryEntry,
//     ChatMessageParam,
//     ILLMService,
//     InitialInterviewContext,
//     StrategicOpportunityAnalysis,
//     StrategicSuggestions,
// } from '@/types';
// import {
//     createAnalysisSystemPrompt,
//     createAnalysisUserPrompt,
//     createGenerationSystemPrompt,
//     createGenerationUserPrompt,
// } from '@/utils';
// import { useCallback, useRef } from 'react';
// import { v4 as uuidv4 } from 'uuid';

// interface UseStrategicSuggestionsGeneratorProps {
//     llmService: ILLMService | null;
//     isKnowledgeLoading: boolean;
//     initialInterviewContext: InitialInterviewContext | null;
//     buildKnowledgeContext: (userMessage: string) => Promise<string>;
//     handleError: (errorInstance: unknown, queryId?: string, context?: string) => string;
// }

// export const useStrategicSuggestionsGenerator = ({
//     llmService,
//     isKnowledgeLoading,
//     initialInterviewContext,
//     buildKnowledgeContext,
//     handleError,
// }: UseStrategicSuggestionsGeneratorProps) => {
//     const latestUserMessageRef = useRef<string>('');

//     const conversationHistory = useChatStore(state => state.conversationHistory);
//     const conversationSummary = useChatStore(state => state.conversationSummary);
//     const previousAnalyses = useChatStore(state => state.strategicSuggestions.previousAnalyses || []);
//     const setLoading = useChatStore(state => state.setLoading);
//     const setError = useChatStore(state => state.setError);
//     const setStrategicSuggestions = useChatStore(state => state.setStrategicSuggestions);

//     return useCallback(async (): Promise<void> => {
//         if (!llmService || isKnowledgeLoading || !initialInterviewContext) return;

//         const queryId = uuidv4();
//         setLoading(true);

//         try {
//             const contextMessage =
//                 latestUserMessageRef.current ||
//                 (conversationHistory.length > 0 ? conversationHistory[conversationHistory.length - 1].content : '');
//             const knowledgeContext = await buildKnowledgeContext(contextMessage);

//             const analysisUserPrompt = await createAnalysisUserPrompt(
//                 conversationSummary,
//                 initialInterviewContext,
//                 knowledgeContext,
//                 previousAnalyses
//             );
//             const analysisMessages: ChatMessageParam[] = [
//                 { role: 'system', content: createAnalysisSystemPrompt },
//                 { role: 'user', content: analysisUserPrompt },
//             ];
//             const analysisContent = await llmService.generateCompleteResponse(analysisMessages, {
//                 model: 'gpt-4o-mini',
//                 temperature: 0.3,
//             });

//             let parsedAnalysis: StrategicOpportunityAnalysis; // RENAMED
//             try {
//                 parsedAnalysis = JSON.parse(analysisContent.match(/\{[\s\S]*\}/)?.[0] || '{}');
//             } catch (parseErr) {
//                 setError('Failed to parse analysis response.');
//                 return;
//             }

//             const generationUserPrompt = await createGenerationUserPrompt(
//                 parsedAnalysis,
//                 initialInterviewContext,
//                 knowledgeContext,
//                 previousAnalyses
//             );
//             const generationMessages: ChatMessageParam[] = [
//                 { role: 'system', content: createGenerationSystemPrompt },
//                 { role: 'user', content: generationUserPrompt },
//             ];
//             const generatedContent = await llmService.generateCompleteResponse(generationMessages, {
//                 // RENAMED
//                 model: 'gpt-4o-mini',
//                 temperature: 0.7,
//             });

//             const analysisEntry: AnalysisHistoryEntry = {
//                 strategic_opportunity: parsedAnalysis.strategic_opportunity,
//                 primaryFocusArea: parsedAnalysis.primaryFocusArea,
//                 insightPotentialSummary: parsedAnalysis.insightPotentialSummary,
//                 timestamp: Date.now(),
//             };

//             const updatedAnalyses = [...previousAnalyses, analysisEntry].slice(-3);

//             const updatedSuggestions: StrategicSuggestions = {
//                 strategicIntelligenceContent: generatedContent,
//                 currentAnalysis: parsedAnalysis,
//                 previousAnalyses: updatedAnalyses,
//             };

//             setStrategicSuggestions(updatedSuggestions);
//         } catch (err) {
//             const errorMsg = handleError(err, queryId, 'generateSuggestions');
//             setError(errorMsg);
//         } finally {
//             setLoading(false);
//         }
//     }, [llmService, isKnowledgeLoading, initialInterviewContext, buildKnowledgeContext]);
// };
