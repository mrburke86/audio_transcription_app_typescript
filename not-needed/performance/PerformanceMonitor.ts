// // src\utils\performance\PerformanceMonitor.ts

// interface ApiRequestTracker {
//     success: () => void;
//     failure: () => void;
// }

// interface PerformanceMetrics {
//     // State Management
//     duplicateStateUpdates: number;
//     stateDesyncs: number;

//     // Memory Management
//     speechInstancesCreated: number;
//     speechInstancesDestroyed: number;
//     activeInstances: number;

//     // Vector Search
//     vectorSearches: {
//         total: number;
//         fromCache: number;
//         fromApi: number;
//         avgCacheTime: number;
//         avgApiTime: number;
//     };

//     // Component Rendering
//     componentRenders: {
//         total: number;
//         necessary: number;
//         unnecessary: number;
//         unnecessaryRate: string;
//     };

//     // API Reliability
//     apiRequests: {
//         total: number;
//         successful: number;
//         failed: number;
//         successRate: string;
//         avgLatency: number;
//     };

//     // API Performance by endpoint
//     apiPerformance: Record<
//         string,
//         {
//             calls: number;
//             avgLatency: number;
//             minLatency: number;
//             maxLatency: number;
//             p50: number;
//             p95: number;
//             p99: number;
//             errors: number;
//             errorRate: string;
//         }
//     >;

//     // Timestamps
//     sessionStart: string;
//     lastUpdated: string;
//     exportedAt?: string;
// }

// export class PerformanceMonitor {
//     // State Management Metrics
//     private duplicateStateUpdates = 0;
//     private stateDesyncs = 0;

//     // Memory Management Metrics
//     private speechInstancesCreated = 0;
//     private speechInstancesDestroyed = 0;

//     // Vector Search Metrics
//     private vectorSearchCount = 0;
//     private vectorCacheHits = 0;
//     private vectorApiCalls = 0;
//     private vectorCacheTimes: number[] = [];
//     private vectorApiTimes: number[] = [];

//     // Component Rendering Metrics
//     private totalRenders = 0;
//     private necessaryRenders = 0;
//     private unnecessaryRenders = 0;

//     // API Reliability Metrics
//     private totalApiRequests = 0;
//     private successfulApiRequests = 0;
//     private failedApiRequests = 0;
//     private apiLatencies: number[] = [];

//     // Enhanced API Tracking
//     private apiLatenciesByEndpoint: Map<string, number[]> = new Map();
//     private apiErrorsByEndpoint: Map<string, string[]> = new Map();

//     // Session Management
//     private readonly sessionStart = new Date().toISOString();
//     private lastUpdated = new Date().toISOString();

//     constructor() {
//         console.log('🚀 PerformanceMonitor initialized');
//     }

//     // ===== STATE MANAGEMENT TRACKING =====

//     trackDuplicateStateUpdate(): void {
//         this.duplicateStateUpdates++;
//         this.updateTimestamp();
//     }

//     trackStateDesync(): void {
//         this.stateDesyncs++;
//         this.updateTimestamp();
//     }

//     // ===== MEMORY MANAGEMENT TRACKING =====

//     trackSpeechInstanceCreated(): void {
//         this.speechInstancesCreated++;
//         this.updateTimestamp();
//     }

//     trackSpeechInstanceDestroyed(): void {
//         this.speechInstancesDestroyed++;
//         this.updateTimestamp();
//     }

//     trackMemoryWarning(): void {
//         console.warn('⚠️ Memory warning tracked by PerformanceMonitor');
//         this.updateTimestamp();
//     }

//     getCurrentActiveInstances(): number {
//         return this.speechInstancesCreated - this.speechInstancesDestroyed;
//     }

//     // ===== VECTOR SEARCH TRACKING =====

//     trackVectorSearchStart(): number {
//         this.vectorSearchCount++;
//         this.updateTimestamp();
//         return performance.now();
//     }

//     trackVectorSearchEnd(startTime: number, fromCache: boolean): void {
//         const duration = performance.now() - startTime;

