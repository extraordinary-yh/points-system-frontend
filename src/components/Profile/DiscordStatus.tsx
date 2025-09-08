'use client';

import { useState, useEffect } from 'react';
import { User, DiscordVerificationStatus, apiService } from '@/services/api';
import { useSession } from 'next-auth/react';
import { FiCheck, FiX, FiAlertCircle, FiExternalLink } from 'react-icons/fi';

interface DiscordStatusProps {
  user: User;
}

export function DiscordStatus({ user }: DiscordStatusProps) {
  const { data: session } = useSession();
  const [discordStatus, setDiscordStatus] = useState<DiscordVerificationStatus | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchDiscordStatus = async () => {
      if (!session?.djangoAccessToken) return;

      try {
        setIsLoading(true);
        const response = await apiService.getDiscordVerificationStatus(session.djangoAccessToken);
        
        if (response.error) {
          setError(response.error);
        } else if (response.data) {
          setDiscordStatus(response.data);
        }
      } catch (err) {
        setError('Failed to fetch Discord status');
        console.error('Discord status error:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchDiscordStatus();
  }, [session?.djangoAccessToken]);

  const formatDate = (dateString?: string) => {
    if (!dateString) return null;
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (isLoading) {
    return (
      <div className="bg-white border border-stone-200 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-stone-900 mb-4">Discord Integration</h3>
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
          <span className="ml-2 text-stone-600">Loading Discord status...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white border border-stone-200 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-stone-900 mb-4">Discord Integration</h3>
        <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-md flex items-center">
          <FiAlertCircle className="mr-2" size={16} />
          {error}
        </div>
      </div>
    );
  }

  const getStatusColor = () => {
    if (discordStatus?.discord_verified) return 'green';
    if (discordStatus?.discord_linked) return 'yellow';
    return 'red';
  };

  const getStatusText = () => {
    if (discordStatus?.discord_verified) return 'Verified';
    if (discordStatus?.discord_linked) return 'Linked (Unverified)';
    return 'Not Linked';
  };

  const getStatusIcon = () => {
    const color = getStatusColor();
    if (color === 'green') return <FiCheck className="text-green-600" size={16} />;
    if (color === 'yellow') return <FiAlertCircle className="text-yellow-600" size={16} />;
    return <FiX className="text-red-600" size={16} />;
  };

  const statusColor = getStatusColor();

  return (
    <div className="bg-white border border-stone-200 rounded-lg p-6">
      <h3 className="text-lg font-semibold text-stone-900 mb-4">Discord Integration</h3>
      
      <div className="space-y-4">
        {/* Overall Status */}
        <div className="flex items-center justify-between p-4 bg-stone-50 rounded-lg">
          <div className="flex items-center">
            {getStatusIcon()}
            <span className="ml-2 font-medium text-stone-900">
              Connection Status
            </span>
          </div>
          <span className={`px-3 py-1 text-sm rounded-full ${
            statusColor === 'green' 
              ? 'bg-green-100 text-green-800' 
              : statusColor === 'yellow'
              ? 'bg-yellow-100 text-yellow-800'
              : 'bg-red-100 text-red-800'
          }`}>
            {getStatusText()}
          </span>
        </div>

        {/* Discord Information */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-stone-700 mb-1">
              Discord Username
            </label>
            <p className="text-stone-900 py-2">
              {discordStatus?.discord_username || user.discord_username_unverified || 'Not provided'}
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-stone-700 mb-1">
              Discord ID
            </label>
            <p className="text-stone-900 py-2">
              {discordStatus?.discord_id || 'Not linked'}
            </p>
          </div>

          {discordStatus?.discord_verified_at && (
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-stone-700 mb-1">
                Verified At
              </label>
              <p className="text-stone-900 py-2">
                {formatDate(discordStatus.discord_verified_at)}
              </p>
            </div>
          )}
        </div>

        {/* Status-specific Messages */}
        {!discordStatus?.discord_linked && (
          <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
            <div className="flex items-start">
              <FiAlertCircle className="text-blue-600 mt-0.5 mr-2" size={16} />
              <div>
                <h4 className="text-sm font-medium text-blue-900 mb-1">
                  Discord Not Linked
                </h4>
                <p className="text-sm text-blue-800 mb-3">
                  Link your Discord account to access exclusive features and verify your identity.
                </p>
                <button className="inline-flex items-center text-sm text-blue-700 hover:text-blue-800 font-medium">
                  <FiExternalLink className="mr-1" size={14} />
                  Link Discord Account
                </button>
              </div>
            </div>
          </div>
        )}

        {discordStatus?.discord_linked && !discordStatus?.discord_verified && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4">
            <div className="flex items-start">
              <FiAlertCircle className="text-yellow-600 mt-0.5 mr-2" size={16} />
              <div>
                <h4 className="text-sm font-medium text-yellow-900 mb-1">
                  Verification Pending
                </h4>
                <p className="text-sm text-yellow-800 mb-3">
                  Your Discord account is linked but not yet verified. Complete verification to access all features.
                </p>
                <button className="inline-flex items-center text-sm text-yellow-700 hover:text-yellow-800 font-medium">
                  <FiExternalLink className="mr-1" size={14} />
                  Complete Verification
                </button>
              </div>
            </div>
          </div>
        )}

        {discordStatus?.discord_verified && (
          <div className="bg-green-50 border border-green-200 rounded-md p-4">
            <div className="flex items-start">
              <FiCheck className="text-green-600 mt-0.5 mr-2" size={16} />
              <div>
                <h4 className="text-sm font-medium text-green-900 mb-1">
                  Successfully Verified
                </h4>
                <p className="text-sm text-green-800">
                  Your Discord account is fully verified and integrated with your Propel2Excel profile.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Security Note */}
        {discordStatus?.verification_required && (
          <div className="bg-stone-50 border border-stone-200 rounded-md p-4">
            <div className="flex items-start">
              <FiAlertCircle className="text-stone-600 mt-0.5 mr-2" size={16} />
              <div>
                <h4 className="text-sm font-medium text-stone-900 mb-1">
                  Enhanced Security
                </h4>
                <p className="text-sm text-stone-700">
                  Discord verification is required for sensitive account changes like password updates.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
