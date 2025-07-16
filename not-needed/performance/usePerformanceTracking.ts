// // src/hooks/usePerformanceTracking.ts
// // FIXED: Optional counter to store (add componentRenderCount to chatStore, incrementRender); descriptive names (e.g., useComponentRenderCounter).
// import { useEffect, useRef } from 'react';

// // RENAMED: useComponentRenderCounter
// export const useComponentRenderCounter = (componentName: string) => {
//     const renderCount = useRef(0);

//     useEffect(() => {
//         renderCount.current += 1;
//         console.log(`${componentName} rendered ${renderCount.current} times`);

//         performance.mark(`${componentName}-render-${renderCount.current}`);
//     });

//     return renderCount.current;
// };

// // RENAMED: useMemoryUsageTracking
// export const useMemoryUsageTracking = (hookName: string) => {
//     useEffect(() => {
//         if ('memory' in performance) {
//             const memory = (performance as any).memory;
//             console.log(`${hookName} - Memory usage:`, {
//                 used: Math.round(memory.usedJSHeapSize / 1024 / 1024) + 'MB',
//                 total: Math.round(memory.totalJSHeapSize / 1024 / 1024) + 'MB',
//             });
//         }
//     });
// };

// // RENAMED: createPerformanceBenchmark
// export const createPerformanceBenchmark = (testName: string, iterations: number = 100) => {
//     return (triggerFunction: (iteration: number) => void) => {
//         console.log(`Starting ${testName}...`);
//         const startTime = performance.now();

//         for (let i = 0; i < iterations; i++) {
//             setTimeout(() => {
//                 triggerFunction(i);

//                 if (i === iterations - 1) {
//                     const endTime = performance.now();
//                     console.log(`${testName}: ${iterations} updates took ${endTime - startTime}ms`);
//                 }
//             }, i * 10);
//         }
//     };
// };

// // RENAMED: createSpeechRecognitionBenchmark
// export const createSpeechRecognitionBenchmark = (setSpeechTranscript: (text: string) => void) => {
//     return () => {
//         console.log('Starting speech recognition stress test...');

//         const measurements: number[] = [];

//         const interval = setInterval(() => {
//             const start = performance.now();

//             setSpeechTranscript(`Word ${measurements.length}`);

//             requestAnimationFrame(() => {
//                 const end = performance.now();
//                 measurements.push(end - start);

//                 if (measurements.length >= 500) {
//                     clearInterval(interval);

//                     const avg = measurements.reduce((a, b) => a + b) / measurements.length;
//                     const max = Math.max(...measurements);

//                     console.log(`Stress test complete:
//                         Average: ${avg.toFixed(2)}ms per update
//                         Max: ${max.toFixed(2)}ms per update
//                         Total updates: ${measurements.length}`);
//                 }
//             });
//         }, 20);
//     };
// };