//         if (fromCache) {
//             this.vectorCacheHits++;
//             this.vectorCacheTimes.push(duration);
//             // Keep only last 100 cache times
//             if (this.vectorCacheTimes.length > 100) {
//                 this.vectorCacheTimes.shift();
//             }
//         } else {
//             this.vectorApiCalls++;
//             this.vectorApiTimes.push(duration);
//             // Keep only last 100 API times
//             if (this.vectorApiTimes.length > 100) {
//                 this.vectorApiTimes.shift();
//             }
//         }

//         this.updateTimestamp();
//     }

//     // ===== COMPONENT RENDERING TRACKING =====

//     trackComponentRender(wasNecessary: boolean): void {
//         this.totalRenders++;

//         if (wasNecessary) {
//             this.necessaryRenders++;
//         } else {
//             this.unnecessaryRenders++;
//         }

//         this.updateTimestamp();
//     }

//     // ===== API RELIABILITY TRACKING =====

//     trackApiRequest(): ApiRequestTracker {
//         this.totalApiRequests++;
//         const startTime = performance.now();

//         return {
//             success: () => {
//                 this.successfulApiRequests++;
//                 const duration = performance.now() - startTime;
//                 this.apiLatencies.push(duration);

//                 // Keep only last 1000 latencies for memory efficiency
//                 if (this.apiLatencies.length > 1000) {
//                     this.apiLatencies.shift();
//                 }

//                 this.updateTimestamp();
//             },
//             failure: () => {
//                 this.failedApiRequests++;
//                 this.updateTimestamp();
//             },
//         };
//     }

//     // ===== ENHANCED API TRACKING =====

//     trackApiLatency(apiName: string, duration: number): void {
//         if (!this.apiLatenciesByEndpoint.has(apiName)) {
//             this.apiLatenciesByEndpoint.set(apiName, []);
//         }
//         this.apiLatenciesByEndpoint.get(apiName)!.push(duration);

//         // Keep only last 200 measurements per API
//         const latencies = this.apiLatenciesByEndpoint.get(apiName)!;
//         if (latencies.length > 200) {
//             latencies.shift();
//         }

//         this.updateTimestamp();
//     }

//     trackApiError(apiName: string, errorMessage: string): void {
//         if (!this.apiErrorsByEndpoint.has(apiName)) {
//             this.apiErrorsByEndpoint.set(apiName, []);
//         }
//         this.apiErrorsByEndpoint.get(apiName)!.push(errorMessage);

//         // Keep only last 100 errors per API
//         const errors = this.apiErrorsByEndpoint.get(apiName)!;
//         if (errors.length > 100) {
//             errors.shift();
//         }

//         this.updateTimestamp();
//     }

//     // ===== UTILITY METHODS =====

//     private updateTimestamp(): void {
//         this.lastUpdated = new Date().toISOString();
//     }

//     private calculateAverage(numbers: number[]): number {
//         if (numbers.length === 0) return 0;
//         return Math.round(numbers.reduce((sum, val) => sum + val, 0) / numbers.length);
//     }

//     private calculatePercentile(numbers: number[], percentile: number): number {
//         if (numbers.length === 0) return 0;
//         const sorted = [...numbers].sort((a, b) => a - b);
//         const index = Math.floor(sorted.length * percentile);
//         return sorted[index] || 0;
//     }

//     // ===== REAL-TIME STATUS =====

//     getApiStatus(): Record<string, any> {
//         const status: Record<string, any> = {};

//         this.apiLatenciesByEndpoint.forEach((latencies, apiName) => {
//             const recentCalls = latencies.slice(-10); // Last 10 calls
//             const recentErrors = this.apiErrorsByEndpoint.get(apiName)?.slice(-5) || []; // Last 5 errors

