// src/hooks/useSpeechManager.ts
import { logger } from '@/lib/Logger';
import { useCallback, useRef } from 'react';

export const useAudioVisualization = (
    start: () => Promise<void>,
    startAudioVisualization: (canvas: HTMLCanvasElement) => void
) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const visualizationStartedRef = useRef(false);

    const handleStart = useCallback(() => {
        logger.info('🎙️ Attempting to start speech recognition...');

        return start()
            .then(() => {
                if (canvasRef.current && !visualizationStartedRef.current) {
                    logger.info('🎨 Starting audio visualization');
                    startAudioVisualization(canvasRef.current);
                    visualizationStartedRef.current = true;
                } else if (!canvasRef.current) {
                    logger.warning("⚠️ Canvas reference is null, can't start visualization");
                }
            })
            .catch(startError => {
                logger.error(`Failed to start speech recognition: ${startError.message}`);
            });
    }, [start, startAudioVisualization]);

    return {
        canvasRef,
        handleStart,
    };
};
