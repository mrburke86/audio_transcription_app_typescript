// src/stores/slices/chatSlice.ts - CONSOLIDATED CHAT SLICE
// Centralizes all message creation patterns that were duplicated across useTranscriptions, speechSlice, and original chatSlice
// Provides typed message creators for consistent ID generation and timestamp formatting

import { logger } from '@/lib/Logger';
import { StoreState } from '@/stores/chatStore';
import { ChatSlice, Message } from '@/types';
import { formatTimestamp } from '@/utils/helpers';
import { v4 as uuidv4 } from 'uuid';
import { StateCreator } from 'zustand';

// ✅ CENTRALIZED MESSAGE FACTORY
const createMessage = (content: string, type: Message['type']): Message => ({
    id: uuidv4(),
    content: content.trim(),
    type,
    timestamp: formatTimestamp(new Date()),
});

export const createChatSlice: StateCreator<StoreState, [], [], ChatSlice> = (set, get) => ({
    conversationHistory: [],

    // ✅ TYPED MESSAGE CREATORS
    addUserMessage: (content: string) => {
        if (!content.trim()) {
            logger.warning('🚫 Attempted to add empty user message');
            return;
        }

        const message = createMessage(content, 'user');
        logger.info(`👤 User message added: "${content.slice(0, 50)}${content.length > 50 ? '...' : ''}"`);

        set(state => ({
            conversationHistory: [...state.conversationHistory, message],
        }));
    },

    addAssistantMessage: (content: string) => {
        if (!content.trim()) {
            logger.warning('🚫 Attempted to add empty assistant message');
            return;
        }

        const message = createMessage(content, 'assistant');
        logger.info(`🤖 Assistant message added: ${content.length} characters`);

        set(state => ({
            conversationHistory: [...state.conversationHistory, message],
        }));
    },

    addInterimMessage: (content: string) => {
        if (!content.trim()) return; // Silent skip for interim messages

        const message = createMessage(content, 'interim');
        logger.debug(`📝 Interim message added: "${content.slice(0, 30)}..."`);

        set(state => ({
            conversationHistory: [...state.conversationHistory, message],
        }));
    },

    addSystemMessage: (content: string) => {
        const message = createMessage(content, 'assistant');
        logger.info(`⚙️ System message added`);

        set(state => ({
            conversationHistory: [...state.conversationHistory, message],
        }));
    },

    // ✅ GENERIC MESSAGE CREATOR (for custom cases)
    addMessage: (messageData: Omit<Message, 'id'>) => {
        const message: Message = {
            ...messageData,
            id: uuidv4(),
            content: messageData.content.trim(),
            timestamp: messageData.timestamp || formatTimestamp(new Date()),
        };

        logger.debug(`📨 Generic message added: ${message.type}`);

        set(state => ({
            conversationHistory: [...state.conversationHistory, message],
        }));
    },

    // ✅ BATCH OPERATIONS
    addMessages: (messagesData: Omit<Message, 'id'>[]) => {
        const messages: Message[] = messagesData.map(messageData => ({
            ...messageData,
            id: uuidv4(),
            content: messageData.content.trim(),
            timestamp: messageData.timestamp || formatTimestamp(new Date()),
        }));

        logger.info(`📦 Batch added ${messages.length} messages`);

        set(state => ({
            conversationHistory: [...state.conversationHistory, ...messages],
        }));
    },

    // ✅ MESSAGE MANAGEMENT
    removeMessage: (messageId: string) => {
        const currentHistory = get().conversationHistory;
        const messageExists = currentHistory.some(msg => msg.id === messageId);

        if (!messageExists) {
            logger.warning(`🚫 Attempted to remove non-existent message: ${messageId}`);
            return;
        }

        logger.info(`🗑️ Message removed: ${messageId}`);

        set(state => ({
            conversationHistory: state.conversationHistory.filter(msg => msg.id !== messageId),
        }));
    },

    updateMessage: (messageId: string, updates: Partial<Pick<Message, 'content' | 'type'>>) => {
        const currentHistory = get().conversationHistory;
        const messageIndex = currentHistory.findIndex(msg => msg.id === messageId);

        if (messageIndex === -1) {
            logger.warning(`🚫 Attempted to update non-existent message: ${messageId}`);
            return;
        }

        logger.info(`✏️ Message updated: ${messageId}`);

        set(state => ({
            conversationHistory: state.conversationHistory.map(msg =>
                msg.id === messageId ? { ...msg, ...updates, content: updates.content?.trim() || msg.content } : msg
            ),
        }));
    },

    clearHistory: () => {
        const currentCount = get().conversationHistory.length;
        logger.info(`🧼 Chat history cleared: ${currentCount} messages removed`);
        set({ conversationHistory: [] });
    },

    // ✅ COMPUTED SELECTORS (no re-renders, pure functions)
    getUserMessages: () => {
        return get().conversationHistory.filter(msg => msg.type === 'user');
    },

    getAssistantMessages: () => {
        return get().conversationHistory.filter(msg => msg.type === 'assistant');
    },

    getLastMessage: () => {
        const history = get().conversationHistory;
        return history.length > 0 ? history[history.length - 1] : null;
    },

    getMessageCount: () => {
        return get().conversationHistory.length;
    },

    // ✅ DEV UTILITIES
    __dev_logSliceState: () => {
        const state = get();
        const userCount = state.getUserMessages().length;
        const assistantCount = state.getAssistantMessages().length;
        const totalCount = state.getMessageCount();

        console.group('💬 Chat Slice State');
        console.log(`Total messages: ${totalCount}`);
        console.log(`User messages: ${userCount}`);
        console.log(`Assistant messages: ${assistantCount}`);
        console.log(`Recent messages:`, state.conversationHistory.slice(-3));
        console.groupEnd();
    },
});
