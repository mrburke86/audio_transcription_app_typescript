// src/app/chat/page.tsx
'use client';

import { Button, Card, CardContent, CardHeader, CardTitle, Separator } from '@/components/ui';
import { useKnowledge } from '@/contexts';
import { CustomSpeechError, useLLMProviderOptimized, useSpeechRecognition, useTranscriptions } from '@/hooks';
import { logger } from '@/modules';
import { Message } from '@/types';
import { ArrowRight, MessageSquare, Settings, X } from 'lucide-react';
import { useCallback, useEffect, useRef, useState } from 'react';
import {
    ConversationContext,
    ConversationInsights,
    ErrorState,
    LiveTranscriptionBox,
    LoadingState,
    MemoizedChatMessagesBox,
    TopNavigationBar,
    VoiceControls,
} from './_components';
// import { InterviewModalProvider } from '@/components/interview-modal/InterviewModalContext';
// import { InterviewModalTabs } from '@/components/interview-modal/InterviewModalTabs';
// import { InterviewModalFooter } from '@/components/interview-modal/InterviewModalFooter';
import { AIErrorBoundary, InlineErrorBoundary, SpeechErrorBoundary } from '@/components/error-boundary';
import { useInterviewContext } from '@/hooks/useInterviewContext'; // ✅ Added
import { useChatPageProtection } from '@/hooks/useRouteProtection'; // ✅ Added

