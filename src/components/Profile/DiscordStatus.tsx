'use client';

import { useState, useEffect } from 'react';
import { User, DiscordVerificationStatus, apiService } from '@/services/api';
import { useSession } from 'next-auth/react';
import { FiCheck, FiX, FiAlertCircle } from 'react-icons/fi';

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
        // Discord status error
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
      <div className="glass-card p-6">
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
      <div className="glass-card p-6">
        <h3 className="text-lg font-semibold text-stone-900 mb-4">Discord Integration</h3>
        <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-md flex items-center">
          <FiAlertCircle className="mr-2" size={16} />
          {error}
        </div>
      </div>
    );
  }

  const getStatusColor = () => {
    // Check if we have discordStatus from API
    if (discordStatus) {
      if (discordStatus.discord_verified) return 'green';
      if (discordStatus.discord_linked) return 'yellow';
      return 'red';
    }
    
    // Fallback to user data if Discord API status is not available
    if (user.discord_verified) return 'green';
    if (user.discord_id || user.discord_username_unverified) return 'yellow';
    return 'red';
  };

  const getStatusText = () => {
    // Check if we have discordStatus from API
    if (discordStatus) {
      if (discordStatus.discord_verified) return 'Verified';
      if (discordStatus.discord_linked) return 'Linked (Unverified)';
      return 'Not Linked';
    }
    
    // Fallback to user data if Discord API status is not available
    if (user.discord_verified) return 'Verified';
    if (user.discord_id || user.discord_username_unverified) return 'Linked (Unverified)';
    return 'Not Found';
  };

  const getStatusIcon = () => {
    const color = getStatusColor();
    if (color === 'green') return <FiCheck className="text-green-600" size={16} />;
    if (color === 'yellow') return <FiAlertCircle className="text-yellow-600" size={16} />;
    return <FiX className="text-red-600" size={16} />;
  };

  const statusColor = getStatusColor();

  return (
    <div className="glass-card p-6">
      <h3 className="text-lg font-semibold text-stone-900 mb-4">Discord Integration</h3>
      
      <div className="space-y-4">
        {/* Overall Status */}
        <div className="profile-field flex items-center justify-between p-4 bg-stone-50 rounded-lg">
          <div className="flex items-center">
            {getStatusIcon()}
            <span className="ml-2 font-medium text-stone-900">
              {(discordStatus?.discord_verified_at || user.discord_verified_at) 
                ? `Connected at ${formatDate(discordStatus?.discord_verified_at || user.discord_verified_at)}`
                : 'Connection Status'
              }
            </span>
          </div>
          <div className="text-right">
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
        </div>

        {/* Success Message for Verified Users */}
        {(discordStatus?.discord_verified || user.discord_verified) && (
          <div className="profile-field bg-green-50 border border-green-200 rounded-md p-4">
            <p className="text-sm text-green-800">
              All your activities on Discord and points earned are now correctly reflected here in your dashboard.
            </p>
          </div>
        )}

      </div>
    </div>
  );
}
