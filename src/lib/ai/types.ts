import OpenAI from "openai";
import { MessageData } from "@/shared/types";

type MappedMessageData = Pick<MessageData, "role" | "message">;

type ConversionMark = {
  conversion_mark: "choose_service" | "choose_specialist" | "made_appointment";
  messages: {
    role: "human" | "bot";
    message: string;
  }[];
};

type DialogInfo = {
  dialog_id: string;
  conversion_marks_info: ConversionMark[];
};

type ParsedResponseText = {
  conversion_marks_info: ConversionMark[];
};

type AIResponse = OpenAI.Responses.Response & {
  output: [
    {
      content: [
        {
          type: string;
          text: string;
        },
      ];
    },
  ];
};

export type {
  MappedMessageData,
  ConversionMark,
  DialogInfo,
  ParsedResponseText,
  AIResponse,
};
