'use client';
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { AuthPage } from "@/components/Auth/AuthPage";

export default function Home() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [isCheckingOnboarding, setIsCheckingOnboarding] = useState(false);

  useEffect(() => {
    // If user is logged in, check if they need onboarding first
    if (status === "authenticated" && session?.user && !isCheckingOnboarding) {
      setIsCheckingOnboarding(true);
      
      // Check if this is a fresh registration
      const isFreshRegistration = typeof window !== 'undefined' && 
        localStorage.getItem('freshRegistration') === 'true';
      
      if (isFreshRegistration) {
        // Clear the flag and redirect to onboarding
        if (typeof window !== 'undefined') {
          localStorage.removeItem('freshRegistration');
        }
        router.push("/onboarding");
      } else {
        // Check if this is a new user (account created within last 5 minutes) as fallback
        const userCreatedAt = new Date(session.user.created_at || '');
        const now = new Date();
        const timeDifference = now.getTime() - userCreatedAt.getTime();
        const fiveMinutesInMs = 5 * 60 * 1000;
        
        if (timeDifference < fiveMinutesInMs) {
          // New user - redirect to onboarding
          router.push("/onboarding");
        } else {
          // Existing user - redirect to dashboard
          router.push("/dashboard");
        }
      }
    }
  }, [session, status, router, isCheckingOnboarding]);

  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-stone-100">
        <div className="text-xl text-stone-600">Loading...</div>
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
