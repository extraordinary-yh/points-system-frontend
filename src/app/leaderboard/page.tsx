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
        // Process the data to ensure period-specific ranking for current user
        const processedData = { ...response.data };
        
        // Find current user in the main leaderboard to get period-specific rank
        const userInLeaderboard = processedData.leaderboard.find(entry => entry.is_current_user);
        
        if (userInLeaderboard && processedData.current_user_rank) {
          // If user is in the visible leaderboard, use that rank (which is period-specific)
          // User found in leaderboard
          processedData.current_user_rank = {
            ...processedData.current_user_rank,
            rank: userInLeaderboard.rank
          };
        } else if (processedData.current_user_rank) {
          // User is not in visible top 10, but we have current_user_rank data
          // Log this for debugging to ensure backend is returning period-specific ranking
          // User not in top 10, using backend rank
        }
        
        setLeaderboardData(processedData);
      } else {
        setError(response.error || 'Failed to fetch leaderboard data');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An unexpected error occurred';
      setError(`Error: ${errorMessage}`);
      // Leaderboard fetch error
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

  // Generate consistent avatar colors based on user ID
  const getAvatarColors = (userId: string, isCurrentUser: boolean = false) => {
    if (isCurrentUser) {
      return {
        bg: 'bg-blue-500/30',
        text: 'text-blue-700'
      };
    }
    
    // Generate consistent colors based on user ID hash
    const hash = userId.split('').reduce((a, b) => {
      a = ((a << 5) - a) + b.charCodeAt(0);
      return a & a;
    }, 0);
    
          const colors = [
        { bg: 'bg-gray-100/40', text: 'text-gray-600' }
      ];
    
    return colors[Math.abs(hash) % colors.length];
  };

  // Loading skeleton components
  const Top3Skeleton = () => (
    <div className="mb-8 px-4">
      <div className="h-8 bg-gray-200 rounded w-48 mx-auto mb-6 animate-pulse"></div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-end">
        {[1, 2, 3].map((i) => (
          <div key={i} className="bg-gray-200 rounded-xl h-64 animate-pulse"></div>
        ))}
      </div>
    </div>
  );

  const RankingsSkeleton = () => (
    <div className="mb-8 px-4">
      <div className="flex items-center justify-between mb-6">
        <div className="h-8 bg-gray-200 rounded w-32 animate-pulse"></div>
        <div className="h-12 bg-gray-200 rounded-lg w-48 animate-pulse"></div>
      </div>
      <div className="bg-gray-200 rounded-xl h-96 animate-pulse"></div>
    </div>
  );

  const CurrentUserSkeleton = () => (
    <div className="mb-8 px-4">
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
        {/* Page Header - No Animation */}
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

        {/* Content with Animation */}
        <div className="leaderboard-content">

        {/* Period Selector */}
        <div className="leaderboard-period-selector mb-6">
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
            <div className="px-4">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-end">
                {/* 2nd Place - Silver Glow */}
                <div className="leaderboard-podium-card lg:order-1 order-2">
                  <div className="relative bg-gradient-to-br from-slate-50 via-white to-slate-100 rounded-xl shadow-sm border border-slate-200/50 backdrop-blur-sm p-6 text-center transform hover:scale-105 transition-all duration-300 silver-glow hover:silver-glow-hover">
                    {/* Silver Glow Effect */}
                    <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-silver-300 via-silver-200 to-silver-300 opacity-0 hover:opacity-30 transition-opacity duration-500 blur-sm"></div>
                    <div className="absolute inset-0 rounded-xl ring-2 ring-silver-300 ring-opacity-70 animate-pulse"></div>
                    <div className="relative z-10">
                      <div className="text-6xl mb-4">🥈</div>
                      <div className="text-2xl font-bold text-gray-700 mb-2">
                        {leaderboardData.leaderboard[1]?.display_name || 'N/A'}
                      </div>
                      <div className="text-4xl font-bold text-gray-600 mb-2">
                        {period === 'all_time' 
                          ? (leaderboardData.leaderboard[1]?.total_points || 0)
                          : (leaderboardData.leaderboard[1]?.points_this_period || 0)
                        }
                      </div>
                      <div className="text-sm text-gray-500 mb-3">points</div>
                      <div className="text-sm text-gray-500 mb-3">
                        earned {period === 'all_time' ? 'all time' : period === 'monthly' ? 'this month' : 'this week'}
                      </div>
                    </div>
                  </div>
                </div>

                {/* 1st Place - Gold Glow */}
                <div className="leaderboard-podium-card lg:order-2 order-1">
                  <div className="relative bg-gradient-to-br from-yellow-400 to-yellow-600 rounded-lg shadow-lg border border-yellow-300 p-6 text-center transform hover:scale-105 transition-all duration-300 gold-glow hover:gold-glow-hover">
                    {/* Gold Glow Effect */}
                    <div className="absolute inset-0 rounded-lg bg-gradient-to-r from-gold-300 via-gold-400 to-gold-300 opacity-0 hover:opacity-30 transition-opacity duration-500 blur-sm"></div>
                    <div className="absolute inset-0 rounded-lg ring-2 ring-gold-400 ring-opacity-70 animate-pulse"></div>
                    <div className="relative z-10">
                      <div className="text-8xl mb-4">🥇</div>
                      <div className="text-2xl font-bold text-white mb-2">
                        {leaderboardData.leaderboard[0]?.display_name || 'N/A'}
                      </div>
                      <div className="text-4xl font-bold text-white mb-2">
                        {period === 'all_time' 
                          ? (leaderboardData.leaderboard[0]?.total_points || 0)
                          : (leaderboardData.leaderboard[0]?.points_this_period || 0)
                        }
                      </div>
                      <div className="text-sm text-yellow-100 mb-3">points</div>
                      <div className="text-sm text-yellow-100 mb-3">
                        earned {period === 'all_time' ? 'all time' : period === 'monthly' ? 'this month' : 'this week'}
                      </div>
                    </div>
                  </div>
                </div>

                {/* 3rd Place - Bronze Glow */}
                <div className="leaderboard-podium-card lg:order-3 order-3">
                  <div className="relative bg-gradient-to-br from-slate-50 via-white to-slate-100 rounded-xl shadow-sm border border-slate-200/50 backdrop-blur-sm p-6 text-center transform hover:scale-105 transition-all duration-300 bronze-glow hover:bronze-glow-hover">
                    {/* Bronze Glow Effect */}
                    <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-amber-600 via-amber-500 to-amber-600 opacity-0 hover:opacity-30 transition-opacity duration-500 blur-sm"></div>
                    <div className="absolute inset-0 rounded-xl ring-2 ring-amber-600 ring-opacity-70 animate-pulse"></div>
                    <div className="relative z-10">
                      <div className="text-6xl mb-4">🥉</div>
                      <div className="text-2xl font-bold text-gray-700 mb-2">
                        {leaderboardData.leaderboard[2]?.display_name || 'N/A'}
                      </div>
                      <div className="text-4xl font-bold text-gray-600 mb-2">
                        {period === 'all_time' 
                          ? (leaderboardData.leaderboard[2]?.total_points || 0)
                          : (leaderboardData.leaderboard[2]?.points_this_period || 0)
                        }
                      </div>
                      <div className="text-sm text-gray-500 mb-3">points</div>
                      <div className="text-sm text-gray-500 mb-3">
                        earned {period === 'all_time' ? 'all time' : period === 'monthly' ? 'this month' : 'this week'}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Thin Status Bar */}
              <div className="mt-4 mb-2 flex items-center justify-center text-xs text-gray-500 pt-2">
                <div className="flex items-center gap-6">
                  <span className="flex items-center gap-1">
                    <FiUsers className="text-gray-400" />
                    {leaderboardData.total_participants} participants
                  </span>
                  <span>•</span>
                  <span className="flex items-center gap-1">
                    <span>Your Rank:</span>
                    <span className="font-medium text-gray-700">
                      {leaderboardData.current_user_rank?.rank ? `#${leaderboardData.current_user_rank.rank}` : 'N/A'}
                    </span>
                  </span>

                </div>
              </div>
            </div>

            {/* Rankings Section */}
            <div className="mb-8 px-4">
              <div className="bg-gradient-to-br from-slate-50 via-white to-slate-100 rounded-xl shadow-sm border border-slate-200/50 backdrop-blur-sm overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gradient-to-r from-slate-50/80 to-white/80 backdrop-blur-sm">
                      <tr className="text-xs font-semibold text-slate-600 uppercase tracking-wider">
                        <th className="px-6 py-4 text-left border-b border-slate-200/50">
                          Rank
                        </th>
                        <th className="pl-8 pr-0 py-4 text-left border-b border-slate-200/50">
                          User
                        </th>
                        <th className="pl-[15px] pr-6 py-4 text-left border-b border-slate-200/50">
                          Total Points
                        </th>
                        <th className="px-6 py-4 text-left border-b border-slate-200/50">
                          This Period
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-slate-100/50">
                      {leaderboardData.leaderboard.slice(3, 10).map((entry, index) => (
                        <tr
                          key={entry.user_id}
                          className={`leaderboard-table-row transition-all duration-200 hover:bg-slate-50/50 ${
                            entry.is_current_user ? 'border-l-4 border-l-purple-400 shadow-[0_0_20px_rgba(147,51,234,0.15)]' : index % 2 ? "bg-slate-50/30" : ""
                          }`}
                        >
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <span className="text-lg font-semibold text-slate-800">
                                {entry.rank}
                              </span>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <div className="flex-shrink-0 h-10 w-10">
                                {(() => {
                                  const avatarColors = getAvatarColors(entry.user_id.toString(), entry.is_current_user);
                                  return (
                                    <div className={`h-10 w-10 rounded-full ${avatarColors.bg} flex items-center justify-center`}>
                                      <span className={`text-sm font-medium ${avatarColors.text}`}>
                                        {entry.display_name.charAt(0).toUpperCase()}
                                      </span>
                                    </div>
                                  );
                                })()}
                              </div>
                              <div className="ml-4">
                                <div className="text-sm font-medium text-slate-800">
                                  {entry.display_name}
                                  {entry.is_current_user && (
                                    <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                      You
                                    </span>
                                  )}
                                </div>
                                <div className="text-sm text-slate-600">@{entry.username}</div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-semibold text-slate-800">
                              {entry.total_points.toLocaleString()}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center gap-2">
                              {getTrendIcon(entry.points_this_period)}
                              <span className={`text-sm font-medium px-2 py-1 rounded-full text-xs border ${
                                entry.points_this_period > 0 
                                  ? 'text-emerald-600 bg-gradient-to-r from-emerald-50 to-green-50 border-emerald-200/50' 
                                  : entry.points_this_period < 0 
                                    ? 'text-red-600 bg-gradient-to-r from-red-50 to-pink-50 border-red-200/50' 
                                    : 'text-gray-600 bg-gradient-to-r from-gray-50 to-slate-50 border-gray-200/50'
                              }`}>
                                {entry.points_this_period > 0 ? '+' : ''}{entry.points_this_period}
                              </span>
                            </div>
                          </td>
                        </tr>
                      ))}
                      
                      {/* Visual separator row */}
                      {leaderboardData.current_user_rank && (
                        <>
                          <tr className="border-t border-gray-100 bg-gradient-to-r from-gray-50/20 to-slate-50/20">
                            <td colSpan={4} className="px-6 py-2">
                              <div className="flex items-center justify-center">
                                <div className="text-xs font-medium text-gray-400">
                                  Your Position
                                </div>
                              </div>
                            </td>
                          </tr>
                          
                          {/* Current user row */}
                          <tr className="leaderboard-current-user bg-gradient-to-r from-blue-50/40 to-indigo-50/40 border-l-2 border-l-blue-400/60 shadow-[0_0_15px_rgba(59,130,246,0.1)] hover:from-blue-50/60 hover:to-indigo-50/60 transition-all duration-300">
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="flex items-center">
                                <span className="text-lg font-semibold text-blue-800">
                                  {leaderboardData.current_user_rank.rank}
                                </span>
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="flex items-center">
                                <div className="flex-shrink-0 h-10 w-10">
                                  {(() => {
                                    const avatarColors = getAvatarColors(leaderboardData.current_user_rank.user_id.toString(), true);
                                    return (
                                      <div className={`h-10 w-10 rounded-full ${avatarColors.bg} flex items-center justify-center`}>
                                        <span className={`text-sm font-medium ${avatarColors.text}`}>
                                          {leaderboardData.current_user_rank.display_name.charAt(0).toUpperCase()}
                                        </span>
                                      </div>
                                    );
                                  })()}
                                </div>
                                <div className="ml-4">
                                  <div className="text-sm font-medium text-blue-800">
                                    {leaderboardData.current_user_rank.display_name}
                                    <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                      You
                                    </span>
                                  </div>
                                  <div className="text-sm text-blue-600">@{leaderboardData.current_user_rank.username}</div>
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm font-semibold text-blue-800">
                                {leaderboardData.current_user_rank.total_points.toLocaleString()}
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="flex items-center gap-2">
                                {getTrendIcon(leaderboardData.current_user_rank.points_this_period)}
                                <span className={`text-sm font-medium px-2 py-1 rounded-full text-xs border ${
                                  leaderboardData.current_user_rank.points_this_period > 0 
                                    ? 'text-emerald-600 bg-gradient-to-r from-emerald-50 to-green-50 border-emerald-200/50' 
                                    : leaderboardData.current_user_rank.points_this_period < 0 
                                      ? 'text-red-600 bg-gradient-to-r from-red-50 to-pink-50 border-red-200/50' 
                                      : 'text-gray-600 bg-gradient-to-r from-gray-50 to-slate-50 border-gray-200/50'
                                }`}>
                                  {leaderboardData.current_user_rank.points_this_period > 0 ? '+' : ''}{leaderboardData.current_user_rank.points_this_period}
                                </span>
                              </div>
                            </td>
                          </tr>
                        </>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>



                        {/* Current User Rank section removed - now using properly aligned table format above */}
          </>
        ) : null}
        </div>
      </div>
    </main>
  );
};

export default LeaderboardPage;

