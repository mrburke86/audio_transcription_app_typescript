// src/components/TranscriptionControls.tsx
import React from "react";
import Button from "./Button";
import {
    MicrophoneIcon,
    StopIcon,
    ArrowRightIcon,
    TrashIcon,
} from "@heroicons/react/24/solid";

interface TranscriptionControlsProps {
    onStart: () => void;
    onStop: () => void;
    onMove: () => void;
    onClear: () => void;
    isRecognitionActive: boolean;
}

const TranscriptionControls: React.FC<TranscriptionControlsProps> = ({
    onStart,
    onStop,
    onMove,
    onClear,
    isRecognitionActive,
}) => {
    return (
        <div className="flex flex-wrap justify-center gap-4 mb-4">
            <Button
                onClick={onStart}
                disabled={isRecognitionActive}
                className="bg-primary text-white"
            >
                <MicrophoneIcon className="w-5 h-5" />
                Start Recognition
            </Button>
            <Button
                onClick={onStop}
                disabled={!isRecognitionActive}
                className="bg-tertiary text-white"
            >
                <StopIcon className="w-5 h-5" />
                Stop Recognition
            </Button>
            <Button onClick={onMove} className="bg-secondary text-black">
                <ArrowRightIcon className="w-5 h-5" />
                Move Transcription
            </Button>
            <Button onClick={onClear} className="bg-gray-500 text-white">
                <TrashIcon className="w-5 h-5" />
                Clear Transcription
            </Button>
        </div>
    );
};

export default TranscriptionControls;
