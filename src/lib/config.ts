// src/lib/config.ts
export const ASSISTANT_CATEGORIES = [
    { value: "general", label: "General" },
    { value: "coding", label: "Coding" },
    { value: "writing", label: "Writing" },
    { value: "audio", label: "Audio" },
    { value: "email", label: "Email" },
    { value: "content", label: "Content" },
    { value: "analysis", label: "Analysis" },
    { value: "research", label: "Research" },
    { value: "creative", label: "Creative" },
] as const;

export type AssistantCategory = (typeof ASSISTANT_CATEGORIES)[number]["value"];

export const MODEL_OPTIONS = [
    { value: "gpt-4o", label: "GPT-4o" },
    { value: "gpt-4o-mini", label: "GPT-4o Mini" },
    { value: "gpt-4-turbo", label: "GPT-4 Turbo" },
    { value: "gpt-3.5-turbo", label: "GPT-3.5 Turbo" },
] as const;

export type ModelOption = (typeof MODEL_OPTIONS)[number]["value"];
