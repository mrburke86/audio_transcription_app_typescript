// src/components/chat/areas/ChatMessageArea.tsx
'use client';

import { KnowledgeIndicatorMini, MemoizedChatMessagesBox } from '@/components/chat';
import { Card, CardContent, CardHeader, CardTitle, Separator } from '@/components/ui';
import { useBoundStore } from '@/stores/chatStore';
import { MessageSquare } from 'lucide-react';
import React from 'react';
import { ChatInputArea } from './ChatInputArea';

export const ChatMessageArea: React.FC = () => {
    const { conversationHistory, streamedContent, isStreamingComplete, indexedDocumentsCount } = useBoundStore();

    // Filter messages for display
    const userMessages = conversationHistory.filter(msg => msg.type === 'user' || msg.type === 'assistant');
    const documentCount = indexedDocumentsCount || 0;

    return (
        <Card className="h-full relative flex flex-col overflow-hidden">
            <CardHeader className="pb-3 flex-shrink-0">
                <CardTitle className="text-lg flex items-center gap-2">
                    <MessageSquare className="h-5 w-5" />
                    Conversation
                    {documentCount > 0 && <KnowledgeIndicatorMini active={true} />}
                </CardTitle>
            </CardHeader>
            <CardContent className="flex-1 flex flex-col gap-4 min-h-0 overflow-hidden">
                <div className="flex-1 min-h-0 overflow-hidden">
                    <MemoizedChatMessagesBox
                        id="postChat"
                        messages={userMessages}
                        streamedContent={streamedContent}
                        isStreamingComplete={isStreamingComplete}
                        className="flex-1"
                    />
                </div>

                <Separator className="flex-shrink-0" />

                <ChatInputArea />
            </CardContent>
        </Card>
    );
};
