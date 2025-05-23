// src/modules/PerformanceTracker.ts
"use client";
// ANSI color codes for console output
const colors = {
    reset: "\x1b[0m",
    bright: "\x1b[1m",
    red: "\x1b[31m",
    green: "\x1b[32m",
    yellow: "\x1b[33m",
    blue: "\x1b[34m",
    magenta: "\x1b[35m",
    cyan: "\x1b[36m",
    white: "\x1b[37m",
    bgRed: "\x1b[41m",
    bgGreen: "\x1b[42m",
    bgYellow: "\x1b[43m",
    bgBlue: "\x1b[44m",
    bgMagenta: "\x1b[45m",
    bgCyan: "\x1b[46m",
} as const;

interface PerformanceMetric {
    name: string;
    startTime: number;
    endTime?: number;
    duration?: number;
    category: "transcription" | "api" | "ui" | "system";
    details?: Record<string, string | number | boolean>;
}

interface PerformanceStats {
    transcription: {
        speechStart: number;
        firstRecognition: number;
        finalTranscript: number;
        totalTime: number;
    };
    api: {
        requestStart: number;
        firstChunk: number;
        streamComplete: number;
        totalTime: number;
    };
    overall: {
        userSpeechToResponse: number;
        moveToFirstChunk: number;
    };
}

class PerformanceTracker {
    private metrics: Map<string, PerformanceMetric> = new Map();
    private sessionStats: PerformanceStats[] = [];
    private currentSession: Partial<PerformanceStats> = {};

    // Start tracking a performance metric
    startTimer(
        name: string,
        category: PerformanceMetric["category"],
        details?: Record<string, string | number | boolean>,
    ): void {
        const metric: PerformanceMetric = {
            name,
            startTime: performance.now(),
            category,
            details,
        };
        this.metrics.set(name, metric);

        this.logStart(name, category);
    }

    // End tracking and calculate duration
    endTimer(
        name: string,
        details?: Record<string, string | number | boolean>,
    ): number | null {
        const metric = this.metrics.get(name);
        if (!metric) {
            console.warn(
                `${colors.yellow}⚠️  Timer '${name}' not found${colors.reset}`,
            );
            return null;
        }

        metric.endTime = performance.now();
        metric.duration = metric.endTime - metric.startTime;
        if (details) {
            metric.details = { ...metric.details, ...details };
        }

        this.logComplete(metric);
        this.updateSessionStats(metric);

        return metric.duration;
    }

    // Log the start of a timer with colors
    private logStart(
        name: string,
        category: PerformanceMetric["category"],
    ): void {
        const categoryColor = this.getCategoryColor(category);
        const icon = this.getCategoryIcon(category);

        console.log(
            `${colors.bright}${categoryColor}${icon} STARTING: ${name}${
                colors.reset
            } ${colors.cyan}[${new Date().toLocaleTimeString()}]${
                colors.reset
            }`,
        );
    }

    // Log the completion of a timer with duration
    private logComplete(metric: PerformanceMetric): void {
        const categoryColor = this.getCategoryColor(metric.category);
        const icon = this.getCategoryIcon(metric.category);
        const duration = metric.duration!;
        const durationColor = this.getDurationColor(duration, metric.category);

        console.log(
            `${colors.bright}${categoryColor}${icon} COMPLETED: ${metric.name}${colors.reset}\n` +
                `  ${durationColor}⏱️  Duration: ${duration.toFixed(2)}ms${
                    colors.reset
                }\n` +
                `  ${colors.cyan}📊 Category: ${metric.category}${colors.reset}`,
        );

        if (metric.details) {
            console.log(
                `  ${colors.white}📝 Details: ${JSON.stringify(
                    metric.details,
                )}${colors.reset}`,
            );
        }
    }

    // Get color based on category
    private getCategoryColor(category: PerformanceMetric["category"]): string {
        switch (category) {
            case "transcription":
                return colors.green;
            case "api":
                return colors.blue;
            case "ui":
                return colors.magenta;
            case "system":
                return colors.yellow;
            default:
                return colors.white;
        }
    }

    // Get icon based on category
    private getCategoryIcon(category: PerformanceMetric["category"]): string {
        switch (category) {
            case "transcription":
                return "🎤";
            case "api":
                return "🚀";
            case "ui":
                return "🖥️";
            case "system":
                return "⚙️";
            default:
                return "📊";
        }
    }

    // Get color based on duration and category (performance thresholds)
    private getDurationColor(
        duration: number,
        category: PerformanceMetric["category"],
    ): string {
        let threshold: { good: number; okay: number };

        switch (category) {
            case "transcription":
                threshold = { good: 100, okay: 300 }; // Speech should be very fast
                break;
            case "api":
                threshold = { good: 500, okay: 1500 }; // API calls
                break;
            case "ui":
                threshold = { good: 16, okay: 100 }; // UI updates should be < 16ms for 60fps
                break;
            default:
                threshold = { good: 100, okay: 500 };
        }

        if (duration <= threshold.good) {
            return `${colors.bgGreen}${colors.white}`;
        } else if (duration <= threshold.okay) {
            return `${colors.bgYellow}${colors.white}`;
        } else {
            return `${colors.bgRed}${colors.white}`;
        }
    }

