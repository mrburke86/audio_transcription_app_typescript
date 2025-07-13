// src/hooks/useTranscriptions.ts
'use client';
import { logger } from '@/modules/Logger';
import { formatTimestamp } from '@/utils/helpers';
import {
    useAPIReliabilityMetrics,
    useConversationMemoryMetrics,
    useStateConsistencyTracker,
} from '@/utils/performance/measurementHooks';
import { useCallback, useEffect, useState } from 'react';
import { Message } from '../types/Message';

interface UseTranscriptionsProps {
    generateResponse: any;
    streamedContent: string;
    isStreamingComplete: boolean;
    isolatedTranscriptions?: {
        interimTranscriptions: Message[];
        currentInterimTranscript: string;
        updateInterimTranscript: (transcript: string) => void;
        addInterimTranscription: (message: any) => void;
        clearInterimTranscriptions: () => void;
    };
}

export const useTranscriptions = ({
    generateResponse,
    streamedContent,
    isStreamingComplete,
    isolatedTranscriptions,
}: UseTranscriptionsProps) => {
    // ✅ CORE PERFORMANCE TRACKING
    const { trackStateUpdate, checkStateConsistency } = useStateConsistencyTracker('useTranscriptions');
    const { measureAPICall } = useAPIReliabilityMetrics();
    const { trackConversationGrowth, getConversationStats } = useConversationMemoryMetrics('useTranscriptions');

    const [interimTranscriptions, setInterimTranscriptions] = useState<Message[]>([]);
    const [currentInterimTranscript, setCurrentInterimTranscript] = useState<string>('');
    const [userMessages, setUserMessages] = useState<Message[]>([]);

    // Handle the recognition result
    const handleRecognitionResult = useCallback(
        (finalTranscript: string, interimTranscript: string) => {
            // ✅ ENHANCED: Track all state updates for race condition detection
            trackStateUpdate('finalTranscript', finalTranscript);
            trackStateUpdate('interimTranscript', interimTranscript);

            if (finalTranscript) {
                const message: Message = {
                    content: finalTranscript.trim(),
                    type: 'interim' as const,
                    timestamp: formatTimestamp(new Date()),
                };

                // ✅ ENHANCED: Track conversation memory growth
                trackConversationGrowth(`interim-${Date.now()}`, {
                    type: 'interim',
                    contentLength: message.content.length,
                    timestamp: Date.now(),
                });

                // ✅ ENHANCED: Multi-level state consistency checking
                checkStateConsistency(
                    isolatedTranscriptions?.interimTranscriptions || [],
                    interimTranscriptions,
                    'isolatedTranscriptions.interimTranscriptions',
                    'interimTranscriptions'
                );

                // Additional consistency check: current interim vs isolated
                if (isolatedTranscriptions) {
                    checkStateConsistency(
                        isolatedTranscriptions.currentInterimTranscript,
                        currentInterimTranscript,
                        'isolatedTranscriptions.currentInterimTranscript',
                        'currentInterimTranscript'
                    );
                }

                // Update both isolated and internal state
                if (isolatedTranscriptions) {
                    isolatedTranscriptions.addInterimTranscription(message);
                }
                setInterimTranscriptions((prev: Message[]) => {
                    const newState = [...prev, message];
                    // ✅ Track state update after setting
                    trackStateUpdate('interimTranscriptions', newState);
                    return newState;
                });
            }

            if (interimTranscript) {
                const trimmedTranscript = interimTranscript.trim();

                // ✅ Track interim transcript updates
                trackStateUpdate('currentInterimTranscript', trimmedTranscript);

                if (isolatedTranscriptions) {
                    isolatedTranscriptions.updateInterimTranscript(trimmedTranscript);
                }
                setCurrentInterimTranscript(trimmedTranscript);
            } else {
                // ✅ Track clearing of interim transcript
                trackStateUpdate('currentInterimTranscript', '');

                if (isolatedTranscriptions) {
                    isolatedTranscriptions.updateInterimTranscript('');
                }
                setCurrentInterimTranscript('');
            }
        },
        [isolatedTranscriptions, trackStateUpdate, checkStateConsistency, trackConversationGrowth]
    );

    const handleMove = useCallback(async () => {
        const allTranscriptions = [...interimTranscriptions.map(msg => msg.content), currentInterimTranscript]
            .join(' ')
            .trim();

        if (allTranscriptions === '') return;

        // ✅ Track user message creation
        const userMessage: Message = {
            content: allTranscriptions,
            type: 'user',
            timestamp: formatTimestamp(new Date()),
        };

        // ✅ Track conversation memory growth for user message
        trackConversationGrowth(`user-${Date.now()}`, {
            type: 'user',
            contentLength: userMessage.content.length,
            timestamp: Date.now(),
        });

        setUserMessages((prev: Message[]) => {
            const newState = [...prev, userMessage];
            trackStateUpdate('userMessages', newState);
            return newState;
        });

        try {
            // ✅ ENHANCED: Wrap API call with reliability tracking
            await measureAPICall(
                () => generateResponse(allTranscriptions),
                'Transcription-LLM-Generation',
                { timeout: 45000, retries: 1 } // 45s timeout for LLM generation
            );
        } catch (error) {
            logger.error(`Error generating response: ${(error as Error).message}`);
        }

        // ✅ Track state clearing
        trackStateUpdate('interimTranscriptions', []);
        trackStateUpdate('currentInterimTranscript', '');

        // Clear both isolated and internal state
        if (isolatedTranscriptions) {
            isolatedTranscriptions.clearInterimTranscriptions();
        }
        setInterimTranscriptions([]);
        setCurrentInterimTranscript('');
    }, [
        interimTranscriptions,
        currentInterimTranscript,
        generateResponse,
        isolatedTranscriptions,
        measureAPICall,
        trackStateUpdate,
        trackConversationGrowth,
    ]);

    const handleClear = useCallback(() => {
        // ✅ Track comprehensive state clearing
        trackStateUpdate('interimTranscriptions', []);
        trackStateUpdate('currentInterimTranscript', '');
        trackStateUpdate('userMessages', []);

        // Log conversation stats before clearing
        const stats = getConversationStats();
        console.log('📊 Transcription session stats before clear:', stats);

        // Clear both isolated and internal state
        if (isolatedTranscriptions) {
            isolatedTranscriptions.clearInterimTranscriptions();
        }
        setInterimTranscriptions([]);
        setCurrentInterimTranscript('');
        setUserMessages([]);
        logger.clearSessionLogs();
    }, [isolatedTranscriptions, trackStateUpdate, getConversationStats]);

    // ✅ ENHANCED: Track assistant message updates with memory monitoring
    useEffect(() => {
        if (isStreamingComplete && streamedContent.trim()) {
            const assistantMessage: Message = {
                content: streamedContent,
                type: 'assistant',
                timestamp: formatTimestamp(new Date()),
            };

            // Track conversation memory growth for assistant message
            trackConversationGrowth(`assistant-${Date.now()}`, {
                type: 'assistant',
                contentLength: assistantMessage.content.length,
                timestamp: Date.now(),
            });

            setUserMessages((prev: Message[]) => {
                const newState = [...prev, assistantMessage];
                trackStateUpdate('userMessages', newState);
                return newState;
            });
        }
    }, [isStreamingComplete, streamedContent, trackStateUpdate, trackConversationGrowth]);

    // ✅ NEW: Performance monitoring effect
    useEffect(() => {
        // Log conversation stats periodically for memory monitoring
        const statsInterval = setInterval(() => {
            const stats = getConversationStats();
            if (stats.messageCount > 0) {
                console.log('📊 Transcription memory stats:', {
                    messages: stats.messageCount,
                    sizeMB: stats.totalSizeMB,
                    interimCount: interimTranscriptions.length,
                });
            }
        }, 30000); // Every 30 seconds

        return () => clearInterval(statsInterval);
    }, [getConversationStats, interimTranscriptions.length]);

    return {
        interimTranscriptions,
        currentInterimTranscript,
        userMessages,
        setUserMessages,
        handleMove,
        handleClear,
        handleRecognitionResult,
        // ✅ NEW: Expose performance stats for debugging
        getTranscriptionStats: getConversationStats,
    };
};
