'use client';
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Sidebar } from "@/components/Sidebar/Sidebar";
import { apiService, User, Incentive, Redemption } from "@/services/api";

export default function RewardsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [isCheckingOnboarding, setIsCheckingOnboarding] = useState(true);
  const [userProfile, setUserProfile] = useState<User | null>(null);

  useEffect(() => {
    const checkOnboardingStatus = async () => {
      if (status === "loading") return;
      if (status === "unauthenticated" || !session?.user) {
        router.push("/");
        return;
      }

      if (session?.djangoAccessToken && isCheckingOnboarding) {
        try {
          const response = await apiService.getProfile(session.djangoAccessToken);
          
          // Check for network errors first
          if (response.isNetworkError) {
            console.log('Backend unreachable, assuming onboarding complete for authenticated user');
            setUserProfile({ onboarding_completed: true } as User);
            return;
          }
          
          if (response.data) {
            setUserProfile(response.data);
            
            if (!response.data.onboarding_completed) {
              router.push("/onboarding");
              return;
            }
          } else {
            // If no profile data but user is authenticated, assume onboarding complete
            // Set a default profile state to prevent redirect loops
            setUserProfile({ onboarding_completed: true } as User);
          }
        } catch (error) {
          console.error('Failed to fetch user profile:', error);
          // For any error, assume onboarding complete for authenticated user
          setUserProfile({ onboarding_completed: true } as User);
        } finally {
          setIsCheckingOnboarding(false);
        }
      }
    };

    checkOnboardingStatus();
  }, [session, status, router, isCheckingOnboarding]);

  if (status === "loading" || isCheckingOnboarding) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-stone-100">
        <div className="text-xl text-stone-600">
          {status === "loading" ? "Loading..." : "Checking account setup..."}
        </div>
      </div>
    );
  }

  if (status === "unauthenticated" || !session?.user) {
    return null;
  }

  if (!userProfile?.onboarding_completed) {
    return null;
  }

  return (
    <main className="grid gap-4 p-4 grid-cols-[220px,_1fr]">
      <Sidebar />
      <RewardsContent />
    </main>
  );
}

