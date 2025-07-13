// // scripts/measurementAutomation.ts

// import fs from 'fs';
// import path from 'path';

// interface MeasurementConfig {
//   file: string;
//   insertions: Array<{
//     after: string;
//     code: string;
//     imports?: string[];
//   }>;
// }

// // Automated insertion configurations
// const MEASUREMENT_CONFIGS: MeasurementConfig[] = [
//   {
//     file: 'src/app/layout.tsx',
//     insertions: [{
//       after: 'import { Inter } from \'next/font/google\';',
//       code: `import PerformanceDashboard from '@/utils/performance/PerformanceDashboard';`,
//       imports: ['@/utils/performance/PerformanceDashboard']
//     }, {
//       after: '<TailwindIndicator />',
//       code: `{process.env.NODE_ENV === 'development' && <PerformanceDashboard />}`
//     }]
//   },
//   {
//     file: 'src/hooks/useTranscriptions.ts',
//     insertions: [{
//       after: 'import { formatTimestamp } from \'@/utils/helpers\';',
//       code: `import { useStateConsistencyTracker } from '@/utils/performance/measurementHooks';`,
//       imports: ['@/utils/performance/measurementHooks']
//     }, {
//       after: 'const [userMessages, setUserMessages] = useState<Message[]>([]);',
//       code: `    const { trackStateUpdate, checkStateConsistency } = useStateConsistencyTracker('useTranscriptions');`
//     }]
//   },
//   {
//     file: 'src/hooks/useSpeechRecognition.ts',
//     insertions: [{
//       after: 'import { logger } from \'@/modules/Logger\';',
//       code: `import { useMemoryLeakDetection, useSpeechPerformanceMetrics } from '@/utils/performance/measurementHooks';`,
//       imports: ['@/utils/performance/measurementHooks']
//     }]
//   }
// ];

// // Create measurement files
// export const createMeasurementFiles = () => {
//   const performanceDir = 'src/utils/performance';

//   if (!fs.existsSync(performanceDir)) {
//     fs.mkdirSync(performanceDir, { recursive: true });
//   }

//   // Copy measurement files from artifacts to actual files
//   // (This would be the actual file creation in a real implementation)

//   console.log('✅ Performance measurement files created');
// };

// // Auto-insert measurement code
// export const insertMeasurementCode = () => {
//   MEASUREMENT_CONFIGS.forEach(config => {
//     const filePath = config.file;

//     if (!fs.existsSync(filePath)) {
//       console.warn(`⚠️ File not found: ${filePath}`);
//       return;
//     }

//     let content = fs.readFileSync(filePath, 'utf-8');
//     let modified = false;

//     config.insertions.forEach(insertion => {
//       if (content.includes(insertion.code)) {
//         console.log(`⏭️ Already exists in ${filePath}: ${insertion.code.substring(0, 50)}...`);
//         return;
//       }

//       const afterIndex = content.indexOf(insertion.after);
//       if (afterIndex === -1) {
//         console.warn(`⚠️ Could not find insertion point in ${filePath}: ${insertion.after}`);
//         return;
//       }

//       const insertIndex = afterIndex + insertion.after.length;
//       content = content.slice(0, insertIndex) + '\n' + insertion.code + content.slice(insertIndex);
//       modified = true;

//       console.log(`✅ Inserted measurement code in ${filePath}`);
//     });

//     if (modified) {
//       // Create backup
//       fs.writeFileSync(`${filePath}.backup`, fs.readFileSync(filePath));
//       fs.writeFileSync(filePath, content);
//     }
//   });
// };

// // Baseline measurement capture
// interface BaselineMetrics {
//   timestamp: string;
//   testScenario: string;
//   metrics: any;
//   environment: {
//     nodeVersion: string;
//     browser: string;
//     memoryLimit: string;
//   };
// }

// export const captureBaseline = async (testScenario: string = 'baseline'): Promise<BaselineMetrics> => {
//   console.log(`📊 Capturing baseline metrics for: ${testScenario}`);

//   // In a real implementation, this would:
//   // 1. Launch the app in a headless browser
//   // 2. Run a standard test scenario
//   // 3. Capture performance metrics
//   // 4. Save to a baseline file

//   const baseline: BaselineMetrics = {
//     timestamp: new Date().toISOString(),
//     testScenario,
//     metrics: {
//       // This would be populated from actual measurements
//       placeholder: 'Real metrics would be captured here'
//     },
//     environment: {
//       nodeVersion: process.version,
//       browser: 'Chrome/Playwright', // Would detect actual browser
//       memoryLimit: '4GB' // Would detect actual memory
//     }
//   };

//   const baselineDir = 'performance-baselines';
//   if (!fs.existsSync(baselineDir)) {
//     fs.mkdirSync(baselineDir);
//   }

//   const filename = `${baselineDir}/baseline-${testScenario}-${Date.now()}.json`;
//   fs.writeFileSync(filename, JSON.stringify(baseline, null, 2));

//   console.log(`✅ Baseline saved to: ${filename}`);
//   return baseline;
// };

// // Performance comparison
// interface ComparisonResult {
//   improvement: {
//     [metric: string]: {
//       before: number;
//       after: number;
//       change: number;
//       percentChange: number;
//       significant: boolean;
//     };
//   };
//   summary: {
//     totalImprovements: number;
//     significantImprovements: number;
//     regressions: number;
//   };
// }

