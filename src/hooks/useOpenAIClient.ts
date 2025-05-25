// src/hooks/useOpenAIClient.ts
"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import OpenAI from "openai";
import { logger } from "@/modules/Logger";
import { performanceTracker } from "@/modules/PerformanceTracker";

interface UseOpenAIClientReturn {
    client: OpenAI | null;
    isInitialized: boolean;
    error: string | null;
    initializeClient: () => Promise<void>;
}

export const useOpenAIClient = (apiKey: string): UseOpenAIClientReturn => {
    const [client, setClient] = useState<OpenAI | null>(null);
    const [error, setError] = useState<string | null>(null);
    const initializationStateRef = useRef<"idle" | "pending" | "done">("idle");

    const isInitialized =
        client !== null && initializationStateRef.current === "done";

    const initializeClient = useCallback(async () => {
        if (!apiKey) {
            logger.error("[useOpenAIClient] ❌ API key is missing");
            setError("API key is missing");
            return;
        }

        if (initializationStateRef.current !== "idle") {
            logger.debug(
                `[useOpenAIClient] Initialization already ${initializationStateRef.current}, skipping`,
            );
            return;
        }

        initializationStateRef.current = "pending";
        let timerStarted = false;

        try {
            performanceTracker.startTimer("openai_initialization", "system");
            timerStarted = true;

            const { default: OpenAIModule } = await import("openai");
            const openaiClient = new OpenAIModule({
                apiKey,
                dangerouslyAllowBrowser: true,
            });

            setClient(openaiClient);
            setError(null);
            performanceTracker.endTimer("openai_initialization");
            initializationStateRef.current = "done";

            logger.info(
                "[useOpenAIClient] ✅ OpenAI client initialized successfully",
            );
        } catch (err) {
            if (timerStarted) {
                performanceTracker.endTimer("openai_initialization");
            }

            initializationStateRef.current = "idle"; // Allow retry on error
            const errorMessage =
                err instanceof Error ? err.message : "Unknown error";
            setError(`Failed to initialize OpenAI client: ${errorMessage}`);

            logger.error(
                `[useOpenAIClient] ❌ Error initializing OpenAI client: ${errorMessage}`,
            );
        }
    }, [apiKey]); // Only re-run if apiKey changes

    // OPTIMIZE: Only initialize once per apiKey
    useEffect(() => {
        if (apiKey && initializationStateRef.current === "idle") {
            initializeClient();
        }
    }, [apiKey, initializeClient]);

    return {
        client,
        isInitialized,
        error,
        initializeClient,
    };
};
