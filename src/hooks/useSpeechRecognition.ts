// src/hooks/useSpeechRecognition.ts
"use client";
import { useCallback, useRef } from 'react';
import { logger } from '@/modules/Logger';

// Define custom error type for non-standard errors
export interface CustomSpeechError {
    code: SpeechRecognitionErrorCode; // e.g., "browser-not-supported", "init-failed"
    message: string;
}

// Define the hook's return type
interface SpeechRecognitionHook {
    start: () => Promise<void>;
    stop: () => void;
    startAudioVisualization: (canvas: HTMLCanvasElement) => void;
}
// Define props with extended error handling
interface SpeechRecognitionProps {
    onStart: () => void;
    onEnd: () => void;
    onError: (error: SpeechRecognitionErrorEvent | CustomSpeechError) => void;
    onResult: (finalTranscript: string, interimTranscript: string) => void;
}

export const useSpeechRecognition = ({ onStart, onEnd, onError, onResult }: SpeechRecognitionProps): SpeechRecognitionHook => {
    const recognition = useRef<SpeechRecognition | null>(null);
    const audioContext = useRef<AudioContext | null>(null);
    const analyser = useRef<AnalyserNode | null>(null);
    const microphone = useRef<MediaStreamAudioSourceNode | null>(null);
    const animationFrameId = useRef<number | null>(null);
    const mediaStream = useRef<MediaStream | null>(null);
    const shouldRestart = useRef(false);
    const isRestartingRef = useRef(false); // New ref to track if we're in the process of restarting

    // const { addEntry } = usePerformance();

    const start = useCallback(async () => {
        shouldRestart.current = true; // Enable automatic restarting

        if (!recognition.current) {
            recognition.current = new (window.SpeechRecognition || window.webkitSpeechRecognition)();
            recognition.current.continuous = true;
            recognition.current.interimResults = true;

            // onstart - start the recognition
            recognition.current.onstart = () => {
                onStart();
                isRestartingRef.current = false; // Clear the restarting flag when successfully started
            };

            // onend - restart the recognition with a delay
            recognition.current.onend = () => {
                onEnd();
                if (shouldRestart.current && !isRestartingRef.current) {
                    isRestartingRef.current = true; // Set the restarting flag
                    // Add a delay before restarting
                    setTimeout(() => {
                        try {
                            recognition.current?.start();
                        } catch (error) {
                            isRestartingRef.current = false; // Clear the flag if failed
                            logger.error(`Failed to restart speech recognition after end: ${(error as Error).message}`);
                        }
                    }, 500); // 500ms delay
                }
            };

            // onerror - handle errors with a delayed restart approach
            recognition.current.onerror = (event: SpeechRecognitionErrorEvent) => {
                onError(event);

                if (shouldRestart.current && !isRestartingRef.current) {
                    isRestartingRef.current = true; // Set the restarting flag

                    // For network errors, use a longer delay
                    const delay = event.error === 'network' ? 2000 : 1000;

                    // Attempt to stop recognition first (ignore errors if already stopped)
                    try {
                        recognition.current?.stop();
                    } catch (stopError) {
                        // Just log the error but continue with restart
                        logger.debug(`Error while stopping recognition for restart: ${(stopError as Error).message}`);
                    }

                    // Attempt to restart after delay
                    setTimeout(() => {
                        try {
                            recognition.current?.start();
                        } catch (error) {
                            isRestartingRef.current = false; // Clear the flag if failed
                            logger.error(`Failed to restart speech recognition after error: ${(error as Error).message}`);
                        }
                    }, delay);
                }
            };

            // onresult - process the result
            recognition.current.onresult = (event: SpeechRecognitionEvent) => {
                let interimTranscript = '';
                let finalTranscript = '';

                for (let i = event.resultIndex; i < event.results.length; ++i) {
                    if (event.results[i].isFinal) {
                        finalTranscript += event.results[i][0].transcript;
                    } else {
                        interimTranscript += event.results[i][0].transcript;
                    }
                }

                onResult(finalTranscript, interimTranscript);
            };
        }

        // Ensure we're not trying to start while already starting
        if (!isRestartingRef.current) {
            isRestartingRef.current = true; // Indicate we're starting

            // Give a small delay before the initial start
            // This helps ensure any previous sessions are fully cleaned up
            setTimeout(() => {
                try {
                    recognition.current?.start();
                } catch (error) {
                    isRestartingRef.current = false;
                    logger.error(`Failed to start speech recognition: ${(error as Error).message}`);
                }
            }, 100);
        }
    }, [onStart, onEnd, onError, onResult]);

    const stop = useCallback(() => {
        shouldRestart.current = false; // Disable automatic restarting
        isRestartingRef.current = false; // Clear the restarting flag

        if (recognition.current) {
            try {
                recognition.current.stop();
            } catch (error) {
                logger.error(`Error stopping recognition: ${(error as Error).message}`);
            }
        }

        if (animationFrameId.current) {
            cancelAnimationFrame(animationFrameId.current);
            animationFrameId.current = null;
        }

        if (microphone.current) {
            microphone.current.disconnect();
            microphone.current = null;
        }

        if (mediaStream.current) {
            mediaStream.current.getTracks().forEach(track => track.stop());
            mediaStream.current = null;
        }

        if (audioContext.current) {
            try {
                audioContext.current.close();
            } catch (error) {
                logger.error(`Error closing audio context: ${(error as Error).message}`);
            }
            audioContext.current = null;
        }
    }, []);

    const startAudioVisualization = useCallback((canvas: HTMLCanvasElement) => {
        const canvasCtx = canvas.getContext('2d');
        if (!canvasCtx) return;

        audioContext.current = new (window.AudioContext || window.AudioContext)();
        analyser.current = audioContext.current.createAnalyser();
        analyser.current.fftSize = 128; // Reduced for fewer bars in narrow space
        analyser.current.smoothingTimeConstant = 0.8;

        navigator.mediaDevices
            .getUserMedia({ audio: true, video: false })
            .then(stream => {
                mediaStream.current = stream;
                microphone.current = audioContext.current!.createMediaStreamSource(stream);
                microphone.current.connect(analyser.current!);

                const bufferLength = analyser.current!.frequencyBinCount;
                const dataArray = new Uint8Array(bufferLength);

                const draw = () => {
                    animationFrameId.current = requestAnimationFrame(draw);
                    analyser.current!.getByteFrequencyData(dataArray);

                    // Clear canvas with dark background
                    canvasCtx.fillStyle = 'rgb(25, 25, 25)';
                    canvasCtx.fillRect(0, 0, canvas.width, canvas.height);

                    // Calculate bar dimensions for vertical layout
                    const barHeight = (canvas.height / bufferLength) * 1.5; // Spacing between bars
                    const maxBarWidth = canvas.width * 0.8; // Maximum width of bars
                    let y = 0;

                    // Draw vertical bars from bottom to top
                    for (let i = 0; i < Math.min(bufferLength, Math.floor(canvas.height / (barHeight + 1))); i++) {
                        const barWidth = (dataArray[i] / 255) * maxBarWidth;

                        // Create gradient effect based on frequency data
                        const intensity = dataArray[i];
                        canvasCtx.fillStyle = `rgb(${Math.min(intensity + 50, 255)}, ${Math.min(intensity + 100, 255)}, 50)`;

                        // Center the bar horizontally
                        const x = (canvas.width - barWidth) / 2;

                        // Draw from bottom up
                        const barY = canvas.height - y - barHeight;
                        canvasCtx.fillRect(x, barY, barWidth, barHeight - 1);

                        y += barHeight;
                        if (y > canvas.height) break;
                    }
                };

                draw();
            })
            .catch(err => console.error('Error accessing microphone:', err));
    }, []);

    return {
        start,
        stop,
        startAudioVisualization,
    };
};
