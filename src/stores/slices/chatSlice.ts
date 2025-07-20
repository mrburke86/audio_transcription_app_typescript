// src/stores/slices/chatSlice.ts
// Chat Slice: Manages core conversation state, including message history and related actions.
// This slice focuses on persistent chat data (e.g., user/assistant messages), separating it from transient UI or LLM processing to allow independent updates and easier testing of conversation flow.
import { logger } from '@/lib/Logger';
import { StoreState } from '@/stores/chatStore';
import { Message } from '@/types';
import { v4 as uuidv4 } from 'uuid';
import { StateCreator } from 'zustand';

export interface ChatSlice {
    conversationHistory: Message[];
    addMessage: (message: Message) => void;
    clearHistory: () => void;
}

export const createChatSlice: StateCreator<StoreState, [], [], ChatSlice> = (set, get) => ({
    conversationHistory: [],

    // Add a new message to the conversation history
    addMessage: message => {
        const messageWithId: Message = {
            ...message,
            id: uuidv4(),
        };
        set(state => ({
            conversationHistory: [...state.conversationHistory, messageWithId],
        }));
    },

    // Clear the entire conversation history
    clearHistory: () => {
        logger.info('[🧼 Chat] Conversation history cleared');
        set({ conversationHistory: [] });
    },

    // Dev utility to log current slice state
    __dev_logSliceState: () => {
        const { conversationHistory } = get();
        logger.debug('[🧪 DEV] ChatSlice State Snapshot', {
            totalMessages: conversationHistory.length,
            lastMessage: conversationHistory[conversationHistory.length - 1],
        });
    },
});
