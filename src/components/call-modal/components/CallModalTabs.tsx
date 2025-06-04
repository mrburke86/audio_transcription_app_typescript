// src/components/call-modal/components/CallModalTabs.tsx
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { CallDetailsTab } from '../tabs/CallDetailsTab';
import { ContentStrategyTab } from '../tabs/ContentStrategyTab';
import { ResponseSettingsTab } from '../tabs/ResponseSettingsTab';
import { AdvancedSettingsTab } from '../tabs/AdvancedSettingsTab';
import { useCallModal } from '../CallModalContext';
import { KnowledgeBaseTab } from '../tabs/KnowledgeBaseTab';

export function CallModalTabs() {
    const { activeTab, setActiveTab } = useCallModal();

    return (
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-5">
                <TabsTrigger value="details">📞 Call Details</TabsTrigger>
                <TabsTrigger value="content">📝 Content & Strategy</TabsTrigger>
                <TabsTrigger value="knowledge">🧠 Knowledge Base</TabsTrigger>
                <TabsTrigger value="settings">⚙️ Response Settings</TabsTrigger>
                <TabsTrigger value="advanced">🔧 Advanced</TabsTrigger>
            </TabsList>

            <TabsContent value="details" className="space-y-4">
                <CallDetailsTab />
            </TabsContent>

            <TabsContent value="content" className="space-y-4">
                <ContentStrategyTab />
            </TabsContent>

            <TabsContent value="knowledge" className="space-y-4">
                <KnowledgeBaseTab />
            </TabsContent>

            <TabsContent value="settings" className="space-y-4">
                <ResponseSettingsTab />
            </TabsContent>

            <TabsContent value="advanced" className="space-y-4">
                <AdvancedSettingsTab />
            </TabsContent>
        </Tabs>
    );
}
