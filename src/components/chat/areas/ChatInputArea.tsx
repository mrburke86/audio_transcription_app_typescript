// src/components/chat/areas/ChatInputArea.tsx
'use client';

import { LiveTranscriptionBox } from '@/components/chat';
import { Button } from '@/components/ui';
import { useSpeechSession } from '@/hooks/speech';
import { useBoundStore } from '@/stores/chatStore';
import { ArrowRight } from 'lucide-react';
import React from 'react';

const MOVE_BUTTON_STYLES =
    'inline-flex items-center justify-center whitespace-nowrap rounded-md text-xs font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-blue-500 text-white hover:bg-blue-600 h-8 px-2 py-1 mt-2 gap-1.5 self-end';

export const ChatInputArea: React.FC = () => {
    const {
        interimTranscriptMessages,
        currentInterimTranscript,
        conversationHistory,
        generateResponse,
        setMoveClickTimestamp,
    } = useBoundStore();

    const { submitToChat } = useSpeechSession();

    const handleMove = async () => {
        setMoveClickTimestamp(Date.now());

        // ✅ EXPLICIT LOGIC - Clear and debuggable
        const success = await submitToChat();

        if (success) {
            const lastUserMessage = conversationHistory.filter(m => m.type === 'user').pop();
            if (lastUserMessage) {
                generateResponse(lastUserMessage.content);
            }
        }
    };

    return (
        <div
            id="chat-input"
            className="flex flex-col p-3 md:p-4 border-[1px] border-gray-800 rounded-lg shadow-none max-h-52 overflow-y-auto bg-background flex-shrink-0"
        >
            <LiveTranscriptionBox
                id="preChat"
                interimTranscriptions={interimTranscriptMessages || []}
                currentInterimTranscript={currentInterimTranscript || ''}
                className="flex-1"
            />

            <Button variant="move" onClick={handleMove} className={MOVE_BUTTON_STYLES}>
                <ArrowRight className="mr-1 h-4 w-4" />
                Move
            </Button>
        </div>
    );
};
