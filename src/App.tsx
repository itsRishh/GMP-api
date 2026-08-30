import { useEffect, useState } from "react";

import Stats from "./components/Stats";
import IPOTable from "./components/IPOTable";

import type {
  IPO,
  IPOApiResponse,
} from "./types/ipo";

export default function App() {
  const [ipos, setIpos] = useState<IPO[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(
    null
  );

  async function fetchIPOData() {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch("/api/ipos");

      if (!response.ok) {
        throw new Error(
          "Failed to fetch IPO data"
        );
      }

      const result: IPOApiResponse =
        await response.json();

      if (!result.success) {
        throw new Error(
          "Failed to load IPO data"
        );
      }

      setIpos(result.data);
    } catch (error) {
      console.error(error);

      setError(
        "Unable to load IPO data."
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchIPOData();
  }, []);

  return (
    <div className="min-h-screen bg-[#f6f7f9]">

      <header className="border-b border-gray-200 bg-white">
        <div className="mx-auto flex min-h-[82px] max-w-7xl items-center justify-between px-5 md:px-6">

          <div>
            <h1 className="text-xl font-bold tracking-tight text-gray-900 md:text-2xl">
              IPO GMP Watch
            </h1>

            <p className="mt-1 text-xs text-gray-500 md:text-sm">
              Grey market premium and IPO listing estimates
            </p>
          </div>

          <div className="flex items-center gap-2 text-xs font-medium text-gray-500">

            <span className="relative flex h-2.5 w-2.5">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-green-400 opacity-50" />
              <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-green-500" />
            </span>

            Live Data

          </div>

        </div>
      </header>


      <main className="mx-auto max-w-7xl px-5 py-6 md:px-6 md:py-8">

        {loading && (
          <div className="flex min-h-[400px] items-center justify-center">
            <p className="text-sm text-gray-500">
              Loading IPO data...
            </p>
          </div>
        )}


        {!loading && error && (
          <div className="rounded-xl border border-red-200 bg-red-50 p-6 text-center">

            <p className="text-sm font-medium text-red-700">
              {error}
            </p>

            <button
              onClick={fetchIPOData}
              className="mt-4 rounded-lg bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-gray-800"
            >
              Try Again
            </button>

          </div>
        )}


        {!loading && !error && (
          <div className="space-y-5">

            <Stats ipos={ipos} />

            <IPOTable ipos={ipos} />

            <p className="px-1 text-xs text-gray-400">
              GMP data is indicative and may change
              before listing.
            </p>

          </div>
        )}

      </main>

    </div>
  );
}