# P2E Dashboard - Backend Integration Guide

This guide provides complete instructions for integrating the Django backend with this Next.js frontend project.

## 🚀 Quick Setup Overview

### Prerequisites
- Django backend running at `http://localhost:8000`
- Next.js frontend running at `http://localhost:3000`
- Node.js and npm/yarn installed

### File Structure After Integration
```
point-system-frontend/
├── src/
│   ├── services/
│   │   └── api.ts                    ← Main API service (COPY FROM BACKEND)
│   ├── hooks/
│   │   └── useAuth.ts               ← Auth context hook (CREATE NEW)
│   ├── types/
│   │   └── api.ts                   ← TypeScript interfaces (CREATE NEW)
│   └── components/
│       ├── Auth/                    ← Login/Register components
│       ├── Dashboard/               ← Main dashboard
│       ├── Points/                  ← Points tracking
│       └── Incentives/              ← Rewards system
├── .env.local                       ← Environment variables (COPY FROM BACKEND)
└── BACKEND_INTEGRATION.md          ← This file
```

---

## 📁 STEP 1: Copy Required Files from Backend Project

### Files to Copy:
1. **API Service**: Copy `frontend-api-service.ts` → `src/services/api.ts`
2. **Environment Example**: Copy `frontend-env-example.txt` → Use to create `.env.local`

---

## ⚙️ STEP 2: Environment Setup

### 2.1 Create `.env.local` file:
```env
# Local Development (Backend running locally)
NEXT_PUBLIC_API_URL=http://localhost:8000
NEXT_PUBLIC_API_BASE_URL=http://localhost:8000/api

# Production with Render Backend (update with your actual Render URL)
# NEXT_PUBLIC_API_URL=https://your-backend.onrender.com
# NEXT_PUBLIC_API_BASE_URL=https://your-backend.onrender.com/api
```

### 2.2 Install Required Dependencies:
```bash
npm install --save-dev @types/node
```

---

## 🔧 STEP 3: Create Additional Required Files

### 3.1 Create `src/hooks/useAuth.ts`:
```typescript
import { useState, useEffect, createContext, useContext, ReactNode } from 'react';
import { apiService, User } from '../services/api';

interface AuthContextType {
  user: User | null;
  login: (credentials: { username: string; password: string }) => Promise<void>;
  register: (userData: any) => Promise<void>;
  logout: () => void;
  loading: boolean;
  isAuthenticated: boolean;
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

  useEffect(() => {
    const initAuth = async () => {
      try {
        if (apiService.isAuthenticated()) {
          const response = await apiService.getProfile();
          if (response.data) {
            setUser(response.data);
          }
        }
      } catch (error) {
        console.error('Auth initialization failed:', error);
        apiService.logout();
      } finally {
        setLoading(false);
      }
    };

    initAuth();
  }, []);

  const login = async (credentials: { username: string; password: string }) => {
    const response = await apiService.login(credentials);
    if (response.data) {
      setUser(response.data.user);
    } else {
      throw new Error(response.error || 'Login failed');
    }
  };

  const register = async (userData: any) => {
    const response = await apiService.register(userData);
    if (response.data) {
      setUser(response.data.user);
    } else {
      throw new Error(response.error || 'Registration failed');
    }
  };

  const logout = () => {
    apiService.logout();
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      login, 
      register, 
      logout, 
      loading, 
      isAuthenticated: !!user 
    }}>
      {children}
    </AuthContext.Provider>
  );
};
```

### 3.2 Update `src/pages/_app.tsx` (or `src/app/layout.tsx` for App Router):
```typescript
// For Pages Router (_app.tsx)
import { AuthProvider } from '../hooks/useAuth';
import type { AppProps } from 'next/app';
import '../styles/globals.css';

export default function App({ Component, pageProps }: AppProps) {
  return (
    <AuthProvider>
      <Component {...pageProps} />
    </AuthProvider>
  );
}

// For App Router (layout.tsx)
'use client';
import { AuthProvider } from '../hooks/useAuth';

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
```

