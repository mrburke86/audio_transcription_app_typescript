// src/app/api/chat/route.ts - FIXED VERSION

import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';

// ✅ Initialize OpenAI client
const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY || process.env.NEXT_PUBLIC_OPENAI_API_KEY,
});

// ✅ System prompt for interview assistance
const SYSTEM_PROMPT = `You are an expert interview coach and AI assistant. Your role is to help users practice interviews, provide strategic feedback, and answer interview-related questions.

Key behaviors:
1. **Supportive & Professional**: Be encouraging but honest in your feedback
2. **Interview Focused**: Keep conversations relevant to interview preparation and career advice
3. **Practical Advice**: Provide actionable, specific recommendations
4. **Adaptive**: Adjust your communication style based on the user's experience level
5. **Question-Driven**: Ask clarifying questions to provide better assistance

When helping with interview practice:
- Ask about the role, company, and interview type if not provided
- Provide specific examples and frameworks (STAR method, etc.)
- Offer both positive reinforcement and areas for improvement
- Suggest follow-up questions or scenarios

Keep responses concise but comprehensive. Focus on being genuinely helpful for interview success.`;

// ✅ POST handler for chat completion
export async function POST(request: NextRequest) {
    try {
        // ✅ Parse request body
        const { messages, context, stream = true } = await request.json();

        // ✅ Validate required fields
        if (!messages || !Array.isArray(messages)) {
            return NextResponse.json({ error: 'Messages array is required' }, { status: 400 });
        }

        // ✅ Check OpenAI API key
        if (!process.env.OPENAI_API_KEY && !process.env.NEXT_PUBLIC_OPENAI_API_KEY) {
            return NextResponse.json({ error: 'OpenAI API key not configured' }, { status: 500 });
        }

        // ✅ Prepare messages for OpenAI
        const chatMessages: OpenAI.Chat.Completions.ChatCompletionMessageParam[] = [
            {
                role: 'system',
                content: SYSTEM_PROMPT + (context ? `\n\nInterview Context: ${JSON.stringify(context)}` : ''),
            },
            ...messages.map((msg: any) => ({
                role: msg.role as 'user' | 'assistant',
                content: msg.content,
            })),
        ];

        // ✅ Handle streaming response
        if (stream) {
            const completion = await openai.chat.completions.create({
                model: 'gpt-4o-mini', // Use cost-effective model for testing
                messages: chatMessages,
                max_tokens: 1000,
                temperature: 0.7,
                stream: true,
            });

            // ✅ Create streaming response
            const encoder = new TextEncoder();
            const responseStream = new ReadableStream({
                async start(controller) {
                    try {
                        for await (const chunk of completion) {
                            const content = chunk.choices[0]?.delta?.content || '';
                            if (content) {
                                const data = `data: ${JSON.stringify({ content })}\n\n`;
                                controller.enqueue(encoder.encode(data));
                            }
                        }
                        // ✅ Send completion signal
                        const doneData = `data: ${JSON.stringify({ done: true })}\n\n`;
                        controller.enqueue(encoder.encode(doneData));
                        controller.close();
                    } catch (error) {
                        console.error('Streaming error:', error);
                        const errorData = `data: ${JSON.stringify({
                            error: 'Streaming error occurred',
                        })}\n\n`;
                        controller.enqueue(encoder.encode(errorData));
                        controller.close();
                    }
                },
            });

            return new Response(responseStream, {
                headers: {
                    'Content-Type': 'text/event-stream',
                    'Cache-Control': 'no-cache',
                    Connection: 'keep-alive',
                },
            });
        }

        // ✅ Handle non-streaming response (fallback)
        const completion = await openai.chat.completions.create({
            model: 'gpt-4o-mini',
            messages: chatMessages,
            max_tokens: 1000,
            temperature: 0.7,
        });

        const response = completion.choices[0]?.message?.content || 'No response generated';

        return NextResponse.json({
            content: response,
            done: true,
        });
    } catch (error) {
        console.error('Chat API Error:', error);

        // ✅ Handle specific OpenAI errors
        if (error instanceof Error) {
            if (error.message.includes('API key')) {
                return NextResponse.json({ error: 'Invalid OpenAI API key' }, { status: 401 });
            }
            if (error.message.includes('quota')) {
                return NextResponse.json({ error: 'OpenAI quota exceeded' }, { status: 429 });
            }
        }

        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

// ✅ GET handler (for testing)
export async function GET() {
    return NextResponse.json({
        message: 'Chat API endpoint is running',
        timestamp: new Date().toISOString(),
    });
}
