// src/components/knowledge/KnowledgeManagement.tsx
import { useKnowledge } from '@/stores/store';

export function KnowledgeManagement() {
      const { isIndexing, triggerIndexing, searchResults, searchDocuments } = useKnowledge();

      const handleSearch = async (query: string) => {
            const results = await searchDocuments(query);
            // Results automatically updated in state
      };

      return (
            <div>
                  <button onClick={triggerIndexing} disabled={isIndexing}>
                        {isIndexing ? 'Indexing...' : 'Start Indexing'}
                  </button>

                  {searchResults.map(result => (
                        <div key={result.id}>
                              <h4>{result.source}</h4>
                              <p>{result.text}</p>
                        </div>
                  ))}
            </div>
      );
}
