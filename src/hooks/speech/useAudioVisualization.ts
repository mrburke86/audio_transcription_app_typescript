// src/hooks/speech/useAudioVisualization.ts - PURE AUDIO VISUALIZATION
'use client';

import { logger } from '@/lib/Logger';
import { useCallback, useEffect, useRef } from 'react';

interface AudioVisualizationOptions {
    fftSize?: number;
    smoothingTimeConstant?: number;
    barColorIntensity?: number;
    backgroundColor?: string;
}

export const useAudioVisualization = (options: AudioVisualizationOptions = {}) => {
    const {
        fftSize = 128,
        smoothingTimeConstant = 0.8,
        barColorIntensity = 50,
        backgroundColor = 'rgb(25, 25, 25)',
    } = options;

    // Audio visualization refs
    const audioContext = useRef<AudioContext | null>(null);
    const analyser = useRef<AnalyserNode | null>(null);
    const microphone = useRef<MediaStreamAudioSourceNode | null>(null);
    const animationFrameId = useRef<number | null>(null);
    const mediaStream = useRef<MediaStream | null>(null);
    const isActive = useRef<boolean>(false);

    // // ✅ ERROR HANDLING
    // const handleVisualizationError = useCallback((error: Error, context: string) => {
    //     logger.error(`Audio visualization ${context}: ${error.message}`);
    // }, []);

    // ✅ COMPREHENSIVE CLEANUP FUNCTION
    const cleanup = useCallback(() => {
        logger.info('🧹 Starting audio visualization cleanup');
        isActive.current = false;

        // Cancel animation frame
        if (animationFrameId.current) {
            cancelAnimationFrame(animationFrameId.current);
            animationFrameId.current = null;
            logger.debug('✅ Animation frame cancelled');
        }

        // Disconnect audio nodes
        if (microphone.current) {
            try {
                microphone.current.disconnect();
                microphone.current = null;
                logger.debug('✅ Microphone disconnected');
            } catch (error) {
                logger.warning('⚠️ Error disconnecting microphone:', error);
            }
        }

        // Close audio context
        if (audioContext.current && audioContext.current.state !== 'closed') {
            try {
                audioContext.current.close();
                audioContext.current = null;
                logger.debug('✅ Audio context closed');
            } catch (error) {
                logger.warning('⚠️ Error closing audio context:', error);
            }
        }

        // Stop media stream tracks
        if (mediaStream.current) {
            try {
                mediaStream.current.getTracks().forEach(track => {
                    track.stop();
                    logger.debug(`✅ Media track stopped: ${track.kind}`);
                });
                mediaStream.current = null;
            } catch (error) {
                logger.warning('⚠️ Error stopping media stream:', error);
            }
        }

        // Reset refs
        analyser.current = null;
        logger.info('✅ Audio visualization cleanup completed');
    }, []);

    // ✅ CLEANUP ON UNMOUNT
    useEffect(() => {
        return () => {
            cleanup();
        };
    }, [cleanup]);

    // ✅ CLEANUP ON VISIBILITY CHANGE
    useEffect(() => {
        const handleVisibilityChange = () => {
            if (document.hidden && isActive.current) {
                logger.info('🔄 Page hidden, pausing audio visualization');
                cleanup();
            }
        };

        document.addEventListener('visibilitychange', handleVisibilityChange);

        return () => {
            document.removeEventListener('visibilitychange', handleVisibilityChange);
        };
    }, [cleanup]);

    // ✅ START AUDIO VISUALIZATION
    const startAudioVisualization = useCallback(
        async (canvas: HTMLCanvasElement) => {
            // Cleanup any existing resources first
            cleanup();

            try {
                const stream = await navigator.mediaDevices.getUserMedia({
                    audio: true,
                    video: false,
                });

                const canvasCtx = canvas.getContext('2d');
                if (!canvasCtx) {
                    throw new Error('Could not get canvas 2D context');
                }

                // Setup audio context
                audioContext.current = new (window.AudioContext || window.AudioContext)();
                analyser.current = audioContext.current.createAnalyser();
                analyser.current.fftSize = fftSize;
                analyser.current.smoothingTimeConstant = smoothingTimeConstant;

                mediaStream.current = stream;
                microphone.current = audioContext.current.createMediaStreamSource(stream);
                microphone.current.connect(analyser.current);

                const bufferLength = analyser.current.frequencyBinCount;
                const dataArray = new Uint8Array(bufferLength);

                // Drawing function
                const draw = () => {
                    animationFrameId.current = requestAnimationFrame(draw);
                    analyser.current!.getByteFrequencyData(dataArray);

                    // Clear canvas
                    canvasCtx.fillStyle = backgroundColor;
                    canvasCtx.fillRect(0, 0, canvas.width, canvas.height);

                    // Draw bars
                    const barHeight = (canvas.height / bufferLength) * 1.5;
                    const maxBarWidth = canvas.width * 0.8;
                    const maxBars = Math.min(bufferLength, Math.floor(canvas.height / (barHeight + 1)));

                    for (let i = 0; i < maxBars; i++) {
                        const intensity = dataArray[i];
                        const barWidth = (intensity / 255) * maxBarWidth;

                        // Dynamic color based on intensity
                        canvasCtx.fillStyle = `rgb(${Math.min(intensity + barColorIntensity, 255)}, ${Math.min(intensity + barColorIntensity * 2, 255)}, 50)`;

                        const x = (canvas.width - barWidth) / 2;
                        const y = canvas.height - i * barHeight - barHeight;

                        canvasCtx.fillRect(x, y, barWidth, barHeight - 1);
                    }
                };

                draw();
                logger.info('Audio visualization started');
            } catch (error) {
                cleanup(); // Cleanup on error
                logger.error('❌ Audio visualization failed:', error);
                throw error;
            }
        },
        [fftSize, smoothingTimeConstant, barColorIntensity, backgroundColor, cleanup]
    );

    // ✅ STOP AUDIO VISUALIZATION
    const stopAudioVisualization = useCallback(() => {
        cleanup();
    }, [cleanup]);

    return {
        startAudioVisualization,
        stopAudioVisualization,
    };
};
