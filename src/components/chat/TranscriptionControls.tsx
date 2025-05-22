// src/components/chat/TranscriptionControls.tsx
import React, { useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Mic, Square, Trash } from "lucide-react";
import { logger } from "@/modules/Logger";

interface TranscriptionControlsProps {
    onStart: () => void;
    onStop: () => void;
    onMove: () => void;
    onClear: () => void;
    isRecognitionActive: boolean;
}

const TranscriptionControls: React.FC<TranscriptionControlsProps> = ({
    onStart,
    onStop,
    onClear,
    isRecognitionActive,
}) => {
    const prevIsRecognitionActive = useRef(isRecognitionActive);
    const mountedRef = useRef(false);

    useEffect(() => {
        if (!mountedRef.current) {
            try {
                logger.info("🎛️ TranscriptionControls component mounted");
                logger.debug(
                    `📊 Initial recognition state: ${
                        isRecognitionActive ? "active" : "inactive"
                    }`,
                );
                mountedRef.current = true;
            } catch (error) {
                logger.error(
                    `❌ Error during TranscriptionControls mount: ${
                        error instanceof Error ? error.message : "Unknown error"
                    }`,
                );
            }
        }

        return () => {
            logger.info("🧹 TranscriptionControls component unmounting");
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []); // Only on mount/unmount

    useEffect(() => {
        try {
            // Only log if recognition state actually changed
            if (prevIsRecognitionActive.current !== isRecognitionActive) {
                logger.debug(
                    `🔄 Recognition state changed: ${
                        prevIsRecognitionActive.current ? "active" : "inactive"
                    } → ${isRecognitionActive ? "active" : "inactive"}`,
                );
                prevIsRecognitionActive.current = isRecognitionActive;
            }
        } catch (error) {
            logger.error(
                `❌ Error logging recognition state change: ${
                    error instanceof Error ? error.message : "Unknown error"
                }`,
            );
        }
    }, [isRecognitionActive]);

    const handleStart = () => {
        try {
            logger.info("🎙️ User clicked Start button");
            onStart();
        } catch (error) {
            logger.error(
                `❌ Error handling start click: ${
                    error instanceof Error ? error.message : "Unknown error"
                }`,
            );
        }
    };

    const handleStop = () => {
        try {
            logger.info("⏹️ User clicked Stop button");
            onStop();
        } catch (error) {
            logger.error(
                `❌ Error handling stop click: ${
                    error instanceof Error ? error.message : "Unknown error"
                }`,
            );
        }
    };

    const handleClear = () => {
        try {
            logger.info("🗑️ User clicked Clear button");
            onClear();
        } catch (error) {
            logger.error(
                `❌ Error handling clear click: ${
                    error instanceof Error ? error.message : "Unknown error"
                }`,
            );
        }
    };

    try {
        return (
            <div className="flex justify-center">
                <div className="flex space-x-4">
                    <Button
                        variant="start"
                        onClick={handleStart}
                        disabled={isRecognitionActive}
                        aria-label="Start speech recognition"
                    >
                        <Mic className="mr-1 h-4 w-4" />
                        Start
                    </Button>
                    <Button
                        variant="stop"
                        onClick={handleStop}
                        disabled={!isRecognitionActive}
                        aria-label="Stop speech recognition"
                    >
                        <Square className="mr-1 h-4 w-4" />
                        Stop
                    </Button>
                    <Button
                        variant="clear"
                        onClick={handleClear}
                        aria-label="Clear transcriptions"
                    >
                        <Trash className="mr-1 h-4 w-4" />
                        Clear
                    </Button>
                </div>
            </div>
        );
    } catch (error) {
        logger.error(
            `❌ Critical error rendering TranscriptionControls: ${
                error instanceof Error ? error.message : "Unknown error"
            }`,
        );
        return (
            <div className="flex justify-center">
                <div className="text-red-600 text-center">
                    <p className="font-semibold">Controls error</p>
                    <p className="text-sm">
                        Unable to display transcription controls
                    </p>
                </div>
            </div>
        );
    }
};

export default React.memo(TranscriptionControls); // Add memoization
