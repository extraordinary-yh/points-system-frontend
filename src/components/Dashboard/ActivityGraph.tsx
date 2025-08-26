"use client";

import React from "react";
import { FiUser } from "react-icons/fi";
import { useSharedDashboardData } from "../../hooks/useSharedDashboardData";
import { ActivityGraphSkeleton } from "./SkeletonLoaders";
import { TimelineData } from "../../services/api";
import {
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  Line,
  LineChart,
} from "recharts";

export const ActivityGraph = () => {
  const { timelineData, isLoading, error } = useSharedDashboardData();

  // Show skeleton loader while loading
  if (isLoading) {
    return <ActivityGraphSkeleton />;
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  const chartData = timelineData?.timeline.map(item => ({
    name: formatDate(item.date),
    Points: item.cumulative_points,
    Daily: item.points_earned,
  })) || [];

  return (
    <div className="col-span-7 overflow-hidden rounded-2xl bg-gradient-to-br from-slate-50 via-white to-slate-100 shadow-xl border border-slate-200/50 backdrop-blur-sm flex flex-col">
      {/* Modern header with glassmorphism effect */}
      <div className="p-6 bg-gradient-to-r from-white/80 to-slate-50/80 backdrop-blur-sm border-b border-slate-200/50">
        <h3 className="flex items-center gap-2 font-semibold text-slate-800">
          <div className="p-2 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 shadow-lg">
            <FiUser className="text-white text-sm" />
          </div>
          <span className="bg-gradient-to-r from-slate-800 to-slate-600 bg-clip-text text-transparent">
            Point Tracker
          </span>
        </h3>
      </div>

      <div className="flex-1 p-6">
        {!timelineData || chartData.length === 0 ? (
          <div className="flex items-center justify-center h-full min-h-[280px] text-center">
            <div className="p-8 rounded-2xl bg-gradient-to-br from-slate-50 to-white border border-slate-200 shadow-inner">
              <div className="text-5xl mb-4 opacity-50">📊</div>
              <p className="font-semibold text-slate-700 mb-2">No Timeline Data</p>
              <p className="text-sm text-slate-500">Complete activities to see your points progress over time</p>
            </div>
          </div>
        ) : (
          <div className="w-full h-80">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={chartData}
                margin={{
                  top: 20,
                  right: 20,
                  left: 0,
                  bottom: 20,
                }}
              >
                <CartesianGrid stroke="#e4e4e7" strokeDasharray="3 3" />
                <XAxis
                  dataKey="name"
                  axisLine={false}
                  tickLine={false}
                  className="text-xs font-medium text-slate-600"
                  tick={{ fontSize: 11 }}
                />
                <YAxis 
                  className="text-xs font-medium text-slate-600" 
                  axisLine={false} 
                  tickLine={false}
                  tick={{ fontSize: 11 }}
                />
                <Tooltip
                  content={({ active, payload, label }) => {
                    if (active && payload && payload.length) {
                      return (
                        <div className="bg-white/95 backdrop-blur-sm p-3 border border-slate-200 rounded-xl shadow-xl">
                          <p className="text-xs text-slate-600 mb-2 font-medium">{label}</p>
                          <p className="text-violet-600 font-semibold">Total: {payload[0]?.value} points</p>
                          {payload[1] && (
                            <p className="text-emerald-600 text-sm font-medium">Daily: +{payload[1]?.value} points</p>
                          )}
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="Points"
                  stroke="#5b21b6"
                  strokeWidth={3}
                  dot={{ 
                    fill: '#5b21b6', 
                    strokeWidth: 2, 
                    r: 4,
                    stroke: '#ffffff'
                  }}
                  activeDot={{ 
                    r: 6, 
                    fill: '#5b21b6',
                    stroke: '#ffffff',
                    strokeWidth: 2
                  }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>
    </div>
  );
};
