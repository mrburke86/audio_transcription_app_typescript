// src/stores/slices/speechSlice.ts - CONSOLIDATED SPEECH SLICE
// Combines all speech-related state that was previously scattered across multiple hooks
// Eliminates useSpeechManager useState, useAudioVisualization refs, and centralizes speech state

import { logger } from '@/lib/Logger';
import { Message, SPEECH_ERROR_MESSAGES, SpeechSlice } from '@/types';
import { v4 as uuidv4 } from 'uuid';
import { StateCreator } from 'zustand';

export const createSpeechSlice: StateCreator<SpeechSlice> = (set, get) => ({
    // ✅ INITIAL STATE
    interimTranscriptMessages: [],
    currentInterimTranscript: '',
    recognitionStatus: 'inactive',
    speechErrorMessage: null,
    isVisualizationActive: false,

    // ✅ TRANSCRIPT ACTIONS
    addInterimTranscriptMessage: messageWithoutId => {
        const messageWithId: Message = {
            ...messageWithoutId,
            id: uuidv4(),
        };

        logger.debug?.(`🗣️ Interim transcript message added: ${messageWithId.content.slice(0, 30)}...`);
        set(state => ({
            interimTranscriptMessages: [...state.interimTranscriptMessages, messageWithId],
        }));
    },

    // Update current interim transcript
    updateCurrentInterimTranscript: transcript => {
        logger.debug('✏️ Current interim transcript updated');
        set({ currentInterimTranscript: transcript });
    },

    // Clear interim transcripts
    clearInterimTranscripts: () => {
        logger.debug('🧹 Interim transcripts cleared');
        set({ interimTranscriptMessages: [], currentInterimTranscript: '' });
    },

    // ✅ RECOGNITION ACTIONS
    setRecognitionStatus: status => {
        const currentStatus = get().recognitionStatus;
        if (currentStatus === status) return; // Prevent unnecessary updates

        logger.info(`🎤 Recognition status: ${currentStatus} → ${status}`);
        set({ recognitionStatus: status });

        // Clear errors when starting new session
        if (status === 'active') {
            set({ speechErrorMessage: null });
        }
    },

    setSpeechError: error => {
        const currentError = get().speechErrorMessage;
        if (currentError === error) return; // Prevent unnecessary updates

        if (error) {
            // Get user-friendly error message
            const friendlyError = SPEECH_ERROR_MESSAGES[error as keyof typeof SPEECH_ERROR_MESSAGES] || error;

            logger.error(`🚨 Speech error: ${error} → ${friendlyError}`);
            set({
                speechErrorMessage: friendlyError,
                recognitionStatus: 'error',
            });
        } else {
            logger.debug('✅ Speech error cleared');
            set({ speechErrorMessage: null });
        }
    },

    // ✅ VISUALIZATION ACTIONS
    setVisualizationActive: active => {
        const currentActive = get().isVisualizationActive;
        if (currentActive === active) return; // Prevent unnecessary updates

        logger.info(`🎨 Audio visualization: ${currentActive ? 'ON' : 'OFF'} → ${active ? 'ON' : 'OFF'}`);
        set({ isVisualizationActive: active });
    },

    // ✅ HIGH-LEVEL COMBINED ACTIONS
    startSpeechSession: () => {
        logger.info('🚀 Starting speech session');
        set({
            recognitionStatus: 'active',
            speechErrorMessage: null,
            isVisualizationActive: true,
        });
    },

    stopSpeechSession: () => {
        logger.info('⏹️ Stopping speech session');
        set({
            recognitionStatus: 'inactive',
            isVisualizationActive: false,
        });
    },

    resetSpeechState: () => {
        logger.info('🔄 Resetting all speech state');
        set({
            interimTranscriptMessages: [],
            currentInterimTranscript: '',
            recognitionStatus: 'inactive',
            speechErrorMessage: null,
            isVisualizationActive: false,
        });
    },

    // ✅ COMPUTED STATE (no re-renders, pure functions)
    isRecording: () => get().recognitionStatus === 'active',

    hasTranscriptions: () => {
        const { interimTranscriptMessages, currentInterimTranscript } = get();
        return interimTranscriptMessages.length > 0 || currentInterimTranscript.trim().length > 0;
    },

    getAllTranscriptionText: () => {
        const { interimTranscriptMessages, currentInterimTranscript } = get();
        return [...interimTranscriptMessages.map(msg => msg.content), currentInterimTranscript].join(' ').trim();
    },
});
