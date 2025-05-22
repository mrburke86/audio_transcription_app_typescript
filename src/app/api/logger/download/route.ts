// src/app/api/logger/download/route.ts
import { NextRequest, NextResponse } from "next/server";
import { promises as fs } from "fs";
import path from "path";

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const sessionId = searchParams.get("sessionId");

        if (!sessionId) {
            return NextResponse.json(
                { error: "Session ID is required" },
                { status: 400 },
            );
        }

        const logFilePath = path.join(
            process.cwd(),
            "logs",
            `app-logs-${sessionId}.log`,
        );

        try {
            const logContent = await fs.readFile(logFilePath, "utf-8");

            return new NextResponse(logContent, {
                status: 200,
                headers: {
                    "Content-Type": "text/plain",
                    "Content-Disposition": `attachment; filename="app-logs-${sessionId}.log"`,
                },
            });
        } catch {
            return NextResponse.json(
                { error: "Log file not found" },
                { status: 404 },
            );
        }
    } catch (error) {
        console.error("Error downloading log file:", error);
        return NextResponse.json(
            { error: "Failed to download log file" },
            { status: 500 },
        );
    }
}
