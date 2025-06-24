import { StateCreator } from 'zustand';
import { AppState, SpeechSlice } from '@/types/store';
import { logger } from '@/modules';
import { Message } from '@/types';

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
        try {
            // Clear any previous errors
            set({ speechError: null });

            // Check if already recording
            const currentState = get();
            if (currentState.isRecording) {
                logger.warning('[SpeechSlice] Already recording, ignoring start request');
                return;
            }

            logger.info('[SpeechSlice] 🎙️ Starting speech recognition...');

            // ✅ Request microphone access (needed for audio visualization)
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });

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

                // ✅ Use existing handleRecognitionResult method
                get().handleRecognitionResult(finalTranscript.trim(), interimTranscript.trim());
            };

            recognition.onerror = event => {
                logger.error('[SpeechSlice] Recognition error:', event.error);

                set({
                    speechError: `Speech recognition error: ${event.error}`,
                    isRecording: false,
                    recognitionStatus: 'error',
                });

                // ✅ Cleanup on error
                get()._cleanup();

                // ✅ Notify UI about the error
                const state = get();
                if (state.addNotification) {
                    state.addNotification({
                        type: 'error',
                        message: `Speech recognition error: ${event.error}`,
                        duration: 5000,
                    });
                }
            };

            recognition.onend = () => {
                logger.info('[SpeechSlice] Recognition ended');
                set({
                    isRecording: false,
                    recognitionStatus: 'inactive',
                });

                // ✅ Cleanup when recognition ends
                get()._cleanup();
            };

            // ✅ Store references for cleanup
            set({
                _recognition: recognition,
                _mediaStream: stream,
                isRecording: true,
                recognitionStatus: 'active',
            });

            // ✅ Start recognition
            recognition.start();

            logger.info('[SpeechSlice] ✅ Speech recognition started successfully');

            // const mediaRecorder = new MediaRecorder(stream, {
            //     mimeType: 'audio/webm;codecs=opus',
            // });

            // const audioChunks: Blob[] = [];

            // mediaRecorder.ondataavailable = event => {
            //     if (event.data.size > 0) {
            //         audioChunks.push(event.data);
            //     }
            // };

            // mediaRecorder.onstop = () => {
            //     const audioBlob = new Blob(audioChunks, { type: 'audio/webm' });
            //     const sessionId = Date.now().toString();

            //     set(state => ({
            //         audioSessions: new Map(state.audioSessions).set(sessionId, {
            //             id: sessionId,
            //             audioBlob,
            //             processedAt: new Date(),
            //         }),
            //         isRecording: false,
            //     }));

            //     // Automatically process the audio
            //     get().processAudioSession(sessionId);
            // };

            // mediaRecorder.start();

            // set({
            //     isRecording: true,
            //     recognitionStatus: 'active',
            // });

            // Store mediaRecorder reference for stopping
            // In a real implementation, you'd store this in the state

            logger.info('Speech recognition state updated to active');
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Failed to start recording';

            logger.error('[SpeechSlice] ❌ Start recording failed:', error);

            set({
                speechError: errorMessage,
                isRecording: false,
                recognitionStatus: 'error',
            });

            // ✅ Cleanup on error
            get()._cleanup();

            // ✅ Notify UI about the error
            const state = get();
            if (state.addNotification) {
                state.addNotification({
                    type: 'error',
                    message: `Recording failed: ${errorMessage}`,
                    duration: 5000,
                });
            }
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

    // /**
    //  * 📡 Processes an audio blob from a session via API
    //  * Adds transcription and confidence back to state
    //  */
    // processAudioSession: async (sessionId: string) => {
    //     const audioSession = get().audioSessions.get(sessionId);

    //     if (!audioSession?.audioBlob) {
    //         get().addNotification({
    //             type: 'warning',
    //             message: 'No audio data to process',
    //             duration: 3000,
    //         });
    //         logger.debug('processAudioSession called but not needed with Web Speech Recognition');
    //         return '';
    //     }

    //     set({ speechIsProcessing: true });

    //     try {
    //         // Create form data for audio transcription
    //         const formData = new FormData();
    //         formData.append('audio', audioSession.audioBlob, 'recording.webm');

    //         const response = await fetch('/api/transcribe', {
    //             method: 'POST',
    //             body: formData,
    //         });

    //         if (!response.ok) {
    //             throw new Error(`Transcription failed: ${response.statusText}`);
    //         }

    //         const { text, confidence } = await response.json();

    //         // Update audio session with transcription result
    //         set(state => ({
    //             audioSessions: new Map(state.audioSessions).set(sessionId, {
    //                 ...audioSession,
    //                 transcription: text,
    //                 confidence,
    //             }),
    //             speechIsProcessing: false,
    //         }));

    //         get().addNotification({
    //             type: 'success',
    //             message: `Transcription complete: "${text.substring(0, 50)}${text.length > 50 ? '...' : ''}"`,
    //             duration: 5000,
    //         });

    //         logger.info(`Audio transcribed: ${text.length} characters, confidence: ${confidence}`);

    //         return text;
    //     } catch (error) {
    //         const errorMessage = error instanceof Error ? error.message : 'Transcription failed';

    //         set({
    //             speechIsProcessing: false,
    //             speechError: errorMessage,
    //         });

    //         get().addNotification({
    //             type: 'error',
    //             message: `Transcription failed: ${errorMessage}`,
    //             duration: 8000,
    //         });

    //         logger.error('Audio processing failed:', error);
    //         return '';
    //     }
    // },

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
