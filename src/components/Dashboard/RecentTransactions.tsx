import React from "react";
import { FiArrowUpRight, FiMoreHorizontal } from "react-icons/fi";
import { useSharedDashboardData } from "../../hooks/useSharedDashboardData";
import { RecentTransactionsSkeleton } from "./SkeletonLoaders";
import { PointsLog } from "../../services/api";

export const RecentTransactions = () => {
  const { recentActivity, isLoading, error } = useSharedDashboardData();

  // Show skeleton loader while loading
  if (isLoading) {
    return <RecentTransactionsSkeleton />;
  }

  const formatDate = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  return (
    <div className="col-span-12 rounded-2xl bg-gradient-to-br from-slate-50 via-white to-slate-100 shadow-xl border border-slate-200/50 backdrop-blur-sm overflow-hidden">
      {/* Modern header with glassmorphism effect */}
      <div className="p-6 bg-gradient-to-r from-white/80 to-slate-50/80 backdrop-blur-sm border-b border-slate-200/50">
        <div className="flex items-center justify-between">
          <h3 className="flex items-center gap-2 font-semibold text-slate-800">
            <div className="p-2 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 shadow-lg">
              <FiArrowUpRight className="text-white text-sm" />
            </div>
            <span className="bg-gradient-to-r from-slate-800 to-slate-600 bg-clip-text text-transparent">
              Recent Activity
            </span>
          </h3>
          <button className="text-sm font-medium text-violet-600 hover:text-violet-700 transition-colors duration-200 px-3 py-1.5 rounded-lg hover:bg-violet-50">
            See all
          </button>
        </div>
      </div>
      
      <div className="p-6">
      
        {recentActivity.length === 0 ? (
          <div className="text-center py-12">
            <div className="p-8 rounded-2xl bg-gradient-to-br from-slate-50 to-white border border-slate-200 shadow-inner inline-block">
              <div className="text-5xl mb-4 opacity-50">📋</div>
              <p className="font-semibold text-slate-700 mb-2">No Recent Activity</p>
              <p className="text-sm text-slate-500">Complete activities to see them appear here</p>
            </div>
          </div>
        ) : (
          <div className="overflow-hidden rounded-xl border border-slate-200/50 bg-white/50 backdrop-blur-sm">
            <table className="w-full table-auto">
              <TableHead />
              <tbody>
                {recentActivity.map((activity, index) => (
                  <TableRow 
                    key={activity.id}
                    activity={activity.activity.name}
                    points={`+${activity.points_earned}`}
                    date={formatDate(activity.timestamp)}
                    order={index + 1}
                  />
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

const TableHead = () => {
  return (
    <thead className="bg-gradient-to-r from-slate-50/80 to-white/80 backdrop-blur-sm">
      <tr className="text-xs font-semibold text-slate-600 uppercase tracking-wider">
        <th className="text-start p-4 border-b border-slate-200/50">Activity</th>
        <th className="text-start p-4 border-b border-slate-200/50">Date</th>
        <th className="text-start p-4 border-b border-slate-200/50">Points</th>
        <th className="w-12 border-b border-slate-200/50"></th>
      </tr>
    </thead>
  );
};

const TableRow = ({
  activity,
  points,
  date,
  order,
}: {
  activity: string;
  date: string;
  points: string;
  order: number;
}) => {
  return (
    <tr className={`text-sm transition-all duration-200 hover:bg-slate-50/50 ${order % 2 ? "bg-slate-50/30" : ""}`}>
      <td className="p-4 border-b border-slate-100/50">
        <a
          href="#"
          className="text-violet-600 hover:text-violet-700 font-medium flex items-center gap-2 transition-colors duration-200"
        >
          <div className="p-1.5 rounded-lg bg-gradient-to-br from-violet-100 to-purple-100 text-violet-600">
            <FiArrowUpRight className="text-xs" />
          </div>
          {activity}
        </a>
      </td>
      <td className="p-4 border-b border-slate-100/50 text-slate-600 font-medium">{date}</td>
      <td className="p-4 border-b border-slate-100/50">
        <span className="font-semibold text-emerald-600 bg-gradient-to-r from-emerald-50 to-green-50 px-2 py-1 rounded-full text-xs border border-emerald-200/50">
          {points}
        </span>
      </td>
      <td className="w-12 p-4 border-b border-slate-100/50">
        <button className="hover:bg-slate-200/50 transition-all duration-200 grid place-content-center rounded-lg text-slate-400 hover:text-slate-600 size-8">
          <FiMoreHorizontal className="text-sm" />
        </button>
      </td>
    </tr>
  );
};
