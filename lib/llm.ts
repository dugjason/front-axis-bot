import { google } from "@ai-sdk/google"
import { generateObject } from "ai"
import { z } from "zod"

interface GenerateMessageOptions {
  // The prompt to use. This should be the AI<>Customer conversation from Front.
  prompt: string
}

const DEFAULT_SYSTEM_PROMPT = `
  Act as a Quality Assurance agent from the Customer Support team at Front whose mission is assist agents in improving the quality of chatbot / AI interactions.
  You main purpose is to score uploaded support conversations using the AXIS framework.

  To measure the effectiveness of AI in customer support, we measure a metric called “AI Experience Impact Score” (AXIS). This metric evaluates how well AI enhances customer interactions in terms of both efficiency and customer satisfaction, factoring in elements unique to AI, such as response accuracy and seamless handoffs to human agents. 
  The AI-SES could be based on three core factors:
  1. Resolution Accuracy (RA): Measures how accurately the AI system resolves customer inquiries or correctly routes them. If a customer question or issue is accurately resolved by AI without human intervention, it reflects a successful use of AI.
  2. Interaction Effort (IE): Measures the amount of effort required by customers when interacting with AI, focusing on the clarity, intuitiveness, and brevity of the experience. This factor includes how many steps or clarifications the customer has to go through before resolution.
  3. Handoff Smoothness (HS): Assesses the quality of transitions between AI and human agents, measuring how seamless and efficient the experience feels when a handoff is necessary. The idea is to minimize any “repetition fatigue” when customers must repeat details they’ve already provided to the AI. (If there is no handoff required between AI and human agentHandoff Smoothness (HS) would be treated as a “neutral” value of 5, assuming AI has handled the interaction completely on its own.)

  You will be provided with a conversation between an AI assistant and a customer. Generate the RA, IE and HS scores based on the outcome of that conversation
`

// Define expected schema for the LLM response
const score = z.number().min(1).max(5)
const schema = z.object({
  hs: z.object({
    score: score.describe(
      "Handoff Smoothness (HS): Assesses the quality of transitions between AI and human agents, measuring how seamless and efficient the experience feels when a handoff is necessary. The idea is to minimize any “repetition fatigue” when customers must repeat details they’ve already provided to the AI. A value between 1 and 5. (If there is no handoff required between AI and human agentHandoff Smoothness (HS) would be treated as a “neutral” value of 5, assuming AI has handled the interaction completely on its own.)",
    ),
    explanation: z
      .string()
      .describe(
        "A brief explanation of your reasoning for assigning this score. This should be a single sentence that captures the essence of the score.",
      ),
  }),
  ie: z.object({
    score: score.describe(
      "Interaction Effort (IE): Measures the amount of effort required by customers when interacting with AI, focusing on the clarity, intuitiveness, and brevity of the experience. This factor includes how many steps or clarifications the customer has to go through before resolution. A value between 1 and 5.",
    ),
    explanation: z
      .string()
      .describe(
        "A brief explanation of your reasoning for assigning this score. This should be a single sentence that captures the essence of the score.",
      ),
  }),
  ra: z.object({
    score: score.describe(
      "Resolution Accuracy (RA): Measures how accurately the AI system resolves customer inquiries or correctly routes them. If a customer question or issue is accurately resolved by AI without human intervention, it reflects a successful use of AI. A value between 1 and 5.",
    ),
    explanation: z
      .string()
      .describe(
        "A brief explanation of your reasoning for assigning this score. This should be a single sentence that captures the essence of the score.",
      ),
  }),
})

// Generate message using the AI SDK
export async function generateMessage({ prompt }: GenerateMessageOptions) {
  try {
    const response = await generateObject({
      model: google("gemini-2.0-flash-001"),
      temperature: 1,
      schema,
      prompt,
      system: DEFAULT_SYSTEM_PROMPT,
    })

    return response.object
  } catch (error) {
    console.error("Error calling LLM")
    console.error(error)
    return null
  }
}
