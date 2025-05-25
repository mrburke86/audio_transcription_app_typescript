// src/hooks/useStreamingResponse.ts
'use client';

import { useState, useRef, useCallback } from 'react';
import { logger } from '@/modules/Logger';
// import { performanceTracker } from "@/modules/PerformanceTracker";
// import {
//     usePerformance,
//     ExtendedPerformanceEntry,
// } from "@/contexts/PerformanceContext";
// import { loglog } from "@/modules/log-log";
// import { EnhancedPerformanceOperations } from "@/global";

// // Helper function to access enhanced performance tracker
// const getEnhancedPerf = (): EnhancedPerformanceOperations | null => {
//     if (typeof window !== "undefined" && window.enhancedPerf) {
//         return window.enhancedPerf;
//     }
//     return null;
// };

interface UseStreamingResponseReturn {
  streamedContent: string;
  isStreamingComplete: boolean;
  isStreaming: boolean;
  handleStreamChunk: (content: string) => void;
  resetStream: () => void;
  startStreaming: () => void;
  completeStreaming: () => void;
}

export const useStreamingResponse = (): UseStreamingResponseReturn => {
  const [streamedContent, setStreamedContent] = useState('');
  const [isStreamingComplete, setIsStreamingComplete] = useState(false);
  const [isStreaming, setIsStreaming] = useState(false);

  const streamedContentRef = useRef('');
  // const firstChunkReceivedRef = useRef(false);
  // const currentQueryIdRef = useRef<string>("");

  // const { addEntry } = usePerformance();

  const resetStream = useCallback(() => {
    setStreamedContent('');
    setIsStreamingComplete(false);
    setIsStreaming(false);
    streamedContentRef.current = '';
    // firstChunkReceivedRef.current = false;
    // currentQueryIdRef.current = "";

    // logger.debug("[useStreamingResponse] 🔄 Stream reset");
  }, []);

  const startStreaming = useCallback(() => {
    setIsStreaming(true);
    setIsStreamingComplete(false);
    // firstChunkReceivedRef.current = false;
    // currentQueryIdRef.current = queryId;

    // // 🔧 FIX: Coordinate all performance tracking
    // const enhancedPerf = getEnhancedPerf();

    // // Start enhanced tracking
    // enhancedPerf?.trackResponseGenerationStart();
    // enhancedPerf?.trackAssistantProcessingStart(); // ADD missing start mark

    // // Start standard tracking (only if not already started)
    // if (queryId) {
    //     try {
    //         // Check if timer already exists
    //         performanceTracker.startTimer(
    //             `assistant_streaming_${queryId}`,
    //             "api",
    //         );
    //     } catch {
    //         // Timer already started, ignore
    //     }
    // }

    logger.debug('[useStreamingResponse] 🚀 Started streaming');
  }, []);

  const handleStreamChunk = useCallback((content: string) => {
    if (!content) return;

    // const activeQueryId = queryId || currentQueryIdRef.current;

    // Update state
    setStreamedContent(prev => prev + content);
    streamedContentRef.current += content;

    // // Track first chunk performance
    // if (!firstChunkReceivedRef.current && activeQueryId) {
    //     const enhancedPerf = getEnhancedPerf();
    //     enhancedPerf?.trackFirstChunkReceived();

    //     performance.mark("generateResponse_firstChunk");
    //     performance.measure(
    //         `MoveToFirstChunk_duration_${activeQueryId}`,
    //         "generateResponse_start",
    //         "generateResponse_firstChunk",
    //     );

    //     const measures = performance.getEntriesByName(
    //         `MoveToFirstChunk_duration_${activeQueryId}`,
    //     );

    //     if (measures.length > 0) {
    //         const measure = measures[0];
    //         const duration = measure.duration;

    //         performanceTracker.logMilestone(
    //             `🎯 FIRST CHUNK RECEIVED in ${duration.toFixed(
    //                 2,
    //             )}ms for ${activeQueryId}`,
    //             "api",
    //         );

    //         logger.performance(
    //             `[useStreamingResponse][${activeQueryId}] Move to first chunk took ${duration.toFixed(
    //                 2,
    //             )}ms`,
    //         );

    //         loglog.performance(
    //             `Move to first chunk took ${duration.toFixed(2)}ms`,
    //             activeQueryId,
    //         );

    //         const entry: ExtendedPerformanceEntry = {
    //             name: "MoveToFirstChunk",
    //             duration: duration,
    //             startTime: measure.startTime,
    //             endTime: measure.startTime + measure.duration,
    //             queryId: activeQueryId,
    //         };
    //         addEntry(entry);
    //     }

    //     firstChunkReceivedRef.current = true;
    // }

    logger.debug(`[useStreamingResponse] 📤 Streaming chunk: ${content.length} chars (total: ${streamedContentRef.current.length})`);
  }, []);

  const completeStreaming = useCallback(() => {
    // const activeQueryId = queryId || currentQueryIdRef.current;

    setIsStreaming(false);
    setIsStreamingComplete(true);

    // // 🔧 FIX: Coordinate all performance tracking
    // const enhancedPerf = getEnhancedPerf();
    // enhancedPerf?.trackAssistantProcessingEnd();

    // // Safely end timer
    // if (activeQueryId) {
    //     try {
    //         performanceTracker.endTimer(
    //             `assistant_streaming_${activeQueryId}`,
    //         );
    //         performanceTracker.logMilestone(
    //             `Streaming completed for ${activeQueryId}`,
    //             "api",
    //         );
    //     } catch {
    //         // Timer wasn't started or already ended - that's okay
    //         logger.debug(
    //             `[useStreamingResponse] Timer assistant_streaming_${activeQueryId} not found (may have ended already)`,
    //         );
    //     }
    // }

    logger.info(`[useStreamingResponse] 🏁 Response streaming completed (${streamedContentRef.current.length} chars total)`);
  }, []);

  return {
    streamedContent,
    isStreamingComplete,
    isStreaming,
    handleStreamChunk,
    resetStream,
    startStreaming,
    completeStreaming,
  };
};
