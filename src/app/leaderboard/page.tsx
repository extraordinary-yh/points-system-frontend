'use client';

import React, { useState, useEffect } from 'react';
import { FiAward, FiUsers, FiTrendingUp, FiTrendingDown, FiMinus } from 'react-icons/fi';
import { apiService, LeaderboardData, LeaderboardEntry } from '../../services/api';
import { useSession } from 'next-auth/react';
import { Sidebar } from '@/components/Sidebar/Sidebar';
import { useSidebar } from '@/contexts/SidebarContext';
import { useOnboardingCheck } from '@/hooks/useOnboardingCheck';

const LeaderboardPage = () => {
  const { data: session, status } = useSession();
  const { userProfile, isLoading } = useOnboardingCheck();
  const { isCollapsed } = useSidebar();
  const [leaderboardData, setLeaderboardData] = useState<LeaderboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState<'all_time' | 'monthly' | 'weekly'>('all_time');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (status === 'loading') return; // Wait for session to load
    if (session?.djangoAccessToken) {
      fetchLeaderboard();
    }
  }, [period, session, status]);

    const fetchLeaderboard = async () => {
    try {
      setLoading(true);
      setError(null); // Clear previous errors
      
      // Get the auth token from the NextAuth session
      const token = session?.djangoAccessToken;
      if (!token) {
        setError('Authentication token not available');
        return;
      }
      
      const response = await apiService.getLeaderboard(10, period, token);
      
      if (response.data) {
        setLeaderboardData(response.data);
      } else {
        setError(response.error || 'Failed to fetch leaderboard data');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An unexpected error occurred';
      setError(`Error: ${errorMessage}`);
      console.error('Leaderboard fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return '🥇';
      case 2:
        return '🥈';
      case 3:
        return '🥉';
      default:
        return `#${rank}`;
    }
  };

  const getRankColor = (rank: number) => {
    switch (rank) {
      case 1:
        return 'from-yellow-400 to-yellow-600';
      case 2:
        return 'from-gray-300 to-gray-500';
      case 3:
        return 'from-amber-600 to-amber-800';
      default:
        return 'from-blue-50 to-blue-100';
    }
  };

  const getTrendIcon = (points: number) => {
    if (points > 0) return <FiTrendingUp className="text-green-500" />;
    if (points < 0) return <FiTrendingDown className="text-red-500" />;
    return <FiMinus className="text-gray-400" />;
  };

  // Loading skeleton components
  const Top3Skeleton = () => (
    <div className="mb-8">
      <div className="h-8 bg-gray-200 rounded w-48 mx-auto mb-6 animate-pulse"></div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-end">
        {[1, 2, 3].map((i) => (
          <div key={i} className="bg-gray-200 rounded-xl h-64 animate-pulse"></div>
        ))}
      </div>
    </div>
  );

  const RankingsSkeleton = () => (
    <div className="mb-8">
      <div className="flex items-center justify-between mb-6">
        <div className="h-8 bg-gray-200 rounded w-32 animate-pulse"></div>
        <div className="h-12 bg-gray-200 rounded-lg w-48 animate-pulse"></div>
      </div>
      <div className="bg-gray-200 rounded-xl h-96 animate-pulse"></div>
    </div>
  );

  const CurrentUserSkeleton = () => (
    <div className="mb-8">
      <div className="h-8 bg-gray-200 rounded w-40 mb-6 animate-pulse"></div>
      <div className="bg-gray-200 rounded-xl h-24 animate-pulse"></div>
    </div>
  );

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-stone-100">
        <div className="text-xl text-stone-600">
          Loading leaderboard...
        </div>
      </div>
    );
  }

  // useOnboardingCheck handles authentication and onboarding redirects
  if (!userProfile?.onboarding_completed) {
    return null; // Will redirect to onboarding
  }

  if (status === 'unauthenticated') {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 text-center">
            <p className="text-yellow-800">Please log in to view the leaderboard</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
            <p className="text-red-600">{error}</p>
            <button
              onClick={() => fetchLeaderboard()}
              className="mt-4 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <main className={`grid gap-4 p-4 transition-all duration-300 h-screen ${
      isCollapsed ? 'grid-cols-[64px,_1fr]' : 'grid-cols-[256px,_1fr]'
    }`}>
      <Sidebar />
      <div className="bg-white rounded-lg shadow h-full overflow-y-auto">
        {/* Page Header */}
        <div className="border-b px-4 mt-4 pb-4 border-stone-200">
            <div className="flex items-center justify-between p-0.5">
              <div>
                <span className="text-sm font-bold block">
                  🏆 Leaderboard
                </span>
                <span className="text-xs block text-stone-500">
                  Compete with your peers and climb the ranks through your activities and engagement!
                </span>
              </div>
              

            </div>
          </div>

        {/* Period Selector */}
        <div className="mb-6">
          <div className="bg-white rounded-xl shadow-sm p-3">
            <div className="flex bg-gray-100 rounded-lg p-1">
              {[
                { value: 'all_time', label: 'All Time' },
                { value: 'monthly', label: 'This Month' },
                { value: 'weekly', label: 'This Week' }
              ].map((option) => (
                <button
                  key={option.value}
                  onClick={() => setPeriod(option.value as any)}
                  className={`flex-1 px-4 py-2 text-sm font-medium rounded-md transition-all duration-200 ${
                    period === option.value
                      ? 'bg-white text-gray-900 shadow-sm' 
                      : 'text-gray-600 hover:text-gray-800'
                  }`}
                >
                  {option.label}
                </button>
              ))}
            </div>
            

          </div>
        </div>

        {/* Content Area - Show loading or actual content */}
        {loading ? (
          <>
            <Top3Skeleton />
            <RankingsSkeleton />
            <CurrentUserSkeleton />
          </>
        ) : leaderboardData ? (
          <>
            {/* Top 3 Podium - Bottom Aligned */}
            <div className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">🏆 Top Performers</h2>
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-end">
                {/* 2nd Place */}
                <div className="lg:order-1 order-2">
                  <div className="bg-gradient-to-br from-slate-50 via-white to-slate-100 rounded-xl shadow-sm border border-slate-200/50 backdrop-blur-sm p-6 text-center transform hover:scale-105 transition-transform">
                    <div className="text-6xl mb-4">🥈</div>
                    <div className="text-2xl font-bold text-gray-700 mb-2">
                      {leaderboardData.leaderboard[1]?.display_name || 'N/A'}
                    </div>
                    <div className="text-4xl font-bold text-gray-600 mb-2">
                      {leaderboardData.leaderboard[1]?.total_points || 0}
                    </div>
                    <div className="text-sm text-gray-500 mb-3">points</div>
                    <div className="flex items-center justify-center gap-2 text-sm">
                      {getTrendIcon(leaderboardData.leaderboard[1]?.points_this_period || 0)}
                      <span className="text-gray-600">
                        {leaderboardData.leaderboard[1]?.points_this_period || 0} this period
                      </span>
                    </div>
                  </div>
                </div>

                {/* 1st Place */}
                <div className="lg:order-2 order-1">
                  <div className="bg-gradient-to-br from-yellow-400 to-yellow-600 rounded-lg shadow-lg border border-yellow-300 p-6 text-center transform hover:scale-105 transition-transform">
                    <div className="text-8xl mb-4">🥇</div>
                    <div className="text-2xl font-bold text-white mb-2">
                      {leaderboardData.leaderboard[0]?.display_name || 'N/A'}
                    </div>
                    <div className="text-5xl font-bold text-white mb-2">
                      {leaderboardData.leaderboard[0]?.total_points || 0}
                    </div>
                    <div className="text-sm text-yellow-100 mb-3">points</div>
                    <div className="flex items-center justify-center gap-2 text-sm">
                      {getTrendIcon(leaderboardData.leaderboard[0]?.points_this_period || 0)}
                      <span className="text-yellow-100">
                        {leaderboardData.leaderboard[0]?.points_this_period || 0} this period
                      </span>
                    </div>
                  </div>
                </div>

                {/* 3rd Place */}
                <div className="lg:order-3 order-3">
                  <div className="bg-gradient-to-br from-slate-50 via-white to-slate-100 rounded-xl shadow-sm border border-slate-200/50 backdrop-blur-sm p-6 text-center transform hover:scale-105 transition-transform">
                    <div className="text-6xl mb-4">🥉</div>
                    <div className="text-2xl font-bold text-gray-700 mb-2">
                      {leaderboardData.leaderboard[2]?.display_name || 'N/A'}
                    </div>
                    <div className="text-4xl font-bold text-gray-600 mb-2">
                      {leaderboardData.leaderboard[2]?.total_points || 0}
                    </div>
                    <div className="text-sm text-gray-500 mb-3">points</div>
                    <div className="flex items-center justify-center gap-2 text-sm">
                      {getTrendIcon(leaderboardData.leaderboard[2]?.points_this_period || 0)}
                      <span className="text-gray-600">
                        {leaderboardData.leaderboard[2]?.points_this_period || 0} this period
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Rankings Section with Total Participants */}
            <div className="mb-8">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-900">📊 Rankings</h2>
                <div className="flex items-center gap-3 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg px-4 py-2 border border-blue-200">
                  <FiUsers className="text-blue-600" />
                  <span className="text-sm font-medium text-gray-700">Total Participants:</span>
                  <span className="text-lg font-bold text-blue-600">{leaderboardData.total_participants}</span>
                </div>
              </div>
              <div className="bg-gradient-to-br from-slate-50 via-white to-slate-100 rounded-xl shadow-sm border border-slate-200/50 backdrop-blur-sm overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Rank
                        </th>
                        <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          User
                        </th>
                        <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Total Points
                        </th>
                        <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          This Period
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {leaderboardData.leaderboard.slice(3, 10).map((entry, index) => (
                        <tr
                          key={entry.user_id}
                          className={`hover:bg-gray-50 transition-colors ${
                            entry.is_current_user ? 'bg-purple-50 border-l-4 border-l-purple-500' : ''
                          }`}
                        >
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <span className="text-lg font-semibold text-gray-900">
                                #{entry.rank}
                              </span>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <div className="flex-shrink-0 h-10 w-10">
                                <div className="h-10 w-10 rounded-full bg-purple-100 flex items-center justify-center">
                                  <span className="text-sm font-medium text-purple-600">
                                    {entry.display_name.charAt(0).toUpperCase()}
                                  </span>
                                </div>
                              </div>
                              <div className="ml-4">
                                <div className="text-sm font-medium text-gray-900">
                                  {entry.display_name}
                                  {entry.is_current_user && (
                                    <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                                      You
                                    </span>
                                  )}
                                </div>
                                <div className="text-sm text-gray-500">@{entry.username}</div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-semibold text-gray-900">
                              {entry.total_points.toLocaleString()}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center gap-2">
                              {getTrendIcon(entry.points_this_period)}
                              <span className={`text-sm font-medium ${
                                entry.points_this_period > 0 ? 'text-green-600' :
                                entry.points_this_period < 0 ? 'text-red-600' : 'text-gray-600'
                              }`}>
                                {entry.points_this_period > 0 ? '+' : ''}{entry.points_this_period}
                              </span>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            {/* Current User Rank */}
            {leaderboardData.current_user_rank && (
              <div className="mb-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">👤 Your Position</h2>
                <div className="bg-gradient-to-r from-purple-50 to-blue-50 rounded-xl shadow-sm border border-purple-200/50 backdrop-blur-sm p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="p-3 bg-purple-100 rounded-lg">
                        <FiAward className="text-2xl text-purple-600" />
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900">Your Current Rank</h3>
                        <p className="text-3xl font-bold text-purple-600">
                          #{leaderboardData.current_user_rank.rank}
                        </p>
                        <p className="text-sm text-gray-600">
                          {leaderboardData.current_user_rank.total_points.toLocaleString()} total points
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm text-gray-600 mb-1">This Period</div>
                      <div className="flex items-center gap-2">
                        {getTrendIcon(leaderboardData.current_user_rank.points_this_period)}
                        <span className={`text-lg font-semibold ${
                          leaderboardData.current_user_rank.points_this_period > 0 ? 'text-green-600' :
                          leaderboardData.current_user_rank.points_this_period < 0 ? 'text-red-600' : 'text-gray-600'
                        }`}>
                          {leaderboardData.current_user_rank.points_this_period > 0 ? '+' : ''}
                          {leaderboardData.current_user_rank.points_this_period}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </>
        ) : null}
      </div>
    </main>
  );
};

export default LeaderboardPage;
