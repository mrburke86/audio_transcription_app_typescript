// src/app/chat/page.tsx

import React from 'react';
import ChatComponent from '@/components/chat/ChatComponent';

export default function ChatPage() {
    // Default role description for your knowledge-based assistant
    const defaultRoleDescription = `You are an intelligent AI assistant with access to comprehensive knowledge about ETQ, manufacturing, quality management, and sales methodologies. 

You help users by:
- Providing detailed information about ETQ's products and services
- Explaining quality management and EHS principles
- Sharing insights about manufacturing industry trends
- Assisting with MEDDPICC sales methodology
- Offering strategic guidance for C-level engagement

Use the available knowledge base to provide accurate, helpful, and contextually relevant responses. Be professional, thorough, and focus on delivering practical value to the user.`;

    return (
        <ChatComponent
            assistantId="default-knowledge-assistant" // Simple ID for logging/tracking
            roleDescription={defaultRoleDescription}
        />
    );
}
