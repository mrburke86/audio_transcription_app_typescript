// // src/app/api/assistants/[assistantId]/vectorStore/route.ts

// import { NextRequest, NextResponse } from "next/server";
// import OpenAI from "openai";
// import { logger } from "@/modules/Logger";

// const openai = new OpenAI({
//     apiKey: process.env.OPENAI_API_KEY,
// });

// export async function POST(
//     request: NextRequest,
//     { params }: { params: { assistantId: string } },
// ) {
//     try {
//         const { name } = await request.json();

//         if (!name) {
//             return NextResponse.json(
//                 { error: "Name is required" },
//                 { status: 400 },
//             );
//         }

// logger.info(
//     `Creating new Vector Store for Assistant ${params.assistantId} with name: ${name}`,
// );

// const vectorStore = await openai.beta.vectorStores.create({ name });

// logger.info(`✅ Successfully created Vector Store: ${vectorStore.id}`);

//         return NextResponse.json({ vectorStoreId: vectorStore.id });
//     } catch (error) {
//         logger.error(`❌ Error creating Vector Store: ${error}`);
//         return NextResponse.json(
//             { error: "Failed to create Vector Store" },
//             { status: 500 },
//         );
//     }
// }
