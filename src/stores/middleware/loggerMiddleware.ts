// src/stores/middleware/loggerMiddleware.ts - FIXED: TypeScript compatible version
// Fixes middleware typing issues and TypeScript overload mismatch

import { StateCreator, StoreMutatorIdentifier } from 'zustand';

interface LogStats {
    totalUpdates: number;
    updatesBySlice: Record<string, number>;
    recentUpdates: Array<{ timestamp: number; slice: string; action: string }>;
    startTime: number;
    lastReset: number;
}

class SmartLogger {
    private stats: LogStats = {
        totalUpdates: 0,
        updatesBySlice: {},
        recentUpdates: [],
        startTime: Date.now(),
        lastReset: Date.now(),
    };

    private logFilters = {
        // ✅ FILTER OUT NOISY UPDATES
        ignoredActions: [
            'streamedContent', // LLM streaming (too frequent)
            'currentInterimTranscript', // Speech interim updates
            'speechErrorMessage', // Temporary error states
        ],

        // ✅ SLICE-SPECIFIC LIMITS
        sliceLimits: {
            llm: 5, // Max 5 LLM logs per session
            speech: 10, // Max 10 speech logs per session
            chat: 20, // Max 20 chat logs per session
        },

        // ✅ TIME-BASED FILTERING
        minTimeBetweenLogs: 100, // Min 100ms between similar logs
    };

    private recentActions = new Map<string, number>();

    shouldLog(action: string, slice: string): boolean {
        const now = Date.now();

        // ✅ FILTER 1: Ignored actions
        if (this.logFilters.ignoredActions.some(ignored => action.includes(ignored))) {
            return false;
        }

        // ✅ FILTER 2: Slice limits
        const sliceCount = this.stats.updatesBySlice[slice] || 0;
        const sliceLimit = this.logFilters.sliceLimits[slice as keyof typeof this.logFilters.sliceLimits] || 50;
        if (sliceCount >= sliceLimit) {
            return false;
        }

        // ✅ FILTER 3: Time-based deduplication
        const lastTime = this.recentActions.get(action) || 0;
        if (now - lastTime < this.logFilters.minTimeBetweenLogs) {
            return false;
        }

        this.recentActions.set(action, now);
        return true;
    }

    logUpdate(action: string, slice: string, state: any): void {
        if (!this.shouldLog(action, slice)) {
            // ✅ STILL COUNT ALL UPDATES (even filtered ones)
            this.stats.totalUpdates++;
            this.stats.updatesBySlice[slice] = (this.stats.updatesBySlice[slice] || 0) + 1;
            return;
        }

        const now = Date.now();

        // ✅ UPDATE STATS
        this.stats.totalUpdates++;
        this.stats.updatesBySlice[slice] = (this.stats.updatesBySlice[slice] || 0) + 1;
        this.stats.recentUpdates.push({ timestamp: now, slice, action });

        // ✅ KEEP ONLY RECENT UPDATES (sliding window)
        if (this.stats.recentUpdates.length > 50) {
            this.stats.recentUpdates = this.stats.recentUpdates.slice(-50);
        }

        // ✅ SMART LOGGING with context
        console.group(`🧠 Zustand Update [${slice}]`);
        console.log(`🎯 Action: ${action}`);
        console.log(`📊 Stats: ${this.stats.totalUpdates} total, ${this.stats.updatesBySlice[slice]} in ${slice}`);

        // ✅ CONDITIONAL DEEP LOGGING (only for important actions)
        if (this.isImportantAction(action)) {
            console.log(`📥 State:`, state);
            console.trace(`🔍 Stack Trace`);
        }

        console.groupEnd();
    }

    private isImportantAction(action: string): boolean {
        const importantActions = [
            'addMessage',
            'generateResponse',
            'initializeLLMService',
            'setInitialContext',
            'startSpeechSession',
            'clearHistory',
        ];

        return importantActions.some(important => action.includes(important));
    }

    getStats(): LogStats & {
        updatesPerSecond: number;
        sessionDuration: number;
        topSlices: Array<{ slice: string; count: number }>;
    } {
        const now = Date.now();
        const sessionDuration = now - this.stats.startTime;
        const updatesPerSecond = this.stats.totalUpdates / (sessionDuration / 1000);

        const topSlices = Object.entries(this.stats.updatesBySlice)
            .sort(([, a], [, b]) => b - a)
            .slice(0, 5)
            .map(([slice, count]) => ({ slice, count }));

        return {
            ...this.stats,
            updatesPerSecond: Math.round(updatesPerSecond * 100) / 100,
            sessionDuration: Math.round(sessionDuration / 1000),
            topSlices,
        };
    }

