// src/utils/migrationUtils.ts
// Utility functions to help with migration from Assistant API to Chat Completions API

// import { logger } from '@/modules/Logger';

// export interface MigrationStats {
//     oldSystemTime: number;
//     newSystemTime: number;
//     improvementPercent: number;
//     improvementMs: number;
// }

// export interface KnowledgeSetupCheck {
//     filesPath: string;
//     expectedFiles: string[];
//     status: 'checking' | 'success' | 'partial' | 'failed';
//     loadedFiles: number;
//     totalFiles: number;
//     errors: string[];
// }

// // Performance comparison utilities
// export class PerformanceMigrationTracker {
//     private oldSystemBaseline: number[] = [];
//     private newSystemResults: number[] = [];

//     // Record baseline performance from old system
//     recordOldSystemTime(duration: number): void {
//         this.oldSystemBaseline.push(duration);
//         logger.info(
//             `[Migration] 📊 Recorded old system time: ${duration.toFixed(2)}ms`,
//         );
//     }

//     // Record new system performance
//     recordNewSystemTime(duration: number): void {
//         this.newSystemResults.push(duration);
//         logger.info(
//             `[Migration] 🚀 Recorded new system time: ${duration.toFixed(2)}ms`,
//         );
//     }

//     // Calculate improvement statistics
//     getImprovementStats(): MigrationStats | null {
//         if (
//             this.oldSystemBaseline.length === 0 ||
//             this.newSystemResults.length === 0
//         ) {
//             return null;
//         }

//         const avgOld =
//             this.oldSystemBaseline.reduce((a, b) => a + b, 0) /
//             this.oldSystemBaseline.length;
//         const avgNew =
//             this.newSystemResults.reduce((a, b) => a + b, 0) /
//             this.newSystemResults.length;

//         const improvementMs = avgOld - avgNew;
//         const improvementPercent = (improvementMs / avgOld) * 100;

//         return {
//             oldSystemTime: avgOld,
//             newSystemTime: avgNew,
//             improvementPercent,
//             improvementMs,
//         };
//     }

//     // Log performance comparison
//     logComparison(): void {
//         const stats = this.getImprovementStats();
//         if (!stats) {
//             logger.error(
//                 "[Migration] ⚠️ No performance data available for comparison",
//             );
//             return;
//         }

//         console.log("\n🎯 MIGRATION PERFORMANCE COMPARISON");
//         console.log("=====================================");
//         console.log(
//             `Old System (Assistant API):  ${stats.oldSystemTime.toFixed(2)}ms`,
//         );
//         console.log(
//             `New System (Chat Completions): ${stats.newSystemTime.toFixed(
//                 2,
//             )}ms`,
//         );
//         console.log(
//             `Improvement: ${stats.improvementMs.toFixed(
//                 2,
//             )}ms (${stats.improvementPercent.toFixed(1)}% faster)`,
//         );

//         if (stats.improvementPercent > 50) {
//             console.log("🎉 EXCELLENT IMPROVEMENT!");
//         } else if (stats.improvementPercent > 20) {
//             console.log("✅ Good improvement");
//         } else if (stats.improvementPercent > 0) {
//             console.log("📈 Slight improvement");
//         } else {
//             console.log(
//                 "⚠️ Performance may have regressed - check implementation",
//             );
//         }
//     }

//     // Clear all recorded data
//     reset(): void {
//         this.oldSystemBaseline = [];
//         this.newSystemResults = [];
//         logger.info("[Migration] 🧹 Performance tracking data cleared");
//     }
// }

// Global migration tracker instance
// export const migrationTracker = new PerformanceMigrationTracker();

