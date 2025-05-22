// // src/app/assistants/[id]/AssistantInstructionsEdit.tsx
// import React, { useState } from "react";
// import { Textarea } from "@/components/ui/textarea";
// import { Button } from "@/components/ui/button";
// import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
// import { updateAssistant } from "@/app/actions";
// import { useToast } from "@/components/ui/use-toast";

// interface AssistantInstructionsEditProps {
//     assistantId: string;
//     instructions: string;
//     setInstructions: (instructions: string) => void;
//     setIsEditing: (isEditing: boolean) => void;
// }

// export function AssistantInstructionsEdit({
//     assistantId,
//     instructions,
//     setInstructions,
//     setIsEditing,
// }: AssistantInstructionsEditProps) {
//     const [isSaving, setIsSaving] = useState(false);
//     const { toast } = useToast();

//     const handleSubmit = async (formData: FormData) => {
//         setIsSaving(true);
//         formData.append("instructions", instructions);
//         try {
//             await updateAssistant(formData);
//             setIsEditing(false);
//             toast({
//                 title: "Instructions updated",
//                 description:
//                     "The assistant's instructions have been successfully updated.",
//             });
//         } catch (error) {
//             toast({
//                 title: "Error",
//                 description: "Failed to update instructions. Please try again.",
//                 variant: "destructive",
//             });
//         } finally {
//             setIsSaving(false);
//         }
//     };

//     return (
//         <Card className="mt-6 border-2 border-red-500">
//             <CardHeader>
//                 <CardTitle>
//                     <div className="text-red-500">
//                         &quot;AssistantInstructionsEdit&quot; Component
//                     </div>

//                     <div>Edit Instructions</div>
//                 </CardTitle>
//             </CardHeader>
//             <CardContent>
//                 <form action={handleSubmit} className="space-y-4">
//                     <input
//                         type="hidden"
//                         name="assistantId"
//                         value={assistantId}
//                     />
//                     <Textarea
//                         name="instructions"
//                         value={instructions}
//                         onChange={(e) => setInstructions(e.target.value)}
//                         rows={10}
//                         className="w-full"
//                         placeholder="Enter instructions for the assistant..."
//                     />
//                     <div className="flex justify-end space-x-2">
//                         <Button
//                             type="button"
//                             variant="outline"
//                             onClick={() => setIsEditing(false)}
//                         >
//                             Cancel
//                         </Button>
//                         <Button
//                             type="submit"
//                             disabled={isSaving}
//                             variant="default"
//                         >
//                             {isSaving ? "Saving..." : "Save Instructions"}
//                         </Button>
//                     </div>
//                 </form>
//             </CardContent>
//         </Card>
//     );
// }
