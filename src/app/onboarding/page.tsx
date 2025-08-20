'use client';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { OnboardingFlow } from '../../components/Onboarding/OnboardingFlow';

export default function OnboardingPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    // Redirect to home if not logged in
    if (status === 'loading') return; // Still loading
    if (!session) {
      router.push('/');
      return;
    }
  }, [session, status, router]);

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-stone-100">
        <div className="animate-spin w-8 h-8 border-2 border-violet-600 border-t-transparent rounded-full"></div>
      </div>
    );
  }

  if (!session) {
    return null; // Will redirect
  }

  return (
    <OnboardingFlow userName={session.user?.username} />
  );
}
