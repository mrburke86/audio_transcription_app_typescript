// src/stores/chatStore.ts
// Root Store Composition: Combines all slices into a single bound store for unified access while maintaining modularity.
// This file acts as the entry point, merging slice creators without logic—keeps it lightweight for easy extension (e.g., add new slices here).
import { ChatSlice, ContextSlice, KnowledgeSlice, LLMSlice, SpeechSlice, UISlice } from '@/types';
import { create } from 'zustand';
import { createJSONStorage, devtools, persist } from 'zustand/middleware';
import { loggerMiddleware } from './middleware/loggerMiddleware';
import { createChatSlice } from './slices/chatSlice';
import { createContextSlice } from './slices/contextSlice';
import { createKnowledgeSlice } from './slices/knowledgeSlice';
import { createLLMSlice } from './slices/llmSlice';
import { createSpeechSlice } from './slices/speechSlice';
import { createUISlice } from './slices/uiSlice';

type BoundStore = ChatSlice & UISlice & ContextSlice & LLMSlice & SpeechSlice & KnowledgeSlice;

export const useBoundStore = create<BoundStore>()(
    devtools(
        persist(
            loggerMiddleware((...a) => ({
                ...createChatSlice(...a),
                ...createContextSlice(...a),
                ...createKnowledgeSlice(...a),
                ...createLLMSlice(...a),
                ...createSpeechSlice(...a),
                ...createUISlice(...a),
            })),
            {
                name: 'interview_context',
                storage: createJSONStorage(() => sessionStorage),
                partialize: state => ({
                    initialContext: state.initialContext,
                }),
            }
        )
    )
);

export type StoreState = BoundStore;
