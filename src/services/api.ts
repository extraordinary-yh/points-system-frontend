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

class ApiService {
  private token: string | null = null;

  constructor() {
    // Load token from localStorage on initialization
    if (typeof window !== 'undefined') {
      this.token = localStorage.getItem('authToken');
    }
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    const url = `${API_BASE_URL}${endpoint}`;
    
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(options.headers as Record<string, string>),
    };

    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
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
  async login(credentials: { username: string; password: string }): Promise<ApiResponse<{ user: User; token: string }>> {
    const response = await this.request<{ user: User; token: string }>('/users/login/', {
      method: 'POST',
      body: JSON.stringify(credentials),
    });

    if (response.data?.token) {
      this.token = response.data.token;
      localStorage.setItem('authToken', this.token);
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
  }): Promise<ApiResponse<{ user: User; token: string }>> {
    const response = await this.request<{ user: User; token: string }>('/users/register/', {
      method: 'POST',
      body: JSON.stringify(userData),
    });

    if (response.data?.token) {
      this.token = response.data.token;
      localStorage.setItem('authToken', this.token);
    }

    return response;
  }

  async getProfile(): Promise<ApiResponse<User>> {
    return this.request<User>('/users/profile/');
  }

  logout(): void {
    this.token = null;
    localStorage.removeItem('authToken');
  }

  isAuthenticated(): boolean {
    return !!this.token;
  }

  // Points and Activities
  async getActivities(): Promise<ApiResponse<Activity[]>> {
    return this.request<Activity[]>('/activities/');
  }

  async getPointsHistory(): Promise<ApiResponse<PointsLog[]>> {
    return this.request<PointsLog[]>('/points-logs/');
  }

  async addPoints(userId: number, activityId: number, details?: string): Promise<ApiResponse<PointsLog>> {
    return this.request<PointsLog>(`/users/${userId}/add_points/`, {
      method: 'POST',
      body: JSON.stringify({ activity_id: activityId, details }),
    });
  }

  // Incentives and Redemptions
  async getIncentives(): Promise<ApiResponse<Incentive[]>> {
    return this.request<Incentive[]>('/incentives/');
  }

  async redeemIncentive(incentiveId: number): Promise<ApiResponse<Redemption>> {
    return this.request<Redemption>('/redemptions/redeem/', {
      method: 'POST',
      body: JSON.stringify({ incentive_id: incentiveId }),
    });
  }

  async getRedemptions(): Promise<ApiResponse<Redemption[]>> {
    return this.request<Redemption[]>('/redemptions/');
  }

  // Admin methods
  async approveRedemption(redemptionId: number, notes?: string): Promise<ApiResponse<Redemption>> {
    return this.request<Redemption>(`/redemptions/${redemptionId}/approve/`, {
      method: 'POST',
      body: JSON.stringify({ admin_notes: notes }),
    });
  }

  async rejectRedemption(redemptionId: number, notes?: string): Promise<ApiResponse<Redemption>> {
    return this.request<Redemption>(`/redemptions/${redemptionId}/reject/`, {
      method: 'POST',
      body: JSON.stringify({ admin_notes: notes }),
    });
  }

  // Discord Integration
  async startDiscordLink(): Promise<ApiResponse<{ link_url: string }>> {
    return this.request<{ link_url: string }>('/link/start');
  }

  async checkDiscordLinkStatus(): Promise<ApiResponse<{ status: string; discord_username?: string }>> {
    return this.request<{ status: string; discord_username?: string }>('/link/status');
  }
}

export const apiService = new ApiService();