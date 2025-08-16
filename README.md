# 🚀 Propel2Excel Points System Frontend

A modern Next.js frontend for the Propel2Excel Points System, featuring NextAuth.js authentication and seamless Django backend integration.

## ✨ Features

- **🔐 Modern Authentication** - NextAuth.js with secure session management
- **🎯 Points System** - Track student activities and reward redemptions
- **🎨 Beautiful UI** - Tailwind CSS with responsive design
- **🔗 Discord Integration** - Link Discord accounts for community features
- **👥 Role-Based Access** - Support for students, companies, and universities
- **📱 Responsive Design** - Works seamlessly on all devices

## 🏗️ Architecture

- **Frontend**: Next.js 14 with App Router
- **Authentication**: NextAuth.js (frontend wrapper around Django)
- **Styling**: Tailwind CSS with custom components
- **Backend**: Django REST API (separate repository)
- **State Management**: React Context + NextAuth sessions

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
│   ├── layout.tsx         # Root layout
│   └── page.tsx           # Home page
├── components/            # React components
│   ├── Auth/             # Authentication forms
│   ├── Dashboard/        # Dashboard components
│   ├── Sidebar/          # Navigation sidebar
│   └── DiscordLink.tsx   # Discord integration
├── services/             # API service layer
│   └── api.ts           # Django backend integration
├── types/                # TypeScript type definitions
│   └── next-auth.d.ts   # NextAuth type extensions
└── hooks/                # Custom React hooks
```

### Key Components

- **`AuthWrapper`** - NextAuth SessionProvider wrapper
- **`LoginForm`** - User authentication with NextAuth
- **`RegisterForm`** - User registration with role selection
- **`Dashboard`** - Main application interface
- **`DiscordLink`** - Discord account linking functionality

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

### Build for Production

```bash
npm run build
npm start
```

### Environment Variables

Ensure these are set in your production environment:
- `NEXTAUTH_URL` - Your production domain
- `NEXTAUTH_SECRET` - Strong secret key
- `NEXT_PUBLIC_API_BASE_URL` - Production backend URL

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📚 Documentation

- [Backend Integration Guide](./BACKEND_INTEGRATION.md) - Complete Django backend setup
- [Student Portal Design](./Student%20Portal%20Design.md) - UI/UX specifications
- [NextAuth.js Documentation](https://next-auth.js.org/) - Authentication framework

## 🆘 Support

For support and questions:
- Check the [Backend Integration Guide](./BACKEND_INTEGRATION.md)
- Review the [Student Portal Design](./Student%20Portal%20Design.md)
- Open an issue on GitHub

## 📄 License

This project is part of the Propel2Excel initiative. See the main repository for licensing information.

---

**Built with ❤️ for the Propel2Excel community**
