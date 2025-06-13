"use client";

import { useState } from "react";
import { processCsv } from "@/app/actions";

export default function Home() {
  const [processing, setProcessing] = useState(false);
  const [done, setDone] = useState(false);

  async function handleClick() {
    try {
      setProcessing(true);
      const result = await processCsv();
      if (!result.success) {
        console.error("CSV processing failed:", result.error);
      }
    } catch (error) {
      console.error("Error:", error);
    } finally {
      setProcessing(false);
      setDone(true);
    }
  }

  return (
    <div>
      <button onClick={handleClick} disabled={processing}>
        {processing ? "Processing..." : "Process CSV"}
      </button>
      <p>Click the button to process the CSV file</p>
      {processing && <p>Processing...</p>}
      {done && <p>Done!</p>}
    </div>
  );
}
