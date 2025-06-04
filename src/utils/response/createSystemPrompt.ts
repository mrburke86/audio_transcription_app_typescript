// src\utils\createSystemPrompt.ts

// ** Build the system role prompt with interview context and knowledge base info **

import { logger } from '@/modules/Logger';
import { InitialInterviewContext } from '@/types';
import { InstructionBuilder } from '../prompts/PromptInstructions';

// interface CreateSystemPromptProps {
//     initialInterviewContext: InitialInterviewContext;
//     goals: string[];
// }

export async function createSystemPrompt(
    initialInterviewContext: InitialInterviewContext,
    goals: string[]
): Promise<string> {
    logger.debug(`🎭 Creating streamlined system prompt...`);

    const goalsText = goals.length > 0 ? `Weave these objectives naturally into responses: ${goals.join(', ')}` : '';

    // Use centralized instructions - no redundancy with user prompt
    const systemInstructions = InstructionBuilder.buildSystemInstructions('interview_responder');

    const systemMessage = `You are generating world-class, deeply insightful first-person responses that establish thought leadership in a live interview.
  
  ## LIVE INTERVIEW CONTEXT:
  - Target Role: ${initialInterviewContext.targetRole} (${initialInterviewContext.seniorityLevel} level)
  - Company: ${initialInterviewContext.targetCompany || 'Target companies'}
  - Industry: ${initialInterviewContext.industryVertical}
  - Interview Type: ${initialInterviewContext.interviewType}
  
  ## RESPONSE SETTINGS:
  - Confidence: ${initialInterviewContext.responseConfidence}
  - Structure: ${initialInterviewContext.responseStructure} 
  - Include Metrics: ${initialInterviewContext.includeMetrics}
  
  ## CANDIDATE PROFILE:
  ${generateDynamicProfile(initialInterviewContext)}
  
  ${
      initialInterviewContext.emphasizedExperiences.length > 0
          ? `EMPHASIZE: ${initialInterviewContext.emphasizedExperiences.join(', ')}`
          : ''
  }
  
  ## RESPONSE STANDARDS:
  ${systemInstructions}
  
  ${goalsText}
  
  **Tone:** Confident expert who provides insights that make people think "That's brilliant."`;

    logger.debug('✅ Streamlined system prompt created');
    return systemMessage;
}

// Helper function for dynamic profile generation
function generateDynamicProfile(context: InitialInterviewContext): string {
    const profile = [];

    if (context.yearsOfExperience) {
        profile.push(`${context.yearsOfExperience}+ years experience in ${context.industryVertical}`);
    }

    if (context.keyAchievements?.length > 0) {
        profile.push(
            `Key achievements: ${context.keyAchievements
                .slice(0, 2)
                .map(a => a.description)
                .join(', ')}`
        );
    }

    if (context.expertiseDomains?.length > 0) {
        profile.push(`Expertise: ${context.expertiseDomains.join(', ')}`);
    }

    return profile.length > 0
        ? profile.map(item => `- ${item}`).join('\n')
        : '- Experienced professional with demonstrated expertise';
}

// const createSystemPrompt = (context: InterviewContext): string => {
//     return `You are a live interview response generator for an experienced B2B sales professional.

// LIVE INTERVIEW CONTEXT:
// - Target Role: ${context.targetRole} (${context.seniorityLevel} level)
// - Company: ${context.targetCompany || 'Target companies'}
// - Industry: ${context.industry}
// - Interview Type: ${context.interviewType}

// RESPONSE SETTINGS:
// - Confidence: ${context.responseConfidence}
// - Structure: ${context.responseStructure}
// - Include Metrics: ${context.includeMetrics}
// - Memory Depth: ${context.contextDepth} exchanges

// CANDIDATE PROFILE:
// - 15+ years B2B sales in regulated environments
// - Proven expertise: Manufacturing, RegTech, Quality Management
// - Key achievements: £3.2M+ deals, MEDDPICC methodology

// ${context.emphasizedExperiences.length > 0 ? `EMPHASIZE: ${context.emphasizedExperiences.join(', ')}` : ''}

// ${context.roleDescription}

// Generate complete, word-perfect responses that sound natural when spoken aloud during the live interview.`;
// };
