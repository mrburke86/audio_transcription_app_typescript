// src/hooks/useSpeechRecognition.ts

import { useSpeechRecognitionCore } from './useSpeechRecognitionCore';
import { useSpeechErrorHandler } from './useSpeechErrorHandler';
import { useAudioVisualization } from './useAudioVisualization';
import { CustomSpeechError } from './useSpeechErrorHandler'; // Import CustomSpeechError

interface SpeechRecognitionProps {
    onStart: () => void;
    onEnd: () => void;
    onError: (error: CustomSpeechError) => void;
    onResult: (finalTranscript: string, interimTranscript: string) => void;
}

export const useSpeechRecognition = (props: SpeechRecognitionProps) => {
    const { onStart, onEnd, onError, onResult } = props;

    // Error handling
    const {
        handleError,
        cleanup: cleanupErrorHandler,
        resetRetries,
    } = useSpeechErrorHandler(onError, () => {
        // Retry callback
        start();
    });

    // Core speech recognition
    const { start: coreStart, stop: coreStop } = useSpeechRecognitionCore({
        onStart: () => {
            resetRetries();
            onStart();
        },
        onEnd,
        onError: handleError,
        onResult,
    });

    // Audio visualization
    const { startVisualization, stopVisualization } = useAudioVisualization(onError);

    const start = async () => {
        await coreStart();
    };

    const stop = () => {
        coreStop();
        stopVisualization();
        cleanupErrorHandler();
    };

    return {
        start,
        stop,
        startAudioVisualization: startVisualization,
    };
};