export default function ChatPage() {
    // ✅ Add route protection - this ensures users have valid context before accessing chat
    const { isAllowed, isLoading: protectionLoading } = useChatPageProtection();
    
    // ✅ Get context from storage instead of managing it locally
    const { context: initialInterviewContext, hasValidContext } = useInterviewContext();

    // Knowledge context for the optimized system
    const {
        isLoading: knowledgeLoading,
        error: knowledgeError,
        indexedDocumentsCount,
        knowledgeBaseName,
    } = useKnowledge();

    // Unified Conversation History (from userMessages)
    const [conversationHistory, setConversationHistory] = useState<Message[]>([]);
    const [recognitionStatus, setRecognitionStatus] = useState<'inactive' | 'active' | 'error'>('inactive');
    // State to manage the display of the modal
    // const [showRoleModal, setShowRoleModal] = useState<boolean>(false);
    // State for speech recognition specific errors
    const [speechErrorMessage, setSpeechErrorMessage] = useState<string | null>(null);

    const canvasRef = useRef<HTMLCanvasElement>(null);
    const visualizationStartedRef = useRef(false);

    // State to manage roleDescription
    // const [initialInterviewContext, setInitialInterviewContext] = useState<InitialInterviewContext | null>(null);

    // // ADDED: Handle interview start function
    // const handleInterviewStart = useCallback((context: InitialInterviewContext) => {
    //     logger.info('🚀 Starting interview with context:', context);
    //     setInitialInterviewContext(context);
    //     setShowRoleModal(false);
    // }, []);

    // // ADDED: Handle modal close
    // const handleModalClose = useCallback(() => {
    //     setShowRoleModal(false);
    // }, []);

    // ✅ Add validation to ensure we have context (belt and suspenders approach)
    useEffect(() => {
        if (!protectionLoading && isAllowed && !hasValidContext) {
            logger.error('❌ Chat page accessed without valid context - this should not happen due to route protection');
            // Emergency fallback - redirect to context capture
            window.location.href = '/capture-context';
        }
    }, [protectionLoading, isAllowed, hasValidContext]);

    // ✅ Log when context is successfully loaded
    useEffect(() => {
        if (initialInterviewContext) {
            logger.info('✅ Chat page loaded with valid context:', {
                role: initialInterviewContext.targetRole,
                company: initialInterviewContext.targetCompany,
                type: initialInterviewContext.interviewType
            });
        }
    }, [initialInterviewContext]);

    // Memoize getUserFriendlyError with useCallback
    const getUserFriendlyError = useCallback((errorCode: string): string => {
        switch (errorCode) {
            case 'network':
                return 'Network error. Please check your internet connection.';
            case 'not-allowed':
                return 'Microphone access denied. Please allow microphone access in your browser settings.';
            case 'service-not-allowed':
                return 'Speech recognition service not allowed. Please check your browser settings.';
            case 'no-speech':
                return 'No speech detected. Please try speaking again.';
            case 'audio-capture':
                return 'Audio capture failed. Please check your microphone.';
            case 'aborted':
                return 'Speech recognition was aborted.';
            case 'language-not-supported':
                return 'Language not supported. Please try a different language.';
            case 'bad-grammar':
                return 'Grammar configuration issue. Please contact support.';
            default:
                return 'An unexpected error occurred with speech recognition.';
        }
    }, []);

    // // Show modal on mount if initial interview context is empty
    // useEffect(() => {
    //     if (!initialInterviewContext) {
    //         setShowRoleModal(true);
    //     }
    // }, [initialInterviewContext]);

    const apiKey = process.env.NEXT_PUBLIC_OPENAI_API_KEY;

    // Use the optimized LLM provider instead of the old one
    const {
        generateResponse,
        generateSuggestions,
        isLoading,
        error,
        streamedContent,
        isStreamingComplete,
        conversationSummary,
        conversationSuggestions,
    } = useLLMProviderOptimized(apiKey || '', initialInterviewContext || null, conversationHistory);

    const {
        interimTranscriptions,
        currentInterimTranscript,
        userMessages,
        handleMove,
        handleClear,
        handleRecognitionResult,
    } = useTranscriptions({
        generateResponse,
        streamedContent,
        isStreamingComplete,
    });

    // Update unified conversation history whenever userMessages changes
    useEffect(() => {
        setConversationHistory(userMessages);
    }, [userMessages]);

    // Check if API key is missing
    useEffect(() => {
        if (!apiKey) {
            logger.error('🔑❌ OpenAI API key is missing');
        }
    }, [apiKey]);

    // Initialize chat on mount with optimized system logging
    useEffect(() => {
        logger.info(`🚀 Initializing optimized chat (Chat Completions API)`);

        return () => {
            logger.info(`🧹 Cleaning up optimized chat`);
        };
    }, []);

    // Handle speech recognition start
    const handleRecognitionStart = useCallback(() => {
        logger.info('🎙️✅ Speech recognition started');
        setRecognitionStatus('active');
        setSpeechErrorMessage(null);
    }, []);

    // Handle speech recognition end
    const handleRecognitionEnd = useCallback(() => {
        logger.info('🎙️⏹️ Speech recognition ended');
        setRecognitionStatus('inactive');
    }, []);

    // Handle speech recognition error
    const handleRecognitionError = useCallback(
        (speechError: SpeechRecognitionErrorEvent | CustomSpeechError) => {
            let errorCode: string;
            let detailedMessage: string;

            if ('error' in speechError) {
                errorCode = speechError.error;
                detailedMessage = getUserFriendlyError(speechError.error);
            } else {
                errorCode = speechError.code;
                detailedMessage = speechError.message;
            }

            logger.error(`Speech recognition error: ${errorCode} - ${detailedMessage}`);
            setRecognitionStatus('error');
            setSpeechErrorMessage(detailedMessage);
        },
        [getUserFriendlyError]
    );

    // Initialize speech recognition
    const { start, stop, startAudioVisualization } = useSpeechRecognition({
        onStart: handleRecognitionStart,
        onEnd: handleRecognitionEnd,
        onError: handleRecognitionError,
        onResult: handleRecognitionResult,
    });

    // Handle speech recognition start
    const handleStart = useCallback(() => {
        logger.info('🎙️ Attempting to start speech recognition...');
        start()
            .then(() => {
                if (canvasRef.current && !visualizationStartedRef.current) {
                    logger.info('🎨 Starting audio visualization');
                    startAudioVisualization(canvasRef.current);
                    visualizationStartedRef.current = true;
                } else if (!canvasRef.current) {
                    logger.warning("⚠️ Canvas reference is null, can't start visualization");
                }
            })
            .catch(startError => {
                logger.error(`Failed to start speech recognition: ${startError.message}`);
            });
    }, [start, startAudioVisualization]);

    // Handle suggestion generation
    const handleSuggest = useCallback(async () => {
        try {
            await generateSuggestions();
        } catch (genError) {
            logger.error(`Error generating suggestions: ${(genError as Error).message}`);
        }
    }, [generateSuggestions]);

    // ✅ Add context validation button for debugging/support
    const handleContextInfo = () => {
        if (initialInterviewContext) {
            logger.info('📋 Current context:', {
                role: initialInterviewContext.targetRole,
                company: initialInterviewContext.targetCompany,
                type: initialInterviewContext.interviewType,
                goals: initialInterviewContext.goals.length,
                experiences: initialInterviewContext.emphasizedExperiences.length
            });
        }
    };

    // ✅ Show protection loading screen if still validating
    if (protectionLoading) {
        return (
            <LoadingState
                message="Validating Interview Session..."
                subMessage="Checking your setup and permissions."
            />
        );
    }

    // ✅ This should not happen due to route protection, but safety check
    if (!isAllowed) {
        return (
            <ErrorState
                title="Access Denied"
                message="You need to complete interview setup before accessing the chat."
                onRetry={() => window.location.href = '/capture-context'}
            />
        );
    }

    // Show full-screen loading if knowledge is still loading
    if (knowledgeLoading) {
        return (
            <LoadingState
                message="Preparing Knowledge Base..."
                subMessage="This might take a moment on first access."
            />
        );
    }

    // Show error if knowledge provider failed to initialize
    if (knowledgeError) {
        return (
            <ErrorState
                title="Knowledge Base Error"
                message={knowledgeError}
                onRetry={() => window.location.reload()}
            />
        );
    }

    // Show error if LLM provider has an error (e.g. API key issue)
    if (error) {
        return <ErrorState title="AI Provider Error" message={error} onRetry={() => window.location.reload()} />;
    }

    // ✅ Safety check - ensure we have context before proceeding (should be guaranteed by route protection)
    if (!initialInterviewContext) {
        logger.error('❌ No interview context available in chat page - redirecting to setup');
        return (
            <ErrorState
                title="Setup Required"
                message="Interview context is missing. Please complete the setup process."
                onRetry={() => window.location.href = '/capture-context'}
            />
        );
    }

    return (
        <div className="flex flex-col h-full overflow-hidden p-1 gap-4">
            
            {/* Top Navigation Bar */}
            <InlineErrorBoundary>
                <TopNavigationBar
                    status={recognitionStatus}
                    errorMessage={speechErrorMessage}
                    knowledgeBaseName={knowledgeBaseName}
                    indexedDocumentsCount={indexedDocumentsCount}
                    />
                    
                    {/* ✅ Add context indicator */}
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={handleContextInfo}
                        className="text-xs text-slate-500 hover:text-slate-700"
                        title="View current interview context"
                    >
                        <Settings className="h-3 w-3 mr-1" />
                        {initialInterviewContext.targetRole} @ {initialInterviewContext.targetCompany}
                    </Button>
            </InlineErrorBoundary>

            <div className="grid grid-cols-12 gap-6 flex-1 min-h-0 overflow-hidden">
                {/* Left Columns - Chat Interface */}
                <div className="col-span-6 flex-1 overflow-hidden">
                    <Card className="h-full relative flex flex-col overflow-hidden">
                        <CardHeader className="pb-3 flex-shrink-0">
                            <CardTitle className="text-lg flex items-center gap-2">
                                <MessageSquare className="h-5 w-5" />
                                Conversation
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="flex-1 flex flex-col gap-4 min-h-0 overflow-hidden">
                            {/* Chat Messages - Fixed height with internal scrolling */}
                            <div className="flex-1 min-h-0 overflow-hidden">
                                <MemoizedChatMessagesBox
                                    id="postChat"
                                    messages={userMessages}
                                    streamedContent={streamedContent}
                                    isStreamingComplete={isStreamingComplete}
                                    className="flex-1"
                                />
                            </div>

                            <Separator className="flex-shrink-0" />

                            {/* Live Transcription Input */}
                            <div
                                id="chat-input"
                                className="flex flex-col p-3 md:p-4 border-[1px] border-gray-800 rounded-lg shadow-none max-h-52 overflow-y-auto bg-background flex-shrink-0"
                            >
                                <LiveTranscriptionBox
                                    id="preChat"
                                    interimTranscriptions={interimTranscriptions}
                                    currentInterimTranscript={currentInterimTranscript}
                                    className="flex-1"
                                />

                                {/* Move Button */}
                                <Button
                                    variant="move"
                                    onClick={handleMove}
                                    className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-xs font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-blue-500 text-white hover:bg-blue-600 h-8 px-2 py-1 mt-2 gap-1.5 self-end"
                                >
                                    <ArrowRight className="mr-1 h-4 w-4" />
                                    Move
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Middle Column */}
                <div className="col-span-1">
                    <SpeechErrorBoundary>
                        <VoiceControls
                            onStart={handleStart}
                            onStop={stop}
                            onClear={handleClear}
                            isRecognitionActive={recognitionStatus === 'active'}
                            canvasRef={canvasRef}
                        />
                    </SpeechErrorBoundary>
                </div>

                {/* Right Column */}
                <div className="flex w-full col-span-4 gap-y-4 h-full overflow-hidden">
                    <div className="grid grid-rows-2 gap-2 w-full">
                        {/* Row 2 - Conversation Summary */}
                        <div className="overflow-hidden scroll-smooth">
                            <ConversationContext
                                summary={conversationSummary}
                                goals={initialInterviewContext?.goals || []}
                            />
                        </div>

                        {/* Row 3 - Conversation Suggestions */}
                        <div className="overflow-hidden scroll-smooth">
                            <AIErrorBoundary>
                                <ConversationInsights
                                    suggestions={conversationSuggestions}
                                    onSuggest={handleSuggest}
                                    isLoading={isLoading}
                                />
                            </AIErrorBoundary>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
