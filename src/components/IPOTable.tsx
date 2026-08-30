import type { IPO } from "../types/ipo";

interface IPOTableProps {
  ipos: IPO[];
}

function getStatusStyles(status: string) {
  switch (status) {
    case "Open":
      return "bg-green-50 text-green-700";

    case "Upcoming":
      return "bg-blue-50 text-blue-700";

    case "Closed":
      return "bg-gray-100 text-gray-500";

    default:
      return "bg-gray-100 text-gray-600";
  }
}

function getTrendColor(trend: string) {
  if (trend.includes("🟢")) {
    return "text-green-600";
  }

  if (trend.includes("🔴")) {
    return "text-red-600";
  }

  if (trend.includes("🟡")) {
    return "text-yellow-600";
  }

  return "text-gray-500";
}

export default function IPOTable({
  ipos,
}: IPOTableProps) {
  return (
    <div className="overflow-hidden rounded-xl border border-gray-200 bg-white">

      <div className="flex items-center justify-between border-b border-gray-200 px-5 py-4">

        <div>
          <h2 className="font-semibold text-gray-900">
            IPO GMP
          </h2>

          <p className="mt-1 text-xs text-gray-500">
            Latest grey market premium data
          </p>
        </div>

        <span className="text-xs text-gray-400">
          {ipos.length} IPOs
        </span>

      </div>

      <div className="overflow-x-auto">

        <table className="w-full min-w-[1050px] text-left">

          <thead className="bg-gray-50">
            <tr className="border-b border-gray-200">

              <th className="px-5 py-3 text-[11px] font-semibold uppercase tracking-wider text-gray-500">
                IPO
              </th>

              <th className="px-5 py-3 text-[11px] font-semibold uppercase tracking-wider text-gray-500">
                GMP
              </th>

              <th className="px-5 py-3 text-center text-[11px] font-semibold uppercase tracking-wider text-gray-500">
                Trend
              </th>

              <th className="px-5 py-3 text-[11px] font-semibold uppercase tracking-wider text-gray-500">
                Price Band
              </th>

              <th className="px-5 py-3 text-[11px] font-semibold uppercase tracking-wider text-gray-500">
                Est. Listing
              </th>

              <th className="px-5 py-3 text-[11px] font-semibold uppercase tracking-wider text-gray-500">
                Gain
              </th>

              <th className="px-5 py-3 text-[11px] font-semibold uppercase tracking-wider text-gray-500">
                IPO Date
              </th>

              <th className="px-5 py-3 text-[11px] font-semibold uppercase tracking-wider text-gray-500">
                Status
              </th>

              <th className="px-5 py-3 text-[11px] font-semibold uppercase tracking-wider text-gray-500">
                Updated
              </th>

            </tr>
          </thead>

          <tbody className="divide-y divide-gray-100">

            {ipos.map((ipo) => (
              <tr
                key={ipo.id}
                className="transition-colors hover:bg-gray-50"
              >

                <td className="px-5 py-4">
                  <a
                    href={ipo.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-semibold text-gray-900 hover:underline"
                  >
                    {ipo.name}
                  </a>
                </td>

                <td className="px-5 py-4">
                  <span className="text-base font-bold text-gray-900">
                    {ipo.gmp}
                  </span>
                </td>

                <td className="px-5 py-4 text-center">
                  <span
                    className={`text-base ${getTrendColor(
                      ipo.trend
                    )}`}
                  >
                    {ipo.trend}
                  </span>
                </td>

                <td className="px-5 py-4 text-sm text-gray-600">
                  {ipo.priceBand}
                </td>

                <td className="px-5 py-4">
                  <span className="font-semibold text-gray-900">
                    {ipo.estimatedListing}
                  </span>
                </td>

                <td className="px-5 py-4">
                  <span
                    className={
                      ipo.listingGain === "0.00%"
                        ? "font-semibold text-gray-500"
                        : "font-semibold text-green-600"
                    }
                  >
                    {ipo.listingGain === "0.00%"
                      ? ipo.listingGain
                      : `+${ipo.listingGain}`}
                  </span>
                </td>

                <td className="px-5 py-4 text-sm text-gray-600">
                  {ipo.ipoDate}
                </td>

                <td className="px-5 py-4">
                  <span
                    className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${getStatusStyles(
                      ipo.status
                    )}`}
                  >
                    {ipo.status}
                  </span>
                </td>

                <td className="whitespace-nowrap px-5 py-4 text-xs text-gray-500">
                  {ipo.lastUpdated}
                </td>

              </tr>
            ))}

          </tbody>

        </table>

      </div>
    </div>
  );
}