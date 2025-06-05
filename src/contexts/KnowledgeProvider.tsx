// // src/contexts/KnowledgeProvider.tsx
// 'use client';

// import React, { createContext, useContext, useEffect, useState, ReactNode, useCallback } from 'react';
// import {
//     initQdrantClient,
//     ensureKnowledgeCollection,
//     searchRelevantChunks,
//     countKnowledgePoints,
//     DocumentChunk,
//     KNOWLEDGE_COLLECTION_NAME,
// } from '@/services/QdrantService'; // Adjust path as needed
// import { logger } from '@/modules';
// import { get, set } from 'react-hook-form';

// interface IndexingStatus {
//     isIndexing: boolean;
//     progress: string;
//     filesProcessed: number;
//     totalFiles: number;
//     errors: string[];
// }

// interface KnowledgeContextType {
//     isLoading: boolean;
//     error: string | null;
//     searchRelevantKnowledge: (query: string, limit?: number) => Promise<DocumentChunk[]>;
//     knowledgeBaseName: string;
//     indexedDocumentsCount: number;
//     refreshIndexedDocumentsCount: () => Promise<void>; // To manually refresh count from UI if needed
//     triggerIndexing: () => Promise<boolean>;
//     indexingStatus: IndexingStatus;
//     lastIndexedAt: Date | null;
// }

// const KnowledgeContext = createContext<KnowledgeContextType | undefined>(undefined);

// export const KnowledgeProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
//     const [isLoading, setIsLoading] = useState(true);
//     const [error, setError] = useState<string | null>(null);
//     const [indexedDocumentsCount, setIndexedDocumentsCount] = useState(0);
//     const [lastIndexedAt, setLastIndexedAt] = useState<Date | null>(null);

//     // NEW: Indexing state
//     const [indexingStatus, setIndexingStatus] = useState<IndexingStatus>({
//         isIndexing: false,
//         progress: '',
//         filesProcessed: 0,
//         totalFiles: 0,
//         errors: [],
//     });

//     const knowledgeBaseName = `Qdrant Collection: ${KNOWLEDGE_COLLECTION_NAME}`;

//     // const fetchAndIndexFiles = useCallback(async (forceReindex = false) => {
//     const initializeKnowledgeBase = useCallback(async () => {
//         logger.info('KnowledgeProvider: Initializing status...');
//         setIsLoading(true);
//         setError(null);
//         try {
//             initQdrantClient(); // Initialize client
//             await ensureKnowledgeCollection(); // Ensure collection exists

//             const currentPointsCount = await countKnowledgePoints();
//             setIndexedDocumentsCount(currentPointsCount);

//             // Enhanced logging with more context
//             if (currentPointsCount === 0) {
//                 logger.warning(
//                     `Knowledge base initialized but is EMPTY. Found ${currentPointsCount} indexed items. Consider running indexing. 📭`
//                 );
//             } else {
//                 logger.info(`Knowledge base initialized successfully. Found ${currentPointsCount} indexed items. ✅`);
//             }
//         } catch (err) {
//             const errorMessage = err instanceof Error ? err.message : 'Unknown initialization error';
//             logger.error(`Error during knowledge base initialization: ${errorMessage}`, err);
//             setError(errorMessage);
//         } finally {
//             setIsLoading(false);
//         }
//     }, []);

//     useEffect(() => {
//         initializeKnowledgeBase();
//     }, [initializeKnowledgeBase]);

//     const refreshIndexedDocumentsCount = useCallback(async () => {
//         try {
//             logger.debug('KnowledgeProvider: Refreshing indexed documents count...');
//             const currentPointsCount = await countKnowledgePoints();
//             setIndexedDocumentsCount(currentPointsCount);
//             logger.debug(`KnowledgeProvider: Updated count to ${currentPointsCount} indexed items.`);
//         } catch (err) {
//             const errorMessage = err instanceof Error ? err.message : 'Unknown count refresh error';
//             logger.error(`Error refreshing indexed documents count: ${errorMessage}`, err);
//         }
//     }, []);

//     // NEW: Trigger indexing function
//     const triggerIndexing = useCallback(async (): Promise<boolean> => {
//         logger.info('🚀 KnowledgeProvider: Starting knowledge indexing process...');

//         setIndexingStatus({
//             isIndexing: true,
//             progress: 'Initializing indexing...',
//             filesProcessed: 0,
//             totalFiles: 0,
//             errors: [],
//         });

//         try {
//             const response = await fetch('/api/knowledge/index-knowledge', {
//                 method: 'POST',
//                 headers: {
//                     'Content-Type': 'application/json',
//                 },
//             });

//             const result = await response.json();

