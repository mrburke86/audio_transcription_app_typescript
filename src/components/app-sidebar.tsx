"use client";

import Link from "next/link";
import { Bot, Settings2, LifeBuoy, LogOut } from "lucide-react";
import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarHeader,
    SidebarItem,
    SidebarLabel,
} from "@/components/ui/sidebar";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";

export function AppSidebar() {
    const user = {
        name: "Mark Rhys Burke",
        email: "hello@markrhysburke.com",
        avatar: "/mark_rhys_burke_profile_pic.jpg",
    };

    return (
        <Sidebar>
            <SidebarHeader>
                <div className="flex items-center gap-2 px-2 py-4">
                    <Bot className="h-8 w-8 text-primary" />
                    <span className="text-lg font-bold">TalkSmart</span>
                </div>
            </SidebarHeader>

            <SidebarContent>
                <SidebarItem>
                    <SidebarLabel>Navigation</SidebarLabel>
                    <nav className="grid gap-1 px-2">
                        <Link
                            href="/assistants"
                            className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium hover:bg-accent hover:text-accent-foreground transition-colors"
                        >
                            <Bot className="h-4 w-4" />
                            Assistants
                        </Link>
                        <Link
                            href="#"
                            className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium hover:bg-accent hover:text-accent-foreground transition-colors"
                        >
                            <Settings2 className="h-4 w-4" />
                            Settings
                        </Link>
                        <Link
                            href="#"
                            className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium hover:bg-accent hover:text-accent-foreground transition-colors"
                        >
                            <LifeBuoy className="h-4 w-4" />
                            Support
                        </Link>
                    </nav>
                </SidebarItem>
            </SidebarContent>

            <SidebarFooter>
                <div className="flex items-center gap-2 px-2 py-3 border-t">
                    <Avatar className="h-8 w-8">
                        <AvatarImage src={user.avatar} alt={user.name} />
                        <AvatarFallback>MB</AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                        <div className="text-sm font-medium truncate">
                            {user.name}
                        </div>
                        <div className="text-xs text-muted-foreground truncate">
                            {user.email}
                        </div>
                    </div>
                    <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 shrink-0"
                    >
                        <LogOut className="h-4 w-4" />
                    </Button>
                </div>
            </SidebarFooter>
        </Sidebar>
    );
}
