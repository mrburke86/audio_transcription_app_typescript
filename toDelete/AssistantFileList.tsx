// // src/app/assistants/[id]/AssistantFileList.tsx
// "use client";

// import { VectorStoreFile } from "@/types/assistant";
// import { AssistantFileCard } from "./AssistantFileCard";

// export default function AssistantFileList({
//     files,
//     vectorStoreId,
// }: {
//     files: VectorStoreFile[];
//     vectorStoreId: string;
// }) {
//     if (files.length === 0) {
//         return (
//             <p className="text-muted-foreground text-center py-4">
//                 No files available for this assistant.
//             </p>
//         );
//     }

//     return (
//         <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
//             {files.map((file) => (
//                 <AssistantFileCard
//                     key={file.id}
//                     file={file}
//                     vectorStoreId={vectorStoreId}
//                 />
//             ))}
//         </div>
//     );
// }
