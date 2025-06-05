// src\stores\store.ts
import { create } from 'zustand';
import { devtools, persist, subscribeWithSelector } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';

import { AppState } from '@/types/store';
import { createKnowledgeSlice, createLLMSlice, createSpeechSlice, createInterviewSlice, createUISlice } from './slices';

import { logger } from '@/modules/Logger'; //
import { performanceMiddleware } from './middlewares/performanceMiddleware';

logger.info('🚀 Initializing Zustand store (User-Provided Version)...');

// Create the main store with all middleware
export const useAppStore = create<AppState>()(
    devtools(
        persist(
            subscribeWithSelector(
                performanceMiddleware(
                    // Integrate performanceMiddleware
                    immer((...a) => ({
                        ...createKnowledgeSlice(...a), //
                        ...createLLMSlice(...a), //
                        ...createSpeechSlice(...a), //
                        ...createInterviewSlice(...a), //
                        ...createUISlice(...a), //
                    }))
                )
            ),
            {
                name: 'audio-transcription-app',
                partialize: state => ({
                    theme: state.theme,
                    context: state.context,
                    lastIndexedAt: state.lastIndexedAt,
                    knowledgeBaseName: state.knowledgeBaseName,
                    indexedDocumentsCount: state.indexedDocumentsCount,
                    conversations: Array.from(state.conversations.entries()),
                    // Consider persisting conversationSummary and analysisHistory from llmSlice if needed
                    // conversationSummary: state.conversationSummary,
                    // analysisHistory: state.conversationSuggestions.analysisHistory,
                }),
                // Restore Maps from arrays on rehydration
                onRehydrateStorage: () => (state: AppState | undefined, error) => {
                    if (error) {
                        logger.error('Error rehydrating state:', error);
                        return;
                    }
                    if (state) {
                        // Ensure Maps are correctly rehydrated
                        state.conversations = new Map(state.conversations as any); // Rehydrate

                        // Initialize transient states not meant for persistence
                        state.streamingResponses = new Map();
                        state.audioSessions = new Map();
                        // Initialize other non-persisted parts of slices as new Maps or defaults
                        if (state.llmSlice) {
                            // Example if llmSlice had its own maps not covered
                            // state.llmSlice.someOtherMap = new Map();
                        }
                    }
                },
            }
        ),
        {
            name: 'AudioTranscriptionStore',
            enabled: process.env.NODE_ENV === 'development', // Only enable devtools in development
        }
    )
);

// Initialize the knowledge base when the store is created
logger.info('Attempting to initialize knowledge base from store setup...');
useAppStore
    .getState()
    .initializeKnowledgeBase()
    .then(() => logger.info('✅ Knowledge base initialization successfully triggered from store setup.'))
    .catch(err => logger.error('❌ Error triggering knowledge base initialization from store setup:', err));
