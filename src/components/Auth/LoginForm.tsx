'use client';
import { useState } from 'react';
import { signIn } from 'next-auth/react';

export const LoginForm = ({ onSwitchToRegister }: { onSwitchToRegister: () => void }) => {
  const [credentials, setCredentials] = useState({ username: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const result = await signIn('credentials', {
        username: credentials.username,
        password: credentials.password,
        redirect: false,
      });

      if (result?.error) {
        // Handle specific error messages from NextAuth
        if (result.error === 'CredentialsSignin') {
          setError('Invalid username or password');
        } else if (result.error.includes('Invalid username or password')) {
          setError('Invalid username or password');
        } else if (result.error.includes('Account is suspended')) {
          setError('Account is suspended or restricted');
        } else {
          setError(result.error || 'Authentication failed');
        }
      }
      // If successful, NextAuth will handle the session
    } catch (error) {
      setError('Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-stone-100">
      <div className="max-w-md w-full space-y-8 bg-white p-8 rounded-lg shadow-lg">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-stone-900">
            Sign in to Propel2Excel
          </h2>
          <p className="mt-2 text-center text-sm text-stone-600">
            Access your student dashboard
          </p>
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div>
            <label htmlFor="username" className="block text-sm font-medium text-stone-700">
              Username
            </label>
            <input
              id="username"
              name="username"
              type="text"
              required
              className="mt-1 block w-full px-3 py-2 border border-stone-300 rounded-md shadow-sm focus:outline-none focus:ring-violet-500 focus:border-violet-500"
              value={credentials.username}
              onChange={(e) => setCredentials(prev => ({ ...prev, username: e.target.value }))}
            />
          </div>
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-stone-700">
              Password
            </label>
            <input
              id="password"
              name="password"
              type="password"
              required
              className="mt-1 block w-full px-3 py-2 border border-stone-300 rounded-md shadow-sm focus:outline-none focus:ring-violet-500 focus:border-violet-500"
              value={credentials.password}
              onChange={(e) => setCredentials(prev => ({ ...prev, password: e.target.value }))}
            />
          </div>

          {error && (
            <div className="text-red-600 text-sm bg-red-50 p-3 rounded">{error}</div>
          )}

          <div>
            <button
              type="submit"
              disabled={loading}
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-violet-600 hover:bg-violet-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-violet-500 disabled:opacity-50"
            >
              {loading ? 'Signing in...' : 'Sign in'}
            </button>
          </div>

          <div className="text-center">
            <button
              type="button"
              onClick={onSwitchToRegister}
              className="text-violet-600 hover:text-violet-500 text-sm"
            >
              Don't have an account? Sign up
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
