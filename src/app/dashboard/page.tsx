'use client';
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Dashboard } from "@/components/Dashboard/Dashboard";
import { Sidebar } from "@/components/Sidebar/Sidebar";
import { useSidebar } from "@/contexts/SidebarContext";
import { apiService, User } from "@/services/api";

export default function DashboardPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [isCheckingOnboarding, setIsCheckingOnboarding] = useState(true);
  const [userProfile, setUserProfile] = useState<User | null>(null);
  const { isCollapsed } = useSidebar();

  useEffect(() => {
    const checkOnboardingStatus = async () => {
      // Redirect to home if not logged in
      if (status === "loading") return; // Still loading
      if (status === "unauthenticated" || !session?.user) {
        router.push("/");
        return;
      }

      // Check onboarding completion status
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
            
            // If onboarding is not completed, redirect to onboarding
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

  // Check if session exists
  if (status === "unauthenticated" || !session?.user) {
    return null; // Will redirect
  }

  // Check if onboarding is complete
  if (!userProfile?.onboarding_completed) {
    return null; // Will redirect to onboarding
  }

  return (
    <main className={`grid gap-4 p-4 transition-all duration-300 h-screen ${
      isCollapsed ? 'grid-cols-[64px,_1fr]' : 'grid-cols-[256px,_1fr]'
    }`}>
      <Sidebar />
      <Dashboard />
    </main>
  );
}
