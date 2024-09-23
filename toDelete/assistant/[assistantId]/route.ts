// // src/app/api/assistant/[assistantId]/route.ts

// import { NextRequest, NextResponse } from "next/server";
// import OpenAI from "openai";
// import { logger } from "@/modules/Logger"; // Import logger

// const openai = new OpenAI({
//     apiKey: process.env.NEXT_PUBLIC_OPENAI_API_KEY,
// });

// export async function GET(
//     request: NextRequest,
//     { params }: { params: { assistantId: string } },
// ) {
//     const { assistantId } = params;
//     logger.info(`🔍 Fetching assistant details for ID: ${assistantId}`);

//     try {
//         const assistant = await openai.beta.assistants.retrieve(assistantId);
//         logger.info("✅ Successfully fetched assistant details.");
//         logger.info(`✅ ✅ Assistant details: ${JSON.stringify(assistant)}`);
//         return NextResponse.json(assistant);
//     } catch (error) {
//         logger.error(
//             `❌ Error fetching assistant. Error: ${JSON.stringify(error)}`,
//         );

//         if (error instanceof OpenAI.APIError) {
//             logger.error("⚠️ OpenAI API Error Details:");
//             logger.error(`Status: ${error.status}`);
//             logger.error(`Name: ${error.name}`);
//             logger.error(`Message: ${error.message}`);

//             return NextResponse.json(
//                 {
//                     error: error.message,
//                 },
//                 { status: error.status || 500 },
//             );
//         }

//         if (error instanceof Error) {
//             logger.error(`Error details: ${error.message}`);
//             return NextResponse.json(
//                 {
//                     error: "Failed to fetch assistant details",
//                     details: error.message,
//                 },
//                 { status: 500 },
//             );
//         }

//         logger.error("❌ Unhandled error type encountered.");
//         return NextResponse.json(
//             {
//                 error: "An unknown error occurred",
//             },
//             { status: 500 },
//         );
//     }
// }
