// // src/app/assistants/[id]/AssistantInstructionsDisplay.tsx
// import React from "react";
// import ReactMarkdown from "react-markdown";
// import { Button } from "@/components/ui/button";
// import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
// import { customMarkdownComponents } from "@/components/CustomMarkdownComponents";
// import { Edit } from "lucide-react";

// interface AssistantInstructionsDisplayProps {
//     instructions: string;
//     setIsEditing: (isEditing: boolean) => void;
// }

// export function AssistantInstructionsDisplay({
//     instructions,
//     setIsEditing,
// }: AssistantInstructionsDisplayProps) {
//     return (
//         <Card className="mt-6 border-2 border-red-500">
//             <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
//                 <CardTitle className="text-2xl font-bold">
//                     <div className="text-red-500">
//                         &quot;AssistantInstructionsDisplay&quot; Component
//                     </div>

//                     <div>Instructions</div>
//                 </CardTitle>
//                 <Button
//                     onClick={() => setIsEditing(true)}
//                     variant="outline"
//                     size="sm"
//                 >
//                     <Edit className="mr-2 h-4 w-4" />
//                     Edit
//                 </Button>
//             </CardHeader>
//             <CardContent>
//                 <div className="bg-muted p-4 rounded-md overflow-auto max-h-96">
//                     <ReactMarkdown
//                         className="prose dark:prose-invert max-w-none"
//                         components={customMarkdownComponents}
//                     >
//                         {instructions || "No instructions available."}
//                     </ReactMarkdown>
//                 </div>
//             </CardContent>
//         </Card>
//     );
// }
