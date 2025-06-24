// src/app/explanation/page.tsx
import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function ExplanationPage() {
    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-background text-foreground p-8">
            <div className="max-w-2xl text-center">
                <h1 className="text-4xl font-bold mb-4">Why Is Call Setup Important?</h1>
                <p className="text-lg text-muted-foreground mb-6">
                    Providing context about your call is crucial for the AI to deliver tailored, effective, and
                    strategic responses. This setup ensures the guidance you receive is not generic, but perfectly
                    aligned with your specific goals and audience.
                </p>
                <div className="bg-card border rounded-lg p-6 text-left space-y-4">
                    <h2 className="text-xl font-semibold">What Your Setup Powers:</h2>
                    <ul className="list-disc list-inside space-y-2">
                        <li>
                            <strong>Strategic Responses:</strong> The AI uses your objectives to craft answers that move
                            you closer to your desired outcome.
                        </li>
                        <li>
                            <strong>Contextual Awareness:</strong> Knowing the participants and call type allows for
                            appropriate tone and terminology.
                        </li>
                        <li>
                            <strong>Personalized Content:</strong> Your key points are woven into suggestions, making
                            them sound natural and authentic.
                        </li>
                        <li>
                            <strong>Knowledge Integration:</strong> When enabled, the AI can pull from your uploaded
                            documents to provide data-driven, factual answers.
                        </li>
                    </ul>
                </div>
                <Button asChild className="mt-8">
                    <Link href="/chat">Go Back to Setup</Link>
                </Button>
            </div>
        </div>
    );
}
