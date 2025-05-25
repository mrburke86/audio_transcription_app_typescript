// src/components/chat/ChatComponent.tsx
'use client';

import Header from '@/components/Header';
import ConversationSummary from '@/components/chat/ConversationSummary';
import GoalsInput from '@/components/chat/GoalsInput';
import { MemoizedChatMessagesBox } from '@/components/chat/MemoizedComponents';
import TranscriptionControls from '@/components/chat/TranscriptionControls';
import { useSpeechRecognition, useTranscriptions, useLLMProvider, CustomSpeechError } from '@/hooks';
import { useKnowledge } from '@/contexts/KnowledgeProvider';
import { logger } from '@/modules/Logger';
import { Badge, Button } from '@/components/ui';
import { ArrowRight, AlertTriangle, CheckCircle } from 'lucide-react';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Message } from '@/types/openai';
import AudioVisualizer from './AudioVisualizer';
import ConversationSuggestions from './ConversationSuggestions';
import LiveTranscriptionBox from './LiveTranscriptionBox';
import RoleDescriptionModal from './RoleDescriptionModal';

interface ChatComponentProps {
    assistantId: string;
    roleDescription: string;
}

const KnowledgeStatus: React.FC<{
    isLoading: boolean;
    error: string | null;
    totalFiles: number;
    totalWords: number;
}> = ({ isLoading, error, totalFiles, totalWords }) => {
    if (isLoading) {
        return (
            <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg flex items-center">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-500 mr-3"></div>
                <span className="text-blue-700 text-sm">Loading knowledge base...</span>
            </div>
        );
    }

    if (error) {
        return (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-center">
                <AlertTriangle className="h-4 w-4 text-red-500 mr-3" />
                <div className="text-red-700 text-sm">
                    <strong>Knowledge Base Error:</strong> {error}
                </div>
            </div>
        );
    }

    if (totalFiles > 0) {
        return (
            <div className="mb-4 p-2 bg-green-50 border border-green-200 rounded-lg flex items-center">
                <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                <span className="text-green-700 text-xs">
                    ✅ Knowledge Base: {totalFiles} files, {totalWords.toLocaleString()} words loaded
                </span>
            </div>
        );
    }

    return null;
};

