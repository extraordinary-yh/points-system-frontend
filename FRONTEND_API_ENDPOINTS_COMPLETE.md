# 📋 **Complete Frontend API Endpoints Documentation**

## 🎯 **Overview**
This document lists ALL API endpoints called by the frontend, their parameters, expected responses, and current issues. The backend team needs to ensure these endpoints return complete data without unexpected limits.

---

## 🚨 **CRITICAL ISSUE IDENTIFIED**

### **Problem**: Lifetime Earnings Chart shows 309 points instead of 478
- **Expected**: 75 activities with 478 total points
- **Actual**: 50 activities with 309 total points  
- **Root Cause**: Backend still applying default limit of 50 items

---

## 🔧 **API Endpoints by Component**

### **1. Dashboard Data (`useSharedDashboardData` Hook)**

#### **Endpoint 1: `/api/activity/feed/`**
- **Purpose**: Complete lifetime activity feed for Lifetime Earnings Chart
- **Frontend Call**: `apiService.getActivityFeed(undefined, token)`
- **Parameters**: 
  - `limit`: `undefined` (no limit = full lifetime data)
  - `token`: User authentication token
- **Expected Response**: ALL lifetime activities (75 items, 478 points)
- **Current Issue**: ❌ Only returns 50 items (missing 25 activities)
- **Required Fix**: Return ALL data when `limit` is `undefined` or `null`

#### **Endpoint 2: `/api/points/timeline/`**
- **Purpose**: 30-day chart data for Point Tracker
- **Frontend Call**: `apiService.getPointsTimeline('daily', 30, token)`
- **Parameters**:
  - `period`: `'daily'`
  - `days`: `30`
  - `token`: User authentication token
- **Expected Response**: Daily points data for last 30 days
- **Status**: ✅ **Working correctly** - shows 478 → 278 redemption drop

---

### **2. Stat Cards Component**

#### **Endpoint 3: `/api/dashboard/stats/`**
- **Purpose**: 30-day statistics for dashboard cards
- **Frontend Call**: `apiService.getDashboardStats('30days', token)`
- **Parameters**:
  - `period`: `'30days'`
  - `token`: User authentication token
- **Expected Response**: Current period stats (points, activities, trends)
- **Status**: ✅ **Working correctly** - shows 30-day data

#### **Endpoint 4: `/api/rewards/available/`**
- **Purpose**: Available rewards for user to redeem
- **Frontend Call**: `apiService.getAvailableRewards(token)`
- **Parameters**: `token`: User authentication token
- **Expected Response**: List of available rewards
- **Status**: ✅ **Working correctly**

---

### **3. Rewards Page**

#### **Endpoint 5: `/api/rewards/available/`**
- **Purpose**: Available rewards listing
- **Frontend Call**: `apiService.getAvailableRewards(token)`
- **Parameters**: `token`: User authentication token
- **Expected Response**: Available rewards array
- **Status**: ✅ **Working correctly**

#### **Endpoint 6: `/api/incentives/`**
- **Purpose**: Alternative incentives endpoint
- **Frontend Call**: `apiService.getIncentives(token)`
- **Parameters**: `token`: User authentication token
- **Expected Response**: Incentives array
- **Status**: ✅ **Working correctly**

#### **Endpoint 7: `/api/redemptions/history/`**
- **Purpose**: User's redemption history
- **Frontend Call**: `apiService.getRedemptionHistory(token)`
- **Parameters**: `token`: User authentication token
- **Expected Response**: Redemption history array
- **Status**: ✅ **Working correctly**

#### **Endpoint 8: `/api/redemptions/`**
- **Purpose**: User's redemptions
- **Frontend Call**: `apiService.getRedemptions(token)`
- **Parameters**: `token`: User authentication token
- **Expected Response**: Redemptions array
- **Status**: ✅ **Working correctly**

#### **Endpoint 9: `/api/rewards/{id}/redeem/`**
- **Purpose**: Redeem a specific reward
- **Frontend Call**: `apiService.redeemReward(rewardId, {}, token)`
- **Parameters**:
  - `rewardId`: ID of reward to redeem
  - `data`: Empty object `{}`
  - `token`: User authentication token
- **Expected Response**: Redemption confirmation
- **Status**: ✅ **Working correctly**

---

### **4. Authentication & User Management**

#### **Endpoint 10: `/api/auth/profile/`**
- **Purpose**: Get user profile information
- **Frontend Call**: `apiService.getProfile(token)`
- **Parameters**: `token`: User authentication token
- **Expected Response**: User profile data
- **Status**: ✅ **Working correctly**

#### **Endpoint 11: `/api/auth/login/`**
- **Purpose**: User login
- **Frontend Call**: `apiService.login(credentials)`
- **Parameters**: `credentials`: { email, password }
- **Expected Response**: Authentication token + user data
- **Status**: ✅ **Working correctly**

#### **Endpoint 12: `/api/auth/register/`**
- **Purpose**: User registration
- **Frontend Call**: `apiService.register(userData)`
- **Parameters**: `userData`: Registration form data
- **Expected Response**: User creation confirmation
- **Status**: ✅ **Working correctly**

