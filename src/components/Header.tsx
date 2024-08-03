// src/components/Header.tsx
import React from "react";
import StatusIndicator from "./StatusIndicator";

interface HeaderProps {
    status: "inactive" | "active" | "error";
}

const Header: React.FC<HeaderProps> = ({ status }) => {
    return (
        <header className="text-center mb-4">
            <h1 className="text-2xl font-bold mb-2">
                iMessage-style Audio Transcription
            </h1>
            <StatusIndicator status={status} />
        </header>
    );
};

export default Header;
