// src/components/chat/ChatComponent.tsx
"use client";

import Header from "@/components/Header";
import ConversationSummary from "@/components/chat/ConversationSummary";
import GoalsInput from "@/components/chat/GoalsInput";
import { MemoizedChatMessagesBox } from "@/components/chat/MemoizedComponents";
import TranscriptionControls from "@/components/chat/TranscriptionControls";
import { useSpeechRecognition, useTranscriptions } from "@/hooks";
// Import the optimized LLM provider instead of the old one
import useLLMProviderOptimized from "@/hooks/useLLMProviderOptimized";
import { useKnowledge } from "@/contexts/KnowledgeProvider";
import { logger } from "@/modules/Logger";
import { Badge, Button } from "@/components/ui";
import { ArrowRight, AlertTriangle, CheckCircle } from "lucide-react";
import React, { useCallback, useEffect, useRef, useState } from "react";
import { Message } from "../../types/Message";
import AudioVisualizer from "./AudioVisualizer";
import ConversationSuggestions from "./ConversationSuggestions";
import LiveTranscriptionBox from "./LiveTranscriptionBox";
import RoleDescriptionModal from "./RoleDescriptionModal";
import { CustomSpeechError } from "@/hooks/useSpeechRecognition";

interface ChatComponentProps {
    assistantId: string; // Keep for backward compatibility, but won't be used
    roleDescription: string;
}

const SectionHeader: React.FC<{ title: string }> = ({ title }) => (
    <h2 className="text-lg font-semibold text-white bg-gray-800 p-2 rounded-t-lg">
        {title}
    </h2>
);

// Knowledge Loading Component
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
                <span className="text-blue-700 text-sm">
                    Loading knowledge base...
                </span>
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
                    ✅ Knowledge Base: {totalFiles} files,{" "}
                    {totalWords.toLocaleString()} words loaded
                </span>
            </div>
        );
    }

    return null;
};

