'use client';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { OnboardingFlow } from '../../components/Onboarding/OnboardingFlow';
import { apiService, User } from '@/services/api';

export default function OnboardingPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [isCheckingStatus, setIsCheckingStatus] = useState(true);
  const [userProfile, setUserProfile] = useState<User | null>(null);

  useEffect(() => {
    const checkUserStatus = async () => {
      // Redirect to home if not logged in
      if (status === 'loading') return; // Still loading
      if (!session) {
        router.push('/');
        return;
      }

      // Check if user has already completed onboarding
      if (session?.djangoAccessToken && isCheckingStatus) {
        try {
          const response = await apiService.getProfile(session.djangoAccessToken);
          
          if (response.data) {
            setUserProfile(response.data);
            
            // If onboarding is already completed, redirect to dashboard
            if (response.data.onboarding_completed) {
              router.push('/dashboard');
              return;
            }
          }
        } catch (error) {
          console.error('Failed to fetch user profile:', error);
          // Continue with onboarding flow on error
        } finally {
          setIsCheckingStatus(false);
        }
      } else {
        setIsCheckingStatus(false);
      }
    };

    checkUserStatus();
  }, [session, status, router, isCheckingStatus]);

  if (status === 'loading' || isCheckingStatus) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-stone-100">
        <div className="text-center">
          <div className="animate-spin w-8 h-8 border-2 border-violet-600 border-t-transparent rounded-full mx-auto mb-2"></div>
          <div className="text-stone-600">
            {status === 'loading' ? 'Loading...' : 'Checking onboarding status...'}
          </div>
        </div>
      </div>
    );
  }

  if (!session) {
    return null; // Will redirect
  }

  // If onboarding is already completed, will redirect to dashboard
  if (userProfile?.onboarding_completed) {
    return null; // Will redirect
  }

  return (
    <OnboardingFlow userName={session.user?.username} />
  );
}
