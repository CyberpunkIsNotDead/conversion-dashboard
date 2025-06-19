import { MessageData } from "@/lib/conversation-processing/csv/types";

type MappedMessageData = Pick<MessageData, "role" | "message">;

export type { MappedMessageData };
