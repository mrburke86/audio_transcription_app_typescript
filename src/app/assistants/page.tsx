// src/app/assistants/page.tsx
import { AssistantTabs } from "./AssistantTabs";
import { fetchAssistants } from "../actions/fetch-assistants";

export default async function AssistantsPage() {
    const assistants = await fetchAssistants();

    return (
        <div className="flex-1 p-4 space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold">AI Assistants</h1>
                    <p className="text-muted-foreground">
                        Choose an assistant to start chatting
                    </p>
                </div>
                <div className="text-sm text-muted-foreground">
                    Manage assistants in OpenAI Playground
                </div>
            </div>
            <AssistantTabs assistants={assistants} />
        </div>
    );
}