    printStats(): void {
        const stats = this.getStats();

        console.group('📊 Zustand Logger Stats');
        console.log(`⏱️  Session Duration: ${stats.sessionDuration}s`);
        console.log(`🔄 Total Updates: ${stats.totalUpdates}`);
        console.log(`⚡ Updates/Second: ${stats.updatesPerSecond}`);
        console.log(`🏆 Top Slices:`, stats.topSlices);
        console.log(`📈 Updates by Slice:`, stats.updatesBySlice);
        console.log(`⏰ Recent Activity:`, stats.recentUpdates.slice(-10));
        console.groupEnd();
    }

    reset(): void {
        this.stats = {
            totalUpdates: 0,
            updatesBySlice: {},
            recentUpdates: [],
            startTime: Date.now(),
            lastReset: Date.now(),
        };
        this.recentActions.clear();
        console.log('🔄 Logger stats reset');
    }
}

// ✅ GLOBAL LOGGER INSTANCE
const smartLogger = new SmartLogger();

// ✅ EXPOSE STATS TO GLOBAL SCOPE for debugging
if (typeof window !== 'undefined') {
    (window as any).zustandStats = {
        getStats: () => smartLogger.getStats(),
        printStats: () => smartLogger.printStats(),
        reset: () => smartLogger.reset(),
    };

    console.log('🐛 Debug: Access Zustand stats via window.zustandStats');
}

// ✅ AUTO-PRINT STATS every 30 seconds in dev mode
if (typeof window !== 'undefined' && process.env.NODE_ENV === 'development') {
    setInterval(() => {
        const stats = smartLogger.getStats();
        if (stats.totalUpdates > 0) {
            console.log(
                `📊 [Auto-Stats] ${stats.totalUpdates} updates, ${stats.updatesPerSecond}/sec, top: ${stats.topSlices[0]?.slice || 'none'}`
            );
        }
    }, 30000);
}

// ✅ FIXED: Proper TypeScript middleware typing
type LoggerMiddleware = <
    T,
    Mps extends [StoreMutatorIdentifier, unknown][] = [],
    Mcs extends [StoreMutatorIdentifier, unknown][] = [],
>(
    f: StateCreator<T, Mps, Mcs>,
    name?: string
) => StateCreator<T, Mps, Mcs>;

export const loggerMiddleware: LoggerMiddleware = (f, name) => (set, get, store) => {
    const loggedSet = (...args: [any, boolean?]) => {
        const partial = args[0];
        const replace = args[1];
        // ✅ EXTRACT ACTION INFO
        let actionName = 'unknown';
        let sliceName = name || 'unknown';

        if (typeof partial === 'function') {
            actionName = partial.name || 'anonymous';
        } else if (typeof partial === 'object' && partial !== null) {
            // Try to infer action from object keys
            actionName = Object.keys(partial as Record<string, unknown>)[0] || 'objectUpdate';
        }

        // ✅ INFER SLICE from action name or store state
        if (actionName.includes('Message') || actionName.includes('chat')) sliceName = 'chat';
        else if (
            actionName.includes('Speech') ||
            actionName.includes('Recognition') ||
            actionName.includes('transcript')
        )
            sliceName = 'speech';
        else if (actionName.includes('Context') || actionName.includes('context')) sliceName = 'context';
        else if (actionName.includes('llm') || actionName.includes('stream') || actionName.includes('generate'))
            sliceName = 'llm';
        else if (actionName.includes('UI') || actionName.includes('navigate')) sliceName = 'ui';
        else if (actionName.includes('knowledge') || actionName.includes('Knowledge')) sliceName = 'knowledge';

        // ✅ LOG UPDATE with smart filtering
        smartLogger.logUpdate(actionName, sliceName, partial);

        // ✅ EXECUTE ORIGINAL SET with explicit overload handling
        if (replace === true) {
            set(partial, true);
        } else {
            set(partial);
        }
    };

    return f(loggedSet as typeof set, get, store);
};
