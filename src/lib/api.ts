// src/lib/api.ts
import OpenAI from "openai";

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});

// export async function getAssistantDetails(assistantId: string) {
//     return await openai.beta.assistants.retrieve(assistantId);
// }

export async function getVectorStoreDetails(vectorStoreId: string) {
    return await openai.beta.vectorStores.retrieve(vectorStoreId);
}

// export async function getVectorStoreFiles(vectorStoreId: string) {
//     const response = await openai.beta.vectorStores.files.list(vectorStoreId);
//     return response.data;
// }

export async function getAssistants() {
    return await openai.beta.assistants.list();
}
