'use client';
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { AuthPage } from "@/components/Auth/AuthPage";
import { apiService, User } from "@/services/api";

export default function Home() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [isCheckingOnboarding, setIsCheckingOnboarding] = useState(false);

  useEffect(() => {
    const checkUserStatus = async () => {
      // If user is logged in, check their onboarding status
      if (status === "authenticated" && session?.user && !isCheckingOnboarding) {
        setIsCheckingOnboarding(true);
        
        try {
          // Check if this is a fresh registration first
          const isFreshRegistration = typeof window !== 'undefined' && 
            localStorage.getItem('freshRegistration') === 'true';
          
          if (isFreshRegistration) {
            // Clear the flag and redirect to onboarding
            if (typeof window !== 'undefined') {
              localStorage.removeItem('freshRegistration');
            }
            router.push("/onboarding");
            return;
          }
          
          // Get user profile to check onboarding status
          if (session?.djangoAccessToken) {
            const response = await apiService.getProfile(session.djangoAccessToken);
            
            if (response.data) {
              if (!response.data.onboarding_completed) {
                // Onboarding not completed - redirect to onboarding
                router.push("/onboarding");
              } else {
                // Onboarding completed - redirect to dashboard
                router.push("/dashboard");
              }
            } else {
              // If we can't get profile, assume onboarding not complete
              router.push("/onboarding");
            }
          } else {
            // Fallback: Check if this is a new user (account created within last 5 minutes)
            const userCreatedAt = new Date(session.user.created_at || '');
            const now = new Date();
            const timeDifference = now.getTime() - userCreatedAt.getTime();
            const fiveMinutesInMs = 5 * 60 * 1000;
            
            if (timeDifference < fiveMinutesInMs) {
              // New user - redirect to onboarding
              router.push("/onboarding");
            } else {
              // Existing user - redirect to dashboard (assume onboarding complete)
              router.push("/dashboard");
            }
          }
        } catch (error) {
          console.error('Error checking user status:', error);
          // On error, redirect to onboarding to be safe
          router.push("/onboarding");
        } finally {
          setIsCheckingOnboarding(false);
        }
      }
    };

    checkUserStatus();
  }, [session, status, router, isCheckingOnboarding]);

  if (status === "loading" || isCheckingOnboarding) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-stone-100">
        <div className="text-xl text-stone-600">
          {status === "loading" ? "Loading..." : "Checking account status..."}
        </div>
      </div>
    );
  }

  // If authenticated, will redirect appropriately (handled in useEffect)
  if (status === "authenticated" && session?.user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-stone-100">
        <div className="text-xl text-stone-600">Redirecting...</div>
      </div>
    );
  }

  // Show auth page for unauthenticated users
  return <AuthPage />;
}
