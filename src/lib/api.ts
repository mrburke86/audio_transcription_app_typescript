// src/lib/api.ts
// Replace complex LLM service with simple API calls

interface APIResponse<T> {
    data?: T;
    error?: string;
}

// ===== SIMPLE API CLIENT =====
class SimpleAPIClient {
    private baseURL = '/api';

    private async request<T>(endpoint: string, options: RequestInit = {}): Promise<APIResponse<T>> {
        try {
            const response = await fetch(`${this.baseURL}${endpoint}`, {
                headers: { 'Content-Type': 'application/json' },
                ...options,
            });

            if (!response.ok) {
                return { error: `API Error: ${response.status}` };
            }

            const data = await response.json();
            return { data };
        } catch (error) {
            return { error: error instanceof Error ? error.message : 'Unknown error' };
        }
    }

    // ===== STREAMING API =====
    async *streamResponse(messages: any[]): AsyncIterable<string> {
        try {
            const response = await fetch('/api/llm/generate-response', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    userMessage: messages[messages.length - 1]?.content || '',
                    callContext: {}, // Simplified
                }),
            });

            if (!response.body) throw new Error('No response body');

            const reader = response.body.getReader();
            const decoder = new TextDecoder();

            while (true) {
                const { done, value } = await reader.read();
                if (done) break;

                const chunk = decoder.decode(value, { stream: true });
                yield chunk;
            }
        } catch (error) {
            console.error('Streaming error:', error);
            yield `Error: ${error instanceof Error ? error.message : 'Unknown error'}`;
        }
    }

    // ===== KNOWLEDGE API =====
    async searchKnowledge(query: string): Promise<APIResponse<any[]>> {
        return this.request('/knowledge/search', {
            method: 'POST',
            body: JSON.stringify({ query, limit: 5 }),
        });
    }

    async indexKnowledge(): Promise<APIResponse<{ count: number }>> {
        return this.request('/knowledge/index-knowledge', {
            method: 'POST',
        });
    }
}

export const api = new SimpleAPIClient();

// ===== SIMPLE HOOKS FOR API =====

import { useAppStore } from './simplifiedStore';
import { useState } from 'react';

// Replace complex LLM slice with simple hook
export function useLLMGeneration() {
    const { addMessage, setGenerating } = useAppStore();
    const [streamedContent, setStreamedContent] = useState('');

    const generateResponse = async (userMessage: string) => {
        setGenerating(true);
        setStreamedContent('');

        // Add user message immediately
        addMessage({
            content: userMessage,
            type: 'user',
            timestamp: new Date().toISOString(),
        });

        try {
            let accumulated = '';

            for await (const chunk of api.streamResponse([{ content: userMessage }])) {
                accumulated += chunk;
                setStreamedContent(accumulated);
            }

            // Add final assistant message
            addMessage({
                content: accumulated,
                type: 'assistant',
                timestamp: new Date().toISOString(),
            });

            setStreamedContent(''); // Clear streaming content
        } catch (error) {
            console.error('Generation failed:', error);
            useAppStore.getState().setGlobalError('Failed to generate response');
        } finally {
            setGenerating(false);
        }
    };

    return {
        generateResponse,
        streamedContent,
        isGenerating: useAppStore(state => state.isGenerating),
    };
}

// Replace complex knowledge slice with simple hook
export function useKnowledgeAPI() {
    const { setIndexedDocsCount, setKnowledgeError } = useAppStore();
    const [isLoading, setIsLoading] = useState(false);

    const indexKnowledge = async () => {
        setIsLoading(true);
        setKnowledgeError(null);

        const result = await api.indexKnowledge();

        if (result.error) {
            setKnowledgeError(result.error);
        } else if (result.data) {
            setIndexedDocsCount(result.data.count);
        }

        setIsLoading(false);
    };

    const searchKnowledge = async (query: string) => {
        const result = await api.searchKnowledge(query);
        return result.data || [];
    };

    return {
        indexKnowledge,
        searchKnowledge,
        isLoading,
        indexedDocsCount: useAppStore(state => state.indexedDocsCount),
        error: useAppStore(state => state.knowledgeError),
    };
}

// ===== SIMPLE LOGGING (NO EXTERNAL DEPENDENCIES) =====

// Minimal logging - just use console directly
const isDev = process.env.NODE_ENV === 'development';

const log = {
    info: (message: string) => isDev && console.log(`ℹ️ ${message}`),
    error: (message: string, error?: any) => console.error(`❌ ${message}`, error),
    debug: (message: string) => isDev && console.debug(`🔍 ${message}`),
};
