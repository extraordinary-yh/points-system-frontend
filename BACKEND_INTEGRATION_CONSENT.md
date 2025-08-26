# Backend Integration: Student Media Consent Preference

## Overview

This document outlines the backend requirements for storing and managing student media consent preference data as part of the Propel2Excel (P2E) points system. The consent preference allows students to opt-in or opt-out of being featured in P2E marketing materials.

## Database Schema Changes

### 1. User Model Updates

Add the following fields to your existing User model:

```python
# models.py
class User(AbstractUser):
    # ... existing fields ...
    
    # Media Consent Fields
    media_consent = models.BooleanField(
        default=None, 
        null=True, 
        blank=True,
        help_text="User's consent to be featured in P2E media materials"
    )
    media_consent_date = models.DateTimeField(
        null=True, 
        blank=True,
        help_text="Date when consent decision was made"
    )
    media_consent_ip = models.GenericIPAddressField(
        null=True, 
        blank=True,
        help_text="IP address when consent decision was made"
    )
    media_consent_user_agent = models.TextField(
        null=True, 
        blank=True,
        help_text="User agent string when consent decision was made"
    )
    
    # Onboarding Completion
    onboarding_completed = models.BooleanField(
        default=False,
        help_text="Whether user has completed the onboarding flow"
    )
    onboarding_completed_date = models.DateTimeField(
        null=True, 
        blank=True,
        help_text="Date when onboarding was completed"
    )
    
```

### 2. Database Migration

Create and run the migration:

```bash
python manage.py makemigrations
python manage.py migrate
```

## API Endpoints

### 1. Update Consent Status

**Endpoint:** `POST /api/users/consent/`

**Purpose:** Update user's media consent decision

**Request Body:**
```json
{
    "media_consent": true,
    "user_agent": "Mozilla/5.0...",
    "ip_address": "192.168.1.1"
}
```

**Response:**
```json
{
    "success": true,
    "message": "Consent status updated successfully",
    "data": {
        "media_consent": true,
        "media_consent_date": "2024-01-15T10:30:00Z",
        "onboarding_step": "consent_completed"
    }
}
```

**Implementation:**
```python
# views.py
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import status
from django.utils import timezone
from django.contrib.auth.decorators import login_required

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def update_consent_status(request):
    """
    Update user's media consent status
    """
    try:
        user = request.user
        media_consent = request.data.get('media_consent')
        
        if media_consent is None:
            return Response({
                'error': 'media_consent field is required'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        # Update consent fields
        user.media_consent = media_consent
        user.media_consent_date = timezone.now()
        user.media_consent_ip = request.META.get('REMOTE_ADDR')
        user.media_consent_user_agent = request.META.get('HTTP_USER_AGENT', '')
        user.save()
        
        return Response({
            'success': True,
            'message': 'Consent status updated successfully',
            'data': {
                'media_consent': user.media_consent,
                'media_consent_date': user.media_consent_date.isoformat(),
                'onboarding_step': 'consent_completed'
            }
        })
        
    except Exception as e:
        return Response({
            'error': str(e)
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
```



### 2. Complete Onboarding

**Endpoint:** `POST /api/users/complete-onboarding/`

**Purpose:** Mark user's onboarding as complete

**Request Body:** None (uses authenticated user)

**Response:**
```json
{
    "success": true,
    "message": "Onboarding marked as complete",
    "data": {
        "onboarding_completed": true,
        "completion_date": "2024-01-15T10:40:00Z"
    }
}
```

**Implementation:**
```python
@api_view(['POST'])
@permission_classes([IsAuthenticated])
def complete_onboarding(request):
    """
    Mark user's onboarding as complete
    """
    try:
        user = request.user
        
        # Mark onboarding as complete
        user.onboarding_completed = True
        user.onboarding_completed_date = timezone.now()
        user.save()
        
        return Response({
            'success': True,
            'message': 'Onboarding marked as complete',
            'data': {
                'onboarding_completed': user.onboarding_completed,
                'completion_date': user.onboarding_completed_date.isoformat()
            }
        })
        
    except Exception as e:
        return Response({
            'error': str(e)
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
```

### 4. Get User Profile (Updated)

**Endpoint:** `GET /api/users/profile/`

**Purpose:** Get user profile including consent and onboarding status

**Response:**
```json
{
    "id": 1,
    "username": "student123",
    "email": "student@university.edu",
    "role": "student",
    "university": "University of Technology",
    "major": "Computer Science",
    "graduation_year": 2026,
    "total_points": 150,
    
    // New consent fields
    "media_consent": true,
    "media_consent_date": "2024-01-15T10:30:00Z",
    "onboarding_completed": true,
    "onboarding_completed_date": "2024-01-15T10:40:00Z",
    
    // Existing fields...
    "created_at": "2024-01-15T10:00:00Z",
    "updated_at": "2024-01-15T10:40:00Z"
}
```

