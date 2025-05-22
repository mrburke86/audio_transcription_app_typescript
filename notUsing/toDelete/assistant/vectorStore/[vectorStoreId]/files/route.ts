// // src/app/api/vectorStore/[vectorStoreId]/files/route.ts
// import { NextResponse } from "next/server";
// import OpenAI from "openai";
// import { logger } from "@/modules/Logger"; // Import logger

// const openai = new OpenAI({
//     apiKey: process.env.NEXT_PUBLIC_OPENAI_API_KEY,
//     dangerouslyAllowBrowser: true,
// });

// // Named export for GET request to list files in a vector store
// export async function GET(
//     request: Request,
//     { params }: { params: { vectorStoreId: string } },
// ) {
//     const { vectorStoreId } = params;
//     logger.info(`📄 Fetching files for vector store ID: ${vectorStoreId}`);

//     if (!vectorStoreId) {
//         return NextResponse.json(
//             { error: "Vector store ID is required" },
//             { status: 400 },
//         );
//     }

//     try {
//         // List files in the vector store
//         const vectorStoreFiles = await openai.beta.vectorStores.files.list(
//             vectorStoreId,
//         );
//         logger.info("✅ Successfully listed files in vector store.");
//         logger.info(
//             `✅ ✅ Vector store files: ${JSON.stringify(vectorStoreFiles)}`,
//         );
//         if (!vectorStoreFiles) {
//             return NextResponse.json(
//                 { error: "No files found for this vector store" },
//                 { status: 404 },
//             );
//         }

//         return NextResponse.json(vectorStoreFiles);
//     } catch (error) {
//         if (error instanceof Error) {
//             logger.error(
//                 `❌ Error listing vector store files. Error: ${JSON.stringify(
//                     error.message,
//                 )}`,
//             );
//         } else {
//             logger.error("❌ Unknown error while listing vector store files.");
//         }
//         return NextResponse.json(
//             { error: "Internal Server Error" },
//             { status: 500 },
//         );
//     }
// }
