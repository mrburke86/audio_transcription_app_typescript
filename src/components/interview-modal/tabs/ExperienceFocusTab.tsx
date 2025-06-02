// src/components/interview-modal/tabs/ExperienceFocusTab.tsx
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { FormField } from '../components/FormField';
import { useInterviewModal } from '../InterviewModalContext';
import { Plus } from 'lucide-react';
import { useState } from 'react';
import { PREDEFINED_CHALLENGES, PREDEFINED_EXPERIENCES } from '@/lib/predefinedFields';
import { PREDEFINED_INTERVIEW_GOALS } from '@/lib/predefinedFields';

interface CheckboxWithCustomInputProps {
    title: string;
    description?: string;
    icon: string;
    predefinedOptions: string[];
    selectedItems: string[];
    onToggleItem: (item: string) => void;
    onAddCustomItem: (item: string) => void;
    customPlaceholder: string;
}

function CheckboxWithCustomInput({
    title,
    description,
    icon,
    predefinedOptions,
    selectedItems,
    onToggleItem,
    onAddCustomItem,
    customPlaceholder,
}: CheckboxWithCustomInputProps) {
    const [customInput, setCustomInput] = useState('');

    const handleAddCustom = () => {
        if (customInput.trim() && !selectedItems.includes(customInput.trim())) {
            onAddCustomItem(customInput.trim());
            setCustomInput('');
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            handleAddCustom();
        }
    };

    // Separate custom items for display
    const customSelected = selectedItems.filter(item => !predefinedOptions.includes(item));

    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    {icon} {title}
                </CardTitle>
                {description && <p className="text-sm text-gray-600">{description}</p>}
            </CardHeader>
            <CardContent className="space-y-4">
                {/* Predefined Options */}
                <div>
                    <label className="text-sm font-medium mb-3 block">Select from common options:</label>
                    <div className="grid grid-cols-1 gap-3">
                        {predefinedOptions.map((option, index) => (
                            <div key={index} className="flex items-center space-x-2">
                                <Checkbox
                                    id={`${title.toLowerCase().replace(/\s+/g, '-')}-${index}`}
                                    checked={selectedItems.includes(option)}
                                    onCheckedChange={_checked => {
                                        onToggleItem(option);
                                    }}
                                />
                                <label
                                    htmlFor={`${title.toLowerCase().replace(/\s+/g, '-')}-${index}`}
                                    className="text-sm cursor-pointer"
                                >
                                    {option}
                                </label>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Custom Input */}
                <div>
                    <label className="text-sm font-medium mb-2 block">Add custom option:</label>
                    <div className="flex gap-2">
                        <Input
                            value={customInput}
                            onChange={e => setCustomInput(e.target.value)}
                            placeholder={customPlaceholder}
                            onKeyDown={handleKeyDown}
                        />
                        <Button
                            onClick={handleAddCustom}
                            size="sm"
                            disabled={!customInput.trim() || selectedItems.includes(customInput.trim())}
                        >
                            <Plus className="h-4 w-4" />
                        </Button>
                    </div>
                </div>

                {/* Show custom selections if any */}
                {customSelected.length > 0 && (
                    <div>
                        <label className="text-sm font-medium mb-2 block">Your custom additions:</label>
                        <div className="space-y-2">
                            {customSelected.map((item, index) => (
                                <div key={index} className="flex items-center justify-between bg-gray-50 p-2 rounded">
                                    <span className="text-sm">{item}</span>
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => onToggleItem(item)}
                                        className="text-red-500 hover:text-red-700"
                                    >
                                        Remove
                                    </Button>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}

export function ExperienceFocusTab() {
    const { context, toggleInArray, updateField } = useInterviewModal();

    const handleAddCustomGoal = (goal: string) => {
        toggleInArray('goals', goal);
    };

    const handleAddCustomExperience = (experience: string) => {
        toggleInArray('emphasizedExperiences', experience);
    };

    const handleAddCustomChallenge = (challenge: string) => {
        toggleInArray('specificChallenges', challenge);
    };

    return (
        <div className="space-y-4">
            {/* Interview Goals */}
            <CheckboxWithCustomInput
                title="Interview Goals"
                description="What do you want to achieve or learn from this interview?"
                icon="🎯"
                predefinedOptions={PREDEFINED_INTERVIEW_GOALS}
                selectedItems={context.goals}
                onToggleItem={item => toggleInArray('goals', item)}
                onAddCustomItem={handleAddCustomGoal}
                customPlaceholder="Add a specific interview goal..."
            />

            {/* Key Experiences */}
            <CheckboxWithCustomInput
                title="Key Experiences to Emphasize"
                description="Which experiences should be highlighted in your responses?"
                icon="💼"
                predefinedOptions={PREDEFINED_EXPERIENCES}
                selectedItems={context.emphasizedExperiences}
                onToggleItem={item => toggleInArray('emphasizedExperiences', item)}
                onAddCustomItem={handleAddCustomExperience}
                customPlaceholder="Add a specific experience to highlight..."
            />

            {/* Specific Challenges */}
            <CheckboxWithCustomInput
                title="Challenges to Address"
                description="What types of challenges can you speak to confidently?"
                icon="⚡"
                predefinedOptions={PREDEFINED_CHALLENGES}
                selectedItems={context.specificChallenges}
                onToggleItem={item => toggleInArray('specificChallenges', item)}
                onAddCustomItem={handleAddCustomChallenge}
                customPlaceholder="Add a specific challenge you've overcome..."
            />

            {/* Additional Context */}
            <Card>
                <CardHeader>
                    <CardTitle>📝 Additional Context</CardTitle>
                </CardHeader>
                <CardContent>
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
