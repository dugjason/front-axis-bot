import { waitUntil } from '@vercel/functions';
import crypto from 'node:crypto';

import { calculateAxisScore } from '../lib/axis';
import { env } from '../lib/env';
import { Front } from '../lib/front';
import { generateMessage } from '../lib/llm';
import { requestSchema } from '../lib/schema';

async function processConversation(message: string, conversationId: string) {
  // Generate the AXIS score using the LLM
  const completion = await generateMessage({
    prompt: message
  });

  if (!completion) {
    console.error('LLM failed to generate an AXIS score');
    return;
  }

  const { ra, ie, hs } = completion;

  // Initialize the Front client
  const front = new Front({
    accessToken: env.FRONT_API_KEY,
  });

  // Calculate the AXIS score. While LLMs are capable of this, it's simpler and cheaper to do it here.
  const axis = calculateAxisScore(ra.score, ie.score, hs.score);

  // Update the conversation with the AXIS score
  await front.updateConversation(conversationId, { axis, ra: ra.score, ie: ie.score, hs: hs.score });

  // Create tags for the conversation
  const tagId = await front.createTag(`AXIS: ${axis}`);
  /**
   * Create the AXIS Range tag
   * 1-2.9: Poor
   * 3-3.9: Fair
   * 4-5: Excellent
   * @see https://front.com/blog/ai-experience-impact-score-axis
   */
  const axisRange = axis < 3 ? 'Poor' : axis < 4 ? 'Fair' : 'Excellent';
  const axisRangeTagId = await front.createTag(`AXIS Range: ${axisRange}`);

  // Add the tags to the conversation
  await front.addTagsToConversation(conversationId, [tagId, axisRangeTagId]);

  // Add a comment to the conversation. Formatting is done using markdown.
  await front.addComment(conversationId, `AXIS score: **${axis}** - ${axisRange}
  **RA: ${ra.score}**
  - _${ra.explanation}_

  **IE: ${ie.score}**
  - _${ie.explanation}_
  
  **HS: ${hs.score}**
  - _${hs.explanation}_`);
}

/**
 * Validate integrity of the incoming request body
 * @see https://dev.frontapp.com/docs/security-1
 */
function requestIntegrityCheck(body: string, headers: Request['headers']): boolean {
  // Validate the required request headers are present
  if (!headers.get('x-front-request-timestamp') || !headers.get('x-front-signature')) {
    console.error('Missing required request headers');
    return false
  }

  const baseString = Buffer.concat([
    Buffer.from(`${headers.get('x-front-request-timestamp')}:`, "utf8"),
    Buffer.from(JSON.stringify(body)),
  ]).toString()

  const hmac = crypto
    .createHmac("sha256", env.FRONT_APP_SECRET)
    .update(baseString)
    .digest("base64")

  if (hmac !== headers.get('x-front-signature')) {
    console.error('Invalid integrity');
    return false
  }

  return true
}

/**
 * 
 * @param request 
 * @returns 
 */
export async function POST(request: Request) {
  // Fetch the raw request body
  const rawBody = await request.json();

  // Validate the incoming request headers
  // If the request is invalid, return a 400 error
  if (!requestIntegrityCheck(rawBody, request.headers)) {
    return new Response(null, {
      status: 400,
    });
  }

  // Validate the incoming request body
  const { conversationId, message } = requestSchema.parse({
    conversationId: rawBody['conversation_id'],
    message: rawBody['message']
  });

  // Defer a long running task to Vercel to;
  // 1. calculate the AXIS score
  // 2. Save the score the the conversation in Front
  waitUntil(processConversation(message, conversationId));

  // Return the response
  return new Response(null, {
    status: 202,
  });
}
