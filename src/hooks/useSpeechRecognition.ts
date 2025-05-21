// src/hooks/useSpeechRecognition.ts
import { useCallback, useRef } from "react";
import { logger } from "@/modules/Logger";
import { usePerformance } from "@/contexts/PerformanceContext";

interface SpeechRecognitionHook {
    start: () => Promise<void>;
    stop: () => void;
    startAudioVisualization: (canvas: HTMLCanvasElement) => void;
}

interface SpeechRecognitionProps {
    onStart: () => void;
    onEnd: () => void;
    onError: (event: SpeechRecognitionErrorEvent) => void;
    onResult: (finalTranscript: string, interimTranscript: string) => void;
}

const useSpeechRecognition = ({
    onStart,
    onEnd,
    onError,
    onResult,
}: SpeechRecognitionProps): SpeechRecognitionHook => {
    const recognition = useRef<SpeechRecognition | null>(null);
    const audioContext = useRef<AudioContext | null>(null);
    const analyser = useRef<AnalyserNode | null>(null);
    const microphone = useRef<MediaStreamAudioSourceNode | null>(null);
    const animationFrameId = useRef<number | null>(null);
    const mediaStream = useRef<MediaStream | null>(null);
    const shouldRestart = useRef(false);
    const isRestartingRef = useRef(false); // New ref to track if we're in the process of restarting

    const { addEntry } = usePerformance();

    const start = useCallback(async () => {
        shouldRestart.current = true; // Enable automatic restarting

        if (!recognition.current) {
            recognition.current = new (window.SpeechRecognition ||
                window.webkitSpeechRecognition)();
            recognition.current.continuous = true;
            recognition.current.interimResults = true;

            // onstart - start the recognition
            recognition.current.onstart = () => {
                onStart();
                performance.mark("speechRecognition_onstart");
                performance.measure(
                    "speechRecognition_setup_time",
                    "speechRecognition_start",
                    "speechRecognition_onstart",
                );
                const measures = performance.getEntriesByName(
                    "speechRecognition_setup_time",
                );
                if (measures.length > 0) {
                    const measure = measures[0];
                    addEntry({
                        name: "speechRecognition_setup_time",
                        duration: measure.duration,
                        startTime: measure.startTime,
                        endTime: measure.startTime + measure.duration,
                    });
                    logger.performance(
                        `Speech recognition setup time: ${measure.duration.toFixed(
                            2,
                        )}ms`,
                    );
                }
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
                            logger.error(
                                `Failed to restart speech recognition after end: ${
                                    (error as Error).message
                                }`,
                            );
                        }
                    }, 500); // 500ms delay
                }
            };

            // onerror - handle errors with a delayed restart approach
            recognition.current.onerror = (
                event: SpeechRecognitionErrorEvent,
            ) => {
                onError(event);

                if (shouldRestart.current && !isRestartingRef.current) {
                    isRestartingRef.current = true; // Set the restarting flag

                    // For network errors, use a longer delay
                    const delay = event.error === "network" ? 2000 : 1000;

                    // Attempt to stop recognition first (ignore errors if already stopped)
                    try {
                        recognition.current?.stop();
                    } catch (stopError) {
                        // Just log the error but continue with restart
                        logger.debug(
                            `Error while stopping recognition for restart: ${
                                (stopError as Error).message
                            }`,
                        );
                    }

                    // Attempt to restart after delay
                    setTimeout(() => {
                        try {
                            recognition.current?.start();
                        } catch (error) {
                            isRestartingRef.current = false; // Clear the flag if failed
                            logger.error(
                                `Failed to restart speech recognition after error: ${
                                    (error as Error).message
                                }`,
                            );
                        }
                    }, delay);
                }
            };

            // onresult - process the result
            recognition.current.onresult = (event: SpeechRecognitionEvent) => {
                let interimTranscript = "";
                let finalTranscript = "";

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

        performance.mark("speechRecognition_start");

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
                    logger.error(
                        `Failed to start speech recognition: ${
                            (error as Error).message
                        }`,
                    );
                }
            }, 100);
        }
    }, [onStart, onEnd, onError, onResult, addEntry]);

    const stop = useCallback(() => {
        shouldRestart.current = false; // Disable automatic restarting
        isRestartingRef.current = false; // Clear the restarting flag

        if (recognition.current) {
            try {
                recognition.current.stop();
            } catch (error) {
                logger.error(
                    `Error stopping recognition: ${(error as Error).message}`,
                );
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
            mediaStream.current.getTracks().forEach((track) => track.stop());
            mediaStream.current = null;
        }

        if (audioContext.current) {
            try {
                audioContext.current.close();
            } catch (error) {
                logger.error(
                    `Error closing audio context: ${(error as Error).message}`,
                );
            }
            audioContext.current = null;
        }
    }, []);

    const startAudioVisualization = useCallback((canvas: HTMLCanvasElement) => {
        const canvasCtx = canvas.getContext("2d");
        if (!canvasCtx) return;

        audioContext.current = new (window.AudioContext ||
            window.AudioContext)();
        analyser.current = audioContext.current.createAnalyser();
        analyser.current.fftSize = 256;

        navigator.mediaDevices
            .getUserMedia({ audio: true, video: false })
            .then((stream) => {
                mediaStream.current = stream;
                microphone.current =
                    audioContext.current!.createMediaStreamSource(stream);
                microphone.current.connect(analyser.current!);

                const bufferLength = analyser.current!.frequencyBinCount;
                const dataArray = new Uint8Array(bufferLength);

                const draw = () => {
                    animationFrameId.current = requestAnimationFrame(draw);
                    analyser.current!.getByteFrequencyData(dataArray);

                    canvasCtx.fillStyle = "rgb(25, 25, 25)";
                    canvasCtx.fillRect(0, 0, canvas.width, canvas.height);

                    const barWidth = (canvas.width / bufferLength) * 2.5;
                    let x = 0;

                    for (let i = 0; i < bufferLength; i++) {
                        const barHeight =
                            (dataArray[i] / 255) * (canvas.height * 0.6); // Reduce bar height to 60% of canvas height

                        canvasCtx.fillStyle = `rgb(50, ${
                            dataArray[i] + 100
                        }, 50)`;
                        canvasCtx.fillRect(
                            x,
                            canvas.height - barHeight,
                            barWidth,
                            barHeight,
                        );

                        x += barWidth + 1;
                        if (x > canvas.width) break; // Prevent drawing outside the canvas
                    }
                };

                draw();
            })
            .catch((err) => console.error("Error accessing microphone:", err));
    }, []);

    return { start, stop, startAudioVisualization };
};

export default useSpeechRecognition;
