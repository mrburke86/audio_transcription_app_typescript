import { StateCreator } from 'zustand';
import { AppState, SpeechSlice } from '@/types/store';
import { logger } from '@/modules';
import { Message } from '@/types';
import { enhancedLogger } from '@/modules/EnhancedLogger';
import { errorHandler } from '@/utils/enhancedErrorHandler';

/**
 * 🎙️ Speech Slice — Manages audio capture, real-time speech recognition, and transcription workflows
 *
 * ✅ Responsibilities:
 * - Record audio via MediaRecorder API (WebM/Opus)
 * - Maintain session metadata and blobs
 * - Automatically transcribe via `/api/transcribe`
 * - Handle real-time interim/final recognition updates
 * - Track recording, processing, and error states
 * - Store transcript results with confidence scoring
 */

export const createSpeechSlice: StateCreator<AppState, [], [], SpeechSlice> = (set, get) => ({
    // ✅ Enhanced state to track recognition instance
    isRecording: false,
    speechIsProcessing: false,
    recognitionStatus: 'inactive',
    speechError: null,
    audioSessions: new Map(),
    currentTranscript: '',
    interimTranscripts: [],

    // ✅ Added: Internal recognition instance management
    _recognition: null as SpeechRecognition | null,
    _mediaStream: null as MediaStream | null,

    /**
     * ✅ COMPLETELY REFACTORED: Now manages SpeechRecognition instead of MediaRecorder
     * This consolidates all speech logic into the slice where it belongs
     */
    startRecording: async () => {
        const context = errorHandler.createContext('startRecording', {
            slice: 'speech',
            component: 'SpeechSlice',
        });

        try {
            // Clear any previous errors
            set({ speechError: null });

            // Check if already recording
            const currentState = get();
            if (currentState.isRecording) {
                enhancedLogger.slice('warning', 'Already recording, ignoring start request');
                return;
            }

            enhancedLogger.slice('info', 'Starting speech recognition...');

            // ✅ Request microphone access (needed for audio visualization)
            const stream = await errorHandler.withRetry(
                () => navigator.mediaDevices.getUserMedia({ audio: true }),
                { ...context, operation: 'getUserMedia' },
                { maxAttempts: 2, baseDelay: 500 }
            );

            // ✅ Initialize Web Speech API
            const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
            if (!SpeechRecognition) {
                throw new Error('Speech recognition not supported in this browser');
            }

            const recognition = new SpeechRecognition();
            recognition.continuous = true;
            recognition.interimResults = true;
            recognition.lang = 'en-US';

            // ✅ Set up event handlers within the slice
            recognition.onresult = event => {
                try {
                    let finalTranscript = '';
                    let interimTranscript = '';

                    for (let i = event.resultIndex; i < event.results.length; i++) {
                        const transcript = event.results[i][0].transcript;
                        if (event.results[i].isFinal) {
                            finalTranscript += transcript + ' ';
                        } else {
                            interimTranscript += transcript;
                        }
                    }

                    get().handleRecognitionResult(finalTranscript.trim(), interimTranscript.trim());
                } catch (error) {
                    errorHandler.handleError(error, {
                        ...context,
                        operation: 'recognition.onresult',
                    });
                }
            };

            recognition.onerror = event => {
                const errorMessage = `Speech recognition error: ${event.error}`;

                enhancedLogger.slice('error', errorMessage, {
                    errorType: event.error,
                    timestamp: new Date().toISOString(),
                });

                set({
                    speechError: errorMessage,
                    isRecording: false,
                    recognitionStatus: 'error',
                });

                get()._cleanup();
            };

            recognition.onend = () => {
                enhancedLogger.slice('info', 'Recognition ended');
                set({
                    isRecording: false,
                    recognitionStatus: 'inactive',
                });
                get()._cleanup();
            };

            // ✅ Store references for cleanup
            set({
                _recognition: recognition,
                _mediaStream: stream,
                isRecording: true,
                recognitionStatus: 'active',
            });

            recognition.start();

            enhancedLogger.slice('info', 'Speech recognition started successfully');
        } catch (error) {
            const enhancedError = errorHandler.handleError(error, context, {
                rethrow: false,
                notify: true,
            });

            set({
                speechError: enhancedError.message,
                isRecording: false,
                recognitionStatus: 'error',
            });

            get()._cleanup();
        }
    },

    /**
     * ✅ ENHANCED: Now properly stops SpeechRecognition and cleans up resources
     */
    stopRecording: () => {
        logger.info('[SpeechSlice] ⏹️ Stopping speech recognition...');

        const currentState = get();

        // ✅ Stop recognition if it exists
        if (currentState._recognition) {
            currentState._recognition.stop();
        }

        // ✅ Update state immediately
        set({
            isRecording: false,
            recognitionStatus: 'inactive',
        });

        // ✅ Cleanup resources
        get()._cleanup();

        logger.info('[SpeechSlice] ✅ Speech recognition stopped');
    },

    // ✅ NEW: Internal cleanup method to ensure proper resource disposal
    _cleanup: () => {
        const currentState = get();

        // Stop media stream tracks
        if (currentState._mediaStream) {
            currentState._mediaStream.getTracks().forEach(track => {
                track.stop();
                logger.debug('[SpeechSlice] 🧹 Stopped media track');
            });
        }

        // Clear references
        set({
            _recognition: null,
            _mediaStream: null,
        });

        logger.debug('[SpeechSlice] 🧹 Cleanup completed');
    },

    /**
     * ✅ NEW: Getter for media stream (needed for audio visualization)
     * This allows the component to access the stream for visualization without managing it
     */
    getMediaStream: () => {
        return get()._mediaStream;
    },

    /**
     * 🧹 Clears all audio sessions and transcripts from state
     */
    clearTranscripts: () => {
        set({
            currentTranscript: '',
            interimTranscripts: [],
            audioSessions: new Map(),
        });
        logger.info('Transcripts and audio sessions cleared');
    },

    /**
     * 🗣️ Updates interim + final transcripts based on recognition results
     */
    handleRecognitionResult: (finalTranscript: string, interimTranscript: string) => {
        if (finalTranscript) {
            const newMessage: Message = {
                content: finalTranscript.trim(),
                type: 'interim',
                timestamp: new Date().toISOString(),
            };

            set(state => ({
                interimTranscripts: [...state.interimTranscripts, newMessage],
                currentTranscript: '',
            }));

            logger.debug(`[SpeechSlice] Final transcript added: "${finalTranscript}"`);
        }

        if (interimTranscript) {
            set({ currentTranscript: interimTranscript.trim() });
        } else {
            set({ currentTranscript: '' });
        }
    },

    /**
     * ❌ Clears error from state
     */
    clearError: () => {
        set({ speechError: null });
    },
});
