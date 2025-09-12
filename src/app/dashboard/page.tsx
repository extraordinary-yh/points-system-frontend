'use client';
import { Dashboard } from "@/components/Dashboard/Dashboard";
import { Sidebar } from "@/components/Sidebar/Sidebar";
import { useSidebar } from "@/contexts/SidebarContext";
import { useOnboardingCheck } from "@/hooks/useOnboardingCheck";
import { useSharedDashboardData } from "@/hooks/useSharedDashboardData";

export default function DashboardPage() {
  const { userProfile, isLoading } = useOnboardingCheck();
  const { isCollapsed } = useSidebar();
  const { isLoading: dataLoading, activityFeed, timelineData, dashboardStats } = useSharedDashboardData();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-stone-100">
        <div className="text-xl text-stone-600">
          Loading dashboard...
        </div>
      </div>
    );
  }

  // useOnboardingCheck handles authentication and onboarding redirects
  if (!userProfile?.onboarding_completed) {
    return null; // Will redirect to onboarding
  }

  return (
    <main className={`grid gap-4 p-4 transition-all duration-300 h-screen ${
      isCollapsed ? 'grid-cols-[64px,_1fr]' : 'grid-cols-[256px,_1fr]'
    }`}>
      <Sidebar />
      <div className="bg-white rounded-lg pb-4 shadow h-full overflow-y-auto">
        <Dashboard />
      </div>
    </main>
  );
}
