// src/components/PerformanceProvider.tsx
"use client";

import { initializePerformanceTracking } from "@/modules/performanceSetup";
import { useEffect } from "react";

export default function PerformanceProvider({
    children,
}: {
    children: React.ReactNode;
}) {
    useEffect(() => {
        // Initialize performance tracking on the client side
        initializePerformanceTracking();
    }, []);

    return <>{children}</>;
}
