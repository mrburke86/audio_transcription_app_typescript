// src/app/layout.tsx
import { Inter } from "next/font/google";
import { ThemeProvider } from "next-themes";
import { CustomToaster } from "@/components/ui/custom-toaster";
import "@/styles/globals.css";
import { AppSidebar } from "@/components/app-sidebar";
import { SidebarLayout, SidebarTrigger } from "@/components/ui/sidebar";
import { cn } from "@/lib/utils";
import ClientProviders from "@/components/ClientProviders";
import { TailwindIndicator } from "@/components/global/tailwind-indicator";
import { ThemeToggle } from "@/components/layout/theme-toggle";

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
    title: "TalkSmart - AI Assistant Chat",
    description: "Personal AI assistant chat application",
};

export default async function RootLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const { cookies } = await import("next/headers");

    return (
        <html lang="en" suppressHydrationWarning>
            <body
                className={cn(
                    `min-h-screen bg-background antialiased ${inter.className}`,
                )}
            >
                <ThemeProvider
                    attribute="class"
                    defaultTheme="dark"
                    enableSystem
                >
                    <SidebarLayout
                        defaultOpen={
                            cookies().get("sidebar:state")?.value === "true"
                        }
                    >
                        <AppSidebar />

                        <ClientProviders>
                            <main className="flex flex-1 flex-col transition-all duration-300 ease-in-out rounded-sm p-1 h-screen">
                                <SidebarTrigger />
                                {children}
                            </main>
                        </ClientProviders>
                    </SidebarLayout>

                    <CustomToaster />
                    <TailwindIndicator />
                    <ThemeToggle />
                </ThemeProvider>
            </body>
        </html>
    );
}
