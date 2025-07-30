// src\app\api\knowledge\index-knowledge\route.ts
import { ensureKnowledgeCollection, initQdrantClient, processAndUpsertDocument } from '@/services/QdrantService';
import { devLog } from '@/utils/devLogger';
import fs from 'fs';
import { NextResponse } from 'next/server';
import path from 'path';

const CORE_KNOWLEDGE_FILES = [
    '/knowledge/My_Career_Summary_Achievements.md',
    '/knowledge/My_Career_Summary_Sales_Achievements.md',
    '/knowledge/My_MEDDPICC_Success_Stories.md',
    '/knowledge/meddpicc_sales_methodology.md',
    '/knowledge/quality_management_ehs_principles.md',
    '/knowledge/C_Level_Engagement_Strategies_Manufacturing.md',
];

const VARIABLE_KNOWLEDGE_FILES = [
    '/knowledge/ETQ_Role_Specific_Scenarios_Questions.md',
    '/knowledge/etq_company_profile.md',
    '/knowledge/etq_mid_market_account_executive_europe.md',
    '/knowledge/hexagon_ab_company_profile.md',
    '/knowledge/manufacturing_industry_trends.md',
];

const ALL_KNOWLEDGE_FILES = [...CORE_KNOWLEDGE_FILES, ...VARIABLE_KNOWLEDGE_FILES];

interface ProcessingResult {
    filesProcessed: number;
    errors: string[];
    processingDetails: {
        coreFiles: { processed: number; total: number };
        variableFiles: { processed: number; total: number };
        totalSize: number;
        processingTime: number;
    };
}

export async function POST(_request: Request) {
    const startTime = performance.now();

    devLog.log('🚀 API Route: Knowledge indexing process started...');
    devLog.log(
        `API Route: Processing ${ALL_KNOWLEDGE_FILES.length} files (${CORE_KNOWLEDGE_FILES.length} core + ${VARIABLE_KNOWLEDGE_FILES.length} variable)`
    );

    try {
        // Initialize Qdrant
        initQdrantClient();
        await ensureKnowledgeCollection();

        const publicDir = path.join(process.cwd(), 'public');
        const result: ProcessingResult = {
            filesProcessed: 0,
            errors: [],
            processingDetails: {
                coreFiles: { processed: 0, total: CORE_KNOWLEDGE_FILES.length },
                variableFiles: { processed: 0, total: VARIABLE_KNOWLEDGE_FILES.length },
                totalSize: 0,
                processingTime: 0,
            },
        };

        // Process core files first
        devLog.log(`📚 API Route: Processing ${CORE_KNOWLEDGE_FILES.length} core knowledge files...`);
        await processFileCategory(publicDir, CORE_KNOWLEDGE_FILES, 'CORE', result);

        // Process variable files
        devLog.log(`🔄 API Route: Processing ${VARIABLE_KNOWLEDGE_FILES.length} variable knowledge files...`);
        await processFileCategory(publicDir, VARIABLE_KNOWLEDGE_FILES, 'VARIABLE', result);

        // Calculate final metrics
        result.processingDetails.processingTime = Math.round(performance.now() - startTime);

        // Generate response based on results
        if (result.errors.length > 0) {
            const warningMessage = `Indexing partially completed with ${result.errors.length} errors. Files processed: ${result.filesProcessed}/${ALL_KNOWLEDGE_FILES.length}.`;
            devLog.warning(`⚠️ API Route: ${warningMessage}`);
            devLog.log(`Processing summary: ${JSON.stringify(result.processingDetails)}`);

            return NextResponse.json(
                {
                    message: warningMessage,
                    filesProcessed: result.filesProcessed,
                    errors: result.errors,
                    details: result.processingDetails,
                },
                { status: 207 }
            );
        }

        const successMessage = `Knowledge base indexed successfully! Files processed: ${result.filesProcessed}/${ALL_KNOWLEDGE_FILES.length} in ${result.processingDetails.processingTime}ms.`;
        devLog.log(`🎉 API Route: ${successMessage}`);
        devLog.log(
            `📊 Processing stats: ${Math.round(result.processingDetails.totalSize / 1024)}KB total, avg ${Math.round(
                result.processingDetails.totalSize / result.filesProcessed
            )}B per file`
        );

        return NextResponse.json(
            {
                message: 'Knowledge base indexed successfully!',
                filesProcessed: result.filesProcessed,
                details: result.processingDetails,
            },
            { status: 200 }
        );
    } catch (error: unknown) {
        const processingTime = Math.round(performance.now() - startTime);
        const errorMessage =
            error instanceof Error ? error.message : 'An unknown server error occurred during indexing API call';

        devLog.error(`💥 API Route: Critical error during indexing after ${processingTime}ms: ${errorMessage}`, error);

        return NextResponse.json(
            {
                message: 'Failed to index knowledge base.',
                error: errorMessage,
                processingTime,
            },
            { status: 500 }
        );
    }
}

