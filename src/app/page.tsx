"use client";

import { useState } from "react";
import { processCsv } from "@/app/actions";

export default function Home() {
  const [processing, setProcessing] = useState(false);
  const [done, setDone] = useState(false);

  const [results, setResults] = useState<string[]>([]);

  async function handleClick() {
    try {
      setProcessing(true);
      const result = await processCsv();

      if (!result.success) {
        console.error("CSV processing failed:", result.error);
      }

      if (result.results) {
        setResults(result.results);
      }
    } catch (error) {
      console.error("Error:", error);
    } finally {
      setProcessing(false);
      setDone(true);
    }
  }

  return (
    <div className="flex flex-col items-center justify-center h-screen">
      <button
        onClick={handleClick}
        disabled={processing}
        className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded"
      >
        {processing ? "Processing..." : "Process CSV"}
      </button>
      <p>Click the button to process the CSV file</p>
      {processing && <p>Processing...</p>}
      {done && <p>Done!</p>}
      {results.length > 0 && (
        <div>
          <h2>Results:</h2>
          <ul>
            {results.map((result, index) => (
              <li key={index}>{result}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
