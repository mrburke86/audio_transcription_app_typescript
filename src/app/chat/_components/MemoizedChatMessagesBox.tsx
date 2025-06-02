// src\app\chat\_components\MemoizedChatMessagesBox.tsx
import React from 'react';
import { ChatMessagesBox } from './ChatMessagesBox';

export const MemoizedChatMessagesBox = React.memo(ChatMessagesBox);
