import type { IPO } from "../types/ipo";

interface IPOTableProps {
  data: IPO[];
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

interface TableSectionProps {
  title: string;
  description: string;
  ipos: IPO[];
}

function TableSection({
  title,
  description,
  ipos,
}: TableSectionProps) {
  return (
    <section className="mb-10">
      {/* Section Header */}
      <div className="mb-4 flex items-end justify-between">
        <div>
          <h2 className="text-xl font-bold text-gray-900">
            {title}
          </h2>

          <p className="mt-1 text-sm text-gray-500">
            {description}
          </p>
        </div>

        <span className="text-xs text-gray-400">
          {ipos.length} IPOs
        </span>
      </div>

      {/* Table */}
      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[1050px] text-left">
            <thead className="bg-gray-50">
              <tr className="border-b border-gray-200">

                <th className="px-3 py-3 text-[11px] font-semibold uppercase tracking-wider text-gray-500">
                  IPO
                </th>

                <th className="px-3 py-3 text-[11px] font-semibold uppercase tracking-wider text-gray-500">
                  GMP
                </th>

                <th className="px-3 py-3 text-center text-[11px] font-semibold uppercase tracking-wider text-gray-500">
                  Trend
                </th>

                <th className="px-3 py-3 text-[11px] font-semibold uppercase tracking-wider text-gray-500">
                  Rating
                </th>

                <th className="px-3 py-3 text-[11px] font-semibold uppercase tracking-wider text-gray-500">
                  Sub
                </th>

                <th className="px-3 py-3 text-[11px] font-semibold uppercase tracking-wider text-gray-500">
                  Price (₹)
                </th>

                <th className="px-3 py-3 text-[11px] font-semibold uppercase tracking-wider text-gray-500">
                  IPO Size
                </th>

                <th className="px-3 py-3 text-[11px] font-semibold uppercase tracking-wider text-gray-500">
                  Lot
                </th>

                <th className="px-3 py-3 text-[11px] font-semibold uppercase tracking-wider text-gray-500">
                  Open
                </th>

                <th className="px-3 py-3 text-[11px] font-semibold uppercase tracking-wider text-gray-500">
                  Close
                </th>

                <th className="px-3 py-3 text-[11px] font-semibold uppercase tracking-wider text-gray-500">
                  BOA DT
                </th>

                <th className="px-3 py-3 text-[11px] font-semibold uppercase tracking-wider text-gray-500">
                  Listing
                </th>

                <th className="px-3 py-3 text-[11px] font-semibold uppercase tracking-wider text-gray-500">
                  Updated On
                </th>

                <th className="px-3 py-3 text-[11px] font-semibold uppercase tracking-wider text-gray-500">
                  Anchor
                </th>

              </tr>
            </thead>

            <tbody className="divide-y divide-gray-100">
              {ipos.map((ipo) => (
                <tr
                  key={ipo.id}
                  className="transition-colors hover:bg-gray-50"
                >

                  {/* IPO Name */}
                  <td className="px-3 py-4">
                    <a
                      href={ipo.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="font-semibold text-gray-900 hover:text-blue-600 hover:underline"
                    >
                      {ipo.name}
                    </a>
                  </td>

                  {/* GMP */}
                  <td className="px-3 py-4">
                    <span className="text-base font-bold text-gray-900">
                      {ipo.gmp}
                    </span>
                  </td>

                  {/* Trend */}
                  <td className="px-3 py-4 text-center">
                    <span
                      className={`text-base ${getTrendColor(
                        ipo.trend
                      )}`}
                    >
                      {ipo.trend}
                    </span>
                  </td>

                  {/* Rating */}
                  <td className="px-3 py-4 text-sm text-gray-700">
                    {ipo.rating || "-"}
                  </td>

                  {/* Sub */}
                  <td className="px-3 py-4 text-sm text-gray-700">
                    {ipo.sub || "-"}
                  </td>

                  {/* Price */}
                  <td className="px-3 py-4 text-sm text-gray-700">
                    {ipo.price || "-"}
                  </td>

                  {/* IPO Size */}
                  <td className="px-3 py-4 text-sm text-gray-700">
                    {ipo.ipoSize || "-"}
                  </td>

                  {/* Lot */}
                  <td className="px-3 py-4 text-sm text-gray-700">
                    {ipo.lot || "-"}
                  </td>

                  {/* Open */}
                  <td className="px-3 py-4 text-sm text-gray-700">
                    {ipo.open || "-"}
                  </td>

                  {/* Close */}
                  <td className="px-3 py-4 text-sm text-gray-700">
                    {ipo.close || "-"}
                  </td>

                  {/* BOA DT */}
                  <td className="px-3 py-4 text-sm text-gray-700">
                    {ipo.boaDate || "-"}
                  </td>

                  {/* Listing */}
                  <td className="px-3 py-4 text-sm text-gray-700">
                    {ipo.listing || "-"}
                  </td>

                  {/* Updated On */}
                  <td className="whitespace-nowrap px-3 py-4 text-xs text-gray-500">
                    {ipo.updatedOn || ipo.lastUpdated || "-"}
                  </td>

                  {/* Anchor */}
                  <td className="px-3 py-4 text-sm text-gray-700">
                    {ipo.anchor || "-"}
                  </td>

                </tr>
              ))}

              {ipos.length === 0 && (
                <tr>
                  <td
                    colSpan={14}
                    className="px-5 py-10 text-center text-sm text-gray-500"
                  >
                    No IPO data available.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}

export default function IPOTable({
  data,
}: IPOTableProps) {
  return (
    <div>
      <TableSection
        title="All IPO GMP"
        description="Latest grey market premium data from the live table"
        ipos={data}
      />
    </div>
  );
}