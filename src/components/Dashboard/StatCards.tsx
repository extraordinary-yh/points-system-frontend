import React, { useState, useEffect } from "react";
import { FiTrendingDown, FiTrendingUp } from "react-icons/fi";
import { useSession } from "next-auth/react";
import { apiService } from "../../services/api";

export const StatCards = () => {
  const { data: session, status } = useSession();
  const [stats, setStats] = useState({
    totalPoints: 0,
    activitiesCompleted: 0,
    availableRewards: 0,
    loading: true
  });

  useEffect(() => {
    const fetchStats = async () => {
      try {
        // Get user points from session - this is the primary source
        const userPoints = session?.user?.total_points || 0;
        
        // Only fetch additional stats if user is properly authenticated
        let activitiesCount = 0;
        let availableIncentives = 0;

        if (status === "authenticated" && session?.djangoAccessToken) {
          try {
            const activitiesResponse = await apiService.getPointsHistory(session.djangoAccessToken);
            activitiesCount = activitiesResponse.data?.length || 0;
          } catch (error) {
            console.warn('Failed to fetch activities:', error);
          }

          try {
            const incentivesResponse = await apiService.getIncentives(session.djangoAccessToken);
            availableIncentives = incentivesResponse.data?.filter(i => i.is_active)?.length || 0;
          } catch (error) {
            console.warn('Failed to fetch incentives:', error);
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
        pillText="2.75%"
        trend="up"
        period="Current Total"
      />
      <Card
        title="Activities Completed"
        value={stats.activitiesCompleted.toString()}
        pillText="1.01%"
        trend="up"
        period="All Time"
      />
      <Card
        title="Available Rewards"
        value={stats.availableRewards.toString()}
        pillText="60.75%"
        trend="up"
        period="Ready to Redeem"
      />
    </>
  );
};

const LoadingCard = ({ title }: { title: string }) => {
  return (
    <div className="col-span-4 p-4 rounded border border-stone-300">
      <div className="flex mb-8 items-start justify-between">
        <div>
          <h3 className="text-stone-500 mb-2 text-sm">{title}</h3>
          <div className="w-16 h-8 bg-stone-200 rounded animate-pulse"></div>
        </div>
        <div className="w-12 h-6 bg-stone-200 rounded animate-pulse"></div>
      </div>
      <div className="w-20 h-4 bg-stone-200 rounded animate-pulse"></div>
    </div>
  );
};

const Card = ({
  title,
  value,
  pillText,
  trend,
  period,
}: {
  title: string;
  value: string;
  pillText: string;
  trend: "up" | "down";
  period: string;
}) => {
  return (
    <div className="col-span-4 p-4 rounded border border-stone-300">
      <div className="flex mb-8 items-start justify-between">
        <div>
          <h3 className="text-stone-500 mb-2 text-sm">{title}</h3>
          <p className="text-3xl font-semibold">{value}</p>
        </div>

        <span
          className={`text-xs flex items-center gap-1 font-medium px-2 py-1 rounded ${
            trend === "up"
              ? "bg-green-100 text-green-700"
              : "bg-red-100 text-red-700"
          }`}
        >
          {trend === "up" ? <FiTrendingUp /> : <FiTrendingDown />} {pillText}
        </span>
      </div>

      <p className="text-xs text-stone-500">{period}</p>
    </div>
  );
};
