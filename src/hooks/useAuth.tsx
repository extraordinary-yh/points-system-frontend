'use client';
import { useState, useEffect, createContext, useContext, ReactNode } from 'react';
import { signOut } from 'next-auth/react';
import { apiService, User } from '../services/api';

interface AuthContextType {
  user: User | null;
  login: (credentials: { username: string; password: string }) => Promise<void>;
  register: (userData: {
    username: string;
    email: string;
    password: string;
    role: string;
    discord_username?: string;
    university?: string;
    major?: string;
    graduation_year?: number;
    company?: string;
  }) => Promise<void>;
  logout: () => void;
  loading: boolean;
  isAuthenticated: boolean;
  forceLogout: () => void;
  showReLoginPrompt: boolean;
  handleReLogin: () => void;
  dismissReLoginPrompt: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [showReLoginPrompt, setShowReLoginPrompt] = useState(false);

  useEffect(() => {
    const initAuth = async () => {
      try {
        if (apiService.isAuthenticated()) {
          const response = await apiService.getProfile();
          if (response.data) {
            setUser(response.data);
          } else {
            // Token might be invalid, clear it
            apiService.logout();
            setUser(null);
          }
        } else {
          // Check if we have user data but no token (broken state)
          const storedUser = localStorage.getItem('user');
          if (storedUser) {
            // Found stored user without token, clearing broken state
            localStorage.removeItem('user');
            setUser(null);
          }
        }
      } catch (error) {
        // Auth initialization failed
        apiService.logout();
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    initAuth();

    // Listen for unauthorized errors from API service
    const handleUnauthorizedError = (event: CustomEvent) => {
      // Unauthorized error received, showing re-login prompt
      setShowReLoginPrompt(true);
      setUser(null);
    };

    window.addEventListener('unauthorized-error', handleUnauthorizedError as EventListener);

    return () => {
      window.removeEventListener('unauthorized-error', handleUnauthorizedError as EventListener);
    };
  }, []);

  const login = async (credentials: { username: string; password: string }) => {
    // Starting login process
    const response = await apiService.login(credentials);
    // Login response received
    
    if (response.data) {
      // Login successful
      
      setUser(response.data.user);
      // Store user data as backup
      localStorage.setItem('user', JSON.stringify(response.data.user));
      
      // Verify token was saved
      setTimeout(() => {
        // Verifying token after login
      }, 100);
    } else {
      // Login failed
      throw new Error(response.error || 'Login failed');
    }
  };

  const register = async (userData: {
    username: string;
    email: string;
    password: string;
    role: string;
    discord_username?: string;
    university?: string;
    major?: string;
    graduation_year?: number;
    company?: string;
  }) => {
    const response = await apiService.register(userData);
    if (response.data) {
      setUser(response.data.user);
      // Store user data as backup
      localStorage.setItem('user', JSON.stringify(response.data.user));
    } else {
      throw new Error(response.error || 'Registration failed');
    }
  };

  const logout = () => {
    apiService.logout();
    localStorage.removeItem('user');
    setUser(null);
  };

  const forceLogout = () => {
    // Clear all authentication state and force redirect to login
    apiService.logout();
    localStorage.clear();
    sessionStorage.clear();
    setUser(null);
    
    // Clear NextAuth session as well
    signOut({ redirect: false }).then(() => {
      // Force page reload to ensure clean state
      setTimeout(() => window.location.reload(), 100);
    }).catch(() => {
      // Even if signOut fails, still reload
      setTimeout(() => window.location.reload(), 100);
    });
  };

  const handleReLogin = () => {
    setShowReLoginPrompt(false);
    // Clear all auth data and force clean state
    forceLogout();
  };

  const dismissReLoginPrompt = () => {
    setShowReLoginPrompt(false);
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      login, 
      register, 
      logout, 
      loading, 
      isAuthenticated: !!user,
      forceLogout,
      showReLoginPrompt,
      handleReLogin,
      dismissReLoginPrompt
    }}>
      {children}
    </AuthContext.Provider>
  );
};
