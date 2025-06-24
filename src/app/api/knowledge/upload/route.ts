// src/app/api/knowledge/upload/route.ts
import { NextRequest, NextResponse } from 'next/server';
import path from 'path';

export async function POST(request: NextRequest) {
    try {
        const formData = await request.formData();
        const file = formData.get('file') as File;
        const category = formData.get('category') as string;

        if (!file) {
            return NextResponse.json({ error: 'No file provided' }, { status: 400 });
        }

        // Validate file type
        const allowedTypes = ['.pdf', '.doc', '.docx', '.txt', '.md'];
        const fileExtension = path.extname(file.name).toLowerCase();

        if (!allowedTypes.includes(fileExtension)) {
            return NextResponse.json(
                {
                    error: 'Invalid file type. Allowed: PDF, DOC, DOCX, TXT, MD',
                },
                { status: 400 }
            );
        }

        // Validate file size (max 10MB)
        if (file.size > 10 * 1024 * 1024) {
            return NextResponse.json({ error: 'File too large (max 10MB)' }, { status: 400 });
        }

        // Read file content
        let content: string;
        const buffer = Buffer.from(await file.arrayBuffer());

        if (fileExtension === '.txt' || fileExtension === '.md') {
            content = buffer.toString('utf-8');
        } else {
            // For PDF, DOC, DOCX - you'll need additional libraries
            return NextResponse.json(
                {
                    error: 'PDF/DOC processing not yet implemented. Please use .txt or .md files for now.',
                },
                { status: 501 }
            );
        }

        // TODO: Process and store in vector database
        // For now, just return success - you'll need to implement storage
        console.log(`Received file: ${file.name}, Content length: ${content.length}`);

        return NextResponse.json({
            message: 'File uploaded and processed successfully',
            filename: file.name,
            category,
            size: file.size,
            contentLength: content.length,
        });
    } catch (error) {
        console.error('Upload error:', error);
        return NextResponse.json({ error: 'Failed to upload file' }, { status: 500 });
    }
}
