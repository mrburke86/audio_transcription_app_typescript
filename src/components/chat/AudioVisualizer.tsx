// src/components/chat/AudioVisualizer.tsx
import React from "react";

interface AudioVisualizerProps {
    canvasRef: React.RefObject<HTMLCanvasElement>;
}

const AudioVisualizer: React.FC<AudioVisualizerProps> = ({ canvasRef }) => (
    <div className="bg-transcription-box rounded-lg shadow p-1">
        <canvas
            ref={canvasRef}
            id="audioVisualizer"
            width="120"
            height="30"
            className="bg-gray-700 rounded"
        />
    </div>
);

export default AudioVisualizer;
