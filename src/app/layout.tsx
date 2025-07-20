// src/app/layout.tsx
import { GlobalErrorBoundary } from '@/components/error-boundary';
// import { PerformanceProfiler } from '@/components/global/PerformanceProfiler';
import { TailwindIndicator } from '@/components/global/tailwind-indicator';
import { CustomToaster } from '@/components/ui/custom-toaster';
// import { KnowledgeProvider } from '@/contexts/KnowledgeProvider';
import { cn } from '@/lib/utils';
import '@/styles/globals.css';
// import PerformanceDashboard from '@/utils/performance/PerformanceDashboard';
import { ThemeProvider } from 'next-themes';
import { Inter } from 'next/font/google';

const inter = Inter({ subsets: ['latin'] });

export const metadata = {
    title: 'iMessage-style Audio Transcription',
    description: 'An audio transcription app with iMessage-style interface',
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
    return (
        <html lang="en" suppressHydrationWarning>
            <body
                className={cn(
                    `min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 antialiased ${inter.className}`
                )}
            >
                <GlobalErrorBoundary>
                    <ThemeProvider attribute="class" defaultTheme="dark" enableSystem>
                        {/* <KnowledgeProvider> */}
                        {/* <PerformanceProfiler id="MainApp"> */}
                        <main className="flex flex-1 flex-col transition-all duration-300 ease-in-out rounded-sm p-1 h-screen">
                            {children}
                            {/* {process.env.NODE_ENV === 'development' && <PerformanceDashboard />} */}
                        </main>
                        {/* </PerformanceProfiler> */}
                        {/* </KnowledgeProvider> */}
                        <CustomToaster />
                        <TailwindIndicator />
                    </ThemeProvider>
                </GlobalErrorBoundary>
            </body>
        </html>
    );
}
