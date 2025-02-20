# Front <> AI Experience Impact Score (AXIS) Application Request Handler

## AI Experience Impact Score (AXIS)

The AI Experience Impact Score (AXIS) is a new metric designed specifically for evaluating AI-supported customer interactions.
Developed by [Kenji Hayward](https://www.linkedin.com/in/kenjihayward/) at [Front](https://front.com). 

Read the [AXIS whitepaper](https://front.com/blog/ai-experience-impact-score-axis) to learn more.


## 🌟 What is this application?

This application is a simple serverless API endpoint connected to an LLM that allows you to request an AXIS score for a given customer interaction.

The application is built with modern (2025) technologies and is easily deployable to Vercel. You can get started in a couple of clicks using this link 👇

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2Fdugjason%2Ffront-axis-bot&env=FRONT_API_KEY,FRONT_APP_SECRET,GOOGLE_GENERATIVE_AI_API_KEY&project-name=front-axis-bot&repository-name=front-axis-bot)


## 🔢 How does it work?

This application is a receiver endpoint, designed to securely accept [Application Request](https://help.front.com/en/articles/1237568) events from [Front](https://front.com).

On receiving an event, the application will generate an AXIS score using an LLM (by default, this app uses Google Generative AI (Gemini Flash), but the [AI SDK](https://sdk.vercel.ai/) we use supports most other LLMs with minimal configuration changes - more on that later).

The generated score is then applied to the Front conversation record via Tags and Conversation Custom Fields - again, this is configurable if you'd like to apply the score in a different way.


## 🔐 How is it secured?

Inbound requests have their integrity verified by a cryptographic signature. 
Check out Front's documentation on [Connector Security](https://dev.frontapp.com/docs/security-1) for details. 


## 🚀 Getting Started

### Prerequisites

- An account on [Vercel](https://vercel.com)
- An account on [Front](https://front.com)
- An LLM provider account (this example uses Google Generative AI, but the [AI SDK](https://sdk.vercel.ai/) we use supports switching to other LLMs with minimal configuration)

### Create a Front Application Request

1. Create an [Application Request](https://help.front.com/en/articles/1237568) in Front.
2. Add a Server. You may want to point the server to something like [ngrok](https://ngrok.com/) while testing the application locally, but update it to the correct production URL when you're ready to go live.
3. Add an **Application Request** under the **Connectors** section of your app.
  - **1. Set up basics** - provide a helpful name and description.
  - **2. Create inputs** - this example repo wants a `message` and `conversation_id` field (both string types).
  - **3. Build request** - configure the request to send the provided `message` and `conversation_id` inputs to the application:
    ```json
    {
      "message": "{{message}}",
      "conversation_id": "{{conversation_id}}"
    }
    ```
  - **4. Define outputs** - this can be skipped given that the application will update the conversation with the AXIS score via a separate process (API call).

### Configure your Front Rule
This workflow is best triggered via a Front Rule, when a new Front Chat conversation is created.

Configure a rule triggered on the _"Inbound message is received (new conversation)"_ event.

Add any appropriate rule conditions, such as the conversation being a chat, or arriving in a specific inbox.

Add [Dynamic Variables](https://help.front.com/en/articles/2239) to the rule to extract the `message` and `conversation_id`. 
- `message` - Best accessed via the Message -> Message Body field.
- `conversation_id` - Best accessed via the Conversation -> Conversation ID field.

Finally, add your rule action to run your Application Request, passing in the `message` and `conversation_id` dynamic variables.

## 🔌 Installation and running locally

1. Clone the repository

```bash   
git clone https://github.com/dugjason/front-axis-bot.git
```

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
vercel login [your email] # log in to Vercel via the CLI
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

The application uses the [AI SDK](https://sdk.vercel.ai/) to allow support for multiple LLMs with minimal configuration changes.

To configure a different LLM, you'll need to:

1. Get your LLM provider's API key
2. Edit the `lib/env.ts` file to ensure your required API Key is added to the `env` object - this helps ensure type safety, and guarantees the key is available when accessing the API Key.
3. Update the `lib/llm.ts` file to ensure the LLM is configured correctly. 
You will likely need to import a new provider package (see [AI SDK docs](https://sdk.vercel.ai/providers/ai-sdk-providers)), and update the `generateObject` call to use the new provider, and the correct model name. 

To provide an example, switching to using OpenAI and the `gpt-4o-mini` model is as simple as:

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

// remove the Google provider
// add the OpenAI provider
import { openai } from "@ai-sdk/openai";

// replace the Google provider with the OpenAI provider + model
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
