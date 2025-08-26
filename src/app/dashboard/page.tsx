'use client';
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Dashboard } from "@/components/Dashboard/Dashboard";
import { Sidebar } from "@/components/Sidebar/Sidebar";
import { apiService, User } from "@/services/api";

export default function DashboardPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [isCheckingOnboarding, setIsCheckingOnboarding] = useState(true);
  const [userProfile, setUserProfile] = useState<User | null>(null);

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
          
          if (response.data) {
            setUserProfile(response.data);
            
            // If onboarding is not completed, redirect to onboarding
            if (!response.data.onboarding_completed) {
              router.push("/onboarding");
              return;
            }
          }
        } catch (error) {
          console.error('Failed to fetch user profile:', error);
          // If we can't verify onboarding status, assume it's not complete and redirect
          router.push("/onboarding");
          return;
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
    <main className="grid gap-4 p-4 grid-cols-[220px,_1fr]">
      <Sidebar />
      <Dashboard />
    </main>
  );
}
