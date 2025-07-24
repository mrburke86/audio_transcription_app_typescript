// src/app/layout.tsx
import { GlobalErrorBoundary } from '@/components/error-boundary';
import { TailwindIndicator } from '@/components/global/tailwind-indicator';
import { CustomToaster } from '@/components/ui/custom-toaster';
import { cn } from '@/lib/utils';
import '@/styles/globals.css';
import { ThemeProvider } from 'next-themes';
import { Inter } from 'next/font/google';

const inter = Inter({ subsets: ['latin'] });

export const metadata = {
    title: 'iMessage-style Audio Transcription',
    description: 'An audio transcription app with iMessage-style interface',
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
    if (typeof window !== 'undefined') {
        console.group('🏠 ROOT LAYOUT RENDER');
        console.log('📍 Root layout rendering (client-side)');
        console.log('🌍 Client environment:', {
            NODE_ENV: process.env.NODE_ENV,
            timestamp: new Date().toISOString(),
            userAgent: navigator.userAgent.substring(0, 50),
        });
        console.groupEnd();
    }

    return (
        <html lang="en" suppressHydrationWarning>
            <body
                className={cn(
                    `min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 antialiased ${inter.className}`
                )}
            >
                <GlobalErrorBoundary>
                    <ThemeProvider attribute="class" defaultTheme="dark" enableSystem>
                        <main className="flex flex-1 flex-col transition-all duration-300 ease-in-out rounded-sm p-1 h-screen">
                            {children}
                        </main>
                        <CustomToaster />
                        <TailwindIndicator />
                    </ThemeProvider>
                </GlobalErrorBoundary>
            </body>
        </html>
    );
}
