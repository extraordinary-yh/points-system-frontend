'use client';
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Sidebar } from "@/components/Sidebar/Sidebar";
import { apiService, User } from "@/services/api";

export default function ProfilePage() {
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