//             status[apiName] = {
//                 isHealthy: recentCalls.length > 0 && recentErrors.length === 0,
//                 recentAvgLatency:
//                     recentCalls.length > 0
//                         ? Math.round(recentCalls.reduce((sum, val) => sum + val, 0) / recentCalls.length)
//                         : 0,
//                 recentErrorCount: recentErrors.length,
//                 lastError: recentErrors[recentErrors.length - 1] || null,
//                 totalCalls: latencies.length,
//                 totalErrors: this.apiErrorsByEndpoint.get(apiName)?.length || 0,
//             };
//         });

//         return status;
//     }

//     getCurrentMetrics(): Partial<PerformanceMetrics> {
//         return {
//             // State Management
//             duplicateStateUpdates: this.duplicateStateUpdates,
//             stateDesyncs: this.stateDesyncs,

//             // Memory Management
//             speechInstancesCreated: this.speechInstancesCreated,
//             speechInstancesDestroyed: this.speechInstancesDestroyed,
//             activeInstances: this.getCurrentActiveInstances(),

//             // API Reliability (basic)
//             apiRequests: {
//                 total: this.totalApiRequests,
//                 successful: this.successfulApiRequests,
//                 failed: this.failedApiRequests,
//                 successRate:
//                     this.totalApiRequests > 0
//                         ? ((this.successfulApiRequests / this.totalApiRequests) * 100).toFixed(2) + '%'
//                         : '0%',
//                 avgLatency: this.calculateAverage(this.apiLatencies),
//             },

//             // Timestamps
//             lastUpdated: this.lastUpdated,
//         };
//     }

//     // ===== COMPREHENSIVE METRICS EXPORT =====

//     exportMetrics(): PerformanceMetrics {
//         // Calculate API performance by endpoint
//         const apiPerformance: Record<string, any> = {};

//         this.apiLatenciesByEndpoint.forEach((latencies, apiName) => {
//             if (latencies.length > 0) {
//                 const sorted = [...latencies].sort((a, b) => a - b);
//                 const errorCount = this.apiErrorsByEndpoint.get(apiName)?.length || 0;

//                 apiPerformance[apiName] = {
//                     calls: latencies.length,
//                     avgLatency: this.calculateAverage(latencies),
//                     minLatency: Math.min(...latencies),
//                     maxLatency: Math.max(...latencies),
//                     p50: this.calculatePercentile(sorted, 0.5),
//                     p95: this.calculatePercentile(sorted, 0.95),
//                     p99: this.calculatePercentile(sorted, 0.99),
//                     errors: errorCount,
//                     errorRate: ((errorCount / latencies.length) * 100).toFixed(2) + '%',
//                 };
//             }
//         });

//         const metrics: PerformanceMetrics = {
//             // State Management
//             duplicateStateUpdates: this.duplicateStateUpdates,
//             stateDesyncs: this.stateDesyncs,

//             // Memory Management
//             speechInstancesCreated: this.speechInstancesCreated,
//             speechInstancesDestroyed: this.speechInstancesDestroyed,
//             activeInstances: this.getCurrentActiveInstances(),

//             // Vector Search
//             vectorSearches: {
//                 total: this.vectorSearchCount,
//                 fromCache: this.vectorCacheHits,
//                 fromApi: this.vectorApiCalls,
//                 avgCacheTime: this.calculateAverage(this.vectorCacheTimes),
//                 avgApiTime: this.calculateAverage(this.vectorApiTimes),
//             },

//             // Component Rendering
//             componentRenders: {
//                 total: this.totalRenders,
//                 necessary: this.necessaryRenders,
//                 unnecessary: this.unnecessaryRenders,
//                 unnecessaryRate:
//                     this.totalRenders > 0
//                         ? ((this.unnecessaryRenders / this.totalRenders) * 100).toFixed(2) + '%'
//                         : '0%',
//             },

//             // API Reliability (basic)
//             apiRequests: {
//                 total: this.totalApiRequests,
//                 successful: this.successfulApiRequests,
//                 failed: this.failedApiRequests,
//                 successRate:
//                     this.totalApiRequests > 0
//                         ? ((this.successfulApiRequests / this.totalApiRequests) * 100).toFixed(2) + '%'
//                         : '0%',
//                 avgLatency: this.calculateAverage(this.apiLatencies),
//             },

