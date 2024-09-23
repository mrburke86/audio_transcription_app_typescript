// src/app/layout.tsx
import { Inter } from "next/font/google";
import { ThemeProvider } from "next-themes";
import { CustomToaster } from "@/components/ui/custom-toaster";
// import Nav from "@/components/layout/Nav";
// import Sidebar from "@/components/layout/Sidebar";
import "@/styles/globals.css";
import { AppSidebar } from "@/components/app-sidebar";
import { SidebarLayout, SidebarTrigger } from "@/components/ui/sidebar";
import { cn } from "@/lib/utils";

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
    title: "iMessage-style Audio Transcription",
    description: "An audio transcription app with iMessage-style interface",
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
                    // inter.className,
                )}
            >
                <ThemeProvider
                    attribute="class"
                    defaultTheme="system"
                    enableSystem
                >
                    <SidebarLayout
                        defaultOpen={
                            cookies().get("sidebar:state")?.value === "true"
                        }
                    >
                        <AppSidebar />

                        {/* <div className="flex h-screen overflow-hidden">
                        <Sidebar />
                        <div className="flex flex-col flex-1 overflow-hidden">
                            <Nav /> */}
                        <main className="flex flex-1 flex-col transition-all duration-300 ease-in-out rounded-sm p-1 h-screen">
                            {/* <div className="border border-orange-500 p-1 h-full"> */}
                            <SidebarTrigger />

                            {children}
                            {/* </div> */}
                        </main>
                        {/* </div>
                    </div> */}
                    </SidebarLayout>

                    <CustomToaster />
                </ThemeProvider>
            </body>
        </html>
    );
}
