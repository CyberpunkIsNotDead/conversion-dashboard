import OpenAI from "openai";
import { MappedMessageData } from "./types";
import { MessageData } from "@/lib/conversation-processing/csv/types";

const INPUT_LENGTH_LIMIT = 10000;

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
  logLevel: process.env.NODE_ENV === "development" ? "debug" : "info",
});

function mapDialog(dialog: MessageData[]) {
  return dialog.map(({ role, message }) => ({
    role,
    message,
  }));
}

function chunkMappedDialogToStrings(dialog: MappedMessageData[]) {
  const chunks: string[] = [];

  let currentChunk: string = "[";

  for (const message of dialog) {
    const messageString = JSON.stringify(message);

    if (currentChunk.length + messageString.length > INPUT_LENGTH_LIMIT) {
      currentChunk += "]";
      chunks.push(currentChunk);
      currentChunk = "[";
    }

    currentChunk += messageString + ",";
  }

  if (currentChunk.length > 0) {
    chunks.push(currentChunk);
  }

  return chunks;
}

function createResponse(chunk: string) {
  return client.responses.create({
    model: "gpt-4o-mini",
    input: chunk,
  });
}

async function processDialog(dialog: MessageData[]) {
  const mappedDialog = mapDialog(dialog);
  const chunks = chunkMappedDialogToStrings(mappedDialog);

  for (const chunk of chunks) {
    const response = await createResponse(chunk);
    console.log(response);
  }
}

export { processDialog };
