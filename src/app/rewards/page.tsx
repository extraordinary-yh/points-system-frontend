'use client';
import { useSession } from "next-auth/react";
import { useState, useEffect } from "react";
import { Sidebar } from "@/components/Sidebar/Sidebar";
import { SidebarProvider, useSidebar } from "@/contexts/SidebarContext";
import { apiService, User, Incentive, Redemption } from "@/services/api";
import { useOnboardingCheck } from "@/hooks/useOnboardingCheck";
import { refreshDashboardData } from "@/hooks/useSharedDashboardData";
import { refreshStatCards } from "@/components/Dashboard/StatCards";
import { Lock, Check, Gift, Trophy, Star, Heart, Zap, Award } from "lucide-react";

export default function RewardsPage() {
  const { data: session } = useSession();
  const { userProfile, isLoading } = useOnboardingCheck();
  const { isCollapsed } = useSidebar();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-stone-100">
        <div className="text-xl text-stone-600">
          Loading rewards...
        </div>
      </div>
    );
  }

  // useOnboardingCheck handles authentication and onboarding redirects
  if (!userProfile?.onboarding_completed) {
    return null;
  }

  return (
    <main className={`grid gap-4 p-4 transition-all duration-300 h-screen ${
      isCollapsed ? 'grid-cols-[64px,_1fr]' : 'grid-cols-[256px,_1fr]'
    }`}>
      <Sidebar />
      <div className="bg-white rounded-lg pb-4 shadow h-full overflow-y-auto">
        <RewardsContent />
      </div>
    </main>
  );
}

