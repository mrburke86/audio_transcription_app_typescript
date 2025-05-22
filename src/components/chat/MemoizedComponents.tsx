// src/components/chat/MemoizedComponents.tsx
import React from "react";
import ChatMessagesBox from "./ChatMessagesBox";
import LogBox from "./LogBox";
import { logger } from "@/modules/Logger";

// Enhanced memoized components with logging
export const MemoizedChatMessagesBox = React.memo(
    ChatMessagesBox,
    (prevProps, nextProps) => {
        try {
            const shouldRerender =
                prevProps.messages !== nextProps.messages ||
                prevProps.streamedContent !== nextProps.streamedContent ||
                prevProps.isStreamingComplete !== nextProps.isStreamingComplete;

            if (shouldRerender) {
                logger.debug(
                    "🔄 MemoizedChatMessagesBox will re-render due to prop changes",
                );
            } else {
                logger.debug(
                    "✅ MemoizedChatMessagesBox skipping re-render (props unchanged)",
                );
            }

            return !shouldRerender;
        } catch (error) {
            logger.error(
                `❌ Error in MemoizedChatMessagesBox comparison: ${
                    error instanceof Error ? error.message : "Unknown error"
                }`,
            );
            return false; // Re-render on error to be safe
        }
    },
);

export const MemoizedLogBox = React.memo(LogBox, (prevProps, nextProps) => {
    try {
        const shouldRerender = prevProps.logs !== nextProps.logs;

        if (shouldRerender) {
            logger.debug("🔄 MemoizedLogBox will re-render due to log changes");
        } else {
            logger.debug(
                "✅ MemoizedLogBox skipping re-render (logs unchanged)",
            );
        }

        return !shouldRerender;
    } catch (error) {
        logger.error(
            `❌ Error in MemoizedLogBox comparison: ${
                error instanceof Error ? error.message : "Unknown error"
            }`,
        );
        return false; // Re-render on error to be safe
    }
});

// Set display names for better debugging
MemoizedChatMessagesBox.displayName = "MemoizedChatMessagesBox";
MemoizedLogBox.displayName = "MemoizedLogBox";
