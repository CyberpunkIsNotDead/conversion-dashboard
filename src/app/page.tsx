"use client";

import { useState } from "react";
import { processCsv } from "@/app/actions";
import type { DialogInfo as DialogInfoType } from "@/lib/ai/types";
import type { ConversionMark } from "@/lib/ai/types";

function ConversionMarkInfo({ mark }: { mark: ConversionMark }) {
  return (
    <div>
      <p className="font-bold pl-8">{mark.conversion_mark}</p>
      {mark.messages.map((message, index) => (
        <div key={index}>
          <p className="font-bold pl-16">{message.role}</p>
          <p className="pl-24">{message.message}</p>
        </div>
      ))}
    </div>
  );
}

function DialogInfo({ dialog }: { dialog: DialogInfoType }) {
  return (
    <li>
      <p>Dialog ID: {dialog.dialog_id}</p>
      <div className="flex flex-col gap-2">
        {dialog.conversion_marks_info.map((mark, index) => (
          <ConversionMarkInfo mark={mark} key={index} />
        ))}
      </div>
    </li>
  );
}

function PercentageInfo({
  label,
  percentage,
}: {
  label: string;
  percentage: number;
}) {
  return (
    <p>
      {label}: {percentage}%
    </p>
  );
}

export default function Home() {
  const [processing, setProcessing] = useState(false);

  const [dialogs, setDialogs] = useState<DialogInfoType[]>([]);

  const [chooseServicePercentage, setChooseServicePercentage] = useState(0);
  const [chooseSpecialistPercentage, setChooseSpecialistPercentage] =
    useState(0);
  const [madeAppointmentPercentage, setMadeAppointmentPercentage] = useState(0);

  const percentages = [
    { percentage: chooseServicePercentage, label: "Choose service" },
    { percentage: chooseSpecialistPercentage, label: "Choose specialist" },
    { percentage: madeAppointmentPercentage, label: "Made appointment" },
  ];

  const [error, setError] = useState<string | null>(null);

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

      setError(error instanceof Error ? error.message : "Unknown error");
    } finally {
      setProcessing(false);
    }
  }

  return (
    <div className="flex flex-col items-center justify-center">
      <p>
        Click the button to process the CSV file. AI would process 10 random
        conversations and return the conversion marks.
      </p>

      <button
        onClick={handleClick}
        disabled={processing}
        className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded"
      >
        {processing ? "Processing..." : "Process CSV"}
      </button>

      {percentages.map((percentage) => (
        <PercentageInfo
          label={percentage.label}
          percentage={percentage.percentage}
          key={percentage.label}
        />
      ))}

      {processing && <p>Processing...</p>}

      {!processing && dialogs.length > 0 && (
        <div>
          <h2>Dialogs:</h2>
          <ul>
            {dialogs.map((dialog, index) => (
              <DialogInfo dialog={dialog} key={index} />
            ))}
          </ul>
        </div>
      )}

      {error && <p className="text-red-500">Error: {error}</p>}
    </div>
  );
}
