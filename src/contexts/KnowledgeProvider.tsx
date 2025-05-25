// src/contexts/KnowledgeProvider.tsx
"use client";

import React, {
    createContext,
    useContext,
    useEffect,
    useState,
    ReactNode,
    useRef,
} from "react";
import { logger } from "@/modules/Logger";

export interface KnowledgeFile {
    id: string;
    name: string;
    content: string;
    size: number;
    wordCount: number;
}

interface KnowledgeContextType {
    files: KnowledgeFile[];
    isLoading: boolean;
    error: string | null;
    searchRelevantFiles: (query: string, topK?: number) => KnowledgeFile[];
    getTotalStats: () => {
        totalFiles: number;
        totalWords: number;
        totalSize: number;
    };
}

const KnowledgeContext = createContext<KnowledgeContextType | undefined>(
    undefined,
);

// List of markdown files to load (update this list based on your actual files)
const MARKDOWN_FILES = [
    "C_Level_Engagement_Strategies_Manufacturing.md",
    "etq_company_profile.md",
    "etq_mid_market_account_executive_europe.md",
    "ETQ_Role_Specific_Scenarios_Questions.md",
    "hexagon_ab_company_profile.md",
    "manufacturing_industry_trends.md",
    "meddpicc_sales_methodology.md",
    "My_Career_Summary_Achievements.md",
    "My_Career_Summary_Sales_Achievements.md",
    "My_MEDDPICC_Success_Stories.md",
    "quality_management_ehs_principles.md",
];

interface KnowledgeProviderProps {
    children: ReactNode;
    basePath?: string; // Base path for markdown files
}

