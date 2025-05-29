// // src/components/chat/ChatComponent.tsx
// 'use client';

// import { MemoizedChatMessagesBox } from '@/components/chat/MemoizedComponents';
// import { CustomSpeechError, useLLMProviderOptimized, useSpeechRecognition, useTranscriptions } from '@/hooks';
// import { useKnowledge } from '@/contexts/KnowledgeProvider';
// import { Badge, Button, Card, CardContent, CardHeader, CardTitle } from '@/components/ui';
// import { logger } from '@/modules/Logger';
// import { Message } from '@/types/Message'; // Import the Message interface
// import { Separator } from '@radix-ui/react-separator';
// import { AlertTriangle, ArrowRight, MessageSquare } from 'lucide-react';
// import React, { useCallback, useEffect, useRef, useState } from 'react';
// import ConversationContext from './ConversationContext';
// import LiveTranscriptionBox from './LiveTranscriptionBox';
// import RoleDescriptionModal from './RoleDescriptionModal';
// import StatusIndicator from '../../app/chat/_components/TopNavigationBar/StatusIndicator';
// import VoiceControls from './VoiceControls';
// import ConversationInsights from './ConversationInsights';

// export interface KnowledgeStatusProps {
//     isLoading: boolean;
//     error: string | null;
//     totalFiles: number;
//     totalWords: number;
// }
// // Knowledge Loading Component
// const KnowledgeStatus: React.FC<KnowledgeStatusProps> = ({ isLoading, error, totalFiles, totalWords }) => {
//     if (isLoading) {
//         return (
//             <Badge variant="outline" className="flex items-center gap-2 bg-blue-50 border border-blue-200 text-blue-700">
//                 <strong>❌ Loading knowledge base...</strong>
//             </Badge>
//         );
//     }

//     if (error) {
//         return (
//             <Badge variant="outline" className="flex items-center gap-2 bg-red-50 border border-red-200 text-red-700">
//                 <strong>🕐 Knowledge Base Error:</strong> {error}
//             </Badge>
//         );
//     }

//     if (totalFiles > 0) {
//         return (
//             <Badge variant="outline" className="flex items-center gap-2 bg-green-50 border border-green-200 text-green-700">
//                 ✅ Knowledge Base: {totalFiles} files, {totalWords.toLocaleString()} words
//             </Badge>
//         );
//     }

//     return null;
// };

// const ChatComponent: React.FC = () => {
//     // Knowledge context for the optimized system
//     const { isLoading: knowledgeLoading, error: knowledgeError, getTotalStats } = useKnowledge();

//     // Unified Conversation History (from userMessages)
//     const [conversationHistory, setConversationHistory] = useState<Message[]>([]);

//     // Goals/Milestones State
//     const [goals, setGoals] = useState<string[]>([]);

//     const [recognitionStatus, setRecognitionStatus] = useState<'inactive' | 'active' | 'error'>('inactive');

//     const canvasRef = useRef<HTMLCanvasElement>(null);
//     const visualizationStartedRef = useRef(false);

//     // State to manage roleDescription
//     const [roleDescriptionState, setRoleDescriptionState] = useState<string>('');

//     // State to manage the display of the modal
//     const [showRoleModal, setShowRoleModal] = useState<boolean>(false);

//     //
//     const [errorMessage, setErrorMessage] = useState<string | null>(null);

//     // Memoize getUserFriendlyError with useCallback
//     const getUserFriendlyError = useCallback((errorCode: string): string => {
//         switch (errorCode) {
//             case 'network':
//                 return 'Network error. Please check your internet connection.';
//             case 'not-allowed':
//                 return 'Microphone access denied. Please allow microphone access in your browser settings.';
//             case 'service-not-allowed':
//                 return 'Speech recognition service not allowed. Please check your browser settings.';
//             case 'no-speech':
//                 return 'No speech detected. Please try speaking again.';
//             case 'audio-capture':
//                 return 'Audio capture failed. Please check your microphone.';
//             case 'aborted':
//                 return 'Speech recognition was aborted.';
//             case 'language-not-supported':
//                 return 'Language not supported. Please try a different language.';
//             case 'bad-grammar':
//                 return 'Grammar configuration issue. Please contact support.';
//             default:
//                 return 'An unexpected error occurred with speech recognition.';
//         }
//     }, []);

