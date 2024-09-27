// src/components/layout/theme-toggle.tsx
"use client";

import * as React from "react";
import { useTheme } from "next-themes";
import { Button } from "@/components/ui/button";
import { Sun, Moon } from "lucide-react";

export function ThemeToggle() {
    const { theme, setTheme } = useTheme();
    const [mounted, setMounted] = React.useState(false);

    React.useEffect(() => setMounted(true), []);

    if (!mounted) return null;

    return (
        <div className="fixed top-3 right-3 z-50 ">
            <Button
                variant="ghost"
                size="icon"
                onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
                aria-label={`Switch to ${
                    theme === "dark" ? "light" : "dark"
                } theme`}
            >
                {theme === "dark" ? (
                    <Sun className="h-5 w-5 transition-all" />
                ) : (
                    <Moon className="h-5 w-5 transition-all" />
                )}
            </Button>
        </div>
    );
}
