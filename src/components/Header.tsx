// src/components/Header.tsx
import React from "react";
import StatusIndicator from "./chat/StatusIndicator";

interface HeaderProps {
    status: "inactive" | "active" | "error";
}

export default function Header({ status }: HeaderProps) {
    return (
        <header className="flex flex-row items-center justify-center text-center mb-4 space-x-4">
            <h1 className="text-2xl font-bold mb-0">
                iMessage-style Audio Transcription
            </h1>
            <StatusIndicator status={status} />
        </header>
    );
}
