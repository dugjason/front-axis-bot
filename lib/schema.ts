import { z } from "zod"

/** Define the expected schema for incoming requests */
export const requestSchema = z.object({
  conversationId: z.string().startsWith("cnv_"),
  message: z.string().min(1),
})
