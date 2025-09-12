import React, { useState, useEffect } from "react";
import { FiArrowUpRight, FiArrowDownRight, FiChevronDown, FiChevronUp } from "react-icons/fi";
import { useSharedDashboardData } from "../../hooks/useSharedDashboardData";
import { RecentTransactionsSkeleton } from "./SkeletonLoaders";
import { ActivityFeedItem, apiService } from "../../services/api";
import { useSession } from "next-auth/react";

export const RecentTransactions = () => {
  const { recentActivity, isLoading, error } = useSharedDashboardData();
  const { data: session } = useSession();
  
  // State for "See All" functionality
  const [showAll, setShowAll] = useState(false);
  const [allActivity, setAllActivity] = useState<ActivityFeedItem[]>([]);
  const [loadingAll, setLoadingAll] = useState(false);
  const [allActivityError, setAllActivityError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(0);
  const itemsPerPage = 10;

  // Debug removed - using central debugging in useSharedDashboardData hook

  // Function to fetch all activity data
  const fetchAllActivity = async () => {
    if (!session?.djangoAccessToken) return;
    
    setLoadingAll(true);
    setAllActivityError(null);
    
    try {
      const response = await apiService.getActivityFeed(session.djangoAccessToken);
      if (response.error) {
        setAllActivityError(response.error);
      } else if (response.data) {
        setAllActivity(response.data.feed);
      }
    } catch (error) {
      setAllActivityError(error instanceof Error ? error.message : 'Failed to fetch all activity');
    } finally {
      setLoadingAll(false);
    }
  };

  // Handle "See All" button click
  const handleSeeAllClick = async () => {
    if (!showAll) {
      // If we haven't fetched all data yet, fetch it
      if (allActivity.length === 0) {
        await fetchAllActivity();
      }
      setCurrentPage(0); // Reset to first page
    }
    setShowAll(!showAll);
  };

  // Function to scroll to pagination controls
  const scrollToPaginationControls = () => {
    // Small delay to ensure DOM has updated with new data
    setTimeout(() => {
      // Try to find the pagination controls element
      const paginationElement = document.querySelector('[data-pagination-controls]');
      if (paginationElement) {
        paginationElement.scrollIntoView({ 
          behavior: 'smooth', 
          block: 'end',
          inline: 'nearest'
        });
      } else {
        // Fallback: scroll to bottom of the component
        const componentElement = document.querySelector('[data-section="recent-activity"]');
        if (componentElement) {
          componentElement.scrollIntoView({ 
            behavior: 'smooth', 
            block: 'end',
            inline: 'nearest'
          });
        }
      }
    }, 100);
  };

  // Pagination handlers
  const handleNextPage = () => {
    if (hasNextPage) {
      setCurrentPage(currentPage + 1);
      scrollToPaginationControls();
    }
  };

  const handlePrevPage = () => {
    if (hasPrevPage) {
      setCurrentPage(currentPage - 1);
      scrollToPaginationControls();
    }
  };

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

  // Helper function to infer category from activity data (same as shared hook)
  const inferCategory = (item: any): string => {
    // First try to get category from backend data
    if (item.details?.activity_category) return item.details.activity_category;
    if (item.category) return item.category;
    
    // If no category from backend, infer from activity type and description
    const description = (item.activity_name || item.description || '').toLowerCase();
    const type = item.type;
    
    // Infer category based on activity description patterns
    if (description.includes('linkedin') || description.includes('social media')) return 'Social';
    if (description.includes('discord') || description.includes('community')) return 'Engagement';
    if (description.includes('event') || description.includes('workshop')) return 'Events';
    if (description.includes('course') || description.includes('learning')) return 'Learning';
    if (description.includes('professional') || description.includes('career')) return 'Professional';
    if (description.includes('content') || description.includes('blog')) return 'Content';
    
    // For redemptions, categorize as 'Rewards'
    if (type === 'redemption') return 'Rewards';
    
    // Default fallback
    return 'Other';
  };

  // Process data consistently for both states
  const processActivityData = (data: ActivityFeedItem[]) => {
    return data.map(item => ({
      id: item.id,
      type: item.type,
      timestamp: item.timestamp,
      points_change: item.points_change,
      description: item.description,
      category: inferCategory(item),
      activity_name: item.activity_name,
      reward_name: item.reward_name
    }));
  };

  // Determine which data to display and process it consistently
  const rawData = showAll ? allActivity : recentActivity;
  const processedData = processActivityData(rawData);
  
  // For consistent height, always show exactly 10 items at a time
  const displayData = showAll 
    ? processedData.slice(currentPage * itemsPerPage, (currentPage + 1) * itemsPerPage)
    : processedData;
  const displayError = showAll ? allActivityError : error;
  const displayLoading = showAll ? loadingAll : false;
  
  // Calculate pagination info
  const totalPages = showAll ? Math.ceil(processedData.length / itemsPerPage) : 1;
  const hasNextPage = showAll && currentPage < totalPages - 1;
  const hasPrevPage = showAll && currentPage > 0;

  // Auto-scroll when switching to pages with more items
  useEffect(() => {
    // Only trigger scroll in "See All" mode when we have pagination
    if (showAll && displayData.length === 10) {
      scrollToPaginationControls();
    }
  }, [displayData.length, showAll]);

  // Show skeleton loader while loading - AFTER all hooks are declared
  if (isLoading) {
    return <RecentTransactionsSkeleton />;
  }

  return (
    <div 
      className="col-span-12 rounded-2xl bg-gradient-to-br from-slate-50 via-white to-slate-100 shadow-xl border border-slate-200/50 backdrop-blur-sm overflow-hidden"
      data-section="recent-activity"
    >
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
          <button 
            onClick={handleSeeAllClick}
            disabled={displayLoading}
            className="text-sm font-medium text-violet-600 hover:text-violet-700 transition-colors duration-200 px-3 py-1.5 rounded-lg hover:bg-violet-50 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1"
          >
            {displayLoading ? (
              <>
                <div className="w-3 h-3 border-2 border-violet-600 border-t-transparent rounded-full animate-spin"></div>
                Loading...
              </>
            ) : showAll ? (
              <>
                Show Recent
                <FiChevronUp className="text-xs" />
              </>
            ) : (
              <>
                See all
                <FiChevronDown className="text-xs" />
              </>
            )}
          </button>
        </div>
      </div>
      
      <div className="p-6">
        {/* Error state */}
        {displayError ? (
          <div className="text-center py-12">
            <div className="p-8 rounded-2xl bg-gradient-to-br from-red-50 to-rose-50 border border-red-200 shadow-inner inline-block">
              <div className="text-5xl mb-4 opacity-50">⚠️</div>
              <p className="font-semibold text-red-700 mb-2">Error Loading Activity</p>
              <p className="text-sm text-red-600">{displayError}</p>
            </div>
          </div>
        ) : !displayData || displayData.length === 0 ? (
          <div className="text-center py-12">
            <div className="p-8 rounded-2xl bg-gradient-to-br from-slate-50 to-white border border-slate-200 shadow-inner inline-block">
              <div className="text-5xl mb-4 opacity-50">📋</div>
              <p className="font-semibold text-slate-700 mb-2">
                {showAll ? 'No Activity History' : 'No Recent Activity'}
              </p>
              <p className="text-sm text-slate-500">
                {showAll ? 'Complete activities to see them appear here' : 'Complete activities to see them appear here'}
              </p>
            </div>
          </div>
        ) : (
          <div className="overflow-hidden rounded-xl border border-slate-200/50 bg-white/50 backdrop-blur-sm">
            {/* Table container - consistent structure for both states */}
            <div>
              <table className="w-full table-auto">
                <TableHead />
                <tbody>
                  {displayData.map((item, index) => {
                    // Use processed data consistently for both states
                    const activityName = item.activity_name || 
                                       item.reward_name || 
                                       item.description || 
                                       `${item.type === 'redemption' ? 'Reward' : 'Activity'} ${item.id}`;
                    
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
                        category={item.category} // Use processed category
                        type={item.type}
                        order={index + 1}
                      />
                    );
                  })}
                </tbody>
              </table>
            </div>
            
            {/* Pagination controls and count when in "See All" mode */}
            {showAll && allActivity.length > 0 && (
              <div 
                className="px-4 py-2 bg-slate-50/50 border-t border-slate-200/50"
                data-pagination-controls
              >
                <div className="flex items-center justify-between">
                  <div className="text-xs text-slate-600">
                    Page {currentPage + 1} of {totalPages} • {allActivity.length} total activities
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={handlePrevPage}
                      disabled={!hasPrevPage}
                      className="px-2 py-1 text-xs font-medium text-slate-600 hover:text-slate-800 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-100 rounded transition-colors"
                    >
                      ← Previous
                    </button>
                    <button
                      onClick={handleNextPage}
                      disabled={!hasNextPage}
                      className="px-2 py-1 text-xs font-medium text-slate-600 hover:text-slate-800 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-100 rounded transition-colors"
                    >
                      Next →
                    </button>
                  </div>
                </div>
              </div>
            )}
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