//             // Enhanced API Performance
//             apiPerformance,

//             // Timestamps
//             sessionStart: this.sessionStart,
//             lastUpdated: this.lastUpdated,
//             exportedAt: new Date().toISOString(),
//         };

//         console.log('📊 Performance metrics exported:', metrics);
//         return metrics;
//     }

//     // ===== RESET FUNCTIONALITY =====

//     reset(): void {
//         // State Management
//         this.duplicateStateUpdates = 0;
//         this.stateDesyncs = 0;

//         // Memory Management
//         this.speechInstancesCreated = 0;
//         this.speechInstancesDestroyed = 0;

//         // Vector Search
//         this.vectorSearchCount = 0;
//         this.vectorCacheHits = 0;
//         this.vectorApiCalls = 0;
//         this.vectorCacheTimes = [];
//         this.vectorApiTimes = [];

//         // Component Rendering
//         this.totalRenders = 0;
//         this.necessaryRenders = 0;
//         this.unnecessaryRenders = 0;

//         // API Reliability
//         this.totalApiRequests = 0;
//         this.successfulApiRequests = 0;
//         this.failedApiRequests = 0;
//         this.apiLatencies = [];

//         // Enhanced API Tracking
//         this.apiLatenciesByEndpoint.clear();
//         this.apiErrorsByEndpoint.clear();

//         // Update timestamp
//         this.lastUpdated = new Date().toISOString();

//         console.log('🔄 PerformanceMonitor reset - all metrics cleared');
//     }

//     // ===== DEBUG HELPERS =====

//     logCurrentStatus(): void {
//         const metrics = this.getCurrentMetrics();
//         console.log('📊 Current Performance Status:', {
//             duplicateStates: metrics.duplicateStateUpdates,
//             memoryLeaks: metrics.activeInstances,
//             apiSuccess: metrics.apiRequests?.successRate,
//             lastUpdate: metrics.lastUpdated,
//         });
//     }

//     // ===== PERFORMANCE WARNINGS =====

//     checkForPerformanceIssues(): string[] {
//         const warnings: string[] = [];

//         // Check for excessive state updates
//         if (this.duplicateStateUpdates > 10) {
//             warnings.push(`⚠️ High duplicate state updates: ${this.duplicateStateUpdates}`);
//         }

//         // Check for memory leaks
//         const activeInstances = this.getCurrentActiveInstances();
//         if (activeInstances > 5) {
//             warnings.push(`⚠️ Potential memory leak: ${activeInstances} active instances`);
//         }

//         // Check for poor API performance
//         const recentLatencies = this.apiLatencies.slice(-20);
//         if (recentLatencies.length > 0) {
//             const avgRecent = this.calculateAverage(recentLatencies);
//             if (avgRecent > 5000) {
//                 // 5 seconds
//                 warnings.push(`⚠️ Slow API performance: ${avgRecent}ms average`);
//             }
//         }

//         // Check API success rate
//         if (this.totalApiRequests > 10) {
//             const successRate = (this.successfulApiRequests / this.totalApiRequests) * 100;
//             if (successRate < 90) {
//                 warnings.push(`⚠️ Low API success rate: ${successRate.toFixed(1)}%`);
//             }
//         }

//         // Check render efficiency
//         if (this.totalRenders > 20) {
//             const unnecessaryRate = (this.unnecessaryRenders / this.totalRenders) * 100;
//             if (unnecessaryRate > 25) {
//                 warnings.push(`⚠️ High unnecessary render rate: ${unnecessaryRate.toFixed(1)}%`);
//             }
//         }

//         return warnings;
//     }
// }

// //     // ===== BACKWARD COMPATIBILITY =====

// //     // Legacy method name for existing code
// // getMetrics(): PerformanceMetrics {
// //     return this.exportMetrics();
// // }
// // }

// // ===== SINGLETON INSTANCE =====
// export const performanceMonitor = new PerformanceMonitor();
