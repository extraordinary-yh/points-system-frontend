'use client';
import { Sidebar } from "@/components/Sidebar/Sidebar";
import { useSidebar } from "@/contexts/SidebarContext";
import { useOnboardingCheck } from "@/hooks/useOnboardingCheck";

export default function ProfilePage() {
  const { userProfile, isLoading } = useOnboardingCheck();
  const { isCollapsed } = useSidebar();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-stone-100">
        <div className="text-xl text-stone-600">
          Loading profile...
        </div>
      </div>
    );
  }

  // useOnboardingCheck handles authentication and onboarding redirects
  if (!userProfile?.onboarding_completed) {
    return null;
  }

  return (
    <main className={`grid gap-4 p-4 transition-all duration-300 ${
      isCollapsed ? 'grid-cols-[64px,_1fr]' : 'grid-cols-[256px,_1fr]'
    }`}>
      <Sidebar />
      <div className="bg-white rounded-lg pb-4 shadow">
          <div className="border-b px-4 mb-4 mt-2 pb-4 border-stone-200">
          <div className="flex items-center justify-between p-0.5">
            <div>
              <span className="text-sm font-bold block">
                👤 Profile
              </span>
              <span className="text-xs block text-stone-500">
                Manage your account settings
              </span>
            </div>
          </div>
        </div>
        
        <div className="px-4">
          <div className="space-y-3">
            <div className="text-center py-8 text-stone-500">
              <div className="text-4xl mb-2">👤</div>
              <p>Profile settings coming soon!</p>
              <p className="text-sm">Customize your account and preferences</p>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