//             if (!response.ok) {
//                 throw new Error(result.error || `HTTP ${response.status}: ${response.statusText}`);
//             }

//             // Success - update status
//             const successStatus: IndexingStatus = {
//                 isIndexing: false,
//                 progress: 'Indexing completed successfully!',
//                 filesProcessed: result.filesProcessed || 0,
//                 totalFiles: result.filesProcessed || 0,
//                 errors: result.errors || [],
//             };

//             setIndexingStatus(successStatus);
//             setLastIndexedAt(new Date());

//             // Refresh the indexed count
//             await refreshIndexedDocumentsCount();

//             if (result.errors && result.errors.length > 0) {
//                 logger.warning(`🎯 Indexing completed with ${result.errors.length} errors. Files processed: ${result.filesProcessed}`);
//                 logger.warning(`Indexing errors: ${JSON.stringify(result.errors)}`);
//                 return false; // Partial success
//             } else {
//                 logger.info(`🎉 Knowledge indexing completed successfully! Files processed: ${result.filesProcessed}`);
//                 return true; // Full success
//             }
//         } catch (err) {
//             const errorMessage = err instanceof Error ? err.message : 'Unknown indexing error';
//             logger.error(`❌ Knowledge indexing failed: ${errorMessage}`, err);

//             setIndexingStatus({
//                 isIndexing: false,
//                 progress: `Indexing failed: ${errorMessage}`,
//                 filesProcessed: 0,
//                 totalFiles: 0,
//                 errors: [errorMessage],
//             });

//             setError(errorMessage);
//             return false;
//         }
//     }, [refreshIndexedDocumentsCount]);

//     const searchRelevantKnowledge = async (query: string, limit = 3): Promise<DocumentChunk[]> => {
//         if (error) {
//             logger.error('Cannot search: Knowledge base has errors');
//             return [];
//         }

//         // 🔥 ADD: Get CallContext from call context slice
//         const callContext = get().context; // This requires accessing CallContextSlice

//         // 🔥 ADD: Respect knowledge search settings
//         if (!callContext?.knowledge_search_enabled) {
//             logger.info('Knowledge search disabled for this call type');
//             get().addNotification({
//                 type: 'info',
//                 message: 'Knowledge search is disabled for this call type',
//                 duration: 3000,
//             });
//             return [];
//         }

//         // 🔥 ADD: Emergency call optimization
//         if (callContext?.call_type === 'emergency-call') {
//             logger.info('Emergency call detected - using fast search mode');
//             limit = Math.min(limit, 2); // Faster results for emergencies
//         }

//         logger.debug(`Searching knowledge base for: "${query.substring(0, 50)}${query.length > 50 ? '...' : ''}"`);

//         try {
//             const startTime = performance.now();
//         // 🔥 ADD: Scope-aware search
//         const searchScope = callContext?.knowledge_search_scope || 'all';
//         const results = await searchRelevantChunks(query, limit, {
//             scope: searchScope,
//             callType: callContext?.call_type,
//             sensitivityLevel: callContext?.sensitivity_level
//         });
//         const searchTime = Math.round(performance.now() - startTime);
//         set({ searchResults: results });

//         logger.info(`Knowledge search completed in ${searchTime}ms. Found ${results.length} relevant chunks.`);

//             // Log search result details in debug mode
//             if (results.length === 0) {
//                 get().addNotification({
//                     type: 'warning',
//                     message: 'No relevant knowledge found for your query. Try different search terms.',
//                     duration: 5000,
//                 });
//             }

//             return results;
//         } catch (searchError) {
//             const errorMessage = searchError instanceof Error ? searchError.message : 'Unknown search error';
//             logger.error(`💥 Error during knowledge search: ${errorMessage}`, searchError);
//             set({ error: errorMessage });

//             get().addNotification({
//                 type: 'error',
//                 message: `Knowledge search failed: ${errorMessage}`,
//                 duration: 8000,
//             });
//                 return [];
//         }
//     };

//     return (
//         <KnowledgeContext.Provider
//             value={{
//                 isLoading,
//                 error,
//                 searchRelevantKnowledge,
//                 knowledgeBaseName,
//                 indexedDocumentsCount,
//                 refreshIndexedDocumentsCount,
//                 triggerIndexing,
//                 indexingStatus,
//                 lastIndexedAt,
//             }}
//         >
//             {children}
//         </KnowledgeContext.Provider>
//     );
// };

// export const useKnowledge = (): KnowledgeContextType => {
//     const context = useContext(KnowledgeContext);
//     if (context === undefined) {
//         throw new Error('useKnowledge must be used within a KnowledgeProvider');
//     }
//     return context;
// };
