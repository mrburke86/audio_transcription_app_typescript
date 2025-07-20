// src\types\utils.ts
// Generic utility types
export type Optional<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;

// Global augmentations
declare global {
    interface Window {
        webkitSpeechRecognition: typeof SpeechRecognition;
    }
}
