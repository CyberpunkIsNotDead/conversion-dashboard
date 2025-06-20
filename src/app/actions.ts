"use server";

import {
  processConversations,
  getConversionPercentage,
} from "@/lib/conversation-processing";

export async function processCsv() {
  try {
    const dialogs = await processConversations();
    const chooseServicePercentage = getConversionPercentage(
      dialogs,
      "choose_service",
    );
    const chooseSpecialistPercentage = getConversionPercentage(
      dialogs,
      "choose_specialist",
    );
    const madeAppointmentPercentage = getConversionPercentage(
      dialogs,
      "made_appointment",
    );

    return {
      success: true,
      dialogs,
      chooseServicePercentage,
      chooseSpecialistPercentage,
      madeAppointmentPercentage,
    };
  } catch (error) {
    console.error("Error processing CSV:", error);
    if (error instanceof Error) {
      return { success: false, error: error.message };
    }
    return { success: false, error: "Unknown error occurred" };
  }
}
