// // src/data/openaiModels.ts
// import { OpenAIModel } from '@/types/openai';

// export const openAIModels: OpenAIModel[] = [
//   // █████ Existing GPT‑4o family – prices aligned with latest pricing table █████
//   {
//     name: 'gpt-4o',
//     description: 'Flagship multimodal model with strong vision capabilities. Faster and cheaper than GPT‑4 Turbo.',
//     inputPricePerMillion: 2.5,
//     outputPricePerMillion: 10.0,
//   },
//   {
//     name: 'gpt-4o-2024-08-06',
//     description: 'GPT‑4o model snapshot with an August 2024 knowledge cutoff.',
//     inputPricePerMillion: 2.5,
//     outputPricePerMillion: 10.0,
//   },
//   {
//     name: 'gpt-4o-mini',
//     description: 'Cost‑efficient small model with vision capabilities.',
//     inputPricePerMillion: 0.15,
//     outputPricePerMillion: 0.6,
//   },
//   {
//     name: 'gpt-4o-mini-2024-07-18',
//     description: 'GPT‑4o‑mini snapshot dated 18 July 2024.',
//     inputPricePerMillion: 0.15,
//     outputPricePerMillion: 0.6,
//   },
//   // █████ NEW GPT‑4.1 family █████
//   {
//     name: 'gpt-4.1',
//     description: 'Next‑generation multimodal model with improved reasoning, context length, and latency.',
//     inputPricePerMillion: 2.0,
//     outputPricePerMillion: 8.0,
//   },
//   {
//     name: 'gpt-4.1-2025-04-14',
//     description: 'GPT‑4.1 model snapshot (14 Apr 2025).',
//     inputPricePerMillion: 2.0,
//     outputPricePerMillion: 8.0,
//   },
//   {
//     name: 'gpt-4.1-mini',
//     description: 'Smaller, cost‑efficient GPT‑4.1 variant for everyday workloads.',
//     inputPricePerMillion: 0.4,
//     outputPricePerMillion: 1.6,
//   },
//   {
//     name: 'gpt-4.1-mini-2025-04-14',
//     description: 'GPT‑4.1‑mini snapshot (14 Apr 2025).',
//     inputPricePerMillion: 0.4,
//     outputPricePerMillion: 1.6,
//   },
//   {
//     name: 'gpt-4.1-nano',
//     description: 'Ultra‑light GPT‑4.1 variant optimised for edge and mobile deployment.',
//     inputPricePerMillion: 0.1,
//     outputPricePerMillion: 0.4,
//     batchInputPricePerMillion: 0.025,
//   },
//   {
//     name: 'gpt-4.1-nano-2025-04-14',
//     description: 'GPT‑4.1‑nano snapshot (14 Apr 2025).',
//     inputPricePerMillion: 0.1,
//     outputPricePerMillion: 0.4,
//     batchInputPricePerMillion: 0.025,
//   },
//   // █████ GPT‑4.5 preview █████
//   {
//     name: 'gpt-4.5-preview',
//     description: 'Early preview of GPT‑4.5 featuring larger context and enhanced reasoning.',
//     inputPricePerMillion: 75.0,
//     outputPricePerMillion: 150.0,
//     batchInputPricePerMillion: 37.5,
//   },
//   {
//     name: 'gpt-4.5-preview-2025-02-27',
//     description: 'GPT‑4.5 preview snapshot (27 Feb 2025).',
//     inputPricePerMillion: 75.0,
//     outputPricePerMillion: 150.0,
//     batchInputPricePerMillion: 37.5,
//   },
//   // █████ GPT‑4o PREVIEW ENDPOINTS █████
//   {
//     name: 'gpt-4o-audio-preview',
//     description: 'Experimental GPT‑4o endpoint optimised for audio input/output.',
//     inputPricePerMillion: 2.5,
//     outputPricePerMillion: 10.0,
//   },
//   {
//     name: 'gpt-4o-audio-preview-2024-12-17',
//     description: 'Audio preview snapshot (17 Dec 2024).',
//     inputPricePerMillion: 2.5,
//     outputPricePerMillion: 10.0,
//   },
//   {
//     name: 'gpt-4o-realtime-preview',
//     description: 'Low‑latency streaming GPT‑4o endpoint for realtime applications.',
//     inputPricePerMillion: 5.0,
//     outputPricePerMillion: 20.0,
//     batchInputPricePerMillion: 2.5,
//   },
//   {
//     name: 'gpt-4o-realtime-preview-2024-12-17',
//     description: 'Realtime preview snapshot (17 Dec 2024).',
//     inputPricePerMillion: 5.0,
//     outputPricePerMillion: 20.0,
//     batchInputPricePerMillion: 2.5,
//   },
//   {
//     name: 'gpt-4o-mini-audio-preview',
//     description: 'Audio‑centric GPT‑4o‑mini endpoint.',
//     inputPricePerMillion: 0.15,
//     outputPricePerMillion: 0.6,
//   },
//   {
//     name: 'gpt-4o-mini-audio-preview-2024-12-17',
//     description: 'GPT‑4o‑mini audio snapshot (17 Dec 2024).',
//     inputPricePerMillion: 0.15,
//     outputPricePerMillion: 0.6,
//   },
//   {
//     name: 'gpt-4o-mini-realtime-preview',
//     description: 'Low‑latency GPT‑4o‑mini endpoint for realtime use‑cases.',
//     inputPricePerMillion: 0.6,
//     outputPricePerMillion: 2.4,
//     batchInputPricePerMillion: 0.3,
//   },
//   {
//     name: 'gpt-4o-mini-realtime-preview-2024-12-17',
//     description: 'GPT‑4o‑mini realtime snapshot (17 Dec 2024).',
//     inputPricePerMillion: 0.6,
//     outputPricePerMillion: 2.4,
//     batchInputPricePerMillion: 0.3,
//   },
//   {
//     name: 'gpt-4o-mini-search-preview',
//     description: 'Search‑optimised GPT‑4o‑mini endpoint.',
//     inputPricePerMillion: 0.15,
//     outputPricePerMillion: 0.6,
//   },
//   {
//     name: 'gpt-4o-mini-search-preview-2025-03-11',
//     description: 'Search preview snapshot (11 Mar 2025).',
//     inputPricePerMillion: 0.15,
//     outputPricePerMillion: 0.6,
//   },
//   {
//     name: 'gpt-4o-search-preview',
//     description: 'Search‑optimised GPT‑4o endpoint.',
//     inputPricePerMillion: 2.5,
//     outputPricePerMillion: 10.0,
//   },
//   {
//     name: 'gpt-4o-search-preview-2025-03-11',
//     description: 'GPT‑4o search preview snapshot (11 Mar 2025).',
//     inputPricePerMillion: 2.5,
//     outputPricePerMillion: 10.0,
//   },
//   // █████ Core "o‑series" reasoning models █████
//   {
//     name: 'o1',
//     description: 'General‑purpose reasoning model (successor to o1‑preview).',
//     inputPricePerMillion: 15.0,
//     outputPricePerMillion: 60.0,
//     batchInputPricePerMillion: 7.5,
//   },
//   {
//     name: 'o1-2024-12-17',
//     description: 'o1 snapshot (17 Dec 2024).',
//     inputPricePerMillion: 15.0,
//     outputPricePerMillion: 60.0,
//     batchInputPricePerMillion: 7.5,
//   },
//   {
//     name: 'o1-pro',
//     description: 'Enterprise‑grade o‑series model for the most demanding workloads.',
//     inputPricePerMillion: 150.0,
//     outputPricePerMillion: 600.0,
//   },
//   {
//     name: 'o1-pro-2025-03-19',
//     description: 'o1‑pro snapshot (19 Mar 2025).',
//     inputPricePerMillion: 150.0,
//     outputPricePerMillion: 600.0,
//   },
//   {
//     name: 'o3',
//     description: 'OpenAI o3 reasoning model (this is the model you are chatting with).',
//     inputPricePerMillion: 10.0,
//     outputPricePerMillion: 40.0,
//     batchInputPricePerMillion: 2.5,
//   },
//   {
//     name: 'o3-2025-04-16',
//     description: 'o3 snapshot (16 Apr 2025).',
//     inputPricePerMillion: 10.0,
//     outputPricePerMillion: 40.0,
//     batchInputPricePerMillion: 2.5,
//   },
//   {
//     name: 'o4-mini',
//     description: 'Mini variant of the forthcoming o4 line with excellent cost‑performance.',
//     inputPricePerMillion: 1.1,
//     outputPricePerMillion: 4.4,
//     batchInputPricePerMillion: 0.275,
//   },
//   {
//     name: 'o4-mini-2025-04-16',
//     description: 'o4‑mini snapshot (16 Apr 2025).',
//     inputPricePerMillion: 1.1,
//     outputPricePerMillion: 4.4,
//     batchInputPricePerMillion: 0.275,
//   },
//   {
//     name: 'o3-mini',
//     description: 'Compact version of o3 for low‑cost reasoning workloads.',
//     inputPricePerMillion: 1.1,
//     outputPricePerMillion: 4.4,
//     batchInputPricePerMillion: 0.55,
//   },
//   {
//     name: 'o3-mini-2025-01-31',
//     description: 'o3‑mini snapshot (31 Jan 2025).',
//     inputPricePerMillion: 1.1,
//     outputPricePerMillion: 4.4,
//     batchInputPricePerMillion: 0.55,
//   },
//   {
//     name: 'o1-mini',
//     description: 'Fast and cost‑efficient reasoning model tailored for coding, math, and science.',
//     inputPricePerMillion: 1.1,
//     outputPricePerMillion: 4.4,
//     batchInputPricePerMillion: 0.55,
//   },
//   {
//     name: 'o1-mini-2024-09-12',
//     description: 'o1‑mini snapshot (12 Sep 2024).',
//     inputPricePerMillion: 1.1,
//     outputPricePerMillion: 4.4,
//     batchInputPricePerMillion: 0.55,
//   },
//   // █████ Code & utility models █████
//   {
//     name: 'codex-mini-latest',
//     description: 'Latest lightweight Codex model for fast code completion and generation.',
//     inputPricePerMillion: 1.5,
//     outputPricePerMillion: 6.0,
//     batchInputPricePerMillion: 0.375,
//   },
//   // █████ Experimental agent & tool models █████
//   {
//     name: 'computer-use-preview',
//     description: 'Experimental agent model that can operate a virtual computer environment.',
//     inputPricePerMillion: 3.0,
//     outputPricePerMillion: 12.0,
//   },
//   {
//     name: 'computer-use-preview-2025-03-11',
//     description: 'Computer‑use snapshot (11 Mar 2025).',
//     inputPricePerMillion: 3.0,
//     outputPricePerMillion: 12.0,
//   },
//   // █████ Image & audio models █████
//   {
//     name: 'gpt-image-1',
//     description: 'Multimodal model specialised for image understanding and generation.',
//     inputPricePerMillion: 5.0,
//     outputPricePerMillion: 0,
//     batchInputPricePerMillion: 1.25,
//   },
//   // -------------- Existing embedding, TTS, Whisper & DALL·E models retained intact --------------
//   {
//     name: 'text-embedding-3-small',
//     description: 'Small embedding model for search, clustering, topic modelling, and classification.',
//     inputPricePerMillion: 0.02,
//     outputPricePerMillion: 0.02,
//     batchInputPricePerMillion: 0.01,
//   },
//   {
//     name: 'text-embedding-3-large',
//     description: 'Large embedding model for advanced search and clustering.',
//     inputPricePerMillion: 0.13,
//     outputPricePerMillion: 0.13,
//     batchInputPricePerMillion: 0.065,
//   },
//   {
//     name: 'ada v2',
//     description: 'Legacy embedding model (ada family).',
//     inputPricePerMillion: 0.1,
//     outputPricePerMillion: 0.1,
//     batchInputPricePerMillion: 0.05,
//   },
//   {
//     name: 'Whisper',
//     description: 'Automatic speech‑to‑text model.',
//     inputPricePerMillion: 0.006,
//     outputPricePerMillion: 0.006,
//   },
//   {
//     name: 'TTS',
//     description: 'Text‑to‑speech model for high‑quality audio generation.',
//     inputPricePerMillion: 15.0,
//     outputPricePerMillion: 30.0,
//   },
//   {
//     name: 'DALL·E 3',
//     description: 'High‑quality image generation model (third generation).',
//     inputPricePerMillion: 0.04,
//     outputPricePerMillion: 0.04,
//     additionalDetails: 'HD versions available at $0.080 / image for higher resolution.',
//   },
//   {
//     name: 'DALL·E 2',
//     description: 'Cost‑efficient image generation model.',
//     inputPricePerMillion: 0.02,
//     outputPricePerMillion: 0.02,
//   },
// ];

// // ✅ HELPER: Get model by name
// export const getModelByName = (name: string): OpenAIModel | undefined => {
//     return openAIModels.find(model => model.name === name);
// };

// // ✅ HELPER: Get model names for dropdowns
// export const getModelNames = (): string[] => {
//     return openAIModels.map(model => model.name);
// };
