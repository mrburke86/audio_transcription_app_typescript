// src\app\chat\_components\MemoizedChatMessagesBox.tsx
import React from 'react';
import { ChatMessagesBox } from './ChatMessagesBox';
// import LogBox from "./LogBox";

export const MemoizedChatMessagesBox = React.memo(ChatMessagesBox);
// export const MemoizedLogBox = React.memo(LogBox);
