// // src/app/assistants/[id]/AssistantFileCard.tsx
// "use client";

// import { VectorStoreFile } from "@/types/assistant";
// import { Button } from "@/components/ui/button";
// import { removeFileFromVectorStore } from "@/app/actions";
// import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
// import { Trash2, FileIcon } from "lucide-react";
// import { useState } from "react";
// import { useToast } from "@/components/ui/use-toast";

// export function AssistantFileCard({
//     file,
//     vectorStoreId,
// }: {
//     file: VectorStoreFile;
//     vectorStoreId: string;
// }) {
//     const [isDeleting, setIsDeleting] = useState(false);
//     const { toast } = useToast();

//     const handleDelete = async (formData: FormData) => {
//         setIsDeleting(true);
//         try {
//             await removeFileFromVectorStore(formData);
//             toast({
//                 title: "File deleted",
//                 description: "The file has been successfully removed.",
//             });
//         } catch (error) {
//             toast({
//                 title: "Error",
//                 description: "Failed to delete the file. Please try again.",
//                 variant: "destructive",
//             });
//         } finally {
//             setIsDeleting(false);
//         }
//     };

//     return (
//         <Card className="hover:shadow-md transition-shadow duration-300 border-2 border-red-500">
//             <CardHeader className="pb-2">
//                 <CardTitle className="text-sm font-medium flex items-center">
//                     <div className="text-red-500">
//                         &quot;AssistantFileCard&quot; Component
//                     </div>
//                     <FileIcon className="w-4 h-4 mr-2" />
//                     {file.name || file.id}
//                 </CardTitle>
//             </CardHeader>
//             <CardContent className="pt-0">
//                 <div className="text-xs text-muted-foreground">
//                     {new Date(file.created_at * 1000).toLocaleString()}
//                 </div>
//                 <form action={handleDelete} className="mt-2">
//                     <input
//                         type="hidden"
//                         name="vectorStoreId"
//                         value={vectorStoreId}
//                     />
//                     <input type="hidden" name="fileId" value={file.id} />
//                     <Button
//                         type="submit"
//                         variant="destructive"
//                         size="sm"
//                         className="w-full"
//                         disabled={isDeleting}
//                     >
//                         {isDeleting ? "Deleting..." : "Delete"}
//                         <Trash2 className="w-4 h-4 ml-2" />
//                     </Button>
//                 </form>
//             </CardContent>
//         </Card>
//     );
// }
