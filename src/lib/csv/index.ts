import { Readable } from "stream";
import { parse } from "fast-csv";
import fs from "fs";

import { MessageData } from "@/shared/types";

/**
 * Parse a large CSV file into MessageData objects
 * @param csvStream - Readable stream containing CSV data
 * @param options - Optional configuration for parsing
 * @returns A stream of MessageData objects
 */
function parseMessages(
  csvStream: Readable,
  options: { columns?: string[] } = {},
): Promise<Readable> {
  return new Promise<Readable>((resolve, reject) => {
    const parser = parse({
      headers: true,
      ignoreEmpty: true,
      ...options,
    });

    const output = new Readable({
      read() {
        // This is a passthrough stream
      },
    });

    parser.on("error", reject);
    parser.on("data", (row: Record<string, string>) => {
      try {
        const messageData: MessageData = {
          id: parseInt(row.id),
          chatbot_id: parseInt(row.chatbot_id),
          role: row.role as MessageData["role"],
          message: row.message,
          created_at: row.created_at,
          meta: row.meta,
          source: row.source as MessageData["source"],
          conversation_id: row.conversation_id,
        };

        output.push(JSON.stringify(messageData));
      } catch (error) {
        console.error("Error parsing row:", error);
      }
    });

    parser.on("end", () => {
      output.push(null);
      resolve(output);
    });

    csvStream.pipe(parser);
  });
}

/**
 * Create a readable stream from a file path
 * @param filePath - Path to the CSV file
 * @returns A readable stream for the file
 */
function createFileStream(filePath: string): Promise<Readable> {
  return new Promise((resolve, reject) => {
    const stream = fs.createReadStream(filePath, { encoding: "utf8" });
    stream.on("error", reject);
    stream.on("open", () => resolve(stream));
  });
}

/**
 * Parse a CSV file and return an array of MessageData objects
 * @param filePath - Path to the CSV file
 * @returns Promise that resolves with an array of MessageData objects
 */
async function parseCSVFile(filePath: string): Promise<MessageData[]> {
  const fileStream = await createFileStream(filePath);
  const messagesStream = await parseMessages(fileStream);

  return new Promise((resolve, reject) => {
    const messages: MessageData[] = [];
    messagesStream.on("data", (data: string) => {
      try {
        const message = JSON.parse(data) as MessageData;
        messages.push(message);
      } catch (error) {
        console.error("Error parsing message:", error);
      }
    });
    messagesStream.on("end", () => resolve(messages));
    messagesStream.on("error", reject);
  });
}

export { parseCSVFile };