// // Knowledge base setup verification
// export async function verifyKnowledgeSetup(
//     basePath: string = "/knowledge",
// ): Promise<KnowledgeSetupCheck> {
//     const expectedFiles = [
//         "ETQ_Accelerate_Overview.md",
//         "ETQ_Amplify_Platform.md",
//         "ETQ_Analytics_Intelligence.md",
//         "ETQ_Audit_Management.md",
//         "ETQ_CAPA_System.md",
//         "ETQ_Change_Control.md",
//         "ETQ_Compliance_Management.md",
//         "ETQ_Customer_Portal.md",
//         "ETQ_Document_Control.md",
//         "ETQ_Enterprise_Quality.md",
//         "ETQ_Environmental_Health_Safety.md",
//         "ETQ_Event_Management.md",
//         "ETQ_Improvement_Projects.md",
//         "ETQ_Incident_Management.md",
//         "ETQ_Issue_Management.md",
//         "ETQ_Learning_Management.md",
//         "ETQ_Management_Review.md",
//         "ETQ_Nonconformance_Management.md",
//         "ETQ_Observation_Management.md",
//         "ETQ_Process_Management.md",
//         "ETQ_Product_Quality.md",
//         "ETQ_Risk_Management.md",
//         "ETQ_Supplier_Management.md",
//         "ETQ_Training_Management.md",
//         "ETQ_Workflow_Engine.md",
//     ];

//     const result: KnowledgeSetupCheck = {
//         filesPath: basePath,
//         expectedFiles,
//         status: "checking",
//         loadedFiles: 0,
//         totalFiles: expectedFiles.length,
//         errors: [],
//     };

//     try {
//         const checkPromises = expectedFiles.map(async (filename) => {
//             try {
//                 const response = await fetch(`${basePath}/${filename}`);
//                 if (!response.ok) {
//                     throw new Error(
//                         `HTTP ${response.status}: ${response.statusText}`,
//                     );
//                 }
//                 const content = await response.text();
//                 if (content.length < 100) {
//                     throw new Error("File appears to be empty or too small");
//                 }
//                 return { filename, success: true, error: null };
//             } catch (error) {
//                 return {
//                     filename,
//                     success: false,
//                     error:
//                         error instanceof Error
//                             ? error.message
//                             : "Unknown error",
//                 };
//             }
//         });

//         const results = await Promise.all(checkPromises);

//         const successfulFiles = results.filter((r) => r.success);
//         const failedFiles = results.filter((r) => !r.success);

//         result.loadedFiles = successfulFiles.length;
//         result.errors = failedFiles.map((f) => `${f.filename}: ${f.error}`);

//         if (failedFiles.length === 0) {
//             result.status = "success";
//         } else if (successfulFiles.length > 0) {
//             result.status = "partial";
//         } else {
//             result.status = "failed";
//         }

//         return result;
//     } catch (error) {
//         result.status = "failed";
//         result.errors = [
//             error instanceof Error
//                 ? error.message
//                 : "Setup verification failed",
//         ];
//         return result;
//     }
// }

// // Migration step-by-step guide
// export function logMigrationGuide(): void {
//     console.log("\n🔄 MIGRATION GUIDE: Assistant API → Chat Completions API");
//     console.log("======================================================");
//     console.log("");
//     console.log("STEP 1: Setup Knowledge Files");
//     console.log("  📁 Create public/knowledge/ directory");
//     console.log("  📄 Place all 25 ETQ markdown files there");
//     console.log("  🔍 Run verifyKnowledgeSetup() to check");
//     console.log("");
//     console.log("STEP 2: Update App Structure");
//     console.log("  🔧 Wrap app with <KnowledgeProvider>");
//     console.log(
//         '  📦 Import: import { KnowledgeProvider } from "@/contexts/KnowledgeProvider"',
//     );
//     console.log("");
//     console.log("STEP 3: Replace LLM Provider");
//     console.log("  🔄 Change: useLLMProvider → useLLMProviderOptimized");
//     console.log("  ❌ Remove: assistantId prop (no longer needed)");
//     console.log(
//         '  📦 Import: import useLLMProviderOptimized from "@/hooks/useLLMProviderOptimized"',
//     );
//     console.log("");
//     console.log("STEP 4: Handle Loading States");
//     console.log("  ⏳ Use useKnowledge() to check knowledge loading");
//     console.log("  🛠️ Show loading spinner while knowledge base loads");
//     console.log("");
//     console.log("STEP 5: Test & Compare");
//     console.log("  📊 Use migrationTracker to record performance");
//     console.log("  🎯 Expected improvement: 87% faster (12s → 1.6s)");
//     console.log("");
//     console.log("STEP 6: Cleanup");
//     console.log("  🗑️ Remove old Assistant API code");
//     console.log("  🧹 Clean up unused dependencies");
//     console.log("");
// }

