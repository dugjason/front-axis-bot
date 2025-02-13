# Front <> AI Experience Impact Score (AXIS) Application Request Handler

## AI Experience Impact Score (AXIS)

The AI Experience Impact Score (AXIS) is a new metric designed specifically for evaluating AI-supported customer interactions.
Developed by [Kenji Hayward](https://www.linkedin.com/in/kenjihayward/) at [Front](https://front.com). 

Read the [AXIS whitepaper](https://front.com/blog/ai-experience-impact-score-axis) to learn more.


## 🌟 What is this application?

This application is a simple serverless API endpoint connected to an LLM that allows you to request an AXIS score for a given customer interaction.

The application is built with modern (2025) technologies and is easily deployable to Vercel.


## 🔢 How does it work?

This application is a receiver endpoint, designed to accept [Application Request](https://help.front.com/en/articles/1237568) events from [Front](https://front.com).

On receiving an event, the application will generate an AXIS score using an LLM (this currently uses Google Generative AI, but the [AI SDK](https://sdk.vercel.ai/) we use supports other LLMs with minimal configuration).

The generated score is then applied to the Front conversation record via Tags and Conversation Custom Fields.


## 🔐 How is it secured?

The application uses a combination of Vercel secrets and environment variables to store and use sensitive information.

Inbound requests have their integrity verified by a cryptographic signature.


## 🚀 Getting Started

### Prerequisites

- An account on [Vercel](https://vercel.com)
- An account on [Front](https://front.com)
- An LLM provider account (this example uses Google Generative AI, but the [AI SDK](https://sdk.vercel.ai/) we use supports other LLMs with minimal configuration)



### Installation

1. Clone the repository

2. Install dependencies:

```bash
npm install
```

3. Ensure you have the following environment variable values available;

- `FRONT_API_KEY` - Generate a Front API key from the [API Keys](https://app.frontapp.com/settings/developers/tokens/) page. (See [docs here](https://help.front.com/en/articles/2331))
- `FRONT_APP_SECRET` - [Create an Application](https://help.front.com/en/articles/1237568) in Front. The App Secret is found on the **Overview** page for your app. 
- `GOOGLE_GENERATIVE_AI_API_KEY` - Generate an API key from the [Google AI Studio app](https://aistudio.google.com/). (See the [LLM Configuration](#-llm-configuration) section below for more information on how to configure other LLMs)

4. Push to Vercel. Get started by running:

```bash
vercel login [your email] # login to Vercel
vercel deploy # deploy the application to a preview branch

# Add the three required environment variables. If you're using another LLM provider, see the "LLM Configuration" section below.
vercel env add FRONT_API_KEY
vercel env add FRONT_APP_SECRET
vercel env add GOOGLE_GENERATIVE_AI_API_KEY
```

4. Create a `.env` file based on the `.env.example` file.

5. Start the application:

```bash
npm run dev
```

## 🤖 LLM Configuration

The application uses the [AI SDK](https://sdk.vercel.ai/) to support multiple LLMs with minimal configuration.

To configure a different LLM, you'll need to:

1. Get your LLM provider's API key
2. Edit the `lib/env.ts` file to ensure your required API Key is added to the `env` object - this helps ensure type safety when using the API Key.
3. Update the `lib/llm.ts` file to ensure the LLM is configured correctly. You will likely need to import a new provider package (see [AI SDK docs](https://sdk.vercel.ai/providers/ai-sdk-providers)), and update the `generateObject` call to use the new provider, and the correct model name. 

TO provide an example, switching to using OpenAI gpt-4o-mini is as simple as:

```bash
npm install @ai-sdk/openai
```

```ts
/** ./lib/env.ts */

// add the openai api key to the env object
export const env = {
  ...
  OPENAI_API_KEY: z.string().min(1),
}
```

```ts
/** ./lib/llm.ts */

// remove the google provider
import { openai } from "@ai-sdk/openai";

// replace the google provider with the openai provider+model
const response = await generateObject({
  model: openai("gpt-4o-mini"),
  ...
})
```

## 🤝 Contributing

Please do so! We'd love to see your contributions.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request
