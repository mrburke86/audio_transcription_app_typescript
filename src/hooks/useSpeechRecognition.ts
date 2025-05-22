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
    const isRestartingRef = useRef(false);
    const consecutiveErrors = useRef(0); // Track consecutive errors
    const lastErrorTime = useRef(0); // Track last error timestamp

    const { addEntry } = usePerformance();

    // Enhanced error handler
    const enhancedSpeechRecognitionErrorHandler = useCallback(
        (event: SpeechRecognitionErrorEvent) => {
            const now = Date.now();
            const timeSinceLastError = now - lastErrorTime.current;

            // Update error tracking
            if (timeSinceLastError < 5000) {
                // Within 5 seconds of last error
                consecutiveErrors.current++;
            } else {
                consecutiveErrors.current = 1; // Reset if enough time has passed
            }
            lastErrorTime.current = now;

            const errorDetails = {
                error: event.error,
                message: event.message || "No additional message",
                timestamp: new Date().toISOString(),
                consecutiveErrors: consecutiveErrors.current,
                timeSinceLastError: timeSinceLastError,
            };

            logger.error(
                `🎙️❌ Speech recognition error: ${
                    event.error
                } - ${JSON.stringify(errorDetails)}`,
            );

            // Call the original onError callback
            onError(event);

            let shouldAttemptRestart = true;
            let restartDelay = 1000;

            // Specific error handling with enhanced logic
            switch (event.error) {
                case "network":
                    logger.warning(
                        "🌐 Network connectivity issue detected. Check internet connection.",
                    );
                    restartDelay = 3000; // Longer delay for network issues

                    if (consecutiveErrors.current > 3) {
                        logger.error(
                            "🚫 Too many consecutive network errors. Stopping automatic restart.",
                        );
                        shouldAttemptRestart = false;
                    }
                    break;

                case "not-allowed":
                    logger.error(
                        "🔒 Microphone permission denied. Please allow microphone access in browser settings.",
                    );
                    shouldAttemptRestart = false; // Don't restart for permission issues
                    break;

                case "service-not-allowed":
                    logger.error(
                        "🚫 Speech recognition service not allowed. Check browser settings and ensure HTTPS.",
                    );
                    shouldAttemptRestart = false;
                    break;

                case "no-speech":
                    logger.warning(
                        "🔇 No speech detected. Try speaking closer to the microphone.",
                    );
                    restartDelay = 500; // Quick restart for no-speech
                    break;

                case "audio-capture":
                    logger.error(
                        "🎤 Audio capture failed. Check microphone connection and permissions.",
                    );
                    restartDelay = 2000;

                    if (consecutiveErrors.current > 2) {
                        logger.error(
                            "🚫 Repeated audio capture failures. Stopping automatic restart.",
                        );
                        shouldAttemptRestart = false;
                    }
                    break;

                case "aborted":
                    logger.warning(
                        "⏹️ Speech recognition was aborted. This is usually intentional.",
                    );
                    shouldAttemptRestart = false; // Don't restart if aborted
                    break;

                case "language-not-supported":
                    logger.error(
                        "🌍 Language not supported by speech recognition service.",
                    );
                    shouldAttemptRestart = false;
                    break;

                case "bad-grammar":
                    logger.warning("📝 Grammar configuration issue detected.");
                    restartDelay = 1500;
                    break;

                default:
                    logger.error(
                        `❓ Unknown speech recognition error: ${event.error}`,
                    );
                    restartDelay = 2000;
            }

            // Enhanced restart logic
            if (
                shouldRestart.current &&
                !isRestartingRef.current &&
                shouldAttemptRestart
            ) {
                // Check if we've had too many consecutive errors overall
                if (consecutiveErrors.current > 5) {
                    logger.error(
                        "🛑 Too many consecutive errors. Stopping speech recognition to prevent endless restart loop.",
                    );
                    shouldRestart.current = false;
                    return;
                }

                isRestartingRef.current = true;
                logger.info(
                    `🔄 Attempting to restart speech recognition in ${restartDelay}ms (attempt ${consecutiveErrors.current})`,
                );

                // Stop current recognition safely
                try {
                    recognition.current?.stop();
                } catch (stopError) {
                    logger.debug(
                        `Error while stopping recognition for restart: ${
                            (stopError as Error).message
                        }`,
                    );
                }

                // Attempt restart after delay
                setTimeout(() => {
                    try {
                        if (shouldRestart.current && recognition.current) {
                            logger.debug(
                                "🚀 Executing speech recognition restart",
                            );
                            recognition.current.start();
                        }
                    } catch (restartError) {
                        isRestartingRef.current = false;
                        consecutiveErrors.current++;
                        logger.error(
                            `Failed to restart speech recognition: ${
                                (restartError as Error).message
                            }`,
                        );
                    }
                }, restartDelay);
            } else if (!shouldAttemptRestart) {
                logger.info(
                    "🛑 Automatic restart disabled for this error type",
                );
                shouldRestart.current = false;
            }
        },
        [onError],
    );

    // Browser support check
    const checkBrowserSupport = useCallback(() => {
        const hasWebkitSpeechRecognition = "webkitSpeechRecognition" in window;
        const hasSpeechRecognition = "SpeechRecognition" in window;

        if (!hasWebkitSpeechRecognition && !hasSpeechRecognition) {
            logger.error("🚫 Speech recognition not supported in this browser");
            logger.info(
                "💡 Speech recognition requires Chrome, Edge, or Safari",
            );
            return false;
        }

        logger.info("✅ Speech recognition supported");
        return true;
    }, []);

    const start = useCallback(async () => {
        // Check browser support first
        if (!checkBrowserSupport()) {
            throw new Error("Speech recognition not supported in this browser");
        }

        shouldRestart.current = true;
        consecutiveErrors.current = 0; // Reset error count on manual start

        if (!recognition.current) {
            try {
                recognition.current = new (window.SpeechRecognition ||
                    window.webkitSpeechRecognition)();
                recognition.current.continuous = true;
                recognition.current.interimResults = true;
                recognition.current.lang = "en-US"; // Set language explicitly
                recognition.current.maxAlternatives = 1; // Optimize for performance

                // onstart
                recognition.current.onstart = () => {
                    logger.debug("🎤 Speech recognition started successfully");
                    onStart();
                    consecutiveErrors.current = 0; // Reset error count on successful start

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

                    isRestartingRef.current = false;
                };

                // onend with enhanced restart logic
                recognition.current.onend = () => {
                    logger.debug("🎤 Speech recognition ended");
                    onEnd();

                    if (shouldRestart.current && !isRestartingRef.current) {
                        isRestartingRef.current = true;
                        logger.debug(
                            "🔄 Auto-restarting speech recognition after natural end",
                        );

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
                                    `Failed to restart after natural end: ${
                                        (error as Error).message
                                    }`,
                                );
                            }
                        }, 100); // Shorter delay for natural end
                    }
                };

                // Use enhanced error handler
                recognition.current.onerror =
                    enhancedSpeechRecognitionErrorHandler;

                // onresult with enhanced logging
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
                        const confidence = result.confidence;

                        if (event.results[i].isFinal) {
                            finalTranscript += transcript;
                            logger.debug(
                                `🎯 Final transcript: "${transcript}" (confidence: ${
                                    confidence?.toFixed(2) || "N/A"
                                })`,
                            );
                        } else {
                            interimTranscript += transcript;
                            logger.debug(
                                `🎙️ Interim transcript: "${transcript}"`,
                            );
                        }
                    }

                    onResult(finalTranscript, interimTranscript);
                };

                logger.info("🔧 Speech recognition initialized successfully");
            } catch (error) {
                logger.error(
                    `Failed to initialize speech recognition: ${
                        (error as Error).message
                    }`,
                );
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
                    logger.error(
                        `Failed to start speech recognition: ${
                            (error as Error).message
                        }`,
                    );
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
    ]);

    const stop = useCallback(() => {
        logger.info("🛑 Stopping speech recognition");
        shouldRestart.current = false;
        isRestartingRef.current = false;
        consecutiveErrors.current = 0; // Reset error count

        if (recognition.current) {
            try {
                recognition.current.stop();
                logger.debug("✅ Speech recognition stopped successfully");
            } catch (error) {
                logger.error(
                    `Error stopping recognition: ${(error as Error).message}`,
                );
            }
        }

        // Clean up audio visualization
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
                    `Error closing audio context: ${(error as Error).message}`,
                );
            }
        }
    }, []);

    const startAudioVisualization = useCallback((canvas: HTMLCanvasElement) => {
        logger.info("🎨 Starting audio visualization");

        const canvasCtx = canvas.getContext("2d");
        if (!canvasCtx) {
            logger.error("❌ Failed to get canvas 2D context");
            return;
        }

        try {
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

                    logger.debug(
                        `🎵 Audio visualization setup complete (buffer length: ${bufferLength})`,
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
                    logger.debug("✅ Audio visualization started successfully");
                })
                .catch((err) => {
                    logger.error(
                        `🎤 Error accessing microphone for visualization: ${err.message}`,
                    );
                });
        } catch (error) {
            logger.error(
                `Failed to initialize audio visualization: ${
                    (error as Error).message
                }`,
            );
        }
    }, []);

    return { start, stop, startAudioVisualization };
};

export default useSpeechRecognition;
