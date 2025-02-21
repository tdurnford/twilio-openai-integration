import { CoreMessage } from "ai";
import { createClient } from "redis";

// Create and connect Redis client
async function createRedisClient() {
  const client = createClient({
    url: process.env.REDIS_URL,
  });
  await client.connect();
  return client;
}

let redisClient: ReturnType<typeof createClient>;

async function getRedisClient() {
  redisClient ??= await createRedisClient();
  return redisClient;
}

export class ConversationManager {
  private sessionId: string;

  constructor(sessionId: string) {
    this.sessionId = sessionId;
  }

  public async addMessage(message: CoreMessage) {
    const client = await getRedisClient();
    await client.rPush(
      `session:${this.sessionId}:messages`,
      JSON.stringify(message)
    );
  }

  public async clearMessages() {
    const client = await getRedisClient();
    await client.del(`session:${this.sessionId}:messages`);
  }

  public async getMessages(): Promise<CoreMessage[]> {
    const client = await getRedisClient();

    const messages = await client.lRange(
      `session:${this.sessionId}:messages`,
      0,
      -1
    );

    return messages.map((message) => JSON.parse(message));
  }

  public async clear() {
    const client = await getRedisClient();
    await client.del(`session:${this.sessionId}:messages`);
  }
}
