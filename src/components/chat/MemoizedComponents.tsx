// src/components/chat/MemoizedComponents.tsx
import React from 'react';
import ChatMessagesBox from './ChatMessagesBox';
import GoalsInput from './GoalsInput';
import ConversationSuggestions from './ConversationSuggestions';
import ConversationSummary from './ConversationSummary';
import TranscriptionControls from './TranscriptionControls';
import AudioVisualizer from './AudioVisualizer';
import StatusIndicator from './StatusIndicator';

// Basic memoization without excessive logging
export const MemoizedChatMessagesBox = React.memo(ChatMessagesBox);

export const MemoizedGoalsInput = React.memo(GoalsInput);

export const MemoizedConversationSuggestions = React.memo(ConversationSuggestions);

export const MemoizedConversationSummary = React.memo(ConversationSummary);

export const MemoizedTranscriptionControls = React.memo(TranscriptionControls);

export const MemoizedAudioVisualizer = React.memo(AudioVisualizer);

export const MemoizedStatusIndicator = React.memo(StatusIndicator);

// Set display names for better debugging
MemoizedChatMessagesBox.displayName = 'MemoizedChatMessagesBox';
MemoizedGoalsInput.displayName = 'MemoizedGoalsInput';
MemoizedConversationSuggestions.displayName = 'MemoizedConversationSuggestions';
MemoizedConversationSummary.displayName = 'MemoizedConversationSummary';
MemoizedTranscriptionControls.displayName = 'MemoizedTranscriptionControls';
MemoizedAudioVisualizer.displayName = 'MemoizedAudioVisualizer';
MemoizedStatusIndicator.displayName = 'MemoizedStatusIndicator';
