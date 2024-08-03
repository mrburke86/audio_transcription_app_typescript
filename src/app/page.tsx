// src/app/page.tsx
"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import Header from "@/components/Header";
import TranscriptionControls from "@/components/TranscriptionControls";
import { useLLMProvider } from "@/hooks/useLLMProvider";
import { logger, LogEntry } from "@/modules/Logger";
import { formatTimestamp } from "@/utils/helpers";
import {
    MemoizedLogBox,
    MemoizedTranscriptionBox,
} from "@/components/MemoizedComponents";
import { useSpeechRecognition } from "@/hooks/useSpeechRecognition";

interface Message {
    content: string;
    type: "user" | "assistant" | "interim";
    timestamp: string;
}

const SectionHeader: React.FC<{ title: string }> = ({ title }) => (
    <h2 className="text-lg font-semibold text-white bg-gray-800 p-2 rounded-t-lg">
        {title}
    </h2>
);

const AudioVisualizer: React.FC<{
    canvasRef: React.RefObject<HTMLCanvasElement>;
}> = ({ canvasRef }) => (
    <canvas
        ref={canvasRef}
        id="audioVisualizer"
        width="120"
        height="30"
        className="bg-gray-700 rounded"
    />
);

const useTranscriptions = (
    generateResponse: (message: string) => Promise<void>,
    streamedContent: string,
    isStreamingComplete: boolean, // Add a flag to know when streaming is done
) => {
    const [liveTranscription, setLiveTranscription] = useState<Message[]>([]);
    const [savedTranscription, setSavedTranscription] = useState<Message[]>([]);

    const handleMove = useCallback(async () => {
        if (liveTranscription.length > 0) {
            const userMessage = liveTranscription
                .filter((msg) => msg.type === "user")
                .map((msg) => msg.content)
                .join(" ");

            setSavedTranscription((prev) => [
                ...prev,
                {
                    content: userMessage,
                    type: "user",
                    timestamp: formatTimestamp(new Date()),
                },
            ]);

            try {
                await generateResponse(userMessage);
                // Remove direct appending here. We'll handle updates in the `useEffect`
            } catch (error) {
                logger.error(
                    `Error generating response: ${(error as Error).message}`,
                );
            }

            setLiveTranscription([]);
        }
    }, [liveTranscription, generateResponse]);

    const handleClear = useCallback(() => {
        setLiveTranscription([]);
        setSavedTranscription([]);
        logger.clearLogs();
    }, []);

    // New useEffect to update the saved transcription when streaming is complete
    useEffect(() => {
        if (isStreamingComplete && streamedContent.trim()) {
            setSavedTranscription((prev) => [
                ...prev,
                {
                    content: streamedContent,
                    type: "assistant",
                    timestamp: formatTimestamp(new Date()),
                },
            ]);
        }
    }, [isStreamingComplete, streamedContent]); // Only trigger when streaming is done

    return {
        liveTranscription,
        setLiveTranscription,
        savedTranscription,
        setSavedTranscription,
        handleMove,
        handleClear,
    };
};

