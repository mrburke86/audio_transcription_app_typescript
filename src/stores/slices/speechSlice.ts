import { StateCreator } from 'zustand';
import { AppState, SpeechState } from '@/types/store';
import { logger } from '@/modules';

export const createSpeechSlice: StateCreator<AppState, [], [], SpeechState> = (set, get) => ({
    isRecording: false,
    isProcessing: false,
    audioData: null,
    transcriptionResults: new Map(),
    recognitionStatus: 'inactive',
    error: null,

    startRecording: async () => {
        try {
            set({ error: null });

            // Request microphone permission
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });

            const mediaRecorder = new MediaRecorder(stream, {
                mimeType: 'audio/webm;codecs=opus',
            });

            const audioChunks: Blob[] = [];

            mediaRecorder.ondataavailable = event => {
                if (event.data.size > 0) {
                    audioChunks.push(event.data);
                }
            };

            mediaRecorder.onstop = () => {
                const audioBlob = new Blob(audioChunks, { type: 'audio/webm' });
                set({ audioData: audioBlob, isRecording: false });

                // Automatically process the audio
                get().processAudio();
            };

            mediaRecorder.start();

            set({
                isRecording: true,
                recognitionStatus: 'active',
                audioData: null,
            });

            // Store mediaRecorder reference for stopping
            // In a real implementation, you'd store this in the state

            logger.info('Started audio recording');
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Failed to start recording';

            set({
                error: errorMessage,
                isRecording: false,
                recognitionStatus: 'error',
            });

            get().addNotification({
                type: 'error',
                message: `Recording failed: ${errorMessage}`,
                duration: 5000,
            });

            logger.error('Failed to start recording:', error);
        }
    },

    stopRecording: () => {
        // Stop the media recorder
        // This would need access to the MediaRecorder instance

        set({
            isRecording: false,
            recognitionStatus: 'inactive',
        });

        logger.info('Stopped audio recording');
    },

    processAudio: async () => {
        const { audioData } = get();

        if (!audioData) {
            get().addNotification({
                type: 'warning',
                message: 'No audio data to process',
                duration: 3000,
            });
            return '';
        }

        set({ isProcessing: true });

        try {
            // Create form data for audio transcription
            const formData = new FormData();
            formData.append('audio', audioData, 'recording.webm');

            const response = await fetch('/api/transcribe', {
                method: 'POST',
                body: formData,
            });

            if (!response.ok) {
                throw new Error(`Transcription failed: ${response.statusText}`);
            }

            const { text, confidence } = await response.json();

            // Store transcription result
            const resultId = Date.now().toString();
            set(state => ({
                transcriptionResults: new Map(state.transcriptionResults).set(resultId, text),
                isProcessing: false,
            }));

            get().addNotification({
                type: 'success',
                message: `Transcription complete: "${text.substring(0, 50)}${text.length > 50 ? '...' : ''}"`,
                duration: 5000,
            });

            logger.info(`Audio transcribed: ${text.length} characters, confidence: ${confidence}`);

            return text;
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Transcription failed';

            set({
                isProcessing: false,
                error: errorMessage,
            });

            get().addNotification({
                type: 'error',
                message: `Transcription failed: ${errorMessage}`,
                duration: 8000,
            });

            logger.error('Audio processing failed:', error);
            return '';
        }
    },

    clearError: () => {
        set({ error: null });
    },
});
