import React, { useState, useEffect } from "react";
import { FiTrendingDown, FiTrendingUp } from "react-icons/fi";
import { useSession } from "next-auth/react";
import { apiService, DashboardStats } from "../../services/api";

export const StatCards = () => {
  const { data: session, status } = useSession();
  const [stats, setStats] = useState({
    totalPoints: 0,
    activitiesCompleted: 0,
    availableRewards: 0,
    loading: true
  });
  const [dashboardStats, setDashboardStats] = useState<DashboardStats | null>(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        // Get user points from session as fallback
        let userPoints = session?.user?.total_points || 0;
        
        // Only fetch additional stats if user is properly authenticated
        let activitiesCount = 0;
        let availableIncentives = 0;

        if (status === "authenticated" && session?.djangoAccessToken) {
          try {
            // Fetch dashboard stats with trends from new API
            const dashboardResponse = await apiService.getDashboardStats('30days', session.djangoAccessToken);
            if (dashboardResponse.data) {
              setDashboardStats(dashboardResponse.data);
              activitiesCount = dashboardResponse.data.current_period.activities_completed;
              // Use the current total points from dashboard stats (more up-to-date than session)
              userPoints = dashboardResponse.data.current_period.total_points;
              console.log('Updated total points from dashboard API:', userPoints, 'vs session:', session?.user?.total_points);
            }
          } catch (error) {
            console.warn('Failed to fetch dashboard stats, falling back to old method:', error);
            try {
              const activitiesResponse = await apiService.getPointsHistory(session.djangoAccessToken);
              activitiesCount = activitiesResponse.data?.length || 0;
            } catch (fallbackError) {
              console.warn('Failed to fetch activities:', fallbackError);
            }
          }

          try {
            // Use new rewards API
            const rewardsResponse = await apiService.getAvailableRewards(session.djangoAccessToken);
            availableIncentives = rewardsResponse.data?.filter(i => i.is_active)?.length || 0;
          } catch (error) {
            console.warn('Failed to fetch rewards, trying old endpoint:', error);
            try {
              const incentivesResponse = await apiService.getIncentives(session.djangoAccessToken);
              availableIncentives = incentivesResponse.data?.filter(i => i.is_active)?.length || 0;
            } catch (fallbackError) {
              console.warn('Failed to fetch incentives:', fallbackError);
            }
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

  if (stats.loading) {
    return (
      <>
        <LoadingCard title="Total Points" />
        <LoadingCard title="Activities Completed" />
        <LoadingCard title="Available Rewards" />
      </>
    );
  }

  return (
    <>
      <Card
        title="Total Points"
        value={stats.totalPoints.toString()}
        period="Current Total"
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
      <div className="flex mb-8 items-start justify-between">
        <div>
          <h3 className="text-slate-600 mb-3 text-sm font-medium">{title}</h3>
          <p className="text-4xl font-bold bg-gradient-to-r from-slate-800 to-slate-600 bg-clip-text text-transparent">{value}</p>
        </div>

        {trend && (
          <span
            className={`text-xs flex items-center gap-1.5 font-semibold px-3 py-2 rounded-full shadow-sm backdrop-blur-sm transition-all duration-200 ${
              trend.direction === "up"
                ? "bg-gradient-to-r from-emerald-100 to-green-100 text-emerald-700 border border-emerald-200/50"
                : "bg-gradient-to-r from-red-100 to-rose-100 text-red-700 border border-red-200/50"
            }`}
          >
            {trend.direction === "up" ? <FiTrendingUp className="text-sm" /> : <FiTrendingDown className="text-sm" />} 
            {Math.abs(trend.percentage).toFixed(1)}%
          </span>
        )}
      </div>

      <p className="text-xs text-slate-500 font-medium tracking-wide uppercase">{period}</p>
    </div>
  );
};
