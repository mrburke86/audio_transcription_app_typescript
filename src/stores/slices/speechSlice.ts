// src/stores/slices/speechSlice.ts
import { logger } from '@/lib/Logger';
import { Message, SpeechSlice } from '@/types';
import { v4 as uuidv4 } from 'uuid';
import { StateCreator } from 'zustand';

export const createSpeechSlice: StateCreator<SpeechSlice> = set => ({
    interimTranscriptMessages: [],
    currentInterimTranscript: '',

    // Add interim transcript message
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
        logger.debug?.(`✏️ Current interim transcript updated`);
        set({ currentInterimTranscript: transcript });
    },

    // Clear interim transcripts
    clearInterimTranscripts: () => {
        logger.debug?.(`🧹 Interim transcripts cleared`);
        set({ interimTranscriptMessages: [], currentInterimTranscript: '' });
    },

    // Clear all transcripts (both interim and final)
    clearAllTranscripts: () => {
        logger.debug?.(`🧼 All transcripts (speech slice) cleared`);
        set({ interimTranscriptMessages: [], currentInterimTranscript: '' });
    },
});
