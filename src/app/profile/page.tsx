'use client';
import { useState, useEffect } from 'react';
import { Sidebar } from "@/components/Sidebar/Sidebar";
import { useSidebar } from "@/contexts/SidebarContext";
import { useOnboardingCheck } from "@/hooks/useOnboardingCheck";
import { ProfileForm } from "@/components/Profile/ProfileForm";
import { PasswordChangeForm } from "@/components/Profile/PasswordChangeForm";
import { DiscordStatus } from "@/components/Profile/DiscordStatus";
import { User } from "@/services/api";

export default function ProfilePage() {
  const { userProfile, isLoading } = useOnboardingCheck();
  const { isCollapsed } = useSidebar();
  const [currentUser, setCurrentUser] = useState<User | null>(null);

  // Initialize current user when userProfile is first loaded
  useEffect(() => {
    if (userProfile && !currentUser) {
      setCurrentUser(userProfile);
    }
  }, [userProfile, currentUser]);


  // Update current user when profile is updated
  const handleProfileUpdate = (updatedUser: User) => {
    setCurrentUser(updatedUser);
  };

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

  // Show loading state while user data is being prepared
  if (!currentUser) {
    return (
      <main className={`grid gap-4 p-4 transition-all duration-300 h-screen ${
        isCollapsed ? 'grid-cols-[64px,_1fr]' : 'grid-cols-[256px,_1fr]'
      }`}>
        <Sidebar />
        <div className="glass-card pb-4 h-full overflow-y-auto flex items-center justify-center">
          <div className="text-xl text-stone-600">
            Loading profile...
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className={`grid gap-4 p-4 transition-all duration-300 h-screen ${
      isCollapsed ? 'grid-cols-[64px,_1fr]' : 'grid-cols-[256px,_1fr]'
    }`}>
      <Sidebar />
      <div className="glass-card pb-4 h-full overflow-y-auto">
        {/* Header - Consistent with other pages */}
        <div className="border-b px-4 my-4 pb-4 border-stone-200">
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
        
        {/* Profile Content */}
        <div className="content-fade-in-stagger">
          <div className="px-4 space-y-6">
            {/* Profile Form - Personal Information & Account Settings */}
            <ProfileForm 
              user={currentUser} 
              onProfileUpdate={handleProfileUpdate}
            />
            
            {/* Discord Integration Status */}
            <DiscordStatus user={currentUser} />
            
            {/* Password Change Form */}
            <PasswordChangeForm />
          </div>
        </div>
      </div>
    </main>
  );
}
