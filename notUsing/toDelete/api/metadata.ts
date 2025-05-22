// // src/app/api/metadata.ts

// type Metadata = {
//     fileId: string;
//     name: string;
//     description: string;
// };

// const metadataStore: Record<string, Metadata> = {};

// // Function to save file metadata
// export function saveFileMetadata(metadata: Metadata) {
//     metadataStore[metadata.fileId] = metadata;
// }

// // Function to retrieve metadata for a specific file
// export function getFileMetadata(fileId: string): Metadata | undefined {
//     return metadataStore[fileId];
// }

// // Function to retrieve all metadata
// export function getAllFileMetadata(): Metadata[] {
//     return Object.values(metadataStore);
// }
