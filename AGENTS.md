# Contributor Guide: Real-time AI Interview Response Assistant

## Overview

This project is a live interview assistant that provides real-time AI-powered response generation. It leverages a Next.js frontend, OpenAI for AI processing, and a Qdrant vector database for a personalized knowledge base.

**IMPORTANT ARCHITECTURAL UPDATE & CURRENT FOCUS:**
The application's state management has been significantly refactored from a mix of React Context, useReducer, and useState to a **centralized Zustand-based global store.** This includes modular slices, new custom hooks for forms, middleware, and rebuilt modal systems.

**The primary goal and next step is to integrate this new architecture into the main application runtime.** Many new components and systems are built and tested but are not yet "live" in the main app flow.

## Current Core Task: Integrating the New State Architecture

Your main objective is to help activate the new Zustand-based architecture. This involves:

1.  **Instantiating and Consuming the Zustand Store**: Ensure the global Zustand store is correctly initialized and consumed at the application level, particularly in entry points like `ChatPage`.
2.  **Integrating Refactored Modals**: Replace legacy modal triggers and consumers (for `CallModal`, `InterviewModal`, etc.) with the new modular components and tab-based systems (`CallDetailsTab.tsx`, `KnowledgeBaseTab.tsx` in modals, etc.) that are designed to work with Zustand.
3.  **Updating Core Workflows**:
    * Refactor `ChatPage` to utilize the new unified state system (Zustand slices and hooks).
    * Update LLM-related hooks (e.g., `useLLMProviderOptimized.ts`) and prompt generation workflows (using `generatePrompt.ts`, `promptTemplates.ts`, `createUserPrompt.ts`) to interface with the new state management.
4.  **Removing Legacy Patterns**: Carefully remove old props, state, and context patterns from components as they are updated to use the new hook-based, store-driven patterns.

The goal is to **activate the new architecture** comprehensively without breaking existing business logic or degrading the user experience.

## Understanding the New Architecture

The refactor includes:

* **Zustand Global Store**: A single source of truth replacing React Context, useReducer, and scattered useState.
* **Modular Slices**: Located in `src/stores/slices/`, these manage domain-specific logic:
    * `interviewSlice.ts`
    * `llmSlice.ts`
    * `speechSlice.ts`
    * `knowledgeSlice.ts`
    * `uiSlice.ts`
    * The main store composition is likely in `src/stores/store.ts`.
* **Custom Hooks for Forms & UI**:
    * `useCallContextForm.ts`
    * `useInterviewContextForm.ts`
    * Optimized selector hooks: `src/stores/hooks/useSelectors.ts`
* **Middleware**: For persistence, error handling, and performance, located in `src/stores/middlewares/`.
* **Rebuilt Modal Systems**: `CallModal` and `InterviewModal` now use Zustand directly.
    * Key tab components: `CallDetailsTab.tsx`, `ResponseSettingsTab.tsx`, `AdvancedSettingsTab.tsx`, `KnowledgeBaseTab.tsx` (for InterviewModal).
* **Centralized Prompt Logic**: `src/lib/generatePrompt.ts`, `src/lib/promptTemplates.ts`, and `src/utils/response/createUserPrompt.ts`.
* **New Shared UI Components & Utilities**:
    * `DynamicList.tsx` (note: two files with this name exist, likely one in `call-modal` and one in `interview-modal` components)
    * `FormField.tsx` (similar to DynamicList, check context)
    * `CreativePredefinedSelector.tsx`
    * `src/utils/featureAvailability.ts`

## Key Areas & Files for Integration

Focus your integration efforts on:

* **Application Entry Points**: `src/app/layout.tsx` (for store provider if needed), `src/app/page.tsx`, and especially `src/app/chat/page.tsx`.
* **Zustand Store**: `src/stores/store.ts` and its slices (`src/stores/slices/*`).
* **Modal Components & Triggers**: Existing modals and the components that trigger them need to be updated to use the new `CallSetupModal.tsx` (assuming this is the new entry for one) and the Interview Modal system.
* **Core Hooks**:
    * `src/hooks/useLLMProviderOptimized.ts`
    * `src/hooks/useSpeechRecognition.ts`
    * `src/hooks/useTranscriptions.ts`
