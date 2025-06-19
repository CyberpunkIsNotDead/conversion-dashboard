import { parseCSVFile } from "./csv";
import { MessageData } from "./csv/types";
import { ConversionMark, processDialog } from "./ai";

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

  const TenRandomConversations = Object.keys(groupedByConversationId)
    .sort(() => 0.5 - Math.random())
    .slice(0, 10);

  const mappedResponses: string[] = [];

  for (const conversationId of TenRandomConversations) {
    const messages = groupedByConversationId[conversationId];

    const responses = await processDialog(messages);

    mappedResponses.push(
      ...responses.map((response) => JSON.stringify(response)),
    );
  }

  return mappedResponses;
}

export { processConversations };
