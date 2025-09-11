import NextAuth from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000/api';

const handler = NextAuth({
  providers: [
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        username: { label: 'Username', type: 'text' },
        password: { label: 'Password', type: 'password' }
      },
      async authorize(credentials) {
        if (!credentials?.username || !credentials?.password) {
          return null;
        }

        try {
          // NextAuth attempting login
          
          // Call your existing Django login endpoint
          const response = await fetch(`${API_BASE_URL}/users/login/`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              username: credentials.username,
              password: credentials.password,
            }),
          });

          // Django response received

          const data = await response.json();
          // Django response data processed

          if (response.ok && data.user && data.tokens) {
            // Return user data in NextAuth format
            return {
              id: data.user.id.toString(),
              username: data.user.username,
              email: data.user.email,
              role: data.user.role,
              total_points: data.user.total_points,
              discord_username: data.user.discord_username,
              discord_id: data.user.discord_id,
              discord_verified: data.user.discord_verified || false,
              university: data.user.university,
              major: data.user.major,
              graduation_year: data.user.graduation_year,
              company: data.user.company,
              is_suspended: data.user.is_suspended,
              suspension_reason: data.user.suspension_reason,
              created_at: data.user.created_at,
              updated_at: data.user.updated_at,
              // Store Django JWT tokens
              djangoAccessToken: data.tokens.access,
              djangoRefreshToken: data.tokens.refresh,
            };
          }

          // Handle specific error cases
          if (response.status === 401) {
            // Authentication failed: Invalid credentials
            throw new Error('Invalid username or password');
          } else if (response.status === 403) {
            // Authentication failed: Account suspended or restricted
            throw new Error('Account is suspended or restricted');
          } else {
            // Authentication failed
            throw new Error(data.error || data.detail || 'Authentication failed');
          }
        } catch (error) {
          // Login error
          // Re-throw the error so NextAuth can handle it properly
          throw error;
        }
      },
    }),
  ],
  session: {
    strategy: 'jwt',
  },
  callbacks: {
    async jwt({ token, user }) {
      // Store Django user data and tokens in JWT
      if (user) {
        const customUser = user as any; // Cast to access our custom properties
        token.djangoAccessToken = customUser.djangoAccessToken;
        token.djangoRefreshToken = customUser.djangoRefreshToken;
        token.userData = {
          id: parseInt(customUser.id),
          username: customUser.username || '',
          email: customUser.email || '',
          role: customUser.role || 'student',
          total_points: customUser.total_points || 0,
          discord_username: customUser.discord_username,
          discord_id: customUser.discord_id,
          discord_verified: customUser.discord_verified || false,
          university: customUser.university,
          major: customUser.major,
          graduation_year: customUser.graduation_year,
          company: customUser.company,
          is_suspended: customUser.is_suspended || false,
          suspension_reason: customUser.suspension_reason,
          created_at: customUser.created_at || '',
          updated_at: customUser.updated_at || '',
        } as any;
      }
      return token;
    },
    async session({ session, token }) {
      // Make Django tokens and user data available in session
      session.djangoAccessToken = token.djangoAccessToken as string;
      session.djangoRefreshToken = token.djangoRefreshToken as string;
      session.user = token.userData as any;
      return session;
    },
  },
  pages: {
    signIn: '/',
    error: '/',
  },
  secret: process.env.NEXTAUTH_SECRET,
});

export { handler as GET, handler as POST };