// // Development helper to simulate old vs new system comparison
// export async function runPerformanceComparison(
//     userMessage: string,
//     oldSystemFunction: () => Promise<number>,
//     newSystemFunction: () => Promise<number>,
//     iterations: number = 3,
// ): Promise<void> {
//     console.log(
//         `\n🏃 Running performance comparison (${iterations} iterations)`,
//     );
//     console.log(`Query: "${userMessage}"`);
//     console.log("=====================================");

//     // Test old system
//     console.log("Testing old system...");
//     const oldTimes: number[] = [];
//     for (let i = 0; i < iterations; i++) {
//         try {
//             const time = await oldSystemFunction();
//             oldTimes.push(time);
//             migrationTracker.recordOldSystemTime(time);
//             console.log(`  Iteration ${i + 1}: ${time.toFixed(2)}ms`);
//         } catch (error) {
//             console.log(`  Iteration ${i + 1}: FAILED - ${error}`);
//         }
//     }

//     console.log("\nTesting new system...");
//     const newTimes: number[] = [];
//     for (let i = 0; i < iterations; i++) {
//         try {
//             const time = await newSystemFunction();
//             newTimes.push(time);
//             migrationTracker.recordNewSystemTime(time);
//             console.log(`  Iteration ${i + 1}: ${time.toFixed(2)}ms`);
//         } catch (error) {
//             console.log(`  Iteration ${i + 1}: FAILED - ${error}`);
//         }
//     }

//     // Show comparison
//     migrationTracker.logComparison();
// }

// // Helper hook for migration tracking in React components
// import { useRef } from "react";

// export function useMigrationTracking(systemType: "old" | "new") {
//     const startTimeRef = useRef<number>(0);

//     const startTracking = () => {
//         startTimeRef.current = performance.now();
//     };

//     const endTracking = () => {
//         const duration = performance.now() - startTimeRef.current;
//         if (systemType === "old") {
//             migrationTracker.recordOldSystemTime(duration);
//         } else {
//             migrationTracker.recordNewSystemTime(duration);
//         }
//         return duration;
//     };

//     return { startTracking, endTracking };
// }

// // Quick setup verification function for development
// export async function quickSetupCheck(): Promise<boolean> {
//     console.log("🔍 Quick Setup Check...");

//     const knowledgeCheck = await verifyKnowledgeSetup();

//     if (knowledgeCheck.status === "success") {
//         console.log("✅ Knowledge base setup: PERFECT");
//         console.log(
//             `   📁 All ${knowledgeCheck.totalFiles} files loaded successfully`,
//         );
//         return true;
//     } else if (knowledgeCheck.status === "partial") {
//         console.log("⚠️ Knowledge base setup: PARTIAL");
//         console.log(
//             `   📁 ${knowledgeCheck.loadedFiles}/${knowledgeCheck.totalFiles} files loaded`,
//         );
//         console.log("   ❌ Missing files:", knowledgeCheck.errors.slice(0, 3));
//         return false;
//     } else {
//         console.log("❌ Knowledge base setup: FAILED");
//         console.log("   💡 Check that markdown files are in public/knowledge/");
//         console.log("   📋 Errors:", knowledgeCheck.errors.slice(0, 3));
//         return false;
//     }
// }

// // Add to window for easy development access
// if (typeof window !== "undefined" && process.env.NODE_ENV === "development") {
//     (window as any).migrationUtils = {
//         migrationTracker,
//         verifyKnowledgeSetup,
//         logMigrationGuide,
//         quickSetupCheck,
//         runPerformanceComparison,
//     };

//     console.log("🛠️ Migration utilities available at window.migrationUtils");
// }