const ChatComponent: React.FC<ChatComponentProps> = ({ roleDescription }) => {
    const [conversationHistory, setConversationHistory] = useState<Message[]>([]);
    const [goals, setGoals] = useState<string[]>([]);
    const [recognitionStatus, setRecognitionStatus] = useState<'inactive' | 'active' | 'error'>('inactive');
    const [roleDescriptionState, setRoleDescriptionState] = useState<string>(roleDescription);
    const [showRoleModal, setShowRoleModal] = useState<boolean>(false);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);

    const canvasRef = useRef<HTMLCanvasElement>(null);
    const visualizationStartedRef = useRef(false);

    // Knowledge context
    const { isLoading: knowledgeLoading, error: knowledgeError, getTotalStats } = useKnowledge();

    const knowledgeStats = getTotalStats();
    const apiKey = process.env.NEXT_PUBLIC_OPENAI_API_KEY;

    const getUserFriendlyError = useCallback((errorCode: string): string => {
        const errorMap: Record<string, string> = {
            network: 'Network error. Please check your internet connection.',
            'not-allowed': 'Microphone access denied. Please allow microphone access in your browser settings.',
            'service-not-allowed': 'Speech recognition service not allowed. Please check your browser settings.',
            'no-speech': 'No speech detected. Please try speaking again.',
            'audio-capture': 'Audio capture failed. Please check your microphone.',
            aborted: 'Speech recognition was aborted.',
            'language-not-supported': 'Language not supported. Please try a different language.',
            'bad-grammar': 'Grammar configuration issue. Please contact support.',
        };
        return errorMap[errorCode] || 'An unexpected error occurred with speech recognition.';
    }, []);

    // LLM Provider Hook
    const {
        generateResponse,
        generateSuggestions,
        isLoading,
        error,
        streamedContent,
        isStreamingComplete,
        conversationSummary,
        conversationSuggestions,
    } = useLLMProvider(apiKey || '', roleDescriptionState, conversationHistory, goals);

    // Transcriptions hook
    const { interimTranscriptions, currentInterimTranscript, messages, handleMove, handleClear, handleRecognitionResult } =
        useTranscriptions({
            generateResponse,
            streamedContent,
            isStreamingComplete,
        });

    // Update conversation history when userMessages changes
    useEffect(() => {
        setConversationHistory(messages);
    }, [messages]);

    // Show modal on mount if roleDescription is empty
    useEffect(() => {
        if (!roleDescriptionState || roleDescriptionState.trim() === '') {
            setShowRoleModal(true);
        }
    }, [roleDescriptionState]);

    const handleRecognitionStart = useCallback(() => {
        logger.info('🎙️✅ Speech recognition started');
        setRecognitionStatus('active');
        setErrorMessage(null);
    }, []);

    const handleRecognitionEnd = useCallback(() => {
        logger.info('🎙️⏹️ Speech recognition ended');
        setRecognitionStatus('inactive');
    }, []);

    const handleRecognitionError = useCallback(
        (error: SpeechRecognitionErrorEvent | CustomSpeechError) => {
            let errorCode: string;
            let errorMessage: string;

            if ('error' in error) {
                errorCode = error.error;
                errorMessage = getUserFriendlyError(error.error);
            } else {
                errorCode = error.code;
                errorMessage = error.message;
            }

            logger.error(`🎙️❌ Speech recognition error: ${errorCode}`);
            setRecognitionStatus('error');
            setErrorMessage(errorMessage);
        },
        [getUserFriendlyError]
    );

    // Speech recognition hook
    const { start, stop, startAudioVisualization } = useSpeechRecognition({
        onStart: handleRecognitionStart,
        onEnd: handleRecognitionEnd,
        onError: handleRecognitionError,
        onResult: handleRecognitionResult,
    });

    const handleStart = useCallback(() => {
        logger.info('🎙️ Starting speech recognition');
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
            .catch(error => {
                logger.error(`🎙️❌ Failed to start speech recognition: ${error.message}`);
            });
    }, [start, startAudioVisualization]);

    const handleSuggest = useCallback(async () => {
        try {
            await generateSuggestions();
        } catch (error) {
            logger.error(`Error generating suggestions: ${(error as Error).message}`);
        }
    }, [generateSuggestions]);

    const handleRoleSubmit = useCallback((newRoleDescription: string) => {
        setRoleDescriptionState(newRoleDescription);
        setShowRoleModal(false);
    }, []);

    // Show loading screen if knowledge is loading
    if (knowledgeLoading) {
        return (
            <div className="flex flex-col items-center justify-center h-full p-8">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-6"></div>
                    <h2 className="text-xl font-semibold text-gray-700 mb-2">Loading Knowledge Base</h2>
                    <p className="text-gray-600">Initializing ETQ product knowledge...</p>
                    <p className="text-sm text-gray-500 mt-2">This may take a moment on first load</p>
                </div>
            </div>
        );
    }

    // Show error if knowledge failed to load
    if (knowledgeError) {
        return (
            <div className="flex flex-col items-center justify-center h-full p-8">
                <div className="text-center">
                    <AlertTriangle className="h-16 w-16 text-red-500 mx-auto mb-6" />
                    <h2 className="text-xl font-semibold text-red-700 mb-2">Knowledge Base Load Failed</h2>
                    <p className="text-red-600 mb-4">{knowledgeError}</p>
                    <button
                        onClick={() => window.location.reload()}
                        className="mt-4 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
                    >
                        Retry
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="flex flex-col h-full overflow-hidden p-1 container gap-4">
            {/* Knowledge Status */}
            <KnowledgeStatus
                isLoading={knowledgeLoading}
                error={knowledgeError}
                totalFiles={knowledgeStats.totalFiles}
                totalWords={knowledgeStats.totalWords}
            />

            {/* Error Messages */}
            {errorMessage && <div className="bg-red-100 text-red-700 p-2 rounded mb-4">Speech Recognition Error: {errorMessage}</div>}
            {error && <div className="bg-red-100 text-red-700 p-2 rounded mb-4">Chat Error: {error}</div>}

            {/* Role Description Modal */}
            {showRoleModal && <RoleDescriptionModal onSubmit={handleRoleSubmit} />}

            <div className="flex flex-col h-full overflow-hidden p-1 container gap-4">
                <Header status={recognitionStatus} />

                {/* Controls Section */}
                <div className="bg-muted/50 rounded-lg shadow">
                    <div className="grid grid-cols-4 gap-4">
                        <div className="col-span-2">
                            <GoalsInput goals={goals} setGoals={setGoals} />
                        </div>
                        <div className="col-span-2 items-center justify-center">
                            <div className="grid grid-cols-2 gap-4 items-center justify-center">
                                <div className="h-full items-center justify-center">
                                    <TranscriptionControls
                                        onStart={handleStart}
                                        onStop={stop}
                                        onMove={handleMove}
                                        onClear={handleClear}
                                        isRecognitionActive={recognitionStatus === 'active'}
                                    />
                                </div>
                                <div className="h-full items-center justify-center">
                                    <AudioVisualizer canvasRef={canvasRef} />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="flex-1 grid grid-cols-3 gap-4 overflow-hidden">
                    {/* Chat Display */}
                    <section className="relative flex flex-col overflow-hidden p-2 md:p-4 rounded-lg bg-muted/50 h-full col-span-2">
                        <div className="flex justify-end mb-2">
                            <Badge
                                variant="outline"
                                className="inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold text-foreground"
                            >
                                Output {knowledgeStats.totalFiles > 0 && <span className="ml-1 text-green-600">• Optimized</span>}
                            </Badge>
                        </div>

                        <MemoizedChatMessagesBox
                            id="postChat"
                            messages={messages}
                            streamedContent={streamedContent}
                            isStreamingComplete={isStreamingComplete}
                            className="flex-1 overflow-y-auto"
                        />

                        <div className="flex flex-col p-3 md:p-4 border-[1px] border-gray-800 rounded-lg shadow-none max-h-52 overflow-y-auto bg-background">
                            <LiveTranscriptionBox
                                id="preChat"
                                interimTranscriptions={interimTranscriptions}
                                currentInterimTranscript={currentInterimTranscript}
                                className="flex-1"
                            />

                            <Button
                                variant="move"
                                onClick={handleMove}
                                disabled={isLoading || knowledgeLoading}
                                className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-xs font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-blue-500 text-white hover:bg-blue-600 h-8 px-2 py-1 mt-2 gap-1.5 self-end"
                            >
                                <ArrowRight className="mr-1 h-4 w-4" />
                                {knowledgeLoading ? 'Loading...' : isLoading ? 'Thinking...' : 'Move'}
                            </Button>
                        </div>
                    </section>

                    {/* Sidebar */}
                    <section className="col-span-1 flex flex-col gap-4 overflow-hidden">
                        <div className="flex-1 overflow-hidden bg-muted/50 rounded-lg shadow">
                            <div className="h-full bg-transcription-box">
                                <h2 className="text-lg font-semibold text-white bg-gray-800 p-2 rounded-t-lg">Context</h2>
                                <div className="p-4 overflow-y-auto h-[calc(100%-2.5rem)]">
                                    <ConversationSummary summary={conversationSummary} goals={goals} />
                                </div>
                            </div>
                        </div>

                        <div className="flex-1 overflow-hidden bg-muted/50 rounded-lg shadow">
                            <div className="h-full bg-transcription-box">
                                <div className="p-4 overflow-y-auto h-[calc(100%-2.5rem)]">
                                    <ConversationSuggestions
                                        suggestions={conversationSuggestions}
                                        onSuggest={handleSuggest}
                                        isLoading={isLoading}
                                    />
                                </div>
                            </div>
                        </div>
                    </section>
                </div>
            </div>
        </div>
    );
};

export default ChatComponent;
