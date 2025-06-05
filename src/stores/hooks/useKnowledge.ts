// src/hooks/useKnowledge.ts
'use client';

import { useEffect } from 'react';
import { useAppStore } from '../store';
import { useShallow } from 'zustand/react/shallow';

import { logger } from '@/modules/Logger';

/* ------------------------------------------------------------------ *
 * 🧠 useKnowledge — full knowledge-base slice
 * ------------------------------------------------------------------ */
export const useKnowledge = () => {
    const data = useAppStore(
        useShallow(state => ({
            // State
            indexedDocumentsCount: state.indexedDocumentsCount,
            knowledgeBaseName: state.knowledgeBaseName,
            isLoading: state.isLoading,
            error: state.error,
            lastIndexedAt: state.lastIndexedAt,
            indexingProgress: state.indexingProgress,
            searchResults: state.searchResults,

            // Actions
            triggerIndexing: state.triggerIndexing,
            searchRelevantKnowledge: state.searchRelevantKnowledge,
            refreshIndexedDocumentsCount: state.refreshIndexedDocumentsCount,
            initializeKnowledgeBase: state.initializeKnowledgeBase,
        }))
    );

    /* -------------------------------------------------------------- *
     * 🔍 Trace each time the selector changes
     * -------------------------------------------------------------- */
    useEffect(() => {
        logger.trace('[useKnowledge] selector update', {
            indexedDocumentsCount: data.indexedDocumentsCount,
            knowledgeBaseName: data.knowledgeBaseName,
            isLoading: data.isLoading,
            error: data.error,
            lastIndexedAt: data.lastIndexedAt,
            indexingProgress: data.indexingProgress,
            searchResultsLength: data.searchResults?.length ?? 0,
        });
    }, [
        data.indexedDocumentsCount,
        data.knowledgeBaseName,
        data.isLoading,
        data.error,
        data.lastIndexedAt,
        data.indexingProgress,
        data.searchResults,
    ]);

    return data;
};

/* ------------------------------------------------------------------ *
 * 📊 useIndexingStatus — lightweight indexing status tracker
 * ------------------------------------------------------------------ */
export const useIndexingStatus = () => {
    const status = useAppStore(
        useShallow(state => ({
            isIndexing: state.indexingProgress.isIndexing,
            progress: state.indexingProgress.progress,
            filesProcessed: state.indexingProgress.filesProcessed,
            totalFiles: state.indexingProgress.totalFiles,
            errors: state.indexingProgress.errors,
        }))
    );

    useEffect(() => {
        logger.debug('[useIndexingStatus]', status);
    }, [status.isIndexing, status.progress, status.filesProcessed, status.totalFiles, status.errors, status]);

    return status;
};

/* ------------------------------------------------------------------ *
 * 🔎 useKnowledgeSearch — search-centric selector
 * ------------------------------------------------------------------ */
export const useKnowledgeSearch = () => {
    const search = useAppStore(
        useShallow(state => ({
            searchResults: state.searchResults,
            searchRelevantKnowledge: state.searchRelevantKnowledge,
        }))
    );

    useEffect(() => {
        logger.trace('[useKnowledgeSearch] searchResults length', search.searchResults?.length ?? 0);
    }, [search.searchResults]);

    return search;
};
