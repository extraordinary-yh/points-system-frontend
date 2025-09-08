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

  // 🐛 DEBUG: Log timeline data updates
  React.useEffect(() => {
    const now = new Date();
    const timeStr = now.toLocaleTimeString();
    const dateStr = now.toLocaleDateString();
    
    console.log(`🔍 [${timeStr}] ActivityGraph: Timeline data update`, {
      hasTimelineData: !!timelineData,
      timelineLength: timelineData?.timeline?.length || 0,
      totalPoints: totalPoints,
      lastFetch: lastFetch ? new Date(lastFetch).toLocaleTimeString() : 'never',
      cacheVersion: cacheVersion,
      currentDate: dateStr,
      latestTimelineDate: timelineData?.timeline?.[timelineData.timeline.length - 1]?.date,
      latestTimelinePoints: timelineData?.timeline?.[timelineData.timeline.length - 1]?.points_earned
    });

    if (timelineData?.timeline && timelineData.timeline.length > 0) {
      // Show last 3 timeline entries for debugging
      const lastThreeEntries = timelineData.timeline.slice(-3);
      console.log(`📊 Last 3 timeline entries:`, lastThreeEntries.map(entry => ({
        date: entry.date,
        points_earned: entry.points_earned,
        cumulative: entry.cumulative_points,
        activities: entry.activities_count
      })));
    }
  }, [timelineData, totalPoints, lastFetch, cacheVersion]);

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
      console.log('🚀 Using FAST activity feed data for chart instead of slow timeline');
      
      // Group activity feed by date and calculate daily totals (including redemptions)
      const dailyData: Record<string, { 
        points: number, 
        activities: number, 
        redemptions: number,
        redeemed: number,
        date: string 
      }> = {};
      
      activityFeed.feed.forEach(item => {
        const dateKey = item.timestamp.split('T')[0]; // Get YYYY-MM-DD
        
        if (!dailyData[dateKey]) {
          dailyData[dateKey] = { 
            points: 0, 
            activities: 0, 
            redemptions: 0,
            redeemed: 0,
            date: dateKey 
          };
        }
        
        if (item.type === 'activity' && item.points_change > 0) {
          // Only count positive point changes (earnings)
          dailyData[dateKey].points += item.points_change;
          dailyData[dateKey].activities += 1;
        } else if (item.type === 'redemption' && item.points_change < 0) {
          // Count redemptions (negative point changes)
          dailyData[dateKey].redeemed += Math.abs(item.points_change); // Store as positive number
          dailyData[dateKey].redemptions += 1;
        }
      });
      
      // Convert to array and sort by date
      const sortedDays = Object.values(dailyData).sort((a, b) => 
        new Date(a.date).getTime() - new Date(b.date).getTime()
      );
      
      // Calculate cumulative totals (ensure no negative points)
      let runningTotal = 0;
      const chartDataFromFeed = sortedDays.map((day, index) => {
        // Calculate net change for the day
        const netChange = day.points - day.redeemed;
        runningTotal += netChange;
        
        // 🚨 CRITICAL: Ensure running total never goes negative
        if (runningTotal < 0) {
          console.warn(`⚠️ Negative points detected for ${day.date}, clamping to 0. Net change: ${netChange}, Running total would be: ${runningTotal}`);
          runningTotal = 0;
        }
        
        return {
          name: formatDate(day.date),
          Points: runningTotal,
          Daily: day.points,
          Redeemed: day.redeemed,
          Net: netChange,
          Redemptions: day.redemptions,
          rawDate: day.date,
          dataSource: 'activity-feed' // Mark data source for debugging
        };
      });
      
      // Adjust to match total points
      const calculatedFinal = chartDataFromFeed[chartDataFromFeed.length - 1]?.Points || 0;
      const adjustment = correctTotalPoints - calculatedFinal;
      
      if (Math.abs(adjustment) > 0) {
        chartDataFromFeed.forEach(item => {
          item.Points += adjustment;
        });
        console.log('📊 Adjusted activity feed chart data:', { correctTotalPoints, calculatedFinal, adjustment });
      }
      
      // 🐛 DEBUG: Log detailed activity feed analysis
      console.log('🔍 Activity feed analysis:', {
        totalFeedItems: activityFeed.feed.length,
        activities: activityFeed.feed.filter(item => item.type === 'activity').length,
        redemptions: activityFeed.feed.filter(item => item.type === 'redemption').length,
        dailyDataEntries: Object.keys(dailyData).length,
        sortedDaysCount: sortedDays.length,
        lastThreeDays: sortedDays.slice(-3).map(day => ({
          date: day.date,
          points: day.points,
          redeemed: day.redeemed,
          net: day.points - day.redeemed,
          activities: day.activities,
          redemptions: day.redemptions
        }))
      });
      
      console.log('✅ Activity feed chart data:', chartDataFromFeed.slice(-3));
      return chartDataFromFeed;
    }
    
    // 🐌 FALLBACK: Use slow timeline data if activity feed unavailable
    console.log('⚠️ Falling back to SLOW timeline data (activity feed not available)');
    if (!timelineData?.timeline?.length) return [];
    const timeline = timelineData.timeline;
    
    // 🐛 DEBUG: Log raw timeline data before processing
    console.log('🔍 Raw timeline data before chart processing:', {
      timelineLength: timeline.length,
      rawTimeline: timeline.map(item => ({
        date: item.date,
        points_earned: item.points_earned,
        cumulative_points: item.cumulative_points,
        activities_count: item.activities_count
      })),
      todayString: new Date().toISOString().split('T')[0]
    });
    
    // Sort timeline by date to ensure proper progression
    const sortedTimeline = [...timeline].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    
    // 🐛 DEBUG: Log sorted timeline
    console.log('🔍 Sorted timeline:', sortedTimeline.map(item => ({
      date: item.date,
      points_earned: item.points_earned,
      formattedDate: formatDate(item.date)
    })));
    
    // Calculate proper cumulative progression
    let runningTotal = 0;
    const chartDataWithProgression = sortedTimeline.map((item, index) => {
      // Add daily net points to running total
      const dailyNet = (item.points_earned || 0) - (item.points_redeemed || 0);
      runningTotal += dailyNet;
      
      const chartPoint = {
        name: formatDate(item.date),
        Points: runningTotal, // Use calculated running total
        Daily: item.points_earned || 0,
        Redeemed: item.points_redeemed || 0,
        Net: dailyNet,
        Redemptions: item.redemptions_count || 0,
        rawDate: item.date // Add raw date for debugging
      };
      
      // 🐛 DEBUG: Log each chart point creation
      console.log(`🔍 Chart point ${index}:`, chartPoint);
      
      return chartPoint;
    });
    
    // Adjust final total to match the correct total points from activity feed
    const calculatedFinal = chartDataWithProgression[chartDataWithProgression.length - 1]?.Points || 0;
    const adjustment = correctTotalPoints - calculatedFinal;
    
    // Apply adjustment to all points if needed
    if (Math.abs(adjustment) > 0) {
      chartDataWithProgression.forEach(item => {
        item.Points += adjustment;
      });
      
      console.log('📊 ActivityGraph: Adjusted chart data to match total points:', {
        correctTotalPoints,
        calculatedFinal,
        adjustment,
        finalDisplayTotal: chartDataWithProgression[chartDataWithProgression.length - 1]?.Points
      });
    }
    
    // 🐛 DEBUG: Log final chart data before return
    console.log('🔍 Final chart data for rendering:', {
      totalPoints: chartDataWithProgression.length,
      firstPoint: chartDataWithProgression[0],
      lastPoint: chartDataWithProgression[chartDataWithProgression.length - 1],
      allDates: chartDataWithProgression.map(p => ({ name: p.name, rawDate: p.rawDate }))
    });
    
    return chartDataWithProgression;
  })();

  return (
    <div className="col-span-6 overflow-hidden rounded-2xl bg-gradient-to-br from-slate-50 via-white to-slate-100 shadow-xl border border-slate-200/50 backdrop-blur-sm flex flex-col">
      {/* Modern header with glassmorphism effect */}
      <div className="p-6 bg-gradient-to-r from-white/80 to-slate-50/80 backdrop-blur-sm border-b border-slate-200/50">
        <h3 className="flex items-center justify-between font-semibold text-slate-800">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 shadow-lg">
              <FiUser className="text-white text-sm" />
            </div>
            <span className="bg-gradient-to-r from-slate-800 to-slate-600 bg-clip-text text-transparent">
              Point Tracker
            </span>
          </div>
          
          {/* 🐛 DEBUG: Manual refresh button */}
          <button 
            onClick={() => {
              console.log('🔄 Manual refresh triggered from ActivityGraph');
              refresh(true);
            }}
            className="px-3 py-1 text-xs bg-blue-100 hover:bg-blue-200 text-blue-700 rounded-md transition-colors"
            title="Debug: Force refresh timeline data"
          >
            🔄 Refresh
          </button>
        </h3>
        
        {/* 🐛 DEBUG: Show data freshness info */}
        {lastFetch && (
          <p className="text-xs text-slate-500 mt-1">
            Last update: {new Date(lastFetch).toLocaleTimeString()} 
            {activityFeed?.feed?.length ? (
              <span className="text-emerald-600"> | 🚀 Using FAST activity feed</span>
            ) : timelineData?.timeline ? (
              <span className="text-amber-600"> | 🐌 Using slow timeline data</span>
            ) : (
              <span className="text-red-600"> | ❌ No data available</span>
            )}
          </p>
        )}
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
