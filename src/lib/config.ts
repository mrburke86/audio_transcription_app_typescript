// Create: src/lib/config.ts
interface Config {
    openAI: {
        apiKey: string;
    };
    qdrant: {
        url: string;
    };
    app: {
        nodeEnv: string;
        isDevelopment: boolean;
        isProduction: boolean;
    };
}

function getConfig(): Config {
    const nodeEnv = process.env.NODE_ENV || 'development';

    return {
        openAI: {
            apiKey: process.env.OPENAI_API_KEY || '',
        },
        qdrant: {
            url: process.env.QDRANT_URL || 'http://localhost:6333',
        },
        app: {
            nodeEnv,
            isDevelopment: nodeEnv === 'development',
            isProduction: nodeEnv === 'production',
        },
    };
}

export const config = getConfig();

// Validation
if (!config.openAI.apiKey) {
    throw new Error('OPENAI_API_KEY environment variable is required');
}
