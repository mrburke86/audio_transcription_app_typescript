// // src/app/chat/page.tsx - SIMPLIFIED DIAGNOSTICS (NO HOOK VIOLATIONS)
// 'use client';

// import { ChatInterface } from '@/components/chat/ChatInterface';
// import { useConsolidatedSpeech } from '@/hooks/useConsolidatedSpeech';
// import { diagnosticLogger } from '@/lib/DiagnosticLogger';
// import { useBoundStore } from '@/stores/chatStore';
// import { useCallback, useEffect, useRef } from 'react';

// export default function ChatPage() {
//     // 🎯 SIMPLE DIAGNOSTIC TRACKING (no hook violations)
//     const renderCount = useRef(0);
//     const mountTime = useRef(Date.now());

//     renderCount.current++;

//     // 🚨 BASIC RENDER ANALYSIS
//     if (renderCount.current === 1) {
//         diagnosticLogger.log('info', 'init', 'ChatPage', '🏗️ ChatPage component mounted');
//     } else if (renderCount.current % 10 === 0) {
//         const timeSinceMount = Date.now() - mountTime.current;
//         const renderRate = renderCount.current / (timeSinceMount / 1000);
//         diagnosticLogger.log('warn', 'render', 'ChatPage',
//             `📊 High render count: ${renderCount.current} renders in ${timeSinceMount}ms`,
//             { renderRate: renderRate.toFixed(2) }
//         );
//     }

//     // 📊 OPTIMIZED STORE ACCESS - Separate stable props from changing speech data
//     const stableData = useBoundStore(state => ({
//         // Context (stable)
//         initialContext: state.initialContext,
//         isContextValid: state.isContextValid,
//         navigateToContextCapture: state.navigateToContextCapture,

//         // Knowledge (stable after init)
//         initializeKnowledgeBase: state.initializeKnowledgeBase,
//         knowledgeBaseName: state.knowledgeBaseName,
//         indexedDocumentsCount: state.indexedDocumentsCount,

//         // LLM (stable after init)
//         initializeLLMService: state.initializeLLMService,
//         generateResponse: state.generateResponse,
//         generateSuggestions: state.generateSuggestions,
//         llmLoading: state.llmLoading,

//         // Chat messages (only changes when user submits)
//         conversationHistory: state.conversationHistory,

//         // UI (stable)
//         conversationSummary: state.conversationSummary,
//         strategicSuggestions: state.strategicSuggestions,
//     }));

//     // ✅ SEPARATE STREAMING DATA - This will change frequently but won't affect main component
//     const streamingData = useBoundStore(state => ({
//         streamedContent: state.streamedContent,
//         isStreamingComplete: state.isStreamingComplete,
//     }));

//     // ✅ SEPARATE SPEECH DATA - This will change frequently for real-time transcription
//     const speechData = useBoundStore(state => ({
//         interimTranscriptMessages: state.interimTranscriptMessages || [],
//         currentInterimTranscript: state.currentInterimTranscript || '',
//     }));

//     // 🎤 SPEECH HOOK
//     const {
//         recognitionStatus,
//         speechErrorMessage,
//         canvasRef,
//         startRecording,
//         stopRecording,
//         clearTranscriptions,
//         submitTranscriptionToChat,
//     } = useConsolidatedSpeech();

//     // 🏗️ MANUAL HYDRATION WITH ERROR HANDLING
//     useEffect(() => {
//         try {
//             diagnosticLogger.log('info', 'init', 'ChatPage', '🔄 Starting manual hydration');

//             // Try to rehydrate with error handling
//             const result = useBoundStore.persist.rehydrate();

//             if (result instanceof Promise) {
//                 result
//                     .then(() => {
//                         diagnosticLogger.log('info', 'init', 'ChatPage', '✅ Manual hydration completed successfully');
//                     })
//                     .catch((error) => {
//                         diagnosticLogger.log('error', 'init', 'ChatPage',
//                             '❌ Manual hydration failed', { error: error.message });

//                         // Clear corrupted storage and use defaults
//                         sessionStorage.removeItem('interview_context');
//                         diagnosticLogger.log('info', 'init', 'ChatPage', '🧹 Cleared corrupted sessionStorage');
//                     });
//             } else {
//                 diagnosticLogger.log('info', 'init', 'ChatPage', '✅ Manual hydration completed (sync)');
//             }
//         } catch (error) {
//             diagnosticLogger.log('error', 'init', 'ChatPage',
//                 '❌ Manual hydration threw error', { error: error instanceof Error ? error.message : String(error) });

//             // Clear corrupted storage
//             sessionStorage.removeItem('interview_context');
//         }
//     }, []);

