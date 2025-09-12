import { Command } from "cmdk";
import { Dispatch, SetStateAction, useEffect, useState } from "react";
import { 
  FiHome, 
  FiGift, 
  FiAward, 
  FiUser, 
  FiSettings, 
  FiLogOut, 
  FiTrendingUp,
  FiActivity,
  FiSearch,
  FiExternalLink,
  FiStar
} from "react-icons/fi";
import { useRouter } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import { apiService, Incentive } from "@/services/api";

export const CommandMenu = ({
  open,
  setOpen,
}: {
  open: boolean;
  setOpen: Dispatch<SetStateAction<boolean>>;
}) => {
  const [value, setValue] = useState("");
  const [rewards, setRewards] = useState<Incentive[]>([]);
  const [loadingRewards, setLoadingRewards] = useState(false);
  const router = useRouter();
  const { data: session } = useSession();

  // Fetch rewards when menu opens
  useEffect(() => {
    if (open && session?.djangoAccessToken && rewards.length === 0) {
      fetchRewards();
    }
  }, [open, session?.djangoAccessToken, rewards.length]);

  // Toggle the menu when ⌘K is pressed and handle navigation shortcuts
  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((open) => !open);
      }
      
      // Navigation shortcuts (only when menu is closed)
      if (!open && e.metaKey || e.ctrlKey) {
        switch (e.key) {
          case "1":
            e.preventDefault();
            handleNavigation("/dashboard");
            break;
          case "2":
            e.preventDefault();
            handleNavigation("/rewards");
            break;
          case "3":
            e.preventDefault();
            handleNavigation("/leaderboard");
            break;
          case "4":
            e.preventDefault();
            handleNavigation("/profile");
            break;
        }
      }
    };

    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, [open]);

  const fetchRewards = async () => {
    if (!session?.djangoAccessToken) return;
    
    setLoadingRewards(true);
    try {
      let rewardsResponse;
      try {
        rewardsResponse = await apiService.getAvailableRewards(session.djangoAccessToken);
      } catch (error) {
        console.warn('New rewards API failed, trying fallback:', error);
        rewardsResponse = await apiService.getIncentives(session.djangoAccessToken);
      }
      
      let rewardsArray: Incentive[] = [];
      
      if (rewardsResponse.data) {
        if (Array.isArray(rewardsResponse.data)) {
          rewardsArray = rewardsResponse.data;
        } else if ((rewardsResponse.data as any).rewards && Array.isArray((rewardsResponse.data as any).rewards)) {
          rewardsArray = (rewardsResponse.data as any).rewards;
        }
      }
      
      setRewards(rewardsArray);
    } catch (error) {
      console.warn('Failed to fetch rewards for search:', error);
      setRewards([]);
    } finally {
      setLoadingRewards(false);
    }
  };

  const handleNavigation = (path: string) => {
    router.push(path);
    setOpen(false);
  };

  const handleSignOut = () => {
    signOut({ callbackUrl: "/" });
    setOpen(false);
  };

  const handleRewardSelect = (reward: Incentive) => {
    // Navigate to rewards page first
    router.push("/rewards");
    setOpen(false);
    
    // Then scroll to the specific reward after a short delay
    setTimeout(() => {
      const rewardElement = document.querySelector(`[data-reward-id="${reward.id}"]`);
      if (rewardElement) {
        rewardElement.scrollIntoView({ 
          behavior: 'smooth', 
          block: 'center' 
        });
        // Add a highlight effect
        rewardElement.classList.add('ring-2', 'ring-blue-500', 'ring-opacity-50');
        setTimeout(() => {
          rewardElement.classList.remove('ring-2', 'ring-blue-500', 'ring-opacity-50');
        }, 3000);
      }
    }, 100);
  };

  return (
    <Command.Dialog
      open={open}
      onOpenChange={setOpen}
      label="Propel2Excel Command Menu"
      className="fixed inset-0 bg-stone-950/50 z-50"
      onClick={() => setOpen(false)}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="bg-white rounded-xl shadow-2xl border-stone-200 border overflow-hidden w-full max-w-lg mx-auto mt-12"
      >
        <Command.Input
          value={value}
          onValueChange={setValue}
          placeholder="Search rewards, navigate, or get help..."
          className="relative border-b border-stone-200 p-4 text-lg w-full placeholder:text-stone-400 placeholder:font-normal placeholder:tracking-wide focus:outline-none bg-transparent"
        />
        <Command.List className="max-h-96 overflow-y-auto p-4">
          <Command.Empty>
            <div className="flex flex-col items-center py-8 text-stone-500">
              <FiSearch className="w-8 h-8 mb-2" />
              <p>No results found for</p>
              <span className="text-violet-500 font-medium">"{value}"</span>
              <p className="text-sm mt-1">Try searching for rewards, pages, or actions</p>
            </div>
          </Command.Empty>

          <Command.Group heading="Navigation" className="text-sm mb-2 text-stone-500 font-medium px-1">
            <Command.Item 
              onSelect={() => handleNavigation("/dashboard")}
              className="flex cursor-pointer transition-colors p-2.5 text-sm text-stone-950 hover:bg-stone-100 rounded-lg items-center gap-3 data-[selected=true]:bg-stone-100 data-[selected=true]:text-stone-950"
            >
              <FiHome className="w-4 h-4" />
              <span>Dashboard</span>
              <span className="ml-auto text-xs text-stone-400">⌘1</span>
            </Command.Item>
            <Command.Item 
              onSelect={() => handleNavigation("/rewards")}
              className="flex cursor-pointer transition-colors p-2.5 text-sm text-stone-950 hover:bg-stone-100 rounded-lg items-center gap-3 data-[selected=true]:bg-stone-100 data-[selected=true]:text-stone-950"
            >
              <FiGift className="w-4 h-4" />
              <span>Rewards</span>
              <span className="ml-auto text-xs text-stone-400">⌘2</span>
            </Command.Item>
            <Command.Item 
              onSelect={() => handleNavigation("/leaderboard")}
              className="flex cursor-pointer transition-colors p-2.5 text-sm text-stone-950 hover:bg-stone-100 rounded-lg items-center gap-3 data-[selected=true]:bg-stone-100 data-[selected=true]:text-stone-950"
            >
              <FiAward className="w-4 h-4" />
              <span>Leaderboard</span>
              <span className="ml-auto text-xs text-stone-400">⌘3</span>
            </Command.Item>
            <Command.Item 
              onSelect={() => handleNavigation("/profile")}
              className="flex cursor-pointer transition-colors p-2.5 text-sm text-stone-950 hover:bg-stone-100 rounded-lg items-center gap-3 data-[selected=true]:bg-stone-100 data-[selected=true]:text-stone-950"
            >
              <FiUser className="w-4 h-4" />
              <span>Profile</span>
              <span className="ml-auto text-xs text-stone-400">⌘4</span>
            </Command.Item>
          </Command.Group>

          <div className="my-3"></div>

          <Command.Group heading="Quick Actions" className="text-sm mb-2 text-stone-500 font-medium px-1">
            <Command.Item 
              onSelect={() => handleNavigation("/rewards")}
              className="flex cursor-pointer transition-colors p-2.5 text-sm text-stone-950 hover:bg-stone-100 rounded-lg items-center gap-3 data-[selected=true]:bg-stone-100 data-[selected=true]:text-stone-950"
            >
              <FiAward className="w-4 h-4" />
              <span>Redeem Points</span>
              <span className="ml-auto text-xs text-stone-400">Points → Rewards</span>
            </Command.Item>
            <Command.Item 
              onSelect={() => handleNavigation("/leaderboard")}
              className="flex cursor-pointer transition-colors p-2.5 text-sm text-stone-950 hover:bg-stone-100 rounded-lg items-center gap-3 data-[selected=true]:bg-stone-100 data-[selected=true]:text-stone-950"
            >
              <FiTrendingUp className="w-4 h-4" />
              <span>View Rankings</span>
              <span className="ml-auto text-xs text-stone-400">See your position</span>
            </Command.Item>
            <Command.Item 
              onSelect={() => handleNavigation("/dashboard")}
              className="flex cursor-pointer transition-colors p-2.5 text-sm text-stone-950 hover:bg-stone-100 rounded-lg items-center gap-3 data-[selected=true]:bg-stone-100 data-[selected=true]:text-stone-950"
            >
              <FiActivity className="w-4 h-4" />
              <span>Recent Activity</span>
              <span className="ml-auto text-xs text-stone-400">View points history</span>
            </Command.Item>
          </Command.Group>

          <div className="my-3"></div>

          {/* Searchable Rewards */}
          {rewards.length > 0 && (
            <Command.Group heading="Rewards" className="text-sm mb-2 text-stone-500 font-medium px-1">
              {rewards.slice(0, 8).map((reward) => (
                <Command.Item
                  key={reward.id}
                  onSelect={() => handleRewardSelect(reward)}
                  className="flex cursor-pointer transition-colors p-2.5 text-sm text-stone-950 hover:bg-stone-100 rounded-lg items-center gap-3 data-[selected=true]:bg-stone-100 data-[selected=true]:text-stone-950"
                >
                  <FiStar className="w-4 h-4" />
                  <div className="flex-1 min-w-0">
                    <div className="font-medium truncate">{reward.name}</div>
                    <div className="text-xs text-stone-500 truncate">
                      {reward.points_required} points
                      {reward.stock_available !== undefined && ` • ${reward.stock_available} left`}
                    </div>
                  </div>
                  <span className="text-xs text-stone-400">View</span>
                </Command.Item>
              ))}
              {rewards.length > 8 && (
                <Command.Item 
                  onSelect={() => handleNavigation("/rewards")}
                  className="flex cursor-pointer transition-colors p-2.5 text-sm text-stone-950 hover:bg-stone-100 rounded-lg items-center gap-3 data-[selected=true]:bg-stone-100 data-[selected=true]:text-stone-950"
                >
                  <FiGift className="w-4 h-4" />
                  <span>View All Rewards ({rewards.length})</span>
                  <span className="ml-auto text-xs text-stone-400">→</span>
                </Command.Item>
              )}
            </Command.Group>
          )}

          <div className="my-3"></div>

          <Command.Group heading="Account" className="text-sm mb-2 text-stone-500 font-medium px-1">
            <Command.Item 
              onSelect={() => handleNavigation("/profile")}
              className="flex cursor-pointer transition-colors p-2.5 text-sm text-stone-950 hover:bg-stone-100 rounded-lg items-center gap-3 data-[selected=true]:bg-stone-100 data-[selected=true]:text-stone-950"
            >
              <FiSettings className="w-4 h-4" />
              <span>Account Settings</span>
              <span className="ml-auto text-xs text-stone-400">Manage profile</span>
            </Command.Item>
            <Command.Item 
              onSelect={handleSignOut}
              className="flex cursor-pointer transition-colors p-2.5 text-sm text-stone-50 hover:bg-red-50 hover:text-red-600 bg-stone-950 rounded-lg items-center gap-3 data-[selected=true]:bg-red-50 data-[selected=true]:text-red-600"
            >
              <FiLogOut className="w-4 h-4" />
              <span>Sign Out</span>
              <span className="ml-auto text-xs text-stone-300">
                {session?.user?.email}
              </span>
            </Command.Item>
          </Command.Group>

          <div className="mt-4 pt-3 border-t border-stone-200">
            <div className="flex items-center justify-between text-xs text-stone-400">
              <span>Propel2Excel Points System</span>
              <div className="flex items-center gap-4">
                <span>⌘K to open</span>
                <span>↑↓ to navigate</span>
                <span>↵ to select</span>
              </div>
            </div>
          </div>
        </Command.List>
      </div>
    </Command.Dialog>
  );
};
