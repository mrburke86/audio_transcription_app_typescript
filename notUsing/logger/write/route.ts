// // src/app/api/logger/write/route.ts
// import { NextRequest, NextResponse } from "next/server";
// import { promises as fs } from "fs";
// import path from "path";

// interface LogEntry {
//     message: string;
//     level: string;
//     timestamp: string;
//     emoji: string;
// }

// export async function POST(request: NextRequest) {
//     try {
//         const {
//             sessionId,
//             logEntry,
//         }: { sessionId: string; logEntry: LogEntry } = await request.json();

//         if (!sessionId || !logEntry) {
//             return NextResponse.json(
//                 { error: "Session ID and log entry are required" },
//                 { status: 400 },
//             );
//         }

//         const logFilePath = path.join(
//             process.cwd(),
//             "logs",
//             `app-logs-${sessionId}.log`,
//         );

//         // Format the log entry for file output
//         const formattedLogEntry = `${logEntry.emoji} [${
//             logEntry.timestamp
//         }] [${logEntry.level.toUpperCase()}] ${logEntry.message}\n`;

//         // Append to the log file
//         await fs.appendFile(logFilePath, formattedLogEntry);

//         return NextResponse.json({ success: true });
//     } catch (error) {
//         console.error("Error writing to log file:", error);
//         return NextResponse.json(
//             { error: "Failed to write to log file" },
//             { status: 500 },
//         );
//     }
// }