// export const compareMetrics = (beforeFile: string, afterFile: string): ComparisonResult => {
//   const before = JSON.parse(fs.readFileSync(beforeFile, 'utf-8'));
//   const after = JSON.parse(fs.readFileSync(afterFile, 'utf-8'));

//   const comparison: ComparisonResult = {
//     improvement: {},
//     summary: {
//       totalImprovements: 0,
//       significantImprovements: 0,
//       regressions: 0
//     }
//   };

//   // Compare key metrics
//   const metricsToCompare = [
//     'memoryUsage.heapUsed',
//     'renderMetrics.totalRenders',
//     'renderMetrics.wastedRenders',
//     'vectorSearch.averageResponseTime',
//     'vectorSearch.cacheHitRate',
//     'apiReliability.failedRequests',
//     'speechPerformance.rendersDuringTranscription',
//     'conversationMemory.scrollPerformance'
//   ];

//   metricsToCompare.forEach(metric => {
//     const beforeValue = getNestedValue(before.metrics, metric);
//     const afterValue = getNestedValue(after.metrics, metric);

//     if (beforeValue !== undefined && afterValue !== undefined) {
//       const change = afterValue - beforeValue;
//       const percentChange = beforeValue !== 0 ? (change / beforeValue) * 100 : 0;
//       const significant = Math.abs(percentChange) > 10; // 10% threshold

//       comparison.improvement[metric] = {
//         before: beforeValue,
//         after: afterValue,
//         change,
//         percentChange,
//         significant
//       };

//       if (change < 0) comparison.summary.totalImprovements++;
//       if (change < 0 && significant) comparison.summary.significantImprovements++;
//       if (change > 0 && significant) comparison.summary.regressions++;
//     }
//   });

//   return comparison;
// };

// const getNestedValue = (obj: any, path: string): number | undefined => {
//   return path.split('.').reduce((current, key) => current?.[key], obj);
// };

// // Generate performance report
// export const generatePerformanceReport = (comparison: ComparisonResult): string => {
//   let report = '# Performance Optimization Report\n\n';

//   report += `## Summary\n`;
//   report += `- ✅ Total Improvements: ${comparison.summary.totalImprovements}\n`;
//   report += `- 🎯 Significant Improvements: ${comparison.summary.significantImprovements}\n`;
//   report += `- ⚠️ Regressions: ${comparison.summary.regressions}\n\n`;

//   report += `## Detailed Results\n\n`;

//   Object.entries(comparison.improvement).forEach(([metric, data]) => {
//     const emoji = data.change < 0 ? '✅' : data.change > 0 ? '❌' : '➡️';
//     const direction = data.change < 0 ? 'Improved' : data.change > 0 ? 'Regressed' : 'No Change';

//     report += `### ${emoji} ${metric}\n`;
//     report += `- **Status**: ${direction}\n`;
//     report += `- **Before**: ${data.before.toFixed(2)}\n`;
//     report += `- **After**: ${data.after.toFixed(2)}\n`;
//     report += `- **Change**: ${data.change.toFixed(2)} (${data.percentChange.toFixed(1)}%)\n`;
//     report += `- **Significant**: ${data.significant ? 'Yes' : 'No'}\n\n`;
//   });

//   return report;
// };

// // Main automation script
// export const runMeasurementSetup = async () => {
//   console.log('🚀 Starting performance measurement setup...\n');

//   try {
//     // Step 1: Create measurement files
//     createMeasurementFiles();

//     // Step 2: Insert measurement code
//     insertMeasurementCode();

//     // Step 3: Capture initial baseline
//     await captureBaseline('initial');

//     console.log('\n✅ Performance measurement setup complete!');
//     console.log('\nNext steps:');
//     console.log('1. Run your app: npm run dev');
//     console.log('2. Use the app for 2-3 minutes');
//     console.log('3. Click the "📊 Performance" button to view metrics');
//     console.log('4. Export baseline data');
//     console.log('5. Make your optimizations');
//     console.log('6. Capture new metrics and compare');

//   } catch (error) {
//     console.error('❌ Setup failed:', error);
//   }
// };

// // CLI interface
// if (require.main === module) {
//   const command = process.argv[2];

//   switch (command) {
//     case 'setup':
//       runMeasurementSetup();
//       break;
//     case 'baseline':
//       captureBaseline(process.argv[3] || 'manual');
//       break;
//     case 'compare':
//       const beforeFile = process.argv[3];
//       const afterFile = process.argv[4];
//       if (!beforeFile || !afterFile) {
//         console.error('Usage: npm run measure:compare <before-file> <after-file>');
//         process.exit(1);
//       }
//       const comparison = compareMetrics(beforeFile, afterFile);
//       const report = generatePerformanceReport(comparison);
//       console.log(report);
//       fs.writeFileSync('performance-report.md', report);
//       console.log('📝 Report saved to performance-report.md');
//       break;
//     default:
//       console.log('Available commands:');
//       console.log('  setup    - Set up performance measurement');
//       console.log('  baseline - Capture baseline metrics');
//       console.log('  compare  - Compare two metric files');
//   }
// }
