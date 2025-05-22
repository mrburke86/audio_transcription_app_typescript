// src/app/assistants/AssistantTabs.tsx
"use client";

import { FC, useEffect, useState } from "react";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
    Card,
    CardHeader,
    CardTitle,
    CardContent,
    CardFooter,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Play } from "lucide-react";
import Link from "next/link";
import { MyCustomAssistant } from "@/types/assistant";

interface AssistantTabsProps {
    assistants: MyCustomAssistant[];
}

export const AssistantTabs: FC<AssistantTabsProps> = ({ assistants }) => {
    const [filteredAssistants, setFilteredAssistants] =
        useState<MyCustomAssistant[]>(assistants);
    const [searchTerm, setSearchTerm] = useState("");
    const [activeTab, setActiveTab] = useState("all");
    const [categories, setCategories] = useState<string[]>(["all"]);

    // Initialize categories based on the fetched assistants
    useEffect(() => {
        const uniqueCategories = Array.from(
            new Set(
                assistants.map(
                    (assistant) =>
                        assistant.metadata.category || "uncategorized",
                ),
            ),
        );
        setCategories(["all", ...uniqueCategories]);
    }, [assistants]);

    // Filter assistants based on the search term and active tab
    useEffect(() => {
        const filtered = assistants.filter((assistant) =>
            (assistant.name || "")
                .toLowerCase()
                .includes(searchTerm.toLowerCase()),
        );
        setFilteredAssistants(
            activeTab === "all"
                ? filtered
                : filtered.filter(
                      (assistant) => assistant.metadata.category === activeTab,
                  ),
        );
    }, [searchTerm, activeTab, assistants]);

    return (
        <div>
            <Input
                type="search"
                placeholder="Search assistants..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="mb-4"
            />
            <Tabs defaultValue="all" onValueChange={setActiveTab}>
                <TabsList className="mb-4">
                    {categories.map((category) => (
                        <TabsTrigger
                            key={category}
                            value={category}
                            className="capitalize"
                        >
                            {category}
                        </TabsTrigger>
                    ))}
                </TabsList>
                {categories.map((category) => (
                    <TabsContent key={category} value={category}>
                        {filteredAssistants.length === 0 ? (
                            <p className="text-center text-gray-500 mt-4">
                                No assistants available.
                            </p>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {filteredAssistants.map((assistant) => (
                                    <AssistantCard
                                        key={assistant.id}
                                        assistant={assistant}
                                    />
                                ))}
                            </div>
                        )}
                    </TabsContent>
                ))}
            </Tabs>
        </div>
    );
};

function AssistantCard({ assistant }: { assistant: MyCustomAssistant }) {
    return (
        <Card className="flex flex-col hover:shadow-lg transition-shadow duration-300">
            <CardHeader>
                <div className="flex items-center space-x-4">
                    <Avatar>
                        <AvatarImage
                            src={`https://api.dicebear.com/6.x/initials/svg?seed=${assistant.name}`}
                            alt={assistant.name ?? "default"}
                        />
                        <AvatarFallback>
                            {assistant.name ? assistant.name.charAt(0) : "A"}
                        </AvatarFallback>
                    </Avatar>
                    <div>
                        <CardTitle>{assistant.name}</CardTitle>
                        <p className="text-sm text-muted-foreground">
                            {assistant.metadata?.category || "uncategorized"}
                        </p>
                    </div>
                </div>
            </CardHeader>
            <CardContent className="flex-grow">
                <p>{assistant.description || "No description available."}</p>
            </CardContent>
            <CardFooter>
                <Button asChild variant="default" className="w-full">
                    <Link
                        href={`/chat/${assistant.id}`}
                        className="flex items-center justify-center"
                    >
                        <Play className="mr-2 h-4 w-4" /> Start Chat
                    </Link>
                </Button>
            </CardFooter>
        </Card>
    );
}
