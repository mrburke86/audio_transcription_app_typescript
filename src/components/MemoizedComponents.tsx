// src/components/MemoizedComponents.tsx
import React from "react";
import TranscriptionBox from "./TranscriptionBox";
import LogBox from "./LogBox";

export const MemoizedTranscriptionBox = React.memo(TranscriptionBox);
export const MemoizedLogBox = React.memo(LogBox);
