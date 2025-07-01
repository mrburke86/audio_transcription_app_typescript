// src/components/interview-modal/InterviewModalFooter.tsx
"use client";
import { Button } from '@/components/ui/button';
import { useInterviewModal } from './InterviewModalContext';

export function InterviewModalFooter() {
    const { isValid, handleSubmit } = useInterviewModal();

    return (
        <div className="flex justify-end space-x-2 pt-4">
            <Button variant="outline">Cancel</Button>
            <Button onClick={handleSubmit} disabled={!isValid} variant="default">
                🚀 Start Live Interview
            </Button>
        </div>
    );
}
