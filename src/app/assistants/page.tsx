// src/app/assistants/page.tsx
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { AssistantTabs } from "./AssistantTabs";
import { fetchAssistants } from "../actions/fetch-assistants";

export default async function AssistantsPage() {
    // Fetch assistants using the server action
    const assistants = await fetchAssistants();

    return (
        <div className="container mx-auto p-4 space-y-6">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold">Choose an Assistant</h1>
                <Button asChild variant="default">
                    <Link
                        href="/assistants/create"
                        className="flex items-center"
                    >
                        <Plus className="mr-2 h-4 w-4" /> Create Assistant
                    </Link>
                </Button>
            </div>
            <AssistantTabs assistants={assistants} />
        </div>
    );
}