## URL Configuration

Add these endpoints to your `urls.py`:

```python
# urls.py
from django.urls import path
from . import views

urlpatterns = [
    # ... existing URLs ...
    
    # Consent and onboarding endpoints
    path('users/consent/', views.update_consent_status, name='update_consent'),
    path('users/complete-onboarding/', views.complete_onboarding, name='complete_onboarding'),
]
```

## Serializer Updates

Update your User serializer to include the new fields:

```python
# serializers.py
from rest_framework import serializers
from .models import User

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = [
            'id', 'username', 'email', 'role', 'university', 'major', 
            'graduation_year', 'total_points', 'discord_username',
            'company', 'is_suspended', 'suspension_reason',
            'created_at', 'updated_at',
            
            # New consent fields
            'media_consent', 'media_consent_date', 'media_consent_ip',
            'onboarding_completed', 'onboarding_completed_date'
        ]
        read_only_fields = [
            'id', 'created_at', 'updated_at', 'media_consent_date',
            'media_consent_ip', 'onboarding_completed_date', 'linkedin_follows_date'
        ]
```

## Admin Interface

Add the new fields to your Django admin:

```python
# admin.py
from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from .models import User

class CustomUserAdmin(UserAdmin):
    list_display = [
        'username', 'email', 'role', 'university', 'media_consent',
        'onboarding_completed'
    ]
    
    list_filter = [
        'role', 'media_consent', 'onboarding_completed'
    ]
    
    fieldsets = UserAdmin.fieldsets + (
        ('Media Consent', {
            'fields': ('media_consent', 'media_consent_date', 'media_consent_ip', 'media_consent_user_agent')
        }),
        ('Onboarding', {
            'fields': ('onboarding_completed', 'onboarding_completed_date')
        }),

    )
    
    readonly_fields = [
        'media_consent_date', 'media_consent_ip', 'media_consent_user_agent',
        'onboarding_completed_date', 'linkedin_follows_date'
    ]

admin.site.register(User, CustomUserAdmin)
```

## Data Privacy & Compliance

### GDPR Considerations

1. **Consent Storage**: Store explicit consent with timestamp and metadata
2. **Right to Withdraw**: Allow users to change consent status at any time
3. **Data Retention**: Implement policies for how long consent data is retained
4. **Audit Trail**: Keep records of consent changes for compliance

### Implementation Example

```python
@api_view(['POST'])
@permission_classes([IsAuthenticated])
def withdraw_consent(request):
    """
    Allow users to withdraw their media consent
    """
    try:
        user = request.user
        
        # Update consent to withdrawn
        user.media_consent = False
        user.media_consent_date = timezone.now()
        user.media_consent_ip = request.META.get('REMOTE_ADDR')
        user.media_consent_user_agent = request.META.get('HTTP_USER_AGENT', '')
        user.save()
        
        # Log the withdrawal for audit purposes
        # You might want to create a separate ConsentLog model
        
        return Response({
            'success': True,
            'message': 'Media consent withdrawn successfully',
            'data': {
                'media_consent': False,
                'withdrawal_date': user.media_consent_date.isoformat()
            }
        })
        
    except Exception as e:
        return Response({
            'error': str(e)
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
```

## Testing

### Test Cases

```python
# tests.py
from django.test import TestCase
from django.contrib.auth import get_user_model
from django.urls import reverse
from rest_framework.test import APIClient
from rest_framework import status

User = get_user_model()

class ConsentAPITestCase(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.user = User.objects.create_user(
            username='testuser',
            email='test@example.com',
            password='testpass123'
        )
        self.client.force_authenticate(user=self.user)
    
    def test_update_consent_status(self):
        url = reverse('update_consent')
        data = {'media_consent': True}
        
        response = self.client.post(url, data)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        
        # Verify user was updated
        self.user.refresh_from_db()
        self.assertTrue(self.user.media_consent)
        self.assertIsNotNone(self.user.media_consent_date)
    

```

## Frontend Integration Notes

The frontend will:

1. **Call consent endpoint** after user makes consent decision
2. **Mark onboarding complete** after final step
3. **Handle errors gracefully** without blocking user experience

## Deployment Checklist

- [ ] Run database migrations
- [ ] Update API endpoints
- [ ] Test all new endpoints
- [ ] Update admin interface
- [ ] Verify serializers include new fields
- [ ] Test frontend integration
- [ ] Update API documentation
- [ ] Monitor for any errors in production

## Support

For questions or issues with this integration, contact the backend development team or refer to the existing API documentation patterns in your codebase.
