// src/hooks/useSpeechRecognition.ts
import { useCallback, useRef } from "react";
import { logger } from "@/modules/Logger";
import { usePerformance } from "@/contexts/PerformanceContext";

// Define custom error type for non-standard errors
export interface CustomSpeechError {
    code: string; // e.g., "browser-not-supported", "init-failed"
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
    const isRestartingRef = useRef(false);
    const consecutiveErrors = useRef(0);
    const lastErrorTime = useRef(0);

    const { addEntry } = usePerformance();

    // Check browser support for speech recognition
    const checkBrowserSupport = useCallback(() => {
        const hasWebkitSpeechRecognition = "webkitSpeechRecognition" in window;
        const hasSpeechRecognition = "SpeechRecognition" in window;

        if (!hasWebkitSpeechRecognition && !hasSpeechRecognition) {
            const error: CustomSpeechError = {
                code: "browser-not-supported",
                message:
                    "Speech recognition is not supported in this browser. Please use Chrome, Edge, or Safari.",
            };
            logger.error("🚫 Speech recognition not supported in this browser");
            logger.info(
                "💡 Speech recognition requires Chrome, Edge, or Safari",
            );
            onError(error);
            return false;
        }
        logger.info("✅ Speech recognition supported");
        return true;
    }, [onError]);

    // Enhanced error handling for speech recognition errors
    const enhancedSpeechRecognitionErrorHandler = useCallback(
        (event: SpeechRecognitionErrorEvent) => {
            const now = Date.now();
            const timeSinceLastError = now - lastErrorTime.current;

            if (timeSinceLastError < 5000) {
                consecutiveErrors.current++;
            } else {
                consecutiveErrors.current = 1;
            }
            lastErrorTime.current = now;

            let userMessage = "";
            switch (event.error) {
                case "network":
                    userMessage =
                        "Network issue detected. Please check your internet connection.";
                    break;
                case "not-allowed":
                    userMessage =
                        "Microphone permission denied. Please allow access in your browser settings.";
                    break;
                case "service-not-allowed":
                    userMessage =
                        "Speech recognition service not allowed. Check browser settings and ensure HTTPS.";
                    break;
                case "no-speech":
                    userMessage =
                        "No speech detected. Try speaking closer to the microphone.";
                    break;
                case "audio-capture":
                    userMessage =
                        "Audio capture failed. Check microphone connection and permissions.";
                    break;
                case "aborted":
                    userMessage =
                        "Speech recognition was aborted. This is usually intentional.";
                    break;
                case "language-not-supported":
                    userMessage =
                        "Language not supported by speech recognition service.";
                    break;
                case "bad-grammar":
                    userMessage = "Grammar configuration issue detected.";
                    break;
                default:
                    userMessage = `Unknown speech recognition error: ${event.error}`;
            }

            const errorDetails = {
                error: event.error,
                message: userMessage,
                timestamp: new Date().toISOString(),
                consecutiveErrors: consecutiveErrors.current,
                timeSinceLastError,
            };
            logger.error(
                `🎙️❌ Speech recognition error: ${
                    event.error
                } - ${JSON.stringify(errorDetails)}`,
            );
            onError(event);

            let shouldAttemptRestart = true;
            let restartDelay = 1000;

            switch (event.error) {
                case "network":
                    restartDelay = 3000;
                    if (consecutiveErrors.current > 3)
                        shouldAttemptRestart = false;
                    break;
                case "not-allowed":
                case "service-not-allowed":
                case "aborted":
                case "language-not-supported":
                    shouldAttemptRestart = false;
                    break;
                case "no-speech":
                    restartDelay = 500;
                    break;
                case "audio-capture":
                    restartDelay = 2000;
                    if (consecutiveErrors.current > 2)
                        shouldAttemptRestart = false;
                    break;
                case "bad-grammar":
                    restartDelay = 1500;
                    break;
                default:
                    restartDelay = 2000;
            }

            if (
                shouldRestart.current &&
                !isRestartingRef.current &&
                shouldAttemptRestart
            ) {
                if (consecutiveErrors.current > 5) {
                    logger.error(
                        "🛑 Too many consecutive errors. Stopping speech recognition.",
                    );
                    shouldRestart.current = false;
                    return;
                }
                isRestartingRef.current = true;
                logger.info(
                    `🔄 Restarting in ${restartDelay}ms (attempt ${consecutiveErrors.current})`,
                );

                try {
                    recognition.current?.stop();
                } catch (stopError) {
                    logger.debug(
                        `Stop error during restart: ${
                            (stopError as Error).message
                        }`,
                    );
                }

                setTimeout(() => {
                    try {
                        if (shouldRestart.current && recognition.current) {
                            logger.debug("🚀 Restarting speech recognition");
                            recognition.current.start();
                        }
                    } catch (restartError) {
                        isRestartingRef.current = false;
                        consecutiveErrors.current++;
                        logger.error(
                            `Restart failed: ${
                                (restartError as Error).message
                            }`,
                        );
                    }
                }, restartDelay);
            } else if (!shouldAttemptRestart) {
                logger.info("🛑 Automatic restart disabled for this error");
                shouldRestart.current = false;
            }
        },
        [onError],
    );

