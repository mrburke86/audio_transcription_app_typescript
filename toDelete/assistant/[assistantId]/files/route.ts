// // src/app/api/assistant/[assistantId]/files/route.ts

// import { NextRequest, NextResponse } from "next/server";
// import OpenAI from "openai";
// import { query } from "@/utils/db";
// import { logger } from "@/modules/Logger";

// export const dynamic = "force-dynamic";
// export const runtime = "nodejs";

// const openai = new OpenAI({
//     apiKey: process.env.NEXT_PUBLIC_OPENAI_API_KEY,
// });

// const MAX_FILE_SIZE = 512 * 1024 * 1024; // 512 MB limit as per OpenAI docs

// export async function POST(
//     request: NextRequest,
//     { params }: { params: { assistantId: string } },
// ) {
//     const { assistantId } = params;

//     logger.info(`🚀 POST request received for assistant ID: ${assistantId}`);
//     logger.debug(
//         `Request headers: ${JSON.stringify(
//             Object.fromEntries(request.headers),
//         )}`,
//     );

//     if (typeof assistantId !== "string") {
//         logger.error(`❌ Invalid assistant ID provided: ${assistantId}`);
//         return NextResponse.json(
//             { error: "Invalid assistant ID" },
//             { status: 400 },
//         );
//     }

//     try {
//         logger.info("📦 Parsing form data...");
//         const formData = await request.formData();
//         logger.debug(
//             `Form data keys: ${Array.from(formData.keys()).join(", ")}`,
//         );

//         const file = formData.get("file") as File | null;
//         const name = formData.get("name") as string | null;
//         const description = formData.get("description") as string | null;

//         logger.info(
//             `📄 File details - Name: ${file?.name}, Size: ${file?.size} bytes, Type: ${file?.type}`,
//         );
//         logger.info(
//             `📝 File metadata - Name: ${name}, Description: ${description}`,
//         );

//         if (!file || !name) {
//             logger.error("❌ Missing file or name in request body");
//             return NextResponse.json(
//                 { error: "File and name are required" },
//                 { status: 400 },
//             );
//         }

//         if (file.size > MAX_FILE_SIZE) {
//             logger.error(
//                 `❌ File size (${file.size} bytes) exceeds maximum allowed (${MAX_FILE_SIZE} bytes)`,
//             );
//             return NextResponse.json(
//                 { error: "File size exceeds maximum allowed" },
//                 { status: 400 },
//             );
//         }

//         logger.info(`🔄 Converting file to array buffer...`);
//         const buffer = await file.arrayBuffer();
//         logger.info(
//             `✅ File converted to array buffer. Size: ${buffer.byteLength} bytes`,
//         );

//         logger.info(`🔧 Creating File-like object...`);
//         const fileLike = new File([new Uint8Array(buffer)], file.name, {
//             type: file.type,
//             lastModified: file.lastModified,
//         });
//         logger.info(`✅ File-like object created`);

//         logger.info(`📤 Uploading file to OpenAI...`);
//         const openaiFile = await openai.files.create({
//             file: fileLike,
//             purpose: "assistants",
//         });
//         logger.info(`✅ File uploaded to OpenAI. File ID: ${openaiFile.id}`);

//         logger.info(`🔍 Retrieving assistant details...`);
//         const assistant = await openai.beta.assistants.retrieve(assistantId);
//         logger.debug(`Assistant details: ${JSON.stringify(assistant)}`);

//         logger.info(`🔄 Updating assistant with new file...`);
//         const updatedAssistant = await openai.beta.assistants.update(
//             assistantId,
//             {
//                 file_ids: [
//                     ...((assistant as any).file_ids || []),
//                     openaiFile.id,
//                 ],
//             } as any,
//         );
//         logger.info(`✅ Assistant updated successfully`);
//         logger.debug(
//             `Updated assistant details: ${JSON.stringify(updatedAssistant)}`,
//         );

//         logger.info(`💾 Storing file metadata in database...`);
//         await query(
//             "INSERT INTO files (file_id, name, description, assistant_id) VALUES ($1, $2, $3, $4)",
//             [openaiFile.id, name, description, assistantId],
//         );
//         logger.info(`✅ File metadata stored in database`);

//         logger.info(`🏁 File upload process completed successfully`);
//         return NextResponse.json({
//             success: true,
//             file_id: openaiFile.id,
//             assistant: updatedAssistant,
//         });
//     } catch (error) {
//         logger.error(`❌❌❌ Error during file upload process ❌❌❌`);
//         if (error instanceof Error) {
//             logger.error(`Error message: ${error.message}`);
//             logger.error(`Error name: ${error.name}`);
//             logger.error(`Stack trace: ${error.stack}`);
//         } else {
//             logger.error(`Unknown error type: ${JSON.stringify(error)}`);
//         }

//         if (error instanceof OpenAI.APIError) {
//             logger.error(`OpenAI API Error Details:`);
//             logger.error(`Status: ${error.status}`);
//             logger.error(`Headers: ${JSON.stringify(error.headers)}`);
//             if (typeof error.error === "object" && error.error !== null) {
//                 logger.error(
//                     `Error Type: ${
//                         (error.error as any).type || "Not specified"
//                     }`,
//                 );
//                 logger.error(
//                     `Error Message: ${
//                         (error.error as any).message || "Not specified"
//                     }`,
//                 );
//             } else {
//                 logger.error(`Error details: ${JSON.stringify(error.error)}`);
//             }
//             logger.error(`Request ID: ${error.request_id || "Not available"}`);
//         }

//         let errorMessage = "Internal Server Error";
//         let errorDetails = "Unknown error";
//         if (error instanceof Error) {
//             errorDetails = error.message;
//         }
//         if (error instanceof OpenAI.APIError) {
//             errorMessage = `OpenAI API Error: ${error.status}`;
//             errorDetails = error.message;
//         }

//         return NextResponse.json(
//             { error: "Internal Server Error", details: errorDetails },
//             { status: 500 },
//         );
//     }
// }