const RewardsContent = () => {
  const { data: session } = useSession();
  const [rewards, setRewards] = useState<Incentive[]>([]);
  const [redemptionHistory, setRedemptionHistory] = useState<Redemption[]>([]);
  const [currentUserPoints, setCurrentUserPoints] = useState<number>(0);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'available' | 'history'>('available');
  const [redeeming, setRedeeming] = useState<number | null>(null);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [redemptionSuccess, setRedemptionSuccess] = useState<{
    rewardName: string;
    pointsSpent: number;
    remainingPoints: number;
  } | null>(null);

  useEffect(() => {
    const fetchRewardsData = async () => {
      if (session?.djangoAccessToken) {
        try {
          // Fetch fresh user profile to get current points (single source of truth)
          const userProfileResponse = await apiService.getProfile(session.djangoAccessToken);
          if (userProfileResponse.data?.total_points !== undefined) {
            setCurrentUserPoints(userProfileResponse.data.total_points);
            // Fresh user points loaded
          }

          // Try new API first
          let rewardsResponse;
          try {
            rewardsResponse = await apiService.getAvailableRewards(session.djangoAccessToken);
          } catch (error) {
            console.warn('New rewards API failed, trying fallback:', error);
            // Fallback to old API
            rewardsResponse = await apiService.getIncentives(session.djangoAccessToken);
          }
          
          let historyResponse;
          try {
            historyResponse = await apiService.getRedemptionHistory(session.djangoAccessToken);
          } catch (error) {
            console.warn('History API failed, trying fallback:', error);
            // Fallback to old API
            historyResponse = await apiService.getRedemptions(session.djangoAccessToken);
          }
          
          // Handle both direct array and object with rewards property
          let rewardsArray: Incentive[] = [];
          
          if (rewardsResponse.data) {
            if (Array.isArray(rewardsResponse.data)) {
              // Direct array (old API format)
              rewardsArray = rewardsResponse.data;
            } else if ((rewardsResponse.data as any).rewards && Array.isArray((rewardsResponse.data as any).rewards)) {
              // Object with rewards property (new API format)
              rewardsArray = (rewardsResponse.data as any).rewards;
            } else {
              console.warn('❌ Rewards data is not in expected format:', rewardsResponse.data);
            }
          } else {
            console.warn('❌ No rewards data received');
          }
          
          setRewards(rewardsArray);
          
          // Handle both direct array and object with redemptions property
          let historyArray: Redemption[] = [];
          
          if (historyResponse?.data) {
            if (Array.isArray(historyResponse.data)) {
              // Direct array (old API format)
              historyArray = historyResponse.data;
            } else if ((historyResponse.data as any).redemptions && Array.isArray((historyResponse.data as any).redemptions)) {
              // Object with redemptions property (new API format)
              historyArray = (historyResponse.data as any).redemptions;
            } else {
              console.warn('❌ History data is not in expected format:', historyResponse.data);
            }
          } else {
            console.warn('❌ No history data received');
          }
          
          setRedemptionHistory(historyArray);
        } catch (error) {
          // Failed to fetch rewards data
          setRewards([]);
          setRedemptionHistory([]);
        }
      } else {
        console.warn('❌ No session or token available');
      }
      setLoading(false);
    };

    fetchRewardsData();
  }, [session]);

  // Handle escape key to close modal
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && showSuccessModal) {
        setShowSuccessModal(false);
      }
    };

    if (showSuccessModal) {
      document.addEventListener('keydown', handleEscape);
      return () => document.removeEventListener('keydown', handleEscape);
    }
  }, [showSuccessModal]);

  const handleRedeem = async (rewardId: number) => {
    if (!session?.djangoAccessToken) return;
    
    setRedeeming(rewardId);
    try {
      const response = await apiService.redeemReward(rewardId, {}, session.djangoAccessToken);
      if (response.data) {
        // Refresh dashboard data to update points charts and graphs
        await refreshDashboardData(true);
        

        // Refresh stat cards to update total points and available rewards
        await refreshStatCards();
        
        // Refresh data after successful redemption
        const [userProfileResponse, rewardsResponse, historyResponse] = await Promise.all([
          apiService.getProfile(session.djangoAccessToken), // Fresh user points
          apiService.getAvailableRewards(session.djangoAccessToken),
          apiService.getRedemptionHistory(session.djangoAccessToken)
        ]);

        // Update current user points from fresh API data
        if (userProfileResponse.data?.total_points !== undefined) {
          setCurrentUserPoints(userProfileResponse.data.total_points);
          // Updated user points after redemption
        }
        
        // Handle object structure for refreshed data too
        if (rewardsResponse.data) {
          const refreshedRewards = Array.isArray(rewardsResponse.data) 
            ? rewardsResponse.data 
            : (rewardsResponse.data as any).rewards || [];
          setRewards(refreshedRewards);
        }
        
        if (historyResponse.data) {
          const refreshedHistory = Array.isArray(historyResponse.data)
            ? historyResponse.data
            : (historyResponse.data as any).redemptions || [];
          setRedemptionHistory(refreshedHistory);
        }
        
        // Get the redeemed reward details for the success modal
        const redeemedReward = rewards.find(r => r.id === rewardId);
        if (redeemedReward && userProfileResponse.data?.total_points !== undefined) {
          setRedemptionSuccess({
            rewardName: redeemedReward.name,
            pointsSpent: redeemedReward.points_required,
            remainingPoints: userProfileResponse.data.total_points
          });
          setShowSuccessModal(true);
        } else {
          // Fallback: switch to history tab if we can't show modal
          setActiveTab('history');
        }
      }
    } catch (error) {
      // Failed to redeem reward
      alert('Failed to redeem reward. Please try again.');
    } finally {
      setRedeeming(null);
    }
  };

  const userPoints = currentUserPoints;
  const maxRewardPoints = Math.max(...rewards.map(r => r.points_required), 1000);

  // Get locked rewards for milestones (show all rewards user can't afford yet, regardless of can_redeem status)
  const lockedMilestones = rewards
    .filter(r => {
      const isAvailable = r.stock_available === undefined || r.stock_available > 0;
      const isUnaffordable = userPoints < r.points_required;
      // Include all rewards that are unaffordable and in stock, regardless of can_redeem status
      return isAvailable && isUnaffordable;
    })
    .sort((a, b) => a.points_required - b.points_required)
    .slice(0, 8); // Show more milestones since we want to see all goals



  return (
    <div className="space-y-6">
      {/* Page Header - No Animation */}
      <div className="border-b px-4 my-4 pb-4 border-stone-200">
        <div className="flex items-center justify-between p-0.5">
          <div>
            <span className="text-sm font-bold block">
              🎁 Claim Your Rewards
            </span>
            <span className="text-xs block text-stone-500">
              Earn points through your activities and unlock amazing rewards to enhance your student experience!
            </span>
          </div>
        </div>
      </div>

      {/* Content with Animation */}
      <div className="content-fade-in-scale">
        {/* Points Progress Bar */}
        <div className="mx-6 p-6 rounded-2xl bg-gradient-to-br from-slate-50 via-white to-slate-100 shadow-xl border border-slate-200/50 backdrop-blur-sm hover:shadow-2xl transition-all duration-300">
          <h2 className="text-lg font-semibold text-slate-800 mb-4">Your Progress</h2>
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-sm text-slate-600">Current Points</span>
            <span className="font-semibold text-slate-800">{userPoints}</span>
          </div>
          
          {/* Progress Bar with Milestones */}
          <div className="relative">
            <div className="w-full bg-gray-200 rounded-full h-3">
              <div
                className="bg-gradient-to-r from-purple-500 to-blue-500 h-3 rounded-full transition-all duration-300"
                style={{ width: `${Math.min((userPoints / maxRewardPoints) * 100, 100)}%` }}
              ></div>
            </div>
            
            {/* Milestone markers - only show if rewards have loaded */}
            {!loading && (
              lockedMilestones.length > 0 ? lockedMilestones.map((milestone, index) => {
                const position = Math.min((milestone.points_required / maxRewardPoints) * 100, 100);
                const isNext = index === 0; // First milestone is the next goal
                
                return (
                  <div
                    key={milestone.id}
                    className="absolute top-0 transform -translate-x-1/2 group"
                    style={{ left: `${position}%` }}
                  >
                    <div
                      className={`w-4 h-4 rounded-full border-2 ${
                        isNext 
                          ? 'bg-purple-500 border-purple-600 shadow-lg shadow-purple-500/50' 
                          : 'bg-white border-purple-400 shadow-md'
                      } transition-all duration-200 hover:scale-110 cursor-pointer`}
                      title={milestone.name}
                    ></div>
                    
                    {/* Hover tooltip */}
                    <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 bg-gray-800 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap z-10 pointer-events-none">
                      {milestone.name}
                    </div>
                  </div>
                );
              }) : (
                // Fallback milestones only if rewards have loaded but no locked rewards available
                rewards.length === 0 ? null : [500, 750, 1000].filter(points => points > userPoints).map((points, index) => {
                  const position = Math.min((points / maxRewardPoints) * 100, 100);
                  const isNext = index === 0;
                  
                  return (
                    <div
                      key={`fallback-${points}`}
                      className="absolute top-0 transform -translate-x-1/2 group"
                      style={{ left: `${position}%` }}
                    >
                      <div
                        className={`w-4 h-4 rounded-full border-2 ${
                          isNext 
                            ? 'bg-purple-500 border-purple-600 shadow-lg shadow-purple-500/50' 
                            : 'bg-white border-purple-400 shadow-md'
                        } transition-all duration-200 hover:scale-110 cursor-pointer`}
                        title="Goal"
                      ></div>
                      
                      {/* Hover tooltip */}
                      <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 bg-gray-800 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap z-10 pointer-events-none">
                        Goal
                      </div>
                    </div>
                  );
                })
              )
            )}
          </div>
          
          {/* Milestone labels */}
          <div className="relative mt-2">
            <div className="flex justify-between items-center text-xs text-slate-500 relative">
              <span>0</span>
              <span>{maxRewardPoints} (Max Reward)</span>
              
              {/* Milestone point values positioned at same level - only show if rewards have loaded */}
              {!loading && (
                lockedMilestones.length > 0 ? lockedMilestones.map((milestone, index) => {
                  const position = Math.min((milestone.points_required / maxRewardPoints) * 100, 100);
                  const isNext = index === 0;
                  
                  return (
                    <span
                      key={`label-${milestone.id}`}
                      className={`absolute transform -translate-x-1/2 text-xs font-medium ${
                        isNext ? 'text-purple-600' : 'text-slate-500'
                      }`}
                      style={{ left: `${position}%` }}
                    >
                      {milestone.points_required}
                    </span>
                  );
                }) : (
                  // Fallback milestone labels only if rewards have loaded but no locked rewards available
                  rewards.length === 0 ? null : [500, 750, 1000].filter(points => points > userPoints).map((points, index) => {
                    const position = Math.min((points / maxRewardPoints) * 100, 100);
                    const isNext = index === 0;
                    
                    return (
                      <span
                        key={`fallback-label-${points}`}
                        className={`absolute transform -translate-x-1/2 text-xs font-medium ${
                          isNext ? 'text-purple-600' : 'text-slate-500'
                        }`}
                        style={{ left: `${position}%` }}
                      >
                        {points}
                      </span>
                    );
                  })
                )
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        {/* Tab Navigation */}
        <div className="flex bg-gray-100 rounded-lg p-1 mb-6">
          <button
            onClick={() => setActiveTab('available')}
            className={`flex-1 px-4 py-2 text-sm font-medium rounded-md transition-all duration-200 ${
              activeTab === 'available' 
                ? 'bg-white text-gray-900 shadow-sm' 
                : 'text-gray-600 hover:text-gray-800'
            }`}
          >
            Available Rewards ({rewards.length})
          </button>
          <button
            onClick={() => setActiveTab('history')}
            className={`flex-1 px-4 py-2 text-sm font-medium rounded-md transition-all duration-200 ${
              activeTab === 'history' 
                ? 'bg-white text-gray-900 shadow-sm' 
                : 'text-gray-600 hover:text-gray-800'
            }`}
          >
            Redemption History ({redemptionHistory.length})
          </button>
        </div>
        
        {/* Tab Content */}
        <div>
        {loading ? (
          <div className="text-center py-8 text-stone-500">Loading rewards...</div>
        ) : activeTab === 'available' ? (
          <AvailableRewards 
            rewards={rewards} 
            userPoints={currentUserPoints}
            onRedeem={handleRedeem}
            redeeming={redeeming}
            redemptionHistory={redemptionHistory}
          />
        ) : (
          <RedemptionHistory history={redemptionHistory} />
        )}
        </div>
      </div>
      </div>

      {/* Redemption Success Modal */}
      {showSuccessModal && redemptionSuccess && (
        <div 
          className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
          onClick={() => setShowSuccessModal(false)}
        >
          <div 
            className="bg-white/90 backdrop-blur-md rounded-2xl shadow-2xl border border-white/20 p-8 max-w-md w-full mx-4 animate-in fade-in-0 zoom-in-95 duration-300"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-gradient-to-br from-green-400 to-emerald-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">🎉</span>
              </div>
              <h3 className="text-2xl font-bold text-slate-800 mb-2">
                Reward Redemption Successful!
              </h3>
              <p className="text-slate-600">
                Your redemption request has been sent to admin
              </p>
            </div>

            {/* Reward Details */}
            <div className="space-y-4 mb-6">
              <div className="bg-slate-50/80 rounded-lg p-4">
                <h4 className="font-semibold text-slate-800 mb-2">Reward Claimed:</h4>
                <p className="text-slate-700">{redemptionSuccess.rewardName}</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="bg-red-50/80 rounded-lg p-4 text-center">
                  <div className="text-sm text-red-600 font-medium">Points Spent</div>
                  <div className="text-xl font-bold text-red-700">-{redemptionSuccess.pointsSpent}</div>
                </div>
                <div className="bg-green-50/80 rounded-lg p-4 text-center">
                  <div className="text-sm text-green-600 font-medium">Remaining Points</div>
                  <div className="text-xl font-bold text-green-700">{redemptionSuccess.remainingPoints}</div>
                </div>
              </div>
            </div>

            {/* Timeline & Next Steps */}
            <div className="bg-blue-50/80 rounded-lg p-4 mb-6">
              <h4 className="font-semibold text-blue-800 mb-2 flex items-center">
                <span className="mr-2">⏰</span>
                What happens next?
              </h4>
              <ul className="text-sm text-blue-700 space-y-1">
                <li>• Admin will process your request within 1-5 business days</li>
                <li>• You'll receive a confirmation message on Discord</li>
                <li>• Check your redemption history for status updates</li>
              </ul>
            </div>

            {/* Actions */}
            <div className="flex gap-3">
              <button
                onClick={() => {
                  setShowSuccessModal(false);
                  setActiveTab('history');
                }}
                className="flex-1 py-3 px-4 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg font-medium hover:from-blue-600 hover:to-blue-700 transition-all duration-200 shadow-lg hover:shadow-xl"
              >
                View History
              </button>
              <button
                onClick={() => setShowSuccessModal(false)}
                className="flex-1 py-3 px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg font-medium transition-all duration-200"
              >
                Continue Shopping
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const AvailableRewards = ({ 
  rewards, 
  userPoints, 
  onRedeem, 
  redeeming,
  redemptionHistory 
}: {
  rewards: Incentive[];
  userPoints: number;
  onRedeem: (id: number) => void;
  redeeming: number | null;
  redemptionHistory: Redemption[];
}) => {
  // Helper function to get reward icon based on name/category
  const getRewardIcon = (name: string) => {
    const lowerName = name.toLowerCase();
    if (lowerName.includes('coffee')) return Heart;
    if (lowerName.includes('study') || lowerName.includes('room')) return Star;
    if (lowerName.includes('library') || lowerName.includes('book')) return Zap;
    if (lowerName.includes('discount') || lowerName.includes('store')) return Gift;
    if (lowerName.includes('registration') || lowerName.includes('priority')) return Trophy;
    if (lowerName.includes('parking')) return Award;
    return Gift; // Default icon
  };

  // Helper function to get reward gradient based on status
  const getRewardGradient = (status: string) => {
    switch (status) {
      case 'claimed': return 'from-pink-500 to-rose-500';
      case 'available': return 'from-blue-500 to-blue-600';
      case 'next_goal': return 'from-blue-500 to-purple-500';
      case 'unavailable': return 'from-gray-400 to-gray-500';
      default: return 'from-gray-400 to-gray-500';
    }
  };

  // Helper function to check if a reward has been claimed by the current user
  const isRewardClaimed = (reward: Incentive): boolean => {
    return redemptionHistory.some(redemption => {
      // Check multiple ways a redemption can match a reward:
      // 1. By incentive.id (old API format)
      if (redemption.incentive?.id === reward.id) return true;
      
      // 2. By reward name matching (fallback method)
      if (redemption.reward?.name === reward.name) return true;
      if (redemption.incentive?.name === reward.name) return true;
      
      // 3. By any additional ID fields that might exist
      const redeemedId = (redemption as any).reward_id || (redemption as any).incentive_id;
      if (redeemedId === reward.id) return true;
      
      return false;
    });
  };

  // Helper function to determine reward status
  const getRewardStatus = (reward: Incentive): 'locked' | 'available' | 'claimed' | 'unavailable' | 'next_goal' => {
    // Check if out of stock first
    if (reward.stock_available !== undefined && reward.stock_available <= 0) {
      return 'unavailable';
    }
    
    // Check if already redeemed/claimed by checking redemption history
    if (isRewardClaimed(reward)) {
      return 'claimed';
    }
    
    // Prioritize user having enough points over backend can_redeem restrictions
    if (userPoints >= reward.points_required && 
        (reward.stock_available === undefined || reward.stock_available > 0)) {
      return 'available';
    }
    
    // Find the next immediate locked reward (lowest points requirement that user can't afford yet)
    // Use the same logic as the tracker bar - regardless of can_redeem status
    const lockedRewards = rewards.filter(r => {
      const isAvailable = r.stock_available === undefined || r.stock_available > 0;
      const isUnaffordable = userPoints < r.points_required;
      const notClaimed = !isRewardClaimed(r);
      // Include all rewards that are unaffordable, in stock, and not claimed
      return isAvailable && isUnaffordable && notClaimed;
    }).sort((a, b) => a.points_required - b.points_required);
    
    // Only the first (lowest points) locked reward should be "next_goal"
    if (lockedRewards.length > 0 && lockedRewards[0].id === reward.id) {
      return 'next_goal';
    }
    
    // All other locked rewards should be "locked"
    return 'locked';
  };

  // Helper function to get card className based on status
  const getCardClassName = (status: 'locked' | 'available' | 'claimed' | 'unavailable' | 'next_goal') => {
    switch (status) {
      case 'locked': return 'glass-card-locked';
      case 'available': return 'glass-card-available';
      case 'claimed': return 'glass-card-claimed';
      case 'unavailable': return 'glass-card-unavailable';
      case 'next_goal': return 'glass-card-next-goal';
      default: return 'glass-card';
    }
  };

  // Helper function to get icon style
  const getIconStyle = (status: 'locked' | 'available' | 'claimed' | 'unavailable' | 'next_goal', gradient: string) => {
    if (status === 'unavailable') {
      return 'bg-gray-400 text-white';
    }
    if (status === 'locked') {
      return 'bg-gradient-to-br from-purple-400 to-purple-500 text-white';
    }
    if (status === 'claimed') {
      return 'bg-gradient-to-br from-emerald-400 to-emerald-500 text-white';
    }
    return `bg-gradient-to-br ${gradient} text-white`;
  };

  if (!Array.isArray(rewards) || rewards.length === 0) {
    return (
      <div className="text-center py-8 text-stone-500">
        <div className="text-4xl mb-2">🎁</div>
        <p>No rewards available</p>
        <p className="text-sm">Check back later for exciting rewards!</p>
      </div>
    );
  }

  // Sort rewards to show out-of-stock items at the bottom
  const sortedRewards = [...rewards].sort((a, b) => {
    const statusA = getRewardStatus(a);
    const statusB = getRewardStatus(b);
    
    // If one is unavailable and the other isn't, unavailable goes to bottom
    if (statusA === 'unavailable' && statusB !== 'unavailable') return 1;
    if (statusB === 'unavailable' && statusA !== 'unavailable') return -1;
    
    // Otherwise maintain original order
    return 0;
  });

  // Calculate status for all rewards once to ensure consistency
  const rewardStatuses = sortedRewards.map(reward => ({
    reward,
    status: getRewardStatus(reward)
  }));



  return (
    <div className="rewards-grid grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {rewardStatuses.map(({ reward, status }) => {
        const IconComponent = getRewardIcon(reward.name);
        const gradient = getRewardGradient(status);

        return (
          <div
            key={reward.id}
            data-reward-id={reward.id}
            className={`${getCardClassName(status)} p-6 transition-all duration-300 hover:scale-105 flex flex-col h-full`}
          >
            {/* Card Header */}
            <div className="flex items-start justify-between">
              <div
                className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${getIconStyle(
                  status,
                  gradient
                )}`}
              >
                {status === 'locked' || status === 'unavailable' ? (
                  <Lock className="h-5 w-5" />
                ) : status === 'claimed' ? (
                  <Check className="h-5 w-5" />
                ) : (
                  <IconComponent className="h-5 w-5" />
                )}
              </div>

              {/* Status Badge */}
              <div className="flex flex-col items-end flex-shrink-0">
                {status === 'claimed' && (
                  <div className="bg-green-100 text-green-700 px-2 py-1 rounded-full text-xs font-medium mb-2">
                    Claimed
                  </div>
                )}
                {status === 'available' && (
                  <div className="bg-blue-100 text-blue-700 px-2 py-1 rounded-full text-xs font-medium mb-2">
                    Available
                  </div>
                )}
                {status === 'next_goal' && (
                  <div className="bg-purple-100 text-purple-700 px-2 py-1 rounded-full text-xs font-medium mb-2">
                    Next Goal
                  </div>
                )}
                {status === 'locked' && (
                  <div className="bg-gray-100 text-gray-700 px-2 py-1 rounded-full text-xs font-medium mb-2">
                    Locked
                  </div>
                )}
                {status === 'unavailable' && (
                  <div className="bg-red-100 text-red-700 px-2 py-1 rounded-full text-xs font-medium mb-2">
                    Unavailable
                  </div>
                )}
                <div
                  className={`text-sm font-semibold ${
                    status === 'locked' || status === 'unavailable' ? 'text-gray-500' : 'text-slate-700'
                  }`}
                >
                  {reward.points_required} Points
                </div>
              </div>
            </div>

            {/* Card Content - This will expand to fill available space */}
            <div className="flex-1 space-y-2 mt-4">
              <h3
                className={`text-lg font-semibold ${
                  status === 'locked' || status === 'unavailable' ? 'text-gray-600' : 'text-slate-800'
                }`}
              >
                {reward.name}
              </h3>
              <p
                className={`text-sm ${
                  status === 'locked' || status === 'unavailable' ? 'text-gray-500' : 'text-slate-600'
                }`}
              >
                {reward.description}
              </p>
              {reward.sponsor && (
                <p className="text-xs text-slate-500">by {reward.sponsor}</p>
              )}
            </div>

            {/* Action Button - This will always be at the bottom */}
            <div className="mt-6">
              {status === 'locked' && (
                <button
                  disabled
                  className="w-full py-2 px-4 bg-gray-100 text-gray-600 rounded-lg text-sm font-medium cursor-not-allowed"
                >
                  Need {reward.points_required - userPoints} more points
                </button>
              )}
                              {status === 'next_goal' && (
                  <button
                    disabled
                    className="w-full py-2 px-4 bg-gray-100 text-gray-600 rounded-lg text-sm font-medium cursor-not-allowed"
                  >
                    Need {reward.points_required - userPoints} more points
                  </button>
                )}
              {status === 'unavailable' && (
                <button
                  disabled
                  className="w-full py-2 px-4 bg-gray-200 text-gray-500 rounded-lg text-sm font-medium cursor-not-allowed"
                >
                  Stay Tuned
                </button>
              )}
              {status === 'available' && (
                <button 
                  onClick={() => onRedeem(reward.id)}
                  disabled={redeeming === reward.id}
                  className="w-full py-2 px-4 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg text-sm font-medium hover:from-blue-600 hover:to-blue-700 transition-all duration-200 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {redeeming === reward.id ? (
                    'Redeeming...'
                  ) : (
                    'Claim Reward'
                  )}
                </button>
              )}
              {status === 'claimed' && (
                <button
                  disabled
                  className="w-full py-2 px-4 bg-green-100 text-green-600 rounded-lg text-sm font-medium cursor-not-allowed flex items-center justify-center space-x-2"
                >
                  <Check className="h-4 w-4" />
                  <span>Already Claimed</span>
                </button>
              )}
            </div>

            {/* Stock indicator */}
            {reward.stock_available !== undefined && (
              <div className="mt-2 text-center">
                <p className="text-xs text-slate-500">
                  {reward.stock_available} left in stock
                </p>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};

const RedemptionHistory = ({ history }: { history: Redemption[] }) => {
  if (history.length === 0) {
    return (
      <div className="text-center py-8 text-stone-500">
        <div className="text-4xl mb-2">📋</div>
        <p>No redemptions yet</p>
        <p className="text-sm">Your redeemed rewards will appear here</p>
      </div>
    );
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-700';
      case 'approved': return 'bg-blue-100 text-blue-700';
      case 'shipped': return 'bg-purple-100 text-purple-700';
      case 'delivered': return 'bg-green-100 text-green-700';
      case 'rejected': return 'bg-red-100 text-red-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending': return '⏳';
      case 'approved': return '✅';
      case 'shipped': return '📦';
      case 'delivered': return '🎉';
      case 'rejected': return '❌';
      default: return '📋';
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100">
      {/* Header */}
      <div className="flex items-center justify-between p-6 border-b border-gray-100">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
            <span className="text-green-600 text-sm">📋</span>
          </div>
          <h3 className="text-lg font-semibold text-gray-900">Redemption History</h3>
        </div>
        <button className="text-indigo-600 hover:text-indigo-700 text-sm font-medium">
          See all
        </button>
      </div>

      {/* Table */}
      <div className="overflow-hidden">
        <table className="redemption-table w-full">
          <thead>
            <tr className="border-b border-gray-100">
              <th className="text-left py-4 px-6 text-sm font-medium text-gray-700">REWARD</th>
              <th className="text-left py-4 px-6 text-sm font-medium text-gray-700">DATE</th>
              <th className="text-left py-4 px-6 text-sm font-medium text-gray-700">POINTS</th>
              <th className="text-left py-4 px-6 text-sm font-medium text-gray-700">STATUS</th>
              <th className="text-right py-4 px-6 text-sm font-medium text-gray-700"></th>
            </tr>
          </thead>
          <tbody>
            {history.map((redemption, index) => (
              <tr 
                key={redemption.id} 
                className={`border-b border-gray-50 hover:bg-gray-50 transition-colors duration-150 ${
                  index === history.length - 1 ? 'border-b-0' : ''
                }`}
              >
                <td className="py-4 px-6">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                      <span className="text-purple-600 text-sm">🎁</span>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">
                        {redemption.reward?.name || redemption.incentive?.name || 'Unknown Reward'}
                      </p>
                      {(redemption.reward?.description || redemption.incentive?.description) && (
                        <p className="text-xs text-gray-500">
                          {redemption.reward?.description || redemption.incentive?.description}
                        </p>
                      )}
                    </div>
                  </div>
                </td>
                <td className="py-4 px-6">
                  <span className="text-sm text-gray-700">
                    {(() => {
                      const dateStr = redemption.redeemed_at || redemption.redemption_date;
                      if (dateStr) {
                        return new Date(dateStr).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric'
                        });
                      }
                      return 'Invalid Date';
                    })()}
                  </span>
                </td>
                <td className="py-4 px-6">
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-700">
                    -{redemption.points_spent || redemption.incentive?.points_required || 0}
                  </span>
                </td>
                <td className="py-4 px-6">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(redemption.status)}`}>
                    {getStatusIcon(redemption.status)} {redemption.status_display || redemption.status}
                  </span>
                </td>
                <td className="py-4 px-6 text-right">
                  <button className="text-gray-400 hover:text-gray-600">
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" />
                    </svg>
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
