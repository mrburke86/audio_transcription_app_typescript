// src/components/chat/AudioVisualizer.tsx
import React from 'react';

interface AudioVisualizerProps {
    canvasRef: React.RefObject<HTMLCanvasElement>;
}

const AudioVisualizer: React.FC<AudioVisualizerProps> = ({ canvasRef }) => (
    <div className="bg-muted rounded-lg shadow p-1">
        <canvas
            ref={canvasRef}
            id="audioVisualizer"
            width="400" // Increased width
            height="100" // Increased height
            className="bg-background rounded"
        />
    </div>
);

export default AudioVisualizer;
