// src\app\api\knowledge\health\route.ts
import { checkQdrantHealth, initQdrantClient } from '@/services/QdrantService';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
    try {
        // Initialize client if needed
        initQdrantClient();

        // Check health
        const healthStatus = await checkQdrantHealth();

        return NextResponse.json(
            {
                status: healthStatus.healthy ? 'healthy' : 'unhealthy',
                ...healthStatus,
                timestamp: new Date().toISOString(),
            },
            {
                status: healthStatus.healthy ? 200 : 503,
            }
        );
    } catch (error) {
        return NextResponse.json(
            {
                status: 'error',
                healthy: false,
                error: (error as Error).message,
                timestamp: new Date().toISOString(),
            },
            {
                status: 500,
            }
        );
    }
}
