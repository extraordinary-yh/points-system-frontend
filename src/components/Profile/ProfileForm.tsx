'use client';

import { useState } from 'react';
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
  
  const [formData, setFormData] = useState<ProfileUpdateRequest>({
    first_name: user.first_name || '',
    last_name: user.last_name || '',
    university: user.university || '',
    major: user.major || '',
    graduation_year: user.graduation_year || undefined,
    display_name: user.display_name || user.username,
    media_consent: user.media_consent || false,
  });

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
        onProfileUpdate(response.data);
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
      display_name: user.display_name || user.username,
      media_consent: user.media_consent || false,
    });
    setIsEditing(false);
    setError(null);
    setSuccess(null);
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

          {/* Display Name */}
          <div>
            <label className="block text-sm font-medium text-stone-700 mb-1">
              Display Name
            </label>
            {isEditing ? (
              <input
                type="text"
                name="display_name"
                value={formData.display_name}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-stone-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="How you want to be displayed"
                required
              />
            ) : (
              <p className="text-stone-900 py-2">{user.display_name || user.username}</p>
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
        <h3 className="text-lg font-semibold text-stone-900 mb-4">Account Settings</h3>
        
        <div className="space-y-4">
          {/* Media Consent */}
          <div className="flex items-center justify-between">
            <div>
              <label className="block text-sm font-medium text-stone-700">
                Media Consent Agreement
              </label>
              <p className="text-xs text-stone-500 mt-1">
                Allow Propel2Excel to use your photos and activities in promotional materials
              </p>
            </div>
            {isEditing ? (
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  name="media_consent"
                  checked={formData.media_consent}
                  onChange={handleInputChange}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-stone-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-stone-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
              </label>
            ) : (
              <span className={`px-2 py-1 text-xs rounded-full ${
                user.media_consent 
                  ? 'bg-green-100 text-green-800' 
                  : 'bg-red-100 text-red-800'
              }`}>
                {user.media_consent ? 'Agreed' : 'Not Agreed'}
              </span>
            )}
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
