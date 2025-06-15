// src/app/chat/page.tsx
'use client';

import { AIErrorBoundary, InlineErrorBoundary, SpeechErrorBoundary } from '@/components/error-boundary';
import { Button, Card, CardContent, CardHeader, CardTitle, Separator } from '@/components/ui';
import { logger } from '@/modules';
import {
    useConversationMessages,
    useCallContext, //
    useKnowledge,
    useLLM,
    useStreamingResponse,
    useUI,
    useSpeech,
} from '@/stores/hooks/useSelectors';
import { CallContext } from '@/types/callContext';
import { ArrowRight, MessageSquare } from 'lucide-react';
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
import SimplifiedCallModal from '@/components/SimplifiedCallModal';

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
        context: callContext,
        isModalOpen: showRoleModal,
        setCallContext,
        openSetupModal,
        closeSetupModal,
    } = useCallContext(); // ✅ Updated from useInterview

    const { addNotification, isLoading: uiLoading, setLoading: _setLoading } = useUI();

    const {
        isRecording: _isRecording,
        recognitionStatus,
        error: speechError,
        currentTranscript,
        interimTranscripts,
        startRecording,
        stopRecording,
        handleRecognitionResult,
        clearTranscripts,
        clearError: clearSpeechError,
    } = useSpeech();

    // ✅ Get streaming response from store
    const currentStreamingResponse = useStreamingResponse(currentStreamId || '');
    const streamedContent = currentStreamingResponse?.content || '';
    const isStreamingComplete = currentStreamingResponse?.isComplete ?? true;

    // ✅ Get conversation messages from store
    const conversationMessages = useConversationMessages('main');

    /* ------------------------------------------------------------------ *
     * 🎙️  LOCAL STATE (only for UI-specific things)
     * ------------------------------------------------------------------ */
    const [isLocalLoading, setIsLocalLoading] = useState(false);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const visualizationStartedRef = useRef(false);
    const mediaStreamRef = useRef<MediaStream | null>(null);
    const _mediaRecorderRef = useRef<MediaRecorder | null>(null);
    const recognitionRef = useRef<SpeechRecognition | null>(null);

    /* ------------------------------------------------------------------ *
     * 🔎  EFFECTS & TRACING
     * ------------------------------------------------------------------ */
    useEffect(() => {
        logger.debug('[ChatPage] Mount');
        return () => {
            logger.debug('[ChatPage] Unmount');
            // Cleanup on unmount
            if (mediaStreamRef.current) {
                mediaStreamRef.current.getTracks().forEach(track => track.stop());
            }
            if (recognitionRef.current) {
                recognitionRef.current.stop();
            }
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
            setCallContext(context);
            closeSetupModal();

            // ✅ Safely initialize knowledge base
            initializeKnowledgeBase()
                .then(() => logger.info('[ChatPage] ✅ Knowledge base initialized'))
                .catch(err => {
                    logger.error('[ChatPage] ❌ KB init failed', err);
                    // Don't block the call if KB init fails
                    addNotification?.({
                        type: 'warning',
                        message: 'Knowledge base initialization failed, but you can still use the app',
                        duration: 5000,
                    });
                });
        },
        [setCallContext, closeSetupModal, initializeKnowledgeBase, addNotification]
    );

    const handleModalClose = useCallback(() => {
        logger.info('[ChatPage] ↩️ Closing setup modal');
        closeSetupModal();
    }, [closeSetupModal]);

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

        try {
            setIsLocalLoading(true);
            await generateResponse(combined);
            clearTranscripts();

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
    }, [interimTranscripts, currentTranscript, generateResponse, clearTranscripts, addNotification]);

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
     * 🎙️  SPEECH RECOGNITION HANDLERS
     * ------------------------------------------------------------------ */
    const startAudioVisualization = useCallback((canvas: HTMLCanvasElement) => {
        if (!mediaStreamRef.current) return;

        const audioContext = new AudioContext();
        const analyser = audioContext.createAnalyser();
        const source = audioContext.createMediaStreamSource(mediaStreamRef.current);
        source.connect(analyser);

        analyser.fftSize = 256;
        const bufferLength = analyser.frequencyBinCount;
        const dataArray = new Uint8Array(bufferLength);

        const canvasCtx = canvas.getContext('2d');
        if (!canvasCtx) return;

        const draw = () => {
            if (!visualizationStartedRef.current) return;

            requestAnimationFrame(draw);
            analyser.getByteFrequencyData(dataArray);

            canvasCtx.fillStyle = 'rgb(20, 20, 20)';
            canvasCtx.fillRect(0, 0, canvas.width, canvas.height);

            const barWidth = (canvas.width / bufferLength) * 2.5;
            let barHeight;
            let x = 0;

            for (let i = 0; i < bufferLength; i++) {
                barHeight = dataArray[i] / 2;
                canvasCtx.fillStyle = `rgb(50, ${barHeight + 100}, 50)`;
                canvasCtx.fillRect(x, canvas.height - barHeight / 2, barWidth, barHeight);
                x += barWidth + 1;
            }
        };

        draw();
    }, []);

    const handleStartRecording = useCallback(async () => {
        logger.info('[ChatPage] 🎙️ Start recording');

        try {
            // Clear any previous errors
            clearSpeechError();

            // Get microphone access
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            mediaStreamRef.current = stream;

            // Initialize Web Speech API
            const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
            if (!SpeechRecognition) {
                throw new Error('Speech recognition not supported');
            }

            const recognition = new SpeechRecognition();
            recognition.continuous = true;
            recognition.interimResults = true;
            recognition.lang = 'en-US';

            recognition.onresult = event => {
                let finalTranscript = '';
                let interimTranscript = '';

                for (let i = event.resultIndex; i < event.results.length; i++) {
                    const transcript = event.results[i][0].transcript;
                    if (event.results[i].isFinal) {
                        finalTranscript += transcript + ' ';
                    } else {
                        interimTranscript += transcript;
                    }
                }

                handleRecognitionResult(finalTranscript.trim(), interimTranscript.trim());
            };

            recognition.onerror = event => {
                logger.error('[ChatPage] Recognition error:', event.error);
                addNotification?.({
                    type: 'error',
                    message: `Speech recognition error: ${event.error}`,
                    duration: 5000,
                });
            };

            recognition.onend = () => {
                logger.info('[ChatPage] Recognition ended');
            };

            recognitionRef.current = recognition;
            recognition.start();

            // Start audio visualization
            if (canvasRef.current && !visualizationStartedRef.current) {
                logger.info('[ChatPage] 🎨 Starting audio visualization');
                startAudioVisualization(canvasRef.current);
                visualizationStartedRef.current = true;
            }

            // Update store state
            await startRecording();
        } catch (err) {
            logger.error('[ChatPage] ❌ Start recording failed', err);
            addNotification?.({
                type: 'error',
                message: err instanceof Error ? err.message : 'Failed to start recording',
                duration: 5000,
            });
        }
    }, [startRecording, handleRecognitionResult, clearSpeechError, addNotification, startAudioVisualization]);

    const handleStopRecording = useCallback(() => {
        logger.info('[ChatPage] ⏹️ Stop recording');

        // Stop recognition
        if (recognitionRef.current) {
            recognitionRef.current.stop();
            recognitionRef.current = null;
        }

        // Stop media stream
        if (mediaStreamRef.current) {
            mediaStreamRef.current.getTracks().forEach(track => track.stop());
            mediaStreamRef.current = null;
        }

        // Stop visualization
        visualizationStartedRef.current = false;

        // Update store state
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
                                    interimTranscriptions={interimTranscripts}
                                    currentInterimTranscript={currentTranscript}
                                    className="flex-1"
                                />

                                <Button
                                    variant="move"
                                    onClick={handleMove}
                                    disabled={
                                        uiLoading ||
                                        isGenerating ||
                                        isLocalLoading ||
                                        (!currentTranscript && interimTranscripts.length === 0)
                                    }
                                    className="mt-2 inline-flex h-8 items-center justify-center gap-1.5 self-end whitespace-nowrap rounded-md bg-blue-500 px-2 py-1 text-xs font-medium text-white transition-colors hover:bg-blue-600 disabled:pointer-events-none disabled:opacity-50"
                                >
                                    <ArrowRight className="mr-1 h-4 w-4" />
                                    {uiLoading || isLocalLoading || isGenerating ? 'Generating…' : 'Move'}
                                </Button>
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
                                    isLoading={isGenerating || isLocalLoading}
                                />
                            </AIErrorBoundary>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
