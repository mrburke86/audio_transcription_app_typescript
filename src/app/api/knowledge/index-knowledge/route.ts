// src\app\api\knowledge\index-knowledge\route.ts
import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import { initQdrantClient, ensureKnowledgeCollection, processAndUpsertDocument } from '@/services/QdrantService';
import { logger } from '@/modules/Logger';
// Define or import KNOWLEDGE_FILES_PATHS
// These paths should be relative to the 'public' directory if reading from there.
const KNOWLEDGE_FILES_PATHS = [
    '/knowledge/C_Level_Engagement_Strategies_Manufacturing.md',
    '/knowledge/ETQ_Role_Specific_Scenarios_Questions.md',
    '/knowledge/My_Career_Summary_Achievements.md',
    '/knowledge/My_Career_Summary_Sales_Achievements.md',
    '/knowledge/My_MEDDPICC_Success_Stories.md',
    '/knowledge/etq_company_profile.md',
    '/knowledge/etq_mid_market_account_executive_europe.md',
    '/knowledge/hexagon_ab_company_profile.md',
    '/knowledge/manufacturing_industry_trends.md',
    '/knowledge/meddpicc_sales_methodology.md',
    '/knowledge/quality_management_ehs_principles.md',
];

export async function POST(_request: Request) {
    // TODO: Add authentication/authorization here to secure this endpoint
    // For example, check for admin user session or a secret header

    logger.info('API Route: Knowledge indexing process started... ⏳');
    try {
        initQdrantClient();
        await ensureKnowledgeCollection(); // Ensures collection exists, creates if not

        const publicDir = path.join(process.cwd(), 'public');
        let filesProcessed = 0;
        const errors: string[] = [];

        for (const relativeFilePath of KNOWLEDGE_FILES_PATHS) {
            const absoluteFilePath = path.join(publicDir, relativeFilePath);
            const fileName = path.basename(relativeFilePath);
            try {
                logger.debug(`API Route: Processing file - ${fileName}`);
                if (!fs.existsSync(absoluteFilePath)) {
                    logger.warning(`API Route: File not found, skipping - ${absoluteFilePath}`);
                    errors.push(`File not found: ${fileName}`);
                    continue;
                }
                const markdownContent = fs.readFileSync(absoluteFilePath, 'utf-8');
                await processAndUpsertDocument(fileName, markdownContent);
                filesProcessed++;
            } catch (fileError: unknown) {
                const errorMessage = fileError instanceof Error ? fileError.message : 'Unknown error processing file';
                logger.error(`API Route: Error processing file ${fileName}. ${errorMessage}`, fileError);
                //   errors.push(`Failed to process ${fileName}: ${fileError.message}`);
                if (fileError instanceof Error) {
                    errors.push(`Failed to process ${fileName}: ${fileError.message}`);
                } else {
                    errors.push(`Failed to process ${fileName}: An unknown error occurred`);
                }
            }
        }

        if (errors.length > 0) {
            logger.warning(`API Route: Indexing partially completed with ${errors.length} errors. Files processed: ${filesProcessed}.`);
            return NextResponse.json(
                {
                    message: 'Indexing partially completed with errors.',
                    filesProcessed,
                    errors,
                },
                { status: 207 } // Multi-Status
            );
        }

        logger.info(`API Route: Knowledge indexing process completed successfully! 🎉 Files processed: ${filesProcessed}.`);
        return NextResponse.json({ message: 'Knowledge base indexed successfully!', filesProcessed }, { status: 200 });
    } catch (error: unknown) {
        const errorMessage = error instanceof Error ? error.message : 'An unknown server error occurred during indexing API call';
        logger.error(`API Route: Critical error during indexing. ${errorMessage}`, error);
        return NextResponse.json({ message: 'Failed to index knowledge base.', error: errorMessage }, { status: 500 });
    }
}
