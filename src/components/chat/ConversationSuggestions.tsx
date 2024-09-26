// src/components/chat/ConversationSuggestions.tsx

"use client";
import React from "react";

interface ConversationSuggestionsProps {
  suggestions: string[];
}

const ConversationSuggestions: React.FC<ConversationSuggestionsProps> = ({
  suggestions,
}) => {
  if (!suggestions || suggestions.length === 0) return null;

  return (
    <div
      className="bg-blue-100 border-l-4 border-blue-500 text-blue-700 p-4 mb-4 rounded"
      role="alert"
    >
      <p className="font-bold">Suggested Questions/Statements</p>
      <ul className="list-disc list-inside mb-2">
        {suggestions.map((suggestion, index) => (
          <li key={index}>{suggestion}</li>
        ))}
      </ul>
    </div>
  );
};

export default ConversationSuggestions;
