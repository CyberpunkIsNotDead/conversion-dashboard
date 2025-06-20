import { MessageData } from "@/shared/types";
import { DialogInfo } from "@/lib/ai/types";
import { parseCSVFile } from "@/lib/csv";
import { processDialog } from "@/lib/ai";

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

  const dialogs: DialogInfo[] = [];

  for (const conversationId of TenRandomConversations) {
    const messages = groupedByConversationId[conversationId];

    const dialogInfo = await processDialog(conversationId, messages);

    dialogs.push(dialogInfo);
  }

  return dialogs;
}

function getConversionPercentage(
  dialogs: DialogInfo[],
  mark: "choose_service" | "choose_specialist" | "made_appointment",
) {
  const totalConversations = dialogs.length;
  const totalConversionMarks = dialogs.reduce((acc, dialog) => {
    if (dialog.conversion_marks_info.some((m) => m.conversion_mark === mark)) {
      return acc + 1;
    }

    return acc;
  }, 0);

  return (totalConversionMarks / totalConversations) * 100;
}

export { processConversations, getConversionPercentage };
