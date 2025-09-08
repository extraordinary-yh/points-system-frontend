import React from "react";
import { FiArrowUpRight, FiArrowDownRight } from "react-icons/fi";
import { useSharedDashboardData } from "../../hooks/useSharedDashboardData";
import { RecentTransactionsSkeleton } from "./SkeletonLoaders";
import { ActivityFeedItem } from "../../services/api";

export const RecentTransactions = () => {
  const { recentActivity, isLoading, error } = useSharedDashboardData();

  // Debug removed - using central debugging in useSharedDashboardData hook

  // Show skeleton loader while loading
  if (isLoading) {
    return <RecentTransactionsSkeleton />;
  }

  const formatDate = (timestamp: string) => {
    // ✅ CLEAN: Handle both timestamps and date strings properly
    if (timestamp.includes('T')) {
      // Full timestamp (e.g., "2025-09-08T14:30:00Z") - use as is
      const date = new Date(timestamp);
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    } else { 
      // Date-only string (e.g., "2025-09-08") - parse manually to avoid timezone shift
      const [year, month, day] = timestamp.split('-').map(num => parseInt(num, 10));
      const date = new Date(year, month - 1, day);
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    }
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
      
        {!recentActivity || recentActivity.length === 0 ? (
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
                {recentActivity.map((item, index) => {
                  // NEW: Handle unified activity feed format (Phase 1)
                  const activityName = item.activity_name || 
                                     item.reward_name || 
                                     item.description || 
                                     `${item.type === 'redemption' ? 'Reward' : 'Activity'} ${item.id}`;
                  
                  const activityCategory = item.category || 'Other';
                  
                  // Format points with proper sign
                  const pointsDisplay = item.points_change > 0 
                    ? `+${item.points_change}`
                    : `${item.points_change}`; // Already includes minus sign
                  
                  return (
                    <TableRow 
                      key={item.id}
                      activity={activityName}
                      points={pointsDisplay}
                      date={formatDate(item.timestamp)}
                      category={activityCategory}
                      type={item.type}  // NEW: Pass type for styling
                      order={index + 1}
                    />
                  );
                })}
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
        <th className="text-start p-4 border-b border-slate-200/50">Category</th>
      </tr>
    </thead>
  );
};

const TableRow = ({
  activity,
  points,
  date,
  category,
  type,
  order,
}: {
  activity: string;
  date: string;
  points: string;
  category: string;
  type?: 'activity' | 'redemption';  // NEW: Activity type
  order: number;
}) => {
  // Removed debug logging for performance

  // Helper function to get category color and icon - using consistent colors from shared hook
  const getCategoryStyle = (cat: string) => {
    const categoryLower = cat.toLowerCase();
    switch (categoryLower) {
      case 'engagement':
        return { color: 'text-violet-600', bg: 'bg-violet-100', icon: '🎯' };
      case 'events':
        return { color: 'text-indigo-600', bg: 'bg-indigo-100', icon: '📅' };
      case 'content':
        return { color: 'text-sky-600', bg: 'bg-sky-100', icon: '📝' };
      case 'professional':
        return { color: 'text-emerald-600', bg: 'bg-emerald-100', icon: '💼' };
      case 'social':
        return { color: 'text-blue-600', bg: 'bg-blue-100', icon: '👥' };
      case 'learning':
        return { color: 'text-violet-600', bg: 'bg-violet-100', icon: '📚' };
      default:
        return { color: 'text-gray-600', bg: 'bg-gray-100', icon: '📋' };
    }
  };

  const categoryStyle = getCategoryStyle(category);
  
  // NEW: Style based on activity type (activity vs redemption)
  const isRedemption = type === 'redemption';
  const iconComponent = isRedemption ? FiArrowDownRight : FiArrowUpRight;
  const iconBg = isRedemption 
    ? 'bg-gradient-to-br from-red-100 to-pink-100 text-red-600' 
    : 'bg-gradient-to-br from-violet-100 to-purple-100 text-violet-600';
  const pointsStyle = isRedemption
    ? 'text-red-600 bg-gradient-to-r from-red-50 to-pink-50 border-red-200/50'
    : 'text-emerald-600 bg-gradient-to-r from-emerald-50 to-green-50 border-emerald-200/50';

  return (
    <tr className={`text-sm transition-all duration-200 hover:bg-slate-50/50 ${order % 2 ? "bg-slate-50/30" : ""}`}>
      <td className="p-4 border-b border-slate-100/50">
        <div className="text-slate-800 font-medium flex items-center gap-2">
          <div className={`p-1.5 rounded-lg ${iconBg}`}>
            {React.createElement(iconComponent, { className: "text-xs" })}
          </div>
          <span className="truncate">{activity}</span>
        </div>
      </td>
      <td className="p-4 border-b border-slate-100/50 text-slate-600 font-medium">{date}</td>
      <td className="p-4 border-b border-slate-100/50">
        <span className={`font-semibold px-2 py-1 rounded-full text-xs border ${pointsStyle}`}>
          {points}
        </span>
      </td>
      <td className="p-4 border-b border-slate-100/50">
        <div className="flex items-center gap-1">
          <span className="text-xs">{categoryStyle.icon}</span>
          <span className={`text-xs font-medium capitalize ${categoryStyle.color} ${categoryStyle.bg} px-2 py-1 rounded-full`}>
            {category}
          </span>
        </div>
      </td>
    </tr>
  );
};
