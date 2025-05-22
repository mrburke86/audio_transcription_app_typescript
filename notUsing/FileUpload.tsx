// // src/components/FileUpload.tsx
// "use client";

// import { useState } from "react";
// import Image from "next/image";
// import { logger } from "@/modules/Logger";
// import { addFileToVectorStore } from "@/lib/openai";

// interface FileUploadProps {
//     assistantId: string;
//     vectorStoreId: string | undefined;
// }

// const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB limit

// export const FileUpload: React.FC<FileUploadProps> = ({
//     assistantId,
//     vectorStoreId,
// }) => {
//     const [file, setFile] = useState<File | null>(null);
//     const [fileEnter, setFileEnter] = useState(false);
//     const [fileName, setFileName] = useState<string>("");
//     const [description, setDescription] = useState<string>("");
//     const [error, setError] = useState<string | null>(null);
//     const [previewUrl, setPreviewUrl] = useState<string | null>(null);

//     const handleFileChange = (uploadedFile: File) => {
//         setError(null);
//         if (uploadedFile.size > MAX_FILE_SIZE) {
//             setError(
//                 `File size exceeds the maximum limit of ${
//                     MAX_FILE_SIZE / (1024 * 1024)
//                 }MB`,
//             );
//             return;
//         }
//         setFile(uploadedFile);
//         setFileName(uploadedFile.name);
//         setDescription("");
//         setPreviewUrl(URL.createObjectURL(uploadedFile));
//     };

//     const handleUploadClick = async () => {
//         if (!file || !fileName || !vectorStoreId) {
//             setError(
//                 "Please select a file, enter a file name, and ensure vector store ID is available.",
//             );
//             return;
//         }
//         logger.info(
//             `📤 Uploading file: ${file.name}, size: ${file.size} bytes`,
//         );

//         const formData = new FormData();
//         formData.append("file", file);
//         formData.append("name", fileName);
//         formData.append("description", description);
//         formData.append("assistantId", assistantId);
//         formData.append("vectorStoreId", vectorStoreId);

//         try {
//             await addFileToVectorStore(formData);
//             // Reset form after successful upload
//             setFile(null);
//             setFileName("");
//             setDescription("");
//             setPreviewUrl(null);
//         } catch (error) {
//             setError("Failed to upload file. Please try again.");
//             logger.error(`Error uploading file: ${error}`);
//         }
//     };

//     return (
//         <div className="container px-4 max-w-5xl mx-auto">
//             {error && <div className="text-red-500 mb-2">{error}</div>}
//             {!file ? (
//                 <div
//                     onDragOver={(e) => {
//                         e.preventDefault();
//                         setFileEnter(true);
//                     }}
//                     onDragLeave={() => setFileEnter(false)}
//                     onDrop={(e) => {
//                         e.preventDefault();
//                         setFileEnter(false);
//                         if (e.dataTransfer.files && e.dataTransfer.files[0]) {
//                             handleFileChange(e.dataTransfer.files[0]);
//                         }
//                     }}
//                     className={`${
//                         fileEnter ? "border-4" : "border-2"
//                     } mx-auto bg-gray-800 flex flex-col w-full max-w-xs h-72 border-dashed items-center justify-center text-white dark:bg-gray-900 dark:text-gray-300`}
//                 >
//                     <label
//                         htmlFor="file"
//                         className="h-full flex flex-col justify-center text-center cursor-pointer"
//                     >
//                         Click to upload or drag and drop
//                     </label>
//                     <input
//                         id="file"
//                         type="file"
//                         className="hidden"
//                         onChange={(e) => {
//                             if (e.target.files && e.target.files[0]) {
//                                 handleFileChange(e.target.files[0]);
//                             }
//                         }}
//                     />
//                 </div>
//             ) : (
//                 <div className="flex flex-col items-center">
//                     {previewUrl && (
//                         <div className="relative w-full max-w-xs h-72">
//                             <Image
//                                 src={previewUrl}
//                                 alt="Uploaded Preview"
//                                 layout="fill"
//                                 objectFit="cover"
//                                 className="rounded-md"
//                             />
//                         </div>
//                     )}
//                     <input
//                         type="text"
//                         value={fileName}
//                         onChange={(e) => setFileName(e.target.value)}
//                         placeholder="Enter file name"
//                         className="mt-2 p-2 bg-gray-700 text-white rounded"
//                     />
//                     <textarea
//                         value={description}
//                         onChange={(e) => setDescription(e.target.value)}
//                         placeholder="Enter file description"
//                         className="mt-2 p-2 bg-gray-700 text-white rounded"
//                     />
//                     <button
//                         onClick={handleUploadClick}
//                         className="px-4 mt-4 uppercase py-2 tracking-widest outline-none bg-blue-600 text-white rounded hover:bg-blue-700"
//                     >
//                         Upload
//                     </button>
//                     <button
//                         onClick={() => {
//                             setFile(null);
//                             setPreviewUrl(null);
//                         }}
//                         className="px-4 mt-2 uppercase py-2 tracking-widest outline-none bg-red-600 text-white rounded hover:bg-red-700"
//                     >
//                         Reset
//                     </button>
//                 </div>
//             )}
//         </div>
//     );
// };
