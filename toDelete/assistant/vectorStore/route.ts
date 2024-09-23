// // src/app/api/vectorStore/route.ts
// import { NextRequest, NextResponse } from "next/server";
// import OpenAI from "openai";
// import { logger } from "@/modules/Logger";

// const openai = new OpenAI({
//     apiKey: process.env.OPENAI_API_KEY, // Note: Use server-side env variable, not NEXT_PUBLIC_
// });

// export async function POST(request: NextRequest) {
//     try {
//         const { name } = await request.json();

//         if (!name) {
//             return NextResponse.json(
//                 { error: "Name is required" },
//                 { status: 400 },
//             );
//         }

//         logger.info(`Creating new Vector Store with name: ${name}`);

//         const vectorStore = await openai.beta.vectorStores.create({ name });

//         logger.info(`✅ Successfully created Vector Store: ${vectorStore.id}`);

//         return NextResponse.json(vectorStore);
//     } catch (error) {
//         logger.error(`❌ Error creating Vector Store: ${error}`);
//         return NextResponse.json(
//             { error: "Failed to create Vector Store" },
//             { status: 500 },
//         );
//     }
// }
