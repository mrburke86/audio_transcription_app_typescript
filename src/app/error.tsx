// src/app/error.tsx - ENHANCED ERROR PAGE
'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { AlertTriangle, Home, RefreshCw } from 'lucide-react';
import { useEffect } from 'react';

export default function Error({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
    useEffect(() => {
        console.error('Next.js Error Boundary:', error);
    }, [error]);

    return (
        <div className="min-h-screen flex items-center justify-center p-4 bg-gray-50">
            <Card className="max-w-md w-full">
                <CardHeader className="text-center">
                    <AlertTriangle className="h-12 w-12 text-red-500 mx-auto mb-4" />
                    <h2 className="text-xl font-semibold">Something went wrong!</h2>
                    <p className="text-gray-600 mt-2">
                        An unexpected error occurred. Don't worry, our team has been notified.
                    </p>
                </CardHeader>

                <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-3">
                        <Button onClick={reset} className="w-full">
                            <RefreshCw className="h-4 w-4 mr-2" />
                            Try Again
                        </Button>

                        <Button variant="outline" onClick={() => (window.location.href = '/')} className="w-full">
                            <Home className="h-4 w-4 mr-2" />
                            Go Home
                        </Button>
                    </div>

                    {process.env.NODE_ENV === 'development' && (
                        <details className="mt-4 p-3 bg-gray-100 rounded-md">
                            <summary className="cursor-pointer text-sm font-medium">
                                Error Details (Development)
                            </summary>
                            <pre className="mt-2 text-xs text-red-600 overflow-x-auto">{error.message}</pre>
                        </details>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
