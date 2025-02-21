# Twilio-OpenAI Integration

This repository contains the code for integrating OpenAI's language models with Twilio's Conversation Relay using the Vercel AI SDK. This integration enables the creation of a virtual voice assistant capable of handling user queries and providing information via phone calls.

## Features

- **Real-time Communication**: Utilizes WebSocket connections for real-time interaction with Twilio's Conversation Relay.
- **OpenAI Integration**: Leverages OpenAI's language models to process and respond to user queries.
- **Efficient Data Handling**: Implements a `bufferTransform` function to send larger data chunks to Twilio, improving efficiency.
- **State Management**: Uses Redis to manage conversation state across sessions.

## Prerequisites

- Node.js and npm installed on your machine.
- A Twilio account.
- An OpenAI API key.
- A Redis instance for managing conversation state.

## Installation

1. Clone the repository:

   ```bash
   git clone https://github.com/tdurnford/twilio-openai-integration.git
   cd twilio-openai-integration
   ```

2. Install the necessary dependencies:

   ```bash
   npm install
   ```

3. Create a `.env` file in the root of your project and add your environment variables:

   ```plaintext
   OPENAI_API_KEY=your-openai-api-key
   PORT=5000
   REDIS_URL=redis://localhost:6379
   SERVER_DOMAIN=http://localhost:5000
   TAVILY_API_KEY=your-twilio-api-key
   ```

## Project Structure

```
twilio-openai-integration/
│
├── managers/
│   └── ConversationManager.ts
│
├── types/
│   └── twilio.ts
│
├── utils/
│   └── bufferTransform.ts
│
├── .env
└── index.ts
```

## Usage

1. Ensure your Redis instance is running and accessible.

2. Build and start the server:

   ```bash
   npm run build
   node dist/index.ts
   ```

3. Your server should now be running, ready to handle incoming calls and relay conversations through Twilio.

## Explanation

- **Express and WebSocket Setup**: Uses `express-ws` to handle WebSocket connections for real-time communication.
- **Twilio VoiceResponse**: Sets up a Twilio call and connects it to the WebSocket endpoint.
- **WebSocket Handling**: Manages different event types (`setup`, `prompt`, `end`) to interact with the OpenAI model.
- **OpenAI Integration**: Streams text from OpenAI's model, using `bufferTransform` to send larger chunks.

## Implementing `bufferTransform`

The `bufferTransform` function accumulates text tokens into a buffer and sends them as a single chunk once a certain size is reached, optimizing WebSocket message efficiency.

## Conclusion

By following these steps, you've set up a system that integrates OpenAI's language models with Twilio's Conversation Relay, using the Vercel AI SDK. This setup allows for efficient communication by buffering text tokens and sending them in larger chunks, enhancing the performance of your virtual voice assistant.

## License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## Contact

For any questions or issues, please open an issue on GitHub or contact the repository owner.
