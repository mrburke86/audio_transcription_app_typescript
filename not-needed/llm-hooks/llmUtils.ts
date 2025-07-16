// // src/utils/llmUtils.ts
// // Centralized core LLM logic—call from service/hook/store. Pure: params in, response out.
// import { logger } from '@/modules';
// import { ChatMessageParam, ILLMService, InitialInterviewContext, LLMRequestOptions } from '@/types';
// import { createSystemPrompt, createUserPrompt } from '@/utils';

// export const generateLLMResponse = async (
//     llmService: ILLMService,
//     userMessage: string,
//     initialInterviewContext: InitialInterviewContext,
//     goals: string[],
//     conversationSummary: string,
//     buildKnowledgeContext: (userMessage: string) => Promise<string>,
//     options: LLMRequestOptions = { model: 'gpt-4o', temperature: 0.7 },
//     onChunk?: (chunk: string) => void, // Optional streaming callback
//     onComplete?: (full: string) => void // Optional complete callback
// ): Promise<string> => {
//     const queryId = uuidv4();
//     logger.info(`[llmUtils][${queryId}] 🚀 Starting LLM response`);

//     try {
//         const knowledgeContext = await buildKnowledgeContext(userMessage);
//         const systemPrompt = await createSystemPrompt(initialInterviewContext, goals);
//         const userPromptContent = await createUserPrompt(userMessage, conversationSummary, knowledgeContext);

//         const messages: ChatMessageParam[] = [
//             { role: 'system', content: systemPrompt },
//             { role: 'user', content: userPromptContent },
//         ];

//         if (llmService.generateStreamedResponse) {
//             let fullResponse = '';
//             for await (const chunk of llmService.generateStreamedResponse(messages, options)) {
//                 fullResponse += chunk;
//                 if (onChunk) onChunk(chunk);
//             }
//             if (onComplete) onComplete(fullResponse);
//             return fullResponse;
//         } else {
//             const fullResponse = await llmService.generateCompleteResponse(messages, options);
//             if (onComplete) onComplete(fullResponse);
//             return fullResponse;
//         }
//     } catch (err) {
//         logger.error(`[llmUtils][${queryId}] ❌ Error: ${(err as Error).message}`);
//         throw err;
//     }
// };

// function uuidv4() {
//     throw new Error('Function not implemented.');
// }