---

## 🧩 STEP 4: Create Core Components

### 4.1 Create `src/components/Dashboard.tsx`:
```typescript
'use client';
import { useEffect, useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { apiService, Activity, Incentive, PointsLog } from '../services/api';

export const Dashboard = () => {
  const { user, logout } = useAuth();
  const [activities, setActivities] = useState<Activity[]>([]);
  const [incentives, setIncentives] = useState<Incentive[]>([]);
  const [pointsHistory, setPointsHistory] = useState<PointsLog[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      if (!user) return;
      
      try {
        const [activitiesResponse, incentivesResponse, historyResponse] = await Promise.all([
          apiService.getActivities(),
          apiService.getIncentives(),
          apiService.getPointsHistory(),
        ]);
        
        if (activitiesResponse.data) setActivities(activitiesResponse.data);
        if (incentivesResponse.data) setIncentives(incentivesResponse.data);
        if (historyResponse.data) setPointsHistory(historyResponse.data);
      } catch (error) {
        console.error('Failed to load dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [user]);

  if (loading) return <div className="p-8">Loading...</div>;

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Welcome, {user?.username}!
            </h1>
            <p className="text-gray-600 capitalize">Role: {user?.role}</p>
          </div>
          <button
            onClick={logout}
            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
          >
            Logout
          </button>
        </div>

        {/* Points Display */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <h2 className="text-2xl font-semibold text-gray-900 mb-2">
            Total Points: {user?.total_points || 0}
          </h2>
          {user?.company && <p className="text-gray-600">Company: {user.company}</p>}
          {user?.university && <p className="text-gray-600">University: {user.university}</p>}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Activities */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-xl font-semibold mb-4">Available Activities</h3>
            <div className="space-y-3">
              {activities.map((activity) => (
                <div key={activity.id} className="p-3 border rounded-lg">
                  <h4 className="font-medium">{activity.name}</h4>
                  <p className="text-sm text-gray-600">{activity.description}</p>
                  <p className="text-sm font-semibold text-green-600">
                    +{activity.points_value} points
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Incentives */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-xl font-semibold mb-4">Available Rewards</h3>
            <div className="space-y-3">
              {incentives.map((incentive) => (
                <div key={incentive.id} className="p-3 border rounded-lg">
                  <h4 className="font-medium">{incentive.name}</h4>
                  <p className="text-sm text-gray-600">{incentive.description}</p>
                  <p className="text-sm font-semibold text-blue-600">
                    {incentive.points_required} points required
                  </p>
                  <span className="text-xs text-gray-500">by {incentive.sponsor}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Points History */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-xl font-semibold mb-4">Recent Activity</h3>
            <div className="space-y-3">
              {pointsHistory.slice(0, 5).map((log) => (
                <div key={log.id} className="p-3 border rounded-lg">
                  <h4 className="font-medium">{log.activity.name}</h4>
                  <p className="text-sm text-gray-600">{log.details}</p>
                  <div className="flex justify-between text-sm">
                    <span className="font-semibold text-green-600">
                      +{log.points_earned} points
                    </span>
                    <span className="text-gray-500">
                      {new Date(log.timestamp).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
```

### 4.2 Create `src/components/LoginForm.tsx`:
```typescript
'use client';
import { useState } from 'react';
import { useAuth } from '../hooks/useAuth';

export const LoginForm = () => {
  const { login } = useAuth();
  const [credentials, setCredentials] = useState({ username: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      await login(credentials);
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Sign in to P2E Dashboard
          </h2>
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div>
            <label htmlFor="username" className="block text-sm font-medium text-gray-700">
              Username
            </label>
            <input
              id="username"
              name="username"
              type="text"
              required
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              value={credentials.username}
              onChange={(e) => setCredentials(prev => ({ ...prev, username: e.target.value }))}
            />
          </div>
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700">
              Password
            </label>
            <input
              id="password"
              name="password"
              type="password"
              required
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              value={credentials.password}
              onChange={(e) => setCredentials(prev => ({ ...prev, password: e.target.value }))}
            />
          </div>

          {error && (
            <div className="text-red-600 text-sm">{error}</div>
          )}

          <div>
            <button
              type="submit"
              disabled={loading}
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
            >
              {loading ? 'Signing in...' : 'Sign in'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
```

