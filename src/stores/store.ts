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
                // Simplified partialize - don't persist Maps
                partialize: state => ({
                    theme: state.theme,
                    context: state.context,
                    lastIndexedAt: state.lastIndexedAt,
                    knowledgeBaseName: state.knowledgeBaseName,
                    indexedDocumentsCount: state.indexedDocumentsCount,
                }),
                // Simplified rehydration
                onRehydrateStorage: () => state => {
                    if (state) {
                        // Always initialize Maps fresh
                        state.conversations = new Map();
                        state.streamingResponses = new Map();
                        state.audioSessions = new Map();
                    }
                },
            }
        ),
        {
            name: 'AudioTranscriptionStore',
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
