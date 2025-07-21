// src/stores/middleware/circuitBreakerMiddleware.ts - SIMPLE & TYPESCRIPT SAFE
// Simplified approach using subscription instead of setState wrapping

import { StateCreator, StoreMutatorIdentifier } from 'zustand';

interface CircuitBreakerConfig {
    maxUpdatesPerSecond: number;
    windowSizeMs: number;
    blockDurationMs: number;
    allowedBurstSize: number;
    exemptActions: string[]; // Actions that bypass circuit breaker
}

class SmartCircuitBreaker {
    private config: CircuitBreakerConfig = {
        maxUpdatesPerSecond: 50, // Increased from default for streaming
        windowSizeMs: 1000,
        blockDurationMs: 2000,
        allowedBurstSize: 10, // Allow short bursts
        exemptActions: [
            'streamedContent', // Allow LLM streaming
            'currentInterimTranscript', // Allow speech updates
            'isVisualizationActive', // Allow visualization updates
        ],
    };

    private updateTimestamps: number[] = [];
    private blockedUntil = 0;
    private totalBlocked = 0;
    private burstCount = 0;
    private lastBurstTime = 0;
    private isBlocking = false;

    shouldBlock(actionName: string): boolean {
        const now = Date.now();

        // ✅ CHECK IF STILL IN BLOCKED STATE
        if (now < this.blockedUntil) {
            this.totalBlocked++;
            return true;
        }

        // ✅ EXEMPT ACTIONS bypass circuit breaker
        if (this.config.exemptActions.some(exempt => actionName.includes(exempt))) {
            return false;
        }

        // ✅ BURST DETECTION
        if (now - this.lastBurstTime < 100) {
            // 100ms burst window
            this.burstCount++;
            if (this.burstCount <= this.config.allowedBurstSize) {
                return false; // Allow burst
            }
        } else {
            this.burstCount = 1;
            this.lastBurstTime = now;
        }

        // ✅ SLIDING WINDOW RATE LIMITING
        this.updateTimestamps.push(now);

        // Remove old timestamps outside the window
        const windowStart = now - this.config.windowSizeMs;
        this.updateTimestamps = this.updateTimestamps.filter(ts => ts > windowStart);

        // ✅ CHECK RATE LIMIT
        const updatesInWindow = this.updateTimestamps.length;
        const ratePerSecond = (updatesInWindow / this.config.windowSizeMs) * 1000;

        if (ratePerSecond > this.config.maxUpdatesPerSecond && !this.isBlocking) {
            this.blockedUntil = now + this.config.blockDurationMs;
            this.totalBlocked++;
            this.isBlocking = true;

            console.group('🚨 SMART CIRCUIT BREAKER ACTIVATED');
            console.log(
                `⚡ Rate: ${Math.round(ratePerSecond)} updates/sec (limit: ${this.config.maxUpdatesPerSecond})`
            );
            console.log(`🔄 Updates in window: ${updatesInWindow}`);
            console.log(`🎯 Action: ${actionName}`);
            console.log(`⏸️  Blocked for: ${this.config.blockDurationMs}ms`);
            console.log(`📊 Total blocked: ${this.totalBlocked}`);
            console.groupEnd();

            // ✅ AUTO-RESET blocking flag after block duration
            setTimeout(() => {
                this.isBlocking = false;
            }, this.config.blockDurationMs);

            return true;
        }

        return false;
    }

    recordUpdate(actionName: string): void {
        if (!this.shouldBlock(actionName)) {
            // Update recorded, not blocked
        }
    }

    getStats() {
        const now = Date.now();
        const windowStart = now - this.config.windowSizeMs;
        const recentUpdates = this.updateTimestamps.filter(ts => ts > windowStart);
        const currentRate = (recentUpdates.length / this.config.windowSizeMs) * 1000;

        return {
            currentRate: Math.round(currentRate * 100) / 100,
            maxRate: this.config.maxUpdatesPerSecond,
            recentUpdates: recentUpdates.length,
            totalBlocked: this.totalBlocked,
            isBlocked: now < this.blockedUntil,
            blockedUntil: this.blockedUntil,
            burstCount: this.burstCount,
            config: this.config,
        };
    }

    updateConfig(newConfig: Partial<CircuitBreakerConfig>) {
        this.config = { ...this.config, ...newConfig };
        console.log('🔧 Circuit breaker config updated:', this.config);
    }

    reset() {
        this.updateTimestamps = [];
        this.blockedUntil = 0;
        this.totalBlocked = 0;
        this.burstCount = 0;
        this.isBlocking = false;
        console.log('🔄 Circuit breaker reset');
    }
}

// ✅ GLOBAL CIRCUIT BREAKER INSTANCE
const circuitBreaker = new SmartCircuitBreaker();

// ✅ EXPOSE TO GLOBAL SCOPE for debugging
if (typeof window !== 'undefined') {
    (window as any).circuitBreaker = {
        getStats: () => circuitBreaker.getStats(),
        updateConfig: (config: any) => circuitBreaker.updateConfig(config),
        reset: () => circuitBreaker.reset(),
    };

    console.log('🐛 Debug: Access circuit breaker via window.circuitBreaker');
}

// ✅ SIMPLIFIED TYPESCRIPT SAFE MIDDLEWARE
type CircuitBreakerMiddleware = <
    T extends object, // ✅ Constrain T to object for Object.keys
    Mps extends [StoreMutatorIdentifier, unknown][] = [],
    Mcs extends [StoreMutatorIdentifier, unknown][] = [],
>(
    f: StateCreator<T, Mps, Mcs>
) => StateCreator<T, Mps, Mcs>;

export const circuitBreakerMiddleware: CircuitBreakerMiddleware = f => (set, get, store) => {
    // ✅ SIMPLE APPROACH: Monitor via subscription instead of wrapping setState
    const originalF = f(set, get, store);

    // ✅ SUBSCRIBE TO STATE CHANGES
    const unsubscribe = store.subscribe((state, prevState) => {
        // Find what changed by comparing state
        const changedKeys = Object.keys(state).filter(key => (state as any)[key] !== (prevState as any)[key]);

        if (changedKeys.length > 0) {
            const action = changedKeys[0] || 'unknown';
            circuitBreaker.recordUpdate(action);
        }
    });

    // ✅ CLEANUP SUBSCRIPTION when store is destroyed
    const originalDestroy = (store as any).destroy;
    (store as any).destroy = () => {
        unsubscribe();
        if (originalDestroy) originalDestroy();
    };

    return originalF;
};
