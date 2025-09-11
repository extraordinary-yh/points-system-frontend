# 🚀 Propel2Excel Points System Frontend

A comprehensive full-stack student engagement platform built with Next.js, featuring gamified career development activities, points tracking, rewards redemption, and Discord integration. This system serves students, companies, universities, and nonprofits with a complete engagement ecosystem.

## ✨ Core Features

### 🔐 Authentication & User Management
- **NextAuth.js Integration** - Secure session management with Django backend
- **Role-Based Access Control** - Support for students, companies, universities, and admins
- **Profile Management** - Complete user profile editing with university/major tracking
- **Password Management** - Secure password change functionality
- **Onboarding Flow** - Multi-step onboarding with Discord linking and consent agreements

### 🎯 Points & Rewards System
- **Real-Time Points Tracking** - Live points updates with activity feed integration
- **Rewards Marketplace** - Browse and redeem points for various rewards
- **Redemption History** - Complete transaction history and tracking
- **Points Analytics** - Visual charts showing points progression over time
- **Activity Tracking** - Comprehensive activity completion monitoring

### 📊 Dashboard & Analytics
- **Interactive Dashboard** - Modern glassmorphism design with real-time data
- **Points Visualization** - Line charts showing daily, weekly, and monthly progress
- **Activity Statistics** - Detailed breakdown of completed activities
- **Usage Analytics** - Radar charts showing engagement patterns
- **Recent Transactions** - Live feed of points activities and redemptions

### 🏆 Competition & Social Features
- **Leaderboards** - All-time, monthly, and weekly rankings
- **Podium Display** - Beautiful top 3 visualization with animations
- **User Rankings** - Detailed ranking tables with trend indicators
- **Social Integration** - Discord account linking and verification

### 🎨 User Experience
- **Modern UI/UX** - Tailwind CSS with custom gradients and animations
- **Responsive Design** - Seamless experience across all devices
- **Dark/Light Themes** - Adaptive theming with smooth transitions
- **Loading States** - Skeleton loaders and smooth loading animations
- **Error Handling** - Comprehensive error boundaries and user feedback

### ⚡ Performance & Reliability
- **Performance Profiling** - Built-in performance monitoring and optimization
- **Data Caching** - Intelligent caching system for optimal performance
- **Error Boundaries** - Graceful error handling with recovery options
- **API Optimization** - Efficient API calls with request deduplication
- **Real-Time Updates** - Live data synchronization across components

## 🏗️ Architecture

### Frontend Stack
- **Framework**: Next.js 14 with App Router and TypeScript
- **Styling**: Tailwind CSS with custom gradients and glassmorphism effects
- **Charts**: Recharts for data visualization and analytics
- **Icons**: Lucide React and React Icons for consistent iconography
- **Animations**: Framer Motion for smooth transitions and interactions
- **UI Components**: Custom components with Tailwind Merge for styling

### Authentication & Security
- **NextAuth.js**: Secure session management with JWT tokens
- **Django Integration**: Seamless backend authentication flow
- **Role-Based Access**: Multi-role support (student, company, university, admin)
- **Session Management**: HTTP-only cookies with automatic refresh
- **CSRF Protection**: Built-in CSRF protection through NextAuth

### State Management
- **React Context**: Global state management for dashboard data
- **Custom Hooks**: Specialized hooks for data fetching and caching
- **Session State**: NextAuth session management
- **Local State**: Component-level state with React hooks
- **Data Caching**: Intelligent caching system for API responses

### Backend Integration
- **Django REST API**: Separate backend repository with full CRUD operations
- **API Service Layer**: Centralized API communication with error handling
- **Real-Time Data**: Live data synchronization with backend
- **Performance Optimization**: Request deduplication and intelligent caching
- **Error Handling**: Comprehensive error boundaries and user feedback

