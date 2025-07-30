// src/components/chat/ChatInterface.tsx - FIX EVENT LISTENER TYPES
'use client';

import { useCleanup } from '@/hooks/useCleanup';
import React, { useEffect } from 'react';
import { ChatMessageArea, ContextInsightsArea, TopNavigationArea, VoiceControlsArea } from './areas';
import { StreamedContentProvider } from './context';

export const ChatInterface: React.FC = () => {
    const cleanup = useCleanup('ChatInterface');

    useEffect(() => {
        // ✅ PROPERLY TYPED EVENT HANDLERS
        const handleKeyboardShortcuts = (evt: Event) => {
            const event = evt as KeyboardEvent; // ✅ Type assertion
            if (event.ctrlKey && event.key === 'Enter') {
                console.log('Keyboard shortcut triggered: Ctrl+Enter');
                // Add your shortcut logic here
            }
        };

        const handleResize = (evt: Event) => {
            console.log('Window resized:', window.innerWidth, 'x', window.innerHeight);
            // Add your resize logic here
        };

        // ✅ REGISTER EVENT LISTENERS WITH AUTOMATIC CLEANUP
        cleanup.registerEventListener(window, 'keydown', handleKeyboardShortcuts, 'keyboard-shortcuts');
        cleanup.registerEventListener(window, 'resize', handleResize, 'window-resize');

        // ✅ REGISTER TIMER WITH AUTOMATIC CLEANUP
        const statusCheckTimer = setTimeout(() => {
            console.log('Status check timer executed');
        }, 30000);

        cleanup.registerTimer(statusCheckTimer, 'status-check');
    }, [cleanup]);

    return (
        <StreamedContentProvider>
            <div className="h-full w-full flex flex-col">
                <TopNavigationArea />

                <div className="flex-1 overflow-hidden" style={{ minHeight: 'calc(100vh - 110px)' }}>
                    <div className="p-4 h-full">
                        <div className="grid grid-cols-12 gap-6 h-full min-h-0 overflow-hidden">
                            <div className="col-span-6 flex-1 overflow-hidden">
                                <ChatMessageArea />
                            </div>

                            <div className="col-span-1">
                                <VoiceControlsArea />
                            </div>

                            <div className="flex w-full col-span-4 gap-y-4 h-full overflow-hidden">
                                <ContextInsightsArea />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </StreamedContentProvider>
    );
};

ChatInterface.displayName = 'ChatInterface';
