import { z } from "zod"

/**
 * Define the expected environment variables
 *
 * @throws {Error} If any of the environment variables are missing
 */
export const env = z
  .object({
    FRONT_API_KEY: z.string(),
    FRONT_APP_SECRET: z.string(),
    GOOGLE_GENERATIVE_AI_API_KEY: z.string(),
  })
  .parse(process.env)
