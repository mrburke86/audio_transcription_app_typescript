// src/stores/store.ts
'use client';

import { create } from 'zustand';
import { devtools, persist, subscribeWithSelector } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';

import { AppState, Conversation } from '@/types/store';
import { createCallSlice, createKnowledgeSlice, createLLMSlice, createSpeechSlice, createUISlice } from './slices';

import { logger } from '@/modules/Logger';
import { performanceMiddleware } from './middlewares/performanceMiddleware';

logger.info('🚀 Initializing Zustand store (User-Provided Version)...');

export const useAppStore = create<AppState>()(
    devtools(
        persist(
            subscribeWithSelector(
                immer(
                    performanceMiddleware((set, get, store) => ({
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
                    // context: state.context,
                    lastIndexedAt: state.lastIndexedAt,
                    knowledgeBaseName: state.knowledgeBaseName,
                    indexedDocumentsCount: state.indexedDocumentsCount,
                    conversations: Array.from(state.conversations.entries()),
                }),
                onRehydrateStorage: () => (state: AppState | undefined, error) => {
                    if (error) {
                        logger.error('❌ Error rehydrating state:', error);
                        return;
                    }
                    if (state) {
                        if (Array.isArray(state.conversations)) {
                            state.conversations = new Map(state.conversations as Array<[string, Conversation]>);
                        } else if (!(state.conversations instanceof Map)) {
                            state.conversations = new Map<string, Conversation>();
                        }

                        state.streamingResponses = new Map();
                        state.audioSessions = new Map();

                        logger.info('✅ State rehydrated successfully');
                    }
                },
            }
        ),
        {
            name: 'AudioTranscriptionStore',
            enabled: process.env.NODE_ENV === 'development',
        }
    )
);

// // 🧠 Client-only knowledge base init
// if (typeof window !== 'undefined') {
//     queueMicrotask(() => {
//         logger.info('🧠 Attempting to initialize knowledge base from store setup...');
//         useAppStore
//             .getState()
//             .initializeKnowledgeBase()
//             .then(() => logger.info('✅ Knowledge base initialization triggered.'))
//             .catch(err => logger.error('❌ Error initializing knowledge base from store setup:', err));
//     });
// }
