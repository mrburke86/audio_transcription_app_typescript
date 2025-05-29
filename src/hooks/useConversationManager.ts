// import { logger } from '@/modules';
// import { useCallback, useEffect, useState } from 'react';
// import { useLLMProviderOptimized } from './useLLMProviderOptimized';
// import { useTranscriptions } from './useTranscriptions';

// // src\hooks\useConversationManager.ts
// export const useConversationManager = (roleDescription: string) => {
//     const [goals, setGoals] = useState<string[]>([]);
//     const [conversationHistory, setConversationHistory] = useState<Message[]>([]);

//     const apiKey = process.env.NEXT_PUBLIC_OPENAI_API_KEY;

//     const llmProvider = useLLMProviderOptimized(
//         apiKey || '',
//         roleDescription,
//         transcriptions.userMessages, // This creates the circular dependency
//         goals
//     );

//     // Initialize transcriptions with LLM provider functions
//     const transcriptions = useTranscriptions({
//         generateResponse: llmProvider.generateResponse,
//         streamedContent: llmProvider.streamedContent,
//         isStreamingComplete: llmProvider.isStreamingComplete,
//     });

//     // Update conversation history whenever userMessages changes
//     useEffect(() => {
//         setConversationHistory(transcriptions.userMessages);
//     }, [transcriptions.userMessages]);

//     // Now we need to "connect" the real functions to transcriptions
//     // We'll do this by overriding the handleMove function
//     const handleMove = useCallback(async () => {
//         logger.info('🚀🚀🚀 MOVE BUTTON CLICKED 🚀🚀🚀');
//         logger.info('Executing enhanced handleMove that calls real generateResponse');

//         // Recreate the handleMove logic from useTranscriptions but with real LLM functions
//         const allTranscriptions = [...transcriptions.interimTranscriptions.map(msg => msg.content), transcriptions.currentInterimTranscript]
//             .join(' ')
//             .trim();

//         if (allTranscriptions === '') {
//             logger.warning('No transcriptions to move');
//             return;
//         }

//         logger.info(`📝 Combined message: "${allTranscriptions}"`);
//         logger.info('⚡ Calling real generateResponse - this should trigger full flow');

//         try {
//             // Call the REAL generateResponse function from llmProvider
//             await llmProvider.generateResponse(allTranscriptions);

//             // Clear transcriptions (mimic what useTranscriptions.handleMove does)
//             // Note: We can't directly clear the state, but that's handled by useTranscriptions

//             logger.info('✅ Enhanced handleMove completed - AI response should be generating');
//             logger.info('📊 Auto-summarization should trigger when response completes');
//         } catch (error) {
//             logger.error(`❌ Error in enhanced handleMove: ${(error as Error).message}`);
//         }
//     }, [transcriptions.interimTranscriptions, transcriptions.currentInterimTranscript, llmProvider.generateResponse]);

//     const handleSuggest = useCallback(async () => {
//         try {
//             await llmProvider.generateSuggestions();
//         } catch (error) {
//             logger.error(`Error generating suggestions: ${(error as Error).message}`);
//         }
//     }, [llmProvider.generateSuggestions]);

//     return {
//         // Goals
//         goals,
//         setGoals,

//         // LLM functionality
//         generateResponse: llmProvider.generateResponse,
//         generateSuggestions: llmProvider.generateSuggestions,
//         isLoading: llmProvider.isLoading,
//         error: llmProvider.error,
//         streamedContent: llmProvider.streamedContent,
//         isStreamingComplete: llmProvider.isStreamingComplete,
//         conversationSummary: llmProvider.conversationSummary,
//         conversationSuggestions: llmProvider.conversationSuggestions,

//         // Transcription functionality
//         interimTranscriptions: transcriptions.interimTranscriptions,
//         currentInterimTranscript: transcriptions.currentInterimTranscript,
//         userMessages: transcriptions.userMessages,
//         handleMove, // Our enhanced version that calls real generateResponse
//         handleClear: transcriptions.handleClear,
//         handleRecognitionResult: transcriptions.handleRecognitionResult,

//         // Suggestions
//         handleSuggest,
//     };
// };
