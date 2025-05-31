// // src/app/api/logger/init/route.ts
// import { NextRequest, NextResponse } from "next/server";
// import { promises as fs } from "fs";
// import path from "path";

// export async function POST(request: NextRequest) {
//     try {
//         const { sessionId } = await request.json();

//         if (!sessionId) {
//             return NextResponse.json(
//                 { error: "Session ID is required" },
//                 { status: 400 },
//             );
//         }

//         // Create logs directory if it doesn't exist
//         const logsDir = path.join(process.cwd(), "logs");
//         try {
//             await fs.access(logsDir);
//         } catch {
//             await fs.mkdir(logsDir, { recursive: true });
//         }

//         // Create the log file with session header
//         const logFilePath = path.join(logsDir, `app-logs-${sessionId}.log`);

//         // Check if log file already exists
//         try {
//             await fs.access(logFilePath);
//             // File exists, just append a continuation marker
//             const continuationMarker = `
// [${new Date().toISOString()}] 📱 Session continued (page reload)
// `;
//             await fs.appendFile(logFilePath, continuationMarker);
//             console.log(`Continuing existing session: ${sessionId}`);
//         } catch {
//             // File doesn't exist, create new session file
//             const sessionHeader = `
// =============================================================
// 🚀 NEW SESSION STARTED
// =============================================================
// Session ID: ${sessionId}
// Started at: ${new Date().toISOString()}
// =============================================================

// `;
//             await fs.writeFile(logFilePath, sessionHeader);
//             console.log(`Created new session: ${sessionId}`);
//         }

//         return NextResponse.json({
//             success: true,
//             sessionId,
//             logFile: `app-logs-${sessionId}.log`,
//         });
//     } catch (error) {
//         console.error("Error initializing logger session:", error);
//         return NextResponse.json(
//             { error: "Failed to initialize logger session" },
//             { status: 500 },
//         );
//     }
// }
