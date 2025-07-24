// src/stores/middleware/circuitBreakerMiddleware.ts - CHAT-OPTIMIZED VERSION

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
        maxUpdatesPerSecond: 100, // ✅ INCREASED: Chat interfaces need higher throughput
        windowSizeMs: 1000,
        blockDurationMs: 1000, // ✅ REDUCED: Shorter block duration
        allowedBurstSize: 20, // ✅ INCREASED: Allow larger bursts for typing
        exemptActions: [
            // ✅ EXPANDED: More exemptions for chat functionality
            'streamedContent', // Allow LLM streaming
            'currentInterimTranscript', // Allow speech updates
            'isVisualizationActive', // Allow visualization updates
            'recognitionStatus', // Allow speech status changes
            'speechErrorMessage', // Allow error updates
            'contextLoading', // Allow context loading states
            'isStreamingComplete', // Allow streaming completion
            'llmLoading', // Allow LLM loading states
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

        // ✅ BURST DETECTION (more lenient for chat)
        if (now - this.lastBurstTime < 200) {
            // ✅ INCREASED: 200ms burst window
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

            // ✅ LESS VERBOSE LOGGING for chat
            console.warn(
                `🚨 Circuit Breaker: ${Math.round(ratePerSecond)}/sec (limit: ${this.config.maxUpdatesPerSecond}) - blocked ${this.config.blockDurationMs}ms`
            );

            // ✅ AUTO-RESET blocking flag after block duration
            setTimeout(() => {
                this.isBlocking = false;
                console.log('✅ Circuit breaker reset');
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
    T extends object,
    Mps extends [StoreMutatorIdentifier, unknown][] = [],
    Mcs extends [StoreMutatorIdentifier, unknown][] = [],
>(
    f: StateCreator<T, Mps, Mcs>
) => StateCreator<T, Mps, Mcs>;

export const circuitBreakerMiddleware: CircuitBreakerMiddleware = f => (set, get, store) => {
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
