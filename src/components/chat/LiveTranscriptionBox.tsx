// src/components/chat/LiveTranscriptionBox.tsx
import React, { useEffect, useRef } from "react";
import { cn } from "@/lib/utils";
import { Message } from "@/types/Message";
import { logger } from "@/modules/Logger";

interface LiveTranscriptionBoxProps {
    id?: string;
    interimTranscriptions: Message[];
    currentInterimTranscript: string;
    className?: string;
}

const LiveTranscriptionBox: React.FC<LiveTranscriptionBoxProps> = ({
    id,
    interimTranscriptions,
    currentInterimTranscript,
    className,
}) => {
    const containerRef = useRef<HTMLDivElement>(null);
    const prevTranscriptionCountRef = useRef(interimTranscriptions.length);

    const scrollToBottom = () => {
        try {
            containerRef.current?.scrollIntoView({ behavior: "smooth" });
            logger.debug("📜 Auto-scrolled transcription box to bottom");
        } catch (error) {
            logger.error(
                `❌ Failed to scroll transcription box: ${
                    error instanceof Error ? error.message : "Unknown error"
                }`,
            );
        }
    };

    useEffect(() => {
        try {
            logger.info(
                `🎙️ LiveTranscriptionBox component mounted (id: ${
                    id || "unnamed"
                })`,
            );
            logger.debug(
                `📊 Initial transcription count: ${interimTranscriptions.length}`,
            );
        } catch (error) {
            logger.error(
                `❌ Error during LiveTranscriptionBox mount: ${
                    error instanceof Error ? error.message : "Unknown error"
                }`,
            );
        }

        return () => {
            logger.info(
                `🧹 LiveTranscriptionBox component unmounting (id: ${
                    id || "unnamed"
                })`,
            );
        };
    }, [id, interimTranscriptions.length]);

    useEffect(() => {
        try {
            const currentCount = interimTranscriptions.length;
            const previousCount = prevTranscriptionCountRef.current;

            if (currentCount !== previousCount) {
                logger.debug(
                    `📈 Transcription count changed: ${previousCount} → ${currentCount}`,
                );
                prevTranscriptionCountRef.current = currentCount;
            }

            scrollToBottom();
        } catch (error) {
            logger.error(
                `❌ Error processing transcription changes: ${
                    error instanceof Error ? error.message : "Unknown error"
                }`,
            );
        }
    }, [
        interimTranscriptions,
        currentInterimTranscript,
        interimTranscriptions.length,
    ]);

    useEffect(() => {
        if (currentInterimTranscript) {
            logger.debug(
                `🎤 Live transcript update: "${currentInterimTranscript.substring(
                    0,
                    50,
                )}${currentInterimTranscript.length > 50 ? "..." : ""}"`,
            );
        }
    }, [currentInterimTranscript]);

    try {
        return (
            <div
                id={id}
                className={cn(
                    "relative flex flex-col h-full rounded-lg overflow-hidden",
                    className,
                )}
            >
                <div ref={containerRef} className="flex-1 overflow-y-auto p-4">
                    {interimTranscriptions.map((message, index) => {
                        try {
                            return (
                                <div
                                    key={index}
                                    className={`message ${message.type} text-foreground p-2 rounded-lg mb-2 break-words`}
                                >
                                    <span>{message.content}</span>
                                </div>
                            );
                        } catch (error) {
                            logger.error(
                                `❌ Error rendering transcription ${index}: ${
                                    error instanceof Error
                                        ? error.message
                                        : "Unknown error"
                                }`,
                            );
                            return (
                                <div
                                    key={index}
                                    className="message error bg-red-100 text-red-800 p-2 rounded-lg mb-2"
                                >
                                    Error displaying transcription
                                </div>
                            );
                        }
                    })}
                    {currentInterimTranscript && (
                        <div
                            className={`message interim text-foreground p-2 rounded-lg mb-2 break-words`}
                        >
                            <span>{currentInterimTranscript}</span>
                        </div>
                    )}
                </div>
            </div>
        );
    } catch (error) {
        logger.error(
            `❌ Critical error rendering LiveTranscriptionBox: ${
                error instanceof Error ? error.message : "Unknown error"
            }`,
        );
        return (
            <div
                className={cn(
                    "relative flex flex-col h-full rounded-lg overflow-hidden bg-red-50",
                    className,
                )}
            >
                <div className="flex-1 flex items-center justify-center p-4">
                    <div className="text-red-600 text-center">
                        <p className="font-semibold">Transcription error</p>
                        <p className="text-sm">
                            Unable to display live transcription
                        </p>
                    </div>
                </div>
            </div>
        );
    }
};

export default LiveTranscriptionBox;
