// src/app/chat/page.tsx
'use client';

import { CallModalProvider } from '@/components/call-modal/CallModalContext';
import { CallModalFooter } from '@/components/call-modal/CallModalFooter';
import { CallModalTabs } from '@/components/call-modal/CallModalTabs';
import { AIErrorBoundary, InlineErrorBoundary, SpeechErrorBoundary } from '@/components/error-boundary';
import { Button, Card, CardContent, CardHeader, CardTitle, Separator } from '@/components/ui';
import { CustomSpeechError, useSpeechRecognition, useTranscriptions } from '@/hooks';
import { logger } from '@/modules';
import {
    useConversationMessages,
    useInterview,
    useKnowledge,
    useLLM,
    useStreamingResponse,
    useUI,
} from '@/stores/hooks/useSelectors';
import { CallContext } from '@/types/callContext';
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

export default function ChatPage() {
    /* ------------------------------------------------------------------ *
     * 🧩  ZUSTAND SELECTORS
     * ------------------------------------------------------------------ */
    const {
        isLoading: knowledgeLoading,
        error: knowledgeError,
        indexedDocumentsCount,
        knowledgeBaseName,
        initializeKnowledgeBase,
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

    /* ------------------------------------------------------------------ *
     * 🎙️  LOCAL STATE
     * ------------------------------------------------------------------ */
    const [recognitionStatus, setRecognitionStatus] = useState<'inactive' | 'active' | 'error'>('inactive');
    const [speechErrorMessage, setSpeechErrorMessage] = useState<string | null>(null);
    const [isLocalLoading, setIsLocalLoading] = useState(false);

    const canvasRef = useRef<HTMLCanvasElement>(null);
    const visualizationStartedRef = useRef(false);

    /* ------------------------------------------------------------------ *
     * 🔎  EFFECTS & TRACING
     * ------------------------------------------------------------------ */
    useEffect(() => {
        logger.debug('[ChatPage] Mount');
        return () => logger.debug('[ChatPage] Unmount');
    }, []);

    useEffect(() => {
        logger.trace('[ChatPage] Streaming content length', streamedContent.length);
    }, [streamedContent]);

    useEffect(() => {
        logger.debug('[ChatPage] recognitionStatus', recognitionStatus);
    }, [recognitionStatus]);

    /* ------------------------------------------------------------------ *
     * 🪄  MODAL LOGIC
     * ------------------------------------------------------------------ */
    useEffect(() => {
        if (!interviewContext) {
            logger.info('[ChatPage] No call context — opening setup modal');
            openSetupModal();
        }
    }, [interviewContext, openSetupModal]);

    const handleCallStart = useCallback(
        (context: CallContext) => {
            logger.info('[ChatPage] 🚀 Starting call with context:', context);
            setCallContext(context);
            closeSetupModal();
            initializeKnowledgeBase()
                .then(() => logger.info('[ChatPage] ✅ Knowledge base initialized'))
                .catch(err => logger.error('[ChatPage] ❌ KB init failed', err));
        },
        [setCallContext, closeSetupModal]
    );

    const handleModalClose = useCallback(() => {
        logger.info('[ChatPage] ↩️ Closing setup modal');
        closeSetupModal();
    }, [closeSetupModal]);

    /* ------------------------------------------------------------------ *
     * 📝  TRANSCRIPTIONS HOOK
     * ------------------------------------------------------------------ */
    const { interimTranscriptions, currentInterimTranscript, handleClear, handleRecognitionResult } = useTranscriptions(
        {
            generateResponse,
        }
    );

    /* ------------------------------------------------------------------ *
     * 🤖  MOVE ACTION (Generate Response)
     * ------------------------------------------------------------------ */
    const handleMove = useCallback(async () => {
        const combined = [...interimTranscriptions.map(m => m.content), currentInterimTranscript].join(' ').trim();

        if (combined === '') return;

        logger.debug('[ChatPage] ▶️ handleMove triggered, tokens', combined.split(' ').length);

        try {
            setIsLocalLoading(true);
            await generateResponse(combined);
            handleClear();

            addNotification?.({
                type: 'success',
                message: 'Response generated successfully',
                duration: 3_000,
            });
        } catch (err) {
            const msg = err instanceof Error ? err.message : String(err);
            logger.error('[ChatPage] ❌ generateResponse failed', msg);

            addNotification?.({
                type: 'error',
                message: 'Failed to generate response',
                duration: 5_000,
            });
        } finally {
            setIsLocalLoading(false);
        }
    }, [interimTranscriptions, currentInterimTranscript, generateResponse, handleClear, addNotification]);

    /* ------------------------------------------------------------------ *
     * 💡  SUGGEST ACTION (Strategic Intelligence)
     * ------------------------------------------------------------------ */
    const handleSuggest = useCallback(async () => {
        logger.debug('[ChatPage] 💡 handleSuggest triggered');

        try {
            setIsLocalLoading(true);
            await generateSuggestions();

            addNotification?.({
                type: 'success',
                message: 'Strategic intelligence generated',
                duration: 3_000,
            });
        } catch (err) {
            const msg = err instanceof Error ? err.message : String(err);
            logger.error('[ChatPage] ❌ generateSuggestions failed', msg);

            addNotification?.({
                type: 'error',
                message: 'Failed to generate suggestions',
                duration: 5_000,
            });
        } finally {
            setIsLocalLoading(false);
        }
    }, [generateSuggestions, addNotification]);

    /* ------------------------------------------------------------------ *
     * 🎙️  SPEECH RECOGNITION SETUP
     * ------------------------------------------------------------------ */
    const getUserFriendlyError = useCallback((code: string): string => {
        const map: Record<string, string> = {
            network: 'Network error. Please check your internet connection.',
            'not-allowed': 'Microphone access denied. Please allow microphone access in your browser settings.',
            'service-not-allowed': 'Speech recognition service not allowed. Please check your browser settings.',
            'no-speech': 'No speech detected. Please try speaking again.',
            'audio-capture': 'Audio capture failed. Please check your microphone.',
            aborted: 'Speech recognition was aborted.',
            'language-not-supported': 'Language not supported. Please try a different language.',
            'bad-grammar': 'Grammar configuration issue. Please contact support.',
        };
        return map[code] ?? 'An unexpected error occurred with speech recognition.';
    }, []);

    const handleRecognitionStart = useCallback(() => {
        logger.info('[ChatPage] 🎙️✅ Recognition started');
        setRecognitionStatus('active');
        setSpeechErrorMessage(null);
    }, []);

    const handleRecognitionEnd = useCallback(() => {
        logger.info('[ChatPage] 🎙️⏹️ Recognition ended');
        setRecognitionStatus('inactive');
    }, []);

    const handleRecognitionError = useCallback(
        (speechErr: SpeechRecognitionErrorEvent | CustomSpeechError) => {
            const code = 'error' in speechErr ? speechErr.error : speechErr.code;
            const msg = 'error' in speechErr ? getUserFriendlyError(code) : speechErr.message;

            logger.error('[ChatPage] 🎙️❌', code, msg);
            setRecognitionStatus('error');
            setSpeechErrorMessage(msg);
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
        logger.info('[ChatPage] 🎙️ Start button clicked');
        start()
            .then(() => {
                if (canvasRef.current && !visualizationStartedRef.current) {
                    logger.info('[ChatPage] 🎨 Starting audio visualization');
                    startAudioVisualization(canvasRef.current);
                    visualizationStartedRef.current = true;
                } else if (!canvasRef.current) {
                    logger.warning('[ChatPage] ⚠️ Canvas ref null, cannot visualize');
                }
            })
            .catch(err => logger.error('[ChatPage] ❌ Speech start failed', err));
    }, [start, startAudioVisualization]);

    /* ------------------------------------------------------------------ *
     * ⏳  CONDITIONAL RENDERING
     * ------------------------------------------------------------------ */
    if (knowledgeLoading) {
        return (
            <LoadingState
                message="Preparing Knowledge Base..."
                subMessage="This might take a moment on first access."
            />
        );
    }

    if (knowledgeError) {
        return (
            <ErrorState
                title="Knowledge Base Error"
                message={knowledgeError}
                onRetry={() => window.location.reload()}
            />
        );
    }

    /* ------------------------------------------------------------------ *
     * 🖼️  MAIN UI
     * ------------------------------------------------------------------ */
    return (
        <div className="flex h-full flex-col gap-4 overflow-hidden p-1">
            {/* ════════════════════════  CALL SETUP MODAL ════════════════════════ */}
            {showRoleModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center">
                    <div className="absolute inset-0 backdrop-blur-sm bg-black/50" onClick={handleModalClose} />
                    <div className="relative mx-4 w-full max-w-4xl max-h-[90vh] overflow-hidden rounded-lg bg-white shadow-xl">
                        <div className="flex items-center justify-between border-b p-6">
                            <h2 className="text-xl font-semibold">🎯 Call Setup</h2>
                            <Button variant="ghost" size="sm" onClick={handleModalClose} className="h-8 w-8 p-0">
                                <X className="h-4 w-4" />
                            </Button>
                        </div>
                        <CallModalProvider onSubmit={handleCallStart}>
                            <div className="max-h-[calc(90vh-140px)] overflow-y-auto">
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

            {/* ════════════════════════  NAVBAR ════════════════════════ */}
            <InlineErrorBoundary>
                <TopNavigationBar
                    status={recognitionStatus}
                    errorMessage={speechErrorMessage}
                    knowledgeBaseName={knowledgeBaseName}
                    indexedDocumentsCount={indexedDocumentsCount}
                />
            </InlineErrorBoundary>

            {/* ════════════════════════  MAIN GRID ════════════════════════ */}
            <div className="grid min-h-0 flex-1 grid-cols-12 gap-6 overflow-hidden">
                {/* LEFT: Chat */}
                <div className="col-span-6 flex-1 overflow-hidden">
                    <Card className="relative flex h-full flex-col overflow-hidden">
                        <CardHeader className="flex-shrink-0 pb-3">
                            <CardTitle className="flex items-center gap-2 text-lg">
                                <MessageSquare className="h-5 w-5" />
                                Conversation
                            </CardTitle>
                        </CardHeader>

                        <CardContent className="flex min-h-0 flex-1 flex-col gap-4 overflow-hidden">
                            <div className="min-h-0 flex-1 overflow-hidden">
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
                                className="flex max-h-52 flex-col overflow-y-auto rounded-lg border border-gray-800 bg-background p-3 shadow-none md:p-4"
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
                                    className="mt-2 inline-flex h-8 items-center justify-center gap-1.5 self-end whitespace-nowrap rounded-md bg-blue-500 px-2 py-1 text-xs font-medium text-white transition-colors hover:bg-blue-600 disabled:pointer-events-none disabled:opacity-50"
                                >
                                    <ArrowRight className="mr-1 h-4 w-4" />
                                    {uiLoading || isLocalLoading ? 'Generating…' : 'Move'}
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* MIDDLE: Voice Controls */}
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

                {/* RIGHT: Context + Insights */}
                <div className="col-span-4 h-full w-full overflow-hidden">
                    <div className="grid h-full w-full grid-rows-2 gap-2">
                        <div className="overflow-hidden scroll-smooth">
                            <ConversationContext
                                summary={conversationSummary}
                                goals={interviewContext?.key_points ?? []}
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