async function processFileCategory(
    publicDir: string,
    filePaths: string[],
    category: 'CORE' | 'VARIABLE',
    result: ProcessingResult
): Promise<void> {
    const categoryStartTime = performance.now();
    let categoryProcessed = 0;

    for (const relativeFilePath of filePaths) {
        const absoluteFilePath = path.join(publicDir, relativeFilePath);
        const fileName = path.basename(relativeFilePath);

        try {
            devLog.log(`📄 API Route: [${category}] Processing file - ${fileName}`);

            // Enhanced file validation
            if (!fs.existsSync(absoluteFilePath)) {
                const errorMsg = `File not found: ${fileName}`;
                devLog.warning(`⚠️ API Route: [${category}] ${errorMsg} at ${absoluteFilePath}`);
                result.errors.push(errorMsg);
                continue;
            }

            // Check file stats
            const fileStats = fs.statSync(absoluteFilePath);
            if (fileStats.size === 0) {
                const errorMsg = `Empty file: ${fileName}`;
                devLog.warning(`⚠️ API Route: [${category}] ${errorMsg}`);
                result.errors.push(errorMsg);
                continue;
            }

            devLog.log(
                `📊 API Route: [${category}] File ${fileName} - ${
                    fileStats.size
                } bytes, modified ${fileStats.mtime.toISOString()}`
            );

            // Read and validate content
            const markdownContent = fs.readFileSync(absoluteFilePath, 'utf-8');
            if (markdownContent.trim().length < 10) {
                const errorMsg = `File too short: ${fileName} (${markdownContent.length} chars)`;
                devLog.warning(`⚠️ API Route: [${category}] ${errorMsg}`);
                result.errors.push(errorMsg);
                continue;
            }

            // Process the document
            const fileStartTime = performance.now();
            await processAndUpsertDocument(fileName, markdownContent);
            const fileProcessingTime = Math.round(performance.now() - fileStartTime);

            // Update results
            result.filesProcessed++;
            categoryProcessed++;
            result.processingDetails.totalSize += markdownContent.length;

            devLog.log(
                `✅ API Route: [${category}] Successfully processed ${fileName} in ${fileProcessingTime}ms (${markdownContent.length} chars)`
            );
        } catch (fileError: unknown) {
            const errorMessage = fileError instanceof Error ? fileError.message : 'Unknown error processing file';
            const fullErrorMsg = `Failed to process ${fileName}: ${errorMessage}`;

            devLog.error(`❌ API Route: [${category}] ${fullErrorMsg}`, fileError);
            result.errors.push(fullErrorMsg);
        }
    }

    // Update category-specific results
    if (category === 'CORE') {
        result.processingDetails.coreFiles.processed = categoryProcessed;
    } else {
        result.processingDetails.variableFiles.processed = categoryProcessed;
    }

    const categoryTime = Math.round(performance.now() - categoryStartTime);
    devLog.log(
        `📋 API Route: [${category}] Category completed - ${categoryProcessed}/${filePaths.length} files in ${categoryTime}ms`
    );
}
