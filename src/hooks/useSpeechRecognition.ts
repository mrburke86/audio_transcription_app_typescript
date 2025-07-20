// src/hooks/useSpeechRecognition.ts - No changes: Kept separate as effect-heavy (browser APIs, refs); complements speechSlice without duplication.
'use client';

import { logger } from '@/lib/Logger';
import { SpeechRecognitionProps, UseSpeechRecognitionReturn } from '@/types';
import { useCallback, useRef } from 'react';

export const useSpeechRecognition = ({
    onStart,
    onEnd,
    onError,
    onResult,
}: SpeechRecognitionProps): UseSpeechRecognitionReturn => {
    const recognition = useRef<SpeechRecognition | null>(null);
    const audioContext = useRef<AudioContext | null>(null);
    const analyser = useRef<AnalyserNode | null>(null);
    const microphone = useRef<MediaStreamAudioSourceNode | null>(null);
    const animationFrameId = useRef<number | null>(null);
    const mediaStream = useRef<MediaStream | null>(null);
    const shouldRestart = useRef(false);
    const isRestartingRef = useRef(false);

    const lastSpeechTime = useRef<number>(0);
    const restartCount = useRef<number>(0);
    const lastRestartTime = useRef<number>(0);

    const startSpeechRecognition = useCallback(async () => {
        shouldRestart.current = true;

        lastSpeechTime.current = performance.now();

        if (!recognition.current) {
            recognition.current = new (window.SpeechRecognition || window.webkitSpeechRecognition)();

            recognition.current.continuous = true;
            recognition.current.interimResults = true;

            recognition.current.onstart = () => {
                onStart();
                isRestartingRef.current = false;
                lastSpeechTime.current = performance.now();
            };

            recognition.current.onend = () => {
                onEnd();

                if (shouldRestart.current && !isRestartingRef.current) {
                    const now = performance.now();
                    const silenceDuration = now - lastSpeechTime.current;
                    const timeSinceLastRestart = now - lastRestartTime.current;

                    if (restartCount.current >= 3 && timeSinceLastRestart < 60000) {
                        setTimeout(() => {
                            restartCount.current = 0;
                        }, 10000);
                        return;
                    }

                    if (silenceDuration > 1000) {
                        restartCount.current++;
                        lastRestartTime.current = now;
                        isRestartingRef.current = true;

                        setTimeout(() => {
                            try {
                                recognition.current?.start();
                            } catch (error) {
                                isRestartingRef.current = false;
                                logger.error(
                                    `Failed to restart speech recognition after end: ${
                                        (error as Error).message
                                    }\nStack: ${(error as Error).stack}`
                                );
                            }
                        }, 500);
                    }
                }
            };

            recognition.current.onerror = (event: SpeechRecognitionErrorEvent) => {
                onError(event);

                if (shouldRestart.current && !isRestartingRef.current) {
                    const silenceDuration = performance.now() - lastSpeechTime.current;
                    if (silenceDuration > 1000) {
                        isRestartingRef.current = true;

                        const delay = event.error === 'network' ? 2000 : 1000;

                        try {
                            recognition.current?.stop();
                        } catch (stopError) {
                            logger.error(
                                `Error while stopping recognition for restart: ${
                                    (stopError as Error).message
                                }\nStack: ${(stopError as Error).stack}`
                            );
                        }

                        setTimeout(() => {
                            try {
                                recognition.current?.start();
                            } catch (error) {
                                isRestartingRef.current = false;
                                logger.error(
                                    `Failed to restart speech recognition after error: ${
                                        (error as Error).message
                                    }\nStack: ${(error as Error).stack}`
                                );
                            }
                        }, delay);
                    }
                }
            };

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

                lastSpeechTime.current = performance.now();

                onResult(finalTranscript, interimTranscript);
            };
        }

        if (!isRestartingRef.current) {
            isRestartingRef.current = true;

            setTimeout(() => {
                try {
                    recognition.current?.start();
                } catch (error) {
                    isRestartingRef.current = false;
                    logger.error(
                        `Failed to start speech recognition: ${(error as Error).message}\nStack: ${
                            (error as Error).stack
                        }`
                    );
                }
            }, 100);
        }
    }, [onStart, onEnd, onError, onResult]);

    const stopSpeechRecognition = useCallback(() => {
        shouldRestart.current = false;
        isRestartingRef.current = false;

        if (recognition.current) {
            try {
                recognition.current.stop();
            } catch (error) {
                logger.error(
                    `Error stopping recognition: ${(error as Error).message}\nStack: ${(error as Error).stack}`
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
            mediaStream.current.getTracks().forEach(track => {
                track.stop();
            });
            mediaStream.current = null;
        }

        if (audioContext.current) {
            try {
                audioContext.current.close();
            } catch (error) {
                logger.error(
                    `Error closing audio context: ${(error as Error).message}\nStack: ${(error as Error).stack}`
                );
            }
            audioContext.current = null;
        }
    }, []);

    const startAudioVisualization = useCallback(async (canvas: HTMLCanvasElement) => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true, video: false });

            const canvasCtx = canvas.getContext('2d');
            if (!canvasCtx) return;

            audioContext.current = new (window.AudioContext || window.AudioContext)();
            analyser.current = audioContext.current.createAnalyser();
            analyser.current.fftSize = 128;
            analyser.current.smoothingTimeConstant = 0.8;

            mediaStream.current = stream;
            microphone.current = audioContext.current.createMediaStreamSource(stream);
            microphone.current.connect(analyser.current);

            const bufferLength = analyser.current.frequencyBinCount;
            const dataArray = new Uint8Array(bufferLength);

            const draw = () => {
                animationFrameId.current = requestAnimationFrame(draw);
                analyser.current!.getByteFrequencyData(dataArray);

                canvasCtx.fillStyle = 'rgb(25, 25, 25)';
                canvasCtx.fillRect(0, 0, canvas.width, canvas.height);

                const barHeight = (canvas.height / bufferLength) * 1.5;
                const maxBarWidth = canvas.width * 0.8;
                let y = 0;

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
            logger.error(`Error accessing microphone: ${(err as Error).message}\nStack: ${(err as Error).stack}`);
            throw err;
        }
    }, []);

    return {
        startSpeechRecognition,
        stopSpeechRecognition,
        startAudioVisualization,
    };
};