const RewardsContent = () => {
  const { data: session } = useSession();
  const [rewards, setRewards] = useState<Incentive[]>([]);
  const [redemptionHistory, setRedemptionHistory] = useState<Redemption[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'available' | 'history'>('available');
  const [redeeming, setRedeeming] = useState<number | null>(null);

  useEffect(() => {
    const fetchRewardsData = async () => {
      if (session?.djangoAccessToken) {
        try {
          console.log('Fetching rewards data with token:', session.djangoAccessToken?.substring(0, 20) + '...');
          
          // Try new API first
          let rewardsResponse;
          try {
            rewardsResponse = await apiService.getAvailableRewards(session.djangoAccessToken);
            console.log('Available rewards response:', rewardsResponse);
          } catch (error) {
            console.warn('New rewards API failed, trying old incentives API:', error);
            // Fallback to old API
            rewardsResponse = await apiService.getIncentives(session.djangoAccessToken);
            console.log('Incentives API response:', rewardsResponse);
          }
          
          let historyResponse;
          try {
            historyResponse = await apiService.getRedemptionHistory(session.djangoAccessToken);
            console.log('Redemption history response:', historyResponse);
          } catch (error) {
            console.warn('History API failed, trying old redemptions API:', error);
            // Fallback to old API
            historyResponse = await apiService.getRedemptions(session.djangoAccessToken);
            console.log('Old redemptions API response:', historyResponse);
          }
          
          if (rewardsResponse.data && Array.isArray(rewardsResponse.data)) {
            console.log('Setting rewards:', rewardsResponse.data.length, 'items');
            setRewards(rewardsResponse.data);
          } else if (rewardsResponse.data) {
            console.warn('Rewards data is not an array:', rewardsResponse.data);
            setRewards([]);
          } else {
            console.warn('No rewards data received');
            setRewards([]);
          }
          
          if (historyResponse?.data && Array.isArray(historyResponse.data)) {
            console.log('Setting history:', historyResponse.data.length, 'items');
            setRedemptionHistory(historyResponse.data);
          } else {
            console.log('No history data or not an array');
            setRedemptionHistory([]);
          }
        } catch (error) {
          console.error('Failed to fetch rewards data:', error);
          setRewards([]);
          setRedemptionHistory([]);
        }
      } else {
        console.log('No session or token available');
      }
      setLoading(false);
    };

    fetchRewardsData();
  }, [session]);

  const handleRedeem = async (rewardId: number) => {
    if (!session?.djangoAccessToken) return;
    
    setRedeeming(rewardId);
    try {
      const response = await apiService.redeemReward(rewardId, {}, session.djangoAccessToken);
      if (response.data) {
        // Refresh data after successful redemption
        const [rewardsResponse, historyResponse] = await Promise.all([
          apiService.getAvailableRewards(session.djangoAccessToken),
          apiService.getRedemptionHistory(session.djangoAccessToken)
        ]);
        
        if (rewardsResponse.data) setRewards(rewardsResponse.data);
        if (historyResponse.data) setRedemptionHistory(historyResponse.data);
        
        // Switch to history tab to show the new redemption
        setActiveTab('history');
      }
    } catch (error) {
      console.error('Failed to redeem reward:', error);
      alert('Failed to redeem reward. Please try again.');
    } finally {
      setRedeeming(null);
    }
  };

  return (
    <div className="bg-white rounded-lg pb-4 shadow">
      <div className="border-b px-4 mb-4 mt-2 pb-4 border-stone-200">
        <div className="flex items-center justify-between p-0.5">
          <div>
            <span className="text-sm font-bold block">
              🎁 Rewards
            </span>
            <span className="text-xs block text-stone-500">
              Redeem your points for exciting rewards
            </span>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="text-right">
              <p className="text-sm font-medium text-violet-600">
                {session?.user?.total_points || 0} points available
              </p>
            </div>
          </div>
        </div>
        
        {/* Tab Navigation */}
        <div className="flex gap-2 mt-4">
          <button
            onClick={() => setActiveTab('available')}
            className={`px-4 py-2 text-sm rounded ${
              activeTab === 'available' 
                ? 'bg-violet-100 text-violet-700' 
                : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
            }`}
          >
            Available Rewards ({rewards.length})
          </button>
          <button
            onClick={() => setActiveTab('history')}
            className={`px-4 py-2 text-sm rounded ${
              activeTab === 'history' 
                ? 'bg-violet-100 text-violet-700' 
                : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
            }`}
          >
            Redemption History ({redemptionHistory.length})
          </button>
          <button
            onClick={() => setActiveTab('debug' as any)}
            className={`px-4 py-2 text-sm rounded ${
              activeTab === 'debug' 
                ? 'bg-red-100 text-red-700' 
                : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
            }`}
          >
            Debug
          </button>
        </div>
      </div>
      
      <div className="px-4">
        {loading ? (
          <div className="text-center py-8 text-stone-500">Loading rewards...</div>
        ) : activeTab === 'available' ? (
          <AvailableRewards 
            rewards={rewards} 
            userPoints={session?.user?.total_points || 0}
            onRedeem={handleRedeem}
            redeeming={redeeming}
          />
        ) : activeTab === 'debug' ? (
          <div className="space-y-4">
            <h3 className="font-semibold text-lg">Debug Information</h3>
            <div className="bg-gray-50 p-4 rounded">
              <h4 className="font-medium mb-2">Session Info:</h4>
              <p className="text-sm">Authenticated: {session ? 'Yes' : 'No'}</p>
              <p className="text-sm">Token: {session?.djangoAccessToken ? 'Present' : 'Missing'}</p>
              <p className="text-sm">User Points: {session?.user?.total_points || 'N/A'}</p>
            </div>
            <div className="bg-gray-50 p-4 rounded">
              <h4 className="font-medium mb-2">API Data:</h4>
              <p className="text-sm">Rewards Array: {Array.isArray(rewards) ? 'Yes' : 'No'}</p>
              <p className="text-sm">Rewards Count: {rewards.length}</p>
              <p className="text-sm">History Count: {redemptionHistory.length}</p>
            </div>
            <div className="bg-gray-50 p-4 rounded">
              <h4 className="font-medium mb-2">Raw Rewards Data:</h4>
              <pre className="text-xs overflow-auto max-h-40 bg-white p-2 rounded border">
                {JSON.stringify(rewards, null, 2)}
              </pre>
            </div>
            <div className="bg-blue-50 p-4 rounded">
              <h4 className="font-medium mb-2">Check Browser Console</h4>
              <p className="text-sm">Open browser console (F12) to see detailed API logs and error messages.</p>
            </div>
          </div>
        ) : (
          <RedemptionHistory history={redemptionHistory} />
        )}
      </div>
    </div>
  );
};

const AvailableRewards = ({ 
  rewards, 
  userPoints, 
  onRedeem, 
  redeeming 
}: {
  rewards: Incentive[];
  userPoints: number;
  onRedeem: (id: number) => void;
  redeeming: number | null;
}) => {
  if (!Array.isArray(rewards) || rewards.length === 0) {
    return (
      <div className="text-center py-8 text-stone-500">
        <div className="text-4xl mb-2">🎁</div>
        <p>No rewards available</p>
        <p className="text-sm">Check back later for exciting rewards!</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {rewards.map((reward) => (
        <div key={reward.id} className="border border-stone-200 rounded-lg p-4 hover:shadow-md transition-shadow">
          {reward.image_url && (
            <img 
              src={reward.image_url} 
              alt={reward.name}
              className="w-full h-32 object-cover rounded-lg mb-3"
            />
          )}
          
          <div className="space-y-2">
            <h3 className="font-semibold text-lg">{reward.name}</h3>
            <p className="text-sm text-stone-600">{reward.description}</p>
            
            <div className="flex items-center justify-between">
              <div>
                <p className="font-bold text-violet-600">{reward.points_required} points</p>
                {reward.sponsor && (
                  <p className="text-xs text-stone-500">by {reward.sponsor}</p>
                )}
              </div>
              
              {reward.stock_available !== undefined && (
                <p className="text-xs text-stone-500">
                  {reward.stock_available} left
                </p>
              )}
            </div>

            <button
              onClick={() => onRedeem(reward.id)}
              disabled={
                !reward.can_redeem || 
                userPoints < reward.points_required || 
                redeeming === reward.id ||
                (reward.stock_available !== undefined && reward.stock_available <= 0)
              }
              className={`w-full py-2 px-4 rounded text-sm font-medium transition-colors ${
                reward.can_redeem && userPoints >= reward.points_required && 
                (reward.stock_available === undefined || reward.stock_available > 0)
                  ? 'bg-violet-600 text-white hover:bg-violet-700'
                  : 'bg-stone-200 text-stone-500 cursor-not-allowed'
              }`}
            >
              {redeeming === reward.id ? (
                'Redeeming...'
              ) : userPoints < reward.points_required ? (
                `Need ${reward.points_required - userPoints} more points`
              ) : reward.stock_available !== undefined && reward.stock_available <= 0 ? (
                'Out of Stock'
              ) : (
                'Redeem'
              )}
            </button>
          </div>
        </div>
      ))}
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
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'approved': return 'bg-blue-100 text-blue-800';
      case 'shipped': return 'bg-purple-100 text-purple-800';
      case 'delivered': return 'bg-green-100 text-green-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      default: return 'bg-stone-100 text-stone-800';
    }
  };

  return (
    <div className="space-y-4">
      {history.map((redemption) => (
        <div key={redemption.id} className="border border-stone-200 rounded-lg p-4">
          <div className="flex items-start justify-between">
            <div className="flex gap-3">
              {redemption.incentive_image_url && (
                <img 
                  src={redemption.incentive_image_url} 
                  alt={redemption.incentive.name}
                  className="w-16 h-16 object-cover rounded"
                />
              )}
              
              <div>
                <h3 className="font-semibold">{redemption.incentive.name}</h3>
                <p className="text-sm text-stone-600">{redemption.incentive.description}</p>
                <p className="text-sm text-violet-600 font-medium">
                  {redemption.incentive.points_required} points redeemed
                </p>
                <p className="text-xs text-stone-500">
                  {new Date(redemption.redemption_date).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric'
                  })}
                </p>
              </div>
            </div>
            
            <div className="text-right">
              <span className={`px-2 py-1 rounded text-xs font-medium ${getStatusColor(redemption.status)}`}>
                {redemption.status_display || redemption.status}
              </span>
              
              {redemption.tracking_info && (
                <p className="text-xs text-stone-600 mt-1">
                  Tracking: {redemption.tracking_info}
                </p>
              )}
              
              {redemption.estimated_delivery && (
                <p className="text-xs text-stone-600 mt-1">
                  Est. delivery: {new Date(redemption.estimated_delivery).toLocaleDateString()}
                </p>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};
