// src/components/layout/Sidebar.tsx
// "use client";

import Link from "next/link";
// import { useState } from "react";
// import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
    Zap,
    // ChevronRight,
    Settings,
    BarChart,
    FileText,
    Bell,
    HelpCircle,
    LogOut,
    LucideIcon,
    Bot,
} from "lucide-react";

export default function Sidebar() {
    return (
        <aside className="hidden md:flex md:flex-col w-64 border-r bg-background">
            <ScrollArea className="flex-grow">
                <div className="px-3 py-4">
                    <Link href="/" className="flex items-center mb-6">
                        <Zap
                            className="h-8 w-8 text-primary"
                            aria-hidden="true"
                        />
                        <span className="ml-2 text-2xl font-extrabold text-primary font-display">
                            TalkSmart
                        </span>
                    </Link>
                    <nav className="space-y-1">
                        <SidebarContent />
                    </nav>
                </div>
            </ScrollArea>
            <div className="border-t">
                <BottomMenuItems />
            </div>
        </aside>
    );
}

// Extract SidebarContent as a separate component to reuse in Nav
export function SidebarContent() {
    return (
        <>
            {/* <MenuItem href="/dashboard" icon={Home}>
                Dashboard
            </MenuItem> */}
            <MenuItem href="/assistants" icon={Bot}>
                Assistants
            </MenuItem>
            <MenuItem href="/files" icon={FileText}>
                Documents
            </MenuItem>
            <MenuItem href="/notifications" icon={Bell}>
                Notifications
            </MenuItem>
            <MenuItem href="/reports" icon={BarChart}>
                Analytics
            </MenuItem>
            <MenuItem href="/help" icon={HelpCircle}>
                Support
            </MenuItem>

            {/* <CollapsibleMenuItem title="Help & Support" icon={HelpCircle}>
                <MenuItem href="/knowledge" icon={FileText}>
                    Knowledge Base
                </MenuItem>
                <MenuItem href="/faq" icon={HelpCircle}>
                    FAQ
                </MenuItem>
                <MenuItem href="/support" icon={Users}>
                    Contact Support
                </MenuItem>
                <MenuItem href="/feedback" icon={FileText}>
                    Feedback
                </MenuItem>
            </CollapsibleMenuItem> */}
        </>
    );
}

export function BottomMenuItems() {
    return (
        <>
            <MenuItem href="/settings" icon={Settings}>
                Settings
            </MenuItem>
            <MenuItem href="/logout" icon={LogOut}>
                Logout
            </MenuItem>
        </>
    );
}

// ... (CollapsibleMenuItem and MenuItem components remain the same)

// function CollapsibleMenuItem({
//     title,
//     icon: Icon,
//     children,
// }: {
//     title: string;
//     icon: LucideIcon;
//     children: React.ReactNode;
// }) {
//     const [isOpen, setIsOpen] = useState(false);

//     return (
//         <Collapsible open={isOpen} onOpenChange={setIsOpen}>
//             <CollapsibleTrigger asChild>
//                 <Button
//                     variant="ghost"
//                     className="w-full justify-between px-2 py-1.5 h-auto font-normal text-sm"
//                 >
//                     <span className="flex items-center">
//                         <Icon className="mr-2 h-4 w-4" aria-hidden="true" />
//                         {title}
//                     </span>
//                     <ChevronRight
//                         className={cn(
//                             "h-4 w-4 transition-transform",
//                             isOpen && "rotate-90",
//                         )}
//                         aria-hidden="true"
//                     />
//                 </Button>
//             </CollapsibleTrigger>
//             <CollapsibleContent className="pl-6 space-y-1">
//                 {children}
//             </CollapsibleContent>
//         </Collapsible>
//     );
// }

function MenuItem({
    href,
    icon: Icon,
    children,
}: {
    href: string;
    icon: LucideIcon;
    children: React.ReactNode;
}) {
    return (
        <Link
            href={href}
            className="flex items-center px-2 py-1.5 text-sm text-muted-foreground hover:bg-accent hover:text-accent-foreground rounded-md transition-colors"
        >
            <Icon className="mr-2 h-4 w-4" aria-hidden="true" />
            <span>{children}</span>
        </Link>
    );
}