export const KnowledgeProvider: React.FC<KnowledgeProviderProps> = ({
    children,
    basePath = "/knowledge",
}) => {
    const [files, setFiles] = useState<KnowledgeFile[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // 🔧 FIX: Add loading state guards to prevent duplicate loading
    const loadingStateRef = useRef<"idle" | "loading" | "loaded">("idle");

    // Load all markdown files at startup
    useEffect(() => {
        const loadFiles = async () => {
            // 🔧 Prevent duplicate loading
            if (loadingStateRef.current !== "idle") {
                logger.debug(
                    `[KnowledgeProvider] Already ${loadingStateRef.current}, skipping load`,
                );
                return;
            }

            loadingStateRef.current = "loading";
            logger.info(
                "[KnowledgeProvider] 📚 Starting to load knowledge files...",
            );

            try {
                const startTime = performance.now();

                // Load all files in parallel
                const filePromises = MARKDOWN_FILES.map(async (filename) => {
                    try {
                        const response = await fetch(`${basePath}/${filename}`);
                        if (!response.ok) {
                            logger.debug(
                                `[KnowledgeProvider] ⚠️ Failed to fetch ${filename}: ${response.status}`,
                            );
                            return null;
                        }

                        const content = await response.text();
                        if (!content.trim()) {
                            logger.debug(
                                `[KnowledgeProvider] ⚠️ Empty content for ${filename}`,
                            );
                            return null;
                        }

                        const wordCount = content.split(/\s+/).length;
                        const size = content.length;

                        logger.debug(
                            `[KnowledgeProvider] ✅ Loaded ${filename} (${wordCount} words)`,
                        );

                        return {
                            id: filename.replace(".md", ""),
                            name: filename,
                            content,
                            size,
                            wordCount,
                        } as KnowledgeFile;
                    } catch (fileError) {
                        logger.error(
                            `[KnowledgeProvider] ❌ Error loading ${filename}: ${fileError}`,
                        );
                        return null;
                    }
                });

                const results = await Promise.all(filePromises);

                const successfullyLoadedFiles = results.filter(
                    (file): file is KnowledgeFile => file !== null,
                );

                const endTime = performance.now();
                const totalWords = successfullyLoadedFiles.reduce(
                    (sum, file) => sum + file.wordCount,
                    0,
                );
                const totalSize = successfullyLoadedFiles.reduce(
                    (sum, file) => sum + file.size,
                    0,
                );

                setFiles(successfullyLoadedFiles);
                setError(null);
                loadingStateRef.current = "loaded";

                logger.info(
                    `[KnowledgeProvider] 🎉 Successfully loaded ${
                        successfullyLoadedFiles.length
                    }/${MARKDOWN_FILES.length} files (${totalWords} words, ${(
                        totalSize / 1024
                    ).toFixed(1)}KB) in ${(endTime - startTime).toFixed(1)}ms`,
                );
            } catch (err) {
                loadingStateRef.current = "idle";
                const errorMessage =
                    err instanceof Error
                        ? err.message
                        : "Unknown error loading files";
                logger.error(
                    `[KnowledgeProvider] ❌ Error loading knowledge files: ${err}`,
                );
                setError(errorMessage);
            } finally {
                setIsLoading(false);
            }
        };
        loadFiles();
    }, [basePath]); // Only reload if basePath changes

    // 🔧 FIX: Add cleanup to reset loading state on unmount
    useEffect(() => {
        return () => {
            loadingStateRef.current = "idle";
        };
    }, []);

    // Simple relevance scoring for context selection
    const searchRelevantFiles = (
        query: string,
        topK: number = 5,
    ): KnowledgeFile[] => {
        if (!query.trim()) return [];

        const startTime = performance.now();

        // Extract keywords from query (simple approach)
        const keywords = query
            .toLowerCase()
            .replace(/[^\w\s]/g, " ")
            .split(/\s+/)
            .filter((word) => word.length > 2) // Ignore very short words
            .filter(
                (word) =>
                    ![
                        "the",
                        "and",
                        "for",
                        "are",
                        "but",
                        "not",
                        "you",
                        "all",
                        "can",
                        "had",
                        "her",
                        "was",
                        "one",
                        "our",
                        "out",
                        "day",
                        "had",
                        "has",
                        "his",
                        "how",
                        "man",
                        "new",
                        "now",
                        "old",
                        "see",
                        "two",
                        "way",
                        "who",
                        "boy",
                        "did",
                        "its",
                        "let",
                        "put",
                        "say",
                        "she",
                        "too",
                        "use",
                    ].includes(word),
            ); // Basic stopwords

        // Score each file
        const scoredFiles = files.map((file) => {
            const content = file.content.toLowerCase();
            let score = 0;

            // Basic keyword matching with different weights
            keywords.forEach((keyword) => {
                // Title/filename matches (higher weight)
                if (file.name.toLowerCase().includes(keyword)) {
                    score += 10;
                }

                // Exact keyword matches in content
                const exactMatches = (
                    content.match(new RegExp(`\\b${keyword}\\b`, "g")) || []
                ).length;
                score += exactMatches * 2;

                // Partial matches (lower weight)
                const partialMatches =
                    (content.match(new RegExp(keyword, "g")) || []).length -
                    exactMatches;
                score += partialMatches * 0.5;
            });

            // Boost score for shorter files with same keyword density (they're more focused)
            if (score > 0) {
                score = score * (1 + 1 / Math.log(file.wordCount + 1));
            }

            return { file, score };
        });

        // Sort by score and take top K
        const relevantFiles = scoredFiles
            .filter((item) => item.score > 0)
            .sort((a, b) => b.score - a.score)
            .slice(0, topK)
            .map((item) => item.file);

        const endTime = performance.now();

        logger.debug(
            `[KnowledgeProvider] 🔍 Found ${relevantFiles.length} relevant files for "${query}" ` +
                `in ${(endTime - startTime).toFixed(1)}ms`,
        );

        return relevantFiles;
    };

    const getTotalStats = () => {
        const totalFiles = files.length;
        const totalWords = files.reduce((sum, file) => sum + file.wordCount, 0);
        const totalSize = files.reduce((sum, file) => sum + file.size, 0);

        return { totalFiles, totalWords, totalSize };
    };

    const contextValue: KnowledgeContextType = {
        files,
        isLoading,
        error,
        searchRelevantFiles,
        getTotalStats,
    };

    return (
        <KnowledgeContext.Provider value={contextValue}>
            {children}
        </KnowledgeContext.Provider>
    );
};

// Hook to use the knowledge context
export const useKnowledge = (): KnowledgeContextType => {
    const context = useContext(KnowledgeContext);
    if (context === undefined) {
        throw new Error("useKnowledge must be used within a KnowledgeProvider");
    }
    return context;
};

// Export types and utilities
export type { KnowledgeContextType };