    const start = useCallback(async () => {
        if (!checkBrowserSupport()) return;

        shouldRestart.current = true;
        consecutiveErrors.current = 0;

        if (!recognition.current) {
            try {
                recognition.current = new (window.SpeechRecognition ||
                    window.webkitSpeechRecognition)();
                recognition.current.continuous = true;
                recognition.current.interimResults = true;
                recognition.current.lang = "en-US";
                recognition.current.maxAlternatives = 1;

                recognition.current.onstart = () => {
                    logger.debug("🎤 Speech recognition started");
                    onStart();
                    consecutiveErrors.current = 0;

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
                            `Setup time: ${measure.duration.toFixed(2)}ms`,
                        );
                    }
                    isRestartingRef.current = false;
                };

                recognition.current.onend = () => {
                    logger.debug("🎤 Speech recognition ended");
                    onEnd();

                    if (shouldRestart.current && !isRestartingRef.current) {
                        isRestartingRef.current = true;
                        logger.debug("🔄 Auto-restarting after natural end");
                        setTimeout(() => {
                            try {
                                if (
                                    shouldRestart.current &&
                                    recognition.current
                                ) {
                                    recognition.current.start();
                                }
                            } catch (error) {
                                isRestartingRef.current = false;
                                logger.error(
                                    `Restart after end failed: ${
                                        (error as Error).message
                                    }`,
                                );
                            }
                        }, 100);
                    }
                };

                recognition.current.onerror =
                    enhancedSpeechRecognitionErrorHandler;

                recognition.current.onresult = (
                    event: SpeechRecognitionEvent,
                ) => {
                    let interimTranscript = "";
                    let finalTranscript = "";
                    for (
                        let i = event.resultIndex;
                        i < event.results.length;
                        ++i
                    ) {
                        const result = event.results[i][0];
                        const transcript = result.transcript;
                        if (event.results[i].isFinal) {
                            finalTranscript += transcript;
                            logger.debug(
                                `🎯 Final: "${transcript}" (confidence: ${
                                    result.confidence?.toFixed(2) || "N/A"
                                })`,
                            );
                        } else {
                            interimTranscript += transcript;
                            logger.debug(`🎙️ Interim: "${transcript}"`);
                        }
                    }
                    onResult(finalTranscript, interimTranscript);
                };

                logger.info("🔧 Speech recognition initialized");
            } catch (error) {
                const err: CustomSpeechError = {
                    code: "initialization-failed",
                    message:
                        "Failed to initialize speech recognition. Please try again.",
                };
                logger.error(`Init failed: ${(error as Error).message}`);
                onError(err);
                throw error;
            }
        }

        performance.mark("speechRecognition_start");