export default function Home() {
    const [recognitionStatus, setRecognitionStatus] = useState<
        "inactive" | "active" | "error"
    >("inactive");
    const [logs, setLogs] = useState<LogEntry[]>([]);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const visualizationStartedRef = useRef(false);

    const apiKey = process.env.NEXT_PUBLIC_OPENAI_API_KEY;
    const {
        generateResponse,
        isLoading,
        error,
        streamedContent,
        isStreamingComplete,
    } = useLLMProvider(apiKey || "");

    const {
        liveTranscription,
        setLiveTranscription,
        savedTranscription,
        setSavedTranscription,
        handleMove,
        handleClear,
    } = useTranscriptions(
        generateResponse,
        streamedContent,
        isStreamingComplete,
    );

    const handleRecognitionStart = useCallback(() => {
        setRecognitionStatus("active");
    }, []);

    const handleRecognitionEnd = useCallback(() => {
        setRecognitionStatus("inactive");
    }, []);

    const handleRecognitionError = useCallback(
        (event: SpeechRecognitionErrorEvent) => {
            setRecognitionStatus("error");
            logger.error(`Speech recognition error: ${event.error}`);
        },
        [],
    );

    const handleRecognitionResult = useCallback(
        (finalTranscript: string, interimTranscript: string) => {
            setLiveTranscription((prev) => {
                const newTranscription = [...prev];
                if (finalTranscript) {
                    newTranscription.push({
                        content: finalTranscript,
                        type: "user",
                        timestamp: formatTimestamp(new Date()),
                    });
                }
                if (interimTranscript) {
                    const lastMessage =
                        newTranscription[newTranscription.length - 1];
                    if (lastMessage && lastMessage.type === "interim") {
                        lastMessage.content = interimTranscript;
                    } else {
                        newTranscription.push({
                            content: interimTranscript,
                            type: "interim",
                            timestamp: formatTimestamp(new Date()),
                        });
                    }
                }
                return newTranscription;
            });
        },
        [],
    );

    const { start, stop, startAudioVisualization } = useSpeechRecognition({
        onStart: handleRecognitionStart,
        onEnd: handleRecognitionEnd,
        onError: handleRecognitionError,
        onResult: handleRecognitionResult,
    });

    const handleStart = useCallback(() => {
        start().then(() => {
            if (canvasRef.current && !visualizationStartedRef.current) {
                startAudioVisualization(canvasRef.current);
                visualizationStartedRef.current = true;
            }
        });
    }, [start, startAudioVisualization]);

    useEffect(() => {
        if (!apiKey) {
            logger.error("OpenAI API key is missing");
        }
        setLogs(logger.getLogs());
    }, [
        apiKey,
        recognitionStatus,
        liveTranscription,
        savedTranscription,
        isLoading,
        error,
    ]);

    return (
        <div className="flex flex-col h-screen w-screen overflow-hidden">
            <Header status={recognitionStatus} />
            <TranscriptionControls
                onStart={handleStart}
                onStop={stop}
                onMove={handleMove}
                onClear={handleClear}
                isRecognitionActive={recognitionStatus === "active"}
            />

            <main className="flex-1 grid grid-cols-3 gap-4 p-4 overflow-hidden">
                {/* 1st Column */}
                <section className="col-span-2 flex flex-col overflow-hidden">
                    <MemoizedTranscriptionBox
                        id="postChat"
                        title="Saved Transcription"
                        messages={savedTranscription}
                        variant="saved"
                        streamedContent={streamedContent}
                    />
                </section>
                {/* 2nd Column */}
                <section className="col-span-1 flex flex-col gap-4 overflow-hidden">
                    {/* Audio Visualizer */}
                    <div className="bg-transcription-box rounded-lg shadow">
                        {/* <SectionHeader title="Audio Visualizer" /> */}
                        <div className="p-1">
                            <AudioVisualizer canvasRef={canvasRef} />
                        </div>
                    </div>
                    {/* Live Transcription */}
                    <div className="flex-1 overflow-hidden">
                        <MemoizedTranscriptionBox
                            id="preChat"
                            title="Live Transcription"
                            messages={liveTranscription}
                            variant="live"
                        />
                    </div>
                    {/* Placeholder */}
                    <div className="flex-1 overflow-hidden">
                        <div className="h-full bg-transcription-box rounded-lg shadow">
                            <SectionHeader title="Placeholder" />
                            <div className="p-4 overflow-y-auto h-[calc(100%-2.5rem)]">
                                {/* Placeholder content */}
                            </div>
                        </div>
                    </div>
                    {/* Activity Logs */}
                    <div className="flex-1 overflow-hidden">
                        <div className="h-full bg-transcription-box rounded-lg shadow">
                            <SectionHeader title="Activity Logs" />
                            <div className="p-4 overflow-y-auto h-[calc(100%-2.5rem)]">
                                <MemoizedLogBox logs={logs} />
                            </div>
                        </div>
                    </div>
                </section>
            </main>
        </div>
    );
}
