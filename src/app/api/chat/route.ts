// app/api/chat/route.ts

import { OpenAIModelName } from "@/types/openai-models";
import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(request: NextRequest) {
    try {
        const { userMessage, assistantId, roleDescription } =
            await request.json();

        if (!userMessage || !assistantId || !roleDescription) {
            return NextResponse.json(
                { error: "Missing required fields." },
                { status: 400 },
            );
        }

        // Create a chat completion using OpenAI's API
        const modelName: OpenAIModelName = "gpt-4o-mini";
        const response = await openai.chat.completions.create({
            model: modelName,
            messages: [
                { role: "system", content: roleDescription },
                { role: "user", content: userMessage },
            ],
            stream: false, // Set to true if you plan to handle streaming
        });

        const assistantMessage = response.choices[0]?.message?.content;

        return NextResponse.json({ response: assistantMessage });
    } catch (error: unknown) {
        console.error(
            "Error in /api/chat:",
            error instanceof Error ? error.message : String(error),
        );
        return NextResponse.json(
            { error: "Failed to generate response." },
            { status: 500 },
        );
    }
}
