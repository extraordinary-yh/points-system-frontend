"use client";

import { useState, useEffect, useRef } from "react";
import { useSession } from "next-auth/react";
import { apiService, PointsLog, TimelineData } from "../services/api";

// Shared data types
interface DashboardData {
  pointsHistory: PointsLog[] | null;
  timelineData: TimelineData | null;
  isLoading: boolean;
  error: string | null;
  lastFetch: number | null;
}

interface ProcessedData {
  recentActivity: PointsLog[];
  categoryData: CategoryData[];
}

interface CategoryData {
  name: string;
  value: number;
  color: string;
  gradient: string;
}

// Cache duration in milliseconds (5 minutes)
const CACHE_DURATION = 5 * 60 * 1000;

// New complementary color palette with strong contrast
const CATEGORY_COLORS: Record<string, {color: string, gradient: string}> = {
  'engagement': {
    color: '#7C3AED',
    gradient: 'linear-gradient(135deg, #7C3AED 0%, #8B5CF6 100%)'
  },
  'events': {
    color: '#4C1D95',
    gradient: 'linear-gradient(135deg, #4C1D95 0%, #6366F1 100%)'
  },
  'content': {
    color: '#0EA5E9',
    gradient: 'linear-gradient(135deg, #0EA5E9 0%, #67E8F9 100%)'
  },
  'professional': {
    color: '#10B981',
    gradient: 'linear-gradient(135deg, #10B981 0%, #6EE7B7 100%)'
  },
  'social': {
    color: '#3B82F6',
    gradient: 'linear-gradient(135deg, #3B82F6 0%, #60A5FA 100%)'
  },
  'learning': {
    color: '#7C3AED',
    gradient: 'linear-gradient(135deg, #7C3AED 0%, #A855F7 100%)'
  }
};

// New color palette fallback colors
const FALLBACK_COLORS = [
  '#7C3AED', '#4C1D95', '#0EA5E9', '#10B981', '#3B82F6'
];
const FALLBACK_GRADIENTS = [
  'linear-gradient(135deg, #7C3AED 0%, #8B5CF6 100%)',
  'linear-gradient(135deg, #4C1D95 0%, #6366F1 100%)',
  'linear-gradient(135deg, #0EA5E9 0%, #67E8F9 100%)',
  'linear-gradient(135deg, #10B981 0%, #6EE7B7 100%)',
  'linear-gradient(135deg, #3B82F6 0%, #60A5FA 100%)'
];

// Global cache for dashboard data (shared across all components)
let globalCache: DashboardData = {
  pointsHistory: null,
  timelineData: null,
  isLoading: false,
  error: null,
  lastFetch: null
};

// Global subscribers to notify components of data changes
let subscribers: Set<() => void> = new Set();

export const useSharedDashboardData = () => {
  const { data: session, status } = useSession();
  const [data, setData] = useState<DashboardData>(globalCache);
  const subscriberRef = useRef<() => void>();

  // Subscribe to global state changes
  useEffect(() => {
    const updateData = () => setData({...globalCache});
    subscriberRef.current = updateData;
    subscribers.add(updateData);

    return () => {
      if (subscriberRef.current) {
        subscribers.delete(subscriberRef.current);
      }
    };
  }, []);

  // Notify all subscribers of state changes
  const notifySubscribers = () => {
    subscribers.forEach(callback => callback());
  };

  // Check if cache is still valid
  const isCacheValid = () => {
    if (!globalCache.lastFetch) return false;
    return Date.now() - globalCache.lastFetch < CACHE_DURATION;
  };

  // Fetch fresh data
  const fetchData = async (token: string) => {
    // Prevent duplicate requests
    if (globalCache.isLoading) return;

    globalCache.isLoading = true;
    globalCache.error = null;
    notifySubscribers();

    try {
      // Fetch both points history and timeline data in parallel
      const [pointsResponse, timelineResponse] = await Promise.all([
        apiService.getPointsHistory(token),
        apiService.getPointsTimeline('daily', 30, token)
      ]);

      let hasError = false;
      let errorMessage = '';

      // Handle points history response
      if (pointsResponse.error) {
        hasError = true;
        errorMessage = pointsResponse.error;
        console.warn('Failed to fetch points history:', pointsResponse.error);
      } else if (pointsResponse.data) {
        globalCache.pointsHistory = pointsResponse.data;
      }

      // Handle timeline response
      if (timelineResponse.error) {
        console.warn('Failed to fetch timeline data:', timelineResponse.error);
        // Timeline error is less critical, don't fail the whole request
      } else if (timelineResponse.data) {
        globalCache.timelineData = timelineResponse.data;
      }

      globalCache.error = hasError ? errorMessage : null;
      globalCache.lastFetch = Date.now();

    } catch (error) {
      globalCache.error = error instanceof Error ? error.message : 'Unknown error';
      console.error('Dashboard data fetch error:', error);
    } finally {
      globalCache.isLoading = false;
      notifySubscribers();
    }
  };

  // Main fetch effect
  useEffect(() => {
    const loadData = async () => {
      if (status === "authenticated" && session?.djangoAccessToken) {
        // Use cached data if still valid
        if (isCacheValid()) {
          return;
        }
        
        await fetchData(session.djangoAccessToken);
      }
    };

    loadData();
  }, [session, status]);

  // Process data for specific components (memoized)
  const getProcessedData = (): ProcessedData => {
    const pointsHistory = globalCache.pointsHistory || [];

    // Process recent activity (last 6 items, sorted by date)
    const recentActivity = pointsHistory
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
      .slice(0, 6);

    // Process category data for pie chart
    const categoryTotals = pointsHistory.reduce((acc: Record<string, number>, log: PointsLog) => {
      // Try the new backend field first, then fallback to nested field
      const category = (log as any).activity_category || log.activity?.category || 'Other';
      acc[category] = (acc[category] || 0) + log.points_earned;
      return acc;
    }, {});

    // Sort categories alphabetically and assign consistent colors
    const categoryData = Object.entries(categoryTotals)
      .sort(([a], [b]) => a.localeCompare(b)) // Sort by category name
      .map(([category, points], index) => {
        const categoryKey = category.toLowerCase();
        const colorMapping = CATEGORY_COLORS[categoryKey];
        
        // Use predefined color if available, otherwise use fallback
        const color = colorMapping?.color || FALLBACK_COLORS[index % FALLBACK_COLORS.length];
        const gradient = colorMapping?.gradient || FALLBACK_GRADIENTS[index % FALLBACK_GRADIENTS.length];
        
        return {
          name: category.charAt(0).toUpperCase() + category.slice(1),
          value: points,
          color,
          gradient
        };
      });

    return { recentActivity, categoryData };
  };

  // Force refresh function
  const refresh = async () => {
    if (session?.djangoAccessToken) {
      await fetchData(session.djangoAccessToken);
    }
  };

  // Clear cache (useful for logout, etc.)
  const clearCache = () => {
    globalCache = {
      pointsHistory: null,
      timelineData: null,
      isLoading: false,
      error: null,
      lastFetch: null
    };
    notifySubscribers();
  };

  return {
    // Raw data
    pointsHistory: globalCache.pointsHistory,
    timelineData: globalCache.timelineData,
    
    // Processed data
    ...getProcessedData(),
    
    // State
    isLoading: globalCache.isLoading,
    error: globalCache.error,
    
    // Actions
    refresh,
    clearCache,
    
    // Cache info
    isCached: isCacheValid(),
    lastFetch: globalCache.lastFetch
  };
};
