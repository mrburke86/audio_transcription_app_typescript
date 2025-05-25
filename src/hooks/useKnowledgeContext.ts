// src/hooks/useKnowledgeContext.ts
'use client';

import { useCallback } from 'react';
import { useKnowledge } from '@/contexts/KnowledgeProvider';
import { logger } from '@/modules/Logger';
// import { performanceTracker } from "@/modules/PerformanceTracker";
// import { EnhancedPerformanceOperations } from "@/global";

// // Helper function to access enhanced performance tracker
// const getEnhancedPerf = (): EnhancedPerformanceOperations | null => {
//     if (typeof window !== "undefined" && window.enhancedPerf) {
//         return window.enhancedPerf;
//     }
//     return null;
// };

interface UseKnowledgeContextReturn {
  buildContext: (userMessage: string, maxFiles?: number) => string;
  isKnowledgeReady: boolean;
  knowledgeError: string | null;
  knowledgeStats: {
    totalFiles: number;
    totalWords: number;
    totalSize: number;
  };
}

export const useKnowledgeContext = (): UseKnowledgeContextReturn => {
  const { searchRelevantFiles, isLoading: knowledgeLoading, error: knowledgeError, getTotalStats } = useKnowledge();

  const isKnowledgeReady = !knowledgeLoading && !knowledgeError;
  const knowledgeStats = getTotalStats();

  const buildContext = useCallback(
    (userMessage: string, maxFiles: number = 5): string => {
      if (!isKnowledgeReady) {
        logger.warning('[useKnowledgeContext] Knowledge base not ready');
        return 'Knowledge base is currently loading or unavailable.';
      }

      try {
        // Get relevant files based on user query
        const relevantFiles = searchRelevantFiles(userMessage, maxFiles);

        if (relevantFiles.length === 0) {
          logger.debug('[useKnowledgeContext] No relevant files found for query');
          return 'No specific knowledge context found for this query.';
        }

        // Build context string from relevant files
        const context = relevantFiles
          .map(file => {
            // Truncate very long files to prevent context overflow
            const maxContentLength = 2000;
            const content = file.content.length > maxContentLength ? `${file.content.substring(0, maxContentLength)}...` : file.content;

            return `**${file.name}**\n${content}`;
          })
          .join('\n\n---\n\n');

        logger.debug(`[useKnowledgeContext] 🔍 Built context from ${relevantFiles.length} files`);

        // Log file names for debugging
        const fileNames = relevantFiles.map(f => f.name).join(', ');
        logger.debug(`[useKnowledgeContext] Selected files: ${fileNames}`);

        return context;
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        logger.error(`[useKnowledgeContext] ❌ Error building context: ${errorMessage}`);

        return 'Error building knowledge context. Please try again.';
      }
    },
    [searchRelevantFiles, isKnowledgeReady]
  );

  return {
    buildContext,
    isKnowledgeReady,
    knowledgeError,
    knowledgeStats,
  };
};