//     // Show modal on mount if roleDescription is empty
//     useEffect(() => {
//         if (!roleDescriptionState || roleDescriptionState.trim() === '') {
//             setShowRoleModal(true);
//         }
//     }, [roleDescriptionState]);

//     const apiKey = process.env.NEXT_PUBLIC_OPENAI_API_KEY;
//     // Use the optimized LLM provider instead of the old one
//     // Note: assistantId is no longer needed for Chat Completions API
//     const {
//         generateResponse,
//         generateSuggestions,
//         isLoading,
//         error,
//         streamedContent,
//         isStreamingComplete,
//         conversationSummary,
//         conversationSuggestions,
//     } = useLLMProviderOptimized(
//         apiKey || '',
//         // assistantId, // Removed - no longer needed for Chat Completions API
//         roleDescriptionState,
//         conversationHistory,
//         goals
//     );

//     const {
//         interimTranscriptions,
//         currentInterimTranscript,
//         userMessages,
//         // setUserMessages,
//         handleMove,
//         handleClear,
//         handleRecognitionResult,
//     } = useTranscriptions({
//         generateResponse,
//         streamedContent,
//         isStreamingComplete,
//     });

//     // Update unified conversation history whenever userMessages changes
//     useEffect(() => {
//         setConversationHistory(userMessages);
//     }, [userMessages]);

//     // Check if API key is missing
//     useEffect(() => {
//         if (!apiKey) {
//             logger.error('🔑❌ OpenAI API key is missing');
//         }
//     }, [apiKey, recognitionStatus, userMessages, isLoading, error]);

//     // Initialize chat on mount with optimized system logging
//     useEffect(() => {
//         logger.info(`🚀 Initializing optimized chat (Chat Completions API)`);

//         return () => {
//             logger.info(`🧹 Cleaning up optimized chat`);
//         };
//     }, []);

//     // Handle speech recognition start
//     const handleRecognitionStart = useCallback(() => {
//         logger.info('🎙️✅ Speech recognition started');
//         setRecognitionStatus('active');
//     }, []);

//     // Handle speech recognition end
//     const handleRecognitionEnd = useCallback(() => {
//         logger.info('🎙️⏹️ Speech recognition ended');
//         setRecognitionStatus('inactive');
//     }, []);

//     // Handle speech recognition error
//     const handleRecognitionError = useCallback(
//         (error: SpeechRecognitionErrorEvent | CustomSpeechError) => {
//             let errorCode: string;
//             let errorMessage: string;

//             if ('error' in error) {
//                 errorCode = error.error;
//                 errorMessage = getUserFriendlyError(error.error);
//             } else {
//                 errorCode = error.code;
//                 errorMessage = error.message;
//             }

//             logger.error(`🎙️❌ Speech recognition error: ${errorCode}`);
//             setRecognitionStatus('error');
//             setErrorMessage(errorMessage);
//         },
//         [getUserFriendlyError, setRecognitionStatus, setErrorMessage]
//     );

//     // Initialize speech recognition
//     const { start, stop, startAudioVisualization } = useSpeechRecognition({
//         onStart: handleRecognitionStart,
//         onEnd: handleRecognitionEnd,
//         onError: handleRecognitionError,
//         onResult: handleRecognitionResult,
//     });

//     // Handle speech recognition start
//     const handleStart = useCallback(() => {
//         logger.info('🎙️ Starting speech recognition');
//         start()
//             .then(() => {
//                 if (canvasRef.current && !visualizationStartedRef.current) {
//                     logger.info('🎨 Starting audio visualization');
//                     startAudioVisualization(canvasRef.current);
//                     visualizationStartedRef.current = true;
//                 } else if (!canvasRef.current) {
//                     logger.warning("⚠️ Canvas reference is null, can't start visualization");
//                 }
//             })
//             .catch(error => {
//                 logger.error(`🎙️❌ Failed to start speech recognition: ${error.message}`);
//             });
//     }, [start, startAudioVisualization]);

