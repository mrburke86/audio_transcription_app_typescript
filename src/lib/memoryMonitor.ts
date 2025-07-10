// // src/lib/memoryMonitor.ts
// // Simple memory monitoring for development

// export class MemoryMonitor {
//     private static instance: MemoryMonitor;
//     private measurements: Array<{
//         timestamp: number;
//         heapUsed: number;
//         storeSize: number;
//         componentsCount: number;
//     }> = [];

//     static getInstance() {
//         if (!this.instance) {
//             this.instance = new MemoryMonitor();
//         }
//         return this.instance;
//     }

//     // Measure current memory usage
//     measure(label?: string) {
//         if (typeof window === 'undefined') return;

//         const measurement = {
//             timestamp: Date.now(),
//             heapUsed: (performance as any).memory?.usedJSHeapSize || 0,
//             storeSize: this.getStoreSize(),
//             componentsCount: document.querySelectorAll('[data-component]').length,
//         };

//         this.measurements.push(measurement);

//         // Keep only last 100 measurements
//         if (this.measurements.length > 100) {
//             this.measurements.shift();
//         }

//         if (label && process.env.NODE_ENV === 'development') {
//             console.log(`📊 Memory [${label}]:`, {
//                 heapMB: Math.round(measurement.heapUsed / 1024 / 1024),
//                 storeKB: Math.round(measurement.storeSize / 1024),
//                 components: measurement.componentsCount,
//             });
//         }

//         return measurement;
//     }

//     // Calculate store size (simplified estimate)
//     private getStoreSize(): number {
//         try {
//             const store = (window as any).__appStore?.getState();
//             if (!store) return 0;

//             return JSON.stringify(store).length * 2; // Rough byte estimate
//         } catch {
//             return 0;
//         }
//     }

//     // Get memory usage over time
//     getMemoryTrend() {
//         if (this.measurements.length < 2) return null;

//         const first = this.measurements[0];
//         const last = this.measurements[this.measurements.length - 1];

//         return {
//             duration: last.timestamp - first.timestamp,
//             heapGrowth: last.heapUsed - first.heapUsed,
//             storeGrowth: last.storeSize - first.storeSize,
//             avgHeapUsage: this.measurements.reduce((sum, m) => sum + m.heapUsed, 0) / this.measurements.length,
//         };
//     }

//     // Alert on memory leaks
//     checkForLeaks() {
//         const trend = this.getMemoryTrend();
//         if (!trend) return false;

//         const mbGrowth = trend.heapGrowth / 1024 / 1024;
//         const isLeak = mbGrowth > 50; // Alert if growth > 50MB

//         if (isLeak && process.env.NODE_ENV === 'development') {
//             console.warn('🚨 Potential memory leak detected:', {
//                 growthMB: Math.round(mbGrowth),
//                 duration: Math.round(trend.duration / 1000) + 's',
//             });
//         }

//         return isLeak;
//     }
// }

// // ===== DEVELOPMENT HOOKS =====

// import { useEffect } from 'react';

// // Hook to monitor component memory usage
// export function useMemoryMonitor(componentName: string) {
//     useEffect(() => {
//         if (process.env.NODE_ENV !== 'development') return;

//         const monitor = MemoryMonitor.getInstance();

//         // Measure on mount
//         monitor.measure(`${componentName} mount`);

//         return () => {
//             // Measure on unmount
//             monitor.measure(`${componentName} unmount`);
//             monitor.checkForLeaks();
//         };
//     }, [componentName]);
// }

// // ===== MEASUREMENT SCRIPT (Run in browser console) =====

// export const measureMemoryDifference = () => {
//     console.log('🧪 Memory Measurement Tool');
//     console.log('Run this before and after the refactor to compare:');

//     const measurement = {
//         // Browser memory
//         heapSize: (performance as any).memory?.usedJSHeapSize || 0,
//         totalHeapSize: (performance as any).memory?.totalJSHeapSize || 0,

//         // Store size
//         storeSize: (() => {
//             try {
//                 const store = (window as any).__appStore?.getState();
//                 return store ? JSON.stringify(store).length : 0;
//             } catch {
//                 return 0;
//             }
//         })(),

//         // DOM elements
//         totalElements: document.querySelectorAll('*').length,
//         reactComponents: document.querySelectorAll('[data-reactroot] *').length,

//         // Event listeners (rough estimate)
//         eventListeners: (() => {
//             let count = 0;
//             document.querySelectorAll('*').forEach(el => {
//                 const listeners = (el as any).getEventListeners?.();
//                 if (listeners) {
//                     count += Object.keys(listeners).length;
//                 }
//             });
//             return count;
//         })(),
//     };

//     console.table({
//         'Heap Used (MB)': Math.round(measurement.heapSize / 1024 / 1024),
//         'Total Heap (MB)': Math.round(measurement.totalHeapSize / 1024 / 1024),
//         'Store Size (KB)': Math.round(measurement.storeSize / 1024),
//         'DOM Elements': measurement.totalElements,
//         'React Components': measurement.reactComponents,
//         'Event Listeners': measurement.eventListeners,
//     });

//     return measurement;
// };

// // ===== USAGE IN YOUR APP =====

// // Add to your main app component
// export function AppWithMemoryMonitoring({ children }: { children: React.ReactNode }) {
//     useMemoryMonitor('App');

//     useEffect(() => {
//         if (process.env.NODE_ENV === 'development') {
//             // Monitor every 30 seconds
//             const interval = setInterval(() => {
//                 MemoryMonitor.getInstance().checkForLeaks();
//             }, 30000);

//             // Global measurement function
//             (window as any).measureMemory = measureMemoryDifference;
//             console.log('💡 Run measureMemory() in console to check memory usage');

//             return () => clearInterval(interval);
//         }
//     }, []);

//     return <>{children}</>;
// }
