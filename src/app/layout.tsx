// src/app/layout.tsx
import { Inter } from 'next/font/google';
import { ThemeProvider } from 'next-themes';
import { CustomToaster } from '@/components/ui/custom-toaster';
import { cn } from '@/lib/utils';
import '@/styles/globals.css';
import { TailwindIndicator } from '@/components/global/tailwind-indicator';
import { ThemeToggle } from '@/components/global/theme-toggle';
import { GlobalErrorBoundary } from '@/components/error-boundary';
import { StoreInitializer } from '@/components/StoreInitializer';

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
                        <main className="flex flex-1 flex-col transition-all duration-300 ease-in-out rounded-sm p-1 h-screen">
                            <StoreInitializer />
                            {children}
                        </main>
                        <CustomToaster />
                        <TailwindIndicator />
                        <ThemeToggle />
                    </ThemeProvider>
                </GlobalErrorBoundary>
            </body>
        </html>
    );
}
