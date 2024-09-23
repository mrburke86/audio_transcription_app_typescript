// src/app/actions/fetch-assistants.ts
"use server";

import openai from "@/lib/openai-client";
import { logger } from "@/modules/Logger";
import { isErrorWithMessage } from "@/lib/error-utils";
import { MyCustomAssistant, Metadata } from "@/types/assistant";

export async function fetchAssistants(): Promise<MyCustomAssistant[]> {
    try {
        const assistants = await openai.beta.assistants.list({
            limit: 20,
            order: "desc",
        });
        logger.info(
            "[SERVER ACTION] ✅ Successfully fetched assistants from OpenAI",
        );

        // Map the assistants to MyCustomAssistant, adding metadata with category
        const transformedAssistants = assistants.data.map((assistant) => ({
            ...assistant,
            metadata: {
                category:
                    (assistant.metadata as Metadata)?.category ||
                    "uncategorized",
            },
        })) as MyCustomAssistant[]; // Ensure the type matches

        return transformedAssistants;
    } catch (error: unknown) {
        if (isErrorWithMessage(error)) {
            logger.error(`❌ Error in fetchAssistants: ${error.message}`);
        } else {
            logger.error("❌ An unknown error occurred in fetchAssistants");
        }
        throw error;
    }
}
