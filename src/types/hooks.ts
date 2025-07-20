import { InitialInterviewContext } from './core';
import { StrategicSuggestions } from './state';

// LLM Hook
export interface UseLLMReturn {
    generateResponse: (userMessage: string) => Promise<void>;
    generateSuggestions: () => Promise<void>;
    isLoading: boolean;
    error: string | null;
    streamedContent: string;
    isStreamingComplete: boolean;
    conversationSummary: string;
    strategicSuggestions: StrategicSuggestions;
}

// Interview Context Hook
export interface UseInterviewContextReturn {
    // Core State
    context: InitialInterviewContext;
    isLoading: boolean;
    isContextValid: boolean;

    // Context Management
    updateContext: (context: InitialInterviewContext) => void;
    clearContext: () => void;
    refreshContext: () => void;
    resetToDefaults: () => void;

    // Navigation
    navigateToChat: () => void;
    navigateToContextCapture: () => void;

    // Form Field Manipulation
    updateField: <K extends keyof InitialInterviewContext>(field: K, value: InitialInterviewContext[K]) => void;
    toggleInArray: <K extends keyof InitialInterviewContext>(field: K, value: string) => void;
}

// Speech Recognition Hook *** PREVIOUSLY MISSED ***
export interface UseSpeechRecognitionReturn {
    startSpeechRecognition: () => Promise<void>;
    stopSpeechRecognition: () => void;
    startAudioVisualization: (canvas: HTMLCanvasElement) => void;
}

// Route Protection Hook Configuration *** PREVIOUSLY MISSED ***
export interface UseRouteProtectionOptions {
    guardedRoutePath: string;
    redirectPath: string;
    showLoading?: boolean;
    customValidation?: () => boolean;
}

// Route Protection Hook Return *** PREVIOUSLY MISSED ***
export interface UseRouteProtectionReturn {
    isAccessAllowed: boolean;
    isLoading: boolean;
    isRedirecting: boolean;
}
