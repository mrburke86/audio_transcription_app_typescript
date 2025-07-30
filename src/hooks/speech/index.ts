// src/hooks/speech/index.ts
export { useAudioVisualization } from './useAudioVisualization';
export { useBrowserSpeechRecognition } from './useBrowserSpeechRecognition';
export { useSpeechAPI } from './useSpeechAPI';
export { useSpeechSession } from './useSpeechSession';

// Re-export types if needed
export type { SpeechAPICallbacks, SpeechAPIState } from './useSpeechAPI';
export type { SpeechSessionOptions } from './useSpeechSession';
