// src\components\interview-modal\components\InterviewModalTabs.tsx
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { InterviewDetailsTab } from './tabs/InterviewDetailsTab';
import { ResponseSettingsTab } from './tabs/ResponseSettingsTab';
import { ExperienceFocusTab } from './tabs/ExperienceFocusTab';
import { useInterviewModal } from './InterviewModalContext';
import { KnowledgeBaseTab } from './tabs/KnowledgeBaseTab'; // NEW

export function InterviewModalTabs() {
    const { activeTab, setActiveTab } = useInterviewModal();

    return (
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="interview">Interview Details</TabsTrigger>
                <TabsTrigger value="knowledge">Knowledge Base</TabsTrigger> {/* NEW TAB */}
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
