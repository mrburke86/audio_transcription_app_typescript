// // src/hooks/llm-hooks/useResponseGenerator.ts

// 'use client';

// import { useChatStore } from '@/stores/chatStore';
// import { ILLMService, InitialInterviewContext } from '@/types';
// import { generateLLMResponse } from '@/utils/llmUtils';
// import { useCallback, useRef } from 'react';

// interface UseResponseGeneratorProps {
//     llmService: ILLMService | null;
//     knowledgeLoading: boolean;
//     knowledgeLoadError: string | null;
//     initialInterviewContext: InitialInterviewContext | null;
//     goals: string[];
//     buildKnowledgeContext: (userMessage: string) => Promise<string>;
//     handleError: (errorInstance: unknown, queryId?: string, context?: string) => string;
// }

// export const useResponseGenerator = ({
//     llmService,
//     knowledgeLoading,
//     knowledgeLoadError,
//     initialInterviewContext,
//     goals,
//     buildKnowledgeContext,
//     handleError,
// }: UseResponseGeneratorProps) => {
//     const firstChunkReceivedRef = useRef<boolean>(false);

//     const conversationSummary = useChatStore(state => state.conversationSummary);

//     const setLoading = useChatStore(state => state.setLoading);
//     const setError = useChatStore(state => state.setError);
//     const appendStreamedContent = useChatStore(state => state.appendStreamedContent);
//     const resetStreamedContent = useChatStore(state => state.resetStreamedContent);
//     const setStreamingComplete = useChatStore(state => state.setStreamingComplete);

//     return useCallback(
//         async (userMessage: string): Promise<void> => {
//             if (!llmService) {
//                 setError('LLM Service not initialized.');
//                 return;
//             }
//             if (knowledgeLoading || knowledgeLoadError) {
//                 setError(knowledgeLoadError || 'Knowledge base is still loading.');
//                 return;
//             }

//             firstChunkReceivedRef.current = false;
//             setLoading(true);
//             setError(null);
//             resetStreamedContent();

//             try {
//                 const response = await generateLLMResponse(
//                     llmService,
//                     userMessage,
//                     initialInterviewContext!,
//                     goals,
//                     conversationSummary,
//                     buildKnowledgeContext
//                 );
//                 // If streamed, util handles; here assume complete—adapt if stream
//                 appendStreamedContent(response);
//                 setStreamingComplete(true);
//             } catch (err) {
//                 const errorMsg = handleError(err);
//                 setError(errorMsg);
//             } finally {
//                 setLoading(false);
//             }
//         },
//         [llmService, knowledgeLoading, knowledgeLoadError, initialInterviewContext, goals, buildKnowledgeContext]
//     );
// };
