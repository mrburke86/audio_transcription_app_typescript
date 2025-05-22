// src/app/logs/page.tsx
"use client";

import dynamic from "next/dynamic";
import { Suspense } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FileText } from "lucide-react";

// Dynamically import LogViewer with no SSR to prevent hydration issues
const LogViewer = dynamic(
    () =>
        import("@/components/LogViewer").then((mod) => ({
            default: mod.LogViewer,
        })),
    {
        ssr: false,
        loading: () => (
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
        ),
    },
);

export default function LogsPage() {
    return (
        <div className="container mx-auto px-4 py-8">
            <h1 className="text-4xl font-bold mb-8 text-center">Logs</h1>
            <Suspense
                fallback={
                    <Card className="w-full">
                        <CardHeader>
                            <CardTitle>Loading...</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="h-64 bg-muted rounded-md animate-pulse" />
                        </CardContent>
                    </Card>
                }
            >
                <LogViewer />
            </Suspense>
        </div>
    );
}
