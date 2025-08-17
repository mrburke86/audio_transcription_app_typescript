/* eslint-disable @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-return */
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { vi } from 'vitest';

import { ChatInputArea } from './ChatInputArea';

vi.mock('@/components/chat', () => ({
    LiveTranscriptionBox: () => <div />,
}));

vi.mock('@/hooks/speech', () => ({
    useSpeechSession: () => ({ submitToChat: vi.fn().mockResolvedValue(true) }),
}));

const generateResponse = vi.fn<[], Promise<void>>().mockRejectedValue(new Error('boom'));
const setMoveClickTimestamp = vi.fn<(ts: number) => void>();
const setLlmError = vi.fn<(msg: string) => void>();

vi.mock('@/stores/chatStore', () => ({
    useBoundStore: () => ({
        interimTranscriptMessages: [],
        currentInterimTranscript: '',
        conversationHistory: [{ type: 'user', content: 'hi' }],
        generateResponse,
        setMoveClickTimestamp,
        setLlmError,
    }),
}));

describe('ChatInputArea handleMove', () => {
    it('handles generateResponse rejection', async () => {
        render(<ChatInputArea />);

        fireEvent.click(screen.getByRole('button', { name: /move/i }));

        await waitFor(() => expect(setLlmError).toHaveBeenCalledWith('boom'));
    });
});
