// src/utils/performanceSetup.ts
// Add this to your main App or layout component to activate performance tracking

import {
    performanceTracker,
    runPerformanceTest,
} from "@/modules/PerformanceTracker";

// ANSI colors for console
const colors = {
    reset: "\x1b[0m",
    bright: "\x1b[1m",
    bgGreen: "\x1b[42m",
    bgBlue: "\x1b[44m",
    bgMagenta: "\x1b[45m",
    bgYellow: "\x1b[43m", // Added for warnings/errors in enhanced perf
    white: "\x1b[37m",
    yellow: "\x1b[33m",
    cyan: "\x1b[36m",
} as const;

const logEnhanced = (message: string, type: "info" | "warn" = "info") => {
    const color = type === "warn" ? colors.bgYellow : colors.bgGreen;
    if (process.env.NODE_ENV === "development") {
        // Only log in development
        console.log(
            `${colors.bright}${color}${colors.white} EnhancedPerf ${colors.reset} ${message}`,
        );
    }
};

const createMarker = (name: string) => {
    try {
        performance.mark(name);
        logEnhanced(`Marked: ${name}`);
    } catch (e) {
        logEnhanced(`Failed to mark ${name}: ${(e as Error).message}`, "warn");
    }
};

const createMeasure = (
    measureName: string,
    startMark: string,
    endMark: string,
) => {
    try {
        // Check if marks exist to prevent errors
        if (performance.getEntriesByName(startMark, "mark").length === 0) {
            logEnhanced(
                `Start mark "${startMark}" not found for measure "${measureName}". Skipping.`,
                "warn",
            );
            return;
        }
        if (performance.getEntriesByName(endMark, "mark").length === 0) {
            logEnhanced(
                `End mark "${endMark}" not found for measure "${measureName}". Skipping.`,
                "warn",
            );
            return;
        }
        performance.measure(measureName, startMark, endMark);
        logEnhanced(
            `Measured: ${measureName} (from ${startMark} to ${endMark})`,
        );
    } catch (e) {
        logEnhanced(
            `Failed to measure ${measureName}: ${(e as Error).message}`,
            "warn",
        );
    }
};

export const initializeEnhancedPerformance = () => {
    if (typeof window === "undefined") return;

    if (window.enhancedPerf) {
        logEnhanced("Already initialized.", "info");
        return;
    }

    window.enhancedPerf = {
        trackMoveButtonClicked: () =>
            createMarker("enhancedPerf_MOVE_BUTTON_CLICKED"),
        trackContextPreparationStart: () =>
            createMarker("enhancedPerf_CONTEXT_PREPARATION_START"),
        trackContextPreparationEnd: () => {
            createMarker("enhancedPerf_CONTEXT_PREPARATION_END");
            createMeasure(
                "enhancedPerf_DURATION_CONTEXT_PREPARATION",
                "enhancedPerf_CONTEXT_PREPARATION_START",
                "enhancedPerf_CONTEXT_PREPARATION_END",
            );
        },
        trackThreadOperationsStart: () =>
            createMarker("enhancedPerf_THREAD_OPERATIONS_START"),
        trackThreadCreated: () => createMarker("enhancedPerf_THREAD_CREATED"), // Primarily a point-in-time marker
        trackMessageAdditionStart: () =>
            createMarker("enhancedPerf_MESSAGE_ADDITION_START"),
        trackMessageAdditionEnd: () => {
            createMarker("enhancedPerf_MESSAGE_ADDITION_END");
            // You could measure individual message addition if needed, or rely on THREAD_OPERATIONS_END
        },
        trackThreadOperationsEnd: () => {
            createMarker("enhancedPerf_THREAD_OPERATIONS_END");
            createMeasure(
                "enhancedPerf_DURATION_THREAD_OPERATIONS",
                "enhancedPerf_THREAD_OPERATIONS_START",
                "enhancedPerf_THREAD_OPERATIONS_END",
            );
        },
        trackAssistantProcessingStart: () =>
            createMarker("enhancedPerf_ASSISTANT_PROCESSING_START"),
        trackFileSearchStart: () =>
            createMarker("enhancedPerf_FILE_SEARCH_START"),
        trackFileSearchEnd: () => {
            createMarker("enhancedPerf_FILE_SEARCH_END");
            createMeasure(
                "enhancedPerf_DURATION_FILE_SEARCH",
                "enhancedPerf_FILE_SEARCH_START",
                "enhancedPerf_FILE_SEARCH_END",
            );
        },
        trackResponseGenerationStart: () =>
            createMarker("enhancedPerf_RESPONSE_GENERATION_START"),
        trackFirstChunkReceived: () => {
            createMarker("enhancedPerf_FIRST_CHUNK_RECEIVED");
            createMeasure(
                "enhancedPerf_DURATION_TO_FIRST_CHUNK", // Measures from assistant processing start
                "enhancedPerf_ASSISTANT_PROCESSING_START",
                "enhancedPerf_FIRST_CHUNK_RECEIVED",
            );
            // Alternative: measure from RESPONSE_GENERATION_START
            // createMeasure(
            //     "enhancedPerf_DURATION_GENERATE_TO_FIRST_CHUNK",
            //     "enhancedPerf_RESPONSE_GENERATION_START",
            //     "enhancedPerf_FIRST_CHUNK_RECEIVED"
            // );
        },
        trackAssistantProcessingEnd: () => {
            createMarker("enhancedPerf_ASSISTANT_PROCESSING_END");
            createMeasure(
                "enhancedPerf_DURATION_ASSISTANT_PROCESSING", // Total time assistant was "active" (from run start to messageDone)
                "enhancedPerf_ASSISTANT_PROCESSING_START",
                "enhancedPerf_ASSISTANT_PROCESSING_END",
            );
        },
    };
    logEnhanced(
        "Real Enhanced Performance Tracking Initialized using performance.mark/measure.",
        "info",
    );
};

