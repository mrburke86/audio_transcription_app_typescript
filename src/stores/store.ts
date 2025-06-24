// src/stores/store.ts
'use client';

import { create } from 'zustand';
import { devtools, persist, subscribeWithSelector } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';

import { AppState } from '@/types/store';
import { createCallSlice, createKnowledgeSlice, createLLMSlice, createSpeechSlice, createUISlice } from './slices';

import { logger } from '@/modules/Logger';
import { performanceMiddleware } from './middlewares/performanceMiddleware';

logger.info('🚀 Initializing Zustand store...');

export const useAppStore = create<AppState>()(
    devtools(
        persist(
            subscribeWithSelector(
                immer(
                    performanceMiddleware((set, get, store) => ({
                        // ✅ Initialize all slice state
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
                // ✅ Only persist essential state that should survive page refresh
                partialize: state => ({
                    // UI preferences
                    theme: state.theme,

                    // Call context (important to maintain between sessions)
                    context: state.context,

                    // Knowledge base state
                    lastIndexedAt: state.lastIndexedAt,
                    knowledgeBaseName: state.knowledgeBaseName,
                    indexedDocumentsCount: state.indexedDocumentsCount,
                    kbIsLoading: state.isLoading,
                    kbError: state.error,

                    // Conversation summary (but not full conversations - too large)
                    conversationSummary: state.conversationSummary,
                }),

                // ✅ Proper rehydration that initializes Maps and other non-serializable state
                onRehydrateStorage: () => (state, error) => {
                    if (error) {
                        logger.error('❌ Failed to rehydrate store:', error);
                        return;
                    }

                    if (state) {
                        logger.info('🔄 Rehydrating store state...');

                        // Always initialize Maps fresh on rehydration
                        state.conversations = new Map();
                        state.streamingResponses = new Map();
                        state.audioSessions = new Map();
                        state.searchResults = [];
                        state.interimTranscripts = [];

                        // Initialize other transient state
                        state.isLoading = false;
                        state.isGenerating = false;
                        state.isGeneratingResponse = false;
                        state.isGeneratingSuggestions = false;
                        state.isSummarizing = false;
                        state.llmError = null;
                        state.currentAbortController = null;
                        state.isRecording = false;
                        state.speechIsProcessing = false;
                        state.currentStreamId = null;
                        state.recognitionStatus = 'inactive';
                        state.speechError = null;
                        state.isLoading = false;
                        state.error = null;
                        state.currentTranscript = '';
                        state.isModalOpen = false;
                        state.loadingMessage = undefined;

                        // Initialize default progress states
                        state.indexingProgress = {
                            isIndexing: false, // ✅ ADDED
                            filesProcessed: 0,
                            totalFiles: 0,
                            errors: [],
                            progress: '',
                        };

                        state.conversationSuggestions = {
                            powerUpContent: '',
                            lastAnalysis: undefined,
                            analysisHistory: [],
                        };

                        state.validationErrors = {};
                        state.currentSetupStep = 'basic';
                        state.modals = {};

                        logger.info('✅ Store rehydration completed');
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

// ✅ Initialize store once when module loads (client-side only)
if (typeof window !== 'undefined') {
    // Wait for next tick to ensure store is fully initialized
    queueMicrotask(() => {
        logger.info('🔍 Store initialized, checking knowledge base status...');

        const state = useAppStore.getState();

        // Only initialize knowledge base if it hasn't been done recently
        const lastIndexed = state.lastIndexedAt;
        const shouldInitialize = !lastIndexed || Date.now() - lastIndexed.getTime() > 5 * 60 * 1000; // 5 minutes

        if (shouldInitialize) {
            logger.info('🧠 Triggering knowledge base initialization...');
            state
                .initializeKnowledgeBase()
                .then(() => logger.info('✅ Knowledge base initialization completed'))
                .catch(err => logger.error('❌ Knowledge base initialization failed:', err));
        } else {
            logger.info('ℹ️ Knowledge base recently initialized, skipping auto-init');
        }
    });
}

// ✅ Development helper to access store in browser console
if (typeof window !== 'undefined' && process.env.NODE_ENV === 'development') {
    (window as typeof window & { __appStore: typeof useAppStore }).__appStore = useAppStore;
    logger.info('🛠️ Store available in console as __appStore');
}
