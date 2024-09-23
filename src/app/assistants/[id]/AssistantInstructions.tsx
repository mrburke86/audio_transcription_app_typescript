// src/app/assistants/[category]/[id]/AssistantInstructions.tsx
"use client";

import React, { useState } from "react";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Edit } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import MarkdownRenderer from "@/components/MarkdownRenderer";
import { updateAssistant } from "@/lib/openai";
// import MarkdownRenderer from "@/components/CustomMarkdownComponents";

export default function AssistantInstructions({
    assistantId,
    initialInstructions,
}: {
    assistantId: string;
    initialInstructions: string;
}) {
    const [instructions, setInstructions] = useState(initialInstructions);
    const [isEditing, setIsEditing] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const { toast } = useToast();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSaving(true);

        const formData = new FormData();
        formData.append("assistantId", assistantId);
        formData.append("instructions", instructions);

        try {
            await updateAssistant(assistantId, { instructions });
            setIsEditing(false);
            toast({
                title: "Instructions updated",
                description:
                    "The assistant's instructions have been successfully updated.",
            });
        } catch (error) {
            console.error("Failed to update instructions:", error); // Now error is used
            toast({
                title: "Error",
                description: "Failed to update instructions. Please try again.",
                variant: "destructive",
            });
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <Card className="mt-6">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-2xl font-bold">
                    {isEditing ? "Edit Instructions" : "Instructions"}{" "}
                </CardTitle>
                {!isEditing && (
                    <Button
                        onClick={() => setIsEditing(true)}
                        variant="outline"
                        size="sm"
                    >
                        <Edit className="mr-2 h-4 w-4" />
                        Edit
                    </Button>
                )}
            </CardHeader>
            <CardContent>
                {isEditing ? (
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <Textarea
                            name="instructions"
                            value={instructions}
                            onChange={(e) => setInstructions(e.target.value)}
                            rows={10}
                            className="w-full"
                            placeholder="Enter instructions for the assistant..."
                        />
                        <div className="flex justify-end space-x-2">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => setIsEditing(false)}
                            >
                                Cancel
                            </Button>
                            <Button
                                type="submit"
                                disabled={isSaving}
                                variant="default"
                            >
                                {isSaving ? "Saving..." : "Save Instructions"}
                            </Button>
                        </div>
                    </form>
                ) : (
                    <div className="bg-muted p-4 rounded-md prose dark:prose-invert max-w-none">
                        {instructions ? (
                            <MarkdownRenderer
                                content={
                                    instructions || "No instructions available."
                                }
                            />
                        ) : (
                            <p>No instructions available.</p>
                        )}
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
