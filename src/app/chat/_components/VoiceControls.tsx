// src\app\chat\_components\VoiceControls.tsx
'use client';

import type React from 'react';
import { Button, Card } from '@/components/ui';
import { Mic, Square, Trash } from 'lucide-react';

interface VoiceControlsProps {
    onStart: () => void;
    onStop: () => void;
    onClear: () => void;
    isRecognitionActive: boolean;
    canvasRef: React.RefObject<HTMLCanvasElement>;
}

export const VoiceControls: React.FC<VoiceControlsProps> = ({ onStart, onStop, onClear, isRecognitionActive, canvasRef }) => {
    return (
        <Card className="h-full flex flex-col p-3">
            {/* Header */}
            <div className="flex items-center justify-center gap-2 mb-4 w-full">
                <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center flex-shrink-0 ">
                    <Mic className="w-5 h-5 text-gray-600" />
                </div>
                {/* <h3 className="text-sm font-medium text-gray-900">Voice Controls</h3> */}
            </div>

            {/* Control Buttons */}
            <div className="flex flex-col gap-2 mb-3">
                {isRecognitionActive ? (
                    <Button
                        variant="ghost"
                        onClick={onStop}
                        className="w-full justify-center h-7 px-2 bg-red-100 hover:bg-red-200 text-red-700 text-xs"
                    >
                        <Square className="h-3 w-3" />
                    </Button>
                ) : (
                    <Button
                        variant="ghost"
                        onClick={onStart}
                        className="w-full justify-center h-7 px-2 bg-green-100 hover:bg-green-200 text-green-700 text-xs"
                    >
                        <Mic className="h-3 w-3" />
                    </Button>
                )}

                <Button
                    variant="ghost"
                    onClick={onClear}
                    className="w-full justify-center h-7 px-2 bg-yellow-100 hover:bg-yellow-200 text-yellow-700 text-xs"
                >
                    <Trash className="h-3 w-3" />
                </Button>
            </div>

            {/* Audio Visualizer */}
            <div className="flex-1 rounded-lg p-2 flex items-center justify-center min-h-0">
                <canvas
                    ref={canvasRef}
                    width={120}
                    height={600}
                    id="audioVisualizer"
                    className="rounded-lg border border-gray-700/50 shadow-lg"
                    style={{
                        background: 'linear-gradient(180deg, rgb(15, 15, 25) 0%, rgb(25, 25, 45) 100%)',
                        imageRendering: 'pixelated',
                    }}
                />
                {/* <div className="absolute inset-0 rounded-lg bg-gradient-to-t from-transparent via-transparent to-white/5 pointer-events-none" /> */}
            </div>
        </Card>
    );
};