#### **Endpoint 13: `/api/auth/logout/`**
- **Purpose**: User logout
- **Frontend Call**: `apiService.logout()`
- **Parameters**: None
- **Expected Response**: Logout confirmation
- **Status**: ✅ **Working correctly**

---

### **5. Discord Integration**

#### **Endpoint 14: `/api/discord/link/status/`**
- **Purpose**: Check Discord link status
- **Frontend Call**: `apiService.checkDiscordLinkStatus(token)`
- **Parameters**: `token`: User authentication token
- **Expected Response**: Discord link status
- **Status**: ✅ **Working correctly**

#### **Endpoint 15: `/api/discord/link/start/`**
- **Purpose**: Start Discord linking process
- **Frontend Call**: `apiService.startDiscordLink(token)`
- **Parameters**: `token`: User authentication token
- **Expected Response**: Discord linking URL/code
- **Status**: ✅ **Working correctly**

#### **Endpoint 16: `/api/discord/validate/`**
- **Purpose**: Validate Discord username
- **Frontend Call**: `apiService.validateDiscordUser(discordUsername)`
- **Parameters**: `discordUsername`: Username to validate
- **Expected Response**: Validation result
- **Status**: ✅ **Working correctly**

---

### **6. Onboarding & Consent**

#### **Endpoint 17: `/api/onboarding/consent/`**
- **Purpose**: Update user consent status
- **Frontend Call**: `apiService.updateConsentStatus(consented, token)`
- **Parameters**:
  - `consented`: Boolean consent status
  - `token`: User authentication token
- **Expected Response**: Consent update confirmation
- **Status**: ✅ **Working correctly**

#### **Endpoint 18: `/api/onboarding/linkedin-follow/`**
- **Purpose**: Track LinkedIn follow actions
- **Frontend Call**: `apiService.trackLinkedInFollow(type, token)`
- **Parameters**:
  - `type`: 'company' or 'founder'
  - `token`: User authentication token
- **Expected Response**: Tracking confirmation
- **Status**: ✅ **Working correctly**

#### **Endpoint 19: `/api/onboarding/complete/`**
- **Purpose**: Complete onboarding process
- **Frontend Call**: `apiService.completeOnboarding(token)`
- **Parameters**: `token`: User authentication token
- **Expected Response**: Onboarding completion confirmation
- **Status**: ✅ **Working correctly**

---

## 🚨 **PRIORITY 1: Fix Required**

### **Endpoint: `/api/activity/feed/`**
- **Issue**: Returns only 50 items instead of full lifetime data
- **Impact**: Lifetime Earnings Chart shows 309 points instead of 478
- **Required Fix**: Return ALL data when no limit parameter is provided

### **Current Backend Logic (INCORRECT)**:
```python
limit_param = request.GET.get('limit')
if limit_param:
    limit = min(int(limit_param), 1000)
    return queryset[:limit]
else:
    # ❌ PROBLEM: Still applying default limit
    return queryset[:50]  # This is wrong!
```

### **Correct Backend Logic**:
```python
limit_param = request.GET.get('limit')
if limit_param and limit_param.strip():  # Check if not empty
    limit = min(int(limit_param), 1000)
    return queryset.order_by('-timestamp')[:limit]
else:
    # ✅ SOLUTION: Return ALL data when no limit
    return queryset.order_by('-timestamp')  # No limit at all
```

---

## 📊 **Expected Data Volumes**

### **User Scale**: Maximum 500 users
### **Data Per User**: ~100 points initially
### **Total Data Volume**: ~50,000 records (very manageable)

### **Activity Feed Response (No Limit)**:
- **Expected Items**: 75 activities + redemptions
- **Expected Points**: 478 total points
- **Expected Size**: ~15-20KB
- **Expected Performance**: <500ms with proper indexing

---

## 🔍 **Testing Instructions for Backend Team**

### **Test 1: No Limit Parameter**
```bash
curl "your-api/activity/feed/" \
  -H "Authorization: Bearer YOUR_TOKEN"
```
**Expected**: 75+ items, 478+ total points
**Current**: 50 items, 309 points ❌

### **Test 2: With Limit Parameter**
```bash
curl "your-api/activity/feed/?limit=100" \
  -H "Authorization: Bearer YOUR_TOKEN"
```
**Expected**: 100 items (or all if less than 100)

### **Test 3: Verify Response Fields**
```json
{
  "feed": [...],
  "total_items": 75,
  "is_lifetime_data": true,
  "limit_applied": null,
  "total_activities": 75,
  "total_redemptions": 28
}
```

---

## 🎯 **Summary**

### **✅ Working Endpoints**: 18 out of 19
### **❌ Broken Endpoint**: 1 out of 19 (`/api/activity/feed/`)
### **Priority**: Fix the activity feed endpoint to return complete lifetime data
### **Impact**: Lifetime Earnings Chart will show correct 478 points

**The frontend is working perfectly. The issue is the backend not returning complete data when no limit is specified.** 🎯
