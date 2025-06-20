interface MessageData {
  id: number;
  chatbot_id: number;
  role: "human" | "bot";
  message: string;
  created_at: string;
  meta: string;
  source: "wzp" | "wa" | "iframe";
  conversation_id: string;
}

export type { MessageData };
