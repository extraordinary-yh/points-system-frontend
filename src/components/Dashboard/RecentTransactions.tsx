import React from "react";
import { FiArrowUpRight, FiMoreHorizontal } from "react-icons/fi";

export const RecentTransactions = () => {
  return (
    <div className="col-span-12 p-4 rounded border border-stone-300">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="flex items-center gap-1.5 font-medium">
          Recent Activity
        </h3>
        <button className="text-sm text-violet-500 hover:underline">
          See all
        </button>
      </div>
      <table className="w-full table-auto">
        <TableHead />
        <tbody>
          <TableRow activity="Discord Engagement" Points="+10" date="Aug 2nd" order={1} />
          <TableRow activity="Resume Upload" Points="+40" date="Aug 2nd" order={2} />
          <TableRow activity="LinkedIn interaction" Points="+10" date="Aug 1st" order={3} />
          <TableRow activity="Resume Upload" Points="+40" date="Aug 1st" order={4} />
          <TableRow activity="Resource share" Points="+20" date="Aug 1st" order={5} />
          <TableRow activity="Resume upload" Points="+40" date="Jul 31st" order={6} />
        </tbody>
      </table>
    </div>
  );
};

const TableHead = () => {
  return (
    <thead>
      <tr className="text-sm font-normal text-stone-500">
        <th className="text-start p-1.5">Activity</th>
        <th className="text-start p-1.5">Date</th>
        <th className="text-start p-1.5">Points</th>
        <th className="w-8"></th>
      </tr>
    </thead>
  );
};

const TableRow = ({
  activity,
  Points,
  date,
  order,
}: {
  activity: string;
  date: string;
  Points: string;
  order: number;
}) => {
  return (
    <tr className={order % 2 ? "bg-stone-100 text-sm" : "text-sm"}>
      <td className="p-1.5">
        <a
          href="#"
          className="text-violet-600 underline flex items-center gap-1"
        >
          {activity} <FiArrowUpRight />
        </a>
      </td>
      <td className="p-1.5">{date}</td>
      <td className="p-1.5">{Points}</td>
      <td className="w-8">
        <button className="hover:bg-stone-200 transition-colors grid place-content-center rounded text-sm size-8">
          <FiMoreHorizontal />
        </button>
      </td>
    </tr>
  );
};
