// src/components/chat/context/StreamedContentContext.ts - Granular context for streaming (new file)
import { useBoundStore } from '@/stores/chatStore';
import { createContext, useContext } from 'react';

const StreamedContentContext = createContext<{ streamedContent: string; isStreamingComplete: boolean } | null>(null);

export const StreamedContentProvider = ({ children }: { children: React.ReactNode }) => {
    const { streamedContent, isStreamingComplete } = useBoundStore();
    return (
        <StreamedContentContext.Provider value={{ streamedContent, isStreamingComplete }}>
            {children}
        </StreamedContentContext.Provider>
    );
};

export const useStreamedContent = () => {
    const context = useContext(StreamedContentContext);
    if (!context) throw new Error('useStreamedContent must be inside Provider');
    return context;
};
