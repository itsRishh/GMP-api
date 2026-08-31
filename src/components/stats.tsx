import type { IPO } from "../types/ipo";

interface StatsProps {
  data: IPO[];
}

export default function Stats({ data }: StatsProps) {
  const ipos = Array.isArray(data) ? data : [];

  const openIPOs = ipos.filter(
    (ipo) => ipo.status === "Open"
  ).length;

  const upcomingIPOs = ipos.filter(
    (ipo) => ipo.status === "Upcoming"
  ).length;

  const highestGMP = ipos.reduce((highest, ipo) => {
    const value = Number(
      ipo.gmp?.replace(/[₹,\s]/g, "")
    );

    if (Number.isNaN(value)) {
      return highest;
    }

    return Math.max(highest, value);
  }, 0);

  const stats = [
    {
      label: "Total IPOs",
      value: ipos.length,
    },
    {
      label: "Open IPOs",
      value: openIPOs,
    },
    {
      label: "Upcoming",
      value: upcomingIPOs,
    },
    {
      label: "Highest GMP",
      value: `₹${highestGMP}`,
    },
  ];

  return (
    <div className="grid grid-cols-2 gap-3 md:grid-cols-4 md:gap-4">
      {stats.map((stat) => (
        <div
          key={stat.label}
          className="rounded-xl border border-gray-200 bg-white p-5"
        >
          <p className="text-sm text-gray-500">
            {stat.label}
          </p>

          <p className="mt-2 text-2xl font-bold tracking-tight text-gray-900">
            {stat.value}
          </p>
        </div>
      ))}
    </div>
  );
}