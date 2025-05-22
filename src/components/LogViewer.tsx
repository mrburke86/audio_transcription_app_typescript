// src/components/LogViewer.tsx (Optional component for debugging)
"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Download, FileText, RefreshCw } from "lucide-react";
import { logger } from "@/modules/Logger";

export function LogViewer() {
    const [isDownloading, setIsDownloading] = useState(false);
    const [isCreatingNewSession, setIsCreatingNewSession] = useState(false);
    const [isMounted, setIsMounted] = useState(false);

    // Prevent hydration mismatch by only rendering after client mount
    useEffect(() => {
        setIsMounted(true);
    }, []);

    const handleDownloadLogs = async () => {
        setIsDownloading(true);
        try {
            await logger.downloadLogs();
        } catch (error) {
            console.error("Failed to download logs:", error);
        } finally {
            setIsDownloading(false);
        }
    };

    const handleCreateNewSession = async () => {
        setIsCreatingNewSession(true);
        try {
            await logger.createNewSession();
            // Force re-render to show new session
            window.location.reload();
        } catch (error) {
            console.error("Failed to create new session:", error);
        } finally {
            setIsCreatingNewSession(false);
        }
    };

    // Don't render until client-side to prevent hydration mismatch
    if (!isMounted) {
        return (
            <Card className="w-full">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <FileText className="h-5 w-5" />
                        Session Logs
                    </CardTitle>
                    <p className="text-sm text-muted-foreground">
                        Loading session...
                    </p>
                </CardHeader>
                <CardContent>
                    <div className="h-64 overflow-y-auto bg-muted p-4 rounded-md font-mono text-xs">
                        <p className="text-muted-foreground">
                            Initializing logger...
                        </p>
                    </div>
                </CardContent>
            </Card>
        );
    }

    const logs = logger.getLogs();
    const sessionId = logger.getSessionId();

    return (
        <Card className="w-full">
            <CardHeader>
                <div className="flex justify-between items-center">
                    <CardTitle className="flex items-center gap-2">
                        <FileText className="h-5 w-5" />
                        Session Logs
                    </CardTitle>
                    <div className="flex gap-2">
                        <Button
                            onClick={handleCreateNewSession}
                            disabled={isCreatingNewSession}
                            size="sm"
                            variant="outline"
                        >
                            <RefreshCw className="h-4 w-4 mr-2" />
                            {isCreatingNewSession
                                ? "Creating..."
                                : "New Session"}
                        </Button>
                        <Button
                            onClick={handleDownloadLogs}
                            disabled={isDownloading}
                            size="sm"
                            variant="outline"
                        >
                            <Download className="h-4 w-4 mr-2" />
                            {isDownloading ? "Downloading..." : "Download Logs"}
                        </Button>
                    </div>
                </div>
                <p className="text-sm text-muted-foreground">
                    Session: {sessionId} | {logs.length} entries
                </p>
            </CardHeader>
            <CardContent>
                <div className="h-64 overflow-y-auto bg-muted p-4 rounded-md font-mono text-xs">
                    {logs.length === 0 ? (
                        <p className="text-muted-foreground">No logs yet...</p>
                    ) : (
                        logs.slice(-50).map((log, index) => (
                            <div
                                key={index}
                                className={`mb-1 ${
                                    log.level === "error"
                                        ? "text-red-500"
                                        : log.level === "warning"
                                        ? "text-yellow-500"
                                        : log.level === "performance"
                                        ? "text-green-500"
                                        : "text-foreground"
                                }`}
                            >
                                {log.emoji} [{log.timestamp}] [
                                {log.level.toUpperCase()}] {log.message}
                            </div>
                        ))
                    )}
                </div>
            </CardContent>
        </Card>
    );
}