### Performance & Monitoring
- **Performance Profiler**: Built-in performance monitoring and analysis
- **Network Analyzer**: API response time and size tracking
- **Error Boundaries**: Graceful error handling with recovery options
- **Loading States**: Skeleton loaders and smooth loading animations
- **Data Optimization**: Efficient data fetching and caching strategies

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ and npm/yarn
- Django backend running (see [Backend Integration Guide](./BACKEND_INTEGRATION.md))
- Environment variables configured

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/extraordinary-yh/point-system-frontend.git
   cd point-system-frontend
   ```

2. **Install dependencies**
   ```bash
   npm install
   # or
   yarn install
   ```

3. **Configure environment variables**
   Create `.env.local` file:
   ```env
   # NextAuth Configuration
   NEXTAUTH_URL=http://localhost:3000
   NEXTAUTH_SECRET=your-secret-key-here-change-in-production
   
   # Backend API Configuration
   NEXT_PUBLIC_API_BASE_URL=http://localhost:8000/api
   ```

4. **Start the development server**
   ```bash
   npm run dev
   # or
   yarn dev
   ```

5. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

## 🔧 Development

### Project Structure

```
src/
├── app/                    # Next.js App Router
│   ├── api/               # API routes (NextAuth)
│   ├── dashboard/         # Dashboard page
│   ├── leaderboard/       # Leaderboard page
│   ├── rewards/           # Rewards marketplace page
│   ├── profile/           # User profile page
│   ├── onboarding/        # Onboarding flow page
│   ├── layout.tsx         # Root layout with providers
│   └── page.tsx           # Landing page
├── components/            # React components
│   ├── Auth/             # Authentication components
│   │   ├── AuthPage.tsx  # Main auth page
│   │   ├── LoginForm.tsx # Login form
│   │   ├── RegisterForm.tsx # Registration form
│   │   └── ReLoginPrompt.tsx # Re-login prompt
│   ├── Dashboard/        # Dashboard components
│   │   ├── Dashboard.tsx # Main dashboard
│   │   ├── StatCards.tsx # Points and stats cards
│   │   ├── ActivityGraph.tsx # Points progression chart
│   │   ├── UsageRadar.tsx # Engagement radar chart
│   │   ├── RecentTransactions.tsx # Activity feed
│   │   ├── TopBar.tsx    # Dashboard header
│   │   ├── Grid.tsx      # Dashboard layout grid
│   │   ├── ErrorBoundary.tsx # Error handling
│   │   └── SkeletonLoaders.tsx # Loading states
│   ├── Onboarding/       # Onboarding flow
│   │   ├── OnboardingFlow.tsx # Main flow controller
│   │   ├── DiscordLinking.tsx # Discord integration
│   │   ├── ConsentAgreement.tsx # Media consent
│   │   └── LinkedInFollow.tsx # LinkedIn integration
│   ├── Profile/          # Profile management
│   │   ├── ProfileForm.tsx # Profile editing
│   │   ├── PasswordChangeForm.tsx # Password management
│   │   └── DiscordStatus.tsx # Discord status display
│   ├── Sidebar/          # Navigation components
│   │   ├── Sidebar.tsx   # Main sidebar
│   │   ├── RouteSelect.tsx # Route selection
│   │   ├── Search.tsx    # Search functionality
│   │   ├── CommandMenu.tsx # Command palette
│   │   └── AccountToggle.tsx # Account dropdown
│   ├── AuthWrapper.tsx   # NextAuth wrapper
│   ├── DiscordLink.tsx   # Discord integration
│   └── PerformanceDebug.tsx # Performance monitoring
├── services/             # API service layer
│   └── api.ts           # Django backend integration
├── hooks/                # Custom React hooks
│   ├── useAuth.tsx      # Authentication hook
│   ├── useOnboardingCheck.tsx # Onboarding status
│   └── useSharedDashboardData.tsx # Dashboard data management
├── contexts/             # React contexts
│   └── SidebarContext.tsx # Sidebar state management
├── types/                # TypeScript definitions
│   └── next-auth.d.ts   # NextAuth type extensions
└── utils/                # Utility functions
    └── performanceProfiler.ts # Performance monitoring
```

### Key Components

#### Authentication & Onboarding
- **`AuthWrapper`** - NextAuth SessionProvider wrapper with error handling
- **`LoginForm`** - Secure user authentication with validation
- **`RegisterForm`** - User registration with role selection and validation
- **`OnboardingFlow`** - Multi-step onboarding with Discord and consent
- **`DiscordLinking`** - Real-time Discord account linking with verification
- **`ConsentAgreement`** - Media consent management with legal compliance

#### Dashboard & Analytics
- **`Dashboard`** - Main application interface with glassmorphism design
- **`StatCards`** - Real-time points, activities, and rewards display
- **`ActivityGraph`** - Interactive line chart showing points progression
- **`UsageRadar`** - Radar chart displaying engagement patterns
- **`RecentTransactions`** - Live activity feed with real-time updates
- **`TopBar`** - Dashboard header with user info and controls

#### Profile & Settings
- **`ProfileForm`** - Complete profile editing with university/major tracking
- **`PasswordChangeForm`** - Secure password management with validation
- **`DiscordStatus`** - Discord integration status and management

#### Navigation & UI
- **`Sidebar`** - Collapsible navigation with smooth animations
- **`CommandMenu`** - Quick command palette for navigation
- **`RouteSelect`** - Route selection with visual indicators
- **`Search`** - Global search functionality

#### Performance & Monitoring
- **`PerformanceDebug`** - Real-time performance monitoring component
- **`ErrorBoundary`** - Graceful error handling with recovery options
- **`SkeletonLoaders`** - Loading states for smooth user experience

## 🔐 Authentication Flow

1. **User Registration** - Creates account with role-based fields
2. **NextAuth Integration** - Calls Django backend for authentication
3. **Session Management** - Secure HTTP-only cookies with NextAuth
4. **API Integration** - All requests use Django JWT tokens from session

## 🌐 API Integration

The frontend communicates with a Django backend through:
- **User Management** - Registration, login, profile updates
- **Points System** - Activities, rewards, redemptions
- **Discord Integration** - Account linking and verification

See [BACKEND_INTEGRATION.md](./BACKEND_INTEGRATION.md) for detailed API documentation.

## 🚀 Deployment

### Docker Deployment

The application includes Docker support for easy deployment:

```bash
# Build Docker image
npm run docker:build