### 4.3 Create `src/pages/dashboard.tsx` (or update your main page):
```typescript
'use client';
import { useAuth } from '../hooks/useAuth';
import { Dashboard } from '../components/Dashboard';
import { LoginForm } from '../components/LoginForm';

export default function DashboardPage() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl">Loading...</div>
      </div>
    );
  }

  if (!user) {
    return <LoginForm />;
  }

  return <Dashboard />;
}
```

---

## 🏃‍♂️ STEP 5: Start Development

### 5.1 Backend Setup (if not running):
```bash
# In your propel2excel-points-system directory
cd /Users/mr.mark/Projects/propel2excel-points-system
python manage.py runserver 8000
```

### 5.2 Frontend Development:
```bash
# In this directory
npm run dev
```

### 5.3 Test the Integration:
- Visit `http://localhost:3000`
- Test user login/registration
- Verify API connectivity with backend at `http://localhost:8000`
- Check browser console for any errors

---

## 🌐 API Endpoints Reference

Your Django backend provides these endpoints:

### Authentication:
- `POST /api/users/register/` - User registration
- `POST /api/users/login/` - User login
- `GET /api/users/profile/` - Get user profile

### Points System:
- `GET /api/activities/` - List activities
- `GET /api/points-logs/` - Get points history
- `POST /api/users/{id}/add_points/` - Add points (admin only)

### Incentives:
- `GET /api/incentives/` - List available rewards
- `POST /api/redemptions/redeem/` - Redeem reward
- `GET /api/redemptions/` - View redemption history

### Admin:
- `POST /api/redemptions/{id}/approve/` - Approve redemption
- `POST /api/redemptions/{id}/reject/` - Reject redemption

### Discord Integration:
- `POST /api/link/start` - Start Discord linking
- `GET /api/link/status` - Check link status

---

## 🔍 Testing & Debugging

### Common Issues:
1. **CORS Errors**: Ensure backend CORS is configured for `http://localhost:3000`
2. **401 Unauthorized**: Check if JWT tokens are being sent correctly
3. **Network Errors**: Verify backend is running on port 8000

### Debug Steps:
1. Check browser Network tab for API calls
2. Verify environment variables are loaded
3. Check backend logs for any errors
4. Test API endpoints directly at `http://localhost:8000/api/docs/`

---

## 🚀 Production Deployment

### Backend (Django):
- Deploy to Render, Railway, or similar
- Set production environment variables
- Configure CORS for frontend domain

### Frontend (Next.js):
- Deploy to Vercel, Netlify, or similar  
- Update `NEXT_PUBLIC_API_BASE_URL` to production backend URL
- Set environment variables in deployment platform

---

## 💡 Next Steps for Development

1. **Enhance UI/UX**: Improve styling and user experience
2. **Add Features**: Implement additional pages (profile, settings, admin panel)
3. **Error Handling**: Add comprehensive error boundaries and user feedback
4. **Testing**: Add unit and integration tests
5. **Performance**: Optimize API calls and add caching
6. **Security**: Implement proper token refresh logic

---

## 🔧 Troubleshooting

### If you see compilation errors:
1. Make sure all TypeScript interfaces are properly imported
2. Check that `@types/node` is installed
3. Verify file paths are correct

### If API calls fail:
1. Verify backend is running (`http://localhost:8000/admin/` should work)
2. Check CORS configuration in Django settings
3. Ensure environment variables are loaded correctly

### Need help?
- Check the backend API documentation at `http://localhost:8000/api/docs/`
- Review browser console for detailed error messages
- Verify network requests in browser DevTools

---

**🎉 You're all set! Your P2E Dashboard should now be fully integrated with the Django backend.**