* **Prompt Generation Logic**: `src/lib/generatePrompt.ts`, `src/lib/promptTemplates.ts`, `src/utils/response/createUserPrompt.ts`.

Refer to the `technicalDesignDocumentation.md` for the general system architecture, though be mindful that it might not fully reflect the *latest* state management changes until this integration is complete.

## Dev Environment Setup & Tips

1.  **Clone the repository.**
2.  **Install dependencies**:
    ```bash
    npm install
    ```
   
3.  **Environment Variables**: Ensure you have a `.env.local` file (or configure environment variables directly) with necessary keys like `OPENAI_API_KEY`. The `QDRANT_URL` is set to `http://qdrant_db:6333` for Docker.
4.  **Run Docker services**:
    ```bash
    docker-compose up --build -d
    ```
    This will start the Next.js application and the Qdrant database. The application will be available at `http://localhost:3000`.
5.  **For local development without Docker (Next.js app only)**:
    ```bash
    npm run dev
    ```
   
    Ensure Qdrant is accessible if running it separately.

## Contribution and Style Guidelines

* **TypeScript**: Adhere to strict typing. Resolve any TypeScript errors.
* **ESLint**: Code style is enforced by ESLint. Configuration is in `.eslintrc.json`. It uses `next/core-web-vitals` and `plugin:@typescript-eslint/recommended`.
    * `@typescript-eslint/no-explicit-any` is a warning. Try to use specific types.
    * Unused variables (args ignored if prefixed with `_`) will cause an error.
* **Stylelint**: CSS style is enforced by Stylelint. Configuration is in `.stylelintrc.json`. It uses `stylelint-config-standard` and `stylelint-config-tailwindcss`.
* **Code Comments**: Add comments for complex logic or non-obvious code sections, especially during this integration phase.

## How to Validate Changes

Given the nature of the integration, thorough validation is critical:

1.  **Type Checking**:
    ```bash
    npm run type-check
    ```
   
2.  **Linting (JavaScript/TypeScript & CSS)**:
    ```bash
    npm run lint
    npm run lint:css
    ```
   
3.  **Unit Tests (Jest)**:
    ```bash
    npm run test
    ```
   
    Existing tests might need updates to reflect the new state management. New tests for Zustand slices and hooks are encouraged.
4.  **Build**:
    ```bash
    npm run build
    ```
   
5.  **All Checks (Comprehensive)**:
    ```bash
    npm run check-all
    ```
   
6.  **Manual End-to-End Testing**: Crucially, manually test the core application flows after integration changes:
    * Interview setup via modals.
    * Knowledge base indexing and usage.
    * Live speech transcription.
    * Real-time LLM response streaming.
    * Overall UI responsiveness and error handling.

## How the Agent Should Do and Present Its Work

* **Focus**: Prioritize tasks related to integrating the new Zustand architecture.
* **Incremental Changes**: Make small, verifiable changes, especially when replacing legacy patterns.
* **Clarity**: Clearly document (in PRs or comments) which parts of the new architecture are being integrated and which legacy parts are being replaced.
* **PR Messages**: Structure PR messages clearly. A suggested format for integration tasks:
    ```
    [Integration] Activating Zustand for <Component/Workflow>

    **Changes Made:**
    - Replaced legacy <Context/useState/useReducer> in <Component> with Zustand slice <sliceName>.
    - Updated <Component/Hook> to consume new hooks <hookName>.
    - Integrated new modal trigger for <ModalName>.

    **Testing Done:**
    - Verified <specific flow> works as expected.
    - All automated checks pass (`npm run check-all`).

    **Related Issue(s):** (If any)
    ```

## Troubleshooting

* If facing issues with Docker, the `Rebuild-Project.ps1` script provides steps for a clean rebuild (though it's a PowerShell script, the Docker commands are universal).
    * `docker-compose down -v`
    * Consider pruning Docker system: `docker system prune -a -f`
    * Then `docker-compose up --build -d`
* For state-related issues, use Zustand devtools (if installed) or log state from slices/hooks.