//     // Handle suggestion generation
//     const handleSuggest = useCallback(async () => {
//         try {
//             await generateSuggestions();
//         } catch (error) {
//             logger.error(`Error generating suggestions: ${(error as Error).message}`);
//         }
//     }, [generateSuggestions]);

//     const knowledgeStats = getTotalStats();

//     // Show full-screen loading if knowledge is still loading
//     if (knowledgeLoading) {
//         return (
//             <div className="flex flex-col items-center justify-center h-full p-8">
//                 <div className="text-center">
//                     <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-6"></div>
//                     <h2 className="text-xl font-semibold text-gray-700 mb-2">Loading Knowledge Base</h2>
//                     <p className="text-gray-600">Initializing ETQ product knowledge...</p>
//                     <p className="text-sm text-gray-500 mt-2">This may take a moment on first load</p>
//                 </div>
//             </div>
//         );
//     }

//     // Show error if knowledge failed to load
//     if (knowledgeError) {
//         return (
//             <div className="flex flex-col items-center justify-center h-full p-8">
//                 <div className="text-center">
//                     <AlertTriangle className="h-16 w-16 text-red-500 mx-auto mb-6" />
//                     <h2 className="text-xl font-semibold text-red-700 mb-2">Knowledge Base Load Failed</h2>
//                     <p className="text-red-600 mb-4">{knowledgeError}</p>
//                     <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-left">
//                         <h3 className="font-semibold text-red-800 mb-2">Troubleshooting:</h3>
//                         <ul className="text-sm text-red-700 space-y-1">
//                             <li>
//                                 • Ensure ETQ markdown files are in <code>public/knowledge/</code>
//                             </li>
//                             <li>• Check that all 25 files are present and accessible</li>
//                             <li>• Verify file permissions and server configuration</li>
//                         </ul>
//                     </div>
//                     <button
//                         onClick={() => window.location.reload()}
//                         className="mt-4 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
//                     >
//                         Retry
//                     </button>
//                 </div>
//             </div>
//         );
//     }

//     return (
//         <div className="flex flex-col h-full overflow-hidden p-1 container gap-4">
//             {/* Top Navigation Bar */}
//             <TopNavigationBar
//                 status={recognitionStatus}
//                 isLoading={knowledgeLoading}
//                 error={knowledgeError}
//                 errorMessage={errorMessage} // Pass speech recognition error
//                 totalFiles={knowledgeStats.totalFiles}
//                 totalWords={knowledgeStats.totalWords}
//             />

//             {/* Role Description Modal */}
//             {showRoleModal && (
//                 <RoleDescriptionModal
//                     onSubmit={newRoleDescription => {
//                         setRoleDescriptionState(newRoleDescription);
//                         setShowRoleModal(false);
//                     }}
//                 />
//             )}

//             <div className="grid grid-cols-12 gap-6 flex-1 min-h-0 overflow-hidden">
//                 {/* Left Columns - Chat Interface */}
//                 <div className="col-span-8 flex-1 overflow-hidden">
//                     <Card className="h-full relative flex flex-col overflow-hidden">
//                         <CardHeader className="pb-3 flex-shrink-0">
//                             <CardTitle className="text-lg flex items-center gap-2">
//                                 <MessageSquare className="h-5 w-5" />
//                                 Conversation
//                             </CardTitle>
//                         </CardHeader>
//                         <CardContent className="flex-1 flex flex-col gap-4 min-h-0 overflow-hidden">
//                             {/* Chat Messages - Fixed height with internal scrolling */}
//                             <div className="flex-1 min-h-0 overflow-hidden">
//                                 <MemoizedChatMessagesBox
//                                     id="postChat"
//                                     messages={userMessages}
//                                     streamedContent={streamedContent}
//                                     isStreamingComplete={isStreamingComplete}
//                                     className="flex-1"
//                                 />
//                             </div>

