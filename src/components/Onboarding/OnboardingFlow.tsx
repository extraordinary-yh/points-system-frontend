'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { DiscordLinking } from './DiscordLinking';
import { ConsentAgreement } from './ConsentAgreement';
import { LinkedInFollow } from './LinkedInFollow';

interface OnboardingFlowProps {
  userName?: string;
}

export const OnboardingFlow = ({ userName }: OnboardingFlowProps) => {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState<'discord' | 'consent' | 'linkedin' | 'complete'>('discord');
  const [consentAccepted, setConsentAccepted] = useState<boolean | null>(null);

  const handleDiscordComplete = () => {
    setCurrentStep('consent');
  };

  const handleConsentComplete = (accepted: boolean) => {
    setConsentAccepted(accepted);
    setCurrentStep('linkedin');
  };

  const handleLinkedInComplete = () => {
    setCurrentStep('complete');
    // Redirect to dashboard after a brief delay
    setTimeout(() => {
      router.push('/dashboard');
    }, 2000);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-violet-50 via-stone-50 to-violet-100">
      {/* Progress indicator */}
      <div className="pt-8 pb-4">
        <div className="max-w-2xl mx-auto px-4">
          <div className="flex items-center justify-center space-x-4">
            <div className={`w-3 h-3 rounded-full ${currentStep === 'discord' ? 'bg-violet-600' : (currentStep === 'consent' || currentStep === 'linkedin' || currentStep === 'complete') ? 'bg-violet-400' : 'bg-violet-200'}`} />
            <div className="w-8 h-0.5 bg-violet-200" />
            <div className={`w-3 h-3 rounded-full ${currentStep === 'consent' ? 'bg-violet-600' : (currentStep === 'linkedin' || currentStep === 'complete') ? 'bg-violet-400' : 'bg-violet-200'}`} />
            <div className="w-8 h-0.5 bg-violet-200" />
            <div className={`w-3 h-3 rounded-full ${currentStep === 'linkedin' ? 'bg-violet-600' : currentStep === 'complete' ? 'bg-violet-400' : 'bg-violet-200'}`} />
            <div className="w-8 h-0.5 bg-violet-200" />
            <div className={`w-3 h-3 rounded-full ${currentStep === 'complete' ? 'bg-violet-600' : 'bg-violet-200'}`} />
          </div>
          <div className="text-center mt-2">
            <span className="text-sm text-stone-600">
              {currentStep === 'discord' && 'Step 1 of 3'}
              {currentStep === 'consent' && 'Step 2 of 3'}
              {currentStep === 'linkedin' && 'Step 3 of 3'}
              {currentStep === 'complete' && 'Complete!'}
            </span>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex items-center justify-center px-4">
        {currentStep === 'discord' && (
          <DiscordLinking 
            userName={userName}
            onComplete={handleDiscordComplete}
          />
        )}

        {currentStep === 'consent' && (
          <ConsentAgreement 
            userName={userName}
            onComplete={handleConsentComplete}
          />
        )}
        
        {currentStep === 'linkedin' && (
          <LinkedInFollow 
            userName={userName}
            onComplete={handleLinkedInComplete}
          />
        )}

        {currentStep === 'complete' && (
          <div className="max-w-md w-full text-center bg-white p-8 rounded-xl shadow-lg">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-stone-900 mb-2">Welcome to P2E!</h2>
            <p className="text-stone-600 mb-4">
              You're all set up. Redirecting to your dashboard...
            </p>
            <div className="animate-spin w-6 h-6 border-2 border-violet-600 border-t-transparent rounded-full mx-auto"></div>
          </div>
        )}
      </div>
    </div>
  );
};
