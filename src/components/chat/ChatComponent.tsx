// src/components/chat/ChatComponent.tsx
"use client";

import Header from "@/components/Header";
import ConversationSummary from "@/components/chat/ConversationSummary";
import GoalsInput from "@/components/chat/GoalsInput";
import { MemoizedChatMessagesBox } from "@/components/chat/MemoizedComponents";
import TranscriptionControls from "@/components/chat/TranscriptionControls";
import {
    useLLMProvider,
    useSpeechRecognition,
    useTranscriptions,
} from "@/hooks";
import { logger } from "@/modules/Logger";
// import { formatTimestamp } from "@/utils/helpers";
import { Badge, Button } from "@/components/ui";
// import { listAudioInputDevices } from "@/utils/list-audio-input-devices";
import { ArrowRight } from "lucide-react";
import React, { useCallback, useEffect, useRef, useState } from "react";
import { Message } from "../../types/Message"; // Import the Message interface
import AudioVisualizer from "./AudioVisualizer";
import ConversationSuggestions from "./ConversationSuggestions"; // Import new component
import LiveTranscriptionBox from "./LiveTranscriptionBox";
import RoleDescriptionModal from "./RoleDescriptionModal";
import { CustomSpeechError } from "@/hooks/useSpeechRecognition";

interface ChatComponentProps {
    assistantId: string;
    roleDescription: string;
}

const SectionHeader: React.FC<{ title: string }> = ({ title }) => (
    <h2 className="text-lg font-semibold text-white bg-gray-800 p-2 rounded-t-lg">
        {title}
    </h2>
);

const ChatComponent: React.FC<ChatComponentProps> = ({
    assistantId,
    roleDescription,
}) => {
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
    }, []); // Empty dependency array since it doesn’t depend on any state/props

    // Show modal on mount if roleDescription is empty
    useEffect(() => {
        if (!roleDescriptionState || roleDescriptionState.trim() === "") {
            setShowRoleModal(true);
        }
    }, [roleDescriptionState]);

    const apiKey = process.env.NEXT_PUBLIC_OPENAI_API_KEY;
    const {
        generateResponse,
        generateSuggestions, // Destructure generateSuggestions
        isLoading,
        error,
        streamedContent,
        isStreamingComplete,
        conversationSummary,
        conversationSuggestions, // Destructure suggestions
    } = useLLMProvider(
        apiKey || "",
        assistantId,
        roleDescriptionState,
        conversationHistory,
        goals,
    );

    const {
        interimTranscriptions,
        currentInterimTranscript,
        userMessages,
        // setUserMessages,
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
        // Removed logs subscription since logs state is unused
    }, [apiKey, recognitionStatus, userMessages, isLoading, error]);

    // Initialize chat on mount
    useEffect(() => {
        logger.info(`🤖 Initializing chat for assistant ${assistantId}`);
        logger.info(`📝 Role description: ${roleDescription}`);

        return () => {
            logger.info(`🧹 Cleaning up chat for assistant ${assistantId}`);
        };
    }, [assistantId, roleDescription]);

    // Handle speech recognition start
    const handleRecognitionStart = useCallback(() => {
        logger.info("🎙️✅ Speech recognition started");
        setRecognitionStatus("active");
        setErrorMessage(null); // Clear error message
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
                // Handle SpeechRecognitionErrorEvent
                errorCode = error.error;
                errorMessage = getUserFriendlyError(error.error);
            } else {
                // Handle CustomSpeechError
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

    return (
        <div className="flex flex-col h-full overflow-hidden p-1 container gap-4 ">
            {errorMessage && (
                <div className="bg-red-100 text-red-700 p-2 rounded mb-4">
                    Speech Recognition Error: {errorMessage}
                </div>
            )}
            {error && (
                <div className="bg-red-100 text-red-700 p-2 rounded mb-4">
                    Chat Error: {error}
                </div>
            )}{" "}
            {showRoleModal && (
                <RoleDescriptionModal
                    onSubmit={(newRoleDescription) => {
                        setRoleDescriptionState(newRoleDescription);
                        setShowRoleModal(false);
                    }}
                />
            )}
            <div className="flex flex-col h-full overflow-hidden p-1 container gap-4 ">
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
                                Output
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
                                className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-xs font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-blue-500 text-white hover:bg-blue-600 h-8 px-2 py-1 mt-2 gap-1.5 self-end"
                            >
                                <ArrowRight className="mr-1 h-4 w-4" />
                                Move
                            </Button>
                        </div>
                    </section>
                    {/* 2nd Column */}
                    <section className="col-span-1 flex flex-col gap-4 overflow-hidden">
                        {/* Context */}
                        <div className="flex-1 overflow-hidden bg-muted/50 rounded-lg shadow">
                            <div className="h-full bg-transcription-box ">
                                <SectionHeader title="Context" />
                                <div className="p-4 overflow-y-auto h-[calc(100%-2.5rem)]">
                                    <ConversationSummary
                                        summary={conversationSummary}
                                        goals={goals}
                                    />
                                </div>
                            </div>
                        </div>
                        {/* Activity Logs */}
                        <div className="flex-1 overflow-hidden bg-muted/50 rounded-lg shadow">
                            <div className="h-full bg-transcription-box ">
                                {/* <div className="flex items-center justify-between bg-gray-800 p-2 rounded-t-lg">
                                    <h2 className="flex text-lg items-center font-semibold text-white">
                                        Suggestions
                                    </h2>
                                    <Button
                                        variant="outline"
                                        onClick={handleSuggest}
                                        disabled={isLoading}
                                        className="flex items-center justify-center"
                                    >
                                        <Sparkles className="mr-2 h-4 w-4" />
                                        {isLoading
                                            ? "Generating..."
                                            : "Suggest"}
                                    </Button>
                                </div> */}

                                {/* <SectionHeader title="Suggestions" /> */}
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