    // Update session statistics
    private updateSessionStats(_metric: PerformanceMetric): void {
        // Implementation for tracking session-wide stats
        // This will help us compare before/after performance
    }

    // Log a milestone (important events in the flow)
    logMilestone(
        message: string,
        category: PerformanceMetric["category"] = "system",
    ): void {
        const categoryColor = this.getCategoryColor(category);
        const icon = this.getCategoryIcon(category);

        console.log(
            `${colors.bright}${colors.bgCyan}${colors.white} MILESTONE ${colors.reset} ` +
                `${categoryColor}${icon} ${message}${colors.reset} ` +
                `${colors.cyan}[${new Date().toLocaleTimeString()}]${
                    colors.reset
                }`,
        );
    }

    // Log performance summary for a complete flow
    logFlowSummary(flowName: string, metrics: string[]): void {
        console.log(
            `\n${colors.bright}${colors.bgMagenta}${colors.white} 📈 PERFORMANCE SUMMARY: ${flowName} ${colors.reset}`,
        );

        let totalTime = 0;
        metrics.forEach((metricName) => {
            const metric = this.metrics.get(metricName);
            if (metric && metric.duration) {
                totalTime += metric.duration;
                const durationColor = this.getDurationColor(
                    metric.duration,
                    metric.category,
                );
                console.log(
                    `  ${durationColor}${
                        metric.name
                    }: ${metric.duration.toFixed(2)}ms${colors.reset}`,
                );
            }
        });

        console.log(
            `  ${colors.bright}${
                colors.yellow
            }🏁 Total Flow Time: ${totalTime.toFixed(2)}ms${colors.reset}\n`,
        );
    }

    // Clear all metrics (useful for testing)
    clear(): void {
        this.metrics.clear();
        console.log(
            `${colors.yellow}🧹 Performance metrics cleared${colors.reset}`,
        );
    }

    // Get all metrics for analysis
    getAllMetrics(): PerformanceMetric[] {
        return Array.from(this.metrics.values());
    }

    // Compare two metrics (useful for before/after comparisons)
    compareMetrics(metric1Name: string, metric2Name: string): void {
        const metric1 = this.metrics.get(metric1Name);
        const metric2 = this.metrics.get(metric2Name);

        if (!metric1 || !metric2 || !metric1.duration || !metric2.duration) {
            console.warn(
                `${colors.yellow}⚠️  Cannot compare metrics: missing data${colors.reset}`,
            );
            return;
        }

        const diff = metric2.duration - metric1.duration;
        const percentChange = (diff / metric1.duration) * 100;
        const improvedColor = diff < 0 ? colors.green : colors.red;
        const arrow = diff < 0 ? "📈" : "📉";

        console.log(
            `${colors.bright}${colors.bgBlue}${colors.white} COMPARISON ${colors.reset}\n` +
                `  ${metric1Name}: ${metric1.duration.toFixed(2)}ms\n` +
                `  ${metric2Name}: ${metric2.duration.toFixed(2)}ms\n` +
                `  ${improvedColor}${arrow} Difference: ${diff.toFixed(
                    2,
                )}ms (${percentChange.toFixed(1)}%)${colors.reset}`,
        );
    }
}

// Create singleton instance
export const performanceTracker = new PerformanceTracker();

// Convenience functions for common measurements
export const measureTranscription = {
    startSpeech: () =>
        performanceTracker.startTimer(
            "speech_recognition_start",
            "transcription",
        ),
    firstRecognition: () =>
        performanceTracker.endTimer("speech_recognition_start"),
    startTranscriptProcessing: () =>
        performanceTracker.startTimer("transcript_processing", "transcription"),
    endTranscriptProcessing: () =>
        performanceTracker.endTimer("transcript_processing"),
    finalTranscript: () =>
        performanceTracker.logMilestone(
            "Final transcript ready",
            "transcription",
        ),
};

export const measureAPI = {
    startRequest: () => performanceTracker.startTimer("api_request", "api"),
    firstChunk: () => {
        performanceTracker.logMilestone("First chunk received", "api");
        performanceTracker.startTimer("api_streaming", "api");
    },
    endStreaming: () => {
        performanceTracker.endTimer("api_request");
        performanceTracker.endTimer("api_streaming");
    },
};

export const measureUI = {
    startRender: (componentName: string) =>
        performanceTracker.startTimer(`ui_render_${componentName}`, "ui"),
    endRender: (componentName: string) =>
        performanceTracker.endTimer(`ui_render_${componentName}`),
    userAction: (action: string) =>
        performanceTracker.logMilestone(`User action: ${action}`, "ui"),
};

// Performance test suite
export const runPerformanceTest = () => {
    console.log(
        `${colors.bright}${colors.bgGreen}${colors.white} 🧪 PERFORMANCE TEST MODE ACTIVATED ${colors.reset}\n`,
    );

    // Clear previous metrics
    performanceTracker.clear();

    // Set up listeners for key events
    window.addEventListener("beforeunload", () => {
        console.log(
            `${colors.bright}${colors.bgYellow}${colors.white} 📊 SESSION PERFORMANCE SUMMARY ${colors.reset}`,
        );
        const metrics = performanceTracker.getAllMetrics();
        metrics.forEach((metric) => {
            if (metric.duration) {
                console.log(`${metric.name}: ${metric.duration.toFixed(2)}ms`);
            }
        });
    });
};
