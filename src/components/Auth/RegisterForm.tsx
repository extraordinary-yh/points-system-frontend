'use client';
import { useState } from 'react';
import { signIn } from 'next-auth/react';
import { apiService } from '../../services/api';

export const RegisterForm = ({ onSwitchToLogin }: { onSwitchToLogin: () => void }) => {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    role: 'student',
    discord_username: '',
    university: '',
    major: '',
    graduation_year: new Date().getFullYear() + 4,
    company: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // Remove empty fields
      const cleanData = Object.fromEntries(
        Object.entries(formData).filter(([_, value]) => value !== '')
      ) as typeof formData;
      
      // Call Django registration API directly
      const response = await apiService.register(cleanData);
      
      if (response.data) {
        // Registration successful, now sign in with NextAuth
        const result = await signIn('credentials', {
          username: cleanData.username,
          password: cleanData.password,
          redirect: false,
        });

        if (result?.error) {
          setError('Registration successful but automatic login failed. Please try logging in manually.');
        }
        // If successful, NextAuth will handle the session
      } else {
        setError(response.error || 'Registration failed');
      }
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ 
      ...prev, 
      [name]: name === 'graduation_year' ? parseInt(value) || 0 : value 
    }));
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-stone-100">
      <div className="max-w-md w-full space-y-8 bg-white p-8 rounded-lg shadow-lg">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-stone-900">
            Join Propel2Excel
          </h2>
          <p className="mt-2 text-center text-sm text-stone-600">
            Create your student account
          </p>
        </div>
        
        <form className="mt-8 space-y-4" onSubmit={handleSubmit}>
          {/* Basic Info */}
          <div>
            <label htmlFor="username" className="block text-sm font-medium text-stone-700">
              Username *
            </label>
            <input
              id="username"
              name="username"
              type="text"
              required
              className="mt-1 block w-full px-3 py-2 border border-stone-300 rounded-md shadow-sm focus:outline-none focus:ring-violet-500 focus:border-violet-500"
              value={formData.username}
              onChange={handleChange}
            />
          </div>

          <div>
            <label htmlFor="email" className="block text-sm font-medium text-stone-700">
              Email *
            </label>
            <input
              id="email"
              name="email"
              type="email"
              required
              className="mt-1 block w-full px-3 py-2 border border-stone-300 rounded-md shadow-sm focus:outline-none focus:ring-violet-500 focus:border-violet-500"
              value={formData.email}
              onChange={handleChange}
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-stone-700">
              Password *
            </label>
            <input
              id="password"
              name="password"
              type="password"
              required
              className="mt-1 block w-full px-3 py-2 border border-stone-300 rounded-md shadow-sm focus:outline-none focus:ring-violet-500 focus:border-violet-500"
              value={formData.password}
              onChange={handleChange}
            />
          </div>

          {/* Role Selection */}
          <div>
            <label htmlFor="role" className="block text-sm font-medium text-stone-700">
              Role *
            </label>
            <select
              id="role"
              name="role"
              required
              className="mt-1 block w-full px-3 py-2 border border-stone-300 rounded-md shadow-sm focus:outline-none focus:ring-violet-500 focus:border-violet-500"
              value={formData.role}
              onChange={handleChange}
            >
              <option value="student">Student</option>
              <option value="company">Company</option>
              <option value="university">University</option>
            </select>
          </div>

          {/* Student-specific fields */}
          {formData.role === 'student' && (
            <>
              <div>
                <label htmlFor="discord_username" className="block text-sm font-medium text-stone-700">
                  Discord Username
                </label>
                <input
                  id="discord_username"
                  name="discord_username"
                  type="text"
                  placeholder="e.g., username#1234"
                  className="mt-1 block w-full px-3 py-2 border border-stone-300 rounded-md shadow-sm focus:outline-none focus:ring-violet-500 focus:border-violet-500"
                  value={formData.discord_username}
                  onChange={handleChange}
                />
              </div>

              <div>
                <label htmlFor="university" className="block text-sm font-medium text-stone-700">
                  University
                </label>
                <input
                  id="university"
                  name="university"
                  type="text"
                  className="mt-1 block w-full px-3 py-2 border border-stone-300 rounded-md shadow-sm focus:outline-none focus:ring-violet-500 focus:border-violet-500"
                  value={formData.university}
                  onChange={handleChange}
                />
              </div>

              <div>
                <label htmlFor="major" className="block text-sm font-medium text-stone-700">
                  Major
                </label>
                <input
                  id="major"
                  name="major"
                  type="text"
                  className="mt-1 block w-full px-3 py-2 border border-stone-300 rounded-md shadow-sm focus:outline-none focus:ring-violet-500 focus:border-violet-500"
                  value={formData.major}
                  onChange={handleChange}
                />
              </div>

              <div>
                <label htmlFor="graduation_year" className="block text-sm font-medium text-stone-700">
                  Expected Graduation Year
                </label>
                <input
                  id="graduation_year"
                  name="graduation_year"
                  type="number"
                  min={2023}
                  max={new Date().getFullYear() + 10}
                  className="mt-1 block w-full px-3 py-2 border border-stone-300 rounded-md shadow-sm focus:outline-none focus:ring-violet-500 focus:border-violet-500"
                  value={formData.graduation_year}
                  onChange={handleChange}
                />
              </div>
            </>
          )}

          {/* Company field for company role */}
          {formData.role === 'company' && (
            <div>
              <label htmlFor="company" className="block text-sm font-medium text-stone-700">
                Company Name
              </label>
              <input
                id="company"
                name="company"
                type="text"
                className="mt-1 block w-full px-3 py-2 border border-stone-300 rounded-md shadow-sm focus:outline-none focus:ring-violet-500 focus:border-violet-500"
                value={formData.company}
                onChange={handleChange}
              />
            </div>
          )}

          {error && (
            <div className="text-red-600 text-sm bg-red-50 p-3 rounded">{error}</div>
          )}

          <div>
            <button
              type="submit"
              disabled={loading}
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-violet-600 hover:bg-violet-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-violet-500 disabled:opacity-50"
            >
              {loading ? 'Creating Account...' : 'Create Account'}
            </button>
          </div>

          <div className="text-center">
            <button
              type="button"
              onClick={onSwitchToLogin}
              className="text-violet-600 hover:text-violet-500 text-sm"
            >
              Already have an account? Sign in
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