//     useEffect(() => {
//         // 🔍 CONTEXT VALIDATION
//         if (!stableData.isContextValid()) {
//             diagnosticLogger.log('warn', 'nav', 'ChatPage',
//                 '🚨 Invalid context detected - redirecting to capture');
//             stableData.navigateToContextCapture();
//             return;
//         }

//         // 🤖 LLM INITIALIZATION
//         const apiKey = process.env.NEXT_PUBLIC_OPENAI_API_KEY;
//         if (apiKey) {
//             diagnosticLogger.log('info', 'init', 'ChatPage',
//                 '🤖 Initializing LLM service', { keyLength: apiKey.length });
//             stableData.initializeLLMService(apiKey);
//         } else {
//             diagnosticLogger.log('error', 'init', 'ChatPage',
//                 '❌ OpenAI API key not found');
//         }

//         // 📚 KNOWLEDGE BASE INITIALIZATION
//         diagnosticLogger.log('info', 'init', 'ChatPage', '📚 Starting knowledge base initialization');
//         stableData.initializeKnowledgeBase().catch(error => {
//             diagnosticLogger.log('error', 'init', 'ChatPage',
//                 '❌ Knowledge base initialization failed', error);
//         });

//     }, [stableData.isContextValid, stableData.navigateToContextCapture, stableData.initializeLLMService, stableData.initializeKnowledgeBase]);

//     // 🎯 HANDLERS WITH BASIC TRACKING
//     const handleStart = useCallback(async () => {
//         diagnosticLogger.log('info', 'user', 'ChatPage', '👤 User clicked start recording');
//         await startRecording();
//     }, [startRecording]);

//     const handleStop = useCallback(() => {
//         diagnosticLogger.log('info', 'user', 'ChatPage', '👤 User clicked stop recording');
//         stopRecording();
//     }, [stopRecording]);

//     const handleClear = useCallback(() => {
//         diagnosticLogger.log('info', 'user', 'ChatPage', '👤 User clicked clear transcriptions');
//         clearTranscriptions();
//     }, [clearTranscriptions]);

//     const handleMove = useCallback(async () => {
//         diagnosticLogger.log('info', 'user', 'ChatPage', '👤 User clicked submit transcription');

//         await submitTranscriptionToChat();

//         const messages = stableData.conversationHistory;
//         const lastUserMessage = messages.filter(m => m.type === 'user').pop();

//         if (lastUserMessage) {
//             diagnosticLogger.log('info', 'api', 'ChatPage',
//                 '🤖 Generating AI response', { messageLength: lastUserMessage.content.length });
//             await stableData.generateResponse(lastUserMessage.content);
//         }
//     }, [submitTranscriptionToChat, stableData.conversationHistory, stableData.generateResponse]);

//     const handleSuggest = useCallback(async () => {
//         diagnosticLogger.log('info', 'user', 'ChatPage', '👤 User clicked generate suggestions');
//         await stableData.generateSuggestions();
//     }, [stableData.generateSuggestions]);

//     const handleContextInfo = useCallback(() => {
//         diagnosticLogger.log('info', 'user', 'ChatPage', '👤 User clicked context info', {
//             role: stableData.initialContext?.targetRole,
//             company: stableData.initialContext?.targetCompany
//         });
//     }, [stableData.initialContext]);

//     // Filter user messages
//     const userMessages = stableData.conversationHistory.filter(msg =>
//         msg.type === 'user' || msg.type === 'assistant'
//     );

//     diagnosticLogger.log('trace', 'render', 'ChatPage', `🎨 Render #${renderCount.current} complete`);

//     return (
//         <ChatInterface
//             initialInterviewContext={stableData.initialContext}
//             knowledgeBaseName={stableData.knowledgeBaseName}
//             indexedDocumentsCount={stableData.indexedDocumentsCount}
//             recognitionStatus={recognitionStatus}
//             speechErrorMessage={speechErrorMessage}
//             canvasRef={canvasRef}
//             interimTranscriptMessages={speechData.interimTranscriptMessages}
//             currentInterimTranscript={speechData.currentInterimTranscript}
//             userMessages={userMessages}
//             streamedContent={streamingData.streamedContent}
//             isStreamingComplete={streamingData.isStreamingComplete}
//             conversationSummary={stableData.conversationSummary}
//             conversationSuggestions={stableData.strategicSuggestions}
//             isLoading={stableData.llmLoading}
//             handleStart={handleStart}
//             handleStop={handleStop}
//             handleClear={handleClear}
//             handleMove={handleMove}
//             handleSuggest={handleSuggest}
//             handleContextInfo={handleContextInfo}
//         />
//     );
// }
