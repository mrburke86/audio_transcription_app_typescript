// // src/utils/createUserMessage.ts
// import { logger } from '@/modules/Logger';

// /**
//  * Assembles a structured message that represents the user's input
//  * along with relevant context, to be consumed by the assistant.
//  *
//  * This message includes the user's current question, their role description,
//  * a summary of the ongoing conversation, and any predefined goals.
//  *
//  * @param question - The user's current question or statement.
//  * @param roleDescription - A description of the user's role or persona in the conversation.
//  * @param conversationSummary - A brief summary of the conversation so far.
//  * @param goals - An array of specific goals or milestones related to the user's intentions.
//  * @returns A formatted string that consolidates all the input into a coherent message.
//  */
// export async function createUserMessage(
//     question: string,
//     roleDescription: string,
//     conversationSummary: string,
//     goals: string[]
// ): Promise<string> {
//     logger.debug(`🎭 Creating user message for question: "${question}"`);

//     // Format goals into a single string or fallback message if none are provided
//     const goalsText = goals.length > 0 ? goals.join('; ') : 'No specific goals set.';

//     // Construct the final user message in a readable markdown format
//     const message = `
// **Role Description:**
// ${roleDescription}

// **Conversation Summary:**
// ${conversationSummary}

// **Goals/Milestones:**
// ${goalsText}

// **User Question/Statement:**
// ${question}
// `;

//     logger.debug('✅ User message created successfully');
//     return message;
// }
