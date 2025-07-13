// src/hooks/useSpeechRecognition.ts
'use client';
import { logger } from '@/modules/Logger';
import {
    useAPIReliabilityMetrics,
    useMemoryLeakDetection,
    useRenderMetrics,
} from '@/utils/performance/measurementHooks';
import { useCallback, useRef } from 'react';

// Define custom error type for non-standard errors
export interface CustomSpeechError {
    code: SpeechRecognitionErrorCode;
    message: string;
}

// Define the hook's return type
interface SpeechRecognitionHook {
    start: () => Promise<void>;
    stop: () => void;
    startAudioVisualization: (canvas: HTMLCanvasElement) => void;
    // ✅ NEW: Expose performance stats
    getSpeechStats: () => {
        recognitionInstances: number;
        audioInstances: number;
        totalStarts: number;
        totalErrors: number;
    };
}

// Define props with extended error handling
interface SpeechRecognitionProps {
    onStart: () => void;
    onEnd: () => void;
    onError: (error: SpeechRecognitionErrorEvent | CustomSpeechError) => void;
    onResult: (finalTranscript: string, interimTranscript: string) => void;
}

export const useSpeechRecognition = ({
    onStart,
    onEnd,
    onError,
    onResult,
}: SpeechRecognitionProps): SpeechRecognitionHook => {
    // ✅ CORE PERFORMANCE TRACKING
    const { registerInstance, unregisterInstance, activeInstances } = useMemoryLeakDetection('useSpeechRecognition');
    const { measureAPICall } = useAPIReliabilityMetrics();
    const { trackRender } = useRenderMetrics('useSpeechRecognition');

    // ✅ ENHANCED: Performance tracking refs
    const recognition = useRef<SpeechRecognition | null>(null);
    const audioContext = useRef<AudioContext | null>(null);
    const analyser = useRef<AnalyserNode | null>(null);
    const microphone = useRef<MediaStreamAudioSourceNode | null>(null);
    const animationFrameId = useRef<number | null>(null);
    const mediaStream = useRef<MediaStream | null>(null);
    const shouldRestart = useRef(false);
    const isRestartingRef = useRef(false);

    // ✅ NEW: Performance metrics tracking
    const performanceStats = useRef({
        totalStarts: 0,
        totalStops: 0,
        totalErrors: 0,
        totalResults: 0,
        sessionStartTime: 0,
    });

    const start = useCallback(async () => {
        shouldRestart.current = true;

        // ✅ Track render when start is called
        trackRender({ action: 'start', timestamp: Date.now() });

        // ✅ Increment start counter
        performanceStats.current.totalStarts++;
        performanceStats.current.sessionStartTime = performance.now();

        if (!recognition.current) {
            recognition.current = new (window.SpeechRecognition || window.webkitSpeechRecognition)();

            // ✅ ENHANCED: Track instance creation with detailed logging
            registerInstance(recognition.current);
            console.log(`🎤 Speech recognition instance created (total active: ${activeInstances + 1})`);

            recognition.current.continuous = true;
            recognition.current.interimResults = true;

            // ✅ ENHANCED: Track start performance
            recognition.current.onstart = () => {
                const startTime = performance.now() - performanceStats.current.sessionStartTime;
                console.log(`🎤 Speech recognition started in ${startTime.toFixed(1)}ms`);

                trackRender({ action: 'onstart', startTime });
                onStart();
                isRestartingRef.current = false;
            };

            // ✅ ENHANCED: Track end performance
            recognition.current.onend = () => {
                const sessionDuration = performance.now() - performanceStats.current.sessionStartTime;
                console.log(`🎤 Speech recognition ended after ${(sessionDuration / 1000).toFixed(1)}s`);

                trackRender({ action: 'onend', sessionDuration });
                performanceStats.current.totalStops++;
                onEnd();

                // Restart logic with performance tracking
                if (shouldRestart.current && !isRestartingRef.current) {
                    isRestartingRef.current = true;

                    setTimeout(() => {
                        try {
                            // ✅ Track restart attempts
                            console.log(
                                `🔄 Attempting speech recognition restart (attempt #${
                                    performanceStats.current.totalStarts + 1
                                })`
                            );
                            recognition.current?.start();
                        } catch (error) {
                            isRestartingRef.current = false;
                            performanceStats.current.totalErrors++;
                            logger.error(`Failed to restart speech recognition after end: ${(error as Error).message}`);
                        }
                    }, 500);
                }
            };

            // ✅ ENHANCED: Track error performance and patterns
            recognition.current.onerror = (event: SpeechRecognitionErrorEvent) => {
                performanceStats.current.totalErrors++;

                // Track render on error
                trackRender({ action: 'onerror', errorType: event.error, timestamp: Date.now() });

                console.warn(
                    `🎤 Speech recognition error: ${event.error} (total errors: ${performanceStats.current.totalErrors})`
                );
                onError(event);

                if (shouldRestart.current && !isRestartingRef.current) {
                    isRestartingRef.current = true;

                    // ✅ Smart delay based on error type
                    const delay = event.error === 'network' ? 2000 : 1000;
                    console.log(`🔄 Scheduling restart in ${delay}ms due to ${event.error} error`);

                    try {
                        recognition.current?.stop();
                    } catch (stopError) {
                        logger.debug(`Error while stopping recognition for restart: ${(stopError as Error).message}`);
                    }

                    setTimeout(() => {
                        try {
                            recognition.current?.start();
                        } catch (error) {
                            isRestartingRef.current = false;
                            performanceStats.current.totalErrors++;
                            logger.error(
                                `Failed to restart speech recognition after error: ${(error as Error).message}`
                            );
                        }
                    }, delay);
                }
            };

            // ✅ ENHANCED: Track result processing performance
            recognition.current.onresult = (event: SpeechRecognitionEvent) => {
                const resultStartTime = performance.now();
                performanceStats.current.totalResults++;

                // Track render during result processing
                trackRender({
                    action: 'onresult',
                    resultIndex: event.resultIndex,
                    resultsLength: event.results.length,
                    timestamp: Date.now(),
                });

                let interimTranscript = '';
                let finalTranscript = '';

                for (let i = event.resultIndex; i < event.results.length; ++i) {
                    if (event.results[i].isFinal) {
                        finalTranscript += event.results[i][0].transcript;
                    } else {
                        interimTranscript += event.results[i][0].transcript;
                    }
                }

                const processingTime = performance.now() - resultStartTime;

                // ✅ Log performance for long processing times
                if (processingTime > 50) {
                    // More than 50ms
                    console.warn(`🐌 Slow speech result processing: ${processingTime.toFixed(1)}ms`);
                }

                onResult(finalTranscript, interimTranscript);
            };
        }

        // ✅ Track initial start attempt
        if (!isRestartingRef.current) {
            isRestartingRef.current = true;

            setTimeout(() => {
                try {
                    recognition.current?.start();
                } catch (error) {
                    isRestartingRef.current = false;
                    performanceStats.current.totalErrors++;
                    logger.error(`Failed to start speech recognition: ${(error as Error).message}`);
                }
            }, 100);
        }
    }, [onStart, onEnd, onError, onResult, registerInstance, trackRender, activeInstances]);

    const stop = useCallback(() => {
        shouldRestart.current = false;
        isRestartingRef.current = false;

        // ✅ Track render on stop
        trackRender({ action: 'stop', timestamp: Date.now() });

        const sessionDuration = performance.now() - performanceStats.current.sessionStartTime;
        console.log(`🛑 Speech recognition stopped after ${(sessionDuration / 1000).toFixed(1)}s total session`);

        if (recognition.current) {
            try {
                // ✅ ENHANCED: Track instance cleanup with logging
                unregisterInstance(recognition.current);
                console.log(
                    `🎤 Speech recognition instance destroyed (remaining active: ${Math.max(0, activeInstances - 1)})`
                );

                recognition.current.stop();
            } catch (error) {
                logger.error(`Error stopping recognition: ${(error as Error).message}`);
            }
        }

        // ✅ ENHANCED: Comprehensive cleanup with tracking
        if (animationFrameId.current) {
            cancelAnimationFrame(animationFrameId.current);
            animationFrameId.current = null;
        }

        if (microphone.current) {
            microphone.current.disconnect();
            microphone.current = null;
        }

        if (mediaStream.current) {
            mediaStream.current.getTracks().forEach(track => {
                track.stop();
                console.log(`🎤 Media track stopped: ${track.kind}`);
            });
            mediaStream.current = null;
        }

        if (audioContext.current) {
            try {
                audioContext.current.close();
                console.log(`🎤 Audio context closed`);
            } catch (error) {
                logger.error(`Error closing audio context: ${(error as Error).message}`);
            }
            audioContext.current = null;
        }
    }, [unregisterInstance, trackRender, activeInstances]);

    const startAudioVisualization = useCallback(
        async (canvas: HTMLCanvasElement) => {
            // ✅ ENHANCED: Wrap getUserMedia with API reliability tracking
            try {
                const stream = await measureAPICall(
                    () => navigator.mediaDevices.getUserMedia({ audio: true, video: false }),
                    'Speech-GetUserMedia',
                    { timeout: 10000, retries: 1 } // 10s timeout for microphone access
                );

                const canvasCtx = canvas.getContext('2d');
                if (!canvasCtx) return;

                audioContext.current = new (window.AudioContext || window.AudioContext)();
                analyser.current = audioContext.current.createAnalyser();
                analyser.current.fftSize = 128;
                analyser.current.smoothingTimeConstant = 0.8;

                // ✅ Track audio instances
                registerInstance(audioContext.current);
                registerInstance(analyser.current);
                console.log(`🎤 Audio visualization started (context + analyser created)`);

                mediaStream.current = stream;
                microphone.current = audioContext.current.createMediaStreamSource(stream);
                microphone.current.connect(analyser.current);

                const bufferLength = analyser.current.frequencyBinCount;
                const dataArray = new Uint8Array(bufferLength);

                // ✅ Track render performance for animation frames
                let frameCount = 0;
                let lastFPSCheck = performance.now();

                const draw = () => {
                    animationFrameId.current = requestAnimationFrame(draw);
                    analyser.current!.getByteFrequencyData(dataArray);

                    // ✅ FPS monitoring for audio visualization
                    frameCount++;
                    if (frameCount % 60 === 0) {
                        // Check every 60 frames
                        const now = performance.now();
                        const fps = 60000 / (now - lastFPSCheck);
                        if (fps < 30) {
                            // Warn if FPS drops below 30
                            console.warn(`🎨 Audio visualization FPS low: ${fps.toFixed(1)} FPS`);
                        }
                        lastFPSCheck = now;
                    }

                    // Clear canvas with dark background
                    canvasCtx.fillStyle = 'rgb(25, 25, 25)';
                    canvasCtx.fillRect(0, 0, canvas.width, canvas.height);

                    // Calculate bar dimensions for vertical layout
                    const barHeight = (canvas.height / bufferLength) * 1.5;
                    const maxBarWidth = canvas.width * 0.8;
                    let y = 0;

                    // Draw vertical bars from bottom to top
                    for (let i = 0; i < Math.min(bufferLength, Math.floor(canvas.height / (barHeight + 1))); i++) {
                        const barWidth = (dataArray[i] / 255) * maxBarWidth;

                        const intensity = dataArray[i];
                        canvasCtx.fillStyle = `rgb(${Math.min(intensity + 50, 255)}, ${Math.min(
                            intensity + 100,
                            255
                        )}, 50)`;

                        const x = (canvas.width - barWidth) / 2;
                        const barY = canvas.height - y - barHeight;
                        canvasCtx.fillRect(x, barY, barWidth, barHeight - 1);

                        y += barHeight;
                        if (y > canvas.height) break;
                    }
                };

                draw();
            } catch (err) {
                console.error('❌ Error accessing microphone:', err);
                throw err;
            }
        },
        [measureAPICall, registerInstance]
    );

    // ✅ NEW: Expose performance statistics
    const getSpeechStats = useCallback(() => {
        return {
            recognitionInstances: activeInstances,
            audioInstances: [audioContext.current, analyser.current, microphone.current].filter(Boolean).length,
            totalStarts: performanceStats.current.totalStarts,
            totalErrors: performanceStats.current.totalErrors,
            totalResults: performanceStats.current.totalResults,
            errorRate:
                performanceStats.current.totalStarts > 0
                    ? ((performanceStats.current.totalErrors / performanceStats.current.totalStarts) * 100).toFixed(1) +
                      '%'
                    : '0%',
        };
    }, [activeInstances]);

    return {
        start,
        stop,
        startAudioVisualization,
        getSpeechStats, // ✅ NEW: Expose performance stats
    };
};
