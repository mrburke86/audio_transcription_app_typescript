//

export interface DocumentChunk {
    id: string;
    text: string;
    source: string;
    score?: number; // For search results
}
