// src\app\admin\knowledge\page.tsx
'use client';
import { useState } from 'react';
import { useKnowledge } from '@/contexts/KnowledgeProvider';
import { Button } from '@/components/ui/button'; 

export default function AdminKnowledgePage() {
    const [isLoading, setIsLoading] = useState(false);
    const [message, setMessage] = useState('');
    const { indexedDocumentsCount, refreshIndexedDocumentsCount } = useKnowledge();

    const handleIndexKnowledge = async () => {
        setIsLoading(true);
        setMessage('Indexing in progress...');
        try {
            const response = await fetch('/api/knowledge/index-knowledge', {
                method: 'POST',
            });
            const data = await response.json();
            if (!response.ok) {
                throw new Error(data.message || `HTTP error! status: ${response.status}`);
            }
            setMessage(data.message || 'Indexing completed successfully!');
            await refreshIndexedDocumentsCount(); 
        } catch (error: unknown) {
            const errorMessage = error instanceof Error ? error.message : String(error);
            setMessage(`Error indexing knowledge: ${errorMessage}`);
            console.error('Indexing error:', error);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div>
            <h1>Knowledge Base Management</h1>
            <p>Currently Indexed Items (Chunks/Points): {indexedDocumentsCount}</p>
            <Button onClick={handleIndexKnowledge} disabled={isLoading}>
                {isLoading ? 'Indexing...' : 'Start/Re-Index Knowledge Base'}
            </Button>
            {message && <p>{message}</p>}
        </div>
    );
}
