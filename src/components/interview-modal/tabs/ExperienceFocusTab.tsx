// src/components/interview-modal/tabs/ExperienceFocusTab.tsx
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { FormField } from '../components/FormField';
import { DynamicList } from '../components/DynamicList';
import { useInterviewModal } from '../InterviewModalContext';

export function ExperienceFocusTab() {
    const { context, updateField } = useInterviewModal();

    const handleGoalsChange = (newGoals: string[]) => {
        updateField('goals', newGoals);
    };

    const handleExperiencesChange = (newExperiences: string[]) => {
        updateField('emphasizedExperiences', newExperiences);
    };

    const handleChallengesChange = (newChallenges: string[]) => {
        updateField('specificChallenges', newChallenges);
    };

    return (
        <div className="space-y-4">
            <Card>
                <CardHeader>
                    <CardTitle>🎯 Experience & Goals</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                    <FormField label="Career Goals">
                        <DynamicList
                            items={context.goals}
                            onItemsChange={handleGoalsChange}
                            placeholder="Add a career goal..."
                            addButtonText="Add Goal"
                        />
                    </FormField>

                    <FormField label="Key Experiences to Emphasize">
                        <DynamicList
                            items={context.emphasizedExperiences}
                            onItemsChange={handleExperiencesChange}
                            placeholder="Add an experience to highlight..."
                            addButtonText="Add Experience"
                        />
                    </FormField>

                    <FormField label="Specific Challenges to Address">
                        <DynamicList
                            items={context.specificChallenges}
                            onItemsChange={handleChallengesChange}
                            placeholder="Add a challenge you've overcome..."
                            addButtonText="Add Challenge"
                        />
                    </FormField>

                    <FormField label="Additional Context">
                        <Textarea
                            value={context.industry}
                            onChange={e => updateField('industry', e.target.value)}
                            placeholder="Any additional context about the role, company, or industry..."
                            rows={3}
                        />
                    </FormField>
                </CardContent>
            </Card>
        </div>
    );
}
