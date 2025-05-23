// src\global.d.ts
export interface EnhancedPerformanceOperations {
    trackMoveButtonClicked: () => void;
    trackContextPreparationStart: () => void;
    trackContextPreparationEnd: () => void;
    trackThreadOperationsStart: () => void;
    trackThreadCreated: () => void;
    trackMessageAdditionStart: () => void;
    trackMessageAdditionEnd: () => void;
    trackThreadOperationsEnd: () => void;
    trackAssistantProcessingStart: () => void;
    trackFileSearchStart: () => void;
    trackFileSearchEnd: () => void;
    trackResponseGenerationStart: () => void;
    trackFirstChunkReceived: () => void;
    trackAssistantProcessingEnd: () => void;
}

export interface PerformanceMetric {
    name: string;
    startTime: number;
    endTime?: number;
    duration?: number;
    category: "transcription" | "api" | "ui" | "system";
    details?: Record<string, string | number | boolean>;
}

declare global {
    interface Window {
        enhancedPerf?: EnhancedPerformanceOperations;
        // Keep your existing 'perf' for dev tools
        perf?: {
            clear: () => void;
            metrics: () => PerformanceMetric[]; // Replace 'any' with PerformanceTracker's metric type if available
            compare: (name1: string, name2: string) => void;
        };
    }
}

export {};
