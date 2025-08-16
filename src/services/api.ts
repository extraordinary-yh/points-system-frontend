// API Service for Propel2Excel Points System
// Based on Django backend at: https://github.com/extraordinary-yh/propel2excel-points-system-backend

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000/api';

// Types based on Django backend models
export interface User {
  id: number;
  username: string;
  email: string;
  role: 'student' | 'company' | 'university' | 'admin';
  total_points: number;
  discord_username?: string;
  discord_id?: string;
  university?: string;
  major?: string;
  graduation_year?: number;
  company?: string;
  is_suspended: boolean;
  suspension_reason?: string;
  created_at: string;
  updated_at: string;
}

export interface Activity {
  id: number;
  name: string;
  description: string;
  points_value: number;
  category: string;
  is_active: boolean;
}

export interface PointsLog {
  id: number;
  user: number;
  activity: Activity;
  points_earned: number;
  details: string;
  timestamp: string;
}

export interface Incentive {
  id: number;
  name: string;
  description: string;
  points_required: number;
  sponsor: string;
  max_redemptions: number;
  current_redemptions: number;
  is_active: boolean;
}

export interface Redemption {
  id: number;
  user: User;
  incentive: Incentive;
  status: 'pending' | 'approved' | 'rejected';
  redemption_date: string;
  admin_notes?: string;
}

interface ApiResponse<T> {
  data?: T;
  error?: string;
  message?: string;
}

// Discord Link Types
export interface DiscordLinkCode {
  code: string;
  expires_at: string;
  used_at: string | null;
}

export interface DiscordLinkStatus {
  linked: boolean;
  discord_id?: string;
}

class ApiService {
  private token: string | null = null;

  constructor() {
    // Load token from localStorage on initialization
    if (typeof window !== 'undefined') {
      this.token = localStorage.getItem('authToken');
    }
  }

  // Set token for NextAuth integration
  setToken(token: string | null) {
    this.token = token;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {},
    overrideToken?: string | null
  ): Promise<ApiResponse<T>> {
    const url = `${API_BASE_URL}${endpoint}`;
    
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(options.headers as Record<string, string>),
    };

    // Use override token if provided, otherwise use instance token
    const activeToken = overrideToken !== undefined ? overrideToken : this.token;
    if (activeToken) {
      headers['Authorization'] = `Bearer ${activeToken}`;
    }

    try {
      const response = await fetch(url, {
        ...options,
        headers,
      });

      const data = await response.json();

      if (!response.ok) {
        return {
          error: data.error || data.detail || `HTTP ${response.status}`,
        };
      }

      return { data };
    } catch (error) {
      return {
        error: error instanceof Error ? error.message : 'Network error',
      };
    }
  }

  // Authentication methods
  async login(credentials: { username: string; password: string }): Promise<ApiResponse<{ user: User; tokens: { access: string; refresh: string } }>> {
    const response = await this.request<{ user: User; tokens: { access: string; refresh: string } }>('/users/login/', {
      method: 'POST',
      body: JSON.stringify(credentials),
    });

    if (response.data?.tokens?.access) {
      this.token = response.data.tokens.access;
      localStorage.setItem('authToken', this.token);
      localStorage.setItem('refreshToken', response.data.tokens.refresh);
      console.log('✅ JWT Tokens stored successfully!');
      console.log('✅ Access token:', this.token.substring(0, 20) + '...');
    }

    return response;
  }

  async register(userData: {
    username: string;
    email: string;
    password: string;
    role: string;
    discord_username?: string;
    university?: string;
    major?: string;
    graduation_year?: number;
    company?: string;
  }): Promise<ApiResponse<{ user: User; tokens: { access: string; refresh: string } }>> {
    const response = await this.request<{ user: User; tokens: { access: string; refresh: string } }>('/users/register/', {
      method: 'POST',
      body: JSON.stringify(userData),
    });

    if (response.data?.tokens?.access) {
      this.token = response.data.tokens.access;
      localStorage.setItem('authToken', this.token);
      localStorage.setItem('refreshToken', response.data.tokens.refresh);
      console.log('✅ JWT Tokens stored successfully after registration!');
    }

    return response;
  }

  async getProfile(token?: string): Promise<ApiResponse<User>> {
    return this.request<User>('/users/profile/', {}, token);
  }

  logout(): void {
    this.token = null;
    localStorage.removeItem('authToken');
  }

  isAuthenticated(): boolean {
    // Always check localStorage for the latest token
    if (typeof window !== 'undefined') {
      this.token = localStorage.getItem('authToken');
    }
    return !!this.token;
  }

  // Method to refresh token from localStorage
  refreshToken(): void {
    if (typeof window !== 'undefined') {
      this.token = localStorage.getItem('authToken');
    }
  }

  // Points and Activities
  async getActivities(token?: string): Promise<ApiResponse<Activity[]>> {
    return this.request<Activity[]>('/activities/', {}, token);
  }

  async getPointsHistory(token?: string): Promise<ApiResponse<PointsLog[]>> {
    return this.request<PointsLog[]>('/points-logs/', {}, token);
  }

  async addPoints(userId: number, activityId: number, details?: string, token?: string): Promise<ApiResponse<PointsLog>> {
    return this.request<PointsLog>(`/users/${userId}/add_points/`, {
      method: 'POST',
      body: JSON.stringify({ activity_id: activityId, details }),
    }, token);
  }

  // Incentives and Redemptions
  async getIncentives(token?: string): Promise<ApiResponse<Incentive[]>> {
    return this.request<Incentive[]>('/incentives/', {}, token);
  }

  async redeemIncentive(incentiveId: number, token?: string): Promise<ApiResponse<Redemption>> {
    return this.request<Redemption>('/redemptions/redeem/', {
      method: 'POST',
      body: JSON.stringify({ incentive_id: incentiveId }),
    }, token);
  }

  async getRedemptions(token?: string): Promise<ApiResponse<Redemption[]>> {
    return this.request<Redemption[]>('/redemptions/', {}, token);
  }

  // Admin methods
  async approveRedemption(redemptionId: number, notes?: string, token?: string): Promise<ApiResponse<Redemption>> {
    return this.request<Redemption>(`/redemptions/${redemptionId}/approve/`, {
      method: 'POST',
      body: JSON.stringify({ admin_notes: notes }),
    }, token);
  }

  async rejectRedemption(redemptionId: number, notes?: string, token?: string): Promise<ApiResponse<Redemption>> {
    return this.request<Redemption>(`/redemptions/${redemptionId}/reject/`, {
      method: 'POST',
      body: JSON.stringify({ admin_notes: notes }),
    }, token);
  }

  // Discord Integration
  async startDiscordLink(token?: string): Promise<ApiResponse<DiscordLinkCode>> {
    return this.request<DiscordLinkCode>('/link/start', {
      method: 'POST',
    }, token);
  }

  async checkDiscordLinkStatus(token?: string): Promise<ApiResponse<DiscordLinkStatus>> {
    return this.request<DiscordLinkStatus>('/link/status', {}, token);
  }
}

export const apiService = new ApiService();