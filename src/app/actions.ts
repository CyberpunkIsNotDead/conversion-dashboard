"use server";

import { processConversations } from "@/lib/conversation-processing";

export async function processCsv() {
  try {
    const results = await processConversations();
    return { success: true, results };
  } catch (error) {
    console.error("Error processing CSV:", error);
    if (error instanceof Error) {
      return { success: false, error: error.message };
    }
    return { success: false, error: "Unknown error occurred" };
  }
}
