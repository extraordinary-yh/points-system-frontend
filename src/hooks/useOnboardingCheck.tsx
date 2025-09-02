import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { apiService, User } from '@/services/api';

// Shared hook to eliminate duplicate profile API calls across pages
// This replaces the identical onboarding check logic in dashboard, profile, and rewards pages
export const useOnboardingCheck = () => {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [userProfile, setUserProfile] = useState<User | null>(null);
  const [isCheckingOnboarding, setIsCheckingOnboarding] = useState(true);

  useEffect(() => {
    const checkOnboardingStatus = async () => {
      if (status === "loading") return;
      
      if (status === "unauthenticated" || !session?.user) {
        router.push("/");
        return;
      }

      if (session?.djangoAccessToken && isCheckingOnboarding) {
        try {
          console.log('🔄 Checking onboarding status (shared hook)');
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

  return {
    userProfile,
    isCheckingOnboarding,
    isAuthenticated: status === "authenticated" && !!session?.user,
    isLoading: status === "loading" || isCheckingOnboarding
  };
};
