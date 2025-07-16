// // src/hooks/useChatState.ts (FIXED VERSION)
// import { Message } from '@/types';
// import { useEffect, useMemo, useState } from 'react';

// export const useChatState = (userMessages: Message[]) => {
//     // ✅ State bridge to break circular dependency between LLM provider and transcriptions
//     const [conversationHistory, setConversationHistory] = useState<Message[]>([]);

//     // ✅ Memoized update to prevent unnecessary re-renders - ONLY update when message count or last message changes
//     const memoizedUserMessages = useMemo(
//         () => userMessages,
//         [
//             userMessages.length,
//             userMessages[userMessages.length - 1]?.content,
//             userMessages[userMessages.length - 1]?.type,
//         ]
//     );

//     // ✅ Bridge the circular dependency - ONLY when messages actually change
//     useEffect(() => {
//         setConversationHistory(memoizedUserMessages);
//     }, [memoizedUserMessages]);

//     return {
//         conversationHistory,
//         messageCount: userMessages.length,
//     };
// };
