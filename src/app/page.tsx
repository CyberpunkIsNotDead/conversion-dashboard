"use client";

import { useState } from "react";
import { processCsv } from "@/app/actions";
import { DialogInfo } from "@/lib/conversation-processing/ai/types";

export default function Home() {
  const [processing, setProcessing] = useState(false);

  const [dialogs, setDialogs] = useState<DialogInfo[]>([]);

  const [chooseServicePercentage, setChooseServicePercentage] = useState(0);
  const [chooseSpecialistPercentage, setChooseSpecialistPercentage] =
    useState(0);
  const [madeAppointmentPercentage, setMadeAppointmentPercentage] = useState(0);

  async function handleClick() {
    try {
      setProcessing(true);
      const result = await processCsv();

      if (!result.success) {
        console.error("CSV processing failed:", result.error);
      }

      if (result.dialogs) {
        setDialogs(result.dialogs);

        setChooseServicePercentage(result.chooseServicePercentage);
        setChooseSpecialistPercentage(result.chooseSpecialistPercentage);
        setMadeAppointmentPercentage(result.madeAppointmentPercentage);
      }
    } catch (error) {
      console.error("Error:", error);
    } finally {
      setProcessing(false);
    }
  }

  return (
    <div className="flex flex-col items-center justify-center">
      <button
        onClick={handleClick}
        disabled={processing}
        className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded"
      >
        {processing ? "Processing..." : "Process CSV"}
      </button>
      <p>Click the button to process the CSV file</p>

      {processing && <p>Processing...</p>}

      {chooseServicePercentage > 0 && (
        <p>Choose service percentage: {chooseServicePercentage}</p>
      )}

      {chooseSpecialistPercentage > 0 && (
        <p>Choose specialist percentage: {chooseSpecialistPercentage}</p>
      )}

      {madeAppointmentPercentage > 0 && (
        <p>Made appointment percentage: {madeAppointmentPercentage}</p>
      )}

      {dialogs.length > 0 && (
        <div>
          <h2>Dialogs:</h2>
          <ul>
            {dialogs.map((dialog, index) => (
              <li key={index}>
                <p>Dialog ID: {dialog.dialog_id}</p>
                <div className="flex flex-col gap-2">
                  {dialog.conversion_marks_info.map((mark, index) => (
                    <div key={index}>
                      <p className="font-bold pl-8">{mark.conversion_mark}</p>
                      {mark.messages.map((message, index) => (
                        <div key={index}>
                          <p className="font-bold pl-16">{message.role}</p>
                          <p className="pl-24">{message.message}</p>
                        </div>
                      ))}
                    </div>
                  ))}
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
