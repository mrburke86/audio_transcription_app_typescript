// src/components/interview-modal/InterviewModalTabs.tsx
'use client';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useBoundStore } from '@/stores/chatStore'; // FIXED: Added - Use composed store for uiSlice access (activeTab/setActiveTab)
import { ExperienceFocusTab } from './tabs/ExperienceFocusTab';
import { InterviewDetailsTab } from './tabs/InterviewDetailsTab';
import { KnowledgeBaseTab } from './tabs/KnowledgeBaseTab';
import { ResponseSettingsTab } from './tabs/ResponseSettingsTab';

export function InterviewModalTabs() {
    const { activeTab, setActiveTab } = useBoundStore(); // FIXED: Destructure from store (uiSlice) to replace hook

    return (
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="interview">Interview Details</TabsTrigger>
                <TabsTrigger value="knowledge">Knowledge Base</TabsTrigger>
                <TabsTrigger value="settings">Response Settings</TabsTrigger>
                <TabsTrigger value="experience">Experience Focus</TabsTrigger>
            </TabsList>

            <TabsContent value="interview" className="space-y-4">
                <InterviewDetailsTab />
            </TabsContent>

            <TabsContent value="knowledge" className="space-y-4">
                <KnowledgeBaseTab />
            </TabsContent>

            <TabsContent value="settings" className="space-y-4">
                <ResponseSettingsTab />
            </TabsContent>

            <TabsContent value="experience" className="space-y-4">
                <ExperienceFocusTab />
            </TabsContent>
        </Tabs>
    );
}
