'use client';

import { useState, useEffect } from 'react';
import { User, ProfileUpdateRequest, apiService } from '@/services/api';
import { useSession } from 'next-auth/react';

interface ProfileFormProps {
  user: User;
  onProfileUpdate: (updatedUser: User) => void;
}

export function ProfileForm({ user, onProfileUpdate }: ProfileFormProps) {
  const { data: session } = useSession();
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isUpdatingConsent, setIsUpdatingConsent] = useState(false);
  // Separate state for media consent to avoid conflicts
  const [mediaConsentState, setMediaConsentState] = useState(user.media_consent || false);
  
  const [formData, setFormData] = useState<ProfileUpdateRequest>({
    first_name: user.first_name || '',
    last_name: user.last_name || '',
    university: user.university || '',
    major: user.major || '',
    graduation_year: user.graduation_year || undefined,
    media_consent: user.media_consent || false,
  });

  // Update form data when user prop changes (e.g., after profile update)
  // But completely isolate media_consent to avoid conflicts
  useEffect(() => {
    console.log('useEffect triggered - user.media_consent:', user.media_consent, 'isUpdatingConsent:', isUpdatingConsent);
    
    setFormData(prev => ({
      first_name: user.first_name || '',
      last_name: user.last_name || '',
      university: user.university || '',
      major: user.major || '',
      graduation_year: user.graduation_year || undefined,
      media_consent: prev.media_consent, // Keep existing value during updates
    }));
    
    // Only update mediaConsentState if we're not in the middle of an update
    if (!isUpdatingConsent) {
      console.log('Updating mediaConsentState from user prop:', user.media_consent);
      setMediaConsentState(user.media_consent || false);
      setFormData(prev => ({
        ...prev,
        media_consent: user.media_consent || false,
      }));
    } else {
      console.log('Skipping mediaConsentState update - currently updating');
    }
  }, [user, isUpdatingConsent]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData(prev => ({
        ...prev,
        [name]: checked
      }));
    } else if (name === 'graduation_year') {
      setFormData(prev => ({
        ...prev,
        [name]: value ? parseInt(value) : undefined
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!session?.djangoAccessToken) return;

    setIsLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const response = await apiService.updateProfile(formData, session.djangoAccessToken);
      
      if (response.error) {
        setError(response.error);
      } else if (response.data) {
        setSuccess('Profile updated successfully!');
        
        // Make sure to call onProfileUpdate with the server response
        onProfileUpdate(response.data);
        
        // Fetch fresh data to ensure consistency
        try {
          const freshProfileResponse = await apiService.getProfile(session.djangoAccessToken);
          if (freshProfileResponse.data) {
            onProfileUpdate(freshProfileResponse.data);
          }
        } catch (freshDataError) {
          console.warn('Failed to fetch fresh profile data:', freshDataError);
        }
        
        setIsEditing(false);
        
        // Clear success message after 3 seconds
        setTimeout(() => setSuccess(null), 3000);
      }
    } catch (err) {
      setError('Failed to update profile. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    setFormData({
      first_name: user.first_name || '',
      last_name: user.last_name || '',
      university: user.university || '',
      major: user.major || '',
      graduation_year: user.graduation_year || undefined,
      media_consent: user.media_consent || false,
    });
    setIsEditing(false);
    setError(null);
    setSuccess(null);
  };

  // Separate handler for media consent toggle - works independently
  const handleMediaConsentToggle = async (newConsent: boolean) => {
    if (!session?.djangoAccessToken || isUpdatingConsent) return;

    setIsUpdatingConsent(true);
    setError(null);
    setSuccess(null);

    try {
      const response = await apiService.updateProfile(
        { media_consent: newConsent }, 
        session.djangoAccessToken
      );
      
      if (response.error) {
        setError(response.error);
        // Revert both states since backend failed
        setMediaConsentState(!newConsent);
        setFormData(prev => ({
          ...prev,
          media_consent: !newConsent
        }));
      } else if (response.data) {
        setSuccess(`Media consent ${newConsent ? 'granted' : 'withdrawn'} successfully!`);
        
        // Debug: Log the backend response
        console.log('Backend response for media consent:', response.data);
        console.log('Backend media_consent value:', response.data.media_consent);
        
        // Extract the actual user data from the nested response
        const userData = (response.data as any).data || response.data;
        console.log('Extracted user data:', userData);
        console.log('Extracted media_consent:', userData.media_consent);
        
        // Keep the optimistic update in place - don't override it
        setMediaConsentState(newConsent);
        setFormData(prev => ({
          ...prev,
          media_consent: newConsent
        }));
        
        // Update parent component with the actual user data, not the wrapper
        onProfileUpdate(userData);
        
        // Clear success message after 3 seconds
        setTimeout(() => setSuccess(null), 3000);
      }
    } catch (err) {
      setError('Failed to update media consent. Please try again.');
      // Revert both states since backend failed
      setMediaConsentState(!newConsent);
      setFormData(prev => ({
        ...prev,
        media_consent: !newConsent
      }));
    } finally {
      setIsUpdatingConsent(false);
    }
  };

  const formatMemberSince = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <div className="space-y-6">
      {/* Success/Error Messages */}
      {success && (
        <div className="bg-green-50 border border-green-200 text-green-800 px-4 py-3 rounded-md">
          {success}
        </div>
      )}
      
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-md">
          {error}
        </div>
      )}

      {/* Personal Information Section */}
      <div className="bg-white border border-stone-200 rounded-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-stone-900">Personal Information</h3>
          {!isEditing ? (
            <button
              onClick={() => setIsEditing(true)}
              className="text-blue-600 hover:text-blue-700 text-sm font-medium"
            >
              Edit Profile
            </button>
          ) : (
            <div className="flex space-x-2">
              <button
                onClick={handleCancel}
                disabled={isLoading}
                className="px-3 py-1 text-sm text-stone-600 hover:text-stone-700 disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={handleSubmit}
                disabled={isLoading}
                className="px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
              >
                {isLoading ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          )}
        </div>

        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* First Name */}
          <div>
            <label className="block text-sm font-medium text-stone-700 mb-1">
              First Name
            </label>
            {isEditing ? (
              <input
                type="text"
                name="first_name"
                value={formData.first_name}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-stone-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter your first name"
              />
            ) : (
              <p className="text-stone-900 py-2">{user.first_name || 'Not provided'}</p>
            )}
          </div>

          {/* Last Name */}
          <div>
            <label className="block text-sm font-medium text-stone-700 mb-1">
              Last Name
            </label>
            {isEditing ? (
              <input
                type="text"
                name="last_name"
                value={formData.last_name}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-stone-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter your last name"
              />
            ) : (
              <p className="text-stone-900 py-2">{user.last_name || 'Not provided'}</p>
            )}
          </div>

          {/* University */}
          <div>
            <label className="block text-sm font-medium text-stone-700 mb-1">
              University
            </label>
            {isEditing ? (
              <input
                type="text"
                name="university"
                value={formData.university}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-stone-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter your university"
              />
            ) : (
              <p className="text-stone-900 py-2">{user.university || 'Not provided'}</p>
            )}
          </div>

          {/* Major */}
          <div>
            <label className="block text-sm font-medium text-stone-700 mb-1">
              Major
            </label>
            {isEditing ? (
              <input
                type="text"
                name="major"
                value={formData.major}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-stone-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter your major"
              />
            ) : (
              <p className="text-stone-900 py-2">{user.major || 'Not provided'}</p>
            )}
          </div>

          {/* Graduation Year */}
          <div>
            <label className="block text-sm font-medium text-stone-700 mb-1">
              Graduation Year
            </label>
            {isEditing ? (
              <input
                type="number"
                name="graduation_year"
                value={formData.graduation_year || ''}
                onChange={handleInputChange}
                min="2020"
                max="2035"
                className="w-full px-3 py-2 border border-stone-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="e.g., 2025"
              />
            ) : (
              <p className="text-stone-900 py-2">{user.graduation_year || 'Not provided'}</p>
            )}
          </div>
        </form>
      </div>

      {/* Account Settings Section */}
      <div className="bg-white border border-stone-200 rounded-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-stone-900">Account Settings</h3>
          {/* Media Consent Status - positioned with header */}
          <div className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
            mediaConsentState 
              ? 'bg-green-100 text-green-800' 
              : 'bg-red-100 text-red-800'
          }`}>
            <div className={`w-2 h-2 rounded-full mr-2 ${
              mediaConsentState ? 'bg-green-500' : 'bg-red-500'
            }`}></div>
            {mediaConsentState ? 'Consent Granted' : 'Consent Not Given'}
          </div>
        </div>
        
        <div className="space-y-4">
          {/* Media Consent */}
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <label className="block text-sm font-medium text-stone-700">
                Media Consent Agreement
              </label>
              <p className="text-xs text-stone-500 mt-1">
                Allow Propel2Excel to use your photos and activities in promotional materials
              </p>
            </div>
            
            <div className="flex flex-col items-end">
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={mediaConsentState}
                  onChange={(e) => {
                    const newValue = e.target.checked;
                    // Optimistically update both states for immediate UI feedback
                    setMediaConsentState(newValue);
                    setFormData(prev => ({ ...prev, media_consent: newValue }));
                    // Then update the backend
                    handleMediaConsentToggle(newValue);
                  }}
                  disabled={isUpdatingConsent}
                  className="sr-only peer"
                />
                <div className={`w-11 h-6 bg-stone-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-stone-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600 ${
                  isUpdatingConsent ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'
                }`}></div>
              </label>
              
              {/* Loading indicator */}
              {isUpdatingConsent && (
                <div className="text-xs text-stone-500 mt-1 flex items-center">
                  <div className="animate-spin -ml-1 mr-2 h-3 w-3 border-2 border-stone-300 border-t-stone-600 rounded-full"></div>
                  Updating...
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Read-only Account Information */}
      <div className="bg-stone-50 border border-stone-200 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-stone-900 mb-4">Account Information</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-stone-700 mb-1">
              Username
            </label>
            <p className="text-stone-900 py-2">{user.username}</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-stone-700 mb-1">
              Email Address
            </label>
            <p className="text-stone-900 py-2">{user.email}</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-stone-700 mb-1">
              Member Since
            </label>
            <p className="text-stone-900 py-2">{formatMemberSince(user.created_at)}</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-stone-700 mb-1">
              Account Type
            </label>
            <p className="text-stone-900 py-2 capitalize">{user.role}</p>
          </div>
        </div>
      </div>
    </div>
  );
}