export const initializePerformanceTracking = () => {
    if (typeof window === "undefined") return; // Server-side guard

    // Initialize the new enhanced performance system
    initializeEnhancedPerformance(); // <<<< CALL THE NEW INITIALIZER

    console.log(`${colors.bright}${colors.bgMagenta}${colors.white}`);
    console.log(`████████████████████████████████████████████████████████████`);
    console.log(`█                                                          █`);
    console.log(
        `█           🚀 PERFORMANCE TRACKING (Standard & Enhanced) ACTIVATED 🚀           █`,
    );
    console.log(`█                                                          █`);
    console.log(`█  This will measure:                                      █`);
    console.log(
        `█  🎤 Speech Recognition Speed (Standard Tracker)            █`,
    );
    console.log(
        `█  🚀 API Call Response Times (Standard Tracker)             █`,
    );
    console.log(
        `█  ⏱️  Time to First Chunk (Standard & Enhanced)             █`,
    );
    console.log(
        `█  📊 Overall Performance Metrics (Standard Tracker)         █`,
    );
    console.log(
        `█  🕵️ Detailed Sub-step Metrics (Enhanced Perf API)         █`,
    );
    console.log(`█                                                          █`);
    console.log(`████████████████████████████████████████████████████████████`);
    console.log(`${colors.reset}\n`);

    // Activate performance test mode (for performanceTracker instance)
    runPerformanceTest();

    // Log key metrics on page unload (from performanceTracker instance)
    window.addEventListener("beforeunload", () => {
        console.log(
            `${colors.bright}${colors.bgBlue}${colors.white} 📊 FINAL PERFORMANCE REPORT (Standard Tracker) ${colors.reset}`,
        );

        const metrics = performanceTracker.getAllMetrics();
        const keyMetrics = metrics.filter(
            (m) =>
                m.name.includes("MoveToFirstChunk") ||
                m.name.includes("speech_session") ||
                m.name.includes("total_request") ||
                m.name.includes("generateResponse"),
        );

        if (keyMetrics.length > 0) {
            console.log(
                `${colors.yellow}🏆 KEY PERFORMANCE METRICS (Standard Tracker):${colors.reset}`,
            );
            keyMetrics.forEach((metric) => {
                if (metric.duration) {
                    console.log(
                        `  ${metric.name}: ${metric.duration.toFixed(2)}ms`,
                    );
                }
            });
        }

        // You could also log enhanced performance measures here if desired
        if (
            typeof performance !== "undefined" &&
            performance.getEntriesByType
        ) {
            const enhancedMeasures = performance
                .getEntriesByType("measure")
                .filter((entry) =>
                    entry.name.startsWith("enhancedPerf_DURATION"),
                );
            if (enhancedMeasures.length > 0) {
                console.log(
                    `${colors.yellow}🏆 KEY ENHANCED PERFORMANCE DURATIONS:${colors.reset}`,
                );
                enhancedMeasures.forEach((measure) => {
                    console.log(
                        `  ${measure.name}: ${measure.duration.toFixed(2)}ms`,
                    );
                });
            }
        }
    });

    // Add global performance shortcuts for testing
    if (process.env.NODE_ENV === "development") {
        // Keep existing 'perf' for the standard tracker
        window.perf = {
            clear: () => {
                performanceTracker.clear();
                if (
                    typeof performance !== "undefined" &&
                    performance.clearMarks
                ) {
                    performance.clearMarks();
                    performance.clearMeasures();
                    logEnhanced(
                        "Cleared all enhanced marks and measures.",
                        "info",
                    );
                }
            },
            metrics: () => performanceTracker.getAllMetrics(),
            compare: (name1: string, name2: string) =>
                performanceTracker.compareMetrics(name1, name2),
            // Add new shortcuts for enhancedPerf data
            enhancedMarks: () =>
                typeof performance !== "undefined"
                    ? performance
                          .getEntriesByType("mark")
                          .filter((m) => m.name.startsWith("enhancedPerf_"))
                    : [],
            enhancedMeasures: () =>
                typeof performance !== "undefined"
                    ? performance
                          .getEntriesByType("measure")
                          .filter((m) => m.name.startsWith("enhancedPerf_"))
                    : [],
        };

        console.log(
            `${colors.cyan}💡 Dev Tools: Use window.perf to access standard & enhanced performance utilities (e.g., window.perf.enhancedMeasures())${colors.reset}`,
        );
    }
};

// logPerformanceBaseline remains the same, but consider if it should also clear enhancedPerf marks/measures
export const logPerformanceBaseline = () => {
    console.log(
        `${colors.bright}${colors.bgGreen}${colors.white} 📈 RECORDING BASELINE PERFORMANCE ${colors.reset}`,
    );
    console.log(
        `${colors.yellow}📋 This session will be used as the "before" measurement${colors.reset}\n`,
    );

    // Clear any existing metrics to start fresh
    performanceTracker.clear();
    if (typeof performance !== "undefined" && performance.clearMarks) {
        // Clear enhanced performance marks and measures as well for a clean baseline
        performance.getEntriesByType("mark").forEach((mark) => {
            if (mark.name.startsWith("enhancedPerf_"))
                performance.clearMarks(mark.name);
        });
        performance.getEntriesByType("measure").forEach((measure) => {
            if (measure.name.startsWith("enhancedPerf_"))
                performance.clearMeasures(measure.name);
        });
        logEnhanced("Cleared enhanced marks/measures for baseline.", "info");
    }

    // Mark this as baseline session
    localStorage.setItem("performance_baseline_session", Date.now().toString());
};
