'use client';
import { useState } from 'react';
import { useSession } from 'next-auth/react';
import { apiService } from '../../services/api';

interface ConsentAgreementProps {
  userName?: string;
  onComplete: (accepted: boolean) => void;
}

export const ConsentAgreement = ({ userName, onComplete }: ConsentAgreementProps) => {
  const [hasRead, setHasRead] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { data: session } = useSession();

  const handleConsentSubmit = async (consented: boolean) => {
    if (!session?.djangoAccessToken) {
      // No auth token available
      onComplete(consented);
      return;
    }

    setIsSubmitting(true);
    try {
      await apiService.updateConsentStatus(consented, session.djangoAccessToken);
      // Consent status updated successfully
    } catch (error) {
      // Failed to update consent status
      // Continue anyway - don't block user experience
    } finally {
      setIsSubmitting(false);
      onComplete(consented);
    }
  };

  const consentText = `
PROPEL2EXCEL (P2E) STUDENT MEDIA CONSENT AGREEMENT

By agreeing to this consent, you grant Propel2Excel ("P2E") permission to feature you, your achievements, and your experiences in our marketing and promotional materials. This may include:

• Student success stories and testimonials
• Before/after academic and career progression showcases  
• Photography and video content featuring you at P2E events
• Social media posts highlighting your achievements
• Website content showcasing student outcomes
• Email newsletters and promotional materials
• Partnership announcements and case studies

WHAT THIS MEANS:
- We may use your name, photo, university, major, and career achievements
- We may share your story of growth and success through P2E programs
- Content may appear on our website, social media, newsletters, and partner materials
- You may be contacted for interviews, testimonials, or photo/video sessions

YOUR RIGHTS:
- This consent is voluntary and optional
- You can revoke consent at any time by emailing team@propel2excel.com
- Declining will not affect your access to P2E programs or services
- You can request removal of existing content featuring you

We're proud of our students' achievements and love celebrating their success stories. Your consent helps us inspire future students and showcase the real impact of our programs.

DURATION: This consent remains active during your participation in P2E programs and for 2 years after, unless revoked earlier.

Last updated: ${new Date().toLocaleDateString()}
  `.trim();

  return (
    <div className="max-w-2xl w-full bg-white rounded-xl shadow-lg overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-violet-600 to-violet-700 px-6 py-6 text-white">
        <h2 className="text-2xl font-bold mb-2">
          {userName ? `Welcome ${userName}!` : 'Welcome!'}
        </h2>
        <p className="text-violet-100">
          Before we get started, we'd love your permission to showcase your success story
        </p>
      </div>

      {/* Content */}
      <div className="p-6">
        <div className="flex items-start space-x-3 mb-6">
          <div className="w-8 h-8 bg-violet-100 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
            <svg className="w-4 h-4 text-violet-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div>
            <h3 className="font-semibold text-stone-900 mb-1">Student Media Consent</h3>
            <p className="text-stone-600 text-sm">
              We love celebrating our students' achievements! This optional consent allows us to feature 
              your success story in our marketing materials, social media, and website.
            </p>
          </div>
        </div>

        {/* Consent Agreement */}
        <div className="border border-stone-200 rounded-lg mb-6">
          <div className="p-4 bg-stone-50 border-b border-stone-200">
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="flex items-center justify-between w-full text-left"
            >
              <span className="font-medium text-stone-900">Media Consent Agreement</span>
              <svg 
                className={`w-5 h-5 text-stone-500 transform transition-transform ${isExpanded ? 'rotate-180' : ''}`}
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
          </div>
          
          {isExpanded && (
            <div className="p-4 max-h-64 overflow-y-auto">
              <pre className="text-xs text-stone-700 whitespace-pre-wrap font-sans leading-relaxed">
                {consentText}
              </pre>
            </div>
          )}
        </div>

        {/* Read confirmation */}
        <div className="flex items-center space-x-3 mb-6">
          <input
            id="hasRead"
            type="checkbox"
            checked={hasRead}
            onChange={(e) => setHasRead(e.target.checked)}
            className="w-4 h-4 text-violet-600 border-stone-300 rounded focus:ring-violet-500"
          />
          <label htmlFor="hasRead" className="text-sm text-stone-700">
            I have read and understand the consent agreement above
          </label>
        </div>

        {/* Action buttons */}
        <div className="flex flex-col sm:flex-row gap-3">
          <button
            onClick={() => handleConsentSubmit(true)}
            disabled={!hasRead || isSubmitting}
            className="flex-1 bg-violet-600 hover:bg-violet-700 disabled:bg-stone-300 disabled:cursor-not-allowed text-white font-medium py-3 px-6 rounded-lg transition-colors flex items-center justify-center"
          >
            {isSubmitting ? (
              <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full mr-2"></div>
            ) : null}
            Yes, I consent to being featured
          </button>
          
          <button
            onClick={() => handleConsentSubmit(false)}
            disabled={isSubmitting}
            className="flex-1 bg-stone-200 hover:bg-stone-300 disabled:bg-stone-100 disabled:cursor-not-allowed text-stone-700 font-medium py-3 px-6 rounded-lg transition-colors flex items-center justify-center"
          >
            {isSubmitting ? (
              <div className="animate-spin w-4 h-4 border-2 border-stone-700 border-t-transparent rounded-full mr-2"></div>
            ) : null}
            No thanks, continue without consent
          </button>
        </div>
      </div>
    </div>
  );
};
