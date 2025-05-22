// // src/app/assistants/[id]/AssistantHeaderCard.tsx
// "use client";

// import React from "react";
// import {
//     Card,
//     CardContent,
//     CardHeader,
//     CardTitle,
//     CardDescription,
// } from "@/components/ui/card";

// interface AssistantHeaderCardProps {
//     name: string | null;
//     description?: string | null;
// }

// export function AssistantHeaderCard({
//     name,
//     description,
// }: AssistantHeaderCardProps) {
//     return (
//         <Card className="bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 text-white shadow-lg">
//             <CardHeader>
//                 <CardTitle className="text-3xl font-bold">
//                     {name || "Assistant Details"}
//                 </CardTitle>
//                 {description && (
//                     <CardDescription className="mt-2 text-lg">
//                         {description}
//                     </CardDescription>
//                 )}
//             </CardHeader>
//             <CardContent>
//                 <p className="text-sm italic">
//                     This assistant is designed to help you with specific tasks
//                     using OpenAI&apos;s powerful models.
//                 </p>
//             </CardContent>
//         </Card>
//     );
// }
