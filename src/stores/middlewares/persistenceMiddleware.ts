// src\stores\middlewares\persistenceMiddleware.ts
import { PersistOptions } from 'zustand/middleware';
import { AppState } from '@/types/store';

export const createPersistenceConfig = (): PersistOptions<AppState, Partial<AppState>> => ({
    name: 'audio-transcription-app',
    partialize: (state): Partial<AppState> => ({
        // Only persist essential user preferences and context
        theme: state.theme,
        context: state.context,
        lastIndexedAt: state.lastIndexedAt,
        knowledgeBaseName: state.knowledgeBaseName,
        indexedDocumentsCount: state.indexedDocumentsCount,
        conversationSummary: state.conversationSummary,
        // Convert Maps to arrays for JSON serialization
        conversations: Array.from(state.conversations.entries()) as any,
    }),
    onRehydrateStorage: () => rawState => {
        const state = rawState ?? undefined;
        if (!state) return;
        // Restore Maps from persisted arrays
        if (state?.conversations) {
            state.conversations = new Map(state.conversations);
        }
        // Initialize non-persisted state
        if (!state.streamingResponses) {
            state.streamingResponses = new Map();
        }
        if (!state.audioSessions) {
            state.audioSessions = new Map();
        }
        if (!state.notifications) {
            state.notifications = [];
        }
        if (!state.modals) {
            state.modals = {};
        }
    },
});
