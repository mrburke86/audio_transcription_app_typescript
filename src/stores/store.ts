// src/stores/store.ts
'use client';
import { create } from 'zustand';
import { devtools, persist, subscribeWithSelector } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';

import { AppState } from '@/types/store';
import { createCallSlice, createKnowledgeSlice, createLLMSlice, createSpeechSlice, createUISlice } from './slices';

import { logger } from '@/modules/Logger';
import { performanceMiddleware } from './middlewares/performanceMiddleware';

logger.info('🚀 Initializing Zustand store (User-Provided Version)...');

// ✅ FIXED: Proper middleware typing for immer integration
export const useAppStore = create<AppState>()(
    devtools(
        persist(
            subscribeWithSelector(
                immer(
                    // performanceMiddleware(
                    performanceMiddleware((set, get, store) => ({
                        // immer<AppState>((set, get, store) => ({
                        ...createKnowledgeSlice(set, get, store),
                        ...createLLMSlice(set, get, store),
                        ...createSpeechSlice(set, get, store),
                        ...createCallSlice(set, get, store),
                        ...createUISlice(set, get, store),
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
                // ✅ FIXED: Proper type safety and removed invalid property access
                onRehydrateStorage: () => (state: AppState | undefined, error) => {
                    if (error) {
                        logger.error('Error rehydrating state:', error);
                        return;
                    }
                    if (state) {
                        // ✅ Added proper type checking and conversion
                        if (Array.isArray(state.conversations)) {
                            state.conversations = new Map(state.conversations as Array<[string, unknown]>);
                        } else if (!(state.conversations instanceof Map)) {
                            state.conversations = new Map();
                        }

                        // Initialize transient states not meant for persistence
                        state.streamingResponses = new Map();
                        state.audioSessions = new Map();

                        // ✅ REMOVED: Invalid llmSlice property access
                        // The slices are merged into the main state, not nested objects
                        logger.info('✅ State rehydrated successfully');
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
