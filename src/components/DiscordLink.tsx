'use client';
import { useState, useEffect, useCallback } from 'react';
import { apiService, DiscordLinkCode, DiscordLinkStatus } from '../services/api';
import { useSession, signOut } from 'next-auth/react';

interface DiscordLinkProps {
  onLinkComplete?: () => void;
  initialLinked?: boolean;
  initialDiscordId?: string;
}

export const DiscordLink: React.FC<DiscordLinkProps> = ({ 
  onLinkComplete, 
  initialLinked = false, 
  initialDiscordId 
}) => {
  const { data: session, status } = useSession();
  const [linkCode, setLinkCode] = useState<DiscordLinkCode | null>(null);
  const [isLinked, setIsLinked] = useState(initialLinked);
  const [discordId, setDiscordId] = useState<string | undefined>(initialDiscordId);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [pollInterval, setPollInterval] = useState<NodeJS.Timeout | null>(null);

  // Memoize the onLinkComplete callback to prevent unnecessary re-renders
  const handleLinkComplete = useCallback(() => {
    onLinkComplete?.();
  }, [onLinkComplete]);

  // Calculate time remaining for countdown
  useEffect(() => {
    if (!linkCode?.expires_at) return;

    const updateTimeRemaining = () => {
      const expiresAt = new Date(linkCode.expires_at).getTime();
      const now = Date.now();
      const remaining = Math.max(0, Math.floor((expiresAt - now) / 1000));
      setTimeRemaining(remaining);

      if (remaining === 0) {
        setLinkCode(null);
        setError('Verification code expired. Please generate a new one.');
      }
    };

    updateTimeRemaining();
    const timer = setInterval(updateTimeRemaining, 1000);

    return () => clearInterval(timer);
  }, [linkCode?.expires_at]);

  // Poll for link status when code is active
  useEffect(() => {
    if (!linkCode || isLinked || !session?.djangoAccessToken) return;

    const checkStatus = async () => {
      try {
        const response = await apiService.checkDiscordLinkStatus(session.djangoAccessToken);
        if (response.data?.linked) {
          setIsLinked(true);
          setDiscordId(response.data.discord_id);
          setLinkCode(null);
          // Clear any existing interval
          if (pollInterval) {
            clearInterval(pollInterval);
            setPollInterval(null);
          }
          handleLinkComplete();
        }
      } catch (error) {
        console.error('Error checking link status:', error);
      }
    };

    const interval = setInterval(checkStatus, 3000); // Poll every 3 seconds
    setPollInterval(interval);

    return () => {
      clearInterval(interval);
      setPollInterval(null);
    };
  }, [linkCode, isLinked, handleLinkComplete, session?.djangoAccessToken]);

  const generateCode = async () => {
    setLoading(true);
    setError('');
    
    try {
      // Check if user is authenticated with NextAuth
      if (status !== "authenticated" || !session?.djangoAccessToken) {
        setError('No authentication session found. Please try logging in again.');
        return;
      }
      
      const response = await apiService.startDiscordLink(session.djangoAccessToken);
      if (response.data) {
        setLinkCode(response.data);
      } else {
        console.error('API Error:', response.error);
        setError(response.error || 'Failed to generate verification code');
      }
    } catch (error) {
      console.error('Network Error:', error);
      setError(error instanceof Error ? error.message : 'Failed to generate verification code');
    } finally {
      setLoading(false);
    }
  };

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (isLinked) {
    return (
      <div className="bg-green-50 border border-green-200 rounded-lg p-6">
        <div className="flex items-center">
          <div className="flex-shrink-0">
            <svg className="h-6 w-6 text-green-600" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div className="ml-3">
            <h3 className="text-sm font-medium text-green-800">
              Discord Account Linked
            </h3>
            <div className="mt-2 text-sm text-green-700">
              <p>Your Discord account is successfully linked to your profile.</p>
              {discordId && (
                <p className="mt-1 font-mono text-xs">Discord ID: {discordId}</p>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white border border-stone-200 rounded-lg p-6">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-lg font-medium text-stone-900">Link Discord Account</h3>
          <p className="text-sm text-stone-600">
            Connect your Discord account to participate in community activities
          </p>
        </div>
        <div className="flex-shrink-0">
          <svg className="h-8 w-8 text-indigo-600" viewBox="0 0 24 24" fill="currentColor">
            <path d="M20.317 4.3698a19.7913 19.7913 0 00-4.8851-1.5152.0741.0741 0 00-.0785.0371c-.211.3753-.4447.8648-.6083 1.2495-1.8447-.2762-3.68-.2762-5.4868 0-.1636-.3933-.4058-.8742-.6177-1.2495a.077.077 0 00-.0785-.037 19.7363 19.7363 0 00-4.8852 1.515.0699.0699 0 00-.0321.0277C.5334 9.0458-.319 13.5799.0992 18.0578a.0824.0824 0 00.0312.0561c2.0528 1.5076 4.0413 2.4228 5.9929 3.0294a.0777.0777 0 00.0842-.0276c.4616-.6304.8731-1.2952 1.226-1.9942a.076.076 0 00-.0416-.1057c-.6528-.2476-1.2743-.5495-1.8722-.8923a.077.077 0 01-.0076-.1277c.1258-.0943.2517-.1923.3718-.2914a.0743.0743 0 01.0776-.0105c3.9278 1.7933 8.18 1.7933 12.0614 0a.0739.0739 0 01.0785.0095c.1202.099.246.1981.3728.2924a.077.077 0 01-.0066.1276 12.2986 12.2986 0 01-1.873.8914.0766.0766 0 00-.0407.1067c.3604.698.7719 1.3628 1.225 1.9932a.076.076 0 00.0842.0286c1.961-.6067 3.9495-1.5219 6.0023-3.0294a.077.077 0 00.0313-.0552c.5004-5.177-.8382-9.6739-3.5485-13.6604a.061.061 0 00-.0312-.0286zM8.02 15.3312c-1.1825 0-2.1569-1.0857-2.1569-2.419 0-1.3332.9555-2.4189 2.157-2.4189 1.2108 0 2.1757 1.0952 2.1568 2.419-.0002 1.3332-.9555 2.4189-2.1569 2.4189zm7.9748 0c-1.1825 0-2.1569-1.0857-2.1569-2.419 0-1.3332.9554-2.4189 2.1569-2.4189 1.2108 0 2.1757 1.0952 2.1568 2.419 0 1.3332-.9555 2.4189-2.1568 2.4189Z"/>
          </svg>
        </div>
      </div>

      {error && (
        <div className="mb-4 bg-red-50 border border-red-200 rounded-md p-3">
          <div className="text-sm text-red-700">{error}</div>
          {(error.includes('session has expired') || error.includes('Authentication token missing')) && (
            <div className="mt-2 flex gap-2">
              <button
                onClick={() => window.location.reload()}
                className="text-xs text-red-600 underline hover:text-red-800"
              >
                Refresh page
              </button>
              <span className="text-xs text-red-400">or</span>
              <button
                onClick={() => signOut()}
                className="text-xs text-red-600 underline hover:text-red-800"
              >
                Clear session & restart
              </button>
            </div>
          )}
        </div>
      )}

      {!linkCode ? (
        <div>
          <p className="text-sm text-stone-600 mb-4">
            Generate a verification code to link your Discord account. This will allow you to participate in Discord-based activities and earn points.
          </p>
          <button
            onClick={generateCode}
            disabled={loading}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
          >
            {loading ? (
              <>
                <svg className="animate-spin -ml-1 mr-3 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Generating...
              </>
            ) : (
              'Generate Verification Code'
            )}
          </button>
        </div>
      ) : (
        <div>
          <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-4 mb-4">
            <div className="text-center">
              <h4 className="text-lg font-semibold text-indigo-900 mb-2">Verification Code</h4>
              <div className="text-3xl font-mono font-bold text-indigo-700 tracking-widest mb-2">
                {linkCode.code}
              </div>
              <div className="text-sm text-indigo-600">
                Expires in: <span className="font-semibold">{formatTime(timeRemaining)}</span>
              </div>
            </div>
          </div>

          <div className="bg-stone-50 border border-stone-200 rounded-lg p-4">
            <h5 className="font-medium text-stone-900 mb-2">How to link your account:</h5>
            <ol className="text-sm text-stone-600 space-y-1">
              <li className="flex items-start">
                <span className="flex-shrink-0 w-5 h-5 bg-indigo-100 text-indigo-800 rounded-full flex items-center justify-center text-xs font-medium mr-2">1</span>
                Open Discord and go to the server
              </li>
              <li className="flex items-start">
                <span className="flex-shrink-0 w-5 h-5 bg-indigo-100 text-indigo-800 rounded-full flex items-center justify-center text-xs font-medium mr-2">2</span>
                Type the command: <code className="bg-stone-200 px-1 rounded">!link {linkCode.code}</code>
              </li>
              <li className="flex items-start">
                <span className="flex-shrink-0 w-5 h-5 bg-indigo-100 text-indigo-800 rounded-full flex items-center justify-center text-xs font-medium mr-2">3</span>
                Wait for confirmation - this page will update automatically
              </li>
            </ol>
          </div>

          <div className="mt-4 flex items-center text-sm text-stone-500">
            <svg className="animate-spin h-4 w-4 mr-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            Waiting for Discord verification...
          </div>
        </div>
      )}
    </div>
  );
};
