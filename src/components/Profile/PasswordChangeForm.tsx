'use client';

import { useState, useEffect } from 'react';
import { PasswordChangeRequest, DiscordVerificationStatus, apiService } from '@/services/api';
import { useSession } from 'next-auth/react';
import { FiEye, FiEyeOff, FiLock, FiAlertCircle } from 'react-icons/fi';

export function PasswordChangeForm() {
  const { data: session } = useSession();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [discordStatus, setDiscordStatus] = useState<DiscordVerificationStatus | null>(null);
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false
  });
  
  const [formData, setFormData] = useState<PasswordChangeRequest & { confirmPassword: string }>({
    current_password: '',
    new_password: '',
    confirmPassword: '',
    discord_id: '',
  });

  // Fetch Discord verification status on component mount
  useEffect(() => {
    const fetchDiscordStatus = async () => {
      if (!session?.djangoAccessToken) return;

      try {
        const response = await apiService.getDiscordVerificationStatus(session.djangoAccessToken);
        if (response.data) {
          setDiscordStatus(response.data);
          if (response.data?.discord_id) {
            setFormData(prev => ({
              ...prev,
              discord_id: response.data?.discord_id || ''
            }));
          }
        }
      } catch (err) {
        // Failed to fetch Discord status
      }
    };

    fetchDiscordStatus();
  }, [session?.djangoAccessToken]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear errors when user starts typing
    if (error) setError(null);
  };

  const togglePasswordVisibility = (field: 'current' | 'new' | 'confirm') => {
    setShowPasswords(prev => ({
      ...prev,
      [field]: !prev[field]
    }));
  };

  const validateForm = (): string | null => {
    if (!formData.current_password) {
      return 'Current password is required';
    }
    
    if (!formData.new_password) {
      return 'New password is required';
    }
    
    if (formData.new_password.length < 8) {
      return 'New password must be at least 8 characters long';
    }
    
    if (formData.new_password !== formData.confirmPassword) {
      return 'New passwords do not match';
    }
    
    if (formData.current_password === formData.new_password) {
      return 'New password must be different from current password';
    }
    
    // Check if Discord verification is required
    if (discordStatus?.verification_required && !formData.discord_id) {
      return 'Discord ID is required for verification';
    }
    
    return null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!session?.djangoAccessToken) return;

    const validationError = validateForm();
    if (validationError) {
      setError(validationError);
      return;
    }

    setIsLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const passwordData: PasswordChangeRequest = {
        current_password: formData.current_password,
        new_password: formData.new_password,
      };

      // Add Discord ID if required
      if (discordStatus?.verification_required && formData.discord_id) {
        passwordData.discord_id = formData.discord_id;
      }

      const response = await apiService.changePassword(passwordData, session.djangoAccessToken);
      
      if (response.error) {
        setError(response.error);
      } else if (response.data) {
        setSuccess(response.data.message || 'Password changed successfully!');
        
        // Reset form
        setFormData({
          current_password: '',
          new_password: '',
          confirmPassword: '',
          discord_id: discordStatus?.discord_id || '',
        });
        
        // Clear success message after 5 seconds
        setTimeout(() => setSuccess(null), 5000);
      }
    } catch (err) {
      setError('Failed to change password. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const PasswordInput = ({
    name, 
    label, 
    value, 
    placeholder, 
    showPassword, 
    onToggleVisibility 
  }: {
    name: string;
    label: string;
    value: string;
    placeholder: string;
    showPassword: boolean;
    onToggleVisibility: () => void;
  }) => (
    <div className="profile-field">
      <label className="block text-sm font-medium text-stone-700 mb-1">
        {label}
      </label>
      <div className="relative">
        <input
          type={showPassword ? 'text' : 'password'}
          name={name}
          value={value}
          onChange={handleInputChange}
          className="w-full px-3 py-2 pr-10 border border-stone-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder={placeholder}
          required
        />
        <button
          type="button"
          onClick={onToggleVisibility}
          className="absolute inset-y-0 right-0 pr-3 flex items-center text-stone-400 hover:text-stone-600"
        >
          {showPassword ? <FiEyeOff size={16} /> : <FiEye size={16} />}
        </button>
      </div>
    </div>
  );

  return (
    <div className="glass-card p-6">
      <div className="flex items-center mb-4">
        <FiLock className="mr-2 text-stone-600" size={20} />
        <h3 className="text-lg font-semibold text-stone-900">Change Password</h3>
      </div>

      {/* Success/Error Messages */}
      {success && (
        <div className="bg-green-50 border border-green-200 text-green-800 px-4 py-3 rounded-md mb-4">
          {success}
        </div>
      )}
      
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-md mb-4 flex items-center">
          <FiAlertCircle className="mr-2" size={16} />
          {error}
        </div>
      )}


      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Current Password */}
        <PasswordInput
          name="current_password"
          label="Current Password"
          value={formData.current_password}
          placeholder="Enter your current password"
          showPassword={showPasswords.current}
          onToggleVisibility={() => togglePasswordVisibility('current')}
        />

        {/* New Password */}
        <PasswordInput
          name="new_password"
          label="New Password"
          value={formData.new_password}
          placeholder="Enter your new password (min. 8 characters)"
          showPassword={showPasswords.new}
          onToggleVisibility={() => togglePasswordVisibility('new')}
        />

        {/* Confirm New Password */}
        <PasswordInput
          name="confirmPassword"
          label="Confirm New Password"
          value={formData.confirmPassword}
          placeholder="Confirm your new password"
          showPassword={showPasswords.confirm}
          onToggleVisibility={() => togglePasswordVisibility('confirm')}
        />

        {/* Discord ID (if required) */}
        {discordStatus?.verification_required && (
          <div className="profile-field">
            <label className="block text-sm font-medium text-stone-700 mb-1">
              Discord ID <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="discord_id"
              value={formData.discord_id}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-stone-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter your Discord ID for verification"
              required
            />
            <p className="text-xs text-stone-500 mt-1">
              Your Discord ID is required to verify your identity for password changes.
            </p>
          </div>
        )}

        {/* Password Requirements */}
        <div className="bg-stone-50 border border-stone-200 rounded-md p-3">
          <p className="text-sm font-medium text-stone-700 mb-2">Password Requirements:</p>
          <ul className="text-xs text-stone-600 space-y-1">
            <li className={`flex items-center ${formData.new_password.length >= 8 ? 'text-green-600' : ''}`}>
              <span className="mr-2">{formData.new_password.length >= 8 ? '✓' : '•'}</span>
              At least 8 characters long
            </li>
            <li className={`flex items-center ${formData.new_password && formData.new_password !== formData.current_password ? 'text-green-600' : ''}`}>
              <span className="mr-2">{formData.new_password && formData.new_password !== formData.current_password ? '✓' : '•'}</span>
              Different from current password
            </li>
            <li className={`flex items-center ${formData.new_password && formData.confirmPassword && formData.new_password === formData.confirmPassword ? 'text-green-600' : ''}`}>
              <span className="mr-2">{formData.new_password && formData.confirmPassword && formData.new_password === formData.confirmPassword ? '✓' : '•'}</span>
              Passwords match
            </li>
          </ul>
        </div>

        {/* Submit Button */}
        <div className="flex justify-end pt-4">
          <button
            type="submit"
            disabled={isLoading}
            className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
          >
            {isLoading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Changing Password...
              </>
            ) : (
              <>
                <FiLock className="mr-2" size={16} />
                Change Password
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
