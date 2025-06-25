// src/stores/store.ts
'use client';

import { create } from 'zustand';
import { devtools, persist, subscribeWithSelector } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';

import { AppState } from '@/types/store';
import { createCallSlice, createKnowledgeSlice, createLLMSlice, createSpeechSlice, createUISlice } from './slices';

import { logger } from '@/modules/Logger';
import { performanceMiddleware } from './middlewares/performanceMiddleware';
import { notificationMiddleware } from './middlewares/notificationMiddleware'; // ✅ ADDED

logger.info('🚀 Initializing Zustand store...');

export const useAppStore = create<AppState>()(
    devtools(
        persist(
            subscribeWithSelector(
                immer(
                    notificationMiddleware(
                        // ✅ ADDED: Notification middleware
                        performanceMiddleware((set, get, store) => ({
                            // ✅ Initialize all slice state
                            ...createKnowledgeSlice(set, get, store),
                            ...createLLMSlice(set, get, store),
                            ...createSpeechSlice(set, get, store),
                            ...createCallSlice(set, get, store),
                            ...createUISlice(set, get, store),
                        }))
                    )
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
                    globalLoading: state.globalLoading,
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

                        // ✅ FIXED: Type-safe state migration without 'any'
                        interface LegacyState {
                            isLoading?: boolean;
                            loadingMessage?: string;
                            uiError?: string;
                            modals?: Record<string, { isOpen: boolean; props?: Record<string, unknown> }>;
                        }

                        const legacyState = state as AppState & LegacyState;

                        // ✅ UPDATED: Initialize new UI state structure
                        if (!state.globalModals) {
                            state.globalModals = {};
                        }

                        if (!state.globalLoading) {
                            state.globalLoading = {
                                isActive: false,
                                message: undefined,
                                source: undefined,
                            };
                        }

                        // ✅ UPDATED: Migrate old state names if they exist
                        if (legacyState.isLoading !== undefined && state.globalLoading.isActive === false) {
                            state.globalLoading.isActive = legacyState.isLoading;
                            delete legacyState.isLoading;
                        }

                        if (legacyState.loadingMessage !== undefined && !state.globalLoading.message) {
                            state.globalLoading.message = legacyState.loadingMessage;
                            delete legacyState.loadingMessage;
                        }

                        if (legacyState.uiError !== undefined && !state.globalError) {
                            state.globalError = legacyState.uiError;
                            delete legacyState.uiError;
                        }

                        if (legacyState.modals !== undefined && Object.keys(state.globalModals).length === 0) {
                            state.globalModals = legacyState.modals;
                            delete legacyState.modals;
                        }

                        // Initialize other transient state
                        state.isLoading = false; // Knowledge loading
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
                        state.error = null; // Knowledge error
                        state.currentTranscript = '';
                        state.globalError = state.globalError || null; // Preserve migrated error

                        // Initialize default progress states
                        state.indexingProgress = {
                            isIndexing: false,
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

                        // ❌ REMOVED: Don't initialize isModalOpen - using global modal system
                        // state.isModalOpen = false;

                        // Initialize notifications array
                        state.notifications = [];

                        logger.info('✅ Store rehydration completed with new UI structure');
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

// ✅ FIXED: Properly typed global store reference
declare global {
    interface GlobalThis {
        __appStore?: typeof useAppStore;
    }
}

if (typeof window !== 'undefined') {
    // ✅ ADDED: Make store available to notification middleware
    globalThis.__appStore = useAppStore;

    // Wait for next tick to ensure store is fully initialized
    queueMicrotask(() => {
        logger.info('🔍 Store initialized, checking knowledge base status...');

        const state = useAppStore.getState();

        // Only initialize knowledge base if it hasn't been done recently
        const lastIndexed = state.lastIndexedAt;
        const shouldInitialize = !lastIndexed || Date.now() - lastIndexed.getTime() > 5 * 60 * 1000; // 5 minutes

        if (shouldInitialize) {
            logger.info('🧠 Triggering knowledge base initialization...');

            // ✅ IMPROVED: Use global loading for initialization
            state.setGlobalLoading(true, 'Initializing knowledge base...', 'StoreInit');

            state
                .initializeKnowledgeBase()
                .then(() => {
                    logger.info('✅ Knowledge base initialization completed');
                    state.setGlobalLoading(false);
                })
                .catch(err => {
                    logger.error('❌ Knowledge base initialization failed:', err);
                    state.setGlobalLoading(false);
                });
        } else {
            logger.info('ℹ️ Knowledge base recently initialized, skipping auto-init');
        }
    });
}

// ✅ Development helper to access store in browser console
if (typeof window !== 'undefined' && process.env.NODE_ENV === 'development') {
    (window as Window & { __appStore: typeof useAppStore }).__appStore = useAppStore;
    logger.info('🛠️ Store available in console as __appStore');
}
