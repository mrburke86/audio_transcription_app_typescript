// src/components/layout/Nav.tsx
import { ThemeToggle } from "@/components/layout/theme-toggle";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import {
    Menu,
    Search,
    Bell,
    CreditCard,
    User,
    Globe,
    LogOut,
    Zap,
} from "lucide-react";
import { SidebarContent, BottomMenuItems } from "@/components/layout/Sidebar";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export default function Nav() {
    return (
        <nav className="sticky top-0 z-10 bg-background border-b">
            <div className="container flex h-14 items-center justify-between">
                <div className="flex items-center space-x-4">
                    <SearchBar />
                </div>
                <div className="flex items-center space-x-4">
                    <div className="hidden md:flex items-center space-x-4">
                        <NotificationIcon />
                        <UpgradeButton />
                        <AccountDropdown />
                    </div>
                    <Sheet>
                        <SheetTrigger asChild>
                            <Button
                                variant="ghost"
                                size="icon"
                                className="md:hidden"
                                aria-label="Toggle menu"
                            >
                                <Menu className="h-5 w-5" />
                            </Button>
                        </SheetTrigger>
                        <SheetContent
                            side="left"
                            className="w-[240px] sm:w-[300px]"
                        >
                            <MobileSidebar />
                        </SheetContent>
                    </Sheet>
                </div>
            </div>
        </nav>
    );
}

function SearchBar() {
    return (
        <div className="relative w-full md:w-[300px]">
            <Search className="absolute left-2 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
                type="search"
                placeholder="Search..."
                className="pl-8 w-full"
            />
        </div>
    );
}

function NotificationIcon() {
    return (
        <Button variant="ghost" size="icon" className="relative">
            <Bell className="h-5 w-5" />
            <span className="absolute top-0 right-0 h-4 w-4 rounded-full bg-red-500 text-[10px] font-bold text-white flex items-center justify-center">
                23
            </span>
        </Button>
    );
}

function AccountDropdown() {
    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="flex items-center space-x-2">
                    <Avatar className="h-8 w-8">
                        <AvatarImage
                            src="/mark_rhys_burke_profile_pic.jpg"
                            alt="Mark Burke"
                        />
                        <AvatarFallback>MB</AvatarFallback>
                    </Avatar>
                    <span className="hidden md:inline">Mark Burke</span>
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56" align="end" forceMount>
                <DropdownMenuItem className="font-normal">
                    <User className="mr-2 h-4 w-4" />
                    <span>My Profile</span>
                </DropdownMenuItem>
                <DropdownMenuItem>
                    <CreditCard className="mr-2 h-4 w-4" />
                    <span>Billing</span>
                </DropdownMenuItem>
                <DropdownMenuItem>
                    <ThemeToggle />
                </DropdownMenuItem>
                <DropdownMenuItem>
                    <Globe className="mr-2 h-4 w-4" />
                    <span>Language</span>
                </DropdownMenuItem>
                <DropdownMenuItem>
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Log out</span>
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    );
}

function UpgradeButton() {
    return (
        <Button size="sm">
            <Zap className="mr-2 h-4 w-4" />
            Upgrade
        </Button>
    );
}

function MobileSidebar() {
    return (
        <div className="flex flex-col h-full">
            <div className="flex-grow">
                <h2 className="px-4 text-lg font-semibold mb-4">Navigation</h2>
                <div className="space-y-1">
                    <SidebarContent />
                </div>
            </div>
            <div className="mt-auto">
                <BottomMenuItems />
            </div>
        </div>
    );
}