# Run Docker container
npm run docker:run
```

### Production Build

```bash
# Install dependencies
npm install

# Build for production
npm run build

# Start production server
npm start
```

### Environment Variables

#### Required Environment Variables
```env
# NextAuth Configuration
NEXTAUTH_URL=https://your-domain.com
NEXTAUTH_SECRET=your-super-secret-key-here

# Backend API Configuration
NEXT_PUBLIC_API_BASE_URL=https://your-backend-api.com/api
```

#### Optional Environment Variables
```env
# Development
NODE_ENV=production

# Performance Monitoring
ENABLE_PERFORMANCE_DEBUG=false

# Error Reporting
SENTRY_DSN=your-sentry-dsn
```

### Docker Configuration

The application includes a `Dockerfile` and `render.yaml` for deployment:

- **Dockerfile**: Multi-stage build for optimized production image
- **render.yaml**: Render.com deployment configuration
- **Docker Support**: Full containerization with port 3000 exposure

### Production Checklist

- [ ] Set all required environment variables
- [ ] Configure CORS settings for backend API
- [ ] Set up SSL certificates for HTTPS
- [ ] Configure domain and DNS settings
- [ ] Set up monitoring and logging
- [ ] Configure backup strategies
- [ ] Test all authentication flows
- [ ] Verify Discord integration
- [ ] Test performance under load

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 🏆 Technical Achievements

### Performance Optimization
- **Intelligent Caching**: Multi-layer caching system with automatic invalidation
- **Request Deduplication**: Prevents duplicate API calls during concurrent requests
- **Real-Time Data Sync**: Live updates without page refreshes
- **Performance Profiling**: Built-in performance monitoring with detailed metrics
- **Optimized Rendering**: React optimization with proper memoization and context usage

### Error Handling & Reliability
- **Error Boundaries**: Graceful error handling with user-friendly recovery options
- **Comprehensive Logging**: Detailed logging for debugging and monitoring
- **Fallback Systems**: Multiple fallback strategies for data loading
- **User Feedback**: Clear error messages and loading states
- **Recovery Mechanisms**: Automatic retry logic for failed requests

### User Experience
- **Glassmorphism Design**: Modern UI with backdrop blur and gradient effects
- **Smooth Animations**: Framer Motion integration for fluid transitions
- **Responsive Design**: Seamless experience across all device sizes
- **Loading States**: Skeleton loaders and progress indicators
- **Accessibility**: WCAG compliant design with proper ARIA labels

### Security & Authentication
- **JWT Token Management**: Secure token handling with automatic refresh
- **CSRF Protection**: Built-in CSRF protection through NextAuth
- **Role-Based Access**: Granular permissions for different user types
- **Session Management**: Secure session handling with HTTP-only cookies
- **Input Validation**: Comprehensive client and server-side validation

## 📚 Documentation

- [Backend Integration Guide](./BACKEND_INTEGRATION.md) - Complete Django backend setup
- [Student Portal Design](./Student%20Portal%20Design.md) - UI/UX specifications
- [NextAuth.js Documentation](https://next-auth.js.org/) - Authentication framework
- [Performance Optimization Guide](./PERFORMANCE_OPTIMIZATION_COMPLETE.md) - Performance best practices
- [Frontend Backend Integration](./FRONTEND_BACKEND_INTEGRATION_COMPLETE.md) - API integration details

## 🆘 Support

For support and questions:
- Check the [Backend Integration Guide](./BACKEND_INTEGRATION.md)
- Review the [Student Portal Design](./Student%20Portal%20Design.md)
- Open an issue on GitHub

## 🎯 Project Impact

This Propel2Excel Points System represents a comprehensive solution for student engagement and career development. The platform successfully addresses the need for gamified learning experiences while providing real value to students, companies, universities, and nonprofits.

### Key Benefits
- **Student Engagement**: Increased participation through gamification and rewards
- **Career Development**: Structured activities that build professional skills
- **Community Building**: Discord integration fosters peer connections
- **Data Insights**: Comprehensive analytics for all stakeholders
- **Scalability**: Built to handle growth from individual users to large institutions

### Target Users
- **Students**: Gamified career development with points and rewards
- **Companies**: Access to engaged, skilled student talent
- **Universities**: Enhanced student engagement and career outcomes
- **Nonprofits**: Community building and social impact measurement

## 📄 License

This project is part of the Propel2Excel initiative. See the main repository for licensing information.

---

**Built with ❤️ for the Propel2Excel community**

*This README serves as a comprehensive presentation of the Propel2Excel Points System - a full-stack student engagement platform that demonstrates advanced web development skills, modern architecture patterns, and real-world problem-solving capabilities.*
