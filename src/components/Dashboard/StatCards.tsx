import React, { useState, useEffect } from "react";
import { FiTrendingDown, FiTrendingUp } from "react-icons/fi";
import { useSession } from "next-auth/react";
import { apiService, DashboardStats } from "../../services/api";

// Global refresh function for StatCards
let globalStatCardsRefresh: (() => Promise<void>) | null = null;

// Export function to trigger stat cards refresh from external components
export const refreshStatCards = async () => {
  console.log('🔄 refreshStatCards called');
  if (globalStatCardsRefresh) {
    console.log('🔄 Executing StatCards refresh function');
    await globalStatCardsRefresh();
  } else {
    console.warn('⚠️ StatCards refresh function not available');
  }
};

export const StatCards = () => {
  const { data: session, status } = useSession();
  const [stats, setStats] = useState({
    totalPoints: 0,
    activitiesCompleted: 0,
    availableRewards: 0,
    loading: true
  });
  const [dashboardStats, setDashboardStats] = useState<DashboardStats | null>(null);

  const fetchStats = async () => {
      try {
        // Get user points from session as fallback
        let userPoints = session?.user?.total_points || 0;
        
        // Only fetch additional stats if user is properly authenticated
        let activitiesCount = 0;
        let availableIncentives = 0;

        if (status === "authenticated" && session?.djangoAccessToken) {
          try {
            // Fetch dashboard stats and rewards in parallel for better performance
            const [dashboardResponse, rewardsResponse] = await Promise.all([
              apiService.getDashboardStats('30days', session.djangoAccessToken),
              apiService.getAvailableRewards(session.djangoAccessToken)
            ]);

            // Handle dashboard stats
            if (dashboardResponse.data) {
              setDashboardStats(dashboardResponse.data);
              activitiesCount = dashboardResponse.data.current_period.activities_completed;
              userPoints = dashboardResponse.data.current_period.total_points;
            }

            // Handle rewards response
            if (rewardsResponse.data) {
              let rewardsArray: any[] = [];
              if (Array.isArray(rewardsResponse.data)) {
                rewardsArray = rewardsResponse.data;
              } else if ((rewardsResponse.data as any).rewards) {
                rewardsArray = (rewardsResponse.data as any).rewards;
              }
              
              // Count ready-to-redeem rewards
              availableIncentives = rewardsArray.filter(reward => {
                const canAfford = userPoints >= reward.points_required;
                const canRedeem = reward.can_redeem;
                const inStock = reward.stock_available === undefined || reward.stock_available > 0;
                return canAfford && canRedeem && inStock;
              }).length;
            }

          } catch (error) {
            console.warn('Failed to fetch stats:', error);
            // Fallback to session data only
            activitiesCount = 0;
            availableIncentives = 0;
          }
        }

        setStats({
          totalPoints: userPoints,
          activitiesCompleted: activitiesCount,
          availableRewards: availableIncentives,
          loading: false
        });
      } catch (error) {
        console.error('Error fetching stats:', error);
        // Still show user points even if other stats fail
        setStats({
          totalPoints: session?.user?.total_points || 0,
          activitiesCompleted: 0,
          availableRewards: 0,
          loading: false
        });
      }
    };

  useEffect(() => {
    if (session?.user) {
      fetchStats();
    } else {
      setStats({
        totalPoints: 0,
        activitiesCompleted: 0,
        availableRewards: 0,
        loading: false
      });
    }
  }, [session, status]);

  // Set up global refresh function
  useEffect(() => {
    globalStatCardsRefresh = fetchStats;
    
    return () => {
      if (globalStatCardsRefresh === fetchStats) {
        globalStatCardsRefresh = null;
      }
    };
  }, [session, status]);

  if (stats.loading) {
    return (
      <>
        <LoadingCard title="Current Points" />
        <LoadingCard title="Activities Completed" />
        <LoadingCard title="Available Rewards" />
      </>
    );
  }

  return (
    <>
      <Card
        title="Current Points"
        value={stats.totalPoints.toString()}
        period={`Earned last 30 days: ${dashboardStats?.current_period.points_earned || 0} points`}
        trend={dashboardStats?.trends.total_points}
      />
      <Card
        title="Activities Completed"
        value={stats.activitiesCompleted.toString()}
        period="Last 30 Days"
        trend={dashboardStats?.trends.activities_completed}
      />
      <Card
        title="Available Rewards"
        value={stats.availableRewards.toString()}
        period="Ready to Redeem"
      />
    </>
  );
};

const LoadingCard = ({ title }: { title: string }) => {
  return (
    <div className="col-span-4 p-6 rounded-2xl bg-gradient-to-br from-slate-50 via-white to-slate-100 shadow-xl border border-slate-200/50 backdrop-blur-sm animate-pulse">
      <div className="flex mb-8 items-start justify-between">
        <div>
          <h3 className="text-slate-500 mb-2 text-sm font-medium">{title}</h3>
          <div className="w-16 h-8 bg-slate-200/50 rounded-lg animate-pulse"></div>
        </div>
        <div className="w-12 h-6 bg-slate-200/50 rounded-full animate-pulse"></div>
      </div>
      <div className="w-20 h-4 bg-slate-200/50 rounded animate-pulse"></div>
    </div>
  );
};

const Card = ({
  title,
  value,
  period,
  trend,
}: {
  title: string;
  value: string;
  period: string;
  trend?: {
    change: number;
    percentage: number;
    direction: 'up' | 'down';
  };
}) => {
  return (
    <div className="col-span-4 p-6 rounded-2xl bg-gradient-to-br from-slate-50 via-white to-slate-100 shadow-xl border border-slate-200/50 backdrop-blur-sm hover:shadow-2xl transition-all duration-300">
      <div className="flex mb-4 items-start justify-between">
        <div>
          <h3 className="text-slate-600 mb-3 text-sm font-medium">{title}</h3>
          <p className="text-4xl font-bold bg-gradient-to-r from-slate-800 to-slate-600 bg-clip-text text-transparent">{value}</p>
        </div>

        {trend && (
          <div className="relative group">
            <span
              className={`text-xs flex items-center gap-1.5 font-semibold px-3 py-2 rounded-full shadow-sm backdrop-blur-sm transition-all duration-200 cursor-help ${
                trend.direction === "up"
                  ? "bg-gradient-to-r from-emerald-100 to-green-100 text-emerald-700 border border-emerald-200/50"
                  : "bg-gradient-to-r from-red-100 to-rose-100 text-red-700 border border-red-200/50"
              }`}
            >
              {trend.direction === "up" ? <FiTrendingUp className="text-sm" /> : <FiTrendingDown className="text-sm" />} 
              {Math.abs(trend.percentage).toFixed(1)}%
            </span>
            <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 text-xs text-white bg-gray-800 rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-10">
              vs previous 30 days
              <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-800"></div>
            </div>
          </div>
        )}
      </div>

      <p className="text-xs text-slate-500 font-medium tracking-wide">{period}</p>
    </div>
  );
};
