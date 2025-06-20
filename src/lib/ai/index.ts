import OpenAI from "openai";
import {
  AIResponse,
  DialogInfo,
  MappedMessageData,
  ParsedResponseText,
} from "./types";
import { MessageData } from "@/lib/csv/types";
import { INSTRUCTION_PROMPT } from "./prompts";
import { z } from "zod";
import { zodTextFormat } from "openai/helpers/zod.mjs";

const INPUT_LENGTH_LIMIT = 10000;

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
  logLevel: process.env.NODE_ENV === "development" ? "debug" : "warn",
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

const ConversionMarksInfo = z.object({
  conversion_marks_info: z.array(
    z.object({
      conversion_mark: z.enum([
        "choose_service",
        "choose_specialist",
        "made_appointment",
      ]),
      messages: z.array(
        z.object({
          role: z.enum(["human", "bot"]),
          message: z.string(),
        }),
      ),
    }),
  ),
});

function createResponse(chunk: string) {
  return client.responses.create({
    model: "gpt-4o-mini",
    input: chunk,
    instructions: INSTRUCTION_PROMPT,
    text: {
      format: zodTextFormat(ConversionMarksInfo, "conversion_marks_info"),
    },
  });
}

async function processDialog(conversationId: string, dialog: MessageData[]) {
  const mappedDialog = mapDialog(dialog);
  const chunks = chunkMappedDialogToStrings(mappedDialog);

  const dialogInfo: DialogInfo = {
    dialog_id: conversationId,
    conversion_marks_info: [],
  };

  for (const chunk of chunks) {
    const response = (await createResponse(chunk)) as AIResponse;

    if (response.status === "incomplete") {
      console.error(
        `Incomplete: ${response.incomplete_details?.reason || "Unknown reason"}`,
      );
    }

    const responseContent = response.output[0].content[0];

    if (responseContent.type === "refusal") {
      console.error(`Refusal: ${response}`);
    } else if (responseContent.type === "output_text") {
      const marks = ConversionMarksInfo.parse(
        JSON.parse(responseContent.text) as ParsedResponseText,
      );

      dialogInfo.conversion_marks_info.push(...marks.conversion_marks_info);
    }
  }

  return dialogInfo;
}

export { processDialog };
