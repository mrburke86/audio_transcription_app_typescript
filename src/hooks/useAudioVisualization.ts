// src/hooks/useAudioVisualization.ts

import { useCallback, useRef } from 'react';
import { logger } from '@/modules/Logger';

export const useAudioVisualization = (onError: (error: { code: string; message: string }) => void) => {
    const audioContext = useRef<AudioContext | null>(null);
    const analyser = useRef<AnalyserNode | null>(null);
    const microphone = useRef<MediaStreamAudioSourceNode | null>(null);
    const animationFrameId = useRef<number | null>(null);
    const mediaStream = useRef<MediaStream | null>(null);
    const isActiveRef = useRef(false);

    const startVisualization = useCallback(
        (canvas: HTMLCanvasElement) => {
            logger.info('🎨 Starting audio visualization');

            const canvasCtx = canvas.getContext('2d');
            if (!canvasCtx) {
                onError({
                    code: 'canvas-context-failed',
                    message: 'Failed to set up audio visualization.',
                });
                return;
            }

            try {
                // Initialize audio context
                audioContext.current = new (window.AudioContext || window.AudioContext)();
                analyser.current = audioContext.current.createAnalyser();
                analyser.current.fftSize = 256;

                const bufferLength = analyser.current.frequencyBinCount;
                const dataArray = new Uint8Array(bufferLength);

                // Get user media
                navigator.mediaDevices
                    .getUserMedia({
                        audio: {
                            echoCancellation: true,
                            noiseSuppression: true,
                            autoGainControl: true,
                        },
                        video: false,
                    })
                    .then(stream => {
                        mediaStream.current = stream;
                        microphone.current = audioContext.current!.createMediaStreamSource(stream);
                        microphone.current.connect(analyser.current!);

                        isActiveRef.current = true;

                        const draw = () => {
                            if (!isActiveRef.current) return;

                            animationFrameId.current = requestAnimationFrame(draw);
                            analyser.current!.getByteFrequencyData(dataArray);

                            // Clear canvas
                            canvasCtx.fillStyle = 'rgb(25, 25, 25)';
                            canvasCtx.fillRect(0, 0, canvas.width, canvas.height);

                            // Draw frequency bars
                            const barWidth = (canvas.width / bufferLength) * 2.5;
                            let x = 0;

                            for (let i = 0; i < bufferLength && x < canvas.width; i++) {
                                const barHeight = (dataArray[i] / 255) * canvas.height * 0.6;
                                canvasCtx.fillStyle = `rgb(50, ${dataArray[i] + 100}, 50)`;
                                canvasCtx.fillRect(x, canvas.height - barHeight, barWidth, barHeight);
                                x += barWidth + 1;
                            }
                        };

                        draw();
                        logger.debug('✅ Audio visualization started');
                    })
                    .catch(_err => {
                        onError({
                            code: 'microphone-access-failed',
                            message: "Couldn't access microphone. Check permissions.",
                        });
                    });
            } catch {
                onError({
                    code: 'audio-visualization-init',
                    message: 'Failed to initialize audio visualization.',
                });
            }
        },
        [onError]
    );

    const stopVisualization = useCallback(() => {
        isActiveRef.current = false;

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
            audioContext.current.close();
            audioContext.current = null;
        }

        logger.debug('🧹 Audio visualization cleaned up');
    }, []);

    return {
        startVisualization,
        stopVisualization,
    };
};
