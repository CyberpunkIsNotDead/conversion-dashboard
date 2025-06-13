import { parseCSVFile } from "./csv";
import { MessageData } from "./csv/types";

async function processConversations() {
  const csvFilePath = process.env.CSV_FILE_PATH;
  if (!csvFilePath) {
    throw new Error("CSV_FILE_PATH environment variable is not set");
  }

  const messages = await parseCSVFile(csvFilePath);

  const groupedByConversationId = messages.reduce(
    (acc, message) => {
      if (!acc[message.conversation_id]) {
        acc[message.conversation_id] = [];
      }
      acc[message.conversation_id].push(message);
      return acc;
    },
    {} as Record<string, MessageData[]>,
  );

  console.log(groupedByConversationId);

  // TODO
  // 1. Process messages
  // 2. Save to database
}

export { processConversations };
