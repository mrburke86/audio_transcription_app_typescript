// src/app/chat/page.tsx
'use client';

import { AIErrorBoundary, InlineErrorBoundary, SpeechErrorBoundary } from '@/components/error-boundary';
import { SimplifiedCallModal } from '@/components/SimplifiedCallModal';
import { Button, Card, CardContent, CardHeader, CardTitle, Separator } from '@/components/ui';
import { logger } from '@/modules';
import {
    useCallContext,
    useConversationMessages, //
    useKnowledge,
    useLLM,
    useSpeech,
    useStreamingResponse,
    useUI,
} from '@/stores/hooks/useSelectors';
import { CallContext } from '@/types/callContext';
import { ArrowRight, MessageSquare } from 'lucide-react';
import { useCallback, useEffect, useRef } from 'react';
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
        isGeneratingResponse,
        isGeneratingSuggestions,
        llmError,
        conversationSummary,
        conversationSuggestions,
        currentStreamId,
        clearLLMError,
        cancelCurrentRequest,
    } = useLLM();

    const { context: callContext, openSetupModal, closeSetupModal, setCallContext } = useCallContext();

    // ✅ UPDATED: Use proper global modal state check
    const {
        addNotification,
        globalLoading,
        globalModals,
        setGlobalLoading, // ⚠️ RENAMED: from setLoading
        isAnyDomainLoading,
    } = useUI();

    // ✅ ADDED: Check if setup modal is open using global modal system
    const showRoleModal = globalModals['call-setup-modal']?.isOpen ?? false;

    const {
        // isRecording,
        recognitionStatus,
        error: speechError,
        currentTranscript,
        interimTranscripts,
        startRecording,
        stopRecording,
        clearTranscripts,
        // getMediaStream,
    } = useSpeech();

    // ✅ Get streaming response from store
    const currentStreamingResponse = useStreamingResponse(currentStreamId || '');
    const streamedContent = currentStreamingResponse?.content || '';
    const isStreamingComplete = currentStreamingResponse?.isComplete ?? true;

    const conversationMessages = useConversationMessages('main');

    // ✅ Add debug logging for call context state changes
    useEffect(() => {
        if (callContext) {
            logger.info('[ChatPage] Call context updated:', {
                type: callContext.call_type,
                organization: callContext.target_organization,
                role: callContext.target_role,
                knowledgeEnabled: callContext.knowledge_search_enabled,
            });
        }
    }, [callContext]);

    // ✅ Add effect to validate context setup completion
    useEffect(() => {
        if (callContext && !callContext.target_role && !callContext.target_organization) {
            logger.warning('[ChatPage] Call context missing essential information');

            // Optionally show a warning to the user
            addNotification?.({
                type: 'warning',
                message: 'Call context setup may be incomplete',
                duration: 3000,
            });
        }
    }, [callContext, addNotification]);

    /* ------------------------------------------------------------------ *
     * 🎙️  LOCAL STATE (only for UI-specific things)
     * ------------------------------------------------------------------ */
    // const [isLocalLoading, setIsLocalLoading] = useState(false);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    // const visualizationStartedRef = useRef(false);

    // ❌ REMOVED: No longer needed since slice manages these
    // const mediaStreamRef = useRef<MediaStream | null>(null);
    // const _mediaRecorderRef = useRef<MediaRecorder | null>(null);
    // const recognitionRef = useRef<SpeechRecognition | null>(null);

    /* ------------------------------------------------------------------ *
     * 🔎  EFFECTS & TRACING
     * ------------------------------------------------------------------ */
    useEffect(() => {
        logger.debug('[ChatPage] Mount');
        return () => {
            logger.debug('[ChatPage] Unmount');
            // ❌ REMOVED: Cleanup now handled by slice
            // if (mediaStreamRef.current) {
            //     mediaStreamRef.current.getTracks().forEach(track => track.stop());
            // }
            // if (recognitionRef.current) {
            //     recognitionRef.current.stop();
            // }
        };
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
        if (!callContext) {
            logger.info('[ChatPage] No call context — opening setup modal');
            openSetupModal();
        }
    }, [callContext, openSetupModal]);

    const handleCallStart = useCallback(
        (context: CallContext) => {
            logger.info('[ChatPage] 🚀 Starting call with context:', context);

            // ✅ Use the setCallContext directly (already destructured above)
            setCallContext(context);

            closeSetupModal();

            // ✅ IMPROVED: Use global loading for app-level operation
            setGlobalLoading(true, 'Initializing knowledge base...', 'ChatPage');

            // ✅ Safely initialize knowledge base
            initializeKnowledgeBase()
                .then(() => {
                    logger.info('[ChatPage] ✅ Knowledge base initialized');
                    setGlobalLoading(false);
                })
                .catch(err => {
                    logger.error('[ChatPage] ❌ KB init failed', err);
                    setGlobalLoading(false);

                    // Notification will be handled by notification middleware
                    addNotification?.({
                        type: 'warning',
                        message: 'Knowledge base initialization failed, but you can still use the app',
                        duration: 5000,
                    });
                });
        },
        [setCallContext, closeSetupModal, initializeKnowledgeBase, addNotification, setGlobalLoading]
        // ✅ ADDED: setCallContext to the dependency array
    );

    const handleModalClose = useCallback(() => {
        logger.info('[ChatPage] ↩️ Closing setup modal');
        closeSetupModal();
    }, [closeSetupModal]);

    useEffect(() => {
        if (llmError) {
            logger.error('[ChatPage] LLM Error detected:', llmError);
            const timer = setTimeout(() => {
                clearLLMError();
            }, 10000);
            return () => clearTimeout(timer);
        }
    }, [llmError, clearLLMError]);

    /* ------------------------------------------------------------------ *
     * 🤖  MOVE ACTION (Generate Response)
     * ------------------------------------------------------------------ */
    const handleMove = useCallback(async () => {
        const combined = [...interimTranscripts.map(m => m.content), currentTranscript].join(' ').trim();

        if (combined === '') {
            addNotification?.({
                type: 'warning',
                message: 'No text to process. Please speak first.',
                duration: 3000,
            });
            return;
        }

        logger.debug('[ChatPage] ▶️ handleMove triggered, tokens', combined.split(' ').length);

        if (llmError) {
            clearLLMError();
        }

        try {
            // ❌ REMOVED: Local loading state management
            // setIsLocalLoading(true);

            await generateResponse(combined);
            clearTranscripts();

            // ✅ IMPROVED: Notification will be handled by slice/middleware
            // No need for manual success notification here
        } catch (err) {
            const msg = err instanceof Error ? err.message : String(err);
            logger.error('[ChatPage] ❌ generateResponse failed', msg);

            // ✅ IMPROVED: Error notification will be handled by middleware
            addNotification?.({
                type: 'error',
                message: 'Failed to generate response',
                duration: 5_000,
            });
        } finally {
            // ❌ REMOVED: Local loading state cleanup
            // setIsLocalLoading(false);
        }
    }, [
        interimTranscripts,
        currentTranscript,
        generateResponse,
        clearTranscripts,
        addNotification,
        llmError,
        clearLLMError,
    ]);

    /* ------------------------------------------------------------------ *
     * 💡  SUGGEST ACTION (Strategic Intelligence)
     * ------------------------------------------------------------------ */
    const handleSuggest = useCallback(async () => {
        logger.debug('[ChatPage] 💡 handleSuggest triggered');

        if (llmError) {
            clearLLMError();
        }

        try {
            // ❌ REMOVED: Local loading state management
            // setIsLocalLoading(true);

            await generateSuggestions();

            // ✅ IMPROVED: Success notification will be handled by slice/middleware
        } catch (err) {
            const msg = err instanceof Error ? err.message : String(err);
            logger.error('[ChatPage] ❌ generateSuggestions failed', msg);

            // ✅ IMPROVED: Error notification will be handled by middleware
            addNotification?.({
                type: 'error',
                message: 'Failed to generate suggestions',
                duration: 5_000,
            });
        } finally {
            // ❌ REMOVED: Local loading state cleanup
            // setIsLocalLoading(false);
        }
    }, [generateSuggestions, addNotification, llmError, clearLLMError]);

    /* ------------------------------------------------------------------ *
     * 🎙️  SPEECH RECOGNITION HANDLERS
     * ------------------------------------------------------------------ */
    // const startAudioVisualization = useCallback((canvas: HTMLCanvasElement, mediaStream: MediaStream) => {
    //     logger.info('[ChatPage] 🎨 Starting audio visualization');

    //     const audioContext = new AudioContext();
    //     const analyser = audioContext.createAnalyser();
    //     const source = audioContext.createMediaStreamSource(mediaStream);
    //     source.connect(analyser);

    //     analyser.fftSize = 256;
    //     const bufferLength = analyser.frequencyBinCount;
    //     const dataArray = new Uint8Array(bufferLength);

    //     const canvasCtx = canvas.getContext('2d');
    //     if (!canvasCtx) return;

    //     const draw = () => {
    //         if (!visualizationStartedRef.current) return;

    //         requestAnimationFrame(draw);
    //         analyser.getByteFrequencyData(dataArray);

    //         canvasCtx.fillStyle = 'rgb(20, 20, 20)';
    //         canvasCtx.fillRect(0, 0, canvas.width, canvas.height);

    //         const barWidth = (canvas.width / bufferLength) * 2.5;
    //         let barHeight;
    //         let x = 0;

    //         for (let i = 0; i < bufferLength; i++) {
    //             barHeight = dataArray[i] / 2;
    //             canvasCtx.fillStyle = `rgb(50, ${barHeight + 100}, 50)`;
    //             canvasCtx.fillRect(x, canvas.height - barHeight / 2, barWidth, barHeight);
    //             x += barWidth + 1;
    //         }
    //     };

    //     draw();
    // }, []);

    // // ✅ Now the useEffect has all its dependencies properly listed
    // useEffect(() => {
    //     if (isRecording && canvasRef.current && !visualizationStartedRef.current) {
    //         const mediaStream = getMediaStream();
    //         if (mediaStream) {
    //             startAudioVisualization(canvasRef.current, mediaStream);
    //             visualizationStartedRef.current = true;
    //         }
    //     } else if (!isRecording && visualizationStartedRef.current) {
    //         logger.info('[ChatPage] 🎨 Stopping audio visualization');
    //         visualizationStartedRef.current = false;
    //     }
    // }, [isRecording, getMediaStream, startAudioVisualization]); // ✅ All dependencies included

    // ✅ DRAMATICALLY SIMPLIFIED: Just calls slice action
    const handleStartRecording = useCallback(async () => {
        logger.info('[ChatPage] 🎙️ Calling slice startRecording action');

        try {
            await startRecording();
            // ✅ IMPROVED: Notification will be handled by slice/middleware
        } catch (error) {
            logger.error('[ChatPage] ❌ Start recording failed:', error);
            // ✅ IMPROVED: Error notification will be handled by middleware
        }
    }, [startRecording]);

    const handleStopRecording = useCallback(() => {
        logger.info('[ChatPage] ⏹️ Calling slice stopRecording action');
        stopRecording();
    }, [stopRecording]);

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
     * 🎯  IMPROVED: Better loading state logic
     * ------------------------------------------------------------------ */
    // ✅ IMPROVED: Use consolidated loading state check
    const isAnyOperationLoading = isAnyDomainLoading();
    const canPerformActions = (!isAnyOperationLoading && currentTranscript) || interimTranscripts.length > 0;

    /* ------------------------------------------------------------------ *
     * 🖼️  MAIN UI
     * ------------------------------------------------------------------ */
    return (
        <div className="flex h-full flex-col gap-4 overflow-hidden p-1">
            {/* ════════════════════════  CALL SETUP MODAL ════════════════════════ */}
            <SimplifiedCallModal isOpen={showRoleModal} onClose={handleModalClose} onSubmit={handleCallStart} />

            {/* ════════════════════════  NAVBAR ════════════════════════ */}
            <InlineErrorBoundary>
                <TopNavigationBar
                    status={recognitionStatus}
                    errorMessage={speechError}
                    knowledgeBaseName={knowledgeBaseName}
                    indexedDocumentsCount={indexedDocumentsCount}
                />
            </InlineErrorBoundary>

            {/* ✅ IMPROVED: Global loading overlay */}
            {globalLoading.isActive && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                    <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-xl">
                        <div className="flex items-center space-x-3">
                            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500"></div>
                            <span className="text-lg font-medium">{globalLoading.message || 'Loading...'}</span>
                        </div>
                        {globalLoading.source && (
                            <p className="text-sm text-gray-500 mt-2">Source: {globalLoading.source}</p>
                        )}
                    </div>
                </div>
            )}

            {/* ════════════════════════  MAIN GRID ════════════════════════ */}
            <div className="grid min-h-0 flex-1 grid-cols-12 gap-6 overflow-hidden">
                {/* LEFT: Chat */}
                <div className="col-span-6 flex-1 overflow-hidden">
                    <Card className="relative flex h-full flex-col overflow-hidden">
                        <CardHeader className="flex-shrink-0 pb-3">
                            <CardTitle className="flex items-center gap-2 text-lg">
                                <MessageSquare className="h-5 w-5" />
                                Conversation
                                {/* ✅ IMPROVED: Show loading indicator in title when needed */}
                                {(isGeneratingResponse || isGenerating) && (
                                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-500 ml-2"></div>
                                )}
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

                            <div className="flex max-h-52 flex-col overflow-y-auto rounded-lg border border-gray-800 bg-background p-3 shadow-none md:p-4">
                                <LiveTranscriptionBox
                                    id="preChat"
                                    interimTranscriptions={interimTranscripts}
                                    currentInterimTranscript={currentTranscript}
                                    className="flex-1"
                                />

                                {llmError && (
                                    <div className="mt-2 p-2 bg-red-50 border border-red-200 rounded text-red-700 text-xs">
                                        <div className="flex items-center justify-between">
                                            <span>LLM Error: {llmError}</span>
                                            <button
                                                onClick={clearLLMError}
                                                className="ml-2 text-red-500 hover:text-red-700"
                                            >
                                                ✕
                                            </button>
                                        </div>
                                    </div>
                                )}

                                <Button
                                    variant="move"
                                    onClick={handleMove}
                                    disabled={!canPerformActions} // ✅ IMPROVED: Use consolidated check
                                    className="mt-2 inline-flex h-8 items-center justify-center gap-1.5 self-end whitespace-nowrap rounded-md bg-blue-500 px-2 py-1 text-xs font-medium text-white transition-colors hover:bg-blue-600 disabled:pointer-events-none disabled:opacity-50"
                                >
                                    <ArrowRight className="mr-1 h-4 w-4" />
                                    {/* ✅ IMPROVED: Better loading state display */}
                                    {isGeneratingResponse ? 'Generating…' : 'Move'}
                                </Button>

                                {(isGeneratingResponse || isGeneratingSuggestions) && (
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={cancelCurrentRequest}
                                        className="mt-1 text-xs"
                                    >
                                        Cancel
                                    </Button>
                                )}
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* MIDDLE: Voice Controls */}
                <div className="col-span-1">
                    <SpeechErrorBoundary>
                        <VoiceControls
                            onStart={handleStartRecording}
                            onStop={handleStopRecording}
                            onClear={clearTranscripts}
                            isRecognitionActive={recognitionStatus === 'active'}
                            canvasRef={canvasRef}
                        />
                    </SpeechErrorBoundary>
                </div>

                {/* RIGHT: Context + Insights */}
                <div className="col-span-5 h-full w-full overflow-hidden">
                    <div className="grid h-full w-full grid-rows-2 gap-2">
                        <div className="overflow-hidden scroll-smooth">
                            <ConversationContext summary={conversationSummary} goals={callContext?.key_points ?? []} />
                        </div>

                        <div className="overflow-hidden scroll-smooth">
                            <AIErrorBoundary>
                                <ConversationInsights
                                    suggestions={conversationSuggestions}
                                    onSuggest={handleSuggest}
                                    isLoading={isGenerating} // ✅ IMPROVED: Use specific loading state
                                />
                            </AIErrorBoundary>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
