## Project Structure

```
InterviewEdgeAI/
├── public/
│   ├── knowledge/
│   │   ├── C_Level_Engagement_Strategies_Manufacturing.md
│   │   ├── etq_company_profile.md
│   │   ├── /* Around 15 other `.md` knowledge documents */
│   │   └── etq_mid_market_account_executive_europe.md
│   └── logo.svg

├── src/
│   ├── app/
│   │   ├── api/
│   │   │   └── knowledge/
│   │   │   │   └── index-knowledge/
│   │   │   │        └── route.ts
│   │   ├── capture-content/
│   │   │   └── page.tsx
│   │   ├── chat/
│   │   │   └── page.tsx
│   │   ├── error.tsx
│   │   ├── favicon.ico
│   │   ├── page.tsx
│   │   └── layout.tsx

│   ├── components/
│   │   ├── chat/
│   │   │   ├── areas/
│   │   │   │   ├── ChatInputArea.tsx
│   │   │   │   ├── ChatMessageArea.tsx
│   │   │   │   ├── ContextInsightsArea.tsx
│   │   │   │   ├── index.ts
│   │   │   │   ├── TopNavigationArea.tsx
│   │   │   │   └── VoiceControlsArea.tsx
│   │   │   ├── context/
│   │   │   │   ├── index.ts
│   │   │   │   └── StreamedContentContext.tsx
│   │   │   ├── primitives/
│   │   │   │   ├── ChatMessagesBox.tsx
│   │   │   │   ├── ConversationContext.tsx
│   │   │   │   ├── ConversationInsights.tsx
│   │   │   │   ├── index.ts
│   │   │   │   ├── InitializationLoader.tsx
│   │   │   │   ├── KnowledgeIndicator.tsx
│   │   │   │   ├── LiveTranscriptionBox.ts
│   │   │   │   └── VoiceControls.tsx
│   │   │   ├── ChatInterface.tsx
│   │   │   └── index.ts

│   │   ├── error-boundary/
│   │   │   ├── ErrorBoundary.tsx
│   │   │   ├── ErrorFallback.tsx
│   │   │   └── index.tsx

│   │   ├── global/
│   │   │   ├── TopNavigationBar/
│   │   │   │   ├── index.tsx
│   │   │   │   ├── KnowledgeStatus.tsx
│   │   │   │   └── StatusIndicator.tsx
│   │   │   ├── tailwind-indicator.tsx
│   │   │   └── theme-toggle.tsx

│   │   ├── icons/
│   │   │   └── icons.tsx

│   │   ├── interview-modal/
│   │   │   ├── components/
│   │   │   │   └── FormField.tsx
│   │   │   ├── tabs/
│   │   │   │   ├── ExperienceFocusTab.tsx
│   │   │   │   ├── InterviewDetailsTab.tsx
│   │   │   │   ├── KnowledgeBaseTab.tsx
│   │   │   │   └── ResponseSettingsTab.tsx
│   │   │   └── InterviewModalTabs.tsx

│   │   ├── ui/
│   │   │   │   ├── alert.tsx
│   │   │   │   ├── /* About 20 shadcn/ui components */
│   │   │   │   └── use-toast.tsx

│   │   ├── KnowledgeIndexingButton.tsx
│   │   └── markdownComponents.tsx

│   ├── hooks/
│   │   │   ├── chat/
│   │   │   │   ├── index.ts
│   │   │   │   └── useInitialization.ts
│   │   │   ├── speech/
│   │   │   │   ├── index.ts
│   │   │   │   ├── useAudioVisualization.ts
│   │   │   │   ├── useBrowserSpeechRecognition.ts
│   │   │   │   ├── useSpeechAPI.ts
│   │   │   │   └── useSpeechSession.ts
│   │   ├── index.ts
│   │   └── useRenderDiagnostics.ts

│   ├── lib/
│   │   ├── DiagnosticLogger.ts
│   │   ├── Logger.ts
│   │   ├── predefinedFields.ts
│   │   ├── utils.ts
│   │   └── validateInterviewContext.ts

│   ├── services/
│   │   ├── OpenAIClientService.ts
│   │   ├── OpenAIEmbeddingService.ts
│   │   └── QdrantService.ts

│   ├── stores/
│   │   ├── middleware/
│   │   │   ├── circuitBreakerMiddleware.ts
│   │   │   └── loggerMiddleware.ts
│   │   └── slices/
│   │   │   ├── chatSlice.ts
│   │   │   ├── contextSlice.ts
│   │   │   ├── knowledgeSlice.ts
│   │   │   ├── llmSlice.ts
│   │   │   ├── llmSlice.ts
│   │   │   └── uiSlice.ts
│   │   └── chatStore.ts

│   ├── styles/
│   │   └── globals.css

│   ├── types/
│   │   ├── components.ts
│   │   ├── core.ts
│   │   ├── hooks.ts
│   │   ├── index.ts
│   │   ├── services.ts
│   │   ├── slices.ts
│   │   ├── state.ts
│   │   └── utils.ts

│   └── utils/
│   │   ├── devLogger.ts
│   │   ├── helpers.ts
│   │   ├── knowledgeIntegration.ts
│   │   └── prompts.ts

│   ├── .gitignore
│   ├── next.config.js
│   ├── package.json
│   ├── package-lock.json
│   ├── postcss.config.mjs
│   ├── tailwind.config.ts
│   ├── tsconfig.json
│   └── README.md
```
