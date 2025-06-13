import { parseCSVFile } from "./csv";
import { MessageData } from "./csv/types";

function groupMessagesByConversationId(messages: MessageData[]) {
  const grouped: Record<string, MessageData[]> = {};

  messages.forEach((message) => {
    if (!grouped[message.conversation_id]) {
      grouped[message.conversation_id] = [];
    }

    grouped[message.conversation_id].push(message);
  });

  return grouped;
}

async function processConversations() {
  const csvFilePath = process.env.CSV_FILE_PATH;

  if (!csvFilePath) {
    throw new Error("CSV_FILE_PATH environment variable is not set");
  }

  const messages = await parseCSVFile(csvFilePath);

  const groupedByConversationId = groupMessagesByConversationId(messages);

  console.log(
    "First conversation:",
    groupedByConversationId[Object.keys(groupedByConversationId)[0]],
  );
  console.log("Total messages:", messages.length);
  console.log(
    "Total conversations:",
    Object.keys(groupedByConversationId).length,
  );

  // TODO
  // 1. Process messages
  // 2. Save to database
}

export { processConversations };
