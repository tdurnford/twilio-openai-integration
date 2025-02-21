import { StreamTextTransform, TextStreamPart } from "ai";

export const bufferTransform: StreamTextTransform<any> = () => {
  let buffer = "";
  let threshold = 200;

  return new TransformStream<TextStreamPart<any>, TextStreamPart<any>>({
    transform(chunk, controller) {
      // Assuming the chunk is of type 'text-delta' with a property 'textDelta'
      if (chunk.type === "text-delta") {
        buffer += chunk.textDelta;
        // When the buffer exceeds our desired chunk size, emit it
        if (buffer.length >= threshold) {
          // Adjust the threshold as needed
          controller.enqueue({ ...chunk, textDelta: buffer });
          buffer = "";
          if (threshold < 5000) {
            threshold += 200;
          }
        }
      } else {
        // For non-text-delta chunks, just pass them through
        controller.enqueue(chunk);
      }
    },
    flush(controller) {
      if (buffer.length > 0) {
        controller.enqueue({ type: "text-delta", textDelta: buffer });
      }
    },
  });
};
