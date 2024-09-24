// src/types/openai-models.ts

export interface OpenAIModel {
    name: string;
    description: string;
    inputPricePerMillion: number;
    outputPricePerMillion: number;
    batchInputPricePerMillion?: number;
    batchOutputPricePerMillion?: number;
    additionalDetails?: string;
}

const openAIModels: OpenAIModel[] = [
    {
        name: "gpt-4o",
        description:
            "Most advanced multimodal model with strong vision capabilities. Faster and cheaper than GPT-4 Turbo.",
        inputPricePerMillion: 5.0,
        outputPricePerMillion: 15.0,
        batchInputPricePerMillion: 2.5,
        batchOutputPricePerMillion: 7.5,
    },
    {
        name: "gpt-4o-2024-08-06",
        description: "GPT-4o model with a knowledge cutoff of August 2024.",
        inputPricePerMillion: 2.5,
        outputPricePerMillion: 10.0,
        batchInputPricePerMillion: 1.25,
        batchOutputPricePerMillion: 5.0,
    },
    {
        name: "gpt-4o-2024-05-13",
        description:
            "Earlier version of GPT-4o model with a May 2024 knowledge cutoff.",
        inputPricePerMillion: 5.0,
        outputPricePerMillion: 15.0,
        batchInputPricePerMillion: 2.5,
        batchOutputPricePerMillion: 7.5,
    },
    {
        name: "gpt-4o-mini",
        description:
            "Cost-efficient small model with vision capabilities. Cheaper and smarter than GPT-3.5 Turbo.",
        inputPricePerMillion: 0.15,
        outputPricePerMillion: 0.6,
        batchInputPricePerMillion: 0.075,
        batchOutputPricePerMillion: 0.3,
    },
    {
        name: "gpt-4o-mini-2024-07-18",
        description:
            "Mini version of GPT-4o with a knowledge cutoff of July 2024.",
        inputPricePerMillion: 0.15,
        outputPricePerMillion: 0.6,
        batchInputPricePerMillion: 0.075,
        batchOutputPricePerMillion: 0.3,
    },
    {
        name: "o1-preview",
        description:
            "New reasoning model for complex tasks with an October 2023 knowledge cutoff.",
        inputPricePerMillion: 15.0,
        outputPricePerMillion: 60.0,
    },
    {
        name: "o1-mini",
        description:
            "Fast and cost-efficient reasoning model tailored for coding, math, and science.",
        inputPricePerMillion: 3.0,
        outputPricePerMillion: 12.0,
    },
    {
        name: "text-embedding-3-small",
        description:
            "Small embedding model for search, clustering, topic modeling, and classification.",
        inputPricePerMillion: 0.02,
        outputPricePerMillion: 0.02,
        batchInputPricePerMillion: 0.01,
    },
    {
        name: "text-embedding-3-large",
        description:
            "Large embedding model for advanced search and clustering.",
        inputPricePerMillion: 0.13,
        outputPricePerMillion: 0.13,
        batchInputPricePerMillion: 0.065,
    },
    {
        name: "ada v2",
        description: "Embedding model.",
        inputPricePerMillion: 0.1,
        outputPricePerMillion: 0.1,
        batchInputPricePerMillion: 0.05,
    },
    {
        name: "gpt-4o-2024-08-06 (Fine-tuning)",
        description:
            "Fine-tuning available with complimentary tokens until October 31, 2024.",
        inputPricePerMillion: 3.75,
        outputPricePerMillion: 15.0,
        batchInputPricePerMillion: 1.875,
        batchOutputPricePerMillion: 7.5,
        additionalDetails: "$25.00 / 1M training tokens",
    },
    {
        name: "gpt-4o-mini-2024-07-18 (Fine-tuning)",
        description:
            "Fine-tuning available with complimentary tokens until October 31, 2024.",
        inputPricePerMillion: 0.3,
        outputPricePerMillion: 1.2,
        batchInputPricePerMillion: 0.15,
        batchOutputPricePerMillion: 0.6,
        additionalDetails: "$3.00 / 1M training tokens",
    },
    {
        name: "gpt-3.5-turbo",
        description: "Popular model optimized for performance.",
        inputPricePerMillion: 3.0,
        outputPricePerMillion: 6.0,
        batchInputPricePerMillion: 1.5,
        batchOutputPricePerMillion: 3.0,
        additionalDetails: "$8.00 / 1M training tokens",
    },
    {
        name: "davinci-002",
        description: "High-performance model for a wide range of tasks.",
        inputPricePerMillion: 12.0,
        outputPricePerMillion: 12.0,
        batchInputPricePerMillion: 6.0,
        batchOutputPricePerMillion: 6.0,
        additionalDetails: "$6.00 / 1M training tokens",
    },
    {
        name: "babbage-002",
        description: "Economical model for general purposes.",
        inputPricePerMillion: 1.6,
        outputPricePerMillion: 1.6,
        batchInputPricePerMillion: 0.8,
        batchOutputPricePerMillion: 0.8,
        additionalDetails: "$0.40 / 1M training tokens",
    },
    {
        name: "Whisper",
        description: "Audio model for speech transcription.",
        inputPricePerMillion: 0.006,
        outputPricePerMillion: 0.006,
    },
    {
        name: "TTS",
        description: "Text-to-Speech model for audio generation.",
        inputPricePerMillion: 15.0,
        outputPricePerMillion: 30.0,
    },
    {
        name: "DALL·E 3",
        description: "High-quality image generation model.",
        inputPricePerMillion: 0.04,
        outputPricePerMillion: 0.04,
        additionalDetails:
            "HD versions available at $0.080/image for higher resolution.",
    },
    {
        name: "DALL·E 2",
        description:
            "Cost-efficient image generation model optimized for lower cost.",
        inputPricePerMillion: 0.02,
        outputPricePerMillion: 0.02,
    },
];

export default openAIModels;

// export type OpenAIModel = (typeof openAIModels)[number];
export const OpenAIModelNames = {
    GPT4O: "gpt-4o",
    GPT4O_2024_08_06: "gpt-4o-2024-08-06",
    GPT4O_2024_05_13: "gpt-4o-2024-05-13",
    GPT4O_MINI: "gpt-4o-mini",
    GPT4O_MINI_2024_07_18: "gpt-4o-mini-2024-07-18",
    O1_PREVIEW: "o1-preview",
    O1_MINI: "o1-mini",
    TEXT_EMBEDDING_3_SMALL: "text-embedding-3-small",
    TEXT_EMBEDDING_3_LARGE: "text-embedding-3-large",
    ADA_V2: "ada v2",
    GPT4O_2024_08_06_FINE_TUNING: "gpt-4o-2024-08-06 (Fine-tuning)",
    GPT4O_MINI_2024_07_18_FINE_TUNING: "gpt-4o-mini-2024-07-18 (Fine-tuning)",
    GPT3_5_TURBO: "gpt-3.5-turbo",
    DAVINCI_002: "davinci-002",
    BABBAGE_002: "babbage-002",
    WHISPER: "Whisper",
    TTS: "TTS",
    DALLE_3: "DALL·E 3",
    DALLE_2: "DALL·E 2",
} as const;

export type OpenAIModelName =
    (typeof OpenAIModelNames)[keyof typeof OpenAIModelNames];
