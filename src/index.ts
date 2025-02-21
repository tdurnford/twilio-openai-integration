import express from "express";
import ExpressWs from "express-ws";
import VoiceResponse from "twilio/lib/twiml/VoiceResponse";
import { CoreMessage, streamText } from "ai";
import { openai } from "@ai-sdk/openai";
import { v4 as uuid } from "uuid";
import { type WebSocket } from "ws";
import "dotenv/config";

import { ConversationManager } from "./managers/ConversationManager";
import { EventMessage } from "./types/twilio";
import { bufferTransform } from "./utils/bufferTransform";

const app = ExpressWs(express()).app;
const PORT = parseInt(process.env.PORT || "5000");

const welcomeGreeting = "Hi there! How can I help you today?";
const systemInstructions =
  "You are a virtual voice assistant. You can help the user with their questions and provide information.";

app.use(express.urlencoded({ extended: false }));

app.post("/call/incoming", async (_, res) => {
  const response = new VoiceResponse();

  response.connect().conversationRelay({
    url: `wss://${process.env.SERVER_DOMAIN}/call/connection`,
    welcomeGreeting,
  });

  res.writeHead(200, { "Content-Type": "text/xml" });
  res.end(response.toString());
});

app.ws("/call/connection", (ws: WebSocket) => {
  const sessionId = uuid();

  ws.on("message", async (data: string) => {
    const event: EventMessage = JSON.parse(data);
    const conversation = new ConversationManager(sessionId);

    if (event.type === "setup") {
      // Add welcome message to conversation transcript
      const welcomeMessage: CoreMessage = {
        role: "assistant",
        content: welcomeGreeting,
      };

      await conversation.addMessage(welcomeMessage);
    } else if (event.type === "prompt") {
      // Add user message to conversation and retrieve all messages
      const message: CoreMessage = { role: "user", content: event.voicePrompt };
      await conversation.addMessage(message);
      const messages = await conversation.getMessages();

      const controller = new AbortController();

      // Stream text from OpenAI model
      const { textStream, text: completeText } = await streamText({
        abortSignal: controller.signal,
        experimental_transform: bufferTransform,
        model: openai("gpt-4o-mini"),
        messages,
        maxSteps: 10,
        system: systemInstructions,
      });

      // Iterate over text stream and send messages to Twilio
      for await (const text of textStream) {
        if (controller.signal.aborted) {
          break;
        }

        ws.send(
          JSON.stringify({
            type: "text",
            token: text,
            last: false,
          })
        );
      }

      // Send last message to Twilio
      if (!controller.signal.aborted) {
        ws.send(
          JSON.stringify({
            type: "text",
            token: "",
            last: true,
          })
        );
      }

      // Add complete text to conversation transcript
      const agentMessage: CoreMessage = {
        role: "assistant",
        content: await completeText,
      };

      void conversation.addMessage(agentMessage);
    } else if (event.type === "end") {
      // Clear conversation transcript when call ends
      void conversation.clearMessages();
    }
  });

  ws.on("error", console.error);
});

app.listen(PORT, () => {
  console.log(`Local: http://localhost:${PORT}`);
  console.log(`Remote: https://${process.env.SERVER_DOMAIN}`);
});