//                             <Separator className="flex-shrink-0" />
//                             {/* Live Transcription Input */}
//                             <div
//                                 id="chat-input"
//                                 className="flex flex-col p-3 md:p-4 border-[1px] border-gray-800 rounded-lg shadow-none max-h-52 overflow-y-auto bg-background flex-shrink-0"
//                             >
//                                 <LiveTranscriptionBox
//                                     id="preChat"
//                                     interimTranscriptions={interimTranscriptions}
//                                     currentInterimTranscript={currentInterimTranscript}
//                                     className="flex-1"
//                                 />

//                                 {/* Move Button */}
//                                 <Button
//                                     variant="move"
//                                     onClick={handleMove}
//                                     className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-xs font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-blue-500 text-white hover:bg-blue-600 h-8 px-2 py-1 mt-2 gap-1.5 self-end"
//                                 >
//                                     <ArrowRight className="mr-1 h-4 w-4" />
//                                     Move
//                                 </Button>
//                             </div>
//                         </CardContent>
//                     </Card>
//                 </div>

//                 {/* Right Column */}
//                 <div className="col-span-4 flex flex-col gap-y-4">
//                     {/* Row 1 - Transcription Controls and Audio Visualiser */}
//                     <div className="flex-1 flex flex-col overflow-y-auto min-h-0">
//                         <VoiceControls
//                             onStart={handleStart}
//                             onStop={stop}
//                             onClear={handleClear}
//                             isRecognitionActive={recognitionStatus === 'active'}
//                             canvasRef={canvasRef}
//                         />{' '}
//                     </div>
//                     {/* Row 2 - Conversation Summary */}
//                     <div className="flex-1 flex flex-col overflow-y-auto min-h-0">
//                         <ConversationContext summary={conversationSummary} goals={goals} />
//                     </div>
//                     {/* Row 3 - Conversation Suggestions */}
//                     <div className="flex-1 flex flex-col overflow-y-auto min-h-0">
//                         <ConversationInsights suggestions={conversationSuggestions} onSuggest={handleSuggest} isLoading={isLoading} />
//                     </div>
//                 </div>
//             </div>
//         </div>
//     );
// };

// export default ChatComponent;

// interface TopNavigationBarProps {
//     status: 'inactive' | 'active' | 'error';
//     isLoading: boolean;
//     error: string | null;
//     errorMessage?: string | null; // Added for speech recognition errors
//     totalFiles: number;
//     totalWords: number;
// }

// // Top Navigation Bar with Title, StatusIndicator and KnowledgeStats
// function TopNavigationBar({ status, isLoading, error, errorMessage, totalFiles, totalWords }: TopNavigationBarProps) {
//     // Determine which error to display (prioritize speech recognition errors)
//     const displayError = errorMessage || error;
//     const errorType = errorMessage ? 'Speech Recognition' : 'Knowledge';

//     return (
//         // <nav className="bg-white border-b border-slate-200 px-6 py-3">
//         <nav className="grid grid-cols-12 gap-2 h-[100px] overflow-hidden">
//             {/* Title and Sutitle section */}
//             <div className="col-span-3 flex flex-col">
//                 <h1 className="text-2xl font-bold text-slate-900">Audio Transcription Studio</h1>
//                 <p className="text-slate-600 text-sm mt-1">Real-time conversation analysis and insights</p>
//             </div>

//             {/* Error Message */}
//             <div className="col-span-5 flex flex-col">
//                 <div className="mt-2 flex justify-center">
//                     {displayError && (
//                         <Badge variant="destructive" className="text-xs px-3 py-1 max-w-md truncate">
//                             {errorType} Error: {displayError}
//                         </Badge>
//                     )}
//                 </div>
//             </div>

//             {/* Knowledge Stats and Status Indicator */}
//             <div className="col-span-4 flex flex-col">
//                 <div className="flex items-center gap-4">
//                     {/* Knowledge Status */}
//                     <KnowledgeStatus isLoading={isLoading} error={error} totalFiles={totalFiles} totalWords={totalWords} />

//                     {/* Status Indicator */}
//                     <StatusIndicator status={status} />
//                 </div>
//             </div>
//         </nav>
//     );
// }
