// src/app/api/test-openai/route.ts - OpenAI Connection Test

import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';

// ✅ Test OpenAI API connection
export async function POST(request: NextRequest) {
    try {
        // ✅ Check if API key exists
        const apiKey = process.env.OPENAI_API_KEY || process.env.NEXT_PUBLIC_OPENAI_API_KEY;

        if (!apiKey) {
            return NextResponse.json(
                {
                    success: false,
                    error: 'OpenAI API key not found in environment variables',
                },
                { status: 400 }
            );
        }

        // ✅ Initialize OpenAI client
        const openai = new OpenAI({
            apiKey: apiKey,
        });

        // ✅ Test with a simple completion
        const completion = await openai.chat.completions.create({
            model: 'gpt-4o-mini',
            messages: [
                {
                    role: 'user',
                    content: 'Test connection - respond with just "OK"',
                },
            ],
            max_tokens: 10,
            temperature: 0,
        });

        const response = completion.choices[0]?.message?.content;

        if (response) {
            return NextResponse.json({
                success: true,
                message: 'OpenAI API connection successful',
                model: 'gpt-4o-mini',
                testResponse: response.trim(),
            });
        } else {
            return NextResponse.json(
                {
                    success: false,
                    error: 'No response from OpenAI API',
                },
                { status: 500 }
            );
        }
    } catch (error) {
        console.error('OpenAI Test Error:', error);

        // ✅ Handle specific error types
        if (error instanceof Error) {
            let errorMessage = error.message;
            let statusCode = 500;

            if (errorMessage.includes('API key')) {
                errorMessage = 'Invalid OpenAI API key';
                statusCode = 401;
            } else if (errorMessage.includes('quota')) {
                errorMessage = 'OpenAI quota exceeded';
                statusCode = 429;
            } else if (errorMessage.includes('network') || errorMessage.includes('timeout')) {
                errorMessage = 'Network error connecting to OpenAI';
                statusCode = 503;
            }

            return NextResponse.json(
                {
                    success: false,
                    error: errorMessage,
                    details: process.env.NODE_ENV === 'development' ? error.stack : undefined,
                },
                { status: statusCode }
            );
        }

        return NextResponse.json(
            {
                success: false,
                error: 'Unknown error occurred',
            },
            { status: 500 }
        );
    }
}

// ✅ GET handler for basic health check
export async function GET() {
    const hasApiKey = !!(process.env.OPENAI_API_KEY || process.env.NEXT_PUBLIC_OPENAI_API_KEY);

    return NextResponse.json({
        endpoint: 'OpenAI Test',
        apiKeyConfigured: hasApiKey,
        timestamp: new Date().toISOString(),
        message: hasApiKey ? 'API key found - use POST to test connection' : 'API key not configured',
    });
}
