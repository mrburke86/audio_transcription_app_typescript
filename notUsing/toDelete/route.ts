// src/app/api/assistant/route.ts
// import { NextRequest, NextResponse } from "next/server";
// import OpenAI from "openai";
// import { logger } from "@/modules/Logger";

// const openai = new OpenAI({
//     apiKey: process.env.NEXT_PUBLIC_OPENAI_API_KEY,
// });

// export async function GET() {
//     try {
//         logger.info("🔍 Fetching assistants from OpenAI API");
//         const assistants = await openai.beta.assistants.list({
//             limit: 20,
//             order: "desc",
//         });
//         logger.info("✅ Successfully fetched assistants");
//         return NextResponse.json(assistants.data);
//     } catch (error) {
//         logger.error(`❌ Failed to fetch assistants: ${error}`);
//         return NextResponse.json(
//             { error: "Failed to fetch assistants" },
//             { status: 500 },
//         );
//     }
// }

// export async function POST(request: NextRequest) {
//     try {
//         const { name, description, instructions, model, tools, temperature } =
//             await request.json();

//         logger.info(`🚀 Creating new assistant: ${name}`);

//         const assistant = await openai.beta.assistants.create({
//             name,
//             description,
//             instructions,
//             model,
//             tools,
//             temperature,
//         });

//         logger.info(`✅ Assistant created successfully: ${assistant.id}`);

//         return NextResponse.json(assistant);
//     } catch (error) {
//         logger.error(`❌ Error creating assistant: ${error}`);
//         return NextResponse.json(
//             { error: "Failed to create assistant" },
//             { status: 500 },
//         );
//     }
// }
