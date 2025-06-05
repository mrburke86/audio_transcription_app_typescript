//
'use client';
import { useAppStore } from '../store';
import { useShallow } from 'zustand/react/shallow';

// Dedicated hook for knowledge base operations
// Replaces your KnowledgeProvider useKnowledge hook
export const useKnowledge = () => {
    return useAppStore(
        useShallow(state => ({
            // State selectors
            indexedDocumentsCount: state.indexedDocumentsCount,
            knowledgeBaseName: state.knowledgeBaseName,
            isLoading: state.isLoading,
            error: state.error,
            lastIndexedAt: state.lastIndexedAt,
            indexingProgress: state.indexingProgress,
            searchResults: state.searchResults,

            // Action selectors
            triggerIndexing: state.triggerIndexing,
            searchRelevantKnowledge: state.searchRelevantKnowledge,
            refreshIndexedDocumentsCount: state.refreshIndexedDocumentsCount,
            initializeKnowledgeBase: state.initializeKnowledgeBase,
        }))
    );
};

// Selective hook for just indexing status
export const useIndexingStatus = () => {
    return useAppStore(
        useShallow(state => ({
            isIndexing: state.indexingProgress.isIndexing,
            progress: state.indexingProgress.progress,
            filesProcessed: state.indexingProgress.filesProcessed,
            totalFiles: state.indexingProgress.totalFiles,
            errors: state.indexingProgress.errors,
        }))
    );
};

// Selective hook for search functionality
export const useKnowledgeSearch = () => {
    return useAppStore(
        useShallow(state => ({
            searchResults: state.searchResults,
            searchRelevantKnowledge: state.searchRelevantKnowledge,
        }))
    );
};