        if (!isRestartingRef.current) {
            isRestartingRef.current = true;
            setTimeout(() => {
                try {
                    if (recognition.current && shouldRestart.current) {
                        logger.debug("🚀 Starting speech recognition");
                        recognition.current.start();
                    }
                } catch (error) {
                    isRestartingRef.current = false;
                    logger.error(`Start failed: ${(error as Error).message}`);
                    const err: CustomSpeechError = {
                        code: "start-failed",
                        message:
                            "Failed to start speech recognition. Please try again.",
                    };
                    onError(err);
                    throw error;
                }
            }, 100);
        }
    }, [
        onStart,
        onEnd,
        onResult,
        addEntry,
        enhancedSpeechRecognitionErrorHandler,
        checkBrowserSupport,
        onError,
    ]);

    const stop = useCallback(() => {
        logger.info("🛑 Stopping speech recognition");
        shouldRestart.current = false;
        isRestartingRef.current = false;
        consecutiveErrors.current = 0;

        if (recognition.current) {
            try {
                recognition.current.stop();
                logger.debug("✅ Speech recognition stopped");
            } catch (error) {
                logger.error(`Stop error: ${(error as Error).message}`);
                const err: CustomSpeechError = {
                    code: "stop-failed",
                    message:
                        "Failed to stop speech recognition. Please try again.",
                };
                onError(err);
            }
        }

        if (animationFrameId.current) {
            cancelAnimationFrame(animationFrameId.current);
            animationFrameId.current = null;
            logger.debug("🎨 Audio visualization stopped");
        }

        if (microphone.current) {
            microphone.current.disconnect();
            microphone.current = null;
        }

        if (mediaStream.current) {
            mediaStream.current.getTracks().forEach((track) => track.stop());
            mediaStream.current = null;
            logger.debug("🎤 Media stream stopped");
        }

        if (audioContext.current) {
            try {
                audioContext.current.close();
                audioContext.current = null;
                logger.debug("🎵 Audio context closed");
            } catch (error) {
                logger.error(
                    `Audio context close error: ${(error as Error).message}`,
                );
                const err: CustomSpeechError = {
                    code: "audio-context-close-failed",
                    message: "Failed to close audio context. Please try again.",
                };
                onError(err);
            }
        }
    }, [onError]);

    const startAudioVisualization = useCallback(
        (canvas: HTMLCanvasElement) => {
            logger.info("🎨 Starting audio visualization");
            const canvasCtx = canvas.getContext("2d");
            if (!canvasCtx) {
                const error: CustomSpeechError = {
                    code: "canvas-context-failed",
                    message:
                        "Failed to set up audio visualization. Please try again.",
                };
                logger.error("❌ Failed to get canvas 2D context");
                onError(error);
                return;
            }

            try {
                audioContext.current = new (window.AudioContext ||
                    window.AudioContext)();
                analyser.current = audioContext.current.createAnalyser();
                analyser.current.fftSize = 256;
            } catch (error) {
                const err: CustomSpeechError = {
                    code: "audio-visualization-init",
                    message:
                        "Failed to initialize audio visualization. Please try again.",
                };
                logger.error(
                    `Audio viz init failed: ${(error as Error).message}`,
                );
                onError(err);
                return;
            }

            navigator.mediaDevices
                .getUserMedia({ audio: true, video: false })
                .then((stream) => {
                    mediaStream.current = stream;
                    microphone.current =
                        audioContext.current!.createMediaStreamSource(stream);
                    microphone.current.connect(analyser.current!);

                    const bufferLength = analyser.current!.frequencyBinCount;
                    const dataArray = new Uint8Array(bufferLength);
                    logger.debug(
                        `🎵 Audio viz setup complete (buffer: ${bufferLength})`,
                    );

                    const draw = () => {
                        animationFrameId.current = requestAnimationFrame(draw);
                        analyser.current!.getByteFrequencyData(dataArray);

                        canvasCtx.fillStyle = "rgb(25, 25, 25)";
                        canvasCtx.fillRect(0, 0, canvas.width, canvas.height);

                        const barWidth = (canvas.width / bufferLength) * 2.5;
                        let x = 0;
                        for (let i = 0; i < bufferLength; i++) {
                            const barHeight =
                                (dataArray[i] / 255) * (canvas.height * 0.6);
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
                            if (x > canvas.width) break;
                        }
                    };

                    draw();
                    logger.debug("✅ Audio visualization started");
                })
                .catch((err) => {
                    const error: CustomSpeechError = {
                        code: "microphone-access-failed",
                        message:
                            "Couldn’t access your microphone. Please check permissions.",
                    };
                    logger.error(`Mic access error: ${err.message}`);
                    onError(error);
                });
        },
        [onError],
    );

    return { start, stop, startAudioVisualization };
};

export default useSpeechRecognition;
