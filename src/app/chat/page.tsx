// src/app/chat/page.tsx
'use client';

import { CallModalProvider } from '@/components/call-modal/CallModalContext';
import { CallModalFooter } from '@/components/call-modal/CallModalFooter';
import { CallModalTabs } from '@/components/call-modal/CallModalTabs';
import { AIErrorBoundary, InlineErrorBoundary, SpeechErrorBoundary } from '@/components/error-boundary';
import { Button, Card, CardContent, CardHeader, CardTitle, Separator } from '@/components/ui';
import { CustomSpeechError, useSpeechRecognition, useTranscriptions } from '@/hooks';
import { logger } from '@/modules';
import { ArrowRight, MessageSquare, X } from 'lucide-react';
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

// ✅ NEW: Use Zustand hooks instead of old context patterns
import {
    useKnowledge,
    useLLM,
    useInterview,
    useUI,
    useStreamingResponse,
    useConversationMessages,
} from '@/stores/hooks/useSelectors';
import { CallContext } from '@/types/callContext';

export default function ChatPage() {
    // ✅ NEW: Use Zustand hooks for all state management
    const {
        isLoading: knowledgeLoading,
        error: knowledgeError,
        indexedDocumentsCount,
        knowledgeBaseName,
    } = useKnowledge();

    const {
        generateResponse,
        generateSuggestions,
        isGenerating,
        conversationSummary,
        conversationSuggestions,
        currentStreamId,
    } = useLLM();

    const {
        context: interviewContext,
        isModalOpen: showRoleModal,
        setCallContext,
        openSetupModal,
        closeSetupModal,
    } = useInterview();

    // ✅ FIXED: Remove setLoading from useUI since it doesn't exist
    const { addNotification, isLoading: uiLoading } = useUI();

    // ✅ NEW: Get streaming response from store
    const currentStreamingResponse = useStreamingResponse(currentStreamId || '');
    const streamedContent = currentStreamingResponse?.content || '';
    const isStreamingComplete = currentStreamingResponse?.isComplete ?? true;

    // ✅ NEW: Get conversation messages from store
    const conversationMessages = useConversationMessages('main');

    // Legacy state for speech recognition (will be migrated in later step)
    const [recognitionStatus, setRecognitionStatus] = useState<'inactive' | 'active' | 'error'>('inactive');
    const [speechErrorMessage, setSpeechErrorMessage] = useState<string | null>(null);
    const [isLocalLoading, setIsLocalLoading] = useState(false); // ✅ Local loading state
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const visualizationStartedRef = useRef(false);

    // Show role modal on mount if no interview context
    useEffect(() => {
        if (!interviewContext) {
            openSetupModal();
        }
    }, [interviewContext, openSetupModal]);

    // ✅ FIXED: Handle call context setup with proper CallContext type
    const handleCallStart = useCallback(
        (context: CallContext) => {
            logger.info('🚀 Starting call with context:', context);

            // ✅ Use the CallContext directly instead of converting
            setCallContext(context);
            closeSetupModal();
        },
        [setCallContext, closeSetupModal]
    );

    const handleModalClose = useCallback(() => {
        closeSetupModal();
    }, [closeSetupModal]);

    // ✅ FIXED: Remove unused variables and fix hook usage
    const { interimTranscriptions, currentInterimTranscript, handleClear, handleRecognitionResult } = useTranscriptions(
        {
            generateResponse,
            // ✅ FIXED: Remove invalid props
            // streamedContent and isStreamingComplete are not valid props for useTranscriptions
        }
    );

    // ✅ NEW: Enhanced move function that uses Zustand store
    const handleMove = useCallback(async () => {
        const allTranscriptions = [...interimTranscriptions.map(msg => msg.content), currentInterimTranscript]
            .join(' ')
            .trim();

        if (allTranscriptions === '') return;

        try {
            setIsLocalLoading(true); // ✅ Use local loading state
            await generateResponse(allTranscriptions);

            // Clear transcriptions after successful response
            handleClear();

            addNotification({
                type: 'success',
                message: 'Response generated successfully',
                duration: 3000,
            });
        } catch (error) {
            logger.error(`Error generating response: ${(error as Error).message}`);
            addNotification({
                type: 'error',
                message: 'Failed to generate response',
                duration: 5000,
            });
        } finally {
            setIsLocalLoading(false); // ✅ Use local loading state
        }
    }, [interimTranscriptions, currentInterimTranscript, generateResponse, handleClear, addNotification]);

    // ✅ NEW: Enhanced suggestion handler using Zustand
    const handleSuggest = useCallback(async () => {
        try {
            setIsLocalLoading(true); // ✅ Use local loading state
            await generateSuggestions();

            addNotification({
                type: 'success',
                message: 'Strategic intelligence generated',
                duration: 3000,
            });
        } catch (error) {
            logger.error(`Error generating suggestions: ${(error as Error).message}`);
            addNotification({
                type: 'error',
                message: 'Failed to generate suggestions',
                duration: 5000,
            });
        } finally {
            setIsLocalLoading(false); // ✅ Use local loading state
        }
    }, [generateSuggestions, addNotification]);

    // Legacy speech recognition handlers (will be updated in next step)
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

    const handleRecognitionStart = useCallback(() => {
        logger.info('🎙️✅ Speech recognition started');
        setRecognitionStatus('active');
        setSpeechErrorMessage(null);
    }, []);

    const handleRecognitionEnd = useCallback(() => {
        logger.info('🎙️⏹️ Speech recognition ended');
        setRecognitionStatus('inactive');
    }, []);

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

    const { start, stop, startAudioVisualization } = useSpeechRecognition({
        onStart: handleRecognitionStart,
        onEnd: handleRecognitionEnd,
        onError: handleRecognitionError,
        onResult: handleRecognitionResult,
    });

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

    return (
        <div className="flex flex-col h-full overflow-hidden p-1 gap-4">
            {/* ✅ UPDATED: Call Setup Modal (replaces Interview Modal) */}
            {showRoleModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center">
                    <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={handleModalClose} />
                    <div className="relative bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden mx-4">
                        <div className="flex items-center justify-between p-6 border-b">
                            <h2 className="text-xl font-semibold">🎯 Call Setup</h2>
                            <Button variant="ghost" size="sm" onClick={handleModalClose} className="h-8 w-8 p-0">
                                <X className="h-4 w-4" />
                            </Button>
                        </div>
                        <CallModalProvider onSubmit={handleCallStart}>
                            <div className="overflow-y-auto max-h-[calc(90vh-140px)]">
                                <div className="p-6">
                                    <CallModalTabs />
                                    <div className="mt-6">
                                        <CallModalFooter />
                                    </div>
                                </div>
                            </div>
                        </CallModalProvider>
                    </div>
                </div>
            )}

            {/* Top Navigation Bar */}
            <InlineErrorBoundary>
                <TopNavigationBar
                    status={recognitionStatus}
                    errorMessage={speechErrorMessage}
                    knowledgeBaseName={knowledgeBaseName}
                    indexedDocumentsCount={indexedDocumentsCount}
                />
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
                            <div className="flex-1 min-h-0 overflow-hidden">
                                <MemoizedChatMessagesBox
                                    id="postChat"
                                    messages={conversationMessages}
                                    streamedContent={streamedContent}
                                    isStreamingComplete={isStreamingComplete}
                                    className="flex-1"
                                />
                            </div>

                            <Separator className="flex-shrink-0" />

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

                                <Button
                                    variant="move"
                                    onClick={handleMove}
                                    disabled={uiLoading || isGenerating || isLocalLoading}
                                    className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-xs font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-blue-500 text-white hover:bg-blue-600 h-8 px-2 py-1 mt-2 gap-1.5 self-end"
                                >
                                    <ArrowRight className="mr-1 h-4 w-4" />
                                    {uiLoading || isLocalLoading ? 'Generating...' : 'Move'}
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
                        <div className="overflow-hidden scroll-smooth">
                            {/* ✅ FIXED: Use key_points instead of goals, with fallback */}
                            <ConversationContext
                                summary={conversationSummary}
                                goals={interviewContext?.key_points || []}
                            />
                        </div>

                        <div className="overflow-hidden scroll-smooth">
                            <AIErrorBoundary>
                                <ConversationInsights
                                    suggestions={conversationSuggestions}
                                    onSuggest={handleSuggest}
                                    isLoading={isGenerating}
                                />
                            </AIErrorBoundary>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
