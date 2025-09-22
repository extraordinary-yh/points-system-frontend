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
  const { timelineData, activityFeed, totalPoints, isLoading, error, lastFetch, cacheVersion, refresh } = useSharedDashboardData();


  // Show skeleton loader while loading
  if (isLoading) {
    return <ActivityGraphSkeleton />;
  }

  const formatDate = (dateString: string) => {
    // ✅ CLEAN: Parse date string manually to avoid timezone issues
    // Backend sends "2025-09-08" format - parse directly to avoid timezone shifts
    const [year, month, day] = dateString.split('-').map(num => parseInt(num, 10));
    const date = new Date(year, month - 1, day); // month is 0-indexed
    
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  // 🚀 NEW APPROACH: Build chart data from fast activity feed instead of slow timeline
  const chartData = (() => {
    // Fallback to timeline if activity feed not available
    if (!activityFeed?.feed?.length && !timelineData?.timeline?.length) return [];
    
    const correctTotalPoints = totalPoints || 0;

    // 🚀 PREFER ACTIVITY FEED (fast, real-time) over timeline (slow, cached)
    if (activityFeed?.feed?.length) {
      
      // Group activity feed by date and calculate daily totals (including redemptions)
      const dailyData: Record<string, { 
        totalChange: number, 
        activities: number, 
        redemptions: number,
        date: string 
      }> = {};
      
      activityFeed.feed.forEach(item => {
        const dateKey = item.timestamp.split('T')[0]; // Get YYYY-MM-DD
        
        if (!dailyData[dateKey]) {
          dailyData[dateKey] = { 
            totalChange: 0, // Track total net change for the day
            activities: 0, 
            redemptions: 0,
            date: dateKey 
          };
        }
        
        if (item.type === 'activity') {
          // Count ALL activity point changes (both positive and negative)
          dailyData[dateKey].totalChange += item.points_change;
          dailyData[dateKey].activities += 1;
        } else if (item.type === 'redemption') {
          // Count ALL redemption point changes (typically negative)
          console.log(`🔍 REDEMPTION FOUND:`, {
            date: dateKey,
            points_change: item.points_change,
            description: item.description,
            reward_name: item.reward_name
          });
          dailyData[dateKey].totalChange += item.points_change;
          dailyData[dateKey].redemptions += 1;
        } else {
          // Log any unexpected types
          console.log(`⚠️ UNKNOWN TYPE:`, {
            type: item.type,
            points_change: item.points_change,
            description: item.description
          });
        }
      });
      
      // Convert to array and sort by date
      const sortedDays = Object.values(dailyData).sort((a, b) => 
        new Date(a.date).getTime() - new Date(b.date).getTime()
      );
      
      // Debug: Log daily totals to verify redemptions are included
      console.log(`📊 DAILY TOTALS:`, sortedDays.map(day => ({
        date: day.date,
        totalChange: day.totalChange,
        activities: day.activities,
        redemptions: day.redemptions
      })));
      
      // 🚀 CORRECT APPROACH: Calculate backward from current total points
      // Work backward through time to get accurate historical progression
      let runningTotal = correctTotalPoints; // Start with current total
      const chartDataFromFeed = [];
      
      // Work backward through the sorted days (reverse order)
      for (let i = sortedDays.length - 1; i >= 0; i--) {
        const day = sortedDays[i];
        const netChange = day.totalChange; // Use the total change directly
        
        // Store the current running total for this day (before we subtract)
        const pointsAtEndOfDay = runningTotal;
        
        // Move backward in time by subtracting this day's net change
        runningTotal -= netChange;
        
        // Ensure we never show negative points in history
        const displayPoints = Math.max(0, pointsAtEndOfDay);
        
        // Separate positive and negative changes for tooltip display
        const positiveChanges = day.totalChange > 0 ? day.totalChange : 0;
        const negativeChanges = day.totalChange < 0 ? Math.abs(day.totalChange) : 0;
        
        // Add to beginning of array since we're working backward
        chartDataFromFeed.unshift({
          name: formatDate(day.date),
          Points: displayPoints,
          Daily: positiveChanges, // Positive changes for tooltip
          Redeemed: negativeChanges, // Negative changes for tooltip
          Net: netChange,
          Redemptions: day.redemptions,
          rawDate: day.date,
          dataSource: 'activity-feed' // Mark data source for debugging
        });
      }
      
      return chartDataFromFeed;
    }
    
    // 🐌 FALLBACK: Use slow timeline data if activity feed unavailable
    if (!timelineData?.timeline?.length) return [];
    const timeline = timelineData.timeline;
    
    // Sort timeline by date to ensure proper progression
    const sortedTimeline = [...timeline].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    
    // 🚀 CORRECT APPROACH: Calculate backward from current total points (same as activity feed)
    let runningTotal = correctTotalPoints; // Start with current total
    const chartDataWithProgression = [];
    
    // Work backward through the sorted timeline (reverse order)
    for (let i = sortedTimeline.length - 1; i >= 0; i--) {
      const item = sortedTimeline[i];
      const dailyNet = (item.points_earned || 0) - (item.points_redeemed || 0);
      
      // Store the current running total for this day (before we subtract)
      const pointsAtEndOfDay = runningTotal;
      
      // Move backward in time by subtracting this day's net change
      runningTotal -= dailyNet;
      
      // Ensure we never show negative points in history
      const displayPoints = Math.max(0, pointsAtEndOfDay);
      
      // Add to beginning of array since we're working backward
      chartDataWithProgression.unshift({
        name: formatDate(item.date),
        Points: displayPoints,
        Daily: item.points_earned || 0,
        Redeemed: item.points_redeemed || 0,
        Net: dailyNet,
        Redemptions: item.redemptions_count || 0,
        rawDate: item.date // Add raw date for debugging
      });
    }
    
    return chartDataWithProgression;
  })();

  return (
    <div 
      className="col-span-6 overflow-hidden rounded-2xl bg-gradient-to-br from-slate-50 via-white to-slate-100 shadow-xl border border-slate-200/50 backdrop-blur-sm flex flex-col"
      data-section="point-tracker"
    >
      {/* Modern header with glassmorphism effect */}
      <div className="p-6 bg-gradient-to-r from-white/80 to-slate-50/80 backdrop-blur-sm border-b border-slate-200/50">
        <h3 className="flex items-center font-semibold text-slate-800">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 shadow-lg">
              <FiUser className="text-white text-sm" />
            </div>
            <span className="bg-gradient-to-r from-slate-800 to-slate-600 bg-clip-text text-transparent">
              Point Tracker
            </span>
          </div>
        </h3>
      </div>

      <div className="flex-1 p-6">
        {!timelineData || chartData.length === 0 ? (
          <div className="flex items-center justify-center h-full min-h-[200px] text-center">
            <div className="p-6 rounded-2xl bg-gradient-to-br from-slate-50 to-white border border-slate-200 shadow-inner">
              <div className="text-4xl mb-3 opacity-50">📊</div>
              <p className="font-semibold text-slate-700 mb-2">No Timeline Data</p>
              <p className="text-sm text-slate-500">Complete activities to see your points progress over time</p>
            </div>
          </div>
        ) : (
          <div className="w-full h-full min-h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={chartData}
                margin={{
                  top: 10,
                  right: 10,
                  left: 10,
                  bottom: 10,
                }}
              >
                <CartesianGrid stroke="#e4e4e7" strokeDasharray="3 3" />
                <XAxis
                  dataKey="name"
                  axisLine={false}
                  tickLine={false}
                  className="text-xs font-medium text-slate-600"
                  tick={{ fontSize: 10 }}
                  height={40}
                  interval="preserveStartEnd"
                  minTickGap={30}
                />
                <YAxis 
                  className="text-xs font-medium text-slate-600" 
                  axisLine={false} 
                  tickLine={false}
                  tick={{ fontSize: 10 }}
                  width={40}
                  domain={['dataMin - 10', 'dataMax + 10']}
                  allowDataOverflow={false}
                />
                <Tooltip
                  content={({ active, payload, label }) => {
                    if (active && payload && payload.length) {
                      const data = payload[0]?.payload;
                      const dataSource = data?.dataSource || 'timeline';
                      return (
                        <div className="bg-white/95 backdrop-blur-sm p-3 border border-slate-200 rounded-xl shadow-xl">
                          <div className="flex items-center justify-between mb-2">
                            <p className="text-xs text-slate-600 font-medium">{label}</p>
                            {dataSource === 'activity-feed' && (
                              <span className="text-xs bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full">🚀 Real-time</span>
                            )}
                          </div>
                          <p className="text-violet-600 font-semibold">Total: {data?.Points} points</p>
                          {data?.Daily > 0 && (
                            <p className="text-emerald-600 text-sm font-medium">Earned: +{data.Daily} points</p>
                          )}
                          {data?.Redeemed > 0 && (
                            <p className="text-red-500 text-sm font-medium">Redeemed: -{data.Redeemed} points</p>
                          )}
                          {data?.Net !== data?.Daily && (
                            <p className="text-slate-700 text-sm font-medium">Net: {data?.Net > 0 ? '+' : ''}{data?.Net} points</p>
                          )}
                          {data?.Redemptions > 0 && (
                            <p className="text-xs text-slate-500">🎁 {data.Redemptions} redemption{data.Redemptions > 1 ? 's' : ''}</p>
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
