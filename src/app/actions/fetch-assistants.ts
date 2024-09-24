// src/app/actions/fetch-assistants.ts
"use server";

import openai from "@/lib/openai-client";
import { logger } from "@/modules/Logger";
import { isErrorWithMessage } from "@/lib/error-utils";
import { MyCustomAssistant, Metadata } from "@/types/assistant";
import { Assistant } from "openai/resources/beta/assistants.mjs";

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

// Fetch Assistant Details from OpenAI and Vector Store
export async function getAssistantById(
    assistantId: string,
): Promise<MyCustomAssistant | null> {
    try {
        const openaiAssistant: Assistant =
            await openai.beta.assistants.retrieve(assistantId);
        logger.info(
            `✅ Assistant retrieved successfully: ${openaiAssistant.id}`,
        );
        logger.debug(
            `📝 Assistant details: ${JSON.stringify(openaiAssistant)}`,
        );

        const assistant: MyCustomAssistant = {
            ...openaiAssistant,
            metadata: {
                category:
                    (openaiAssistant.metadata as Metadata)?.category ||
                    "uncategorized",
            },
        };

        return assistant;
    } catch (error: unknown) {
        if (isErrorWithMessage(error)) {
            logger.error(`❌ Error fetching assistant: ${error.message}`);
        } else {
            logger.error("❌ An unknown error occurred in getAssistantDetails");
        }
        return null;
    }
}