const ChatComponent: React.FC<ChatComponentProps> = ({
    assistantId, // Keep for backward compatibility
    roleDescription,
}) => {
    // Knowledge context for the optimized system
    const {
        isLoading: knowledgeLoading,
        error: knowledgeError,
        getTotalStats,
    } = useKnowledge();

    // Unified Conversation History (from userMessages)
    const [conversationHistory, setConversationHistory] = useState<Message[]>(
        [],
    );

    // Goals/Milestones State
    const [goals, setGoals] = useState<string[]>([]);

    const [recognitionStatus, setRecognitionStatus] = useState<
        "inactive" | "active" | "error"
    >("inactive");
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const visualizationStartedRef = useRef(false);

    const [roleDescriptionState, setRoleDescriptionState] =
        useState<string>(roleDescription);
    const [showRoleModal, setShowRoleModal] = useState<boolean>(false);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);

    // Memoize getUserFriendlyError with useCallback
    const getUserFriendlyError = useCallback((errorCode: string): string => {
        switch (errorCode) {
            case "network":
                return "Network error. Please check your internet connection.";
            case "not-allowed":
                return "Microphone access denied. Please allow microphone access in your browser settings.";
            case "service-not-allowed":
                return "Speech recognition service not allowed. Please check your browser settings.";
            case "no-speech":
                return "No speech detected. Please try speaking again.";
            case "audio-capture":
                return "Audio capture failed. Please check your microphone.";
            case "aborted":
                return "Speech recognition was aborted.";
            case "language-not-supported":
                return "Language not supported. Please try a different language.";
            case "bad-grammar":
                return "Grammar configuration issue. Please contact support.";
            default:
                return "An unexpected error occurred with speech recognition.";
        }
    }, []);

    // Show modal on mount if roleDescription is empty
    useEffect(() => {
        if (!roleDescriptionState || roleDescriptionState.trim() === "") {
            setShowRoleModal(true);
        }
    }, [roleDescriptionState]);

    const apiKey = process.env.NEXT_PUBLIC_OPENAI_API_KEY;

    // Use the optimized LLM provider instead of the old one
    // Note: assistantId is no longer needed for Chat Completions API
    const {
        generateResponse,
        generateSuggestions,
        isLoading,
        error,
        streamedContent,
        isStreamingComplete,
        conversationSummary,
        conversationSuggestions,
    } = useLLMProviderOptimized(
        apiKey || "",
        // assistantId, // Removed - no longer needed for Chat Completions API
        roleDescriptionState,
        conversationHistory,
        goals,
    );

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
            logger.error("🔑❌ OpenAI API key is missing");
        }
    }, [apiKey, recognitionStatus, userMessages, isLoading, error]);

    // Initialize chat on mount with optimized system logging
    useEffect(() => {
        logger.info(`🚀 Initializing optimized chat (Chat Completions API)`);
        logger.info(`📝 Role description: ${roleDescription}`);
        logger.info(
            `🗂️ Assistant ID (legacy): ${assistantId} [Not used in optimized system]`,
        );

        return () => {
            logger.info(`🧹 Cleaning up optimized chat`);
        };
    }, [assistantId, roleDescription]);

    // Handle speech recognition start
    const handleRecognitionStart = useCallback(() => {
        logger.info("🎙️✅ Speech recognition started");
        setRecognitionStatus("active");
        setErrorMessage(null);
    }, []);

    // Handle speech recognition end
    const handleRecognitionEnd = useCallback(() => {
        logger.info("🎙️⏹️ Speech recognition ended");
        setRecognitionStatus("inactive");
    }, []);

    // Handle speech recognition error
    const handleRecognitionError = useCallback(
        (error: SpeechRecognitionErrorEvent | CustomSpeechError) => {
            let errorCode: string;
            let errorMessage: string;

            if ("error" in error) {
                errorCode = error.error;
                errorMessage = getUserFriendlyError(error.error);
            } else {
                errorCode = error.code;
                errorMessage = error.message;
            }

            logger.error(`🎙️❌ Speech recognition error: ${errorCode}`);
            setRecognitionStatus("error");
            setErrorMessage(errorMessage);
        },
        [getUserFriendlyError, setRecognitionStatus, setErrorMessage],
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
        logger.info("🎙️ Starting speech recognition");
        start()
            .then(() => {
                if (canvasRef.current && !visualizationStartedRef.current) {
                    logger.info("🎨 Starting audio visualization");
                    startAudioVisualization(canvasRef.current);
                    visualizationStartedRef.current = true;
                } else if (!canvasRef.current) {
                    logger.warning(
                        "⚠️ Canvas reference is null, can't start visualization",
                    );
                }
            })
            .catch((error) => {
                logger.error(
                    `🎙️❌ Failed to start speech recognition: ${error.message}`,
                );
            });
    }, [start, startAudioVisualization]);

    // Handle suggestion generation
    const handleSuggest = useCallback(async () => {
        try {
            await generateSuggestions();
        } catch (error) {
            logger.error(
                `Error generating suggestions: ${(error as Error).message}`,
            );
        }
    }, [generateSuggestions]);

    // Get knowledge stats for display
    const knowledgeStats = getTotalStats();

    // Show full-screen loading if knowledge is still loading
    if (knowledgeLoading) {
        return (
            <div className="flex flex-col items-center justify-center h-full p-8">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-6"></div>
                    <h2 className="text-xl font-semibold text-gray-700 mb-2">
                        Loading Knowledge Base
                    </h2>
                    <p className="text-gray-600">
                        Initializing ETQ product knowledge...
                    </p>
                    <p className="text-sm text-gray-500 mt-2">
                        This may take a moment on first load
                    </p>
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
                    <h2 className="text-xl font-semibold text-red-700 mb-2">
                        Knowledge Base Load Failed
                    </h2>
                    <p className="text-red-600 mb-4">{knowledgeError}</p>
                    <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-left">
                        <h3 className="font-semibold text-red-800 mb-2">
                            Troubleshooting:
                        </h3>
                        <ul className="text-sm text-red-700 space-y-1">
                            <li>
                                • Ensure ETQ markdown files are in{" "}
                                <code>public/knowledge/</code>
                            </li>
                            <li>
                                • Check that all 25 files are present and
                                accessible
                            </li>
                            <li>
                                • Verify file permissions and server
                                configuration
                            </li>
                        </ul>
                    </div>
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
            {/* Knowledge Status Indicator */}
            <KnowledgeStatus
                isLoading={knowledgeLoading}
                error={knowledgeError}
                totalFiles={knowledgeStats.totalFiles}
                totalWords={knowledgeStats.totalWords}
            />

            {/* Error Messages */}
            {errorMessage && (
                <div className="bg-red-100 text-red-700 p-2 rounded mb-4">
                    Speech Recognition Error: {errorMessage}
                </div>
            )}
            {error && (
                <div className="bg-red-100 text-red-700 p-2 rounded mb-4">
                    Chat Error: {error}
                </div>
            )}

            {/* Role Description Modal */}
            {showRoleModal && (
                <RoleDescriptionModal
                    onSubmit={(newRoleDescription) => {
                        setRoleDescriptionState(newRoleDescription);
                        setShowRoleModal(false);
                    }}
                />
            )}

            <div className="flex flex-col h-full overflow-hidden p-1 container gap-4">
                <Header status={recognitionStatus} />

                {/* Controls, Visualizer and Goals Input */}
                <div className="bg-muted/50 rounded-lg shadow">
                    <div className="grid grid-cols-4 gap-4">
                        {/* Goals/Milestones Input */}
                        <div className="col-span-2">
                            <GoalsInput goals={goals} setGoals={setGoals} />
                        </div>

                        {/* Controls, Visualizer and Goals Input */}
                        <div className="col-span-2 items-center justify-center">
                            <div className="grid grid-cols-2 gap-4 items-center justify-center">
                                <div className="h-full items-center justify-center">
                                    <TranscriptionControls
                                        onStart={handleStart}
                                        onStop={stop}
                                        onMove={handleMove}
                                        onClear={handleClear}
                                        isRecognitionActive={
                                            recognitionStatus === "active"
                                        }
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
                    {/* 1st Column - Chat Display */}
                    <section
                        id="chat-display"
                        className="relative flex flex-col overflow-hidden p-2 md:p-4 rounded-lg bg-muted/50 h-full col-span-2"
                    >
                        {/* Output Badge */}
                        <div className="flex justify-end mb-2">
                            <Badge
                                variant="outline"
                                className="inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold text-foreground"
                            >
                                Output{" "}
                                {knowledgeStats.totalFiles > 0 && (
                                    <span className="ml-1 text-green-600">
                                        • Optimized
                                    </span>
                                )}
                            </Badge>
                        </div>

                        {/* Chat Output */}
                        <MemoizedChatMessagesBox
                            id="postChat"
                            messages={userMessages}
                            streamedContent={streamedContent}
                            isStreamingComplete={isStreamingComplete}
                            className="flex-1 overflow-y-auto"
                        />

                        {/* Chat Input */}
                        <div
                            id="chat-input"
                            className="flex flex-col p-3 md:p-4 border-[1px] border-gray-800 rounded-lg shadow-none max-h-52 overflow-y-auto bg-background"
                        >
                            <LiveTranscriptionBox
                                id="preChat"
                                interimTranscriptions={interimTranscriptions}
                                currentInterimTranscript={
                                    currentInterimTranscript
                                }
                                className="flex-1"
                            />

                            {/* Move Button */}
                            <Button
                                variant="move"
                                onClick={handleMove}
                                disabled={isLoading || knowledgeLoading}
                                className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-xs font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-blue-500 text-white hover:bg-blue-600 h-8 px-2 py-1 mt-2 gap-1.5 self-end"
                            >
                                <ArrowRight className="mr-1 h-4 w-4" />
                                {knowledgeLoading
                                    ? "Loading..."
                                    : isLoading
                                    ? "Thinking..."
                                    : "Move"}
                            </Button>
                        </div>
                    </section>

                    {/* 2nd Column */}
                    <section className="col-span-1 flex flex-col gap-4 overflow-hidden">
                        {/* Context */}
                        <div className="flex-1 overflow-hidden bg-muted/50 rounded-lg shadow">
                            <div className="h-full bg-transcription-box">
                                <SectionHeader title="Context" />
                                <div className="p-4 overflow-y-auto h-[calc(100%-2.5rem)]">
                                    <ConversationSummary
                                        summary={conversationSummary}
                                        goals={goals}
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Suggestions */}
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

            {/* Development Debug Info */}
            {process.env.NODE_ENV === "development" && (
                <div className="mt-2 p-2 bg-gray-100 rounded text-xs text-gray-600">
                    <details>
                        <summary className="cursor-pointer font-medium">
                            🚀 Optimized System Debug Info
                        </summary>
                        <div className="mt-1 space-y-1 text-xs">
                            <div>System: Chat Completions API (Optimized)</div>
                            <div>
                                Knowledge Files: {knowledgeStats.totalFiles}
                            </div>
                            <div>
                                Total Words:{" "}
                                {knowledgeStats.totalWords.toLocaleString()}
                            </div>
                            <div>
                                Memory Usage: ~
                                {Math.round(knowledgeStats.totalSize / 1024)}KB
                            </div>
                            <div>Goals: {goals.join(", ") || "None"}</div>
                            <div>
                                Legacy Assistant ID: {assistantId} (unused)
                            </div>
                        </div>
                    </details>
                </div>
            )}
        </div>
    );
};

export default ChatComponent;
